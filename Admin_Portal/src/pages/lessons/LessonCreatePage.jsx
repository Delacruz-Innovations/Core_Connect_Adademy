import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, UploadCloud, FileVideo, CheckCircle } from 'lucide-react';

export default function LessonCreatePage() {
    const { moduleId, lessonId } = useParams(); // lessonId exists if editing
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_path: '',
        duration_seconds: 0
    });

    const [videoFile, setVideoFile] = useState(null);

    // If Editing, fetch data
    useEffect(() => {
        if (lessonId) {
            setLoading(true);
            supabase.from('lessons').select('*').eq('id', lessonId).single()
                .then(({ data }) => {
                    if (data) setFormData(data);
                    setLoading(false);
                });
        }
    }, [lessonId]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // TODO: Client-side duration check could go here with a hidden video element
            setVideoFile(file);
        }
    };

    const uploadVideo = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `videos/${Date.now()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('lesson-videos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;
        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalPath = formData.video_path;

            // 1. Upload Video if new file selected
            if (videoFile) {
                setUploading(true);
                finalPath = await uploadVideo(videoFile);
                setUploading(false);
            }

            // 2. Save Lesson Record
            const payload = {
                title: formData.title,
                description: formData.description,
                video_path: finalPath,
                duration_seconds: formData.duration_seconds, // Should be auto-detected ideally
                updated_at: new Date().toISOString()
            };

            if (lessonId) {
                // Update
                await supabase.from('lessons').update(payload).eq('id', lessonId);
            } else {
                // Create
                const { data: authData } = await supabase.auth.getUser();
                const userId = authData?.user?.id || null;

                // Get next order index
                const { count } = await supabase.from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('module_id', moduleId);

                await supabase.from('lessons').insert({
                    ...payload,
                    module_id: moduleId,
                    created_by: userId,
                    order_index: (count || 0) + 1
                });
            }

            navigate(lessonId ? -1 : `/admin/modules/${moduleId}/lessons`);

        } catch (error) {
            alert('Error saving lesson: ' + error.message);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (loading && !uploading) return <div className="p-12 text-center animate-pulse">Loading editor...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {lessonId ? 'Edit Lesson' : 'Add New Lesson'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Lesson Title</label>
                    <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="e.g. Introduction to Figma"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Description</label>
                    <textarea
                        rows="3"
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="Brief summary of what this video covers..."
                    />
                </div>

                {/* Video Upload Section */}
                <div className="border-t border-gray-100 pt-6">
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-4">Video Source</label>

                    {/* Current Video Status */}
                    {formData.video_path && !videoFile && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                            <CheckCircle className="text-green-500" size={20} />
                            <div>
                                <p className="text-sm font-bold text-green-800">Video Uploaded</p>
                                <p className="text-xs text-green-600 font-mono truncate max-w-xs">{formData.video_path}</p>
                            </div>
                        </div>
                    )}

                    {/* File Input */}
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${videoFile ? 'border-green-400 bg-green-50/20' : 'border-gray-200 hover:border-black/30'}`}>
                        <input
                            type="file"
                            accept="video/*"
                            id="video-upload"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                            {uploading ? (
                                <div className="animate-pulse">
                                    <UploadCloud size={32} className="text-blue-500 mb-2" />
                                    <p className="font-bold text-blue-600">Uploading to Secure Storage...</p>
                                    <p className="text-xs text-blue-400">Please do not close this tab.</p>
                                </div>
                            ) : videoFile ? (
                                <>
                                    <FileVideo size={32} className="text-green-500 mb-2" />
                                    <p className="font-bold text-green-700">{videoFile.name}</p>
                                    <p className="text-xs text-green-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Ready to upload</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="text-gray-300 mb-2" />
                                    <p className="font-bold text-gray-500">Click to Select Video File</p>
                                    <p className="text-xs text-gray-400">MP4, MOV supported. Max 500MB recommended.</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Duration (Manual Override for now) */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Duration (Seconds)</label>
                    <input
                        type="number"
                        value={formData.duration_seconds}
                        onChange={e => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                        className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                    />
                    <span className="text-xs text-gray-400 ml-2">Override if auto-detect fails</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6">
                    <Link
                        to={-1}
                        className="flex-1 py-3 text-center rounded-lg border border-gray-200 text-gray-500 font-bold text-sm tracking-wide hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex-[2] py-3 rounded-lg bg-black text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? 'Uploading...' : <><Save size={16} /> Save Lesson</>}
                    </button>
                </div>

            </form>
        </div>
    );
}
