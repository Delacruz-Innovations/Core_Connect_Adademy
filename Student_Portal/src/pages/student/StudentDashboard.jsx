import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Play, CheckCircle2, Clock, Calendar,
    MessageSquare, ArrowRight, ChevronRight,
    Trophy, BookOpen, AlertCircle, TrendingUp,
    Zap, Download, Star, User
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
    const headerRef = useFadeInOnScroll('up', 0.6);
    const statsRef = useStaggerOnScroll(0.1);
    const coursesRef = useFadeInOnScroll('up', 0.8, 0.2);
    const sidebarRef = useFadeInOnScroll('left', 0.8, 0.3);

    const enrolledCourses = [
        {
            id: 'pm-ba-123',
            title: 'Project Management & Business Analysis',
            instructor: 'Dr. Sarah Chen',
            status: 'In Progress',
            progress: 45,
            lastActive: '2 days ago',
            nextLesson: 'Stakeholder Analysis Matrix',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    const upcomingDeadlines = [
        { id: 1, title: 'Module 4: Risk Register', date: 'Tomorrow, 11:59 PM', priority: 'high' },
        { id: 2, title: 'Stakeholder Case Study', date: 'Feb 12, 12:00 PM', priority: 'medium' }
    ];

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
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
                            Welcome back, <br className="hidden lg:block" /> Demo Student
                        </h1>
                        <p className="text-gray-400 text-sm md:text-lg font-medium italic max-w-lg">
                            "The expert in anything was once a beginner. You've completed 45% of your current path—keep pushing."
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <Link to="/student/courses" className="bg-primary text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/20">
                            View All Courses
                        </Link>
                        <Link to="/student/resources" className="bg-white/10 text-white border border-white/20 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            Learning Resources
                        </Link>
                    </div>
                </div>

                <div className="relative z-10 hidden xl:flex flex-col items-center justify-center text-center">
                    <div className="w-48 h-48 border-4 border-primary/20 rounded-full flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="92" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                            <circle cx="96" cy="96" r="92" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="578" strokeDashoffset={578 * (1 - 0.45)} className="text-primary" />
                        </svg>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black italic">45%</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Complete</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-6 italic">Overall Progress</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Total Enrolled" value="05 Courses" trend="+2 New" />
                <StatCard icon={CheckCircle2} label="Certifications" value="02 Earned" trend="+1 Soon" color="green-500" />
                <StatCard icon={Clock} label="Learning Hours" value="128 Hours" color="primary" />
                <StatCard icon={Trophy} label="Skill Points" value="1,420 XP" color="secondary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Active Learning Section */}
                <div ref={coursesRef} className="lg:col-span-8 space-y-10">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Active Learning</h2>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Resume where you left off</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {enrolledCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="md:w-2/5 relative overflow-hidden aspect-video md:aspect-auto">
                                        <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 shadow-2xl">
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">CORE PROGRAMME</p>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-4">{course.title}</h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 border border-gray-100">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Lesson</p>
                                                    <p className="text-[10px] font-bold text-black uppercase leading-tight">{course.nextLesson}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 border border-gray-100">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Session</p>
                                                    <p className="text-[10px] font-bold text-black uppercase leading-tight">{course.lastActive}</p>
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
                                                Resume Course <Play size={14} fill="currentColor" />
                                            </Link>
                                            <Link
                                                to={`/student/course/${course.id}`}
                                                className="bg-gray-50 text-black border border-gray-100 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-center"
                                            >
                                                Curriculum
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div ref={sidebarRef} className="lg:col-span-4 space-y-8">

                    {/* Deadlines Section */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                            <AlertCircle size={20} className="text-red-500" />
                            <h3 className="text-sm font-black italic uppercase tracking-widest">Upcoming Deadlines</h3>
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
                            Assignments Hub <ArrowRight size={14} />
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

                    {/* Student Community / Recent Activity */}
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

