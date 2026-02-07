import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function CourseListPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: sbError } = await supabase
                .from('courses')
                .select(`
          *,
          modules:modules(count)
        `)
                .order('created_at', { ascending: false });

            if (sbError) throw sbError;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Academy Data...</div>;

    if (error) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-red-50/30 rounded-2xl border border-red-100 p-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <AlertCircle size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Sync Failed</h2>
                <p className="text-gray-500 text-sm max-w-xs text-center font-medium italic">
                    We encountered a secure connection issue ({error}). This is usually a transient network glitch.
                </p>
                <button
                    onClick={fetchCourses}
                    className="mt-4 px-8 py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                >
                    Try Re-Syncing
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Courses</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your academy curriculum and content.</p>
                </div>
                <Link
                    to="/admin/courses/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <PlusCircle size={16} />
                    Create New Course
                </Link>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-gray-900 font-bold mb-2">No courses found</h3>
                    <p className="text-gray-500 text-sm mb-6">Get started by creating your first course.</p>
                    <Link
                        to="/admin/courses/new"
                        className="text-primary font-bold hover:underline"
                    >
                        Create Course →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span
                                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${course.is_published
                                            ? 'bg-green-50 text-green-700 border border-green-100'
                                            : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                            }`}
                                    >
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </span>

                                    <span className="text-[10px] text-gray-400 font-mono">
                                        ID: {course.id.slice(0, 6)}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    {course.thumbnail_url && (
                                        <img
                                            src={course.thumbnail_url}
                                            alt=""
                                            className="w-full h-32 object-cover rounded-lg mb-4 bg-gray-100"
                                        />
                                    )}
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                        {course.short_description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(course.updated_at).toLocaleDateString()}
                                    </span>
                                    <span className="font-bold text-gray-300 uppercase tracking-widest text-[10px]">
                                        {course.level || 'Beginner'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/admin/courses/${course.id}`}
                                        className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        View Details
                                    </Link>
                                    <Link
                                        to={`/admin/courses/${course.id}/edit`}
                                        className="flex-1 text-center py-2 rounded-lg bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors"
                                    >
                                        Edit →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
