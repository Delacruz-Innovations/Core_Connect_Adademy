import React, { useState, useEffect } from 'react';
import {
    Download,
    Search,
    Loader2,
    FileText,
    FileType,
    BookOpen,
    Lock,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';

const ResourceLibrary = () => {
    const { user } = useAuth();
    const { notifySyncFailure, registerRetry } = useConnectivity();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseFilters, setCourseFilters] = useState(['All']);

    useEffect(() => {
        if (!user) return;

        const controller = new AbortController();
        const fetchData = () => fetchResources(controller.signal);

        fetchData();
        const unregister = registerRetry(fetchData);

        return () => {
            controller.abort();
            unregister();
        };
    }, [user, registerRetry]);

    const fetchResources = async (signal) => {
        try {
            // 1. Get Enrollments (including completed ones for Alumni access)
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id, status, course:courses(title)')
                .eq('student_id', user.id);

            const activeCourseIds = (enrollments?.filter(e => e.status === 'active').map(e => e.course_id) || []).filter(Boolean);
            const isAlumni = enrollments?.some(e => e.status === 'completed');

            const titles = Array.from(new Set(enrollments?.map(e => e.course?.title).filter(Boolean)));
            const availableFilters = ['All', ...titles];
            if (isAlumni) {
                availableFilters.push('Post-Course Guidance');
            } else {
                availableFilters.push('Alumni (Locked)');
            }
            setCourseFilters(availableFilters);

            // 2. Fetch resources based on visibility
            let query = supabase
                .from('resources')
                .select(`
id, title, description, resource_type, file_path, parent_type, parent_id, visibility_status
    `);

            query = query.in('visibility_status', ['published', 'alumni']);

            const { data: resData } = await query.abortSignal(signal);

            // 3. Resolve context (Course/Module/Lesson) for filtering
            const { data: modules } = await supabase.from('modules').select('id, course_id');
            const { data: lessons } = await supabase.from('lessons').select('id, module_id');

            const validModuleIds = new Set(modules?.map(m => m.id));
            const validLessonIds = new Set(lessons?.map(l => l.id));
            const validCourseIds = new Set(enrollments?.map(e => e.course_id) || []);

            const filteredRes = (resData || []).filter(item => {
                if (item.visibility_status === 'alumni') return true;

                if (item.parent_type === 'course') return validCourseIds.has(item.parent_id);
                if (item.parent_type === 'module') return validModuleIds.has(item.parent_id);
                if (item.parent_type === 'lesson') return validLessonIds.has(item.parent_id);
                return false;
            }).map(item => {
                let courseTitle = item.visibility_status === 'alumni' ? (isAlumni ? 'Post-Course Guidance' : 'Alumni (Locked)') : 'General';

                if (item.parent_type === 'course') {
                    courseTitle = enrollments.find(e => e.course_id === item.parent_id)?.course?.title || 'Course';
                } else if (item.parent_type === 'module') {
                    const mod = modules.find(m => m.id === item.parent_id);
                    courseTitle = enrollments.find(e => e.course_id === mod?.course_id)?.course?.title || 'Course';
                } else if (item.parent_type === 'lesson') {
                    const les = lessons.find(l => l.id === item.parent_id);
                    const mod = modules.find(m => m.id === les?.module_id);
                    courseTitle = enrollments.find(e => e.course_id === mod?.course_id)?.course?.title || 'Course';
                }

                return {
                    ...item,
                    course: courseTitle,
                    type: item.file_path.split('.').pop().toUpperCase(),
                    isLocked: item.visibility_status === 'alumni' && !isAlumni,
                    size: 'Variable'
                };
            });

            setResources(filteredRes);
            notifySyncFailure(false);
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error(err);
            notifySyncFailure(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (res) => {
        if (res.isLocked) {
            alert('This resource is exclusive to alumni. Complete your course to unlock access!');
            return;
        }

        try {
            const { data, error } = await supabase.storage
                .from('lms-resources')
                .createSignedUrl(res.file_path, 60);

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error('Download failed:', err);
            alert('File access denied or expired.');
        }
    };

    const filteredResources = resources.filter(r => {
        const matchesFilter = filter === 'All' || r.course === filter;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-[1600px] mx-auto min-h-screen relative pb-20">
            {/* Watermark */}
            <div className="fixed right-0 bottom-0 opacity-[0.03] pointer-events-none z-0 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={600} />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
                    <p className="text-gray-500 mt-1">Access course materials and external documents</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-auto">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-full shadow-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {courseFilters.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-full border ${filter === cat
                            ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-900'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="text-primary animate-spin" size={40} />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Library...</span>
                </div>
            ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {filteredResources.map((res) => (
                        <div key={res.id} className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-full rounded-3xl">
                            <div className="block">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-primary group-hover:text-white transition-all rounded-2xl">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2.5 py-1.5 rounded-full">{res.type}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{res.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{res.description || 'No description provided.'}</p>

                                <div className="space-y-3 mb-8 border-t border-gray-50 pt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <BookOpen size={12} />
                                        <span>{res.course}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <FileType size={12} />
                                        <span>{res.size}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(res)}
                                disabled={res.isLocked}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl shadow-sm ${res.isLocked
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-gray-900 text-white hover:bg-primary group-hover:shadow-md'
                                    }`}
                            >
                                {res.isLocked ? (
                                    <>
                                        <Lock size={14} /> Alumni Only
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} /> Download
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-dashed border-gray-200 p-16 text-center rounded-3xl relative z-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Search size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No resources found.</p>
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
