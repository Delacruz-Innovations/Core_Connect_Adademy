import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminGuard() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex text-center items-center justify-center font-bold animate-pulse">Checking Permissions...</div>;
    }

    // 1. Must be logged in
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // 2. If user is present but profile is still null, we are likely in a safety-timeout scenario 
    // or slow fetch. We should wait for profile before denying.
    if (!profile) {
        return <div className="h-screen flex text-center items-center justify-center font-bold">Verifying Admin Status...</div>;
    }

    // 3. Must be an ADMIN
    if (profile.role !== 'admin') {
        return (
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-3xl font-black text-red-600">Access Denied</h1>
                <p className="font-medium text-gray-500 italic px-8 text-center">Your account ({user.email}) does not have administrative privileges.</p>
                <a href="/admin/login" className="px-6 py-2 bg-black text-white rounded font-bold uppercase text-xs" onClick={() => window.location.reload()}>Try Again</a>
            </div>
        );
    }

    return <Outlet />;
}
