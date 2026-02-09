import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogOut, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save, Fingerprint, History, Globe, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
    const { profile, user, signOut } = useAuth();
    const navigate = useNavigate();

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
    const [enrollments, setEnrollments] = useState([]);
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            fetchEnrollmentSummary();
        }
    }, [user]);

    const fetchEnrollmentSummary = async () => {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('*, courses(title)')
                .eq('student_id', user.id);

            if (error) throw error;
            setEnrollments(data || []);
        } catch (err) {
            console.error('Error fetching enrollment summary:', err);
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
        } catch (err) {
            setUpdateStatus({ type: 'error', message: err.message || 'Failed to update password.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };


    return (
        <div className="space-y-8 md:space-y-12 mx-auto min-h-screen">

            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Account Settings</span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        My Profile
                    </h1>
                </div>
                <div className="flex w-full md:w-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full md:w-auto bg-white border border-red-100 text-red-500 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left: Identity Node */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-gray-100 shadow-xl shadow-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden group rounded-sm">
                        <div className="w-24 h-24 bg-primary text-white flex items-center justify-center font-bold text-3xl mb-6 shadow-lg shadow-primary/20 rounded-full">
                            {profile?.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>

                        <div className="space-y-2 mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">{profile?.full_name || 'Anonymous User'}</h3>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">@{profile?.username || 'user'}</span>
                        </div>

                        <div className="w-full space-y-4 pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-4 text-left p-4 hover:bg-gray-50 transition-colors rounded-sm cursor-default">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-sm">
                                    <Mail size={16} />
                                </div>
                                <div className="leading-tight overflow-hidden">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                    <p className="text-xs font-bold text-gray-900 truncate" title={user?.email}>{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left p-4 hover:bg-gray-50 transition-colors rounded-sm cursor-default">
                                <div className="p-2 bg-gray-50 text-gray-400 rounded-sm">
                                    <ShieldCheck size={16} />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Access Role</p>
                                    <p className="text-xs font-bold text-gray-900 uppercase leading-none">{profile?.role || 'Student'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 w-full flex justify-between items-center px-2">
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                                </span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Region</span>
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                    <Globe size={10} className="text-primary" /> GLOBAL
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Security Hub & Enrolments */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Security Protocol Block */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm rounded-sm">
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                            <Lock size={20} className="text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Security Settings</h3>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-8">
                            {updateStatus.message && (
                                <div className={`p-4 flex items-center gap-3 border-l-4 ${updateStatus.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                                    {updateStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{updateStatus.message}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">New Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full bg-white border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-300 rounded-sm"
                                            placeholder="••••••••••••"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                            <Lock size={14} />
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Minimum 12 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-white border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-300 rounded-sm"
                                            placeholder="••••••••••••"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                            <Shield size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="bg-primary text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg rounded-sm"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {isUpdating ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Active Learning Nodes */}
                    <div className="bg-white border border-gray-100 p-8 shadow-sm rounded-sm">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                            <History size={20} className="text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Enrollment Status</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {enrollments.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-100 p-12 text-center bg-gray-50 rounded-sm">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active enrollments found</p>
                                </div>
                            ) : (
                                enrollments.map((enr) => (
                                    <div key={enr.id} className="bg-white border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-primary/30 transition-all group rounded-sm gap-4">
                                        <div className="leading-tight">
                                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">Active Course</p>
                                            <p className="text-sm font-black uppercase tracking-tight text-gray-900">{enr.courses?.title || 'Core Component Path'}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-bold uppercase bg-green-50 text-green-600 px-3 py-1.5 border border-green-100 flex items-center gap-2 rounded-sm">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                {enr.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;


