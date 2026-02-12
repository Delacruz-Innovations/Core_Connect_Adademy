import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, Download, CheckCircle2,
    Clock, User, FileText, ChevronRight,
    Filter, Search, Loader2
} from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const AssignmentSubmissions = () => {
    const { id: moduleId } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSubmissions();
    }, [moduleId]);

    const fetchSubmissions = async () => {
        try {
            // Find assignment for this module
            const { data: assignment } = await supabase
                .from('assignments')
                .select('id')
                .eq('id', moduleId) // moduleId is likely correct from the route structure in App.jsx
                .maybeSingle();

            if (!assignment) {
                // Try module_id search if id is actually moduleId
                const { data: assignByMod } = await supabase
                    .from('assignments')
                    .select('id')
                    .eq('module_id', moduleId)
                    .maybeSingle();

                if (!assignByMod) {
                    setSubmissions([]);
                    return;
                }
                var assignId = assignByMod.id;
            } else {
                var assignId = assignment.id;
            }

            const { data, error } = await supabase
                .from('assignment_submissions')
                .select(`
                    *,
                    profiles:user_id(full_name, email)
                `)
                .eq('assignment_id', assignId);

            if (error) throw error;
            setSubmissions(data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleReview = async (subId, currentStatus) => {
        const newStatus = currentStatus === 'reviewed' ? 'pending' : 'reviewed';

        // Optimistic UI Update
        const previousSubmissions = [...submissions];
        setSubmissions(submissions.map(s =>
            s.id === subId ? { ...s, reviewed_status: newStatus } : s
        ));

        try {
            const { error } = await supabase
                .from('assignment_submissions')
                .update({
                    reviewed_status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', subId);

            if (error) throw error;

            showAlert(
                `Submission marked as ${newStatus}.`,
                'Status Synchronized',
                newStatus === 'reviewed' ? 'success' : 'info'
            );
        } catch (err) {
            console.error('Review update failed:', err);
            // Rollback on error
            setSubmissions(previousSubmissions);
            showAlert('Failed to update status: ' + err.message, 'System Error', 'error');
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        if (filter === 'all') return true;
        return s.reviewed_status === filter;
    });

    if (loading) return <BrandedLoader message="Scanning Submissions..." />;

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
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Submission Review Board</span>
                        <h1 className="text-5xl font-black italic tracking-tighter">Submissions</h1>
                    </div>
                </div>
                <div className="flex bg-white border border-gray-100 p-2 shadow-sm">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-black'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-black'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('reviewed')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'reviewed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-black'}`}
                    >
                        Reviewed
                    </button>
                </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Information</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center uppercase font-black text-gray-300 tracking-widest">No submissions detected in this filter</td>
                            </tr>
                        ) : filteredSubmissions.map((sub) => (
                            <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                                            {sub.profiles?.full_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black text-sm">{sub.profiles?.full_name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{sub.profiles?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-black">{new Date(sub.created_at).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(sub.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button
                                        onClick={async () => {
                                            const { data, error } = await supabase.storage.from('assignment-submissions').download(sub.file_path);
                                            if (error) {
                                                alert('Download error: ' + error.message);
                                                return;
                                            }
                                            const url = URL.createObjectURL(data);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = sub.file_path.split('/').pop();
                                            link.click();
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                                    >
                                        <FileText size={14} /> Download Asset
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <button
                                        onClick={() => handleToggleReview(sub.id, sub.reviewed_status)}
                                        className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 border transition-all hover:scale-105 active:scale-95 ${sub.reviewed_status === 'reviewed' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                                            }`}
                                    >
                                        {sub.reviewed_status === 'reviewed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {sub.reviewed_status === 'reviewed' ? 'Reviewed' : 'Pending'}
                                    </button>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        to={`/admin/submissions/${sub.id}/grade`}
                                        className="bg-primary/5 text-primary px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 inline-flex items-center gap-2"
                                    >
                                        Critique & Grade <ChevronRight size={12} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentSubmissions;
