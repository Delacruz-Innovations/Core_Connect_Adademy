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
                // 1. Fetch lesson details and its order context
                const { data: lesson, error: lessonError } = await supabase
                    .from('lessons')
                    .select('id, module_id, order_index')
                    .eq('id', lessonId)
                    .single(); // Lessons should exist, so single is fine here

                if (lessonError || !lesson) {
                    setAccess(false);
                    return;
                }

                // 2. Check Module Unlock Status
                const { data: modDetails } = await supabase
                    .from('modules')
                    .select('id, week_number')
                    .eq('id', moduleId)
                    .single();

                const { data: modProgress } = await supabase
                    .from('module_progress')
                    .select('status')
                    .eq('module_id', moduleId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                // Access granted if:
                // a) Progress record exists and is unlocked/completed
                // b) Record missing but it's Week 1 (and earlier enrollment check passed by implication of being here)
                const isUnlocked = modProgress?.status === 'unlocked' ||
                    modProgress?.status === 'completed' ||
                    modDetails?.week_number === 1;

                if (!isUnlocked) {
                    setAccess(false);
                    return;
                }

                // 3. If not the first lesson, check if previous lesson is completed
                if (lesson.order_index > 1) {
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

                        if (!prevProgress?.is_completed) {
                            setAccess(false);
                            return;
                        }
                    }
                }

                setAccess(true);
            } catch (err) {
                console.error('Guard Check Failed (Fail-Open)', err);
                setAccess(true); // Don't block on network glitch
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
