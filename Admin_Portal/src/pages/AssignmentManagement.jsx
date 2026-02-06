import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Trash2,
    Play, ClipboardList, Save,
    CheckCircle2, Users, AlertCircle, Edit3
} from 'lucide-react';

const AssignmentManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assignments');

    const assignment = {
        title: "Stakeholder Matrix Analysis",
        description: "Prepare a complete stakeholder matrix for the provided case study XYZ. Identify at least 5 key stakeholders and categorize them by power and interest.",
        status: "Published",
        submissions: 42
    };

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
                        <h1 className="text-5xl font-black italic tracking-tighter">Assignments</h1>
                    </div>
                </div>
                <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <Save size={18} /> Save Update
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white border border-gray-100 shadow-sm p-10 space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 border-b border-gray-50 pb-6">
                            <Edit3 className="text-primary" /> Assignment Brief
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Task Title</label>
                                <input
                                    type="text"
                                    defaultValue={assignment.title}
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Brief / Instructions</label>
                                <textarea
                                    rows={8}
                                    defaultValue={assignment.description}
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 block">Submissions Status</h3>
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black text-2xl mx-auto mb-6 border-4 border-white shadow-xl">
                            {assignment.submissions}
                        </div>
                        <p className="font-bold text-sm text-black mb-1">Total Submissions</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 italic">Ready for review</p>

                        <Link
                            to={`/admin/assignments/${id}/submissions`}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20"
                        >
                            <Users size={16} /> Review Submissions
                        </Link>
                    </div>

                    <div className="bg-red-50 p-8 border border-red-100 text-red-600 italic">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} /> Deletion Warning
                        </h4>
                        <p className="text-[10px] font-bold leading-relaxed">
                            Removing this assignment will also delete all student submissions associated with it. This action is irreversible.
                        </p>
                        <button className="mt-6 text-[10px] font-black uppercase tracking-widest underline hover:text-black">
                            Proceed to Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentManagement;
