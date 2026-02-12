import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogOut, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save, BookOpen, Globe, Shield, CreditCard, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useConnectivity } from '../../context/ConnectivityContext';

const StudentProfile = () => {
    const { profile, user, signOut } = useAuth();
    const navigate = useNavigate();
    const { notifySyncFailure, registerRetry } = useConnectivity();

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
    const [enrollments, setEnrollments] = useState([]);
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (!user) return;

        const controller = new AbortController();
        const fetchData = () => fetchEnrollmentSummary(controller.signal);

        fetchData();
        const unregister = registerRetry(fetchData);

        return () => {
            controller.abort();
            unregister();
        };
    }, [user, registerRetry]);

    const fetchEnrollmentSummary = async (signal) => {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('*, courses(title)')
                .eq('student_id', user.id)
                .abortSignal(signal);

            if (error) throw error;
            setEnrollments(data || []);
            notifySyncFailure(false); // Success
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Error fetching enrollment summary:', err);
            notifySyncFailure(true);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setUpdateStatus({ type: '', message: '' });

        if (passwords.new !== passwords.confirm) {
            setUpdateStatus({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        if (passwords.new.length < 12) {
            setUpdateStatus({ type: 'error', message: 'Password must be at least 12 characters.' });
            return;
        }

        setIsUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            setUpdateStatus({ type: 'success', message: 'Security credentials updated successfully!' });
            setPasswords({ new: '', confirm: '' });
            notifySyncFailure(false);
        } catch (err) {
            console.error('Security update failed:', err);
            setUpdateStatus({ type: 'error', message: err.message || 'Failed to update password.' });
            notifySyncFailure(true);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };


    return (
        <div className="max-w-[1600px] mx-auto min-h-screen relative pb-20">
            {/* Watermark */}
            <div className="fixed right-0 bottom-0 opacity-[0.03] pointer-events-none z-0 transform translate-y-1/4 translate-x-1/4">
                <BookOpen size={600} />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center rounded-3xl">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-3xl mb-4 shadow-lg shadow-primary/30 rounded-full">
                            {profile?.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Anonymous User'}</h3>
                        <span className="text-xs font-medium text-gray-500 mb-6">@{profile?.username || 'user'}</span>

                        <div className="w-full space-y-1">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs text-gray-500 font-medium">Role</span>
                                <span className="text-xs font-bold text-gray-900 capitalize">{profile?.role || 'Student'}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs text-gray-500 font-medium">Status</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail size={18} className="text-gray-400" /> Contact Info
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Security & Settings */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Enrollments */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen size={20} className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900">Enrolled Courses</h3>
                        </div>

                        <div className="space-y-4">
                            {enrollments.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500">No active enrollments found</p>
                                </div>
                            ) : (
                                enrollments.map((enr) => (
                                    <div key={enr.id} className="bg-gray-50 p-4 flex items-center justify-between rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{enr.courses?.title || 'Core Component Path'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{enr.status}</p>
                                        </div>
                                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck size={20} className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900">Security</h3>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            {updateStatus.message && (
                                <div className={`p-4 flex items-center gap-3 rounded-2xl ${updateStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {updateStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <p className="text-xs font-bold">{updateStatus.message}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-medium rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Min 12 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-medium rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Repeat password"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-primary transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {isUpdating ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;


