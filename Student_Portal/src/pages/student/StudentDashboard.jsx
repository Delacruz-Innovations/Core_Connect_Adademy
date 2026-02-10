import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
    Play, CheckCircle2, Clock, Calendar,
    MessageSquare, ArrowRight,
    Trophy, BookOpen, AlertCircle, TrendingUp,
    Zap, Download, Star, User, Loader2, RefreshCw,
    Activity, Shield, Target, Lock
} from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { usePersistentQuery } from '../../hooks/usePersistentQuery';

const StatCard = ({ icon: Icon, label, value, loading }) => (
    <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Icon size={24} />
            </div>
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        {loading ? (
            <div className="h-9 w-24 bg-gray-100 animate-pulse mt-1"></div>
        ) : (
            <h3 className="text-3xl font-black mt-1 uppercase tracking-tight text-gray-900">{value}</h3>
        )}
    </div>
);

const QuickAction = ({ icon: Icon, label, to, variant = "primary" }) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-[#0052a3]",
        secondary: "bg-white text-gray-900 border border-gray-100 hover:border-primary/30 hover:shadow-lg",
        alt: "bg-secondary text-white hover:bg-[#d65f15]"
    };

    return (
        <Link to={to} className={`p-8 flex flex-col items-center justify-center gap-4 transition-all group text-center shadow-sm ${variants[variant]}`}>
            <Icon size={28} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </Link>
    );
};

const StudentDashboard = () => {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const { setIsLoading: setGlobalLoading } = useLoading();

    // fetchDashboardData: The revalidation logic for SWR
    const fetchDashboardData = useCallback(async (signal) => {
        if (!user) return null;

        // 1. Fetch Enrollments with course data
        const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('*, course:course_id(*, md:modules(*, lessons(id), assignments(id)))')
            .eq('student_id', user?.id)
            .eq('status', 'active')
            .abortSignal(signal);

        if (enrollError) throw enrollError;

        // 2. Fetch All Progress in Parallel
        const [modProgRes, lessProgRes, appRes] = await Promise.all([
            supabase.from('module_progress').select('*').eq('user_id', user?.id).abortSignal(signal),
            supabase.from('lesson_progress').select('lesson_id, course_id, is_completed').eq('user_id', user?.id).abortSignal(signal),
            supabase.from('applications').select('*, requested_course:courses!requested_course_id(title)')
                .eq('email', user?.email).order('created_at', { ascending: false }).limit(1).abortSignal(signal)
        ]);

        const allP = modProgRes.data || [];
        const lessonP = lessProgRes.data || [];
        const app = appRes.data?.[0] || null;

        // 3. Fetch Assignments
        let subIds = new Set();
        let upcoming = [];
        let count = 0;

        const activeCourseIds = (enrollments || []).map(e => e.course_id).filter(Boolean);
        if (activeCourseIds.length > 0) {
            try {
                const { data: rawAssign } = await supabase
                    .from('assignments')
                    .select('*, courses:course_id(title), module:module_id(id, course_id)')
                    .abortSignal(signal);

                if (rawAssign) {
                    const filtered = rawAssign.filter(a => a.module && activeCourseIds.includes(a.module.course_id));
                    const { data: subs } = await supabase.from('assignment_submissions').select('assignment_id').eq('user_id', user?.id).abortSignal(signal);
                    subs?.forEach(s => subIds.add(s.assignment_id));
                    const pending = filtered.filter(a => !subIds.has(a.id));
                    upcoming = pending.slice(0, 3);
                    count = pending.length;
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.warn("Dashboard assignments error:", e);
            }
        }

        // 4. Map UI State 
        const courses = (enrollments || []).map(enrollment => {
            const courseData = enrollment.course;
            if (!courseData) return null;

            const sortedModules = (courseData.md || []).sort((a, b) => a.week_number - b.week_number);
            // 1. Find the first module encounter that is either incomplete or has pending assignment
            let indicator = null;
            let firstLockedModuleId = null;

            for (let i = 0; i < sortedModules.length; i++) {
                const m = sortedModules[i];
                const modAssignments = m.assignments || [];
                const pendingAssign = modAssignments.find(a => !subIds.has(a.id));

                const mProg = allP.find(p => p.module_id === m.id);
                const isCompleted = mProg?.status === 'completed';

                // Check if this module is locked by a PREVIOUS module's pending assignment
                const isLockedByPrereq = i > 0 && (() => {
                    const prevMod = sortedModules[i - 1];
                    const prevAssigns = prevMod.assignments || [];
                    return prevAssigns.some(a => !subIds.has(a.id));
                })();

                if (isLockedByPrereq && !firstLockedModuleId) {
                    firstLockedModuleId = m.id;
                }

                if (!indicator && (pendingAssign || !isCompleted)) {
                    indicator = {
                        week: m.week_number,
                        status: pendingAssign ? 'pending' : 'active',
                        id: m.id,
                        isLocked: isLockedByPrereq || (m.week_number !== 1 && mProg?.status !== 'unlocked' && mProg?.status !== 'completed')
                    };
                }
            }

            // 2. If no indicator (all done), show last week as submitted
            if (!indicator) {
                const modulesWithAssignments = [...sortedModules].reverse().filter(m => m.assignments?.length > 0);
                if (modulesWithAssignments.length > 0) {
                    const m = modulesWithAssignments[0];
                    indicator = {
                        week: m.week_number,
                        status: 'submitted',
                        id: m.id,
                        isLocked: false
                    };
                }
            }

            const totalLessons = sortedModules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
            const courseLessons = (lessonP || []).filter(lp => {
                return lp.course_id === courseData.id ||
                    sortedModules.some(m => m.lessons?.some(l => l.id === lp.lesson_id));
            });
            const completedCount = courseLessons.filter(lp => lp.is_completed).length;
            const progressValue = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return {
                id: courseData.id,
                title: courseData.title || courseData.name,
                category: courseData.program_name || 'Curriculum',
                progress: progressValue,
                lastActive: 'Recently',
                image: courseData.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
                indicator: indicator
            };
        }).filter(Boolean);

        return {
            enrolledCourses: courses,
            application: app,
            upcomingAssignments: upcoming,
            assignmentCount: count
        };
    }, [user?.id]);

    const { data: dashboardData, loading: contentLoading, revalidate } = usePersistentQuery(
        'cc_student_dashboard_data',
        fetchDashboardData,
        [user?.id]
    );

    const enrolledCourses = dashboardData?.enrolledCourses || [];
    const application = dashboardData?.application || null;
    const upcomingAssignments = dashboardData?.upcomingAssignments || [];
    const assignmentCount = dashboardData?.assignmentCount || 0;
    const loading = contentLoading && !dashboardData;

    const fetchInitialState = async () => {
        await revalidate();
    };

    const handleCoursePlay = async (courseId) => {
        setGlobalLoading(true);
        try {
            // 0. Check for granular "Last Left Off" lesson
            const { data: lastLessonRecord } = await supabase
                .from('lesson_progress')
                .select('lesson_id, module_id')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (lastLessonRecord) {
                console.log("📍 Resuming from last active lesson:", lastLessonRecord.lesson_id);
                navigate(`/student/course/${courseId}/module/${lastLessonRecord.module_id}/lesson/${lastLessonRecord.lesson_id}`);
                return;
            }

            // 1. Get current module progress for this specific course (fallback)
            const { data: currentProgress } = await supabase
                .from('module_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .order('completed_at', { ascending: false });

            // 2. Fetch Modules for sequencing
            const { data: modules } = await supabase
                .from('modules')
                .select('id, week_number')
                .eq('course_id', courseId)
                .order('week_number', { ascending: true });

            if (!modules || modules.length === 0) {
                navigate(`/student/course/${courseId}`);
                return;
            }

            // 3. Find the first module that isn't completed
            const targetModule = modules.find(m => {
                const p = currentProgress?.find(cp => cp.module_id === m.id);
                return p?.status !== 'completed';
            }) || modules[0];

            // 4. Fetch the first lesson of that module
            const { data: firstLesson } = await supabase
                .from('lessons')
                .select('id')
                .eq('module_id', targetModule.id)
                .order('order_index', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (firstLesson) {
                // Final Check: Is this lesson's module hard-locked?
                const courseRecord = enrolledCourses.find(c => c.id === courseId);
                if (courseRecord?.indicator?.isLocked && courseRecord.indicator.id === targetModule.id) {
                    console.warn("🚫 Target module is hard-locked by assignment prerequisite.");
                    navigate(`/student/course/${courseId}`);
                    return;
                }
                navigate(`/student/course/${courseId}/module/${targetModule.id}/lesson/${firstLesson.id}`);
            } else {
                navigate(`/student/course/${courseId}/module/${targetModule.id}`);
            }
        } catch (error) {
            console.error('Error in handleCoursePlay:', error);
            navigate(`/student/course/${courseId}`);
        } finally {
            // Global loading is managed by context on route change
            setTimeout(() => setGlobalLoading(false), 800);
        }
    };

    const handleManualRefresh = () => {
        revalidate();
    };



    if (loading && !enrolledCourses.length) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <img src="/logo.png" alt="Loading" className="w-8 h-8 opacity-50" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">System Sync</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 md:space-y-12 mx-auto min-h-screen">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Overview</span>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Student Dashboard
                    </h1>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <button
                        onClick={handleManualRefresh}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary flex items-center gap-2 transition-all p-2 rounded-sm hover:bg-gray-50"
                    >
                        <RefreshCw size={10} className={contentLoading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                    <div className="bg-green-50 text-green-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border border-green-100 flex items-center gap-2 rounded-sm">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        System Active
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Active Courses" value={`${enrolledCourses.length}`} loading={loading} />
                <StatCard icon={Activity} label="Learning Points" value="1,240" loading={loading} />
                <StatCard icon={Target} label="Assignments" value={assignmentCount.toString().padStart(2, '0')} loading={loading} />
                <StatCard icon={Shield} label="Current Level" value="Lvl 4" loading={loading} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left: Active Enrolments */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">My Courses</h2>
                        <Link to="/student/courses" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-black flex items-center gap-2 transition-all">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {enrolledCourses.length === 0 ? (
                            application ? (
                                <div className="bg-white border border-gray-100 p-10 text-center space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-yellow-50 border border-yellow-100 flex items-center justify-center mx-auto text-yellow-500">
                                        <Clock size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Application Pending</h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Your application for <span className="text-black font-bold">{application.requested_course?.title || 'Course'}</span> is under review.
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest">
                                            Status: Under Review
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-100 p-10 text-center space-y-6 shadow-sm">
                                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto text-primary">
                                        <BookOpen size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">No Courses Found</h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            You are not enrolled in any courses yet.
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <Link
                                            to="/student/apply"
                                            className="inline-block bg-primary text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                        >
                                            Browse Courses
                                        </Link>
                                    </div>
                                </div>
                            )
                        ) : (
                            enrolledCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="w-full md:w-48 h-32 relative overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                            <img src={course.image} alt={course.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </div>

                                        <div className="flex-1 w-full space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-4">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">{course.code}</span>
                                                    <h3 className="text-xl font-black uppercase leading-none tracking-tight text-gray-900 mb-2 truncate">{course.name}</h3>
                                                    <div className="flex flex-wrap gap-4">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <Clock size={12} /> {course.duration}
                                                        </span>
                                                        {course.indicator && (
                                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border ${course.indicator.isLocked
                                                                ? 'bg-gray-50 border-gray-100 text-gray-400'
                                                                : course.indicator.status === 'submitted'
                                                                    ? 'bg-green-50 border-green-100 text-green-600'
                                                                    : 'bg-red-50 border-red-100 text-red-600'
                                                                }`}>
                                                                {course.indicator.isLocked ? (
                                                                    <Lock size={10} className="text-gray-300" />
                                                                ) : course.indicator.status === 'submitted' ? (
                                                                    <CheckCircle2 size={10} className="text-green-500" />
                                                                ) : (
                                                                    <AlertCircle size={10} className="text-red-500 animate-pulse" />
                                                                )}
                                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                                    Week {course.indicator.week} Assignment: {course.indicator.status === 'submitted' ? 'Submitted' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleCoursePlay(course.id)}
                                                    className="w-10 h-10 bg-primary text-white flex items-center justify-center hover:bg-black transition-all shadow-lg shrink-0"
                                                >
                                                    <Play size={16} fill="currentColor" />
                                                </button>
                                            </div>

                                            <div className="space-y-2 pt-4 border-t border-gray-50">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                                                    <span className="text-[10px] font-black text-primary">{course.progress}% Complete</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-50 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${course.progress}%` }}
                                                        className="h-full bg-primary"
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Quick Access */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Quick Access</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction icon={MessageSquare} label="AI Help" to="/student/ai-assistant" variant="alt" />
                            <QuickAction icon={Download} label="Files" to="/student/resources" variant="secondary" />
                            <QuickAction icon={User} label="Profile" to="/student/profile" variant="secondary" />
                            <QuickAction icon={CheckCircle2} label="Tasks" to="/student/assignments" variant="primary" />
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <AlertCircle size={20} className="text-secondary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Upcoming Tasks</h3>
                        </div>
                        <div className="space-y-6">
                            {upcomingAssignments.length === 0 ? (
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-4">No pending tasks</p>
                            ) : (
                                upcomingAssignments.map((assignment) => (
                                    <div key={assignment.id} className="relative pl-4 border-l-2 border-gray-100 hover:border-primary transition-all group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Requirement</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-red-500">MANDATORY</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">{assignment.title}</p>
                                        <div className="flex items-center gap-2">
                                            <Clock size={10} className="text-gray-400" />
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Course: {assignment.courses?.title}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link to="/student/assignments" className="mt-8 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-primary hover:text-black transition-all pt-4 border-t border-gray-50">
                            View All Assignments <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-primary/5 p-8 border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap size={16} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Learning Tip</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            "You are most productive in the evenings. Consider scheduling your difficult tasks after 6 PM."
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default StudentDashboard;
