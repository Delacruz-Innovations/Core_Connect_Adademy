import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, BookOpen, FileType, Loader2 } from 'lucide-react';
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

    const fetchResources = async () => {
        try {
            // 1. Get Enrollments
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id, course:courses(title)')
                .eq('student_id', user.id)
                .eq('status', 'active');

            const courseIds = (enrollments?.map(e => e.course_id) || []).filter(Boolean);
            const titles = Array.from(new Set(enrollments?.map(e => e.course?.title).filter(Boolean)));
            setCourseFilters(['All', ...titles]);

            if (courseIds.length === 0) {
                setResources([]);
                return;
            }

            // 2. Fetch all resources for these courses
            const { data: resData } = await supabase
                .from('resources')
                .select(`
                    id, title, description, resource_type, file_path, parent_type, parent_id
                `)
                .eq('visibility_status', 'published')
                .abortSignal(signal);

            const { data: modules } = await supabase.from('modules').select('id, course_id').in('course_id', courseIds).abortSignal(signal);
            const { data: lessons } = await supabase.from('lessons').select('id, module_id').in('module_id', modules?.map(m => m.id) || []).abortSignal(signal);

            const validModuleIds = new Set(modules?.map(m => m.id));
            const validLessonIds = new Set(lessons?.map(l => l.id));
            const validCourseIds = new Set(courseIds);

            const filteredRes = (resData || []).filter(item => {
                if (item.parent_type === 'course') return validCourseIds.has(item.parent_id);
                if (item.parent_type === 'module') return validModuleIds.has(item.parent_id);
                if (item.parent_type === 'lesson') return validLessonIds.has(item.parent_id);
                return false;
            }).map(item => {
                let courseTitle = 'General';
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

    const handleDownload = async (path, title) => {
        try {
            const { data, error } = await supabase.storage
                .from('lms-resources')
                .createSignedUrl(path, 60);

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
        <div className="space-y-8 md:space-y-10 mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Knowledge Base</span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 leading-none">
                        Resources
                    </h1>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-auto">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH FILES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 focus:border-primary outline-none text-[10px] font-black uppercase tracking-widest transition-all shadow-sm rounded-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
                {courseFilters.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm border ${filter === cat
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Indexing Library...</span>
                </div>
            ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res) => (
                        <div key={res.id} className="bg-white border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col justify-between h-full rounded-sm">
                            <div className="block">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-sm">{res.type}</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">{res.title}</h4>
                                <p className="text-[10px] text-gray-500 line-clamp-2 mb-4 italic leading-relaxed">{res.description || 'No description provided.'}</p>

                                <div className="space-y-3 mb-8 border-t border-gray-50 pt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <BookOpen size={12} className="text-gray-300" />
                                        <span>{res.course}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        <FileType size={12} className="text-gray-300" />
                                        <span>{res.size}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(res.file_path, res.title)}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all rounded-sm shadow-sm group-hover:shadow-md"
                            >
                                <Download size={14} /> Download File
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-dashed border-gray-200 p-16 text-center rounded-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Search size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No resources found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
