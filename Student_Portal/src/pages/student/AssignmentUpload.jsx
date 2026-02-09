import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const AssignmentUpload = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [isUploaded, setIsUploaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            const { data, error } = await supabase
                .from('assignments')
                .select(`
                    *,
                    module:module_id(
                        title,
                        course:course_id(title)
                    ),
                    lesson:lesson_id(title)
                `)
                .eq('id', assignmentId)
                .single();

            if (error) throw error;
            setAssignment(data);

            const { data: { user } } = await supabase.auth.getUser();
            const { data: subData } = await supabase
                .from('assignment_submissions')
                .select('*')
                .eq('assignment_id', assignmentId)
                .eq('user_id', user.id)
                .maybeSingle();

            setSubmission(subData);
        } catch (error) { // Changed err to error
            console.error('Error fetching assignment:', error);
            setError(error.message); // Changed error message
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;

        // PRD Validation: PDF or DOC only
        const ext = file.name.split('.').pop().toLowerCase();
        const allowed = assignment.allowed_file_types || ['pdf', 'doc', 'docx'];
        if (!allowed.includes(ext)) {
            alert(`INVALID PROTOCOL: Only ${allowed.join(', ')} files are permitted.`);
            return;
        }

        // Validation
        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit.");
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Stable path for student assignment
            const filePath = `${user.id}/${assignmentId}/${file.name}`;

            // 1. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('assignment-submissions')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 2. Create submission record
            const { error: dbError } = await supabase // Changed subError to dbError
                .from('assignment_submissions')
                .upsert({
                    user_id: user.id,
                    assignment_id: assignmentId,
                    file_path: filePath, // Changed storage_path to file_path
                    updated_at: new Date().toISOString() // Added updated_at
                }, { onConflict: 'user_id, assignment_id' });

            if (dbError) throw dbError; // Changed subError to dbError
            alert('Submission archived successfully.'); // Changed alert message
            fetchAssignment(); // Re-fetch assignment to update submission status
        } catch (error) { // Changed err to error
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message); // Changed alert message
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload({ target: { files: e.dataTransfer.files } });
        }
    };

    if (loading) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <Loader2 className="text-primary animate-spin" size={48} />
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Accessing Vault...</div>
        </div>
    );

    if (error || !assignment) return (
        <div className="p-20 text-center uppercase font-black text-red-500 tracking-widest italic">{error || 'Assignment Identity Not Found'}</div>
    );

    return (
        <div className="space-y-8 md:space-y-12 mx-auto min-h-screen">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-gray-100 pb-8">
                <div className="space-y-4">
                    <Link to={`/student/course/${assignment.module?.course_id}`} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-2">
                        <ArrowLeft size={14} /> Back to Curriculum
                    </Link>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Assignment Submission</span>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
                            Upload <span className="text-primary">Work</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center w-full md:w-auto">
                    <span className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={14} /> Sequence Requirement: Mandatory
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">

                {/* Instructions */}
                <div className="bg-white border border-gray-100 p-8 shadow-sm rounded-sm">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-6">
                        <FileText size={20} className="text-primary" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Assignment Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Course</p>
                            <p className="text-sm font-bold text-gray-900 uppercase">{assignment.module?.course?.title || 'General Curriculum'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Module / Unit</p>
                            <p className="text-sm font-bold text-gray-900 uppercase">
                                {assignment.parent_type === 'lesson'
                                    ? `Unit: ${assignment.lesson?.title}`
                                    : `Module: ${assignment.module?.title}`
                                }
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Task</p>
                            <p className="text-sm font-bold text-gray-900 uppercase">{assignment.title}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                            {assignment.description || "Deploy all required artefacts for this module cycle. Instructions validated by cohort lead."}
                        </p>
                    </div>
                </div>

                {/* Upload Area */}
                <div>
                    <AnimatePresence mode="wait">
                        {uploading ? (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-2 border-dashed border-primary p-20 flex flex-col items-center justify-center text-center bg-primary/5"
                            >
                                <Loader2 className="text-primary animate-spin mb-6" size={48} />
                                <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-gray-900">Uploading Document...</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encrypting assets for secure storage</p>
                            </motion.div>
                        ) : !isUploaded ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                                    relative border-2 border-dashed p-12 md:p-16 flex flex-col items-center justify-center text-center transition-all bg-gray-50/50 rounded-sm
                                    ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="w-16 h-16 bg-white border border-gray-100 flex items-center justify-center text-primary mb-6 shadow-sm rounded-full">
                                    <Upload size={24} />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-gray-900">Upload Submission</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Drag & Drop or Click to Browse</p>

                                <label className="bg-primary text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-sm">
                                    Select File
                                    <input type="file" className="hidden" onChange={handleUpload} />
                                </label>

                                <div className="mt-8 flex items-center gap-2 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                    <AlertCircle size={12} /> max file size 10MB (PDF, PNG, DOCX)
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-100 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-sm"
                            >
                                <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 mb-6 rounded-full">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-tight text-green-700 mb-2">Submission Successful</h4>
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-8">Ref: SUB-2026-X89 • Sent at 20:30 GMT</p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="bg-white text-green-700 border border-green-200 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm rounded-sm">
                                        Download Receipt
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('PROTOCOL OVERRIDE: Are you sure you want to retract your submission?')) {
                                                const { data: { user } } = await supabase.auth.getUser();
                                                await supabase.from('assignment_submissions').delete().eq('assignment_id', assignmentId).eq('user_id', user.id);
                                                setIsUploaded(false);
                                            }
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 underline transition-all flex items-center justify-center gap-1"
                                    >
                                        <X size={12} /> Undo & Replace
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default AssignmentUpload;
