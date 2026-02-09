import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

export default function GuestGuard() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (user) {
        return <Navigate to="/student/dashboard" replace />;
    }

    return <Outlet />;
}
