import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, FileText, Download, Lock, Info,
    Calendar, BookOpen, FileType, ExternalLink,
    Shield, Share2, Clock
} from 'lucide-react';

const ResourceDetailModal = ({ isOpen, onClose, resource, onDownload }) => {
    if (!resource) return null;

    const isLocked = resource.isLocked;

    const getIconColor = (type) => {
        const t = type?.toLowerCase();
        if (t === 'pdf') return 'bg-red-50 text-red-500';
        if (['doc', 'docx'].includes(t)) return 'bg-blue-50 text-blue-500';
        if (['xls', 'xlsx'].includes(t)) return 'bg-green-50 text-green-500';
        if (['ppt', 'pptx'].includes(t)) return 'bg-orange-50 text-orange-500';
        return 'bg-gray-50 text-gray-500';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header Section */}
                        <div className="relative p-4 bg-gray-50/50 border-b border-gray-100">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white shadow-sm border border-gray-100"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className={`w-12 h-12 flex items-center justify-center shadow-lg ${getIconColor(resource.type)}`}>
                                    <FileText size={24} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${isLocked ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {isLocked ? 'Alumni Exclusive' : resource.resource_type || 'Instructional'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <FileType size={12} /> {resource.type}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                                        {resource.title}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Summary / Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-900 flex items-center justify-center text-white">
                                        <Info size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Resource Intel</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-lg italic border-l-4 border-primary/20 pl-6 py-2">
                                    {resource.description || "This resource serves as a critical reference point for the current module's objectives. Ensure you review the contents thoroughly to align with course requirements."}
                                </p>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50/80 p-4 border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all duration-500">
                                    <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Course Connection</p>
                                        <p className="font-bold text-gray-900">{resource.course}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/80 p-4 border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all duration-500">
                                    <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Estimated Review</p>
                                        <p className="font-bold text-gray-900">15 - 20 Minutes</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/80 p-4 border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all duration-500">
                                    <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Access Protocol</p>
                                        <p className="font-bold text-gray-900">{isLocked ? 'Restricted' : 'Authenticated'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/80 p-4 border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-lg transition-all duration-500">
                                    <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <FileType size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Digital Footprint</p>
                                        <p className="font-bold text-gray-900">{resource.size || '3.2 MB'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Locked Notice */}
                            {isLocked && (
                                <div className="bg-orange-50/50 p-4 border border-orange-100 flex flex-col md:flex-row items-center gap-4">
                                    <div className="w-12 h-12 bg-white shadow-sm flex items-center justify-center text-orange-500 shrink-0">
                                        <Lock size={20} />
                                    </div>
                                    <div className="text-center md:text-left space-y-2">
                                        <p className="font-black text-orange-900 uppercase tracking-tight italic">Alumni Network Exclusive</p>
                                        <p className="text-sm text-orange-850/70">This premium artifact is unlocked upon course completion. It provides advanced guidance for post-course professional expansion.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                            {isLocked ? (
                                <button
                                    onClick={onClose}
                                    className="w-full h-12 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-black/5"
                                >
                                    Dismiss Record
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => onDownload(resource)}
                                        className="flex-1 h-12 bg-black text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-black/5"
                                    >
                                        Download Artifact <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => alert("Archive connection initiated...")}
                                        className="w-12 h-12 bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:text-black hover:border-black transition-all shadow-sm"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ResourceDetailModal;
