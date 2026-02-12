import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FileText, CheckCircle2, Clock, Filter, Search, ArrowUpRight, History, BookOpen } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Link } from 'react-router-dom';

const AssignmentHistory = () => {
    const { notifySyncFailure, registerRetry } = useConnectivity();
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

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

            // 2. Fetch all assignments from these courses
            const { data: allAssignmentsData, error: assignError } = await supabase
                .from('assignments')
                .select(`
                    *,
                    module:module_id(id, title, course_id, courses(title)),
                    lesson:lesson_id(id, title)
                `)
                .abortSignal(signal);

            if (assignError) throw assignError;

            // Filter assignments that belong to the user's enrolled courses
            const filteredAll = allAssignmentsData.filter(a => {
                if (a.parent_type === 'module') return courseIds.includes(a.module?.course_id);
                return courseIds.includes(a.module?.course_id);
            });

            // 3. Fetch user submissions
            const { data: submissionsData } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('user_id', user.id)
                .abortSignal(signal);

            // 4. Merge Data
            const merged = (filteredAll || []).map(assign => {
                const sub = submissionsData?.find(s => s.assignment_id === assign.id);
                return {
                    ...assign,
                    submission: sub || null,
                    is_submitted: !!sub,
                    reviewed_status: sub ? sub.reviewed_status : 'pending',
                    grade_score: sub ? sub.grade_score : null,
                    submitted_at: sub ? sub.created_at : null
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

    const filteredAssignments = assignments.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'graded') return item.reviewed_status === 'reviewed';
        if (filter === 'pending') return item.is_submitted && item.reviewed_status === 'pending';
        if (filter === 'active') return !item.is_submitted;
        return true;
    });

    if (loading) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Assignments...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto relative min-h-screen pb-20">
            {/* Watermark */}
            <div className="fixed right-0 bottom-0 opacity-[0.03] pointer-events-none z-0 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={600} />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500 mt-1">Track your progress and submissions</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'active', label: 'To Do' },
                        { id: 'pending', label: 'Submitted' },
                        { id: 'graded', label: 'Graded' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${filter === tab.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Assignment</th>
                                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Course Context</th>
                                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">No assignments found</p>
                                                <p className="text-xs text-gray-500 mt-1">Try changing the filter or check back later.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-bold text-sm text-gray-900 flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${assignment.is_submitted ? 'bg-gray-200' : 'bg-primary'}`}></div>
                                                {assignment.title}
                                            </div>
                                            <div className="pl-5 text-xs text-gray-400 mt-1">
                                                {assignment.parent_type === 'lesson'
                                                    ? `Unit: ${assignment.lesson?.title}`
                                                    : `Module: ${assignment.module?.title}`
                                                }
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {assignment.module?.courses?.title || 'General Course'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                {assignment.reviewed_status === 'reviewed' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full">
                                                        <CheckCircle2 size={12} /> {assignment.grade_score}% Graded
                                                    </span>
                                                ) : assignment.is_submitted ? (
                                                    <span className="inline-flex items-center gap-1.5 text-yellow-600 text-xs font-bold bg-yellow-50 px-2.5 py-1 rounded-full">
                                                        <Clock size={12} /> Under Review
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Pending
                                                    </span>
                                                )}
                                            </div>
                                            {assignment.is_submitted && (
                                                <div className="text-[10px] text-gray-400 mt-1 pl-1">
                                                    Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {!assignment.is_submitted && (
                                                <Link
                                                    to={`/student/assignments/${assignment.id}`}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-xs font-bold hover:bg-primary transition-all rounded-xl shadow-sm hover:shadow-md"
                                                >
                                                    Start Assignment <ArrowUpRight size={14} />
                                                </Link>
                                            )}
                                            {assignment.is_submitted && (
                                                <button disabled className="text-xs font-bold text-gray-400 cursor-not-allowed">
                                                    View Submission
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2">Grading Policy</h4>
                    <p className="text-sm text-blue-800/70">Assignments are usually graded within 72 hours. You'll receive a notification once your grade is ready.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
                    <p className="text-sm text-gray-500">If you're stuck on an assignment, check the AI Assistant or reach out to your instructor.</p>
                </div>
            </div>

        </div>
    );
};

export default AssignmentHistory;
