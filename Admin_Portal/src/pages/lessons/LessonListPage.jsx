import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, PlusCircle, Video,
    Trash2, Edit3, ArrowUp, ArrowDown, FileQuestion,
    Clapperboard, PlayCircle, Clock, FileText, Layers
} from 'lucide-react';
import DocumentManager from '../../components/documents/DocumentManager';
import { useModal } from '../../context/ModalContext';
import BrandedLoader from '../../components/BrandedLoader';

export default function LessonListPage() {
    const { moduleId } = useParams();
    const { showAlert, showConfirm } = useModal();
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReordering, setIsReordering] = useState(false);
    const [activeLessonDocs, setActiveLessonDocs] = useState(null);

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

    const handleMove = async (index, direction) => {
        if (isReordering) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= lessons.length) return;

        setIsReordering(true);
        const currentLesson = lessons[index];
        const swapLesson = lessons[newIndex];

        try {
            // Swap order_index using separate updates to avoid NOT NULL constraint issues on title
            const update1 = supabase.from('lessons')
                .update({ order_index: swapLesson.order_index })
                .eq('id', currentLesson.id);

            const update2 = supabase.from('lessons')
                .update({ order_index: currentLesson.order_index })
                .eq('id', swapLesson.id);

            const results = await Promise.all([update1, update2]);
            const error = results.find(r => r.error)?.error;

            if (error) throw error;
            await fetchData();
        } catch (err) {
            await showAlert('Reordering failed: ' + err.message, 'Error', 'error');
        } finally {
            setIsReordering(false);
        }
    };

    const handleDelete = async (lessonId) => {
        if (!await showConfirm('Are you sure you want to delete this lesson?', 'Confirm Deletion')) return;
        try {
            const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
            if (error) throw error;
            await fetchData();
            await showAlert('Lesson deleted successfully', 'Success', 'success');
        } catch (err) {
            console.error('Error deleting lesson:', err);
            await showAlert(err.message, 'Deletion Error', 'error');
        }
    };

    if (loading) return <BrandedLoader message="Synchronizing Content Blocks..." />;

    return (
        <div className="mx-auto py-8 px-4 space-y-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-2 border-gray-50 pb-8">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${module?.course_id}/modules`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Clapperboard size={24} className="text-primary" /> Lesson Studio
                        </h1>
                        <p className="text-gray-500 text-sm font-medium italic">
                            Week {module?.week_number}: {module?.title}
                        </p>
                    </div>
                </div>

                <Link
                    to={`/admin/modules/${moduleId}/lessons/new`}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
                >
                    <PlusCircle size={16} /> Create Video Lesson
                </Link>
            </div>

            {/* Module Documents Authority */}
            <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 shadow-sm">
                <DocumentManager parentType="module" parentId={moduleId} />
            </div>

            {/* Lesson List Hierarchy */}
            <div className="space-y-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                    <Layers size={18} className="text-primary" /> Lesson Hierarchy
                </h2>

                <div className="space-y-4">
                    {lessons.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                            <PlayCircle size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-4">No lessons have been authored for this week</p>
                            <Link
                                to={`/admin/modules/${moduleId}/lessons/new`}
                                className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
                            >
                                + Author First Lesson
                            </Link>
                        </div>
                    ) : (
                        lessons.map((lesson, index) => (
                            <div key={lesson.id} className="space-y-4">
                                <div className={`bg-white border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between group transition-all ${isReordering ? 'opacity-50 grayscale' : 'hover:border-black/20 hover:shadow-xl'}`}>

                                    {/* Left: Info */}
                                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${lesson.video_path ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                            {lesson.video_path ? <Video size={20} /> : <FileQuestion size={20} />}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">
                                                {index + 1}. {lesson.title}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border tracking-widest ${lesson.video_path
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                    {lesson.video_path ? 'Live' : 'Draft'}
                                                </span>
                                                <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em] flex items-center gap-1">
                                                    <Clock size={10} /> {Math.floor((lesson.duration_seconds || 0) / 60)}m {(lesson.duration_seconds || 0) % 60}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                        <button
                                            onClick={() => setActiveLessonDocs(activeLessonDocs === lesson.id ? null : lesson.id)}
                                            className={`p-3 rounded-xl transition-colors ${activeLessonDocs === lesson.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}
                                            title="Manage Lesson Documents"
                                        >
                                            <FileText size={18} />
                                        </button>

                                        <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block"></div>

                                        <button
                                            onClick={() => handleMove(index, 'up')}
                                            disabled={index === 0 || isReordering}
                                            className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl disabled:opacity-20 transition-colors"
                                        >
                                            <ArrowUp size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(index, 'down')}
                                            disabled={index === lessons.length - 1 || isReordering}
                                            className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl disabled:opacity-20 transition-colors"
                                        >
                                            <ArrowDown size={18} />
                                        </button>

                                        <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block"></div>

                                        <Link
                                            to={`/admin/lessons/${lesson.id}/edit`}
                                            className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                            title="Edit Content"
                                        >
                                            <Edit3 size={18} />
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(lesson.id)}
                                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Destroy"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Lesson Documents Expansion */}
                                {activeLessonDocs === lesson.id && (
                                    <div className="ml-12 p-6 bg-white border border-gray-100 rounded-3xl shadow-inner animate-in fade-in slide-in-from-top-2">
                                        <DocumentManager parentType="lesson" parentId={lesson.id} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Safe Zone */}
            <div className="mt-12 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Pedagogical Constraints</p>
                <ul className="text-[10px] font-bold text-gray-500 space-y-1 list-disc pl-4 italic">
                    <li>Lessons must belong to a module; orphan lessons are not permitted by the schema.</li>
                    <li>Visual ordering (Top to Bottom) dictates the study sequence for students.</li>
                    <li>'Draft' status indicates missing media or incomplete description.</li>
                    <li>Documents are cryptographic references and do not bypass module locking.</li>
                </ul>
            </div>
        </div>
    );
}
