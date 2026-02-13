import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, CheckCircle, Lock, PlayCircle, Clock, FileText, ChevronRight, ChevronDown } from 'lucide-react';

export default function StudentProgressModal({ isOpen, onClose, studentId, courseId }) {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        if (isOpen && studentId && courseId) {
            fetchProgress();
        }
    }, [isOpen, studentId, courseId]);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc('get_student_detailed_progress', {
                    p_student_id: studentId,
                    p_course_id: courseId
                });

            if (error) throw error;
            setProgressData(data || []);

            // Auto-expand active modules
            const activeMods = {};
            data?.filter(d => d.entity_type === 'module' && d.status === 'unlocked').forEach(m => {
                activeMods[m.entity_id] = true;
            });
            setExpandedModules(activeMods);
        } catch (err) {
            console.error('Error fetching student progress:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Helper to organize flat list into hierarchy
    const modules = progressData
        .filter(d => d.entity_type === 'module')
        .sort((a, b) => (a.meta?.week || 0) - (b.meta?.week || 0));

    const getChildren = (moduleId) =>
        progressData.filter(d => d.parent_id === moduleId && d.entity_type !== 'module');

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Student Traceability Audit</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                            Detailed progress logs for User ID: <span className="font-mono text-gray-400">{studentId.split('-')[0]}...</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Retrieving Neural Logs...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {modules.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No progress data found.</div>
                            ) : (
                                modules.map((mod) => {
                                    const children = getChildren(mod.entity_id);
                                    const isCompleted = mod.status === 'completed';
                                    const isLocked = mod.status === 'locked';
                                    const isExpanded = expandedModules[mod.entity_id];

                                    return (
                                        <div key={mod.entity_id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${isCompleted ? 'border-green-100' : isLocked ? 'border-gray-100 opacity-75' : 'border-primary/20 shadow-lg'}`}>
                                            <button
                                                onClick={() => toggleModule(mod.entity_id)}
                                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isCompleted ? 'bg-green-50 text-green-600' :
                                                            isLocked ? 'bg-gray-100 text-gray-400' :
                                                                'bg-primary text-white'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle size={20} /> : isLocked ? <Lock size={20} /> : <PlayCircle size={20} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className={`font-bold text-sm uppercase tracking-tight ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>{mod.title}</h3>
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                            <span>Module {mod.meta?.week}</span>
                                                            {!isLocked && <span>• {children.filter(c => c.status === 'completed' || c.status === true).length} / {children.length} Steps</span>}
                                                            {mod.completed_at && <span>• Completed {new Date(mod.completed_at).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                            </button>

                                            {isExpanded && (
                                                <div className="border-t border-gray-50 bg-gray-50/30 p-2">
                                                    {children.map((child, idx) => {
                                                        const childCompleted = child.status === 'completed' || child.status === true;
                                                        return (
                                                            <div key={child.entity_id} className="flex items-center justify-between p-3 ml-14 mr-4 hover:bg-white rounded-lg transition-colors group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${childCompleted ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                                        {childCompleted ? <CheckCircle size={12} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-xs font-bold uppercase tracking-tight ${childCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{child.title}</p>
                                                                        {child.entity_type === 'assignment' && <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest mt-0.5 inline-block">Assignment</span>}
                                                                    </div>
                                                                </div>
                                                                {childCompleted && child.completed_at && (
                                                                    <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1 group-hover:text-primary transition-colors">
                                                                        <Clock size={10} /> {new Date(child.completed_at).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Close Audit
                    </button>
                </div>
            </div>
        </div>
    );
}
