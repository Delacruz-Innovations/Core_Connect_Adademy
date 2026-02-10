import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Send, User, Trash2 } from 'lucide-react';
import { useModal } from '../context/ModalContext';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { showAlert, showConfirm } = useModal();

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error: sbError } = await supabase
                .from('applications')
                .select('*, courses!requested_course_id(title)')
                .in('status', ['pending', 'captured'])
                .order('created_at', { ascending: false });

            if (sbError) throw sbError;
            // Map the application data to the structure the component expects
            const mappedLeads = (data || []).map(app => ({
                id: app.id,
                first_name: app.full_name.split(' ')[0],
                last_name: app.full_name.split(' ').slice(1).join(' ') || '',
                username: app.username,
                email: app.email,
                created_at: app.created_at,
                course_interest: app.courses?.title || app.program_interest,
                notes: app.motivation_text
            }));
            setLeads(mappedLeads);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleApprove = async (lead) => {
        if (!await showConfirm(`Confirm approval for ${lead.first_name} ${lead.last_name}? This will grant access.`, 'Confirm Approval')) return;

        setProcessingId(lead.id);
        try {
            console.log('Starting approval for lead:', lead.email);

            // 1. Create a temporary client for signUp
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const tempPassword = Math.random().toString(36).slice(-12) + "Tt1!";
            let newUserId = null;

            // 2. Attempt SignUp with explicit Redirect to Student Portal (Port 5174)
            const studentPortalUrl = 'http://localhost:5174/set-password';

            const { data: authData, error: signUpError } = await tempClient.auth.signUp({
                email: lead.email,
                password: tempPassword,
                options: {
                    emailRedirectTo: studentPortalUrl,
                    data: {
                        full_name: `${lead.first_name} ${lead.last_name}`,
                        username: lead.username, // Passed from lead table
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
                        .eq('email', lead.email)
                        .single();

                    newUserId = existingUser?.id;
                } else {
                    throw signUpError;
                }
            } else {
                newUserId = authData.user?.id;
            }

            if (!newUserId) {
                throw new Error("Could not determine user identity. Please ensure the user has a profile.");
            }

            console.log('User identity resolved:', newUserId);

            // 3. Resolve Course ID
            let targetCourseId = null;
            try {
                if (lead.course_interest) {
                    const { data: courses } = await supabase
                        .from('courses')
                        .select('id, title')
                        .ilike('title', `%${lead.course_interest}%`)
                        .limit(1);

                    if (courses && courses.length > 0) {
                        targetCourseId = courses[0].id;
                        console.log(`Matched Interest '${lead.course_interest}' to Course: ${courses[0].title}`);
                    }
                }
            } catch (courseErr) {
                console.warn('Silent failure matching course:', courseErr);
            }

            // 4. Safety Delay: Wait for Supabase Auth -> Postgres synchronization
            console.log('Waiting for Auth sync (2s)...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Update Lead Status
            const { error: updateError } = await supabase
                .from('applications') // Changed from 'leads' to 'applications' based on context
                .update({
                    status: 'approved',
                    user_id: newUserId, // Use newUserId obtained from auth
                    requested_course_id: targetCourseId // Set the course ID
                })
                .eq('id', lead.id);

            if (updateError) throw updateError;

            await showAlert(`Approval Successful! ${lead.email} is now enrolled.`, 'Approval Success', 'success');
            fetchLeads(); // Refresh list

        } catch (err) {
            console.error('Approval Process Error:', err);
            await showAlert(`Approval Failed: ${err.message || 'Unknown database error'}`, 'Approval Failed', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!await showConfirm("Reject this lead?", "Reject Application")) return;
        const { error } = await supabase.from('applications').update({ status: 'rejected' }).eq('id', id);
        if (!error) setLeads(leads.filter(l => l.id !== id));
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-400 uppercase tracking-widest text-[10px] font-black">Scanning for new leads...</div>;

    if (leads.length === 0) return (
        <div className="p-12 text-center border-2 border-dashed border-gray-100 bg-gray-50 rounded-lg">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No pending leads found</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {leads.map((lead) => (
                <div key={lead.id} className="bg-white border border-gray-100 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4 hover:border-primary/30 transition-all">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center font-black text-xs shrink-0">
                            {lead.first_name[0]}{lead.last_name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 leading-none">{lead.first_name} {lead.last_name}</h3>
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded">@{lead.username}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{lead.email}</p>
                            <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(lead.created_at).toLocaleDateString()}</span>
                                <span className="text-black italic">Interested in: {lead.course_interest}</span>
                            </div>
                            {lead.notes && (
                                <p className="mt-3 text-xs text-gray-500 italic bg-gray-50 p-2 border-l-2 border-gray-200">"{lead.notes}"</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            disabled={processingId === lead.id}
                            onClick={() => handleApprove(lead)}
                            className="bg-primary text-white px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {processingId === lead.id ? 'Processing...' : <><CheckCircle size={14} /> Approve & Invite</>}
                        </button>
                        <button
                            disabled={processingId === lead.id}
                            onClick={() => handleReject(lead.id)}
                            className="bg-gray-100 text-gray-400 px-4 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeadsList;
