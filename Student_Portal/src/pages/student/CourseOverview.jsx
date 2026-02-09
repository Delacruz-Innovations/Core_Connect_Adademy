import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, ChevronRight, ArrowLeft, Clock, Activity, BookOpen, Target, Calendar, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CourseOverview = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({});

    const fetchCourseData = async () => {
        if (!courseId) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const [courseRes, modulesRes, resourcesRes] = await Promise.all([
                supabase.from('courses').select('*').eq('id', courseId).single(),
                supabase.from('modules').select('*').eq('course_id', courseId).order('week_number', { ascending: true }),
                supabase.from('resources').select('*').eq('parent_id', courseId).eq('visibility_status', 'published')
            ]);

            if (courseRes.error) throw courseRes.error;
            setCourse(courseRes.data);
            setModules(modulesRes.data || []);
            setResources(resourcesRes.data || []);

            if (user) {
                const { data: progressData } = await supabase
                    .from('module_progress')
                    .select('module_id, status')
                    .eq('user_id', user.id);

                const progMap = {};
                progressData?.forEach(p => progMap[p.module_id] = p.status);
                setProgress(progMap);
            }

        } catch (err) {
            console.error('Error fetching course data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Course Context...</p>
        </div>
    );

    if (!course) return (
        <div className="p-20 text-center uppercase font-bold text-gray-400 tracking-widest border-2 border-dashed border-gray-100 bg-gray-50 rounded-sm">
            Course Node Not Found
        </div>
    );

    return (
        <div className="space-y-8 md:space-y-12 mx-auto min-h-screen pb-20">

            {/* Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <Link to="/student/dashboard" className="group flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all rounded-sm shadow-sm">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">Back to Dashboard</span>
                    </Link>
                    <div className="hidden xs:block h-4 w-px bg-gray-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">ENTITY: {course.code || 'CCA-CORE'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">

                {/* Left Side: Course Hero & Details */}
                <div className="lg:col-span-8 space-y-12 md:space-y-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-primary/20 inline-flex items-center gap-2 rounded-sm shadow-sm">
                                <Target size={14} /> Global Curriculum Node
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-gray-900 leading-[0.9]">
                            {course.title}
                        </h1>
                        <p className="text-base md:text-xl text-gray-600 font-medium leading-relaxed border-l-4 border-primary/20 pl-8 max-w-4xl py-2 italic">
                            {course.description || "Deploying strategic frameworks for high-impact technical operations. Master the essential skills required for professional excellence through our structured learning modules."}
                        </p>
                    </div>

                    {/* Meta Indicators */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-gray-100">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><Clock size={14} /> Duration</span>
                            <span className="text-xl font-black italic text-gray-900 uppercase tracking-tight">12 Weeks</span>
                        </div>
                        <div className="flex flex-col gap-3 border-l border-gray-100 pl-8">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><BookOpen size={14} /> Curriculum</span>
                            <span className="text-xl font-black italic text-gray-900 uppercase tracking-tight">{modules.length} Modules</span>
                        </div>
                        <div className="flex flex-col gap-3 border-l border-gray-100 pl-8">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><Activity size={14} /> Tier</span>
                            <span className="text-xl font-black italic text-gray-900 uppercase tracking-tight">{course.level || 'Expert'}</span>
                        </div>
                        <div className="flex flex-col gap-3 border-l border-gray-100 pl-8">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><Target size={14} /> Access</span>
                            <span className="text-xl font-black italic text-primary uppercase tracking-tight">Protocol Live</span>
                        </div>
                    </div>

                    {/* Start Learning Call to Action */}
                    <div className="pt-8">
                        {modules.length > 0 ? (
                            <Link
                                to={`/student/course/${courseId}/module/${modules[0]?.id}`}
                                className="inline-flex items-center justify-center gap-10 bg-primary text-white pl-12 pr-10 py-6 text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,107,0,0.2)] hover:bg-black transition-all group rounded-sm"
                            >
                                <span>Initiate Learning Protocol</span>
                                <div className="w-px h-8 bg-white/20" />
                                <Play size={20} fill="currentColor" className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest text-[10px]">
                                Curriculum nodes not yet synchronized for this entity.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Curriculum Registry & Course Resources */}
                <div className="lg:col-span-4 space-y-12">

                    {/* Curriculum Sidebar */}
                    <div className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Navigation</span>
                                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Module Registry</h2>
                            </div>
                            <Layers size={20} className="text-gray-300" />
                        </div>

                        <div className="divide-y divide-gray-50">
                            {modules.map((module, idx) => {
                                const modProg = progress[module.id];
                                const isLocked = module.status !== 'unlocked' &&
                                    !(module.week_number === 1 && !modProg) &&
                                    modProg !== 'unlocked' &&
                                    modProg !== 'completed';

                                return (
                                    <Link
                                        key={module.id}
                                        to={!isLocked ? `/student/course/${courseId}/module/${module.id}` : '#'}
                                        className={`p-8 flex items-center justify-between group transition-all relative overflow-hidden ${isLocked ? 'grayscale opacity-60 cursor-not-allowed bg-gray-50/30' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex items-center gap-6 relative z-10 w-full overflow-hidden">
                                            <div className={`w-10 h-10 flex items-center justify-center font-black text-xs shrink-0 rounded-sm border ${isLocked ? 'text-gray-300 bg-gray-50 border-gray-100' : 'text-gray-900 bg-white border-gray-100 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm'}`}>
                                                {isLocked ? <Lock size={14} /> : idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 group-hover:text-primary transition-colors truncate">
                                                    Week {module.week_number}: {module.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isLocked ? 'text-gray-400 border-gray-200' : modProg === 'completed' ? 'text-green-500 border-green-100 bg-green-50' : 'text-primary border-primary/20 bg-primary/5'}`}>
                                                        {isLocked ? 'Restricted' : modProg === 'completed' ? 'Mastered' : 'Accessible'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Course Resources Sidebar Section */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                            <FileText size={18} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">General Resources</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Course-Level Assets</span>
                            </div>
                        </div>

                        {resources.length === 0 ? (
                            <div className="text-center py-10 px-4 border-2 border-dashed border-gray-50 bg-gray-50/30 rounded-sm">
                                <FileText size={24} className="text-gray-100 mx-auto mb-4" />
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] italic leading-relaxed">
                                    Course-level resources are detached. Check individual modules for specific documentation.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resources.map(res => (
                                    <div key={res.id} className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 group hover:border-primary/20 transition-all rounded-sm">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="p-3 bg-white text-gray-400 group-hover:text-primary transition-colors shrink-0 shadow-sm">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">{res.title}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{res.resource_type}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(res.file_path, res.title)}
                                            className="p-3 text-gray-400 hover:text-primary hover:bg-white transition-all rounded-sm"
                                            title="Download Resource"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CourseOverview;
