import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Clock, Send, User, Trash2 } from 'lucide-react';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error: sbError } = await supabase
                .from('leads')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (sbError) throw sbError;
            setLeads(data || []);
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
        if (!confirm(`Confirm approval for ${lead.first_name} ${lead.last_name}? This will grant access.`)) return;

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

            // 5. Finalize Approval via RPC with Retry Logic
            let success = false;
            let attempts = 0;
            while (!success && attempts < 3) {
                attempts++;
                console.log(`Finalizing approval (Attempt ${attempts})...`);
                const { data: rpcData, error: rpcError } = await supabase.rpc('approve_lead_unified', {
                    p_lead_id: lead.id,
                    p_user_id: newUserId,
                    p_course_id: targetCourseId
                });

                if (!rpcError && rpcData?.success) {
                    success = true;
                } else {
                    const errMsg = rpcError?.message || rpcData?.message || 'Unknown error';
                    if (attempts < 3 && (errMsg.includes('foreign key') || errMsg.includes('not found'))) {
                        console.warn(`Sync lag detected, retrying in 1s...`);
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        throw new Error(errMsg);
                    }
                }
            }

            alert(`Approval Successful! ${lead.email} is now enrolled.`);
            setLeads(leads.filter(l => l.id !== lead.id));

        } catch (err) {
            console.error('Approval process failed:', err);
            alert(`Approval Failed: ${err.message || 'Unknown database error'}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Reject this lead?")) return;
        const { error } = await supabase.from('leads').update({ status: 'rejected' }).eq('id', id);
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
                            <h3 className="font-bold text-gray-900 leading-none mb-1">{lead.first_name} {lead.last_name}</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">{lead.email}</p>
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
