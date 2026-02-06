import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFadeInOnScroll } from '../../hooks/useScrollAnimations';

const AssignmentUpload = () => {
    const { assignmentId } = useParams();
    const [isUploaded, setIsUploaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const headerRef = useFadeInOnScroll('up', 0.6);
    const contentRef = useFadeInOnScroll('up', 0.8, 0.2);

    const assignmentData = {
        title: "Submit Process Map Draft",
        course: "Project Management & Business Analysis",
        module: "Module 4: Business Analysis Basics",
        instructions: "Upload your high-level process map for the retail scenario. Ensure the file is in PDF or PNG format and includes all primary actors identified in Lesson 2.",
        dueDate: "Friday, 20th Oct 2026",
        status: "Not Submitted"
    };

    const handleUpload = () => {
        setIsUploaded(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Link to="/student/assignments" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        <ArrowLeft size={16} /> Back to Assignments
                    </Link>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Assignment Submission</span>
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">{assignmentData.title}</h1>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Course: {assignmentData.course}</span>
                        <span>Module: {assignmentData.module}</span>
                    </div>
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-2">
                    <Clock size={14} /> Due: {assignmentData.dueDate}
                </div>
            </div>

            <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Instructions */}
                <div className="lg:col-span-12">
                    <div className="bg-white border border-gray-100 p-6 md:p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 text-black">
                            <FileText size={20} className="text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Instructions</h3>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 md:pl-6">
                            {assignmentData.instructions}
                        </p>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="lg:col-span-12">
                    <AnimatePresence mode="wait">
                        {!isUploaded ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                            relative border-4 border-dashed rounded-none p-10 md:p-20 flex flex-col items-center justify-center text-center transition-all
                            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}
                          `}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(); }}
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 flex items-center justify-center text-gray-300 mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    <Upload size={32} />
                                </div>
                                <h4 className="text-lg font-black italic uppercase tracking-tight mb-2">Drag & Drop Files</h4>
                                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">PDF, DOCX, PNG up to 10MB</p>

                                <label className="bg-black text-white px-8 md:px-10 py-4 md:py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-primary transition-all shadow-2xl">
                                    Select File From Computer
                                    <input type="file" className="hidden" onChange={handleUpload} />
                                </label>

                                <div className="mt-12 flex items-center gap-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                    <AlertCircle size={14} /> Submit by EOD Friday for weekend review
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-100 p-16 flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                                <div className="w-20 h-20 bg-green-500 text-white flex items-center justify-center rounded-none shadow-xl shadow-green-500/20 mb-8">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-green-700 mb-2">Submission Successful</h4>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-10">Timestamp: 5 Oct 2026, 20:30 GMT</p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="bg-white text-green-600 border border-green-200 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">
                                        Download Confirmation
                                    </button>
                                    <button
                                        onClick={() => setIsUploaded(false)}
                                        className="bg-transparent text-gray-400 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all"
                                    >
                                        Replace Submission
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
