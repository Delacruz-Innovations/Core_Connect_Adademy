import React, { useState } from 'react';
import {
    PlusCircle, Search, UserPlus,
    BookOpen, Calendar, ArrowRight,
    Filter, CheckCircle2, History
} from 'lucide-react';

const EnrolmentManagement = () => {
    const [activeTab, setActiveTab] = useState('new');

    const history = [
        { id: 1, user: "John Smith", course: "Business Analysis", date: "Feb 05, 2026", type: "Paid" },
        { id: 2, user: "Sarah Williams", course: "Project Management", date: "Feb 04, 2026", type: "Trial" },
        { id: 3, user: "Michael Chen", course: "Cybersecurity", date: "Feb 02, 2026", type: "Paid" }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Student Admissions</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Enrolments</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Form */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white border border-gray-100 shadow-xl p-10">
                        <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Enrol Student</h2>

                        <form className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Search User</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Name or Email..."
                                        className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Course</label>
                                <select className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all appearance-none">
                                    <option>Select a course...</option>
                                    <option>Business Analysis Mastery</option>
                                    <option>Project Management Professional</option>
                                    <option>Cybersecurity Bootcamp</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Access Type</label>
                                    <select className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all">
                                        <option>Full Access</option>
                                        <option>Trial (7 Days)</option>
                                        <option>Corporate Grant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Start Date</label>
                                    <input type="date" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="w-full bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                    <UserPlus size={18} /> Execute Enrolment
                                </button>
                                <p className="text-[10px] font-bold text-gray-400 text-center mt-6 uppercase tracking-widest">
                                    This action will grant immediate access and log the event.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="bg-white border border-gray-100 shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                                <History className="text-primary" /> Enrolment History
                            </h3>
                            <button className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-all">
                                Export Logs
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50/50 group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center text-primary font-black">
                                                {item.user[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-black text-sm">{item.user}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                    <BookOpen size={10} className="text-primary" /> {item.course}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-black mb-1">{item.date}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-white px-2 py-0.5 border border-gray-100 italic">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 mt-8 border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all">
                                Load More History
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EnrolmentManagement;
