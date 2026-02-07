import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function EnrolmentGuard() {
    const { user } = useAuth();
    const { courseId } = useParams();
    const [access, setAccess] = useState(null); // null = loading, true = allowed, false = denied

    useEffect(() => {
        if (!user || !courseId) return;

        const checkEnrolment = async () => {
            const { data, error } = await supabase
                .from('enrollments')
                .select('status')
                .eq('student_id', user.id)
                .eq('course_id', courseId)
                .eq('status', 'active')
                .maybeSingle();

            if (data) {
                setAccess(true);
            } else {
                setAccess(false);
            }
        };

        checkEnrolment();
    }, [user, courseId]);

    if (access === null) {
        return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (access === false) {
        // Redirect to Course Detail (Sales Page) if access denied
        return <Navigate to={`/courses/${courseId}`} replace />;
    }

    return <Outlet />;
}
