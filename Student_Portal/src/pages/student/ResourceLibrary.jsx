import React, { useState, useEffect, useMemo } from 'react';
import {
    Download, Search, Loader2, FileText,
    FileType, BookOpen, Lock, ExternalLink,
    AlertCircle, BarChart3, Clock, LayoutGrid,
    List as ListIcon, Star, Filter, ArrowUpRight,
    ChevronRight, Archive, Shield, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import ResourceDetailModal from '../../components/ResourceDetailModal';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
        <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">{label}</span>
            <span className="text-3xl font-black italic tracking-tighter text-gray-900">{value}</span>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5`}>
            <Icon size={20} className="text-white" />
        </div>
    </div>
);

const ResourceCard = ({ resource, onClick, onDownload }) => {
    const isLocked = resource.isLocked;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 overflow-hidden flex flex-col"
        >
            <div className="p-8 space-y-6 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${resource.type === 'PDF' ? 'bg-red-50 text-red-500' :
                        ['DOC', 'DOCX'].includes(resource.type) ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'
                        }`}>
                        <FileText size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isLocked ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'
                            }`}>
                            {isLocked ? 'Locked' : 'Available'}
                        </div>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{resource.type}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block">
                        {resource.course}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-2 min-h-[3.5rem]">
                        {resource.title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {resource.description || 'No digital summary available for this archive entry.'}
                </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-50 mt-auto flex gap-3">
                <button
                    onClick={() => onClick(resource)}
                    className="flex-1 h-12 bg-white border border-gray-100 text-gray-900 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:border-black transition-all shadow-sm"
                >
                    Metadata <ChevronRight size={14} />
                </button>
                <button
                    onClick={() => onDownload(resource)}
                    disabled={isLocked}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl shadow-black/5 ${isLocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-primary'
                        }`}
                >
                    {isLocked ? <Lock size={16} /> : <Download size={16} />}
                </button>
            </div>
        </motion.div>
    );
};

const ResourceLibrary = () => {
    const { user } = useAuth();
    const { notifySyncFailure, registerRetry } = useConnectivity();
    const [filter, setFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseFilters, setCourseFilters] = useState(['All']);
    const [selectedResource, setSelectedResource] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

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
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id, status, course:courses(title)')
                .eq('student_id', user.id);

            const activeCourseIds = (enrollments?.filter(e => e.status === 'active').map(e => e.course_id) || []).filter(Boolean);
            const isAlumni = enrollments?.some(e => e.status === 'completed');

            const titles = Array.from(new Set(enrollments?.map(e => e.course?.title).filter(Boolean)));
            setCourseFilters(['All', ...titles]);

            const { data: resData } = await supabase
                .from('resources')
                .select('*')
                .eq('visibility_status', 'published')
                .abortSignal(signal);

            const { data: modules } = await supabase.from('modules').select('id, course_id');
            const { data: lessons } = await supabase.from('lessons').select('id, module_id');

            const validCourseIds = new Set(enrollments?.map(e => e.course_id) || []);
            const moduleMap = new Map(modules?.map(m => [m.id, m.course_id]));
            const lessonMap = new Map(lessons?.map(l => [l.id, moduleMap.get(l.module_id)]));

            const filteredRes = (resData || []).filter(item => {
                if (item.visibility_status === 'alumni') return true;
                const courseId = item.parent_type === 'course' ? item.parent_id :
                    item.parent_type === 'module' ? moduleMap.get(item.parent_id) :
                        item.parent_type === 'lesson' ? lessonMap.get(item.parent_id) : null;
                return validCourseIds.has(courseId);
            }).map(item => {
                let courseTitle = 'Archive';
                if (item.visibility_status === 'alumni') {
                    courseTitle = isAlumni ? 'Alumni Network' : 'Alumni (Locked)';
                } else if (item.parent_type === 'course') {
                    courseTitle = enrollments.find(e => e.course_id === item.parent_id)?.course?.title || 'Course';
                } else {
                    const courseId = item.parent_type === 'module' ? moduleMap.get(item.parent_id) : lessonMap.get(item.parent_id);
                    courseTitle = enrollments.find(e => e.course_id === courseId)?.course?.title || 'General';
                }

                return {
                    ...item,
                    course: courseTitle,
                    type: (item.file_path || '').split('.').pop().toUpperCase(),
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

    const stats = useMemo(() => {
        return {
            total: resources.length,
            courses: courseFilters.length - 1,
            unlocked: resources.filter(r => !r.isLocked).length
        };
    }, [resources, courseFilters]);

    const filteredResources = resources.filter(r => {
        const matchesCourse = filter === 'All' || r.course === filter;
        const matchesCategory = categoryFilter === 'All' || r.resource_type === categoryFilter;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCourse && matchesCategory && matchesSearch;
    });

    const openDetails = (res) => {
        setSelectedResource(res);
        setModalOpen(true);
    };

    if (loading) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10"></div>
            <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Syncing Archive...</div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Knowledge Hub</span>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-gray-900">Archive</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Access course artifacts, instructional protocols, and reference assets.</p>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH ARCHIVE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-all"
                    />
                </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Artifacts" value={stats.total} icon={Archive} color="bg-gray-900" />
                <StatCard label="Course Contexts" value={stats.courses} icon={Globe} color="bg-primary" />
                <StatCard label="Unlocked Nodes" value={stats.unlocked} icon={Shield} color="bg-green-500" />
            </div>

            {/* Filters Bar */}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/50">
                        {courseFilters.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filter === cat
                                    ? 'bg-black text-white shadow-xl shadow-black/10'
                                    : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-gray-50/50 rounded-2xl border border-gray-100">
                        {[
                            { id: 'All', label: 'All Types' },
                            { id: 'reference', label: 'Reference' },
                            { id: 'instruction', label: 'Instructional' },
                            { id: 'policy', label: 'Protocols' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setCategoryFilter(type.id)}
                                className={`px-5 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${categoryFilter === type.id
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Section (Mock New Additions) */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Star size={18} className="text-primary fill-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900">Premium Artifacts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredResources.slice(0, 4).map((res) => (
                        <div key={`feat-${res.id}`} className="bg-gray-900 p-8 rounded-[2rem] group relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer" onClick={() => openDetails(res)}>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <FileText size={80} className="text-white" />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] block mb-2">New Arrival</span>
                                <h4 className="text-white font-black uppercase tracking-tight line-clamp-2 leading-tight">{res.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors">
                                Access <ArrowUpRight size={10} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Library Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <LayoutGrid size={18} className="text-gray-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Digital Repository</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{filteredResources.length} Artifacts in View</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredResources.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 bg-white border border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                    <Archive size={40} strokeWidth={1} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 italic">Registry Empty</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-10">No artifacts match your current authorization or search criteria.</p>
                                </div>
                            </motion.div>
                        ) : (
                            filteredResources.map((res) => (
                                <ResourceCard
                                    key={res.id}
                                    resource={res}
                                    onClick={openDetails}
                                    onDownload={handleDownload}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ResourceDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                resource={selectedResource}
                onDownload={handleDownload}
            />
        </div>
    );
};

export default ResourceLibrary;
