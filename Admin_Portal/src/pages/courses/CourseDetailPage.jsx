import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, Edit3, Trash2, Link2,
    ExternalLink, Layers, Video, BookOpen
} from 'lucide-react';
import CourseStatusPanel from './CourseStatusPanel';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select(`
          *,
          modules:modules(
            id,
            title,
            lessons:lessons(count)
          )
        `)
                .eq('id', courseId)
                .single();

            if (error) throw error;
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
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
            fetchCourse(); // Refresh local state
        } catch (error) {
            alert('Error updating status: ' + error.message);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading course details...</div>;
    if (!course) return <div className="p-12 text-center text-red-500">Course not found.</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">

            {/* Header */}
            <div className="flex justify-between items-start gap-8">
                <div className="flex gap-4">
                    <Link to="/admin/courses" className="text-gray-400 hover:text-black mt-1">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                                {course.title}
                            </h1>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${course.is_published
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-orange-50 text-orange-700 border-orange-100'
                                }`}>
                                {course.is_published ? 'Live' : 'Draft'}
                            </span>
                        </div>
                        <a
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="text-xs text-gray-400 hover:text-primary flex items-center gap-1 font-mono transition-colors"
                            rel="noreferrer"
                        >
                            <Link2 size={12} />
                            /courses/{course.slug}
                            <ExternalLink size={10} />
                        </a>
                    </div>
                </div>

                <Link
                    to={`/admin/courses/${courseId}/edit`}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-gray-800 transition-colors shadow-sm shrink-0"
                >
                    <Edit3 size={14} />
                    Edit Metadata
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Status Control */}
                    <CourseStatusPanel
                        status={course.is_published ? 'Published' : 'Draft'}
                        onStatusChange={handleStatusChange}
                    />

                    {/* Description */}
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-50 pb-2">Overview</h3>
                        <div className="prose prose-sm max-w-none text-gray-600">
                            <p className="font-medium text-black mb-2">{course.short_description}</p>
                            <div className="whitespace-pre-wrap font-light">{course.description}</div>
                        </div>
                    </div>

                    {/* Structure Preview */}
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <Layers size={16} /> Curriculum Structure
                            </h3>
                            <Link
                                to={`/admin/courses/${courseId}/modules`}
                                className="text-primary text-xs font-bold hover:underline"
                            >
                                Manage Modules →
                            </Link>
                        </div>

                        {course.modules && course.modules.length > 0 ? (
                            <div className="space-y-3">
                                {course.modules.map((mod, i) => ( // ... existing map
                                    <div key={mod.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 group hover:border-black/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                {i + 1}
                                            </span>
                                            <span className="font-medium text-sm text-gray-700">{mod.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                                {mod.lessons?.[0]?.count || 0} Lessons
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 text-center">
                                    <Link
                                        to={`/admin/courses/${courseId}/modules`}
                                        className="text-xs font-bold text-gray-500 hover:text-black border-b border-gray-300 pb-0.5"
                                    >
                                        Edit / Add More Modules
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-200">
                                <p className="text-gray-400 text-xs italic">No modules added yet.</p>
                                <Link
                                    to={`/admin/courses/${courseId}/modules`}
                                    className="mt-2 text-primary font-bold text-xs hover:underline inline-block"
                                >
                                    + Add First Module
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Stats */}
                    <div className="bg-black text-white rounded-xl p-6 shadow-lg">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-800 pb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-y-6">
                            <div>
                                <span className="block text-2xl font-black">{course.modules?.length || 0}</span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Modules</span>
                            </div>
                            <div>
                                <span className="block text-2xl font-black">
                                    {/* Simple accumulation */}
                                    {course.modules?.reduce((acc, m) => acc + (m.lessons[0].count || 0), 0)}
                                </span>
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Total Lessons</span>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-gray-800">
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <BookOpen size={14} /> Difficulty: <span className="text-white font-bold">{course.level}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    {course.thumbnail_url && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={course.thumbnail_url} alt="Course Cover" className="w-full h-auto object-cover opacity-90" />
                            <div className="p-2 bg-white text-[10px] text-center text-gray-400 font-mono tracking-tighter border-t border-gray-100 truncate">
                                {course.thumbnail_url}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="border border-red-100 bg-red-50/50 rounded-xl p-4">
                        <h4 className="font-bold text-red-800 text-xs uppercase mb-2">Danger Zone</h4>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this course? This action implies data loss.')) {
                                    // Delete logic
                                }
                            }}
                            className="w-full text-left flex items-center gap-2 text-red-600 text-xs font-bold hover:bg-red-100 p-2 rounded transition-colors"
                        >
                            <Trash2 size={14} /> Delete Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
