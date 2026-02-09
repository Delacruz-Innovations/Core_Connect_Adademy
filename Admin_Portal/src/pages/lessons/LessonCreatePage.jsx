import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../context/ModalContext';
import {
    ArrowLeft, Save, UploadCloud, FileVideo,
    CheckCircle, AlertCircle, Info, Clapperboard, FileText
} from 'lucide-react';
import BrandedLoader from '../../components/BrandedLoader';
import DocumentManager from '../../components/documents/DocumentManager';
import AssignmentManager from '../../components/assignments/AssignmentManager';
import { ClipboardList } from 'lucide-react';

export default function LessonCreatePage() {
    const { moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_path: '',
        duration_seconds: 0
    });

    const [videoFile, setVideoFile] = useState(null);

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

    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > MAX_FILE_SIZE) {
                showAlert('This video is too large (' + (file.size / (1024 * 1024)).toFixed(1) + 'MB). Please compress it to under 500MB.', 'File Too Large', 'error');
                e.target.value = ''; // Reset input
                return;
            }

            setVideoFile(file);
        }
    };

    const uploadVideo = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `videos/${Date.now()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('lesson-videos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;
        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalPath = formData.video_path;

            if (videoFile) {
                setUploading(true);
                setUploadProgress(10); // Simulated start
                finalPath = await uploadVideo(videoFile);
                setUploadProgress(100);
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                video_path: finalPath,
                duration_seconds: formData.duration_seconds,
                updated_at: new Date().toISOString()
            };

            if (lessonId) {
                const { error } = await supabase.from('lessons').update(payload).eq('id', lessonId);
                if (error) throw error;
            } else {
                const { data: authData } = await supabase.auth.getUser();
                const userId = authData?.user?.id || null;

                const { count } = await supabase.from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('module_id', moduleId);

                const { error } = await supabase.from('lessons').insert({
                    ...payload,
                    module_id: moduleId,
                    created_by: userId,
                    order_index: (count || 0) + 1
                });
                if (error) throw error;
            }

            navigate(lessonId ? -1 : `/admin/modules/${moduleId}/lessons`);

        } catch (error) {
            console.error('Save Error:', error);
            await showAlert('Security/Storage Error: ' + error.message, 'Save Failed', 'error');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (loading && !uploading) return <BrandedLoader message="Initializing Content Studio..." />;

    return (
        <div className="mx-auto py-12 px-4 max-w-7xl">
            <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Clapperboard size={28} className="text-primary" /> Lesson Studio
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">Authoring cryptographic content blocks.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content Area */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Identity & Nomenclature</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-0 py-4 text-3xl font-black border-b-2 border-gray-50 focus:border-black focus:outline-none placeholder-gray-200 transition-colors"
                                placeholder="Enter Lesson Title..."
                            />
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Contextual Description</label>
                            <textarea
                                rows="6"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-black focus:bg-white resize-none text-base font-medium text-gray-600 leading-relaxed"
                                placeholder="Explain the pedagogical objectives of this lesson..."
                            />
                        </div>

                        {/* Video Vault Section */}
                        <div className="pt-10 border-t border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Media Vault</label>
                                {formData.video_path && (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-widest">
                                        <CheckCircle size={10} /> Media Optimized
                                    </span>
                                )}
                            </div>

                            <div className={`relative border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all ${videoFile ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-black/20 hover:bg-gray-50'}`}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    id="video-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center gap-6">
                                    {uploading ? (
                                        <div className="space-y-6 w-full max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                                                <UploadCloud size={32} className="text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-black text-xs uppercase tracking-widest">Encrypting Media Stream...</p>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-black transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : videoFile ? (
                                        <>
                                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
                                                <FileVideo size={32} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-green-700 uppercase tracking-tight line-clamp-1 mb-1">{videoFile.name}</p>
                                                <p className="text-[10px] font-bold text-green-500/60 uppercase tracking-widest">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • BUFFERED</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2 group-hover:scale-110 transition-transform">
                                                <UploadCloud size={32} className="text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">Deposit Video Content</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mt-2 italic">Authorized: MP4, MOV (500MB Limit)</p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Sidebar Controls & Resources */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl sticky top-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-10 border-b border-gray-800 pb-2">Governance Protocol</h3>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 italic">Estimated Runtime</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={formData.duration_seconds}
                                        onChange={e => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })}
                                        className="w-32 px-6 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-base text-primary"
                                    />
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Seconds</span>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-800 flex flex-col gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || uploading}
                                    className="w-full py-5 rounded-2xl bg-primary text-black font-black text-[11px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    {uploading ? 'Processing Cipher...' : lessonId ? 'Execute Update' : 'Commit Lesson'}
                                </button>
                                <Link
                                    to={-1}
                                    className="w-full py-5 text-center rounded-2xl border border-gray-800 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Abort Session
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <FileText size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Lesson Resources</h3>
                        </div>
                        <DocumentManager parentType="lesson" parentId={lessonId} />
                        <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex gap-3">
                            <Info size={16} className="text-gray-300 shrink-0" />
                            <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic uppercase tracking-tighter">
                                Reflection: These documents will manifest inside the lesson player next to the video stream.
                            </p>
                        </div>
                    </div>

                    {/* Lesson Assignment */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 font-primary">
                            <div className="p-2 bg-black text-white rounded-lg shadow-black/10 shadow-lg">
                                <ClipboardList size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Lesson Assignment</h3>
                        </div>
                        <AssignmentManager parentType="lesson" parentId={lessonId} />
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
