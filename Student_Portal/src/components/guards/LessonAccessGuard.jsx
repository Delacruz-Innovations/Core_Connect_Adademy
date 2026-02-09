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
                // Verify lesson exists and belongs to the specified module
                const { data: lesson } = await supabase
                    .from('lessons')
                    .select('id')
                    .eq('id', lessonId)
                    .eq('module_id', moduleId)
                    .single();

                if (lesson) {
                    setAccess(true);
                } else {
                    setAccess(false);
                }
            } catch (err) {
                console.error('Guard Check Failed (Fail-Open)', err);
                setAccess(true);
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
