import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    ArrowLeft, CheckCircle, Lock,
    Video, BookOpen, AlertCircle, PlayCircle
} from 'lucide-react';

export default function ModuleViewPage() {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [locked, setLocked] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModuleData();
    }, [moduleId]);

    const fetchModuleData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Get Module Content
            const { data: modData, error } = await supabase
                .from('modules')
                .select('*')
                .eq('id', moduleId)
                .single();

            if (error) throw error;
            setModule(modData);

            // 2. CHECK LOCK STATUS
            if (modData.week_number === 1 && modData.status !== 'locked') {
                setLocked(false);
            } else {
                const { data: prog } = await supabase
                    .from('module_progress')
                    .select('status')
                    .eq('user_id', user.id)
                    .eq('module_id', moduleId)
                    .maybeSingle();

                if (prog) {
                    if (prog.status === 'unlocked' || prog.status === 'completed') {
                        setLocked(false);
                        if (prog.status === 'completed') setCompleted(true);
                    }
                }
            }

            // 3. Get Lessons (If Unlocked)
            if (!locked) {
                const { data: lessonsData } = await supabase
                    .from('lessons')
                    .select('id, title, duration_seconds, video_path')
                    .eq('module_id', moduleId)
                    .order('order_index', { ascending: true });

                setLessons(lessonsData || []);
            }

        } catch (error) {
            console.error('Error loading module:', error);
            navigate('/student/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteModule = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('module_progress')
                .upsert({
                    user_id: user.id,
                    course_id: courseId,
                    module_id: moduleId,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }, { onConflict: 'user_id, module_id' });

            if (error) throw error;
            setCompleted(true);
            alert('Module Completed! The next week is now unlocked.');
        } catch (error) {
            alert('Error completing module: ' + error.message);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center animate-pulse">Loading content...</div>;

    if (locked) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Lock size={24} className="text-gray-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Module Locked</h1>
                <p className="text-gray-500 mb-6">
                    You must complete the previous week's module before accessing this content.
                </p>
                <Link
                    to={`/student/course/${courseId}`}
                    className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold"
                >
                    Return to Course Overview
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 h-full overflow-y-auto">
            <Link to={`/student/course/${courseId}`} className="text-gray-400 hover:text-black flex items-center gap-2 mb-6 text-sm font-bold">
                <ArrowLeft size={16} /> Back to Curriculum
            </Link>

            <div className="mb-8 border-b border-gray-100 pb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                    Week {module.week_number}
                </span>
                <h1 className="text-3xl font-black text-gray-900 leading-tight mb-4">
                    {module.title}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                    {module.description || 'Welcome to this week\'s module. Complete all lessons below.'}
                </p>
            </div>

            {/* Lesson List */}
            <div className="space-y-4 mb-12">
                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-4">Video Lessons</h3>

                {lessons.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm italic">
                        No lessons available yet. Check back soon!
                    </div>
                ) : (
                    lessons.map((lesson, index) => (
                        <Link
                            key={lesson.id}
                            to={`/student/course/${lesson.course_id}/module/${moduleId}/lesson/${lesson.id}`}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-black/10 transition-all group"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <PlayCircle size={24} className="text-gray-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">
                                    {index + 1}. {lesson.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1">
                                    {Math.floor((lesson.duration_seconds || 0) / 60)} min • Video
                                </p>
                            </div>
                            <div className="ml-auto">
                                {/* Progress Status (Future: Check lesson_progress) */}
                                <span className="text-xs font-bold text-gray-300 px-3 py-1 bg-gray-50 rounded group-hover:bg-white transition-colors">
                                    Start Lesson →
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Module Completion Override (For now) */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-sm text-gray-900">Finished all lessons?</h4>
                    <p className="text-xs text-gray-500">
                        Once you've watched all videos, confirm completion to unlock the next week.
                    </p>
                </div>
                {completed ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <CheckCircle size={18} /> Module Complete
                    </div>
                ) : (
                    <button
                        onClick={handleCompleteModule}
                        className="px-6 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Mark Week Complete →
                    </button>
                )}
            </div>

        </div>
    );
}
