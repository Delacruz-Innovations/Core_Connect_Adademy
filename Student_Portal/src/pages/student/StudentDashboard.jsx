import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { supabase } from '../../lib/supabaseClient';
import { usePersistentQuery } from '../../hooks/usePersistentQuery';
import {
    Search, Edit, ChevronLeft, ChevronRight,
    BookOpen, FileText, CheckCircle2, Clock, PlayCircle
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import { Link } from 'react-router-dom'
// --- Sub-components for Layout ---

const GreetingHeader = ({ name }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Hello {name} 👋</h1>
            <p className="text-gray-500 mt-1">Ready to continue your learning journey?</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search is purely visual for now */}
            <div className="relative flex-1 md:w-80 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border border-gray-100 text-sm shadow-sm cursor-not-allowed opacity-70"
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
    // Calculate progress if available (using mock logic or real data if present)
    const totalLessons = course.lessonsCount || 0;
    // We don't have completed_lessons count in the query yet, so we'll show total lessons

    return (
        <div className={`p-6 rounded-2xl ${color} min-w-[280px] flex-1 transition-transform hover:scale-[1.02]`}>
            <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center mb-4 text-gray-900 backdrop-blur-sm">
                <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
            <p className="text-xs text-gray-600 mb-6 line-clamp-1">{course.category || 'Course'}</p>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-700">
                <div className="flex items-center gap-1.5 bg-white/30 px-2 py-1 rounded-md">
                    <BookOpen size={14} /> <span>{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/30 px-2 py-1 rounded-md">
                    <FileText size={14} /> <span>{course.assignmentsCount || 0} Assignments</span>
                </div>
            </div>
        </div>
    );
};

// --- Right Sidebar Components ---

const ProfileWidget = ({ user, profile }) => (
    <div className="text-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mx-auto bg-gray-100">
                <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border-2 border-white">
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">{currentMonth} {currentYear}</span>
            </div>

            <div className="grid grid-cols-7 gap-y-3 text-center">
                {days.map(d => <span key={d} className="text-xs text-gray-400 font-medium">{d}</span>)}

                {/* Offset for start of month */}
                {Array.from({ length: firstDayIndex }).map((_, i) => <span key={`empty-${i}`} />)}

                {dates.map(d => (
                    <div key={d} className="flex justify-center items-center">
                        <span className={`text-xs font-medium w-7 h-7 rounded-full flex items-center justify-center transition-all
                            ${d === currentDay ? 'bg-black text-white shadow-md' : 'text-gray-700'}`}>
                            {d}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
const TaskList = ({ assignments }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Tasks</h3>
        <div className="space-y-6">
            {assignments.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No pending tasks</p>
                    <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
                </div>
            )}
            {assignments.map((task, i) => (
                <div key={i} className="flex gap-4 items-start">
                    <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 border-gray-300`}>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{task.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {task.courses?.title || 'Assignment'}
                            </span>
                            {task.due_date && (
                                <span className="text-[10px] font-medium text-orange-500">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const CourseProgressBanner = ({ course, userName }) => {
    if (!course) return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 md:p-10 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {userName}! 👋</h1>
                <p className="text-gray-300 mb-6 max-w-lg text-sm md:text-base">You are not enrolled in any active courses yet. Browse our catalog to start your learning journey.</p>
                <Link to="/student/courses" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
                    Explore Courses
                </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={300} />
            </div>
        </div>
    );

    // Mock data for "Where he/she stopped"
    const currentLesson = {
        title: "Introduction to Stakeholder Analysis",
        module: "Module 2",
        duration: "15 min left"
    };
    const progress = 35;

    return (
        <div className="relative mb-10 group">
            {/* Main Banner Card */}
            <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl shadow-gray-900/20 relative">

                {/* Background Art - Abstract or Course Image */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-primary/80 z-0"></div>

                {/* Content Container */}
                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">

                    {/* Left: Text Info */}
                    <div className="flex-1 w-full text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm self-center md:self-start mx-auto md:mx-0">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-white">Resume Learning</span>
                        </div>

                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{course.title}</p>
                            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                {currentLesson.title}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 flex items-center justify-center md:justify-start gap-2">
                                <span>{currentLesson.module}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span>{currentLesson.duration}</span>
                            </p>
                        </div>

                        {/* Progress Bar Label */}
                        <div className="w-full max-w-sm mx-auto md:mx-0 pt-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                <span>Lesson Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Big Play Action */}
                    <div className="flex-shrink-0">
                        <Link
                            to={`/student/course/${course.id}`}
                            className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center group/play focus:outline-none"
                        >
                            {/* Pulse Effects */}
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute inset-0 bg-primary/40 rounded-full animate-pulse"></div>

                            {/* Button */}
                            <div className="relative w-full h-full bg-white rounded-full text-primary shadow-2xl flex items-center justify-center transform transition-transform group-hover/play:scale-110 active:scale-95">
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

        // Fetch Enrollments for Course Cards
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*, course:course_id(*, md:modules(*, lessons(id), assignments(id)))')
            .eq('student_id', user.id)
            .abortSignal(signal);

        // Fetch Assignments for To-Do
        // Assuming assignments table has a due_date column, ordering by it. 
        // If not, we'll order by created_at descending.
        const { data: assignments } = await supabase
            .from('assignments')
            .select('*, courses:course_id(title)')
            // .gte('due_date', new Date().toISOString()) // filtered for future if due_date exists
            .order('created_at', { ascending: false }) // Fallback since we might not have due_date column confirmed
            .limit(5)
            .abortSignal(signal);

        return { enrollments, assignments };
    }, [user]);

    const { data: dashboardData, loading: contentLoading, revalidate } = usePersistentQuery(
        'cc_student_dashboard_live',
        fetchDashboardData,
        [user?.id]
    );

    const enrolledCourses = dashboardData?.enrollments || [];
    const assignments = dashboardData?.assignments || [];

    // Transform Enrollments to Card Data
    const courseCards = enrolledCourses
        .filter(e => e.course)
        .map((e, index) => {
            const c = e.course;
            // Calculate counts
            const lessons = c.md?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
            const assigns = c.md?.reduce((acc, m) => acc + (m.assignments?.length || 0), 0) || 0;

            return {
                title: c.title,
                category: c.code || 'Course',
                lessonsCount: lessons,
                assignmentsCount: assigns,
                color: index % 3 === 0 ? 'bg-[#E6F0FF]' : index % 3 === 1 ? 'bg-[#FFF0E6]' : 'bg-[#E6F9F0]'
            };
        });

    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Column */}
                <div className="col-span-1 lg:col-span-8">
                    <GreetingHeader name={profile?.full_name?.split(' ')[0] || 'Student'} />

                    {/* Active Courses Section */}
                    {courseCards.length > 0 ? (
                        <div className="mb-10">
                            <SectionHeader title="My Active Courses" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courseCards.map((c, i) => (
                                    <CourseCard key={i} course={c} color={c.color} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center mb-10">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Active Courses</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-6">You haven't enrolled in any courses yet.</p>
                            <Link to="/student/courses" className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
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
