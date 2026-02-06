import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Upload, FileText, Trash2,
    Play, ClipboardList, File, FileDown,
    MoreVertical, CheckCircle2
} from 'lucide-react';

const ResourceManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('resources');

    const resources = [
        { id: 401, title: "Business Analysis Framework.pdf", type: "PDF", size: "2.4 MB" },
        { id: 402, title: "Week 1 - Lecture Slides.pptx", type: "PPTX", size: "15.8 MB" },
        { id: 403, title: "Stakeholder Matrix Template.xlsx", type: "XLSX", size: "1.1 MB" }
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
                        <h1 className="text-5xl font-black italic tracking-tighter">Resources</h1>
                    </div>
                </div>
                <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <Upload size={18} /> Upload Resource
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

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {resources.map((r) => (
                    <div key={r.id} className="bg-white border border-gray-100 shadow-sm p-8 group hover:border-primary transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <File size={28} />
                            </div>
                            <button className="text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h4 className="font-bold text-black text-sm mb-2 group-hover:text-primary transition-colors truncate">{r.title}</h4>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>{r.type} File</span>
                            <span className="bg-gray-50 px-2 py-0.5">{r.size}</span>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white py-3 transition-all">
                                <FileDown size={14} /> Download
                            </button>
                        </div>
                    </div>
                ))}

                <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center text-primary mb-4 shadow-sm">
                        <PlusCircle size={24} icon={Upload} />
                        <Upload size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Drop new materials here</p>
                </div>
            </div>
        </div>
    );
};

const PlusCircle = ({ icon: Icon }) => <Icon size={24} />

export default ResourceManagement;
