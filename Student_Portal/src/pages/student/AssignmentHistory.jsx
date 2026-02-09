import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FileText, CheckCircle2, Clock, ClipboardList, Filter, Search, ArrowUpRight, History, Activity, ShieldCheck } from 'lucide-react';

const AssignmentHistory = () => {
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch User Enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user.id)
                .eq('status', 'active');

            const courseIds = (enrollments?.map(e => e.course_id) || []).filter(Boolean);
            if (courseIds.length === 0) {
                setAssignments([]);
                return;
            }

            // 2. Fetch all assignments from these courses (Modules and Lessons)
            const { data: allAssignmentsData, error: assignError } = await supabase
                .from('assignments')
                .select(`
                    *,
                    module:module_id(id, title, course_id, courses(title)),
                    lesson:lesson_id(id, title)
                `);

            if (assignError) throw assignError;

            // Filter assignments that belong to the user's enrolled courses
            const filteredAll = allAssignmentsData.filter(a => {
                if (a.parent_type === 'module') return courseIds.includes(a.module?.course_id);
                // For lesson assignments, we need to ensure the lesson belongs to a module in an enrolled course
                // But since we selected module/lesson above, we can check.
                // Re-fetching with more depth or filtering here.
                return courseIds.includes(a.module?.course_id);
            });

            // 3. Fetch user submissions
            const { data: submissionsData } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('user_id', user.id);

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
        } catch (err) {
            console.error(err);
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
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 animate-pulse">Synchronizing Records...</p>
        </div>
    );

    return (
        <div className="space-y-8 md:space-y-12 mx-auto min-h-screen">

            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Assignments</span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Assignment <span className="text-primary">History</span>
                    </h1>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white border border-gray-100 p-2 flex gap-2 md:gap-4 overflow-x-auto no-scrollbar rounded-sm">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 md:px-8 py-3 md:py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-sm ${filter === 'all' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 md:px-8 py-3 md:py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-sm ${filter === 'active' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                >
                    To Do
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 md:px-8 py-3 md:py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                >
                    Submitted
                </button>
                <button
                    onClick={() => setFilter('graded')}
                    className={`px-4 md:px-8 py-3 md:py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-sm ${filter === 'graded' ? 'bg-green-600 text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                >
                    Graded
                </button>
            </div>

            {/* Assignments List */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="p-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Assignment Name</th>
                                <th className="p-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Course</th>
                                <th className="p-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Date Submitted</th>
                                <th className="p-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none text-right">Grade / Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <FileText size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Clear Slate</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No assignments found for this category.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((assignment) => (
                                    <tr key={assignment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-bold text-sm text-gray-900 flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${assignment.is_submitted ? 'bg-gray-200' : 'bg-primary animate-pulse'}`}></div>
                                                {assignment.title}
                                            </div>
                                            <div className="pl-4.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {assignment.parent_type === 'lesson'
                                                    ? `UNIT: ${assignment.lesson?.title}`
                                                    : `MODULE: ${assignment.module?.title}`
                                                }
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                {assignment.module?.courses?.title || (assignment.parent_type === 'lesson' ? 'Core Course' : 'Legacy Course')}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                                                {assignment.is_submitted ? (
                                                    <><History size={12} /> {new Date(assignment.submitted_at).toLocaleDateString()}</>
                                                ) : (
                                                    <span className="text-primary font-bold">READY TO SUBMIT</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {assignment.reviewed_status === 'reviewed' ? (
                                                <div className="inline-flex flex-col items-end">
                                                    <span className="text-lg font-black text-gray-900">{assignment.grade_score}%</span>
                                                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                                                        <CheckCircle2 size={10} /> Graded
                                                    </span>
                                                </div>
                                            ) : assignment.is_submitted ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                                                    <Clock size={10} /> Pending Review
                                                </span>
                                            ) : (
                                                <Link
                                                    to={`/student/assignments/${assignment.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-sm"
                                                >
                                                    Start Work <ArrowUpRight size={12} />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Grading Policy</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        Assignments are typically graded within 72 hours of submission. You will receive a notification once your grade is posted.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight size={14} className="text-primary" />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Need Help?</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        If you have questions about a grade or feedback, please contact your instructor or submit a specialized inquiry.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default AssignmentHistory;
