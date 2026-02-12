import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Upload, Play, Trash2,
    Settings, Eye, EyeOff, Clock,
    CheckCircle2, AlertCircle, FileText,
    ClipboardList, Loader2, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const VideoManagement = () => {
    const { id: moduleId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('videos');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchLessons();
    }, [moduleId]);

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setLessons(data || []);
        } catch (err) {
            console.error('Error fetching lessons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Create a placeholder lesson if needed, or ask for title
            // For now, let's just use the filename as title
            const title = file.name.split('.')[0];

            const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .insert({
                    module_id: moduleId,
                    title: title,
                    content_type: 'video',
                    order_index: lessons.length
                })
                .select()
                .single();

            if (lessonError) throw lessonError;

            // 2. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${moduleId}/${lesson.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('lesson-videos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Get signed URL to pass to Mux
            const { data: urlData, error: urlError } = await supabase.storage
                .from('lesson-videos')
                .createSignedUrl(filePath, 3600); // 1hr validity

            if (urlError) throw urlError;

            // 4. Trigger Mux Processing via Edge Function
            const { data: funcData, error: funcError } = await supabase.functions.invoke('process-video', {
                body: {
                    lesson_id: lesson.id,
                    video_url: urlData.signedUrl
                }
            });

            if (funcError) throw funcError;

            // 5. Update local state or re-fetch
            await fetchLessons();
            alert('Video uploaded and processing started!');
        } catch (err) {
            console.error('Upload failed:', err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const tabs = [
        { id: 'videos', icon: Play, label: 'Video Lectures', path: `/admin/modules/${moduleId}/videos` },
        { id: 'resources', icon: FileText, label: 'Reading Material', path: `/admin/modules/${moduleId}/resources` },
        { id: 'assignments', icon: ClipboardList, label: 'Assignments', path: `/admin/modules/${moduleId}/assignments` }
    ];

    if (loading && lessons.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
                className="hidden"
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Module Content Management</span>
                        <h1 className="text-5xl font-black italic tracking-tighter">Video Management</h1>
                    </div>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    {uploading ? 'Processing...' : 'Upload Video'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 gap-8">
                {tabs.map(t => (
                    <Link
                        key={t.id}
                        to={t.path}
                        className={`pb-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all relative ${activeTab === t.id ? 'text-primary' : 'text-gray-400 hover:text-black'
                            }`}
                    >
                        <t.icon size={14} /> {t.label}
                        {activeTab === t.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Video Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-4">
                    {lessons.filter(l => l.content_type === 'video').map((v) => (
                        <div key={v.id} className="bg-white border border-gray-100 shadow-sm p-6 flex items-center gap-6 group hover:border-primary transition-all">
                            <div className="w-20 aspect-video bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all relative overflow-hidden">
                                <Play size={24} className="relative z-10" />
                                {v.duration_seconds > 0 && (
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-bold text-white px-1">
                                        {Math.floor(v.duration_seconds / 60)}:{String(v.duration_seconds % 60).padStart(2, '0')}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-black text-sm mb-1">{v.title}</h4>
                                <div className="flex gap-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                        <Clock size={10} /> {v.duration_seconds > 0 ? `${Math.floor(v.duration_seconds / 60)}m` : 'No duration'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${v.mux_playback_id ? 'text-green-500' : 'text-orange-500'}`}>
                                        {v.mux_playback_id ? <CheckCircle2 size={10} /> : <Loader2 size={10} className="animate-spin" />}
                                        {v.mux_playback_id ? 'Ready for Streaming' : (v.mux_asset_id ? 'Processing by Mux' : 'Awaiting Upload')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all">
                                    <Settings size={14} />
                                </button>
                                <button className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {lessons.filter(l => l.content_type === 'video').length === 0 && (
                        <div className="border-2 border-dashed border-gray-100 p-12 text-center clickable" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center text-gray-200 mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add your first video to this module</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 block border-b border-gray-50 pb-4">Video Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Total Lessons</span>
                                <span className="font-black">{lessons.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Ready to Stream</span>
                                <span className="font-black text-green-500">{lessons.filter(l => l.mux_playback_id).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Processing</span>
                                <span className="font-black text-orange-500">{lessons.filter(l => !l.mux_playback_id && l.mux_asset_id).length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black p-8 text-white italic">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} className="text-secondary" /> Mux Integration
                        </h4>
                        <p className="text-[10px] font-bold text-white/60 leading-relaxed">
                            Videos are processed by Mux for adaptive bitrate streaming. Local storage is used as a temporary ingress point.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoManagement;
