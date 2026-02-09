import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, Globe, Shield, Settings, Layers, Video, Link2, ExternalLink, Trash2, Edit3, ArrowLeft, BookOpen, FileText, Eye } from 'lucide-react';
import CourseStatusPanel from './CourseStatusPanel';
import DocumentManager from '../../components/documents/DocumentManager';
import BrandedLoader from '../../components/BrandedLoader';
import { useModal } from '../../context/ModalContext';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            // Get Course with nested modules and lessons
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select(`
                    *,
                    modules (
                        *,
                        lessons (id, title, video_path)
                    )
                `)
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            // Sort modules by week_number manually because Supabase's nested ordering can be tricky
            if (courseData.modules) {
                courseData.modules.sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
            }

            setCourse(courseData);
            setModules(courseData.modules || []);

        } catch (err) {
            console.error('Error fetching course:', err);
            await showAlert('Failed to load course details.', 'Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ is_published: newStatus === 'Published' })
                .eq('id', courseId);

            if (error) throw error;
            fetchData();
        } catch (error) {
            await showAlert('Error updating status: ' + error.message, 'Error', 'error');
        }
    };

    const handleDelete = async () => {
        if (!await showConfirm('PROTOCOL OVERRIDE: Are you sure? This will permanently terminate the course entity and all hierarchical children.', 'System Warning')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;
            await showAlert('Course deleted', 'Success', 'success');
            navigate('/admin/courses');
        } catch (err) {
            console.error('Error deleting course:', err);
            await showAlert('Failed to delete course.', 'Error', 'error');
        }
    };

    if (loading) return <BrandedLoader message="Accessing Core Identity Hub..." />;
    if (!course) return <div className="p-24 text-center text-red-500 font-bold">CRITICAL ERROR: COURSE ENTITY NOT RESOLVED</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 md:py-12 px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">

            {/* Header Identity Section */}
            <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden group">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />

                <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <Link
                            to="/admin/courses"
                            className="bg-gray-50 p-4 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 flex items-center justify-center shrink-0"
                            title="Return to Curriculum Registry"
                        >
                            <ArrowLeft size={24} strokeWidth={2.5} />
                        </Link>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${course.is_published
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                    }`}>
                                    {course.is_published ? '● Network Live' : '○ Draft Mode'}
                                </span>
                                <span className="text-[10px] font-black px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full uppercase tracking-widest">
                                    {course.level || 'Professional'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-[1.1] max-w-2xl">
                                {course.title}
                            </h1>

                            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-x-8 gap-y-3 pt-2">
                                <a
                                    href={`/courses/${course.slug}`}
                                    target="_blank"
                                    className="text-[10px] font-black text-gray-400 hover:text-primary flex items-center gap-2 uppercase tracking-widest transition-colors group/link"
                                    rel="noreferrer"
                                >
                                    <Globe size={14} className="text-primary/40 group-hover/link:text-primary" />
                                    Endpoint: <span className="text-gray-900">/courses/{course.slug}</span>
                                    <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </a>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Shield size={14} className="text-gray-300" />
                                    Entity ID: <span className="font-mono text-gray-600">{course.id.slice(0, 13)}...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        <Link
                            to={`/admin/courses/${courseId}/edit`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:shadow-xl transition-all active:scale-95 shadow-sm"
                        >
                            <Edit3 size={18} /> Edit Metadata
                        </Link>

                        <Link
                            to={`/admin/courses/${courseId}/review`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-2xl active:scale-95 group/btn"
                        >
                            <Eye size={18} className="group-hover:scale-110 transition-transform" /> Integrity Review
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

                {/* Left Column: Structure & Content */}
                <div className="lg:col-span-8 space-y-8 md:space-y-12">

                    {/* Status Interaction Panel */}
                    <CourseStatusPanel
                        status={course.is_published ? 'Published' : 'Draft'}
                        onStatusChange={handleStatusChange}
                    />

                    {/* Curriculum Architecture Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-4">
                                <Layers size={20} className="text-primary" /> Curriculum Hierarchy
                            </h2>
                            <Link
                                to={`/admin/courses/${courseId}/modules`}
                                className="px-4 py-2 bg-primary/5 text-[10px] font-black text-primary border border-primary/10 rounded-lg uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                Modify Architect →
                            </Link>
                        </div>

                        <div className="space-y-6">
                            {course.modules && course.modules.length > 0 ? (
                                course.modules.map((mod) => (
                                    <details key={mod.id} className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                        <summary className="flex justify-between items-center p-6 md:p-8 cursor-pointer list-none select-none">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-gray-50 border-2 border-white rounded-2xl flex items-center justify-center font-black text-sm text-primary shadow-sm group-open:bg-primary group-open:text-white transition-colors">
                                                    W{mod.week_number}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-black text-gray-900 uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{mod.title}</span>
                                                    <div className="flex gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                        <span>{mod.lessons?.length || 0} Units</span>
                                                        <span>•</span>
                                                        <span>~{(mod.lessons?.length || 0) * 15}m Run-time</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center text-gray-300 group-open:rotate-180 transition-transform shadow-inner">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </summary>
                                        <div className="p-6 md:p-8 pt-0 border-t border-gray-50 bg-gray-50/20 space-y-3">
                                            {mod.lessons && mod.lessons.map((lesson, idx) => (
                                                <div key={lesson.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-gray-200">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                                        <span className="text-sm font-bold text-gray-700 tracking-tight">{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                        {lesson.video_path ? (
                                                            <span className="text-[9px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase flex items-center gap-2 border border-green-100">
                                                                <Video size={12} /> Media Synchronized
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-red-400 bg-red-50 px-3 py-1 rounded-full uppercase flex items-center gap-2 border border-red-100 italic">
                                                                <Activity size={12} /> Missing Stream
                                                            </span>
                                                        )}
                                                        <Link to={`/admin/lessons/${lesson.id}/edit`} className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                                                            <Settings size={14} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <p className="text-[10px] text-gray-400 font-medium italic">Configure individual lesson parameters or metadata for this module cycle.</p>
                                                <Link to={`/admin/modules/${mod.id}/lessons`} className="w-full sm:w-auto text-center bg-white border border-gray-200 px-6 py-3 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded-xl shadow-sm">
                                                    Manage Module Content →
                                                </Link>
                                            </div>
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] shadow-inner">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                        <Layers size={32} />
                                    </div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Curriculum Node Not Initialized</p>
                                    <Link to={`/admin/courses/${courseId}/modules`} className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl">
                                        + Architect First Module
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Governance & Media */}
                <div className="lg:col-span-4 space-y-8 md:space-y-12">

                    {/* Operational Metrics Panel */}
                    <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                        <Activity className="absolute -right-8 -top-8 w-48 h-48 text-white/5 rotate-12 transition-transform group-hover:rotate-45 duration-700" />

                        <div className="relative space-y-10">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6 flex items-center gap-3">
                                    <Activity size={16} className="text-primary" /> Academy Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <span className="block text-5xl font-black italic tracking-tighter text-white">
                                            {course.modules?.length || 0}
                                        </span>
                                        <span className="text-[9px] uppercase text-gray-500 font-black tracking-widest leading-none">Modules Hosted</span>
                                    </div>
                                    <div className="space-y-1 border-l border-gray-800 pl-6">
                                        <span className="block text-5xl font-black italic tracking-tighter text-primary">
                                            {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
                                        </span>
                                        <span className="text-[9px] uppercase text-gray-500 font-black tracking-widest leading-none">Study Nodes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-8 border-t border-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Level Architecture</span>
                                    </div>
                                    <span className="text-white font-black italic text-sm uppercase tracking-tight">{course.level || 'Expert'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Security Protocol</span>
                                    </div>
                                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest bg-gray-800/50 px-2 py-1 rounded">RBAC-CORE</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-inner">
                                View Detailed Logs
                            </button>
                        </div>
                    </div>

                    {/* Master Document Hub */}
                    <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                        <DocumentManager parentType="course" parentId={courseId} />
                    </div>

                    {/* Media Identification Asset */}
                    <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-5 shadow-sm group">
                        <div className="relative rounded-[1.5rem] overflow-hidden aspect-video shadow-2xl">
                            <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&w=1200&q=80'}
                                alt="Course Thumbnail Identity"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-5 left-6 flex items-center gap-3">
                                <span className="p-2 bg-primary text-white rounded-lg shadow-lg">
                                    <Globe size={14} strokeWidth={2.5} />
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Global Network Asset</span>
                                    <span className="text-[9px] text-white/60 font-medium tracking-tight mt-1">Verified Node Identity</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 px-3">
                            <p className="text-[9px] font-mono font-bold text-gray-300 uppercase tracking-widest line-clamp-1 opacity-60">
                                {course.thumbnail_url || 'CCA-STORAGE-NODE-01'}
                            </p>
                        </div>
                    </div>

                    {/* Danger Authorization Zone */}
                    <div className="p-8 border-2 border-red-50 bg-red-50/10 rounded-[2.5rem] space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-3">
                                <Shield size={14} className="text-red-400" /> Destruction Authority
                            </h4>
                            <p className="text-[10px] text-red-600/60 font-medium leading-relaxed italic">
                                Termination will permanently wipe all modules, lessons, and enrollment links associated with this identity.
                            </p>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 border-b-4 border-red-100"
                        >
                            Terminate Identity Hub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
