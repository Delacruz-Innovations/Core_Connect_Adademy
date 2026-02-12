import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    ClipboardList, CheckCircle2,
    Clock, Search, Filter,
    Eye, FileText, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandedLoader from '../components/BrandedLoader';

const AssignmentReviewBoard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const { data, error } = await supabase
                .from('assignment_submissions')
                .select(`
                    *,
                    profiles:user_id(full_name, email),
                    assignment:assignment_id(
                        title,
                        parent_type,
                        module:module_id(
                            title,
                            week_number,
                            course:course_id(title)
                        ),
                        lesson:lesson_id(title)
                    )
                `)
                .order('created_at', { ascending: false });

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
        } catch (err) {
            console.error('Toggle error:', err);
            // Rollback on error
            setSubmissions(previousSubmissions);
            alert('Failed to update review status');
        }
    };

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.reviewed_status === 'pending').length,
        reviewed: submissions.filter(s => s.reviewed_status === 'reviewed').length
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesFilter = filter === 'all' || s.reviewed_status === filter;
        const searchStr = `${s.profiles?.full_name} ${s.assignment?.title} ${s.assignment?.module?.course?.title} ${s.assignment?.lesson?.title}`.toLowerCase();
        const matchesSearch = searchStr.includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <BrandedLoader message="Syncing Submissions..." />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black text-white">
                            <ClipboardList size={20} />
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Assignment Review</h1>
                    </div>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest italic">Centralized Submission Management Portfolio</p>
                </div>

                <div className="flex gap-4">
                    {[
                        { label: 'Pending', count: stats.pending, key: 'pending' },
                        { label: 'Reviewed', count: stats.reviewed, key: 'reviewed' },
                        { label: 'Total', count: stats.total, key: 'all' }
                    ].map((stat) => (
                        <button
                            key={stat.key}
                            onClick={() => setFilter(stat.key)}
                            className={`px-6 py-4 border-2 transition-all text-left min-w-[140px] group ${filter === stat.key ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.count}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY STUDENT, COURSE OR ASSIGNMENT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 font-black text-xs uppercase tracking-widest outline-none focus:border-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white border-2 border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student & Course</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignment Module</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center uppercase font-black text-gray-300 tracking-[0.2em]">No submissions found</td>
                            </tr>
                        ) : filteredSubmissions.map((sub) => (
                            <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center font-black text-sm">
                                            {sub.profiles?.full_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm leading-tight">{sub.profiles?.full_name}</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                                                {sub.assignment?.module?.course?.title}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">{sub.assignment?.title}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                                            {sub.assignment?.parent_type === 'lesson'
                                                ? `Unit: ${sub.assignment.lesson?.title}`
                                                : `Week ${sub.assignment?.module?.week_number} • ${sub.assignment?.module?.title}`
                                            }
                                        </p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">{new Date(sub.created_at).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {new Date(sub.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button
                                        onClick={() => handleToggleReview(sub.id, sub.reviewed_status)}
                                        className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border transition-all hover:scale-105 active:scale-95 ${sub.reviewed_status === 'reviewed'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}
                                    >
                                        {sub.reviewed_status === 'reviewed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {sub.reviewed_status}
                                    </button>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        to={`/admin/submissions/${sub.id}/grade`}
                                        className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-black/10"
                                    >
                                        Review <Eye size={12} />
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

export default AssignmentReviewBoard;
