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

        const checkLessonAccess = async () => {
            try {
                // 1. Get current lesson order
                const { data: currentLesson, error: currError } = await supabase
                    .from('lessons')
                    .select('order_index')
                    .eq('id', lessonId)
                    .single();

                if (currError || !currentLesson) {
                    // Lesson not found? Block.
                    setAccess(false);
                    return;
                }

                // If it's the very first possible lesson (index 1), allow.
                if (currentLesson.order_index === 1) {
                    setAccess(true);
                    return;
                }

                // 2. Find THE immediate predecessor (robust to gaps)
                const { data: prevLesson, error: prevError } = await supabase
                    .from('lessons')
                    .select('id')
                    .eq('module_id', moduleId)
                    .lt('order_index', currentLesson.order_index) // Less than current
                    .order('order_index', { ascending: false })   // Highest index below current
                    .limit(1)
                    .maybeSingle();

                if (prevError) {
                    console.error('Error finding previous lesson:', prevError);
                    setAccess(false);
                    return;
                }

                if (!prevLesson) {
                    // No previous lesson exists (e.g. current is index 5 but 1-4 deleted/missing?)
                    // If no predecessor, treat as first lesson.
                    setAccess(true);
                    return;
                }

                // 3. Check if previous is completed
                const { data: progress } = await supabase
                    .from('lesson_progress')
                    .select('is_completed')
                    .eq('user_id', user.id)
                    .eq('lesson_id', prevLesson.id)
                    .maybeSingle();

                if (progress && progress.is_completed) {
                    setAccess(true);
                } else {
                    // Previous lesson NOT completed -> Block
                    setAccess(false);
                }

            } catch (err) {
                console.error('Guard Check Failed', err);
                setAccess(false);
            }
        };

        checkLessonAccess();
    }, [user, moduleId, lessonId]);

    if (access === null) {
        return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (access === false) {
        // Redirect to Module Overview if lesson locked
        return <Navigate to={`/student/course/${courseId}/module/${moduleId}`} replace />;
    }

    return <Outlet />;
}
