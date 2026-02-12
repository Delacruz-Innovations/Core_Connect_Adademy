import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, FileText, Trash2,
    Play, ClipboardList, Save,
    CheckCircle2, Users, AlertCircle, Edit3, Loader2
} from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const AssignmentManagement = () => {
    const { id: moduleId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assignments');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [assignment, setAssignment] = useState({
        title: '',
        brief: '',
        submission_required: true,
        allowed_file_types: ['pdf', 'doc', 'docx'],
        is_final_artefact: false
    });
    const [moduleData, setModuleData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [moduleId]);

    const fetchData = async () => {
        try {
            const { data: module, error: modError } = await supabase
                .from('modules')
                .select('*, courses(title)')
                .eq('id', moduleId)
                .single();
            if (modError) throw modError;
            setModuleData(module);

            const { data: assign, error: assignError } = await supabase
                .from('assignments')
                .select('*')
                .eq('module_id', moduleId)
                .maybeSingle();

            if (assign) {
                setAssignment(assign);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                module_id: moduleId,
                title: assignment.title || 'Untitled Assignment',
                brief: assignment.brief || '',
                submission_required: assignment.submission_required ?? true,
                allowed_file_types: assignment.allowed_file_types || ['pdf', 'doc', 'docx'],
                is_final_artefact: assignment.is_final_artefact || false,
                updated_at: new Date().toISOString()
            };

            // If we have a user, track them, otherwise proceed anonymously
            if (user) {
                payload.created_by = user.id;
            }

            const { error } = await supabase
                .from('assignments')
                .upsert(payload, { onConflict: 'module_id' });

            if (error) throw error;
            alert('Assignment strategy deployed.');
        } catch (err) {
            console.error('Save error:', err);
            alert('Deployment failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('PROTOCOL OVERRIDE: Delete assignment and all student submissions?')) return;
        try {
            const { error } = await supabase.from('assignments').delete().eq('module_id', moduleId);
            if (error) throw error;
            setAssignment({ title: '', description: '', is_required: true });
            alert('Assignment purged.');
        } catch (err) {
            alert('Purge failed.');
        }
    };

    const tabs = [
        { id: 'videos', icon: Play, label: 'Video Lectures', path: `/admin/modules/${moduleId}/videos` },
        { id: 'resources', icon: FileText, label: 'Reading Material', path: `/admin/modules/${moduleId}/resources` },
        { id: 'assignments', icon: ClipboardList, label: 'Assignments', path: `/admin/modules/${moduleId}/assignments` }
    ];

    if (loading) return <BrandedLoader message="Syncing Assignment Engine..." />;

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
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">
                            Module Content: Week {moduleData?.week_number} • {moduleData?.courses?.title}
                        </span>
                        <h1 className="text-5xl font-black italic tracking-tighter">Assignments</h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Strategy'}
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
                                    value={assignment.title}
                                    onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                                    placeholder="Enter assignment Title"
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Brief / Instructions</label>
                                <textarea
                                    rows={8}
                                    value={assignment.brief}
                                    onChange={(e) => setAssignment({ ...assignment, brief: e.target.value })}
                                    placeholder="Explain the technical requirements..."
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Allowed File Types</label>
                                    <div className="flex gap-4">
                                        {['pdf', 'doc', 'docx'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    const types = assignment.allowed_file_types || [];
                                                    const next = types.includes(type) ? types.filter(t => t !== type) : [...types, type];
                                                    setAssignment({ ...assignment, allowed_file_types: next });
                                                }}
                                                className={`px-4 py-2 text-[10px] font-black uppercase border transition-all ${assignment.allowed_file_types?.includes(type) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="submission_required"
                                        checked={assignment.submission_required}
                                        onChange={(e) => setAssignment({ ...assignment, submission_required: e.target.checked })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label htmlFor="submission_required" className="text-xs font-black uppercase tracking-widest text-gray-900 cursor-pointer">
                                        Mandatory for Progression
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_final_artefact"
                                        checked={assignment.is_final_artefact}
                                        onChange={(e) => setAssignment({ ...assignment, is_final_artefact: e.target.checked })}
                                        className="w-5 h-5 accent-secondary"
                                    />
                                    <label htmlFor="is_final_artefact" className="text-xs font-black uppercase tracking-widest text-secondary cursor-pointer">
                                        Final Graduation Artefact
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 block">Submissions Status</h3>
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary font-black text-2xl mx-auto mb-6 border-4 border-white shadow-xl">
                            --
                        </div>
                        <p className="font-bold text-sm text-black mb-1">Total Submissions</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 italic">Ready for review</p>

                        <Link
                            to={`/admin/assignments/${moduleId}/submissions`}
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
                        <button
                            onClick={handleDelete}
                            className="mt-6 text-[10px] font-black uppercase tracking-widest underline hover:text-black"
                        >
                            Proceed to Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentManagement;
