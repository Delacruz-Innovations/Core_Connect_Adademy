import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    ArrowLeft, CheckCircle, AlertTriangle,
    PlayCircle, FileText, Globe, Eye,
    Shield, Layers, Video, Lock, Unlock,
    ChevronRight, Loader2, Share2, Award, Info,
    CheckCircle2, Download, MessageSquare, BookOpen, Clock, Activity,
    Check, Sparkles, Star, X, ChevronLeft, FileDown,
    Send, MessageCircle, HelpCircle, ClipboardCheck
} from 'lucide-react';
import SecureVideoPlayer from '../../components/SecureVideoPlayer';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { usePersistentQuery } from '../../hooks/usePersistentQuery';
import { useMediaCache } from '../../hooks/useMediaCache';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCompletionModal from '../../components/CourseCompletionModal';
import ModuleCompletionModal from '../../components/ModuleCompletionModal';

export default function LessonPlayerPage() {
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notifySyncFailure } = useConnectivity();
    const { cacheAsset } = useMediaCache();

    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('content');
    const [expandedModules, setExpandedModules] = useState({});
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);
    const [showAutoAdvance, setShowAutoAdvance] = useState(false);
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // AI States
    const [aiMessages, setAiMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI curriculum assistant. How can I help you understand this lesson better?" }
    ]);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const chatEndRef = useRef(null);

    // --- 1. Course Structure Query (Persists across lessons) ---
    const fetchCourseStructure = useCallback(async (signal) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: fetchedCourse, error: courseError } = await supabase
            .from('courses')
            .select(`*, modules:modules(*, lessons:lessons(id, title, description, thumbnail_url, is_published, video_path, mux_playback_id, module_id, order_index, duration_seconds), assignments:assignments(*))`)
            .eq('id', courseId)
            .order('week_number', { foreignTable: 'modules', ascending: true })
            .order('order_index', { foreignTable: 'modules.lessons', ascending: true })
            .abortSignal(signal)
            .single();

        if (courseError) throw courseError;

        // Hierarchical Filter: Remove Draft Modules and Lessons
        fetchedCourse.modules = (fetchedCourse.modules || [])
            .filter(m => m.is_published === true)
            .map(m => ({
                ...m,
                lessons: (m.lessons || []).filter(l => l.is_published === true)
            }));

        const [modProgRes, lessProgRes] = await Promise.all([
            supabase.from('module_progress').select('*').eq('user_id', user.id).eq('course_id', courseId).abortSignal(signal),
            supabase.from('lesson_progress').select('*').eq('user_id', user.id).eq('course_id', courseId).abortSignal(signal)
        ]);

        const modProgress = {};
        modProgRes.data?.forEach(p => modProgress[p.module_id] = p);

        const lessProgress = {};
        lessProgRes.data?.forEach(p => lessProgress[p.lesson_id] = p);

        const { data: allSubmissions } = await supabase.from('assignment_submissions')
            .select('assignment_id, reviewed_status')
            .eq('user_id', user.id)
            .abortSignal(signal);

        const subIds = new Set(allSubmissions?.filter(s => s.reviewed_status !== 'blocked').map(s => s.assignment_id) || []);
        const allSubsMap = new Map(allSubmissions?.map(s => [s.assignment_id, s.reviewed_status]) || []);

        return {
            course: fetchedCourse,
            moduleProgress: modProgress,
            lessonProgress: lessProgress,
            allSubIds: Array.from(subIds),
            allSubsMap: Array.from(allSubsMap.entries())
        };
    }, [courseId]);

    const { data: courseData, loading: courseLoading, revalidate: revalidateCourse, setDataAndCache: updateLocalCourse } = usePersistentQuery(
        `cc_course_structure_${courseId}`,
        fetchCourseStructure,
        [courseId]
    );

    // --- 2. Lesson Specific Query (Refreshes on navigation) ---
    const fetchLessonSpecifics = useCallback(async (signal) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const [resRes, assignRes, qaRes, lessProgRes, feedbackRes] = await Promise.all([
            supabase.from('resources').select('*')
                .or(`parent_id.eq.${lessonId},parent_id.eq.${moduleId}`)
                .eq('visibility_status', 'published')
                .abortSignal(signal),
            supabase.from('assignments').select('*').eq('lesson_id', lessonId).abortSignal(signal).maybeSingle(),
            supabase.from('lesson_questions').select('*, profiles!student_id(full_name)')
                .eq('lesson_id', lessonId)
                .order('created_at', { ascending: false })
                .abortSignal(signal),
            supabase.from('lesson_progress').select('*')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .abortSignal(signal)
                .maybeSingle(),
            supabase.from('lesson_feedback').select('*')
                .eq('student_id', user.id)
                .eq('lesson_id', lessonId)
                .abortSignal(signal)
                .maybeSingle()
        ]);

        const submissionRes = assignRes.data ? await supabase.from('assignment_submissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('assignment_id', assignRes.data.id)
            .abortSignal(signal)
            .maybeSingle() : { data: null };

        return {
            currentLessonProgress: lessProgRes.data,
            lessonAssignment: assignRes.data,
            assignmentSubmission: submissionRes.data,
            lessonResources: resRes.data?.filter(r => r.parent_id === lessonId) || [],
            moduleResources: resRes.data?.filter(r => r.parent_id === moduleId) || [],
            questions: qaRes.data || [],
            existingFeedback: feedbackRes.data
        };
    }, [lessonId, moduleId]);

    const { data: lessonData, loading: lessonLoading, revalidate: revalidateLesson } = usePersistentQuery(
        `cc_lesson_details_${lessonId}`,
        fetchLessonSpecifics,
        [lessonId, moduleId]
    );

    // Derived values
    const course = courseData?.course || null;
    const moduleProgress = courseData?.moduleProgress || {};
    const globalLessonProgress = courseData?.lessonProgress || {};
    const allSubIds = new Set(Array.isArray(courseData?.allSubIds) ? courseData.allSubIds : []);
    const allSubsMap = new Map(Array.isArray(courseData?.allSubsMap) ? courseData.allSubsMap : []);

    const lessonResources = lessonData?.lessonResources || [];
    const moduleResources = lessonData?.moduleResources || [];
    const questions = lessonData?.questions || [];
    const lessonAssignment = lessonData?.lessonAssignment || null;
    const assignmentSubmission = lessonData?.assignmentSubmission || null;
    const savedPosition = lessonData?.currentLessonProgress?.watched_seconds || 0;
    const existingFeedback = lessonData?.existingFeedback || null;

    const currentLesson = course?.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === lessonId);

    // Track which modules are expanded
    useEffect(() => {
        if (moduleId) {
            setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
        }
    }, [moduleId]);

    // Progress Calculations
    const totalLessons = course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    const completedCount = Object.values(globalLessonProgress).filter(p => p.is_completed).length;
    const courseProgressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Check for course completion
    useEffect(() => {
        if (courseProgressPercent === 100 && !courseLoading && !showCompletionModal) {
            const seenKey = `seen_completion_${courseId}`;
            const hasSeenModal = sessionStorage.getItem(seenKey);

            if (!hasSeenModal) {
                setShowCompletionModal(true);
                sessionStorage.setItem(seenKey, 'true');
            }
        }
    }, [courseProgressPercent, courseLoading, courseId]);

    const revalidate = useCallback((background = true) => {
        revalidateCourse(background);
        revalidateLesson(background);
    }, [revalidateCourse, revalidateLesson]);

    // Feedback States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);
    const [showSuccessSparkle, setShowSuccessSparkle] = useState(false);

    useEffect(() => {
        if (existingFeedback) {
            setRating(existingFeedback.rating);
            setFeedbackComment(existingFeedback.comment || '');
        } else {
            setRating(0);
            setFeedbackComment('');
        }
    }, [existingFeedback]);

    const handleSaveFeedback = async () => {
        if (rating === 0) return;
        setIsSavingFeedback(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('lesson_feedback').upsert({
                lesson_id: lessonId,
                student_id: user.id, // Fixed: use student_id to match migration
                rating,
                comment: feedbackComment,
                updated_at: new Date().toISOString()
            }, { onConflict: 'lesson_id,student_id' });

            if (error) throw error;

            setShowSuccessSparkle(true);
            setTimeout(() => setShowSuccessSparkle(false), 3000);
            revalidate(true);
        } catch (err) {
            console.error('Feedback error:', err);
            alert('Rating transmission failed.');
        } finally {
            setIsSavingFeedback(false);
        }
    };

    const [newQuestion, setNewQuestion] = useState('');
    const [postingQuestion, setPostingQuestion] = useState(false);
    const [aiInput, setAiInput] = useState('');

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (sidebarTab === 'ai') {
            scrollToBottom();
        }
    }, [aiMessages, sidebarTab]);

    const handleAiChat = async (e) => {
        e.preventDefault();
        if (!aiInput.trim() || isAiTyping) return;

        const userMsg = { role: 'user', content: aiInput };
        setAiMessages(prev => [...prev, userMsg]);
        const questionText = aiInput;
        setAiInput('');
        setIsAiTyping(true);

        try {
            const { data, error } = await supabase.functions.invoke('ai-tutor', {
                body: {
                    question: questionText,
                    courseId: courseId,
                    lessonId: lessonId
                }
            });

            if (error) throw error;
            setAiMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err) {
            console.error('AI Error:', err);
            setAiMessages(prev => [...prev, { role: 'assistant', content: "My cognitive links are saturated. Please standby for manual sync." }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLessonClick = (module, lesson) => {
        if (window.innerWidth < 1024) setSidebarOpen(false);
        navigate(`/student/course/${courseId}/module/${module.id}/lesson/${lesson.id}`);
    };

    // Auto-Advance Logic
    useEffect(() => {
        let interval;
        if (showAutoAdvance && autoAdvanceCountdown > 0) {
            interval = setInterval(() => {
                setAutoAdvanceCountdown((prev) => prev - 1);
            }, 1000);
        } else if (showAutoAdvance && autoAdvanceCountdown === 0) {
            const next = findNextLesson(true);
            if (next) {
                const nextModule = course.modules.find(m => m.lessons.some(l => l.id === next.id));
                navigate(`/student/course/${courseId}/module/${nextModule.id}/lesson/${next.id}`);
            }
            setShowAutoAdvance(false);
        }
        return () => clearInterval(interval);
    }, [showAutoAdvance, autoAdvanceCountdown, course, courseId, navigate]); // Added dependencies

    const findPrevLesson = () => {
        if (!course || !currentLesson) return null;
        const allLessons = course.modules.flatMap(m => m.lessons || []);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex > 0) return allLessons[currentIndex - 1];
        return null;
    };

    const findNextLesson = (skipCompleted = false) => {
        if (!course || !currentLesson) return null;
        const allLessons = course.modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex === -1) return null;

        for (let i = currentIndex + 1; i < allLessons.length; i++) {
            const candidate = allLessons[i];
            const candidateModule = course.modules.find(m => m.lessons.some(l => l.id === candidate.id));
            const isModAccessible = (() => {
                const modIdx = course.modules.findIndex(m => m.id === candidateModule.id);
                if (modIdx === 0) return true;

                const prevMod = course.modules[modIdx - 1];
                // Unlock depends ONLY on lesson completion now
                const lessonsCompleted = prevMod.lessons?.length > 0 && prevMod.lessons.every(l => globalLessonProgress[l.id]?.is_completed);

                return lessonsCompleted;
            })();

            if (!isModAccessible) break;
            if (skipCompleted && globalLessonProgress[candidate.id]?.is_completed) continue;
            return candidate;
        }
        return null;
    };

    const handleVideoEnded = () => {
        const next = findNextLesson(true);

        // 1. Identify current module completion
        const currentMod = course.modules.find(m => m.id === moduleId);
        const allLessonsInMod = currentMod?.lessons || [];
        const isLastLessonOfModule = allLessonsInMod[allLessonsInMod.length - 1]?.id === currentLesson.id;

        if (isLastLessonOfModule) {
            // Check if there are assignments that haven't been submitted yet
            const pendingAssignments = currentMod.assignments?.filter(a => !allSubIds.has(a.id)) || [];

            if (pendingAssignments.length > 0) {
                setShowCompletionModal(true);
            } else if (next) {
                // If no pending assignments, auto-advance to next module
                setShowAutoAdvance(true);
                setAutoAdvanceCountdown(5);
            }
            return;
        }

        if (next) {
            setShowAutoAdvance(true);
            setAutoAdvanceCountdown(5);
        }
    };

    const cancelAutoAdvance = () => {
        setShowAutoAdvance(false);
        setAutoAdvanceCountdown(null);
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
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

    const handleLessonProgress = useCallback((update) => {
        if (!courseData) return;

        // Immediate Local UI Update (Optimistic)
        const newLessonProgress = {
            ...courseData.lessonProgress,
            [update.lessonId]: {
                ...courseData.lessonProgress[update.lessonId],
                percent_watched: update.percent_watched,
                is_completed: update.is_completed || courseData.lessonProgress[update.lessonId]?.is_completed
            }
        };

        updateLocalCourse({
            ...courseData,
            lessonProgress: newLessonProgress
        });
    }, [courseData, updateLocalCourse]);

    const handlePostQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        setPostingQuestion(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('lesson_questions').insert({
                lesson_id: lessonId,
                student_id: user.id,
                content: newQuestion.trim()
            });

            if (error) throw error;

            setNewQuestion('');
            revalidate(true); // Refresh Q&A list from server/cache
        } catch (err) {
            console.error('Question post error:', err);
        } finally {
            setPostingQuestion(false);
        }
    };

    const handleAssignmentUpload = async (file, assignmentOverride = null) => {
        const targetAssignment = assignmentOverride || lessonAssignment;
        if (!file || !targetAssignment) return;

        setSubmittingAssignment(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${targetAssignment.id}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('assignment-submissions')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data, error } = await supabase.from('assignment_submissions').upsert({
                assignment_id: targetAssignment.id,
                user_id: user.id,
                file_path: filePath,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,assignment_id' }).select().single();

            if (error) throw error;
            revalidate(true); // Refresh data node
            alert('Assignment submitted successfully protocol initiated.');
            setShowCompletionModal(false); // Close if open
        } catch (err) {
            console.error('Submission error:', err);
            alert('Execution failed: ' + err.message);
        } finally {
            setSubmittingAssignment(false);
        }
    };

    // Initial Full-Page Loading State
    if (courseLoading && !course) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <Loader2 className="text-primary animate-spin" size={48} />
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Initializing Stream...</div>
        </div>
    );

    if (!course) return (
        <div className="p-20 text-center uppercase font-black text-gray-400 tracking-widest italic">
            Session Link Broken. Redirecting...
        </div>
    );

    if (!currentLesson && !courseLoading) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <div className="p-20 text-center uppercase font-black text-gray-400 tracking-widest italic">
                Unit Protocol Not Found or Restricted.
            </div>
            <Link to="/student" className="px-8 py-3 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all">
                Return to Registry
            </Link>
        </div>
    );



    return (
        <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">

            {/* Dark Header */}
            <header className="h-[56px] bg-[#1c1d1f] shrink-0 flex items-center justify-between px-2 md:px-4 z-50 text-white border-b border-gray-700">
                <div className="flex items-center gap-2 md:gap-4 h-full">
                    <Link to="/student" className="flex items-center border-r border-gray-700 pr-2 md:pr-4 h-full">
                        <img src="/logo.png" alt="Logo" className="h-6 md:h-8 invert opacity-90 hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="hidden sm:block overflow-hidden max-w-[150px] md:max-w-xs">
                        <h1 className="text-xs font-bold truncate opacity-90">{course.title}</h1>
                    </div>
                </div>

                {/* Global Progress Ring */}
                <div className="hidden md:flex items-center gap-3 mr-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                        <p className="text-xs font-black text-primary">{courseProgressPercent}%</p>
                    </div>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-primary transition-all duration-1000 ease-out" strokeDasharray={`${courseProgressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        {courseProgressPercent === 100 && <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />}
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <button
                        disabled={!findPrevLesson()}
                        onClick={() => {
                            const prev = findPrevLesson();
                            if (prev) {
                                const mod = course.modules.find(m => m.lessons.some(l => l.id === prev.id));
                                navigate(`/student/course/${courseId}/module/${mod.id}/lesson/${prev.id}`);
                            }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Back</span>
                    </button>

                    <button
                        disabled={!findNextLesson()}
                        onClick={() => {
                            const next = findNextLesson();
                            if (next) {
                                const mod = course.modules.find(m => m.lessons.some(l => l.id === next.id));
                                navigate(`/student/course/${courseId}/module/${mod.id}/lesson/${next.id}`);
                            }
                        }}
                        className="flex items-center gap-1 px-4 py-1.5 bg-white text-black hover:bg-primary hover:text-white transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Next</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-4 h-full">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`lg:hidden flex items-center gap-2 px-3 py-1.5 transition-all text-[10px] font-black uppercase tracking-widest rounded-sm ${sidebarOpen ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        <Layers size={14} />
                        <span className="hidden xs:inline">Content</span>
                    </button>
                    <button className="p-2 hover:bg-gray-800 transition-all rounded-sm border border-gray-600">
                        <Share2 size={16} />
                    </button>
                </div>
            </header>

            {/* Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Left Area */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-white scrollbar-hide">
                    {/* Video Area */}
                    <div className="bg-black aspect-video shrink-0 relative group flex items-center justify-center overflow-hidden">
                        <div className="w-full max-w-[1280px] aspect-video relative">
                            {lessonLoading && !lessonData && (
                                <div className="absolute inset-0 z-50 bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="text-primary animate-spin" size={32} />
                                    <div className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Loading Lesson Protocol</div>
                                </div>
                            )}

                            {currentLesson?.video_path ? (
                                <SecureVideoPlayer
                                    key={lessonId}
                                    lessonId={currentLesson.id}
                                    lessonTitle={currentLesson.title}
                                    courseId={courseId}
                                    moduleId={moduleId}
                                    courseTitle={course?.title}
                                    studentId={user?.id}
                                    videoPath={currentLesson.video_path}
                                    muxPlaybackId={currentLesson.mux_playback_id}
                                    initialTime={savedPosition}
                                    onProgressUpdate={handleLessonProgress}
                                    onEnded={handleVideoEnded}
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center gap-6">
                                    <Video size={40} className="text-white/20" />
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">No Stream Protocol (Mux/S3 Missing)</span>
                                </div>
                            )}

                            {showAutoAdvance && (
                                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-50">
                                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 animate-pulse">Up Next</p>
                                    <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-10 text-center">{findNextLesson(true)?.title}</h3>
                                    <div className="flex items-center gap-8">
                                        <button onClick={() => setAutoAdvanceCountdown(0)} className="bg-white text-black px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-3">
                                            <PlayCircle size={18} /> Play Now ({autoAdvanceCountdown}s)
                                        </button>
                                        <button onClick={cancelAutoAdvance} className="text-white/30 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest">Stay Here</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Area */}
                    <div className="w-full max-w-6xl mx-auto py-4">
                        <div className="flex border-b border-gray-200 px-4 md:px-8 gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'resources', label: `Resources (${lessonResources.length + moduleResources.length})` },
                                { id: 'assignments', label: 'Assignment' },
                                { id: 'qa', label: `Q&A (${questions.length})` },
                                { id: 'review', label: 'Review & Feedback' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 text-[11px] md:text-[13px] font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="px-4 md:px-8 py-6 md:py-8 min-h-[400px] relative">
                            {lessonLoading && !lessonData && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <Loader2 className="text-primary animate-spin" size={24} />
                                </div>
                            )}
                            {activeTab === 'overview' && (
                                <div className="max-w-4xl space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-primary" />
                                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">{currentLesson?.title || 'Unit Not Found'}</h2>
                                        </div>
                                        <div className="prose prose-sm max-w-none text-gray-700 font-medium italic border-l-2 border-primary/10 pl-6 py-2">
                                            <p>{currentLesson?.description || "No description provided for this learning unit."}</p>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-gray-100 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-900 text-white rounded-sm">
                                                <Info size={16} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Course Context</h3>
                                        </div>
                                        <div className="bg-gray-50 p-8 rounded-sm space-y-4">
                                            <h4 className="text-lg font-black italic uppercase tracking-tighter text-gray-800">{course.title}</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{course.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 max-w-5xl">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <FileText size={20} className="text-primary" />
                                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900">Lesson Specific Assets</h2>
                                        </div>

                                        {(lessonResources.length === 0) ? (
                                            <div className="p-10 border-2 border-dashed border-gray-100 rounded-lg text-center font-bold text-gray-300 uppercase tracking-widest text-[9px]">
                                                No unit-specific protocols attached.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {lessonResources.map(res => (
                                                    <div key={res.id} className="group flex items-center justify-between p-6 bg-white border border-gray-100 hover:border-primary/30 transition-all rounded-sm shadow-sm">
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-black uppercase tracking-tight text-gray-900 truncate">{res.title}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{res.resource_type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownload(res.file_path, res.title)}
                                                            className="p-3 bg-gray-50 hover:bg-black hover:text-white transition-all text-gray-400"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {moduleResources.length > 0 && (
                                        <div className="space-y-8 pt-12 border-t border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <Layers size={20} className="text-gray-400" />
                                                <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900">Module Wide Resources</h2>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {moduleResources.map(res => (
                                                    <div key={res.id} className="group flex items-center justify-between p-6 bg-gray-50/50 border border-gray-100 hover:border-black/10 transition-all rounded-sm">
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className="p-3 bg-white text-gray-300 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-black uppercase tracking-tight text-gray-900 truncate">{res.title}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Module Asset • {res.resource_type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDownload(res.file_path, res.title)}
                                                            className="p-3 bg-white hover:bg-black hover:text-white transition-all text-gray-400 shadow-sm"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'assignments' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 max-w-4xl">
                                    <div className="flex items-center gap-4">
                                        <ClipboardCheck size={20} className="text-primary" />
                                        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900">Lesson Assignment</h2>
                                    </div>

                                    {!lessonAssignment ? (
                                        <div className="p-16 border-2 border-dashed border-gray-100 rounded-lg text-center font-bold text-gray-300 uppercase tracking-widest text-[10px]">
                                            No assignment protocol detected for this unit.
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-100 p-10 space-y-8 shadow-sm">
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">{lessonAssignment.title}</h3>
                                                <p className="text-sm font-medium text-gray-500 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                                    {lessonAssignment.brief}
                                                </p>
                                            </div>

                                            <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                                {assignmentSubmission ? (
                                                    <div className="flex flex-col gap-4 w-full">
                                                        <div className="flex items-center justify-between bg-green-50/50 border border-green-100 p-6 rounded-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-white text-green-500 shadow-sm">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Submission Verified</p>
                                                                    <p className="text-[9px] font-bold text-green-400 uppercase tracking-tighter">Cipher: {assignmentSubmission.id?.slice(0, 8)}</p>
                                                                </div>
                                                            </div>
                                                            {assignmentSubmission.grade_score !== null && (
                                                                <div className="text-right">
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Grade Protocol</p>
                                                                    <p className="text-2xl font-black text-gray-900 italic">{assignmentSubmission.grade_score}%</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {assignmentSubmission.admin_feedback && (
                                                            <div className="bg-gray-900 text-white p-6 rounded-sm space-y-3 relative overflow-hidden group">
                                                                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                                                    <HelpCircle size={80} />
                                                                </div>
                                                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Curator Feedback</p>
                                                                <p className="text-sm font-medium italic text-gray-400 leading-relaxed relative z-10">{assignmentSubmission.admin_feedback}</p>
                                                            </div>
                                                        )}
                                                        <label className="cursor-pointer text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all underline decoration-gray-100 underline-offset-4">
                                                            Replace Submission Node
                                                            <input type="file" className="hidden" onChange={handleAssignmentUpload} disabled={submittingAssignment} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col w-full gap-6">
                                                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Requirement Protocol</p>
                                                            <p className="text-[11px] font-bold text-gray-500 italic">Submission of this unit assignment is mandatory for subsequent milestone unlock.</p>
                                                        </div>
                                                        <label className={`w-full md:w-auto px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 cursor-pointer ${submittingAssignment ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                                                            <FileDown size={16} /> {submittingAssignment ? 'Processing Cipher...' : 'Upload Submission Asset'}
                                                            <input type="file" className="hidden" onChange={(e) => handleAssignmentUpload(e.target.files[0])} disabled={submittingAssignment} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'qa' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 max-w-4xl">
                                    <div className="flex items-center gap-4">
                                        <MessageCircle size={20} className="text-primary" />
                                        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900">Pedagogical Inquiries</h2>
                                    </div>

                                    <form onSubmit={handlePostQuestion} className="space-y-4">
                                        <textarea
                                            value={newQuestion}
                                            onChange={(e) => setNewQuestion(e.target.value)}
                                            placeholder="POST A QUERY TO THE CURATORS..."
                                            className="w-full bg-gray-50 border-2 border-gray-100 p-6 text-sm font-medium focus:outline-none focus:border-black focus:bg-white transition-all min-h-[120px] resize-none"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                disabled={postingQuestion || !newQuestion.trim()}
                                                className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-30 flex items-center gap-3"
                                            >
                                                {postingQuestion ? 'Syncing...' : 'Transmit Query'} <Send size={14} />
                                            </button>
                                        </div>
                                    </form>

                                    <div className="space-y-6 pt-10 border-t border-gray-100">
                                        {questions.length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">No inquiries registered in this node namespace.</p>
                                            </div>
                                        ) : (
                                            questions.map(q => (
                                                <div key={q.id} className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                            {q.profiles?.full_name?.[0]}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{q.profiles?.full_name}</span>
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-[13px] font-medium text-gray-600 leading-relaxed italic">{q.content}</p>
                                                        </div>
                                                    </div>
                                                    {q.admin_response && (
                                                        <div className="ml-12 p-6 bg-gray-50 border-l-4 border-primary space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <Sparkles size={12} className="text-primary" />
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Curator Response</span>
                                                            </div>
                                                            <p className="text-[13px] font-medium text-gray-700 leading-relaxed">{q.admin_response}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'review' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 max-w-4xl">
                                    {!existingFeedback ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <Star size={20} className="text-secondary fill-secondary" />
                                                <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900">Lesson Review</h2>
                                            </div>
                                            <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-sm space-y-8">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Your Proficiency Rating</p>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <button
                                                                key={s}
                                                                onMouseEnter={() => setHoverRating(s)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                onClick={() => setRating(s)}
                                                                className="transition-transform hover:scale-125 duration-200"
                                                            >
                                                                <Star
                                                                    size={32}
                                                                    className={`transition-colors ${s <= (hoverRating || rating)
                                                                        ? 'fill-secondary text-secondary'
                                                                        : 'text-gray-200'
                                                                        }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Qualitative Feedback</p>
                                                    <textarea
                                                        value={feedbackComment}
                                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                                        placeholder="SHARE YOUR THOUGHTS ON THIS LESSON..."
                                                        className="w-full bg-white border border-gray-100 p-6 text-sm font-medium focus:outline-none focus:border-black transition-all min-h-[150px] resize-none shadow-sm"
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleSaveFeedback}
                                                        disabled={isSavingFeedback || rating === 0}
                                                        className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-30 flex items-center gap-3 shadow-xl shadow-black/10"
                                                    >
                                                        {isSavingFeedback ? 'Syncing...' : 'Submit Protocol'} <Send size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            <div className="p-10 bg-gray-900 text-white rounded-sm space-y-6 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                                    <Sparkles size={120} />
                                                </div>
                                                <div className="relative z-10 space-y-2">
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Thank you for your review!</h3>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your contribution has been logged in the curriculum archives.</p>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                                                    <div className="space-y-4">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    size={18}
                                                                    className={s <= existingFeedback.rating ? 'fill-primary text-primary' : 'text-white/10'}
                                                                />
                                                            ))}
                                                        </div>
                                                        {existingFeedback.comment && (
                                                            <div className="bg-white/5 p-6 border-l-2 border-primary">
                                                                <p className="text-[13px] font-medium italic text-gray-300 leading-relaxed">"{existingFeedback.comment}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-primary">
                                                            {showSuccessSparkle ? <motion.div animate={{ rotate: 360 }} duration={0.5}><Sparkles size={24} /></motion.div> : <CheckCircle2 size={24} />}
                                                        </div>
                                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Verified Submission</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 border-2 border-dashed border-gray-100 rounded-lg flex items-center gap-6 relative overflow-hidden">
                                                {showSuccessSparkle && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                    >
                                                        <Sparkles className="text-secondary opacity-20" size={100} />
                                                    </motion.div>
                                                )}
                                                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center relative z-10">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1 flex items-center gap-2">
                                                        Protocol Secured {showSuccessSparkle && <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.5 }}><Sparkles size={12} /></motion.span>}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">One submission allowed per learning unit. Transmission finalized.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className={`fixed inset-0 lg:relative lg:inset-auto z-40 bg-white flex flex-col transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} w-full lg:w-[350px] xl:w-[400px] border-l border-gray-200 shrink-0`}>
                    <div className="flex border-b border-gray-200 h-[48px] shrink-0">
                        <button onClick={() => setSidebarTab('content')} className={`flex-1 text-[11px] font-black uppercase tracking-widest ${sidebarTab === 'content' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}>Course content</button>
                        <button onClick={() => setSidebarTab('ai')} className={`flex-1 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${sidebarTab === 'ai' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}>
                            <Sparkles size={14} className="text-[#a435f0]" /> AI Assistant
                        </button>
                        <button onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className="p-4 lg:hidden text-gray-400"><X size={16} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 flex flex-col">
                        {sidebarTab === 'content' ? (
                            <div className="flex-1">
                                {(() => {
                                    let chainBroken = false;
                                    return course.modules?.map((mod, mIdx) => {
                                        const isFirstModule = mIdx === 0;

                                        // Strict Completion Check: Lessons ONLY (Assignments are optional for unlock)
                                        const isCurrentModuleCompleted = mod.lessons?.length > 0 && mod.lessons.every(l => globalLessonProgress[l.id]?.is_completed);

                                        // Strict Unlock Logic: First module is always open; others only if the chain is unbroken
                                        const isUnlocked = isFirstModule || !chainBroken;

                                        // If this module isn't finished, the chain is broken for all following modules
                                        const currentChainState = chainBroken; // Capture for this iteration
                                        if (!isCurrentModuleCompleted) {
                                            chainBroken = true;
                                        }

                                        const isLocked = !isUnlocked;

                                        return (
                                            <div key={mod.id} className="border-b border-gray-200 bg-white">
                                                <button
                                                    onClick={() => !isLocked && toggleModule(mod.id)}
                                                    className={`w-full flex items-center justify-between p-4 border-b border-gray-100 group transition-all ${isLocked ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'bg-[#f7f9fa] hover:bg-gray-100'}`}
                                                >
                                                    <div className="flex-1 text-left min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className={`font-bold text-[12px] uppercase tracking-tight line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                                                Section {mod.week_number || mIdx + 1}: {mod.title}
                                                            </h3>
                                                            {isLocked && (
                                                                <Lock size={10} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                                            <span>{mod.lessons?.length || 0} units</span>
                                                            <span>•</span>
                                                            <span>{Math.floor((mod.lessons?.reduce((acc, l) => acc + (l.duration_seconds || 0), 0) || 0) / 60)}m total</span>
                                                        </div>

                                                        {/* Module Progress Bar */}
                                                        <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500"
                                                                style={{
                                                                    width: `${(mod.lessons?.filter(l => globalLessonProgress[l.id]?.is_completed).length / (mod.lessons?.length || 1)) * 100
                                                                        }%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className={`shrink-0 transition-transform ${expandedModules[mod.id] ? 'rotate-[-90deg]' : 'rotate-90 text-gray-400'}`} />
                                                </button>

                                                {expandedModules[mod.id] && (
                                                    <div className="bg-white">
                                                        {mod.lessons?.map((lesson, lIdx) => {
                                                            const isCompleted = globalLessonProgress[lesson.id]?.is_completed;

                                                            // Sequential lesson lock within the same module
                                                            const isSequentialLocked = lIdx > 0 && !globalLessonProgress[mod.lessons[lIdx - 1].id]?.is_completed;

                                                            // Final lock state for this lesson
                                                            const isLessonLocked = isLocked || isSequentialLocked;

                                                            return (
                                                                <button
                                                                    key={lesson.id}
                                                                    onClick={() => !isLessonLocked && handleLessonClick(mod, lesson)}
                                                                    className={`w-full flex items-start p-4 pr-10 text-left relative ${currentLesson?.id === lesson.id ? 'bg-[#e4e8eb]' : 'hover:bg-[#f7f9fa]'} ${isLessonLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <div className="pt-1 mr-3 shrink-0">
                                                                        <div className={`w-4 h-4 border ${isCompleted ? 'bg-primary border-primary' : currentLesson?.id === lesson.id ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                                                                            {isCompleted ? <Check size={10} strokeWidth={4} className="text-white" /> : isLessonLocked ? <Lock size={8} className="text-gray-400" /> : null}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-[12px] leading-tight mb-2 uppercase tracking-tight ${currentLesson?.id === lesson.id ? 'text-primary' : 'text-gray-900'}`}>{lIdx + 1}. {lesson.title}</p>
                                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                                            <PlayCircle size={10} />
                                                                            <span>{Math.floor((lesson.duration_seconds || 0) / 60)}m</span>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                })()}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col bg-white">
                                <div className="p-6 bg-[#f7f9fa] border-b border-gray-100 italic">
                                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-tighter">
                                        Ask me anything about <span className="text-primary font-black">"{currentLesson?.title || 'this lesson'}"</span> or the course curriculum.
                                    </p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                                    {aiMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 text-[12px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 p-4 rounded-sm animate-pulse">
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="p-4 border-t border-gray-200">
                                    <form onSubmit={handleAiChat} className="relative">
                                        <input
                                            type="text"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            placeholder="Ask the curator..."
                                            className="w-full bg-[#f3f4f6] p-4 pr-12 text-[12px] font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all border border-transparent focus:border-gray-200"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!aiInput.trim() || isAiTyping}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-black transition-colors disabled:opacity-30"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            {/* Module Completion Modal */}
            <ModuleCompletionModal
                isOpen={showCompletionModal && courseProgressPercent < 100}
                onClose={() => setShowCompletionModal(false)}
                moduleTitle={course.modules.find(m => m.id === moduleId)?.title}
                moduleNumber={course.modules.findIndex(m => m.id === moduleId) + 1}
                assignments={course.modules.find(m => m.id === moduleId)?.assignments}
                onSubmitAssignment={(assignment, file) => handleAssignmentUpload(file, assignment)}
                submitting={submittingAssignment}
                onContinue={() => {
                    const next = findNextLesson(false);
                    if (next) {
                        const mod = course.modules.find(m => m.lessons.some(l => l.id === next.id));
                        navigate(`/student/course/${courseId}/module/${mod.id}/lesson/${next.id}`);
                    }
                    setShowCompletionModal(false);
                }}
            />

            {/* Completion Ritual */}
            <CourseCompletionModal
                isOpen={showCompletionModal && courseProgressPercent === 100}
                onClose={() => setShowCompletionModal(false)}
                courseTitle={course?.title}
                studentName={user?.user_metadata?.full_name || user?.email}
                completionDate={new Date().toLocaleDateString()}
            />
        </div>
    );
}
