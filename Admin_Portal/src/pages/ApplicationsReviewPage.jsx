import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import {
    CheckCircle2, XCircle, Clock, Eye,
    Briefcase, BookOpen, User, MapPin,
    Monitor, Search, Filter, Loader2, ArrowRight
} from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const ApplicationReviewPage = () => {
    const [applications, setApplications] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [actioning, setActioning] = useState(false);
    const [assignedCourseIds, setAssignedCourseIds] = useState([]);

    // Custom Modal States
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: apps, error: appsError } = await supabase
                .from('applications')
                .select('*, requested_course:courses!requested_course_id(title)')
                .order('created_at', { ascending: false });

            const { data: courseList, error: coursesError } = await supabase
                .from('courses')
                .select('id, title')
                .eq('is_published', true);

            if (appsError) throw appsError;
            if (coursesError) throw coursesError;

            setApplications(apps || []);
            setCourses(courseList || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = () => {
        if (assignedCourseIds.length === 0) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Action Required',
                message: 'Please assign at least one course before authorizing enrollment.'
            });
            return;
        }

        setConfirmationModal({
            isOpen: true,
            title: 'Confirm Authorization',
            message: `Are you sure you want to approve ${selectedApp.full_name}? This will grant access to ${assignedCourseIds.length} course(s) and send an invitation email.`,
            onConfirm: executeApproval
        });
    };

    const executeApproval = async () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        setActioning(true);

        try {
            console.log('Starting multi-course approval for applicant:', selectedApp.email);

            // 1. Create a temporary client for signUp (prevents admin logout)
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const tempPassword = Math.random().toString(36).slice(-12) + "Tt1!";
            let newUserId = null;

            // 2. Attempt SignUp with explicit Redirect to Student Portal
            const studentPortalUrl = 'http://localhost:5174/set-password';

            const { data: authData, error: signUpError } = await tempClient.auth.signUp({
                email: selectedApp.email,
                password: tempPassword,
                options: {
                    emailRedirectTo: studentPortalUrl,
                    data: {
                        full_name: selectedApp.full_name,
                        username: selectedApp.username,
                        role: 'student'
                    }
                }
            });

            if (signUpError) {
                // Check if user already exists
                if (signUpError.message.includes('already registered') || signUpError.status === 400) {
                    console.log('User already exists, attempting to find existing ID...');
                    const { data: existingUser } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', selectedApp.email)
                        .single();

                    newUserId = existingUser?.id;
                } else {
                    throw signUpError;
                }
            } else {
                newUserId = authData.user?.id;
            }

            if (!newUserId) {
                throw new Error("Could not determine user identity. Please ensure the student has a profile.");
            }

            console.log('User identity resolved:', newUserId);

            // 3. Safety Delay: Wait for Supabase Auth -> Postgres synchronization (2s)
            console.log('Waiting for Auth sync (2s)...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 4. Finalize Approval via RPC (Updated for array)
            console.log('Finalizing approval logic with course IDs:', assignedCourseIds);
            const { error: rpcError } = await supabase.rpc('approve_application', {
                target_application_id: selectedApp.id,
                final_course_ids: assignedCourseIds
            });

            if (rpcError) throw rpcError;

            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Enthusiasm Approved',
                message: `${selectedApp.full_name} has been successfully approved and enrolled in ${assignedCourseIds.length} tracks.`
            });

            setSelectedApp(null);
            fetchData();
        } catch (err) {
            console.error('Approval error:', err);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Approval Failed',
                message: err.message || 'An unknown error occurred during validation.'
            });
        } finally {
            setActioning(false);
        }
    };

    const handleReject = async () => {
        setActioning(true);
        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    status: 'rejected',
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', selectedApp.id);

            if (error) throw error;

            setSelectedApp(null);
            fetchData();
        } catch (err) {
            console.error('Rejection error:', err);
        } finally {
            setActioning(false);
        }
    };

    if (loading) return <BrandedLoader message="Loading Applications Registry..." />;

    return (
        <div className="space-y-12">
            {actioning && <BrandedLoader message="Processing Enrollment Action..." />}

            {/* Header Section */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-black" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Admissions Registry</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-gray-900">
                        Enrollment <span className="text-primary">Lifecycle</span>
                    </h1>
                </div>
            </div>

            {/* Application Registry Table */}
            <div className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle Node</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Program/Course</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Status</th>
                            <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {applications.map((app) => (
                            <tr key={app.id} className="group hover:bg-gray-50/70 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black italic shadow-lg">
                                            {app.full_name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">{app.full_name}</h4>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">@{app.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{app.program_interest}</span>
                                        <p className="text-xs font-bold text-gray-600 italic">{app.requested_course?.title || 'Node Undefined'}</p>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-current ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                        app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {app.status === 'pending' ? <Clock size={12} /> :
                                            app.status === 'approved' ? <CheckCircle2 size={12} /> :
                                                <XCircle size={12} />}
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <button
                                        onClick={() => {
                                            setSelectedApp(app);
                                            setAssignedCourseIds([app.requested_course_id]);
                                        }}
                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Review Drawer / Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] overflow-y-auto animate-in slide-in-from-right duration-500">

                        {/* Drawer Header */}
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-black text-white">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary flex items-center justify-center font-black italic text-2xl text-black">
                                    {selectedApp.full_name.substring(0, 1)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">{selectedApp.full_name}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol Identification Card</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="p-3 hover:rotate-90 transition-transform">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-12 space-y-12 pb-32">

                            {/* Grid Context */}
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <User size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identity Core</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-xs font-bold text-gray-900 truncate">{selectedApp.email}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{selectedApp.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <MapPin size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Spatial Node</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-xs font-bold text-gray-900 uppercase truncate">{selectedApp.country}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{selectedApp.city}, {selectedApp.postcode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Context */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary">
                                    <Briefcase size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Professional Resume</span>
                                </div>
                                <div className="bg-gray-50 p-8 border border-gray-100 space-y-6">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Current Trajectory</p>
                                        <p className="text-sm font-black italic uppercase text-gray-900 group-hover:text-primary transition-colors">{selectedApp.job_role}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Motivation Record</p>
                                        <p className="text-xs text-gray-500 font-bold leading-relaxed tracking-widest border-l-2 border-primary/20 pl-6 py-1">
                                            "{selectedApp.motivation_text}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Literacy & Discovery */}
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Monitor size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Literacy Index</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-3 bg-gray-100 relative">
                                            <div className="absolute top-0 left-0 h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ width: `${selectedApp.computer_literacy_score * 10}%` }} />
                                        </div>
                                        <span className="text-xl font-black text-primary italic leading-none">{selectedApp.computer_literacy_score}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Filter size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Attribution Flow</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 italic tracking-widest">{selectedApp.discovery_source}</span>
                                        {selectedApp.referral_name && (
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Source Entity: {selectedApp.referral_name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reconciliation / Approval Box */}
                            {selectedApp.status === 'pending' && (
                                <div className="pt-12 border-t border-gray-100 space-y-10">
                                    <div className="space-y-6 bg-primary/5 p-10 border border-primary/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <BookOpen size={18} className="text-primary" />
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Track Allocation</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-primary uppercase bg-white px-3 py-1 border border-primary/20 italic shadow-sm">
                                                {assignedCourseIds.length} tracks selected
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Original Request: {selectedApp.requested_course?.title}</p>

                                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {courses.map(course => (
                                                    <label
                                                        key={course.id}
                                                        className={`flex items-center gap-4 p-4 border transition-all cursor-pointer group ${assignedCourseIds.includes(course.id)
                                                            ? 'bg-black border-black shadow-lg translate-x-1'
                                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${assignedCourseIds.includes(course.id) ? 'bg-primary border-primary' : 'border-gray-200'
                                                            }`}>
                                                            {assignedCourseIds.includes(course.id) && <CheckCircle2 size={12} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={assignedCourseIds.includes(course.id)}
                                                            onChange={() => {
                                                                if (assignedCourseIds.includes(course.id)) {
                                                                    setAssignedCourseIds(assignedCourseIds.filter(id => id !== course.id));
                                                                } else {
                                                                    setAssignedCourseIds([...assignedCourseIds, course.id]);
                                                                }
                                                            }}
                                                        />
                                                        <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${assignedCourseIds.includes(course.id) ? 'text-white' : 'text-gray-600 group-hover:text-black'
                                                            }`}>
                                                            {course.title}
                                                            {course.id === selectedApp.requested_course_id && (
                                                                <span className="ml-3 text-[8px] italic opacity-50 lowercase tracking-tighter">(requested)</span>
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            disabled={actioning}
                                            onClick={handleReject}
                                            className="flex-1 py-6 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-50 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                                        >
                                            Decline Entry
                                        </button>
                                        <button
                                            disabled={actioning}
                                            onClick={handleApprove}
                                            className="flex-[2] py-6 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20 disabled:opacity-30"
                                        >
                                            {actioning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Authorize Enrollment
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
            {/* --- CUSTOM MODALS --- */}

            {/* Confirmation Modal */}
            {
                confirmationModal.isOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-white max-w-md w-full shadow-2xl border-t-8 border-[#F37021] animate-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="w-12 h-12 bg-[#F37021]/10 text-[#F37021] flex items-center justify-center rounded-full mb-6">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">
                                    {confirmationModal.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                                    {confirmationModal.message}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                                        className="flex-1 py-4 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-gray-300 hover:text-black transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmationModal.onConfirm}
                                        className="flex-[2] py-4 bg-[#F37021] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                                    >
                                        Confirm Action
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Status / Alert Modal */}
            {
                statusModal.isOpen && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-white max-w-sm w-full shadow-2xl border-b-8 border-gray-900 animate-in zoom-in-95 duration-200">
                            <div className={`h-2 w-full ${statusModal.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div className="p-8 text-center">
                                <div className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-6 ${statusModal.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                    {statusModal.type === 'success' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">
                                    {statusModal.title}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-8">
                                    {statusModal.message}
                                </p>
                                <button
                                    onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                                    className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#F37021] transition-all"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ApplicationReviewPage;
