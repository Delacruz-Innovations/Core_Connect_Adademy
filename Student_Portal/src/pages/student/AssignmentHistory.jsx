import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    FileText, CheckCircle2, Clock, Filter,
    Search, ArrowUpRight, History, BookOpen,
    LayoutGrid, List, Award, AlertCircle,
    ChevronRight, Download, BarChart3, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Link } from 'react-router-dom';
import AssignmentDetailModal from '../../components/AssignmentDetailModal';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
        <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black italic tracking-tighter text-gray-900">{value}</span>
                {trend && <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5"><TrendingUp size={10} /> {trend}</span>}
            </div>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={20} className="text-white" />
        </div>
    </div>
);

const AssignmentCard = ({ assignment, onClick }) => {
    const isGraded = assignment.reviewed_status === 'reviewed';
    const isSubmitted = assignment.is_submitted;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 overflow-hidden flex flex-col"
        >
            {/* Status Indicator */}
            <div className="absolute top-6 right-6 z-10">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isGraded ? 'bg-green-50 text-green-600 border-green-100' :
                    isSubmitted ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                    {isGraded ? 'Graded' : isSubmitted ? 'Pending' : 'To Do'}
                </div>
            </div>

            <div className="p-8 space-y-6 flex-1">
                {/* Header */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block">
                        {assignment.module?.course?.title || assignment.lesson?.module?.course?.title || 'General Curriculum'}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-2 min-h-[3.5rem]">
                        {assignment.title}
                    </h3>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t border-gray-50 pt-6">
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-gray-300" />
                        <span className="truncate max-w-[150px]">
                            {assignment.parent_type === 'lesson' ? assignment.lesson?.title : assignment.module?.title}
                        </span>
                    </div>
                </div>

                {/* Score / Status Large */}
                <div className="py-4">
                    {isGraded ? (
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black italic tracking-tighter text-gray-900">{assignment.grade_score}</span>
                            <span className="text-lg font-black text-gray-200 italic">%</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={24} strokeWidth={1.5} />
                            <span className="text-sm font-bold uppercase tracking-widest">
                                {isSubmitted ? 'In Review' : 'Missing'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 mt-auto">
                {!isSubmitted ? (
                    <Link
                        to={`/student/assignments/${assignment.id}`}
                        className="w-full h-12 bg-black text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-black/5"
                    >
                        Begin <ArrowUpRight size={14} />
                    </Link>
                ) : (
                    <button
                        onClick={() => onClick(assignment)}
                        className="w-full h-12 bg-white border border-gray-100 text-gray-900 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:border-black transition-all shadow-sm"
                    >
                        View Critique <ChevronRight size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const AssignmentHistory = () => {
    const { notifySyncFailure, registerRetry } = useConnectivity();
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = () => fetchAssignments(controller.signal);

        fetchData();
        const unregister = registerRetry(fetchData);

        return () => {
            controller.abort();
            unregister();
        };
    }, [registerRetry]);

    const fetchAssignments = async (signal) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch User Enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user.id)
                .eq('status', 'active')
                .abortSignal(signal);

            const courseIds = (enrollments?.map(e => e.course_id) || []).filter(Boolean);
            if (courseIds.length === 0) {
                setAssignments([]);
                notifySyncFailure(false);
                return;
            }

            // 2. Fetch all assignments
            const { data: allAssignmentsData, error: assignError } = await supabase
                .from('assignments')
                .select(`
                    *,
                    module:module_id(id, title, course_id, course:course_id(title)),
                    lesson:lesson_id(id, title, module:module_id(course_id, course:course_id(title)))
                `)
                .abortSignal(signal);

            if (assignError) throw assignError;

            // Filter assignments that belong to the user's enrolled courses
            const filteredAll = allAssignmentsData.filter(a => {
                const courseId = a.module?.course_id || a.lesson?.module?.course_id || a.course_id;
                return courseIds.includes(courseId);
            });

            // 3. Fetch user submissions
            const { data: submissionsData } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .abortSignal(signal);

            // 4. Merge
            const merged = (filteredAll || []).map(assign => {
                const sub = submissionsData?.find(s => s.assignment_id === assign.id);

                // Debug log to trace data flow - helpful for "grade not showing" issues
                if (sub) {
                    console.log(`Assignment: ${assign.title}, Status: ${sub.reviewed_status}, Score: ${sub.grade_score}`);
                }

                return {
                    ...assign,
                    submission: sub || null,
                    is_submitted: !!sub,
                    reviewed_status: sub?.reviewed_status || 'pending',
                    grade_score: sub?.grade_score !== undefined ? sub.grade_score : null,
                    submitted_at: sub?.created_at || null
                };
            });

            setAssignments(merged);
            notifySyncFailure(false);
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error(err);
            notifySyncFailure(true);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = assignments.length;
        const pending = assignments.filter(a => a.is_submitted && a.reviewed_status === 'pending').length;
        const graded = assignments.filter(a => a.reviewed_status === 'reviewed');
        const avg = graded.length > 0 ? Math.round(graded.reduce((acc, curr) => acc + curr.grade_score, 0) / graded.length) : 0;

        return { total, pending, avg };
    }, [assignments]);

    const filteredAssignments = assignments.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'graded') return item.reviewed_status === 'reviewed';
        if (filter === 'pending') return item.is_submitted && item.reviewed_status === 'pending';
        if (filter === 'active') return !item.is_submitted;
        return true;
    });

    const openDetails = (assignment) => {
        setSelectedAssignment(assignment);
        setModalOpen(true);
    };

    if (loading) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10"></div>
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Scanning Archive...</div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Performance Node</span>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-gray-900">Assignments</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Track progress, submissions, and critical instructor feedback.</p>
                </div>

                {/* Filters */}
                <div className="flex p-1.5 bg-gray-100/50 backdrop-blur-md rounded-2xl border border-gray-200/50">
                    {[
                        { id: 'all', label: 'Overview' },
                        { id: 'active', label: 'To Do' },
                        { id: 'pending', label: 'Review' },
                        { id: 'graded', label: 'Graded' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === tab.id
                                ? 'bg-black text-white shadow-xl shadow-black/10'
                                : 'text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Artifacts" value={stats.total} icon={FileText} color="bg-gray-900" />
                <StatCard label="In Pipeline" value={stats.pending} icon={Clock} color="bg-primary" />
                <StatCard label="Aggregate Mastery" value={`${stats.avg}%`} icon={Award} color="bg-green-500" trend="+12% vs last week" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredAssignments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 bg-white border border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                <FileText size={40} strokeWidth={1} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 italic">No Registry Found</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-10">No assignments currently match your lifecycle filter.</p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredAssignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                onClick={openDetails}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                <div className="bg-gray-900 p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <AlertCircle size={120} className="text-white" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Academic Integrity</h4>
                        <p className="text-lg font-bold text-white italic leading-tight max-w-sm">All submissions are archived and reviewed for protocol standards. Late submissions require cohort lead approval.</p>
                    </div>
                </div>

                <div className="bg-primary p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:-rotate-12 transition-transform duration-700">
                        <TrendingUp size={120} className="text-white" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Level Up</h4>
                        <p className="text-lg font-bold text-white italic leading-tight max-w-sm">Consistent high scores in practical assignments unlock fast-track professional opportunities.</p>
                    </div>
                </div>
            </div>

            <AssignmentDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                assignment={selectedAssignment}
            />
        </div>
    );
};

export default AssignmentHistory;
