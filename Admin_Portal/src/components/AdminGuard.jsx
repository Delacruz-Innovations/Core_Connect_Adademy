import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandedLoader from './BrandedLoader';

/**
 * AdminGuard - SECURE ACCESS CONTROL
 * Objective: Restrict access to authorized admin email only.
 * Authorized: delacruzltd.sam@gmail.com
 */
export default function AdminGuard() {
    const { user, isAdmin, loading } = useAuth();

    // While determining session, show loader
    if (loading) {
        return <BrandedLoader message="Verifying Administrative Access..." />;
    }

    // Must be logged in AND must have the authorized email
    if (!user || !isAdmin) {
        console.warn('Unauthorized access attempt to admin area.');
        return <Navigate to="/admin/login" replace />;
    }

    // Authorized access granted
    return <Outlet />;
}
