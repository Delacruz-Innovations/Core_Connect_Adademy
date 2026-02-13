import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Lock, CheckCircle,
    PlayCircle, FileText, Layout,
    Loader2, ChevronRight, Play, Award,
    Trophy, Sparkles
} from 'lucide-react';

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [allSubIds, setAllSubIds] = useState(new Set());

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                console.error("User not found in CoursePlayer - Redirecting to login");
                navigate('/login');
                return;
            }

            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();
            setCourse(courseData);

            // Filter for only Live (published) modules
            const { data: modulesData } = await supabase
                .from('modules')
                .select('*')
                .eq('course_id', courseId)
                .eq('is_published', true)
                .order('week_number', { ascending: true });

            const fetchedModules = modulesData || [];

            // 1. Fetch Assignments, Submissions, and Progress in parallel for hard-locking rules
            const [assignsRes, subsRes, progRes, lessonsRes] = await Promise.all([
                supabase.from('assignments').select('*').in('module_id', fetchedModules.map(m => m.id)),
                supabase.from('assignment_submissions').select('assignment_id').eq('user_id', authUser.id),
                supabase.from('module_progress').select('module_id, status').eq('user_id', authUser.id).eq('course_id', courseId),
                supabase.from('lessons').select('id, title, module_id, is_published').in('module_id', fetchedModules.map(m => m.id)).eq('is_published', true).order('order_index', { ascending: true })
            ]);

            const subIds = new Set(subsRes.data?.map(s => s.assignment_id) || []);
            setAllSubIds(subIds);

            const modulesWithAssigns = fetchedModules.map(m => ({
                ...m,
                assignments: assignsRes.data?.filter(a => a.module_id === m.id) || [],
                lessons: lessonsRes.data?.filter(l => l.module_id === m.id) || []
            }));
            setModules(modulesWithAssigns);

            const progressMap = {};
            progRes.data?.forEach(p => {
                progressMap[p.module_id] = p.status;
            });
            setProgress(progressMap);

            // AUTO-START LOGIC: 
            if (fetchedModules.length > 0 && window.location.pathname === `/student/course/${courseId}`) {
                setRedirecting(true);

                // Check Resume: Try to resume from granular last-left-off position
                const { data: lastLessonRecord } = await supabase
                    .from('lesson_progress')
                    .select('lesson_id, module_id')
                    .eq('user_id', authUser.id)
                    .eq('course_id', courseId)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (lastLessonRecord) {
                    // Check if the resume lesson is actually published
                    const isLessonLive = lessonsRes.data?.some(l => l.id === lastLessonRecord.lesson_id);

                    if (isLessonLive) {
                        const modIdx = fetchedModules.findIndex(m => m.id === lastLessonRecord.module_id);
                        const isResumeLocked = modIdx > 0 && modulesWithAssigns[modIdx - 1]?.assignments?.some(a => !subIds.has(a.id));

                        if (!isResumeLocked) {
                            navigate(`/student/course/${courseId}/module/${lastLessonRecord.module_id}/lesson/${lastLessonRecord.lesson_id}`, { replace: true });
                            return;
                        }
                    }
                }

                // Fallback to first non-locked module
                for (let i = 0; i < modulesWithAssigns.length; i++) {
                    const m = modulesWithAssigns[i];
                    const isHardLocked = i > 0 && modulesWithAssigns[i - 1]?.assignments?.some(a => !subIds.has(a.id));

                    if (!isHardLocked) {
                        const firstLesson = m.lessons?.[0];

                        if (firstLesson) {
                            navigate(`/student/course/${courseId}/module/${m.id}/lesson/${firstLesson.id}`, { replace: true });
                            return;
                        } else {
                            navigate(`/student/course/${courseId}/module/${m.id}`, { replace: true });
                            return;
                        }
                    } else {
                        // All subsequent modules are locked
                        break;
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching course player:', error);
        } finally {
            if (window.location.pathname === `/student/course/${courseId}` && fetchedModules.length > 0) {
                // Keep loading true while navigating
            } else {
                setLoading(false);
            }
        }
    };

    const isModuleLocked = (mod) => {
        const modIdx = modules.findIndex(m => m.id === mod.id);
        if (modIdx === 0) return false; // Week 1 is always accessible if unlocked

        // Hard Rule: Previous module MUST have all its assignments submitted
        const prevMod = modules[modIdx - 1];
        const prevAssigns = prevMod?.assignments || [];
        const hasPendingPrev = prevAssigns.some(a => !allSubIds.has(a.id));
        if (hasPendingPrev) return true;

        if (mod.status === 'unlocked') return false;
        const status = progress[mod.id];
        return status !== 'unlocked' && status !== 'completed';
    };

    if (loading || redirecting) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <Loader2 className="text-primary animate-spin" size={48} />
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Synchronizing Neural Link...</div>
        </div>
    );

    if (!course) return <div className="p-20 text-center">Course not found.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

            {/* Curriculum Sidebar */}
            <aside className="w-96 bg-white border-r border-gray-100 flex flex-col h-full z-10 shrink-0 shadow-2xl shadow-gray-200/50">
                <div className="p-8 border-b border-gray-100">
                    <Link to="/student/dashboard" className="group flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Exit Player</span>
                    </Link>

                    <div className="flex flex-col mb-6">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-2">Learning Path</span>
                        <h1 className="font-black text-xl italic uppercase leading-none tracking-tighter text-gray-900">{course.title}</h1>
                    </div>

                    {(() => {
                        const totalModules = modules.length;
                        const completedModules = modules.filter(m => progress[m.id] === 'completed').length;
                        const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                        return (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Core Progress</span>
                                    <span className="text-[10px] text-primary font-bold uppercase">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-50 h-1.5 overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                <nav className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">Curriculum Nodes</h3>
                    {modules.map((mod) => {
                        const locked = isModuleLocked(mod);
                        const completed = progress[mod.id] === 'completed';

                        return (
                            <div
                                key={mod.id}
                                className={`
                                    relative border transition-all duration-300 group overflow-hidden
                                    ${locked
                                        ? 'bg-gray-50 border-transparent opacity-60 cursor-not-allowed grayscale'
                                        : 'bg-white border-gray-100 hover:border-primary/30 cursor-pointer shadow-sm hover:shadow-xl'
                                    }
                                    ${completed ? 'border-primary/20 bg-primary/[0.02]' : ''}
                                `}
                            >
                                <div className="flex h-16">
                                    {mod.thumbnail_url && !locked && (
                                        <div className="w-20 shrink-0 relative overflow-hidden">
                                            <img src={mod.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/20" />
                                        </div>
                                    )}
                                    <div className="flex-1 p-4 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-[8px] uppercase font-black tracking-widest ${locked ? 'text-gray-300' : 'text-primary'}`}>
                                                Week {mod.week_number}
                                            </span>
                                            {locked ? (
                                                <Lock size={10} className="text-gray-300" />
                                            ) : completed && (
                                                <CheckCircle size={10} className="text-primary" />
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-[11px] uppercase italic tracking-tight leading-tight ${locked ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {mod.title}
                                        </h3>
                                    </div>
                                    {!locked && (
                                        <div className="flex items-center pr-4">
                                            <ChevronRight size={12} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    )}
                                </div>

                                {!locked && (
                                    <Link to={`/student/course/${courseId}/module/${mod.id}`} className="absolute inset-0" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Navigation Workspace */}
            <main className="flex-1 flex flex-col h-full relative bg-gray-50/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {(() => {
                        const totalModules = modules.length;
                        const completedModules = modules.filter(m => progress[m.id] === 'completed').length;
                        const isGraduated = totalModules > 0 && completedModules === totalModules;

                        if (isGraduated) {
                            return (
                                <div className="text-center max-w-lg p-16 bg-black text-white shadow-2xl relative overflow-hidden group">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute -top-10 -right-10 text-primary/20 pointer-events-none"
                                    >
                                        <Trophy size={200} />
                                    </motion.div>

                                    <div className="relative z-10 space-y-8">
                                        <div className="w-20 h-20 bg-primary mx-auto flex items-center justify-center text-white shadow-xl shadow-primary/40 rounded-full mb-8">
                                            <Award size={40} />
                                        </div>

                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] block">Legacy Achieved</span>
                                            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">
                                                Graduation Ready
                                            </h2>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                                All curriculum nodes synchronized. Your final artefact has been validated by the board.
                                            </p>
                                        </div>

                                        <Link
                                            to={`/student/course/${courseId}/completion`}
                                            className="w-full bg-primary text-white py-5 px-10 rounded-sm font-black text-[12px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                                        >
                                            Claim Your Credentials <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="text-center max-w-lg p-12 bg-white border border-gray-100 shadow-2xl relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rounded-sm">
                                    <Layout size={40} />
                                </div>
                                <div className="mt-12 space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">
                                            {modules.length === 0 ? "Under Construction" : "Sequence Initiated"}
                                        </span>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                                            {modules.length === 0 ? "No Curriculum Logic Found" : "Select a Curriculum Node"}
                                        </h2>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic border-l-2 border-primary/20 pl-6 mx-auto max-w-sm">
                                        {modules.length === 0
                                            ? "Architecture for this learning path is still being deployed by engineers. Check back shortly."
                                            : "Choose a learning week to access video streams, technical documents, and assessment portals."
                                        }
                                    </p>
                                    <div className="pt-4 flex items-center justify-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${modules.length === 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {modules.length === 0 ? "Awaiting Core Deployment" : "Awaiting Direct Link Interaction"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Visual Watermark Wrapper */}
                <div className="absolute bottom-8 right-8 pointer-events-none opacity-5 group">
                    <span className="text-6xl font-black uppercase italic tracking-tighter">Core Connect</span>
                </div>
            </main>

        </div>
    );
}
