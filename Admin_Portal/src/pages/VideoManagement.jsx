import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Upload, Play, Trash2,
    Settings, Eye, EyeOff, Clock,
    CheckCircle2, AlertCircle, FileText,
    ClipboardList
} from 'lucide-react';

const VideoManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('videos');

    const videos = [
        { id: 301, title: "1.1 The Role of a Business Analyst", duration: "12:45", visibility: "Visible" },
        { id: 302, title: "1.2 Stakeholder Identification", duration: "25:30", visibility: "Visible" },
        { id: 303, title: "1.3 Understanding Business Value", duration: "18:15", visibility: "Hidden" }
    ];

    const tabs = [
        { id: 'videos', icon: Play, label: 'Video Lectures', path: `/admin/modules/${id}/videos` },
        { id: 'resources', icon: FileText, label: 'Reading Material', path: `/admin/modules/${id}/resources` },
        { id: 'assignments', icon: ClipboardList, label: 'Assignments', path: `/admin/modules/${id}/assignments` }
    ];

    return (
        <div className="space-y-12">
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
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Module Content: Week 1</span>
                        <h1 className="text-5xl font-black italic tracking-tighter">Video Management</h1>
                    </div>
                </div>
                <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <Upload size={18} /> Upload Video
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
                    {videos.map((v) => (
                        <div key={v.id} className="bg-white border border-gray-100 shadow-sm p-6 flex items-center gap-6 group hover:border-primary transition-all">
                            <div className="w-20 aspect-video bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all relative overflow-hidden">
                                <Play size={24} className="relative z-10" />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-bold text-white px-1">{v.duration}</div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-black text-sm mb-1">{v.title}</h4>
                                <div className="flex gap-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                        <Clock size={10} /> {v.duration}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${v.visibility === 'Visible' ? 'text-green-500' : 'text-orange-500'
                                        }`}>
                                        {v.visibility === 'Visible' ? <Eye size={10} /> : <EyeOff size={10} />} {v.visibility}
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

                    <div className="border-2 border-dashed border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 flex items-center justify-center text-gray-200 mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Drag files to queue more videos</p>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 block border-b border-gray-50 pb-4">Video Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Total Duration</span>
                                <span className="font-black">56:30</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Total Files</span>
                                <span className="font-black">03</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Storage Used</span>
                                <span className="font-black text-primary">1.2 GB</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black p-8 text-white italic">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} className="text-secondary" /> Authority Note
                        </h4>
                        <p className="text-[10px] font-bold text-white/60 leading-relaxed">
                            Video uploads are optimized for AWS S3 delivery. Minimum resolution: 1080p required.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoManagement;
