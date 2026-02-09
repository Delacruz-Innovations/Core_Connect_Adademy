import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function ModuleUnlockGuard() {
    const { user } = useAuth();
    const { courseId, moduleId } = useParams();
    const [access, setAccess] = useState(null);

    useEffect(() => {
        if (!user || !moduleId) return;

        const checkEnrolment = async () => {
            try {
                // We trust EnrolmentGuard for basic access. 
                // Here we just verify the module exists and belongs to the course.
                const { data: modDetails } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('id', moduleId)
                    .eq('course_id', courseId)
                    .single();

                if (modDetails) {
                    setAccess(true);
                } else {
                    setAccess(false);
                }
            } catch (err) {
                console.error("Guard Error (Fail-Open):", err);
                setAccess(true); // Don't block on network glitch
            }
        };

        checkEnrolment();
    }, [user, courseId, moduleId]);

    if (access === null) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-6">
                <LoadingSpinner />
                <div className="font-black uppercase tracking-[0.4em] text-gray-400 text-[10px] animate-pulse">Establishing Secure Stream...</div>
            </div>
        );
    }

    if (access === false) {
        return <Navigate to="/student/courses" replace />;
    }

    return <Outlet />;
}
