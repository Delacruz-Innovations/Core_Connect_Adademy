import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    UserCircle, Mail, Shield,
    Lock, LogOut, Save,
    Camera, Settings, Bell,
    ShieldAlert
} from 'lucide-react';

const AdminProfile = () => {
    const { profile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-12 text-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Account Authority</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Profile Settings</h1>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-50 text-red-600 px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/5 flex items-center gap-3"
                >
                    <LogOut size={18} /> Terminate Session
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'general', icon: UserCircle, label: 'General Identity' },
                        { id: 'security', icon: Lock, label: 'Security & Access' },
                        { id: 'notifications', icon: Bell, label: 'Alert Preferences' },
                        { id: 'admin', icon: ShieldAlert, label: 'System Permissions' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all text-left ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-400 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Pane */}
                <div className="lg:col-span-9 bg-white border border-gray-100 shadow-sm p-12">

                    {activeTab === 'general' && (
                        <div className="space-y-12">
                            <div className="flex items-center gap-10 border-b border-gray-50 pb-12">
                                <div className="relative group">
                                    <div className="w-32 h-32 bg-primary/5 flex items-center justify-center text-primary font-black text-3xl border border-primary/10 transition-transform group-hover:scale-105">
                                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                                    </div>
                                    <button className="absolute -bottom-4 -right-4 w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-primary transition-all shadow-xl">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tight">{profile?.first_name} {profile?.last_name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Authorized Administrator</p>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">First Name</label>
                                    <input type="text" defaultValue={profile?.first_name} className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary h-14" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Last Name</label>
                                    <input type="text" defaultValue={profile?.last_name} className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary h-14" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Official Email Address</label>
                                    <input type="email" value={profile?.email} readOnly disabled className="w-full bg-gray-100 border-0 p-4 font-bold text-sm text-gray-400 cursor-not-allowed h-14" />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button className="bg-primary text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                                        <Save size={18} /> Update Principal Data
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-12 max-w-2xl">
                            <h3 className="text-xl font-black italic uppercase tracking-tight border-b border-gray-50 pb-6">Change Cryptographic Key</h3>
                            <form className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary h-14" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">New Secure Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary h-14" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary h-14" />
                                </div>
                                <button className="bg-black text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl flex items-center gap-3">
                                    <Shield size={18} /> Rotate Authentication Key
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <Bell size={48} className="mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">System notifications are currently handled by the <br />global mail engine (internal preference coming soon).</p>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-8">
                            <div className="bg-red-50 p-10 border border-red-100 flex items-center gap-8">
                                <ShieldAlert size={48} className="text-red-600" />
                                <div>
                                    <h4 className="text-lg font-black italic text-red-600 uppercase tracking-tight">Root Authority Granted</h4>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed mt-2">Your account has full write access to courses, student enrolments, and system identity logs. Exercise extreme caution.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Can Manage Users', active: true },
                                    { label: 'Can Manage Courses', active: true },
                                    { label: 'Can Access Audit Logs', active: true },
                                    { label: 'Can Manage AI Brain', active: true },
                                    { label: 'Can Delete Records', active: true },
                                    { label: 'Global Write Access', active: true }
                                ].map((perm, i) => (
                                    <div key={i} className="bg-gray-50 p-4 flex justify-between items-center border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{perm.label}</span>
                                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,204,0.6)] animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
