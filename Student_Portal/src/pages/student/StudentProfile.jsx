import React from 'react';
import { User, Mail, GraduationCap, Lock, LogOut, ShieldCheck, Calendar, BookOpen } from 'lucide-react';
import { useFadeInOnScroll, useStaggerOnScroll } from '../../hooks/useScrollAnimations';

const StudentProfile = () => {
    const headerRef = useFadeInOnScroll('up', 0.6);
    const sidebarRef = useFadeInOnScroll('up', 0.8, 0.2);
    const contentRef = useFadeInOnScroll('left', 0.8, 0.4);

    const studentInfo = {
        name: "Demo Student",
        email: "student@coreconnect.com",
        joined: "January 2026",
        plan: "Elite Tech Programme",
        enrolledCourses: [
            { id: 1, title: 'Project Management & Business Analysis', progress: 45 },
            { id: 2, title: 'Digital Marketing Fundamentals', progress: 10 }
        ]
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div ref={headerRef}>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">My Account</span>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">Student Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                {/* Personal Info */}
                <div ref={sidebarRef} className="lg:col-span-4 space-y-10">
                    <div className="bg-white border border-gray-100 shadow-sm p-6 md:p-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-primary text-white flex items-center justify-center font-black text-4xl italic mb-6 shadow-2xl shadow-primary/20">
                            DS
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tight uppercase">{studentInfo.name}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mb-8">Registered Student</p>

                        <div className="w-full space-y-4 pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-4 text-left">
                                <Mail size={18} className="text-primary" />
                                <div className="leading-tight">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                    <p className="text-xs font-bold text-black">{studentInfo.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <Calendar size={18} className="text-primary" />
                                <div className="leading-tight">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Joined Date</p>
                                    <p className="text-xs font-bold text-black">{studentInfo.joined}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <ShieldCheck size={18} className="text-primary" />
                                <div className="leading-tight">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Current Membership</p>
                                    <p className="text-xs font-bold text-black">{studentInfo.plan}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-red-50 text-red-500 py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all">
                        <LogOut size={16} /> Logout from System
                    </button>
                </div>

                {/* Account Settings / Progress */}
                <div ref={contentRef} className="lg:col-span-8 space-y-12">

                    {/* Course Summary */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <BookOpen size={20} className="text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Enrolled Learning Tracks</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {studentInfo.enrolledCourses.map((course) => (
                                <div key={course.id} className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                                    <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-black leading-tight">{course.title}</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mastery</span>
                                            <span className="text-xs font-black italic text-primary">{course.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-50 overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Change Password Placeholder */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 text-black">
                            <Lock size={20} className="text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest italic">Security Settings</h3>
                        </div>
                        <div className="bg-white border border-gray-100 p-6 md:p-10 space-y-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-300">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none" disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-300">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none" disabled />
                                </div>
                            </div>
                            <button className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 cursor-not-allowed">
                                Update Credentials
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StudentProfile;
