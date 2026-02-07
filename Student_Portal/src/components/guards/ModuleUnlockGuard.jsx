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

        const checkUnlock = async () => {
            // Unlocked if:
            // 1. Module is Week 1 (Auto-unlocked via trigger now)
            // 2. module_progress exists with status 'unlocked' or 'completed'

            const { data } = await supabase
                .from('module_progress')
                .select('status')
                .eq('user_id', user.id)
                .eq('module_id', moduleId)
                .in('status', ['unlocked', 'completed'])
                .maybeSingle();

            if (data) {
                setAccess(true);
            } else {
                // Double check if it's Week 1 and trigger failed?
                // The backend trigger handles Week 1 unlock on enrollment.
                // If checking fails, access denied.
                setAccess(false);
            }
        };

        checkUnlock();
    }, [user, moduleId]);

    if (access === null) {
        return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (access === false) {
        // Redirect to Course Overview if module is locked
        return <Navigate to={`/student/course/${courseId}`} replace />;
    }

    return <Outlet />;
}
