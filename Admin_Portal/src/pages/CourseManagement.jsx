import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, Plus, Search,
    MoreVertical, Edit3, BookMarked,
    CheckCircle2, CircleDashed
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandedLoader from '../components/BrandedLoader';

const CourseCard = ({ course }) => (
    <div className="bg-white border border-gray-100 shadow-sm group hover:shadow-2xl transition-all flex flex-col">
        <div className="aspect-video relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen size={48} className="text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${course.is_published ? 'bg-green-500 text-white' : 'bg-orange-50 text-white'
                    }`}>
                    {course.is_published ? 'Published' : 'Draft'}
                </span>
            </div>
        </div>
        <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-black italic tracking-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                {course.title}
            </h3>
            <p className="text-gray-400 text-xs font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                {course.short_description || course.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <BookMarked size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Content Management
                    </span>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/admin/courses/${course.id}/edit`}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all"
                        title="Edit Metadata"
                    >
                        <Edit3 size={16} />
                    </Link>
                    <Link
                        to={`/admin/courses/${course.id}/modules`}
                        className="p-2 bg-primary text-white hover:bg-black transition-all"
                        title="Manage Curriculum"
                    >
                        <BookMarked size={16} />
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

const CourseManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        published: 0,
        draft: 0
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setCourses(data || []);
            setStats({
                published: data.filter(c => c.is_published).length,
                draft: data.filter(c => !c.is_published).length
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <BrandedLoader message="Synchronizing Curriculum..." />;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Curriculum Authority</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Courses</h1>
                </div>
                <button
                    onClick={() => navigate('/admin/courses/new')}
                    className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                    <Plus size={18} /> Catalog New Course
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border border-gray-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published</p>
                        <p className="text-2xl font-black italic">{stats.published}</p>
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-orange-50 flex items-center justify-center text-orange-500">
                        <CircleDashed size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Draft</p>
                        <p className="text-2xl font-black italic">{stats.draft}</p>
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary">
                        <BookMarked size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active Nodes</p>
                        <p className="text-2xl font-black italic">{courses.length}</p>
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {courses.length === 0 ? (
                    <div className="col-span-full py-20 bg-gray-50 border border-dashed border-gray-200 text-center rounded-3xl">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No Curriculum Records Found</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseManagement;
