import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, CheckCircle, PlayCircle, Loader2 } from 'lucide-react';
import SecureVideoPlayer from '../../components/SecureVideoPlayer';

export default function LessonPlayerPage() {
    const { courseId, moduleId, lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [savedPosition, setSavedPosition] = useState(0);

    useEffect(() => {
        fetchLessonData();
    }, [lessonId]);

    const fetchLessonData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Get Lesson Info
            const { data: lessonData, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', lessonId)
                .single();

            if (error) throw error;
            setLesson(lessonData);

            // 2. Check Progress
            const { data: prog } = await supabase
                .from('lesson_progress')
                .select('is_completed, last_position_seconds')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonId)
                .maybeSingle();

            if (prog) {
                if (prog.is_completed) setCompleted(true);
                // Pass this to player
                setSavedPosition(prog.last_position_seconds || 0);
            }

        } catch (err) {
            console.error('Error loading lesson:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center animate-pulse"><Loader2 size={32} /></div>;

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">

            {/* Main Content (Video) */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-4 left-4 z-10">
                    <Link to={`/student/course/${courseId}/module/${moduleId}`} className="flex items-center gap-2 text-gray-400 hover:text-white bg-black/50 p-2 rounded-lg backdrop-blur hover:bg-black/80 transition-all">
                        <ArrowLeft size={16} /> Back to Module
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center bg-zinc-900">
                    {lesson.video_path ? (
                        <div className="w-full max-w-5xl aspect-video shadow-2xl">
                            <SecureVideoPlayer
                                lessonId={lessonId}
                                videoPath={lesson.video_path}
                                initialTime={savedPosition}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold">No Video Content</h3>
                            <p className="text-sm">This lesson contains no video media.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">{lesson.title}</h1>
                        <p className="text-sm text-gray-400 mt-1">{lesson.description || 'No description available.'}</p>
                    </div>

                    {completed ? (
                        <div className="flex items-center gap-2 text-green-500 font-bold px-4 py-2 bg-green-500/10 rounded-lg">
                            <CheckCircle size={18} /> Completed
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">
                            Watch 90% to complete
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Lesson List - Future Enhancement) */}
            {/* We can show other lessons in this module here for quick navigation */}
        </div>
    );
}
