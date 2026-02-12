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
                // 1. Verify module exists and get status
                // We only filter by moduleId here because it's a UUID and should be unique.
                // This avoids issues if courseId in URL is a slug but DB expects UUID.
                const { data: modDetails, error: modError } = await supabase
                    .from('modules')
                    .select('id, week_number, status')
                    .eq('id', moduleId)
                    .maybeSingle();

                if (modError) throw modError;

                if (!modDetails) {
                    console.error("Module guard: Module not found", moduleId);
                    setAccess(false);
                    return;
                }

                // 2. Check actual progress status
                const { data: progress, error: progError } = await supabase
                    .from('module_progress')
                    .select('status')
                    .eq('module_id', moduleId)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (progError) {
                    console.warn("Module guard: Progress fetch error (fail-open):", progError);
                }

                // Access Logic:
                // a) Module is globally unlocked by admin
                // b) It's Week 1 (standard introductory content)
                // c) Student has a progress record marked unlocked/completed
                const isUnlocked = modDetails?.status === 'unlocked' ||
                    modDetails?.week_number === 1 ||
                    progress?.status === 'unlocked' ||
                    progress?.status === 'completed';

                if (isUnlocked) {
                    setAccess(true);
                } else {
                    // Final check: if it's Module 2+, we double check if Module 1 is completed
                    // But for now, we follow the explicit isUnlocked flag.
                    setAccess(false);
                }
            } catch (err) {
                console.error("Guard Error (Fail-Open):", err);
                setAccess(true); // Don't block student on network/query glitch
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
