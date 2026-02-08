import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { DEMO_COURSES, getCourseById } from '../../utils/courses';
import {
    Play, CheckCircle2, Clock, Calendar,
    MessageSquare, ArrowRight, ChevronRight,
    Trophy, BookOpen, AlertCircle, TrendingUp,
    Zap, Download, Star, User, Loader2
} from 'lucide-react';
import { useFadeInOnScroll, useStaggerOnScroll } from '../../hooks/useScrollAnimations';

const StatCard = ({ icon: Icon, label, value, trend, color = "primary" }) => (
    <div className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 bg-gray-50 text-${color}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <span className="text-[9px] font-black text-green-500 bg-green-50 px-2 py-1 flex items-center gap-1">
                    <TrendingUp size={10} /> {trend}
                </span>
            )}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black italic uppercase tracking-tighter">{value}</p>
    </div>
);

const StudentDashboard = () => {
    const { profile, user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const headerRef = useFadeInOnScroll('up', 0.6);
    const statsRef = useStaggerOnScroll(0.1);
    const coursesRef = useFadeInOnScroll('up', 0.8, 0.2);
    const sidebarRef = useFadeInOnScroll('left', 0.8, 0.3);

    useEffect(() => {
        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('*, course:course_id(*)')
                .eq('student_id', user.id)
                .eq('status', 'active');

            if (error) throw error;

            // Map enrollment data to display format
            const mappedCourses = data.reduce((acc, enrollment) => {
                // 1. Check for Direct Foreign Key Relation (New Architecture)
                if (enrollment.course) {
                    acc.push({
                        id: enrollment.course.id,
                        name: enrollment.course.title || enrollment.course.name, // Handle schema variations
                        code: enrollment.course.code || 'CCA-001',
                        duration: enrollment.course.duration || '12 Weeks',
                        enrollmentDate: enrollment.created_at,
                        paymentStatus: enrollment.payment_status,
                        progress: enrollment.progress || 0, // Use stored progress if available
                        lastActive: 'Recently',
                        nextLesson: 'Start Learning',
                        image: enrollment.course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
                    });
                }
                // 2. Fallback: Legacy Array of Strings (Old Architecture)
                else if (enrollment.courses && Array.isArray(enrollment.courses)) {
                    enrollment.courses.forEach(courseId => {
                        const courseInfo = getCourseById(courseId);
                        if (courseInfo) {
                            acc.push({
                                ...courseInfo,
                                enrollmentDate: enrollment.created_at,
                                paymentStatus: enrollment.payment_status,
                                progress: Math.floor(Math.random() * 40) + 10,
                                lastActive: 'Recently',
                                nextLesson: 'Introduction to Module 1',
                                image: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
                            });
                        }
                    });
                }
                return acc;
            }, []);

            setEnrolledCourses(mappedCourses);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const upcomingDeadlines = [
        { id: 1, title: 'Module 1: Orientation Quiz', date: 'Tomorrow, 11:59 PM', priority: 'high' },
        { id: 2, title: 'Stakeholder Case Study', date: 'Next Friday, 12:00 PM', priority: 'medium' }
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">Syncing your learning path...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24">
            {/* Header / Hero Section */}
            <div ref={headerRef} className="relative overflow-hidden bg-black text-white p-8 md:p-12 lg:p-16 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                    <Zap size={400} className="text-primary rotate-12 -translate-y-24 translate-x-24" />
                </div>

                <div className="relative z-10 max-w-2xl space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest border border-primary/30">
                        <Star size={12} fill="currentColor" /> Premium Track Student
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4 text-white">
                            Welcome back, <br className="hidden lg:block" /> {profile?.full_name || 'Student'}
                        </h1>
                        <p className="text-gray-400 text-sm md:text-lg font-medium italic max-w-lg">
                            "The expert in anything was once a beginner. You've started your journey—keep pushing."
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <Link to="/student/courses" className="bg-primary text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/20">
                            Explore More Courses
                        </Link>
                        <Link to="/student/resources" className="bg-white/10 text-white border border-white/20 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            Shared Resources
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 hidden xl:flex flex-col items-center justify-center text-center">
                    <div className="w-48 h-48 border-4 border-primary/20 rounded-full flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="92" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                            <circle cx="96" cy="96" r="92" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="578" strokeDashoffset={578 * (1 - 0.15)} className="text-primary" />
                        </svg>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black italic">15%</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Starting</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-6 italic">Overall Learning Progress</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Enrolled Courses" value={`${enrolledCourses.length || '0'} Programmes`} trend="+1 New" />
                <StatCard icon={CheckCircle2} label="Certifications" value="00 Earned" trend="+1 Soon" color="primary" />
                <StatCard icon={Clock} label="Learning Hours" value="2.5 Hours" color="primary" />
                <StatCard icon={Trophy} label="Skill Points" value="150 XP" color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Active Learning Section */}
                <div ref={coursesRef} className="lg:col-span-8 space-y-10">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Your Enrolled Courses</h2>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Active programmes for your career growth</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {enrolledCourses.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-100 p-12 text-center space-y-4">
                                <BookOpen size={48} className="mx-auto text-gray-200" />
                                <p className="text-gray-500 font-bold italic">No active enrollments found. Please contact support if you believe this is an error.</p>
                                <Link to="/contact" className="inline-block text-[10px] font-black uppercase tracking-widest text-primary hover:text-black">Contact Support</Link>
                            </div>
                        ) : (
                            enrolledCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="md:w-2/5 relative overflow-hidden aspect-video md:aspect-auto">
                                            <img src={course.image} alt={course.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                            <div className="absolute top-6 left-6">
                                                <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 shadow-2xl">
                                                    ACTIVE
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">PROGRAMME CODE: {course.code}</p>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-4">{course.name}</h3>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                                        <p className="text-[10px] font-bold text-black uppercase leading-tight">{course.duration}</p>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrolled On</p>
                                                        <p className="text-[10px] font-bold text-black uppercase leading-tight">{new Date(course.enrollmentDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Course Progress</span>
                                                    <span className="text-xs font-black italic text-primary">{course.progress}%</span>
                                                </div>
                                                <div className="h-1 bg-gray-50 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${course.progress}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-primary relative"
                                                    >
                                                        <div className="absolute top-0 right-0 w-8 h-full bg-white/30 skew-x-12 animate-pulse" />
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                                <Link
                                                    to={`/student/course/${course.id}`}
                                                    className="flex-1 bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3"
                                                >
                                                    Access Curriculum <Play size={14} fill="currentColor" />
                                                </Link>
                                                <div
                                                    className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center border ${course.paymentStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    Payment: {course.paymentStatus}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div ref={sidebarRef} className="lg:col-span-4 space-y-8">

                    {/* Deadlines Section */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                            <AlertCircle size={20} className="text-red-500" />
                            <h3 className="text-sm font-black italic uppercase tracking-widest">Upcoming Notifications</h3>
                        </div>
                        <div className="space-y-6">
                            {upcomingDeadlines.map((deadline) => (
                                <div key={deadline.id} className="relative pl-6 border-l-2 border-gray-50 group hover:border-primary transition-all">
                                    <div className={`absolute top-0 left-[-2px] w-[2px] h-4 ${deadline.priority === 'high' ? 'bg-red-500' : 'bg-secondary'}`}></div>
                                    <p className="text-[11px] font-black uppercase tracking-tight text-black mb-1 leading-tight">{deadline.title}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{deadline.date}</p>
                                </div>
                            ))}
                        </div>
                        <Link to="/student/assignments" className="mt-8 w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors pt-6 border-t border-gray-50">
                            View All Events <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* AI Prompting Quick Access */}
                    <div className="bg-primary text-white p-8 relative overflow-hidden group">
                        <MessageSquare className="absolute bottom-[-10px] right-[-10px] text-white/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 block mb-2">CCA AI Engine</span>
                            <h4 className="text-xl font-black italic uppercase leading-none mb-6">Need instant <br /> course help?</h4>
                            <Link to="/student/ai-assistant" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                Launch Assistant <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Student Community / Quick Actions */}
                    <div className="bg-gray-50 border border-gray-100 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/student/resources" className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 hover:border-primary transition-all gap-3 group text-center">
                                <Download size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
                            </Link>
                            <Link to="/student/profile" className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 hover:border-primary transition-all gap-3 group text-center">
                                <User size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
