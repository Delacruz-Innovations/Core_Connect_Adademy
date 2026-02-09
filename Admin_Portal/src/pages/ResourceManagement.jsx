import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Upload, FileText, Trash2,
    Play, ClipboardList, File, FileDown,
    MoreVertical, CheckCircle2, Loader2, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import DocumentManager from '../components/documents/DocumentManager';

const ResourceManagement = () => {
    const { id: moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModule();
    }, [moduleId]);

    const fetchModule = async () => {
        try {
            const { data, error } = await supabase
                .from('modules')
                .select('*, courses(title)')
                .eq('id', moduleId)
                .single();

            if (error) throw error;
            setModule(data);
        } catch (err) {
            console.error('Error fetching module:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'videos', icon: Play, label: 'Video Lectures', path: `/admin/modules/${moduleId}/videos` },
        { id: 'resources', icon: FileText, label: 'Reading Material', path: `/admin/modules/${moduleId}/resources` },
        { id: 'assignments', icon: ClipboardList, label: 'Assignments', path: `/admin/modules/${moduleId}/assignments` }
    ];

    if (loading) return <div className="p-20 flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Content Module...</span>
    </div>;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm rounded-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">
                            {module?.courses?.title} / Week {module?.week_number}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Resource Manager</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 gap-8 overflow-x-auto no-scrollbar">
                {tabs.map(t => (
                    <Link
                        key={t.id}
                        to={t.path}
                        className={`pb-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all relative shrink-0 ${t.id === 'resources' ? 'text-primary' : 'text-gray-400 hover:text-black'
                            }`}
                    >
                        <t.icon size={14} /> {t.label}
                        {t.id === 'resources' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Repository Base</span>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Module Resources</h2>
                            </div>
                            <Info size={20} className="text-gray-200" />
                        </div>
                        <DocumentManager parentType="module" parentId={moduleId} />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-black text-white p-10 shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <FileText size={18} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Reflection Matrix</h3>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic uppercase tracking-tight">
                                Resources attached to this module node will reflect across:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Module View Hub', desc: 'Main navigation landing' },
                                    { label: 'Global Resource Library', desc: 'Cross-course searchable index' },
                                    { label: 'Cohort Archive', desc: 'Secure student downloads' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 bg-primary mt-1 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                            <span className="text-[9px] font-bold text-gray-600 tracking-tight">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceManagement;
