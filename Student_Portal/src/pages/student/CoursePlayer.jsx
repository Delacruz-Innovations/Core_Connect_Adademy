import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    PlayCircle, FileText, Video, Lock, Unlock,
    ChevronRight, Loader2, Share2, Award,
    CheckCircle2, Download, MessageSquare, BookOpen, Clock, Activity, ArrowLeft,
    Check
} from 'lucide-react';

export default function CoursePlayer() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [signedUrl, setSignedUrl] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        fetchCourseAndLessonData();
    }, [courseId, lessonId]);

    const fetchCourseAndLessonData = async () => {
        try {
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select(`*, modules:modules(*, lessons:lessons(*))`)
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            const sortedModules = (courseData.modules || []).sort((a, b) => a.week_number - b.week_number).map(mod => ({
                ...mod,
                lessons: (mod.lessons || []).sort((a, b) => a.order_index - b.order_index)
            }));

            setCourse({ ...courseData, modules: sortedModules });

            let targetLesson = null;
            if (lessonId) {
                targetLesson = sortedModules.flatMap(m => m.lessons).find(l => l.id === lessonId);
            } else {
                targetLesson = sortedModules[0]?.lessons?.[0];
            }

            if (targetLesson) {
                setCurrentLesson(targetLesson);
                const parentModule = sortedModules.find(m => m.lessons.some(l => l.id === targetLesson.id));
                if (parentModule) {
                    setExpandedModules(prev => ({ ...prev, [parentModule.id]: true }));
                }

                if (targetLesson.video_path) {
                    const { data: signData, error: signError } = await supabase.storage
                        .from('lesson-videos')
                        .createSignedUrl(targetLesson.video_path, 3600);
                    if (!signError) setSignedUrl(signData.signedUrl);
                }

                const { data: lessonDocs } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('parent_id', targetLesson.id);

                setCurrentLesson(prev => ({ ...prev, documents: lessonDocs || [] }));
            }

            if (Object.keys(expandedModules).length === 0 && sortedModules[0]) {
                setExpandedModules({ [sortedModules[0].id]: true });
            }

        } catch (err) {
            console.error('Error in CoursePlayer:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lesson) => {
        navigate(`/student/course/${courseId}/lesson/${lesson.id}`);
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
            <Loader2 className="text-primary animate-spin" size={48} />
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Loading Course Player...</div>
        </div>
    );

    if (!course) return <div className="p-20 text-center">Course not found.</div>;

    return (
        <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">

            {/* Premium Header */}
            <header className="h-16 bg-white border-b border-gray-100 shrink-0 flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/student" className="group flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Back to Dashboard</span>
                    </Link>
                    <div className="h-4 w-px bg-gray-100" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">Learning Portal</span>
                        <span className="text-xs font-black italic tracking-tight text-gray-900 truncate max-w-md uppercase">{course.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Your Progress</div>
                        <div className="w-32 h-1 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-primary w-[75%]" />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 hover:bg-black hover:text-white transition-all">
                        <Share2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                    </button>
                    <button className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 hover:bg-black transition-all shadow-lg shadow-primary/20">
                        <Award size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Claim Certificate</span>
                    </button>
                </div>
            </header>

            {/* Main Content Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Video & Details */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50/30 scrollbar-hide">
                    {/* High-Contrast Video Area */}
                    <div className="bg-black aspect-video flex flex-col relative group shrink-0 shadow-2xl">
                        <div className="flex-1 relative flex items-center justify-center">
                            {signedUrl ? (
                                <video
                                    key={currentLesson?.id}
                                    src={signedUrl}
                                    className="w-full h-full"
                                    controls
                                    autoPlay
                                    controlsList="nodownload"
                                />
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                        <PlayCircle size={40} className="text-primary" />
                                    </div>
                                    <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Ready for Playback</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata & Secondary Content Tabs */}
                    <div className="w-full max-w-5xl mx-auto px-12 pt-12 pb-32">
                        <div className="flex border-b border-gray-200 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {[
                                { id: 'overview', label: 'Overview', icon: BookOpen },
                                { id: 'resources', label: 'Resources', icon: FileText },
                                { id: 'ai', label: 'AI Support', icon: MessageSquare }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-3 h-full ${activeTab === tab.id ? 'border-primary text-black' : 'border-transparent text-gray-400 hover:text-black hover:border-gray-200'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Panes */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {activeTab === 'overview' && (
                                <div className="space-y-12">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-primary/5 flex items-center justify-center text-primary">
                                                    <Video size={16} />
                                                </div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                                                    Current Lesson: <span className="text-primary">{currentLesson?.title}</span>
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium italic border-l-2 border-primary/20 pl-6 py-2 max-w-3xl">
                                                {currentLesson?.description || "This component of the module defines the foundational logic required for high-level system analysis. Follow along with the video and utilize the secondary records provided."}
                                            </p>
                                        </div>
                                        <div className="w-full md:w-64">
                                            <button className="w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-black/10">
                                                <CheckCircle2 size={16} /> Complete Lesson
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[#a435f0] mb-4">Module Achievement</div>
                                                <h4 className="text-lg font-black italic leading-tight uppercase mb-4">You're making steady progress</h4>
                                                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-8">Maintain a steady pace to unlock the certification exam and finalize your professional transcript.</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Award size={20} />
                                                <div className="h-px flex-1 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="p-8 bg-primary/5 border border-primary/10 shadow-sm">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Next Up</div>
                                            <h4 className="text-lg font-black italic leading-tight uppercase text-gray-900 truncate">Strategic Decision Frameworks</h4>
                                            <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6">Transitioning from tactical operations to strategic alignment and governance.</p>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors flex items-center gap-2">
                                                Preview Next <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-8 max-w-3xl">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <h3 className="text-xl font-black italic tracking-tight uppercase">Course Resources</h3>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-4 py-1">{currentLesson?.documents?.length || 0} Files Available</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {currentLesson?.documents?.length > 0 ? (
                                            currentLesson.documents.map((doc) => (
                                                <div key={doc.id} className="group p-6 bg-white border border-gray-100 flex items-center justify-between hover:border-primary/30 transition-all hover:shadow-lg">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-black uppercase tracking-tight text-gray-900 mb-1">{doc.title}</h4>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{doc.document_type}</span>
                                                                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Downloadable</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-20 text-center bg-gray-50 border border-gray-100 border-dashed">
                                                <FileText className="mx-auto text-gray-200 mb-4" size={40} />
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No additional resources for this lesson</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: Light Accordion */}
                <aside className="w-[420px] border-l border-gray-100 bg-white flex flex-col z-10 overflow-hidden shrink-0">
                    <div className="h-20 border-b border-gray-100 flex flex-col justify-center px-8 shrink-0 bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-black italic tracking-tighter text-xl uppercase leading-none">Curriculum</h2>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1">ENROLLED</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-gray-100 overflow-hidden">
                                <div className="h-full bg-black w-[75%]" />
                            </div>
                            <span className="text-[10px] font-black text-gray-900 uppercase">75%</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {course.modules?.map((mod, mIdx) => (
                            <div key={mod.id} className="border-b border-gray-50">
                                <button
                                    onClick={() => toggleModule(mod.id)}
                                    className={`w-full flex items-start justify-between p-8 transition-colors ${expandedModules[mod.id] ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}
                                >
                                    <div className="text-left pr-4">
                                        <h3 className="font-black text-[11px] leading-tight uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <span className="text-primary/30">Wk {mIdx + 1}</span>
                                            {mod.title}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 opacity-40">
                                                <Video size={10} />
                                                <span className="text-[9px] text-gray-900 font-bold uppercase tracking-widest">{mod.lessons?.length || 0} Units</span>
                                            </div>
                                            <div className="w-[2px] h-[2px] bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 opacity-40">
                                                <Clock size={10} />
                                                <span className="text-[9px] text-gray-900 font-bold uppercase tracking-widest">45m</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={`shrink-0 mt-1 transition-transform duration-300 ${expandedModules[mod.id] ? 'rotate-90 text-primary' : 'text-gray-300'}`} />
                                </button>

                                {expandedModules[mod.id] && (
                                    <div className="bg-white border-t border-gray-50">
                                        {mod.lessons?.map((lesson, lIdx) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`w-full flex items-start gap-5 p-6 text-left border-l-4 transition-all ${currentLesson?.id === lesson.id ? 'bg-gray-50 border-primary shadow-inner' : 'border-transparent hover:bg-gray-50/50'}`}
                                            >
                                                <div className="pt-1 shrink-0">
                                                    {currentLesson?.id === lesson.id ? (
                                                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                                                            <PlayCircle size={14} fill="currentColor" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 border-2 border-gray-100 flex items-center justify-center text-gray-200 group-hover:border-primary transition-colors">
                                                            <Check size={12} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[11px] font-black leading-snug line-clamp-2 uppercase tracking-tight ${currentLesson?.id === lesson.id ? 'text-black' : 'text-gray-500'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex items-center gap-1.5 opacity-30">
                                                            <Activity size={10} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">6:45m</span>
                                                        </div>
                                                        {lesson.documents?.length > 0 && (
                                                            <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-0.5">
                                                                <FileText size={10} />
                                                                <span className="text-[8px] font-black uppercase tracking-widest italic">Resource</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* Branded Footer */}
            <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-8 z-50 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <Activity size={12} className="text-primary" /> Status: <span className="text-black">ONLINE</span>
                    </div>
                    <div className="w-px h-3 bg-gray-100" />
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Session: <span className="text-gray-900 italic">STUDENT-PORTAL</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-gray-300 uppercase italic tracking-widest">Secure Connection</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </div>
            </footer>
        </div>
    );
}
