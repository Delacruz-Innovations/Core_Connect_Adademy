import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, PlusCircle, Video,
    Trash2, Edit3, ArrowUp, ArrowDown, FileQuestion
} from 'lucide-react';

export default function LessonListPage() {
    const { moduleId } = useParams();
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [moduleId]);

    const fetchData = async () => {
        try {
            // 1. Get Module Info
            const { data: modData } = await supabase
                .from('modules')
                .select('id, title, course_id, week_number')
                .eq('id', moduleId)
                .single();
            setModule(modData);

            // 2. Get Lessons (Ordered)
            const { data: lessonsData, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setLessons(lessonsData || []);

        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (lessonId) => {
        if (!confirm('Delete this lesson? This action cannot be undone.')) return;
        try {
            await supabase.from('lessons').delete().eq('id', lessonId);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading lessons...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${module?.course_id}/modules`} className="text-gray-400 hover:text-black">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Lesson Manager</h1>
                        <p className="text-gray-500 text-sm">
                            Week {module?.week_number}: {module?.title}
                        </p>
                    </div>
                </div>

                <Link
                    to={`/admin/modules/${moduleId}/lessons/new`}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <PlusCircle size={16} /> Add Video Lesson
                </Link>
            </div>

            {/* Lesson List */}
            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-gray-400 font-medium mb-4">No content yet.</p>
                        <Link
                            to={`/admin/modules/${moduleId}/lessons/new`}
                            className="text-primary font-bold hover:underline"
                        >
                            Create First Lesson →
                        </Link>
                    </div>
                ) : (
                    lessons.map((lesson, index) => (
                        <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between group hover:shadow-md transition-all">

                            {/* Left: Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    {lesson.video_path ? <Video size={18} /> : <FileQuestion size={18} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        {index + 1}. {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${lesson.video_path
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>
                                            {lesson.video_path ? 'Published' : 'Draft (No Video)'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {Math.floor((lesson.duration_seconds || 0) / 60)}m {(lesson.duration_seconds || 0) % 60}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button title="Move Up" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded">
                                    <ArrowUp size={16} />
                                </button>
                                <button title="Move Down" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded">
                                    <ArrowDown size={16} />
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-2"></div>

                                <Link
                                    to={`/admin/lessons/${lesson.id}/edit`}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                    title="Edit Details"
                                >
                                    <Edit3 size={16} />
                                </Link>

                                <button
                                    onClick={() => handleDelete(lesson.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    title="Delete Lesson"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
