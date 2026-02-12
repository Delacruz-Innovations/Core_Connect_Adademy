import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function LessonAccessGuard() {
    const { user } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const [access, setAccess] = useState(null);

    useEffect(() => {
        if (!user || !lessonId || !moduleId) {
            setAccess(false);
            return;
        }

        const checkLessonLink = async () => {
            try {
                // 1. Fetch lesson details
                const { data: lesson, error: lessonError } = await supabase
                    .from('lessons')
                    .select('id, module_id, order_index')
                    .eq('id', lessonId)
                    .maybeSingle();

                if (lessonError) throw lessonError;

                if (!lesson) {
                    console.error("Lesson guard: Lesson not found", lessonId);
                    setAccess(false);
                    return;
                }

                // 2. Check Module Unlock Status
                const { data: modDetails, error: modError } = await supabase
                    .from('modules')
                    .select('id, week_number, status')
                    .eq('id', moduleId)
                    .maybeSingle();

                if (modError) throw modError;

                const { data: modProgress, error: progError } = await supabase
                    .from('module_progress')
                    .select('status')
                    .eq('module_id', moduleId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (progError) {
                    console.warn("Lesson guard: Progress fetch error (fail-open):", progError);
                }

                const isUnlocked = modDetails?.status === 'unlocked' ||
                    modDetails?.week_number === 1 ||
                    modProgress?.status === 'unlocked' ||
                    modProgress?.status === 'completed';

                if (!isUnlocked) {
                    setAccess(false);
                    return;
                }

                // 3. Sequential check: Previous lesson must be completed
                if (lesson.order_index > 0) {
                    const { data: prevLesson } = await supabase
                        .from('lessons')
                        .select('id')
                        .eq('module_id', moduleId)
                        .eq('order_index', lesson.order_index - 1)
                        .maybeSingle();

                    if (prevLesson) {
                        const { data: prevProgress } = await supabase
                            .from('lesson_progress')
                            .select('is_completed')
                            .eq('lesson_id', prevLesson.id)
                            .eq('user_id', user.id)
                            .maybeSingle();

                        if (!prevProgress?.is_completed && lesson.order_index > 1) {
                            // If index is 1, it's the second lesson.
                            // We only block if it's NOT the first lesson of the module.
                            setAccess(false);
                            return;
                        }
                    }
                }

                setAccess(true);
            } catch (err) {
                console.error('Guard Check Failed (Fail-Open)', err);
                setAccess(true); // Don't block student on network glitch
            }
        };

        checkLessonLink();
    }, [user, moduleId, lessonId]);

    if (access === null) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
                <LoadingSpinner />
                <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Initializing Stream...</div>
            </div>
        );
    }

    if (access === false) {
        return <Navigate to={`/student/course/${courseId}`} replace />;
    }

    return <Outlet />;
}
