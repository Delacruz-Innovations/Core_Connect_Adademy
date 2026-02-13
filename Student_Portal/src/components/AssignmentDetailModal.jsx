import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, Clock, Calendar, MessageSquare, Award, Download, ArrowRight } from 'lucide-react';

const AssignmentDetailModal = ({ isOpen, onClose, assignment }) => {
    if (!assignment) return null;

    const { submission } = assignment;
    const isGraded = assignment.reviewed_status === 'reviewed';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header Section */}
                        <div className="relative p-8 md:p-10 border-b border-gray-100 bg-gray-50/50">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white rounded-full shadow-sm"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isGraded ? 'bg-green-50 text-green-600 border-green-100' :
                                    assignment.is_submitted ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                        'bg-gray-50 text-gray-500 border-gray-100'
                                    }`}>
                                    {isGraded ? 'Graded & Reviewed' : assignment.is_submitted ? 'Under Review' : 'Missing Submission'}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {assignment.module?.course?.title || assignment.lesson?.module?.course?.title || 'Course Material'}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                                {assignment.title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                {assignment.parent_type === 'lesson' ? `Unit: ${assignment.lesson?.title}` : `Module: ${assignment.module?.title}`}
                            </p>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                            {/* Grading Section (If Graded) */}
                            {isGraded && (
                                <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                        <Award size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                <Award size={16} />
                                            </div>
                                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Instructor Critique</h3>
                                        </div>

                                        <div className="flex items-end gap-2 mb-6">
                                            <span className="text-6xl font-black italic tracking-tighter text-gray-900 leading-none">
                                                {assignment.grade_score}
                                            </span>
                                            <span className="text-2xl font-black text-gray-300 italic mb-1">%</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                <MessageSquare size={12} /> Detailed Feedback
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm bg-white/60 p-5 rounded-2xl border border-white/40">
                                                {submission?.admin_feedback || "Your submission has been reviewed. Good work on meeting the core requirements of this assignment."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submission Details */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Archive Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3 text-gray-400">
                                            <Calendar size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Submission Date</span>
                                        </div>
                                        <p className="font-bold text-gray-900">
                                            {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3 text-gray-400">
                                            <FileText size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Artifact ID</span>
                                        </div>
                                        <p className="font-bold text-gray-900 truncate">
                                            {submission?.id?.slice(0, 13).toUpperCase() || 'SUB-ID-PENDING'}
                                        </p>
                                    </div>
                                </div>

                                {assignment.is_submitted && (
                                    <button
                                        onClick={() => {
                                            const courseTitle = assignment.module?.course?.title || assignment.lesson?.module?.course?.title || 'General Curriculum';
                                            const content = `ASSIGNMENT RECEIPT\n\nID: ${submission?.id}\nAssignment: ${assignment.title}\nCourse: ${courseTitle}\nSubmitted At: ${new Date(assignment.submitted_at).toLocaleString()}\n\nStatus: ARCHIVED`;
                                            const element = document.createElement("a");
                                            const file = new Blob([content], { type: 'text/plain' });
                                            element.href = URL.createObjectURL(file);
                                            element.download = `receipt_${submission?.id?.slice(0, 8)}.txt`;
                                            document.body.appendChild(element);
                                            element.click();
                                        }}
                                        className="w-full flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-primary transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Download size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900 text-sm">Download Submission Receipt</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Digital Proof of Archival</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-8 md:p-10 bg-gray-50/50 border-t border-gray-100">
                            {!assignment.is_submitted ? (
                                <Link
                                    to={`/student/assignments/${assignment.id}`}
                                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-black/5"
                                >
                                    Start Submission <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/5"
                                >
                                    Dismiss Record
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AssignmentDetailModal;
