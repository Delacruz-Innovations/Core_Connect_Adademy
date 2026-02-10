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
                // 1. Verify module belongs to course
                const { data: modDetails } = await supabase
                    .from('modules')
                    .select('id, week_number')
                    .eq('id', moduleId)
                    .eq('course_id', courseId)
                    .single();

                if (!modDetails) {
                    setAccess(false);
                    return;
                }

                // 2. Check actual progress status
                const { data: progress } = await supabase
                    .from('module_progress')
                    .select('status')
                    .eq('module_id', moduleId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                // week 1 is usually auto-unlocked by trigger, but we check status explicitly
                // or allow if it's week 1 and record hasn't been created yet.
                if (progress?.status === 'unlocked' || progress?.status === 'completed' || modDetails?.week_number === 1) {
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
