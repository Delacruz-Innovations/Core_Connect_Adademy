import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import ApprovalModal from './ApprovalModal';

const ApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const fetchApplications = async () => {
        setLoading(true);
        // Supabase query to get pending applications
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            // Fallback for demo if table doesn't exist yet
            setApplications([]);
        } else {
            setApplications(data || []);
        }
        setLoading(false);
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
            const { data: { user } } = await supabase.auth.getUser();

            // SQL-Native Workflow: Just update the application status.
            // The Database Trigger (tr_on_approval) will handle user creation and emails automatically!
            const { error } = await supabase
                .from('applications')
                .update({
                    status: 'approved',
                    admin_id: user?.id,
                    approved_at: new Date().toISOString()
                })
                .eq('id', selectedApplication.id);

            if (error) throw error;

            // Also create enrollment record (Trigger can do this too, but frontend control is fine here)
            await supabase.from('enrollments').insert({
                application_id: selectedApplication.id,
                student_id: null, // Will be filled by trigger/sync later
                courses: enrollmentData.courses,
                payment_amount: enrollmentData.paymentAmount,
                payment_method: enrollmentData.paymentMethod,
                payment_status: enrollmentData.paymentStatus,
                admin_id: user?.id,
                status: 'active'
            });

            alert(`Application for ${selectedApplication.full_name} is being processed! The system is sending the invitation emails now.`);

            // Optimistic UI update
            setApplications(applications.filter(a => a.id !== selectedApplication.id));
            setShowApprovalModal(false);
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error approving application:', error);
            alert("Error approving application: " + (error.message || "Unknown error"));
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Are you sure you want to reject this application?")) return;

        const { error } = await supabase
            .from('applications')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) {
            alert("Error rejecting application");
        } else {
            setApplications(applications.filter(a => a.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-gray-400 font-medium italic animate-pulse">
                Loading pending applications...
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
                                    @{app.username} • {app.program_type}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>{app.program_name || 'No Program Selected'}</span>
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
                                        "{app.reason}"
                                    </p>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <span className="font-bold text-gray-400 text-xs">Computer Literacy:</span>
                                        <div className="flex mt-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-full mr-0.5 ${i < app.computer_literacy ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-400 text-xs">Referral:</span>
                                        <p className="font-medium text-xs text-black">{app.referrer_source} {app.referrer_name && `(${app.referrer_name})`}</p>
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
