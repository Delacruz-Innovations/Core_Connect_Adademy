import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function VerificationGuard() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    // If user is not logged in, AuthGuard (parent) should have handled it, 
    // but we add a safety check.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if the email is confirmed
    const isEmailVerified = !!user.email_confirmed_at;

    if (!isEmailVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
}
