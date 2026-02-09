import React, { useState, useEffect } from 'react';
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
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [application, setApplication] = useState(null);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchInitialState = async () => {
        setLoading(true);
        try {
            // Fetch Enrollments with course modules
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('*, course:course_id(*, modules(*, lessons(id)))')
                .eq('student_id', user.id)
                .eq('status', 'active');

            if (enrollError) throw enrollError;

            // Fetch Progress to identify current/next module
            const { data: allProgress } = await supabase
                .from('module_progress')
                .select('*')
                .eq('user_id', user.id);

            // Fetch Lesson Progress for granular dashboard display
            const { data: lessonProgress } = await supabase
                .from('lesson_progress')
                .select('lesson_id, is_completed')
                .eq('user_id', user.id);

            // Fetch Application Status
            const { data: apps, error: appError } = await supabase
                .from('applications')
                .select('*, requested_course:courses!requested_course_id(title)')
                .eq('email', user.email)
                .order('created_at', { ascending: false })
                .limit(1);

            if (appError) throw appError;

            setApplication(apps?.[0] || null);

            // Fetch Assignments and Submissions
            const courseIds = (enrollments || []).map(e => e.course_id).filter(Boolean);
            if (courseIds.length > 0) {
                const { data: assignmentsData, error: assignError } = await supabase
                    .from('assignments')
                    .select('*, modules!inner(id, course_id, courses(title))')
                    .in('modules.course_id', courseIds);

                if (assignError) {
                    console.error('Assignment Fetch Error:', assignError);
                }

                const { data: submissionsData } = await supabase
                    .from('assignment_submissions')
                    .select('assignment_id')
                    .eq('user_id', user.id);

                const submittedIds = new Set(submissionsData?.map(s => s.assignment_id) || []);
                const pending = (assignmentsData || []).filter(a => !submittedIds.has(a.id));

                setUpcomingAssignments(pending.slice(0, 3));
                setAssignmentCount(pending.length);
            }

            const mappedCourses = (enrollments || []).map(enrollment => {
                const courseData = enrollment.course;
                if (courseData) {
                    const sortedModules = (courseData.modules || []).sort((a, b) => a.week_number - b.week_number);

                    // Identify next module
                    const nextModule = sortedModules.find(m => {
                        const prog = allProgress?.find(p => p.module_id === m.id);
                        return prog?.status !== 'completed';
                    }) || sortedModules[sortedModules.length - 1];

                    const nextModuleProgress = allProgress?.find(p => p.module_id === nextModule?.id);
                    const isNextLocked = nextModule?.status !== 'unlocked' &&
                        nextModule?.week_number !== 1 &&
                        nextModuleProgress?.status !== 'unlocked';

                    // Identify accessible items (Complexity-aware progress tracking)
                    const accessibleModules = sortedModules.filter(m => {
                        const prog = allProgress?.find(p => p.module_id === m.id);
                        return m.week_number === 1 ||
                            m.status === 'unlocked' ||
                            prog?.status === 'unlocked' ||
                            prog?.status === 'completed';
                    });

                    const accessibleLessons = accessibleModules.flatMap(m => m.lessons || []);

                    const completedModulesCount = accessibleModules.filter(m =>
                        allProgress?.find(p => p.module_id === m.id && p.status === 'completed')
                    ).length;

                    const completedLessonsCount = accessibleLessons.filter(l =>
                        lessonProgress?.some(lp => lp.lesson_id === l.id && lp.is_completed)
                    ).length;

                    const totalItems = accessibleModules.length + accessibleLessons.length;
                    const completedItems = completedModulesCount + completedLessonsCount;
                    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                    return {
                        id: courseData.id,
                        name: courseData.title || courseData.name,
                        code: courseData.code || 'CCA-CORE-01',
                        duration: courseData.duration || '12 Weeks',
                        enrollmentDate: enrollment.created_at,
                        paymentStatus: enrollment.payment_status,
                        progress: progressPercent,
                        lastActive: 'Recently',
                        image: courseData.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
                        nextModule: nextModule ? {
                            title: nextModule.title,
                            isLocked: isNextLocked,
                            week: nextModule.week_number
                        } : null
                    };
                }
                return null;
            }).filter(Boolean);

            setEnrolledCourses(mappedCourses);
        } catch (error) {
            console.error('Error fetching dashboard state:', error);
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        if (user) {
            fetchInitialState();
        }
    }, [user]);



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
                        onClick={fetchInitialState}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary flex items-center gap-2 transition-all p-2 rounded-sm hover:bg-gray-50"
                    >
                        <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
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
                                                        {course.nextModule && (
                                                            <div className={`flex items-center gap-2 px-2 py-0.5 rounded-sm border ${course.nextModule.isLocked ? 'bg-gray-50 border-gray-100' : 'bg-primary/5 border-primary/10'}`}>
                                                                {course.nextModule.isLocked ? (
                                                                    <Lock size={10} className="text-gray-300" />
                                                                ) : (
                                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                                                )}
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${course.nextModule.isLocked ? 'text-gray-400' : 'text-primary'}`}>
                                                                    Week {course.nextModule.week}: {course.nextModule.title}
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
