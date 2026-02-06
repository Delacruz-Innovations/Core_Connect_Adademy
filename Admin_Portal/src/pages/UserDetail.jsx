import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Shield, ShieldCheck,
    Calendar, CheckCircle2, GraduationCap,
    Unlock, Ban, Trash2, MailQuestion
} from 'lucide-react';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Placeholder data
    const user = {
        id: id,
        name: "John Smith",
        email: "john@example.com",
        role: "student",
        verified: true,
        created_at: "January 12, 2026",
        status: "Active",
        enrolled_courses: [
            { id: 101, title: "Business Analysis Mastery", status: "In Progress", joined: "Jan 15, 2026" },
            { id: 102, title: "AI for Professionals", status: "Completed", joined: "Feb 01, 2026" }
        ]
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center gap-8">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">User Identification: #{id}</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Profile Details</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Profile Summary */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-2xl mx-auto mb-6">
                            JS
                        </div>
                        <h2 className="text-2xl font-black italic mb-2">{user.name}</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-8">
                            <Shield size={14} className="text-primary" /> {user.role} Account
                        </p>

                        <div className="space-y-4 border-t border-gray-50 pt-8">
                            <div className="flex justify-between text-xs">
                                <span className="font-black text-gray-400 uppercase tracking-widest">Status</span>
                                <span className="font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5">{user.status}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-black text-gray-400 uppercase tracking-widest">Verification</span>
                                <span className="font-black text-primary uppercase tracking-widest">{user.verified ? 'Complete' : 'Pending'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-black text-gray-400 uppercase tracking-widest">Joined</span>
                                <span className="font-bold text-gray-600">{user.created_at}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 block border-b border-gray-50 pb-4">Account Control</h3>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-primary hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                            <MailQuestion size={16} /> Resend verification
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-black hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                            <Unlock size={16} /> Force Password Reset
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
                            <Ban size={16} /> Suspend Account
                        </button>
                    </div>
                </div>

                {/* Right Column: Enrolments & History */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Enrolled Courses */}
                    <div className="bg-white border border-gray-100 shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                                <GraduationCap className="text-primary" /> Enrolled Courses
                            </h3>
                            <button className="bg-primary text-white px-6 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                                Manage Enrolments
                            </button>
                        </div>
                        <div className="p-8 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Title</th>
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Enrolled</th>
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.enrolled_courses.map((course) => (
                                        <tr key={course.id} className="group border-b border-gray-50 last:border-0">
                                            <td className="py-6">
                                                <p className="font-bold text-sm text-black">{course.title}</p>
                                            </td>
                                            <td className="py-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                {course.joined}
                                            </td>
                                            <td className="py-6 text-right">
                                                <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${course.status === 'Completed' ? 'bg-green-50 text-green-500' : 'bg-primary/5 text-primary'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-8 border border-gray-100 italic">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Admin Notes</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                Student requested access to previous recordings on Feb 5th. Verified eligibility and granted 7-day extended access.
                            </p>
                        </div>
                        <div className="bg-white p-8 border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Security Logs</h4>
                            <ul className="space-y-4">
                                <li className="text-[10px] font-bold text-gray-400 flex justify-between">
                                    <span>Last Login IP:</span>
                                    <span className="text-black">192.168.1.45</span>
                                </li>
                                <li className="text-[10px] font-bold text-gray-400 flex justify-between">
                                    <span>Device:</span>
                                    <span className="text-black">Chrome / Mac OS</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UserDetail;
