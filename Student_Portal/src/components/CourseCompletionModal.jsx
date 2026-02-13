import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, ArrowLeft, Share2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import React, { useState, useEffect } from 'react';

export default function CourseCompletionModal({ isOpen, onClose, courseTitle, studentName, completionDate }) {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Header with decorative background */}
                        <div className="bg-gray-900 text-white p-12 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10"
                            >
                                <Award size={48} strokeWidth={2.5} />
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl font-black uppercase tracking-tight mb-2 relative z-10"
                            >
                                Protocol Complete!
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-400 font-bold uppercase tracking-widest text-xs relative z-10"
                            >
                                You have successfully mastered this curriculum
                            </motion.p>
                        </div>

                        {/* Certificate Preview */}
                        <div className="p-8 md:p-12 bg-gray-50 flex flex-col items-center">
                            <div className="bg-white border-8 border-double border-gray-200 p-8 shadow-xl max-w-sm w-full text-center relative mb-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gray-900" />
                                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gray-900" />
                                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gray-900" />
                                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gray-900" />

                                <img src="/logo.png" alt="Logo" className="h-8 mx-auto mb-6 opacity-80" />
                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Certificate of Completion</h3>
                                <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Presented to</p>
                                <p className="text-xl font-script text-primary mb-6 border-b border-gray-300 pb-2 inline-block px-8">{studentName || 'Student Name'}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">For successfully completing</p>
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{courseTitle || 'Course Title'}</p>
                                <div className="mt-8 flex justify-between items-center text-[8px] text-gray-400 uppercase tracking-widest">
                                    <span>{completionDate || new Date().toLocaleDateString()}</span>
                                    <span>Core Connect Academy</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                                    <Download size={16} /> Download PDF
                                </button>
                                <button className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                                    <Share2 size={16} /> Share Achievement
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft size={16} /> Return to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
