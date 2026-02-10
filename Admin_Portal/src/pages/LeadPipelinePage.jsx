import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Activity, Filter, Search, PlusCircle,
    User, Mail, Phone, Calendar,
    ChevronRight, MoreVertical, MessageSquare,
    CheckCircle2, XCircle, Clock, AlertCircle,
    Send, Database, ArrowRight, Loader2, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandedLoader from '../components/BrandedLoader';
import { useModal } from '../context/ModalContext';

const PIPELINE_STAGES = [
    { id: 'captured', label: 'Captured', color: 'bg-blue-500', icon: Database },
    { id: 'contacted', label: 'Contacted', color: 'bg-orange-500', icon: Phone },
    { id: 'qualified', label: 'Qualified', color: 'bg-green-500', icon: User },
    { id: 'nurturing', label: 'Nurturing', color: 'bg-purple-500', icon: Activity },
    { id: 'disqualified', label: 'Disqualified', color: 'bg-gray-500', icon: XCircle },
    { id: 'approved', label: 'Approved', color: 'bg-black', icon: CheckCircle2 }
];

const LeadPipelinePage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const { showAlert } = useModal();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, requested_course:courses!requested_course_id(title)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (leadId, newStatus) => {
        setUpdatingStatus(true);
        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    status: newStatus,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', leadId);

            if (error) throw error;

            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === leadId) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }

            showAlert(`Lead status updated to ${newStatus}`, 'Success', 'success');
        } catch (err) {
            console.error('Update status error:', err);
            showAlert('Failed to update status', 'Error', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setSavingNote(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const noteEntry = {
                id: Date.now(),
                text: newNote,
                created_at: new Date().toISOString(),
                admin_id: user?.id
            };

            const updatedNotes = [noteEntry, ...(selectedLead.lead_notes || [])];

            const { error } = await supabase
                .from('applications')
                .update({ lead_notes: updatedNotes })
                .eq('id', selectedLead.id);

            if (error) throw error;

            setSelectedLead({ ...selectedLead, lead_notes: updatedNotes });
            setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, lead_notes: updatedNotes } : l));
            setNewNote('');
        } catch (err) {
            console.error('Save note error:', err);
            showAlert('Failed to save note', 'Error', 'error');
        } finally {
            setSavingNote(false);
        }
    };

    if (loading) return <BrandedLoader message="Synchronizing Lead Pipeline..." />;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gray-100 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-black" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Sales & Admissions</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-gray-900">
                        Lead <span className="text-primary">Pipeline</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button className="bg-gray-50 text-gray-400 px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2">
                        <Filter size={14} /> Filter Pipeline
                    </button>
                </div>
            </div>

            {/* Pipeline Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {PIPELINE_STAGES.map((stage) => {
                    const stageLeads = leads.filter(l => l.status === stage.id || (stage.id === 'captured' && (l.status === 'pending' || !l.status)));

                    return (
                        <div key={stage.id} className="bg-gray-50/50 border border-gray-100 p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">{stage.label}</h3>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-0.5 border border-gray-100">
                                    {stageLeads.length}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {stageLeads.length === 0 ? (
                                    <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">No Active Nodes</p>
                                    </div>
                                ) : (
                                    stageLeads.map(lead => (
                                        <motion.div
                                            key={lead.id}
                                            layoutId={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black italic text-xs">
                                                    {lead.full_name.substring(0, 1)}
                                                </div>
                                                <MoreVertical size={14} className="text-gray-300 group-hover:text-black transition-colors" />
                                            </div>
                                            <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-1">{lead.full_name}</h4>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                    {lead.requested_course?.title || 'General Enquiry'}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(lead.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {(lead.lead_notes?.length > 0) && (
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <MessageSquare size={10} className="text-primary" />
                                                    {lead.lead_notes.length} Engagement Record(s)
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lead Detail Drawer */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex justify-end bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedLead(null)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-2xl h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-black text-white">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary flex items-center justify-center font-black italic text-2xl text-black">
                                        {selectedLead.full_name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">{selectedLead.full_name}</h2>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol Management View</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLead(null)} className="p-3 hover:rotate-90 transition-transform">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="p-12 space-y-12 pb-32">
                                {/* Lead Status Controls */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Activity size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Lifecycle Stage</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PIPELINE_STAGES.map(stage => (
                                            <button
                                                key={stage.id}
                                                disabled={updatingStatus}
                                                onClick={() => handleUpdateStatus(selectedLead.id, stage.id)}
                                                className={`py-3 px-4 text-[9px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-2 ${selectedLead.status === stage.id || (stage.id === 'captured' && (selectedLead.status === 'pending' || !selectedLead.status))
                                                        ? 'bg-black border-black text-white shadow-lg'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-black hover:text-black'
                                                    }`}
                                            >
                                                <stage.icon size={14} />
                                                {stage.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Engagement History - Notes */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-primary">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Engagement Records</span>
                                    </div>

                                    {/* Add Note Form */}
                                    <form onSubmit={handleAddNote} className="relative group">
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Log follow-up details, call notes, or qualification info..."
                                            className="w-full bg-gray-50 border-0 p-6 pb-16 font-bold text-sm text-gray-900 outline-none focus:ring-1 focus:ring-primary transition-all min-h-[120px]"
                                        />
                                        <div className="absolute bottom-4 right-4 flex items-center gap-4">
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                Press Shift+Enter to save
                                            </span>
                                            <button
                                                type="submit"
                                                disabled={savingNote || !newNote.trim()}
                                                className="bg-black text-white p-3 hover:bg-primary transition-colors disabled:opacity-20"
                                            >
                                                {savingNote ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Notes Timeline */}
                                    <div className="space-y-4">
                                        {!selectedLead.lead_notes || selectedLead.lead_notes.length === 0 ? (
                                            <div className="py-8 text-center border border-dashed border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                                No historical engagement records found.
                                            </div>
                                        ) : (
                                            selectedLead.lead_notes.map(note => (
                                                <div key={note.id} className="bg-gray-50 p-6 border-l-4 border-primary">
                                                    <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">
                                                        "{note.text}"
                                                    </p>
                                                    <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1 uppercase">
                                                            <User size={10} /> Admin Record
                                                        </span>
                                                        <span>{new Date(note.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Contact & Lead Context */}
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Mail size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identity Check</span>
                                        </div>
                                        <div className="bg-gray-50 p-4 border border-gray-100">
                                            <p className="text-xs font-bold text-gray-900 truncate">{selectedLead.email}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{selectedLead.phone || 'No Phone Node'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Activity size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Origin Point</span>
                                        </div>
                                        <div className="bg-gray-50 p-4 border border-gray-100">
                                            <p className="text-xs font-bold text-gray-900 uppercase truncate">{selectedLead.discovery_source || 'Organic Discovery'}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {selectedLead.program_interest}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadPipelinePage;
