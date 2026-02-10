import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    MessageSquare, Search, Filter, CheckCircle2,
    Clock, AlertCircle, Trash2, Send, ExternalLink,
    ChevronDown, User, BookOpen, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionManagement() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, resolved
    const [searchQuery, setSearchQuery] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [stats, setStats] = useState({ pending: 0, resolved: 0, total: 0 });

    useEffect(() => {
        fetchQuestions();
    }, []);

    async function fetchQuestions() {
        setLoading(true);
        try {
            console.log("🚀 Syncing with Q&A Database...");
            const { data, error } = await supabase
                .from('lesson_questions')
                .select(`
                    *,
                    lesson:lessons(id, title),
                    student:profiles!student_id(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Core Connect API Error:', error);
                // Attempt a raw fetch to see if it's a join issue or an RLS issue
                const raw = await supabase.from('lesson_questions').select('count');
                console.log("🛠️ Presence Check (Raw total):", raw.count);
                throw error;
            }

            console.log("✅ Questions received:", data?.length);
            if (data?.length > 0) console.log("📦 Data Snapshot:", data[0]);

            setQuestions(data || []);

            const pending = (data || []).filter(q => !q.is_resolved).length;
            const resolved = (data || []).filter(q => q.is_resolved).length;
            setStats({ pending, resolved, total: (data || []).length });
        } catch (err) {
            console.error('Fatal Connectivity Error:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleResolve = async (id, resolveStatus) => {
        try {
            const { error } = await supabase
                .from('lesson_questions')
                .update({ is_resolved: resolveStatus })
                .eq('id', id);
            if (error) throw error;
            setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_resolved: resolveStatus } : q));
        } catch (err) {
            console.error('Resolution update failed:', err);
        }
    };

    const handleReply = async (id) => {
        if (!replyContent.trim()) return;
        try {
            const { error } = await supabase
                .from('lesson_questions')
                .update({
                    admin_response: replyContent,
                    is_resolved: true,
                    responded_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            setQuestions(prev => prev.map(q => q.id === id ? {
                ...q,
                admin_response: replyContent,
                is_resolved: true,
                responded_at: new Date().toISOString()
            } : q));
            setReplyingTo(null);
            setReplyContent('');
        } catch (err) {
            console.error('Reply failed:', err);
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'pending' && !q.is_resolved) ||
            (filterStatus === 'resolved' && q.is_resolved);
        const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3 block">Student Interaction</span>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">Q&A Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Response Rate</span>
                        <span className="text-xl font-black italic text-gray-900 leading-none">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                    </div>
                    <div className="h-10 w-px bg-gray-100" />
                    <button onClick={fetchQuestions} className="bg-white border border-gray-100 p-3 hover:text-primary transition-all shadow-sm">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Queries', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Resolved Tickets', value: stats.resolved, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Global Total', value: stats.total, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/5' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black italic">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH BY CONTENT OR STUDENT NAME..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {['all', 'pending', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Feed */}
            <div className="space-y-4 pb-20">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">Connecting to Q&A Sync...</span>
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => (
                        <motion.div
                            layout
                            key={q.id}
                            className={`group bg-white border border-gray-100 transition-all hover:shadow-2xl overflow-hidden ${!q.is_resolved ? 'border-l-4 border-l-orange-500' : ''}`}
                        >
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-tight text-gray-900 leading-none">{q.student?.full_name || 'Anonymous Student'}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(q.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Context Badges */}
                                        {q.lesson && (
                                            <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm">
                                                <BookOpen size={10} /> {q.lesson.title}
                                            </div>
                                        )}
                                        {q.module && (
                                            <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm border border-gray-100">
                                                <Layers size={10} /> {q.module.title}
                                            </div>
                                        )}
                                        <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border ${q.is_resolved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                            {q.is_resolved ? 'Resolved' : 'Pending Response'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-sm font-medium text-gray-600 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                        {q.content}
                                    </p>

                                    {q.admin_response && (
                                        <div className="bg-gray-50 p-6 border border-gray-100 ml-6 relative group/ans">
                                            <div className="absolute -top-3 -left-3 bg-primary text-white p-1 shadow-lg">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 block">Instruction Team Response:</span>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed">
                                                {q.admin_response}
                                            </p>
                                        </div>
                                    )}

                                    {replyingTo === q.id ? (
                                        <div className="ml-6 space-y-4 animate-in slide-in-from-left-2 duration-300">
                                            <textarea
                                                className="w-full bg-white border-2 border-primary/10 p-6 outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-gray-200"
                                                rows="4"
                                                placeholder="WRITE CLEAR, ACTIONABLE INSTRUCTIONAL RESPONSE..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleReply(q.id)}
                                                    className="bg-primary text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-primary/20"
                                                >
                                                    Post Response <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-3">
                                            {!q.is_resolved && (
                                                <button
                                                    onClick={() => setReplyingTo(q.id)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-6 py-3 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    Send Reply
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="p-20 text-center bg-white border border-gray-100 border-dashed">
                        <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">Awaiting Student Queries...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const RefreshCw = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);
