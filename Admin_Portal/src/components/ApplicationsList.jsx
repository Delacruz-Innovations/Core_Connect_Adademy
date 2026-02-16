import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import ApprovalModal from './ApprovalModal';
import { sendEmail } from '@shared/lib/emailService';

import { useModal } from '../context/ModalContext';

const ApplicationsList = () => {
    const { showAlert, showConfirm } = useModal();
    const [applications, setApplications] = useState(() => {
        const cached = localStorage.getItem('academy_applications_cache');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(applications.length === 0);
    const [expandedId, setExpandedId] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [error, setError] = useState(null);

    const fetchApplications = async () => {
        // If we have cached apps, sync in background without blocking
        if (applications.length === 0) setLoading(true);
        setError(null);

        // Safety Timeout
        const timeout = setTimeout(() => {
            if (loading && applications.length === 0) {
                setLoading(false);
                setError("Application sync timeout. Using offline data if available.");
            }
        }, 12000);

        try {
            const { data, error: sbError } = await supabase
                .from('applications')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (sbError) throw sbError;

            const fetchedApps = data || [];
            setApplications(fetchedApps);
            localStorage.setItem('academy_applications_cache', JSON.stringify(fetchedApps));
        } catch (err) {
            // Ignore abort errors (user navigated away)
            if (err.name === 'AbortError' || err.code === 20) {
                console.log('Fetch aborted');
                return;
            }
            console.error('Error fetching applications:', err);
            if (applications.length === 0) {
                setError(err.message || 'Failed to connect to server');
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = (app) => {
        setSelectedApplication(app);
        setShowApprovalModal(true);
    };

    const handleApproveWithDetails = async (enrollmentData) => {
        try {
            // 1. Create a temporary client for signUp (to avoid session conflict)
            const { createClient } = await import('@supabase/supabase-js');
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const tempPassword = Math.random().toString(36).slice(-12) + "Tt1!";
            const siteUrl = import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5174';
            const studentPortalUrl = `${siteUrl}/set-password`;

            console.log('Inviting student via Auth...');
            const { error: signUpError } = await tempClient.auth.signUp({
                email: selectedApplication.email,
                password: tempPassword,
                options: {
                    emailRedirectTo: studentPortalUrl,
                    data: {
                        full_name: selectedApplication.full_name,
                        role: 'student'
                    }
                }
            });

            // We ignore "already registered" errors as we just want to ensure they exist
            if (signUpError && !signUpError.message.includes('already registered')) {
                throw signUpError;
            }

            // 2. Perform atomic DB updates via RPC
            console.log('Finalizing enrollment record...');
            const { error: rpcError } = await supabase.rpc('approve_application', {
                target_application_id: selectedApplication.id,
                final_course_id: enrollmentData.courses[0] // New RPC takes a single course ID
            });

            if (rpcError) throw rpcError;

            // Trigger Welcome Email
            sendEmail(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_STUDENT_WELCOME,
                {
                    student_name: selectedApplication.full_name,
                    course_name: enrollmentData.course_name || 'your chosen track', // Pass course name from modal if available
                    module_one_name: 'Introduction to the Course',
                    student_email: selectedApplication.email
                }
            ).catch(err => console.error('Welcome email failed:', err));

            await showAlert(`Success! Application for ${selectedApplication.full_name} has been approved and enrolled. The student has been invited to set their password.`, 'Application Approved', 'success');

            // Optimistic UI update
            setApplications(applications.filter(a => a.id !== selectedApplication.id));
            setShowApprovalModal(false);
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error approving application:', error);
            await showAlert("Error approving application: " + (error.message || "Unknown error"), 'Approval Error', 'error');
        }
    };

    const handleReject = async (id) => {
        if (!await showConfirm("Are you sure you want to reject this application?", 'Confirm Rejection')) return;

        const { error } = await supabase
            .from('applications')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) {
            await showAlert("Error rejecting application", 'Rejection Error', 'error');
        } else {
            setApplications(applications.filter(a => a.id !== id));
        }
    };

    if (loading && applications.length === 0) {
        return (
            <div className="p-12 text-center text-gray-400 font-medium italic animate-pulse">
                Loading pending applications...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2">Sync Error</p>
                <p className="text-red-400 text-[10px] mb-4">{error}</p>
                <button
                    onClick={fetchApplications}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-gray-100 bg-gray-50 rounded-lg">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">No pending applications</p>
                <p className="text-gray-300 text-[10px]">New requests will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app) => (
                <div key={app.id} className="bg-white border border-gray-100 shadow-sm p-6 rounded-lg transition-all hover:shadow-md hover:border-primary/20">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-primary/30">
                                {app.full_name ? app.full_name[0] : '?'}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-black leading-tight">{app.full_name}</h3>
                                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">
                                    @{app.username} • {app.program_interest}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>Course ID: {app.requested_course_id?.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 self-start">
                            <button
                                onClick={() => handleApprove(app)}
                                className="bg-green-50 text-green-600 border border-green-100 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 group"
                            >
                                <CheckCircle size={14} />
                                <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                                onClick={() => handleReject(app.id)}
                                className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 group"
                            >
                                <XCircle size={14} />
                                <span className="hidden sm:inline">Reject</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <button
                            onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            className="text-[10px] font-black text-gray-400 hover:text-black flex items-center gap-1 transition-colors uppercase tracking-[0.1em]"
                        >
                            {expandedId === app.id ? 'Hide Details' : 'View Full Application'}
                            {expandedId === app.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <span className="text-[10px] font-bold text-gray-300 uppercase bg-gray-50 px-2 py-1 rounded">
                            ID: {app.id.slice(0, 8)}...
                        </span>
                    </div>

                    {expandedId === app.id && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-8 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-3">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-2 border-b border-gray-200 pb-2">Contact Info</h4>
                                <p className="grid grid-cols-[80px_1fr]"><span className="font-bold text-gray-400">Email:</span> <span className="font-medium">{app.email}</span></p>
                                <p className="grid grid-cols-[80px_1fr]"><span className="font-bold text-gray-400">Phone:</span> <span className="font-medium">{app.phone || 'N/A'}</span></p>
                                <p className="grid grid-cols-[80px_1fr]"><span className="font-bold text-gray-400">Location:</span> <span className="font-medium">{app.city}, {app.country}</span></p>
                                <p className="grid grid-cols-[80px_1fr]"><span className="font-bold text-gray-400">Current Role:</span> <span className="font-medium">{app.job_role}</span></p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-2 border-b border-gray-200 pb-2">Application Details</h4>
                                <div>
                                    <span className="font-bold text-gray-400 block mb-1">Reason for Joining:</span>
                                    <p className="text-gray-600 italic leading-relaxed bg-white p-3 border border-gray-100 rounded text-xs">
                                        "{app.motivation_text}"
                                    </p>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <span className="font-bold text-gray-400 text-xs">Computer Literacy:</span>
                                        <div className="flex mt-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-full mr-0.5 ${i < app.computer_literacy_score ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-400 text-xs">Referral:</span>
                                        <p className="font-medium text-xs text-black">{app.discovery_source} {app.referral_name && `(${app.referral_name})`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Approval Modal */}
            {showApprovalModal && selectedApplication && (
                <ApprovalModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowApprovalModal(false);
                        setSelectedApplication(null);
                    }}
                    onApprove={handleApproveWithDetails}
                />
            )}
        </div>
    );
};

export default ApplicationsList;
