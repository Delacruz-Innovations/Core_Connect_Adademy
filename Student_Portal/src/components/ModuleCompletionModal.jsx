import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Upload,
    ChevronRight,
    PartyPopper,
    Lock,
    X,
    ClipboardCheck,
    FileUp,
    ShieldCheck
} from 'lucide-react';

export default function ModuleCompletionModal({
    isOpen,
    onClose,
    moduleTitle,
    moduleNumber,
    assignments = [],
    onSubmitAssignment,
    submitting,
    onContinue
}) {
    const fileInputRef = useRef(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const hasAssignments = Array.isArray(assignments) && assignments.length > 0;

    const handleUploadClick = (assignment) => {
        setSelectedAssignment(assignment);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && selectedAssignment) {
            onSubmitAssignment(selectedAssignment, file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                    >
                        {/* Left Side: Celebration Panel */}
                        <div className="md:w-5/12 bg-[#1c1d1f] p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700" />
                            </div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/30"
                            >
                                <PartyPopper size={40} className="text-primary" />
                            </motion.div>

                            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Section {moduleNumber} Complete</h2>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest leading-relaxed">
                                "{moduleTitle || 'Next Milestone Reached'}"
                            </p>

                            <div className="mt-8 flex flex-col items-center gap-2">
                                <div className="h-1 w-24 bg-primary rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mastery Unlocked</span>
                            </div>
                        </div>

                        {/* Right Side: Action Panel */}
                        <div className="flex-1 p-8 bg-white flex flex-col">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ClipboardCheck className="text-primary" size={24} />
                                    Next Steps
                                </h3>

                                {hasAssignments ? (
                                    <div className="space-y-4 mb-8">
                                        <p className="text-sm text-gray-600 font-medium">
                                            While the next section is already unlocked, we highly recommend submitting your module assessments to reinforce your learning.
                                        </p>

                                        {assignments.map(assignment => (
                                            <div
                                                key={assignment.id}
                                                className="p-4 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-primary/50 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                                                        <FileUp size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">{assignment.title}</p>
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Required</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUploadClick(assignment)}
                                                    disabled={submitting}
                                                    className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all rounded-lg"
                                                >
                                                    {submitting ? 'Streaming...' : 'Upload'}
                                                </button>
                                            </div>
                                        ))}

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                            <ShieldCheck className="text-green-500" size={32} />
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium mb-8">
                                            No mandatory assessments for this section. You're clear to proceed!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"
                                >
                                    Not yet
                                </button>
                                <button
                                    onClick={onContinue}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg shadow-primary/20"
                                >
                                    Continue To Next Section
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
