import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ApplicationsList from '../components/ApplicationsList';
import {
    PlusCircle, Search, UserPlus,
    BookOpen, Calendar, ArrowRight,
    Filter, CheckCircle2, History, List
} from 'lucide-react';

const EnrolmentManagement = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [manualForm, setManualForm] = useState({
        fullName: '',
        email: '',
        course: '',
        accessType: 'Full Access',
        startDate: new Date().toISOString().split('T')[0]
    });

    const handleManualEnrol = async (e) => {
        e.preventDefault();

        try {
            // 1. Get current Admin ID
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Create Application Record
            const { data: newApp, error: appError } = await supabase
                .from('applications')
                .insert({
                    full_name: manualForm.fullName,
                    email: manualForm.email,
                    username: manualForm.email.split('@')[0] + Math.floor(Math.random() * 1000), // Temp username
                    program_type: 'Mentorship', // Default or need mapping
                    program_name: manualForm.course,
                    status: 'approved',
                    referrer_source: 'Manual Admin Enrolment',
                    job_role: 'Student', // Default for manual enrol
                    admin_id: user?.id
                })
                .select()
                .single();

            if (appError) throw appError;

            // 2. Call Edge Function to create user & profile
            const { error: inviteError } = await supabase.functions.invoke('invite-student', {
                body: { applicationId: newApp.id }
            });

            if (inviteError) throw inviteError;

            alert(`Successfully enrolled and invited ${manualForm.fullName}!`);

            // Reset form
            setManualForm({
                fullName: '',
                email: '',
                course: '',
                accessType: 'Full Access',
                startDate: new Date().toISOString().split('T')[0]
            });

        } catch (error) {
            console.error('Enrolment error:', error);
            alert(`Error enrolling student: ${error.message}`);
        }
    };

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

            {/* Tabs */}
            <div className="flex border-b border-gray-100 space-x-8">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Pending Requests
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Manual Enrolment
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Enrolment History
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[60vh]">

                {/* Pending Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="max-w-5xl">
                        <div className="bg-white border border-gray-100 shadow-xl p-10">
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Pending Applications</h2>
                            <ApplicationsList />
                        </div>
                    </div>
                )}

                {/* Manual Enrolment Tab */}
                {activeTab === 'manual' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="bg-white border border-gray-100 shadow-xl p-10 max-w-3xl">
                                <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Enrol Student Manually</h2>

                                <form className="space-y-6" onSubmit={handleManualEnrol}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={manualForm.fullName}
                                                onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={manualForm.email}
                                                onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                placeholder="student@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Course</label>
                                        <select
                                            className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                                            value={manualForm.course}
                                            onChange={(e) => setManualForm({ ...manualForm, course: e.target.value })}
                                        >
                                            <option value="">Select a course...</option>
                                            <option value="Business Analysis Mastery">Business Analysis Mastery</option>
                                            <option value="Project Management Professional">Project Management Professional</option>
                                            <option value="Cybersecurity Bootcamp">Cybersecurity Bootcamp</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Access Type</label>
                                            <select
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                value={manualForm.accessType}
                                                onChange={(e) => setManualForm({ ...manualForm, accessType: e.target.value })}
                                            >
                                                <option value="Full Access">Full Access</option>
                                                <option value="Trial (7 Days)">Trial (7 Days)</option>
                                                <option value="Corporate Grant">Corporate Grant</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={manualForm.startDate}
                                                onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="w-full bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                            <UserPlus size={18} /> Execute Enrolment
                                        </button>
                                        <p className="text-[10px] font-bold text-gray-400 text-center mt-6 uppercase tracking-widest">
                                            This action will grant immediate access and log the event.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="max-w-5xl">
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
                )}

            </div>
        </div>
    );
};

export default EnrolmentManagement;
