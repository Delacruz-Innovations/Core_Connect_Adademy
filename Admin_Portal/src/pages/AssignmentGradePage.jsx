import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import {
    ArrowLeft, Download, CheckCircle2,
    FileText, User, MessageSquare,
    Award, Info, Loader2, Save
} from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const AssignmentGradePage = () => {
    const { id: submissionId } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Grading States
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchSubmission();
    }, [submissionId]);

    const fetchSubmission = async () => {
        try {
            const { data, error } = await supabase
                .from('assignment_submissions')
                .select(`
                    *,
                    profiles:user_id(full_name, email),
                    assignment:assignment_id(
                        *,
                        module:module_id(title, week_number),
                        lesson:lesson_id(title)
                    )
                `)
                .eq('id', submissionId)
                .single();

            if (error) throw error;
            setSubmission(data);
            setGrade(data.grade_score || '');
            setFeedback(data.admin_feedback || '');
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrade = async () => {
        if (!grade) {
            showAlert('Please provide a grade before committing.', 'Validation Error', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('assignment_submissions')
                .update({
                    grade_score: parseInt(grade),
                    admin_feedback: feedback.trim(),
                    reviewed_status: 'reviewed',
                    graded_at: new Date().toISOString(),
                    graded_by: user.id
                })
                .eq('id', submissionId);

            if (error) throw error;
            showAlert('Grade and feedback synchronized successfully.', 'Protocol Complete', 'success');
            fetchSubmission();
        } catch (err) {
            showAlert('Sync failed: ' + err.message, 'System Error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async () => {
        try {
            const { data, error } = await supabase.storage
                .from('assignment-submissions')
                .createSignedUrl(submission.file_path, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            showAlert('Download failed: ' + err.message, 'Storage Error', 'error');
        }
    };

    if (loading) return <BrandedLoader message="Accessing Submission Data..." />;
    if (!submission) return <div className="p-20 text-center uppercase font-black text-gray-300">Submission Identity Not Found</div>;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm rounded-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Critique & Grading Node</span>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Review Submission</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Submission Details & Asset */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white border border-gray-100 p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <FileText size={120} />
                        </div>
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-xl font-black italic">
                                    {submission.profiles?.full_name?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">{submission.profiles?.full_name}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2">{submission.profiles?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-50">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assignment Target</span>
                                    <p className="text-sm font-bold text-gray-900 uppercase italic leading-tight">
                                        {submission.assignment?.title}
                                    </p>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                        {submission.assignment?.parent_type === 'lesson'
                                            ? `Lesson: ${submission.assignment.lesson?.title}`
                                            : `Week ${submission.assignment.module?.week_number}: ${submission.assignment.module?.title}`
                                        }
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lifecycle Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${submission.reviewed_status === 'reviewed' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {submission.reviewed_status}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400">
                                            {new Date(submission.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-gray-50">
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-4 bg-gray-50 border border-gray-100 py-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all group"
                                >
                                    <Download size={18} className="group-hover:animate-bounce" /> Download Artifact For Review
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 text-white p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Info size={100} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Pedagogical Brief</h4>
                        <p className="text-sm font-medium italic text-gray-300 leading-relaxed max-w-2xl relative z-10">
                            {submission.assignment?.brief}
                        </p>
                    </div>
                </div>

                {/* Right: Grading Interface */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-gray-100 p-8 shadow-2xl shadow-black/5 space-y-8 sticky top-8">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <div className="p-2 bg-primary text-white">
                                <Award size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Grading Matrix</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Performance Score (0-100)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 p-6 text-4xl font-black italic text-gray-900 focus:outline-none focus:border-black focus:bg-white transition-all text-center tracking-tighter"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-200">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Critical Feedback</label>
                                <textarea
                                    rows="8"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 p-6 text-xs font-medium focus:outline-none focus:border-black focus:bg-white transition-all resize-none leading-relaxed"
                                    placeholder="Provide detailed critique of the submitted work..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveGrade}
                            disabled={isSaving}
                            className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Synchronize Grade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentGradePage;
