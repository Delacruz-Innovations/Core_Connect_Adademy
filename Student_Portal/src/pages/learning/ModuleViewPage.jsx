import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    ArrowLeft, CheckCircle, Lock,
    PlayCircle, FileText, ChevronRight,
    Loader2, BookOpen, Clock, Award,
    Check, Play, Download, FileDown, Info
} from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext';

export default function ModuleViewPage() {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const { notifySyncFailure, registerRetry } = useConnectivity();
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [resources, setResources] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = () => fetchModuleData(controller.signal);

        fetchData();
        const unregister = registerRetry(fetchData);

        return () => {
            controller.abort();
            unregister();
        };
    }, [moduleId, registerRetry]);

    const fetchModuleData = async (signal) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: modData, error } = await supabase
                .from('modules')
                .select('*, courses(*)')
                .eq('id', moduleId)
                .abortSignal(signal)
                .single();

            if (error) throw error;
            setModule(modData);

            // Check lock status
            const { data: prog } = await supabase
                .from('module_progress')
                .select('status')
                .eq('user_id', user.id)
                .eq('module_id', moduleId)
                .abortSignal(signal)
                .maybeSingle();

            let isActuallyLocked = true;
            if (modData.week_number === 1 && modData.status !== 'locked') {
                isActuallyLocked = false;
            } else {
                // Hard Rule: Previous module MUST have all its assignments submitted
                const { data: prevMod } = await supabase
                    .from('modules')
                    .select('id, assignments(*)')
                    .eq('course_id', modData.course_id)
                    .eq('week_number', modData.week_number - 1)
                    .maybeSingle();

                if (prevMod) {
                    const prevAssigns = prevMod.assignments || [];
                    const { data: prevSubs } = await supabase
                        .from('assignment_submissions')
                        .select('assignment_id')
                        .eq('user_id', user.id)
                        .in('assignment_id', prevAssigns.map(a => a.id));

                    const hasPendingPrev = prevAssigns.some(a => !prevSubs?.some(s => s.assignment_id === a.id));

                    if (!hasPendingPrev) {
                        if (prog && (prog.status === 'unlocked' || prog.status === 'completed')) {
                            isActuallyLocked = false;
                            if (prog.status === 'completed') setCompleted(true);
                        }
                    }
                } else {
                    // No previous week (e.g. Week 1 handled above, or gap in weeks)
                    if (prog && (prog.status === 'unlocked' || prog.status === 'completed')) {
                        isActuallyLocked = false;
                        if (prog.status === 'completed') setCompleted(true);
                    }
                }
            }
            setLocked(isActuallyLocked);

            if (!isActuallyLocked) {
                const [lessonsRes, resourcesRes, progressRes, assignmentRes] = await Promise.all([
                    supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index', { ascending: true }).abortSignal(signal),
                    supabase.from('resources').select('*').eq('parent_id', moduleId).eq('visibility_status', 'published').abortSignal(signal),
                    supabase.from('lesson_progress').select('lesson_id, is_completed').eq('user_id', user.id).abortSignal(signal),
                    supabase.from('assignments').select('*').eq('module_id', moduleId).maybeSingle().abortSignal(signal)
                ]);

                setLessons(lessonsRes.data || []);
                setResources(resourcesRes.data || []);
                setProgress(progressRes.data || []);
                setAssignment(assignmentRes.data);

                if (assignmentRes.data) {
                    const { data: subData } = await supabase
                        .from('assignment_submissions')
                        .select('*')
                        .eq('assignment_id', assignmentRes.data.id)
                        .eq('user_id', user.id)
                        .abortSignal(signal)
                        .maybeSingle();
                    setSubmission(subData);
                }
            }
            notifySyncFailure(false); // Success

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching module view:', error);
            notifySyncFailure(true);
        } finally {
            setLoading(false);
        }
    };

    const isLessonCompleted = (lessonId) => {
        return progress.some(p => p.lesson_id === lessonId && p.is_completed);
    };

    const handleCompleteModule = async () => {
        setCompleting(true);
        try {
            const { error } = await supabase.rpc('complete_module', {
                p_module_id: moduleId
            });

            if (error) throw error;
            setCompleted(true);
            alert('Module successfully archived. Sequential unlock initiated.');
        } catch (error) {
            console.error('Error completing module:', error);
            alert(error.message || 'System mismatch: Ensure all units are mastered and assignments submitted.');
        } finally {
            setCompleting(false);
        }
    };

    const handleDownload = async (path, title) => {
        try {
            const { data, error } = await supabase.storage
                .from('lms-resources')
                .createSignedUrl(path, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error('Download failed:', err);
            alert('Access denied or link expired.');
        }
    };

    if (loading) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <Loader2 className="text-primary animate-spin" size={48} />
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">
                Accessing Secure Node...
            </div>
        </div>
    );

    if (locked) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-8">
                <div className="bg-white border border-gray-100 p-16 shadow-2xl shadow-gray-200/50 flex flex-col items-center text-center max-w-lg relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100" />
                    <div className="w-24 h-24 bg-gray-50 flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
                        <Lock size={40} />
                    </div>
                    <div className="flex flex-col mb-8">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2">Restricted Access</span>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Module Locked</h1>
                    </div>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic border-l-2 border-primary/20 pl-6 mx-auto mb-10 text-left">
                        Secure learning protocols require sequential completion. Please finalize all prerequisites in the previous learning node to unlock this week.
                    </p>
                    <Link
                        to={`/student/course/${courseId}`}
                        className="w-full bg-primary text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-secondary transition-all shadow-xl shadow-primary/20 rounded-sm"
                    >
                        Return to Curriculum
                    </Link>
                </div>
            </div>
        );
    }

    if (!module) return <div className="p-20 text-center uppercase font-black text-gray-400 tracking-widest italic">Node not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans pb-32 brand-watermark-bg">

            {/* Branded Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to={`/student/course/${courseId}`} className="group flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Back to Curriculum</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-100" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">Active Week</span>
                            <span className="text-xs font-black italic tracking-tight text-gray-900 uppercase">Week {module.week_number}: {module.title}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Module Hero */}
                        <div className="bg-white border border-gray-100 p-12 relative overflow-hidden shadow-2xl shadow-gray-200/50">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-primary/5 text-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                        Milestone Node
                                    </div>
                                    {completed && (
                                        <div className="bg-green-50 text-green-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                            Node Complete
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-[0.9] mb-8">
                                    {module.title}
                                </h1>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed italic border-l-2 border-primary/20 pl-8 py-2 mb-8">
                                    {module.description || "Deploying strategic frameworks for high-impact technical operations. Complete all units to unlock subsequent milestones."}
                                </p>

                                {lessons.length > 0 && (
                                    <Link
                                        to={`/student/course/${courseId}/module/${moduleId}/lesson/${lessons[0].id}`}
                                        className="inline-flex items-center gap-4 bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-secondary transition-all shadow-2xl shadow-primary/20 rounded-sm"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        Enter Learning Unit
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Lesson Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Curriculum Timeline</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {lessons.length === 0 ? (
                                    <div className="p-20 text-center bg-white border border-dashed border-gray-200 text-gray-300 font-bold uppercase tracking-widest text-xs italic">
                                        No units projected for this node yet.
                                    </div>
                                ) : (
                                    lessons.map((lesson, idx) => {
                                        const lessonCompleted = isLessonCompleted(lesson.id);
                                        return (
                                            <Link
                                                key={lesson.id}
                                                to={`/student/course/${courseId}/module/${moduleId}/lesson/${lesson.id}`}
                                                className="group bg-white border border-gray-100 p-8 flex items-center justify-between hover:border-primary/30 hover:shadow-xl transition-all relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-8 relative z-10">
                                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-300 font-black text-lg italic group-hover:bg-primary group-hover:text-white transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-1 group-hover:text-primary transition-colors">
                                                            {lesson.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                                <PlayCircle size={12} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{Math.floor((lesson.duration_seconds || 0) / 60)}m Unit</span>
                                                            </div>
                                                            {lessonCompleted && (
                                                                <div className="flex items-center gap-1.5 text-green-500">
                                                                    <CheckCircle size={12} />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Mastered</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={20} className="text-gray-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Resources & Assignment */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Module Resources */}
                        <div className="bg-white border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                <FileText size={18} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Module Resources</h3>
                            </div>

                            {resources.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic leading-relaxed">
                                        No specific module resources detected. Individual units may contain supplementary nodes.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {resources.map(res => (
                                        <div key={res.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 group hover:border-primary/20 transition-all rounded-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-white text-gray-400 shrink-0">
                                                    <FileText size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tight">{res.title}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{res.resource_type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(res.file_path, res.title)}
                                                className="p-2 text-gray-400 hover:text-primary transition-all"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assignment Portal */}
                        {assignment && (
                            <div className="bg-[#1c1d1f] text-white p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -right-8 -bottom-8 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                    <Award size={120} />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Award size={18} className="text-primary" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Node Challenge</h3>
                                    </div>
                                    <h4 className="text-lg font-black italic tracking-tighter uppercase leading-tight">{assignment.title}</h4>

                                    <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                                        {submission ? (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={14} /> Submission Validated
                                                </div>
                                                <Link to={`/student/assignments/${assignment.id}`} className="w-full py-4 text-center border border-white/10 hover:bg-white/5 transition-all text-[9px] font-black uppercase tracking-[0.2em]">View Submission</Link>
                                            </div>
                                        ) : (
                                            <Link to={`/student/assignments/${assignment.id}`} className="w-full py-4 text-center bg-primary text-black hover:bg-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">Enter Submission Portal</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Node Completion Action */}
                        {!completed && (
                            <div className="p-8 border-2 border-primary/20 bg-primary/5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-primary" />
                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocol Finalization</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic">
                                    Executing node finalization will archive this week and initiate sequential unlock for the following curriculum node. Ensure all units are marked "Mastered".
                                </p>
                                <button
                                    onClick={handleCompleteModule}
                                    disabled={completing || !lessons.every(l => isLessonCompleted(l.id)) || (assignment && !submission)}
                                    className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${completing || !lessons.every(l => isLessonCompleted(l.id)) || (assignment && !submission)
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-black text-white hover:bg-primary shadow-xl'
                                        }`}
                                >
                                    {completing ? 'Synchronizing...' : 'Finalize Module Node'}
                                </button>
                            </div>
                        )}

                        {completed && (
                            <div className="p-8 border-2 border-green-100 bg-green-50/50 flex flex-col items-center text-center gap-4">
                                <CheckCircle2 size={32} className="text-green-500" />
                                <div className="space-y-1">
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Module Synchronized</h5>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Node Completion</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
