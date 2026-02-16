import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { supabase } from '../../lib/supabaseClient';
import { usePersistentQuery } from '../../hooks/usePersistentQuery';
import {
    Search, Edit, ChevronLeft, ChevronRight, ArrowRight,
    BookOpen, FileText, CheckCircle2, Clock, PlayCircle
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import { Link } from 'react-router-dom'
// --- Sub-components for Layout ---

const GreetingHeader = ({ name }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Hello {name} 👋</h1>
            <p className="text-gray-500 mt-1">Ready to continue your learning journey?</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Search is purely visual for now */}
            <div className="relative flex-1 md:w-80 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-sm shadow-sm cursor-not-allowed opacity-70 rounded-none"
                />
            </div>
            <NotificationCenter />
        </div>
    </div>
);

const SectionHeader = ({ title }) => (
    <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
);

const CourseCard = ({ course, color }) => {
    const isCompleted = course.progress_percent === 100;

    return (
        <div className={`p-6 ${color} min-w-[280px] flex-1 transition-transform hover:scale-[1.02] relative group border-l-4 border-gray-900`}>
            <div className="w-10 h-10 bg-white/60 flex items-center justify-center mb-4 text-gray-900">
                <BookOpen size={20} />
            </div>

            <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 line-clamp-1">{course.course_title}</h3>
                <span className="text-[10px] font-black italic text-gray-900">{course.progress_percent}%</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 line-clamp-1">{course.course_code || 'Course'}</p>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/40 overflow-hidden mb-6">
                <div
                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-[#EAB308]' : 'bg-primary'}`}
                    style={{ width: `${course.progress_percent}%` }}
                />
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <div className="flex items-center gap-1.5 bg-white/40 px-2 py-1">
                    <BookOpen size={14} /> <span>{course.total_lessons} Lessons</span>
                </div>
                {course.last_accessed_at && (
                    <div className="flex items-center gap-1.5 bg-white/40 px-2 py-1">
                        <Clock size={14} /> <span>{new Date(course.last_accessed_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Right Sidebar Components ---

const ProfileWidget = ({ user, profile }) => (
    <div className="text-center mb-10 bg-white p-6 shadow-none border border-gray-200">
        <div className="relative inline-block mb-4">
            <div className="w-20 h-20 border-4 border-white shadow-none overflow-hidden mx-auto bg-gray-100">
                <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute bottom-0 right-0 bg-green-500 p-1 border-2 border-white">
                <CheckCircle2 size={10} className="text-white" />
            </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || 'Student'}</h2>
        <p className="text-xs text-gray-500 mt-1">Active Student</p>
    </div>
);

const CalendarWidget = () => {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const daysInMonth = getDaysInMonth(currentYear, today.getMonth());
    const firstDayIndex = new Date(currentYear, today.getMonth(), 1).getDay();

    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-white p-6 shadow-none border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">{currentMonth} {currentYear}</span>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center">
                {days.map((d, i) => <span key={`${d}-${i}`} className="text-xs text-gray-400 font-medium">{d}</span>)}

                {/* Offset for start of month */}
                {Array.from({ length: firstDayIndex }).map((_, i) => <span key={`empty-${i}`} />)}

                {dates.map(d => (
                    <div key={d} className="flex justify-center items-center">
                        <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center transition-all
                            ${d === currentDay ? 'bg-black text-white' : 'text-gray-700'}`}>
                            {d}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
const TaskList = ({ assignments }) => (
    <div className="bg-white p-6 shadow-none border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Upcoming Artifacts</h3>
        <div className="space-y-6">
            {assignments.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-400 text-sm italic">Archive cleared.</p>
                </div>
            )}
            {assignments.map((task) => (
                <Link key={task.id} to={`/student/assignments/${task.id}`} className="flex gap-2 items-start group">
                    <div className={`w-5 h-5 border-2 mt-0.5 flex items-center justify-center shrink-0 border-gray-200 group-hover:border-primary transition-colors`}>
                        <div className="w-1.5 h-1.5 bg-gray-100 group-hover:bg-primary transition-colors"></div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{task.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {task.module?.course?.title || task.lesson?.module?.course?.title || 'Assignment'}
                            </span>
                            {task.due_date && (
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                                    Term: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Link>
            ))}
        </div>
        <Link to="/student/assignments" className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between group">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Digital Registry</span>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
        </Link>
    </div>
);


const CourseProgressBanner = ({ course, userName }) => {
    if (!course) return (
        <div className="bg-gray-900 p-6 md:p-10 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {userName}! 👋</h1>
                <p className="text-gray-300 mb-6 max-w-lg text-sm md:text-base">You are not enrolled in any active courses yet. Browse our catalog to start your learning journey.</p>
                <Link to="/student/courses" className="inline-block bg-white text-gray-900 px-8 py-3 font-bold text-sm hover:bg-gray-100 transition-colors">
                    Explore Courses
                </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={300} />
            </div>
        </div>
    );

    const hasProgress = course.last_accessed_lesson_id && course.last_accessed_module_id;
    const progress = course.progress_percent || 0;

    return (
        <div className="relative mb-10 group">
            <div className="bg-gray-900 overflow-hidden relative">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={course.course_image_path || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                        className="w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-1000"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gray-900/90"></div>
                </div>

                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-2">
                    <div className="flex-1 w-full text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 backdrop-blur-sm self-center md:self-start mx-auto md:mx-0">
                            <div className="w-2 h-2 bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-white">
                                {progress === 100 ? 'Certified Expert' : progress > 0 ? 'Resume Learning' : 'Initialize Protocol'}
                            </span>
                        </div>

                        <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{course.course_title}</p>
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight italic uppercase tracking-tighter">
                                {course.last_accessed_lesson_title || "Ready to Start"}
                            </h2>
                            {course.last_accessed_module_title && (
                                <p className="text-gray-400 text-xs mt-2 flex items-center justify-center md:justify-start gap-2 font-bold uppercase tracking-widest">
                                    <span>{course.last_accessed_module_title}</span>
                                    {course.last_accessed_at && (
                                        <>
                                            <span className="w-1 h-1 bg-gray-600"></span>
                                            <span className="text-primary">Last Activity: {new Date(course.last_accessed_at).toLocaleDateString()}</span>
                                        </>
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="w-full max-w-sm mx-auto md:mx-0 pt-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                                <span>Course Integrity</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 overflow-hidden">
                                <div
                                    className={`h-full relative transition-all duration-1000 ${progress === 100 ? 'bg-[#EAB308]' : 'bg-primary'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <Link
                            to={hasProgress
                                ? `/student/course/${course.id}/module/${course.last_accessed_module_id}/lesson/${course.last_accessed_lesson_id}`
                                : `/student/course/${course.id}`
                            }
                            className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center group/play focus:outline-none"
                        >
                            <div className="relative w-full h-full bg-white text-primary flex items-center justify-center transform transition-transform group-hover/play:scale-110 active:scale-95 border-none">
                                <PlayCircle size={48} className="ml-1.5" fill="currentColor" strokeWidth={1.5} />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};


const StudentDashboard = () => {
    const { profile, user } = useAuth();
    const { setIsLoading: setGlobalLoading } = useLoading();

    const fetchDashboardData = useCallback(async (signal) => {
        if (!user) return null;

        // Use RPC for optimized progress analytics
        const { data: analytics, error: analyticsError } = await supabase
            .rpc('get_student_dashboard_progress', { p_student_id: user.id })
            .abortSignal(signal);

        if (analyticsError && analyticsError.message !== 'AbortError' && !analyticsError.message?.includes('aborted')) {
            console.error('Dashboard Analytics Error:', analyticsError);
        }

        // Fetch Assignments for To-Do
        const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
                *,
                module:module_id(id, title, course:course_id(title)),
                lesson:lesson_id(id, title, module:module_id(course:course_id(title)))
            `)
            .order('created_at', { ascending: false })
            .limit(5)
            .abortSignal(signal);

        if (assignmentsError && assignmentsError.message !== 'AbortError' && !assignmentsError.message?.includes('aborted')) {
            console.error('Dashboard Assignments Error:', assignmentsError);
        }

        return { analytics, assignments };
    }, [user]);

    const { data: dashboardData, loading: contentLoading, revalidate } = usePersistentQuery(
        'cc_student_dashboard_live',
        fetchDashboardData,
        [user?.id]
    );

    const enrollments = dashboardData?.analytics || [];
    const assignments = dashboardData?.assignments || [];

    // Map analytics data to visual cards
    const courseCards = enrollments.map((item, index) => ({
        ...item,
        color: index % 3 === 0 ? 'bg-[#E6F0FF]' : index % 3 === 1 ? 'bg-[#FFF0E6]' : 'bg-[#E6F9F0]'
    }));

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                {/* Main Column */}
                <div className="col-span-1 lg:col-span-8">
                    <GreetingHeader name={profile?.full_name?.split(' ')[0] || 'Student'} />

                    {/* Dynamic Resume Banner - Picks the most recently active course */}
                    <CourseProgressBanner course={courseCards[0]} userName={profile?.full_name?.split(' ')[0] || 'Student'} />

                    {/* Active Courses Section */}
                    {courseCards.length > 0 ? (
                        <div className="mb-10">
                            <SectionHeader title="My Core Learning Tracks" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courseCards.map((c) => (
                                    <CourseCard key={c.id} course={c} color={c.color} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 border border-gray-100 text-center mb-10">
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Active Courses</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-6">You haven't enrolled in any courses yet.</p>
                            <Link to="/student/courses" className="inline-block bg-black text-white px-6 py-2.5 text-sm font-bold hover:bg-gray-800 transition-colors">
                                Browse Courses
                            </Link>
                        </div>
                    )}

                    {/* Placeholder for future "Recent Activity" or "Progress" if data becomes available */}
                </div>

                {/* Right Sidebar Column */}
                <div className="col-span-1 lg:col-span-4 pl-0 lg:pl-4">
                    <ProfileWidget user={user} profile={profile} />
                    <CalendarWidget />
                    <TaskList assignments={assignments} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
