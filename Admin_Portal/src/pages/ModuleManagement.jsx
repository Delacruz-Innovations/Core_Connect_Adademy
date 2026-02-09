import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Plus, GripVertical,
    Lock, Unlock, Video, FileText,
    ClipboardCheck, Edit3, Trash2
} from 'lucide-react';

const ModuleItem = ({ module, index }) => (
    <div className="bg-white border border-gray-100 shadow-sm group hover:border-primary transition-all p-8 flex items-center gap-8">
        <div className="cursor-grab active:cursor-grabbing text-gray-200 group-hover:text-primary transition-colors">
            <GripVertical size={24} />
        </div>
        <div className="w-16 h-16 bg-gray-50 flex flex-col items-center justify-center font-black text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
            <span className="text-[10px] uppercase tracking-tighter">Week</span>
            <span className="text-xl leading-none">{index + 1}</span>
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xl font-black italic tracking-tight">{module.title}</h3>
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${module.locked ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-500'
                    }`}>
                    {module.locked ? (
                        <span className="flex items-center gap-1"><Lock size={10} /> Locked</span>
                    ) : (
                        <span className="flex items-center gap-1"><Unlock size={10} /> Unlocked</span>
                    )}
                </span>
            </div>
            <div className="flex gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Video size={12} className="text-primary" /> {module.videoCount} Videos
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <FileText size={12} className="text-primary" /> {module.resourceCount} Resources
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <ClipboardCheck size={12} className="text-primary" /> {module.assignmentCount} Assignment
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <Link
                to={`/admin/modules/${module.id}/videos`}
                className="p-3 bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all flex flex-col items-center gap-1"
                title="Content"
            >
                <Edit3 size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest">Content</span>
            </Link>
            <button className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all flex flex-col items-center gap-1">
                <Trash2 size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest">Delete</span>
            </button>
        </div>
    </div>
);

const ModuleManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const modules = [
        { id: 201, title: "Introduction to Business Analysis", locked: false, videoCount: 3, resourceCount: 2, assignmentCount: 1 },
        { id: 202, title: "Requirements Gathering & Elicitation", locked: false, videoCount: 5, resourceCount: 4, assignmentCount: 1 },
        { id: 203, title: "Process Mapping & Documentation", locked: true, videoCount: 4, resourceCount: 1, assignmentCount: 1 },
        { id: 204, title: "Agile Methodologies & User Stories", locked: true, videoCount: 6, resourceCount: 3, assignmentCount: 1 }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Course Curriculum</span>
                        <h1 className="text-5xl font-black italic tracking-tighter text-ellipsis overflow-hidden whitespace-nowrap">
                            Business Analysis Mastery
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                        <Plus size={18} /> Append Module
                    </button>
                </div>
            </div>

            {/* Module List */}
            <div className="space-y-6">
                {modules.map((m, i) => (
                    <ModuleItem key={m.id} module={m} index={i} />
                ))}
            </div>

            <div className="p-10 border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Need to add more content?</p>
                <button className="bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest px-8 py-3 shadow-sm hover:border-primary transition-all">
                    Quick Add Next Week
                </button>
            </div>
        </div>
    );
};

export default ModuleManagement;
