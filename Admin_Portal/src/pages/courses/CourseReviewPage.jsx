import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, CheckCircle, AlertTriangle,
    PlayCircle, FileText, Globe, Eye,
    Shield, Layers, Video, Lock, Unlock,
    ChevronRight, Loader2, Share2, Award,
    MoreVertical, X, Check, Search, MessageCircle, HelpCircle, Info
} from 'lucide-react';
import BrandedLoader from '../../components/BrandedLoader';
import { useModal } from '../../context/ModalContext';

export default function CourseReviewPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [readiness, setReadiness] = useState({
        passes: false,
        errors: [],
        stats: { modules: 0, lessons: 0, videos: 0, documents: 0 }
    });
    const [activeTab, setActiveTab] = useState('overview'); // overview, resources, audit
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [signedUrl, setSignedUrl] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select(`*, modules:modules(*, lessons:lessons(*))`)
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            const moduleIds = courseData.modules?.map(m => m.id) || [];
            const lessonIds = courseData.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [];

            const { data: allDocs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .in('parent_id', [courseId, ...moduleIds, ...lessonIds]);

            if (docsError) throw docsError;

            const fullData = { ...courseData };
            fullData.documents = allDocs.filter(d => d.parent_id === courseId);
            fullData.modules = (courseData.modules || []).sort((a, b) => a.week_number - b.week_number).map(mod => ({
                ...mod,
                documents: allDocs.filter(d => d.parent_id === mod.id),
                lessons: (mod.lessons || []).sort((a, b) => a.order_index - b.order_index).map(lesson => ({
                    ...lesson,
                    documents: allDocs.filter(d => d.parent_id === lesson.id)
                }))
            }));

            setCourse(fullData);
            runReadinessCheck(fullData);

            // Auto-select first lesson if available
            if (fullData.modules?.[0]?.lessons?.[0]) {
                previewLesson(fullData.modules[0].lessons[0]);
            }

            // Expand first module by default
            if (fullData.modules?.[0]) {
                setExpandedModules({ [fullData.modules[0].id]: true });
            }

        } catch (err) {
            console.error('Error fetching review data:', err);
        } finally {
            setLoading(false);
        }
    };

    const runReadinessCheck = (data) => {
        const errors = [];
        const stats = { modules: 0, lessons: 0, videos: 0, documents: 0 };

        if (!data.modules || data.modules.length === 0) {
            errors.push("Course must have at least one module (Week).");
        } else {
            stats.modules = data.modules.length;
            data.modules.forEach(mod => {
                if (!mod.lessons || mod.lessons.length === 0) {
                    errors.push(`Module "${mod.title}" has no lessons.`);
                } else {
                    stats.lessons += mod.lessons.length;
                    mod.lessons.forEach(lesson => {
                        if (!lesson.video_path) {
                            errors.push(`Lesson "${lesson.title}" in ${mod.title} is missing a video.`);
                        } else {
                            stats.videos++;
                        }
                    });
                }
                stats.documents += (mod.documents?.length || 0);
            });
        }
        stats.documents += (data.documents?.filter(d => d.parent_type === 'course').length || 0);

        setReadiness({
            passes: errors.length === 0,
            errors,
            stats
        });
    };

    // This function is implied by the Code Edit, replacing the direct check of readiness.passes
    const validateCourse = () => {
        return readiness.passes;
    };

    const handlePublish = async () => {
        if (!validateCourse()) {
            await showAlert("CANNOT PUBLISH: Protocol violations detected.", "Validation Failed", "error");
            return;
        }

        try {
            // Updated status to 'published'
            const { error } = await supabase.from('courses')
                .update({ status: 'published' })
                .eq('id', courseId);

            if (error) throw error;

            await showAlert('Course launched successfully into public domain.', 'Launch Success', 'success');
            navigate('/admin/courses');

        } catch (err) {
            console.error('Publishing error:', err);
            await showAlert(err.message, 'Publishing Error', 'error');
        }
    };

    const previewLesson = async (lesson) => {
        setSelectedLesson(lesson);
        setSignedUrl(null);
        if (lesson.video_path) {
            const { data, error } = await supabase.storage
                .from('lesson-videos')
                .createSignedUrl(lesson.video_path, 3600);
            if (!error) setSignedUrl(data.signedUrl);
        }
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <BrandedLoader message="Initializing Quality Control System..." />;

    return (
        <div className="h-screen bg-white flex flex-col font-sans selection:bg-primary/30">

            {/* Dark Top Nav - Udemy Style */}
            <header className="h-14 bg-[#1c1d1f] border-b border-[#3e4143] shrink-0 flex items-center justify-between px-6 text-white z-50">
                <div className="flex items-center gap-4 border-r border-[#3e4143] pr-6 mr-4">
                    <Link to={`/admin/courses/${courseId}`} className="hover:text-gray-300 transition-colors">
                        <img src="/logo.png" alt="CoreConnect" className="h-6 w-auto brightness-0 invert" />
                    </Link>
                </div>

                <div className="flex-1 flex items-center truncate">
                    <span className="text-sm font-bold truncate">{course.title}</span>
                </div>

                <div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-1 text-xs font-bold mr-4">
                        <Award size={16} className="text-[#a435f0]" />
                        <span className="hover:underline cursor-pointer">Get certificate</span>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-white/30 rounded font-bold text-xs hover:bg-white/10 transition-colors">
                        <Share2 size={14} /> Share
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Video & Tabs */}
                <main className="flex-1 flex flex-col overflow-y-auto bg-white scrollbar-hide">
                    {/* Dark Video Section */}
                    <div className="bg-black aspect-video flex flex-col relative group">
                        <div className="flex-1 relative flex items-center justify-center">
                            {signedUrl ? (
                                <video
                                    src={signedUrl}
                                    className="w-full h-full max-h-[70vh] outline-none"
                                    controls
                                    controlsList="nodownload"
                                />
                            ) : (
                                <div className="text-center space-y-4">
                                    <PlayCircle size={64} className="mx-auto text-gray-700 animate-pulse" />
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Authorizing Media Stream...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Tabs Section */}
                    <div className="w-full mx-auto px-8 pt-6 pb-20">
                        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {[
                                { id: 'overview', label: 'Overview', icon: Search },
                                { id: 'resources', label: 'Resources', icon: FileText },
                                { id: 'audit', label: 'Audit Checklist', icon: Shield },
                                { id: 'notes', label: 'Notes', icon: MessageCircle },
                                { id: 'help', label: 'Help', icon: HelpCircle }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="">
                                    <h1 className="text-3xl font-black tracking-tight mb-4">{course.title}</h1>
                                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{course.description || "In this course, you will learn the fundamental skills required to master this domain. We follow a project-based approach to ensure practical competence."}</p>

                                    <div className="flex flex-wrap items-center gap-6 mt-8">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500 font-black text-lg">4.8</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => <Award key={s} size={14} className="fill-yellow-500 text-yellow-500" />)}
                                            </div>
                                            <span className="text-gray-400 text-xs font-bold">(12,450 ratings)</span>
                                        </div>
                                        <div className="h-4 w-px bg-gray-200" />
                                        <div className="text-gray-900 text-sm font-bold">45,230 students</div>
                                        <div className="h-4 w-px bg-gray-200" />
                                        <div className="text-gray-900 text-sm font-bold">{readiness.stats.lessons * 12}min total Content</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-gray-100 uppercase tracking-widest font-black text-[10px]">
                                    <div className="space-y-2">
                                        <span className="text-gray-400">Total Lessons</span>
                                        <div className="text-xl text-black">{readiness.stats.lessons}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-gray-400">Video Runtime</span>
                                        <div className="text-xl text-black">~{readiness.stats.lessons * 5} min</div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-gray-400">Global Records</span>
                                        <div className="text-xl text-black">{readiness.stats.documents}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-gray-400">Status</span>
                                        <div className={`text-xl ${course.is_published ? 'text-green-600' : 'text-orange-500'}`}>{course.is_published ? 'Published' : 'Drafting'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Contextual Assets Node</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.documents?.map(doc => (
                                        <div key={doc.id} className="p-4 border border-gray-100 rounded-xl hover:border-black transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-tight">{doc.title}</h4>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{doc.document_type} • Global</span>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-300 hover:text-black hover:bg-gray-100 rounded-full">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedLesson?.documents?.map(doc => (
                                        <div key={doc.id} className="p-4 border border-primary/10 rounded-xl bg-primary/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary text-white rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-tight">{doc.title}</h4>
                                                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{doc.document_type} • Lesson Level</span>
                                                </div>
                                            </div>
                                            <button className="p-2 text-primary hover:bg-white rounded-full">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'audit' && (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                <div className={`p-8 rounded-3xl border ${readiness.passes ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        {readiness.passes ? <CheckCircle className="text-green-500" size={24} /> : <AlertTriangle className="text-red-500" size={24} />}
                                        <h2 className="font-black uppercase tracking-tight">Integrity Status: {readiness.passes ? 'CLEARANCE GRANTED' : 'PROTOCOL VIOLATIONS'}</h2>
                                    </div>
                                    {readiness.errors.map((err, i) => (
                                        <div key={i} className="flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                            <X size={14} /> {err}
                                        </div>
                                    ))}
                                    {readiness.passes && (
                                        <div className="flex items-center gap-3 text-green-600 text-[10px] font-black uppercase tracking-widest">
                                            <Check size={14} /> All pedagogical requirements satisfied. Ready for deployment.
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePublish}
                                        className={`px-12 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 ${course.is_published ? 'bg-orange-600 text-white' : 'bg-black text-white disabled:opacity-30'}`}
                                        disabled={!readiness.passes && !course.is_published}
                                    >
                                        {course.is_published ? 'Revoke Publication' : 'Execute System Publish'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right: Udemy-Style Sidebar Content */}
                <aside className="w-[380px] border-l border-gray-200 bg-white flex flex-col z-10 overflow-hidden shrink-0">
                    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white">
                        <h2 className="font-bold text-sm">Course content</h2>
                        <button className="p-1 hover:bg-gray-100 rounded">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {course.modules?.map((mod, mIdx) => (
                            <div key={mod.id} className="border-b border-gray-100">
                                <button
                                    onClick={() => toggleModule(mod.id)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="text-left">
                                        <h3 className="font-bold text-xs leading-tight">Section {mIdx + 1}: {mod.title}</h3>
                                        <div className="text-[10px] text-gray-500 font-medium mt-1">
                                            {mod.lessons?.length || 0} lessons • {mod.lessons?.length * 5}min
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform duration-300 ${expandedModules[mod.id] ? 'rotate-90' : ''}`} />
                                </button>

                                {expandedModules[mod.id] && (
                                    <div className="divide-y divide-gray-50">
                                        {mod.lessons?.map((lesson, lIdx) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => previewLesson(lesson)}
                                                className={`w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50 transition-colors ${selectedLesson?.id === lesson.id ? 'bg-[#f7f9fa]' : ''}`}
                                            >
                                                <div className="pt-1">
                                                    <div className={`w-4 h-4 rounded border border-black/20 flex items-center justify-center shrink-0 ${selectedLesson?.id === lesson.id ? 'bg-[#1c1d1f] border-black text-white' : ''}`}>
                                                        {selectedLesson?.id === lesson.id ? <PlayCircle size={10} fill="currentColor" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedLesson?.id === lesson.id ? 'text-black' : 'text-gray-700'}`}>
                                                        {lIdx + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Video size={10} className="text-gray-400" />
                                                        <span className="text-[10px] text-gray-500 font-medium">5min</span>
                                                        {lesson.documents?.length > 0 && (
                                                            <div className="px-1.5 py-0.5 border border-gray-200 rounded text-[8px] font-black uppercase text-gray-400 bg-white">
                                                                Resources
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

            {/* Context Footer (Admin Indicator) */}
            <footer className="h-10 bg-[#f7f9fa] border-t border-gray-200 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Lock size={12} className="text-[#a435f0]" /> Integrity Lock Active
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Previewing as: <span className="text-black">Master Administrator</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-gray-300 uppercase italic">
                    Node ID: {course.id.slice(0, 8)}...
                </div>
            </footer>
        </div>
    );
}
