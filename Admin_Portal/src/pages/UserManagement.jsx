import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, Search, Filter, Mail, Shield,
    ChevronRight, CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';

const UserManagement = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const users = [
        { id: 1, name: "John Smith", email: "john@example.com", role: "student", verified: true, enrolment: "Active" },
        { id: 2, name: "Sarah Williams", email: "sarah@example.com", role: "lead", verified: true, enrolment: "None" },
        { id: 3, name: "Michael Chen", email: "michael@example.com", role: "student", verified: false, enrolment: "Active" },
        { id: 4, name: "Emily Brown", email: "emily@example.com", role: "admin", verified: true, enrolment: "N/A" },
        { id: 5, name: "David Miller", email: "david@example.com", role: "student", verified: true, enrolment: "Active" }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Identity Access</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">User Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 bg-white border border-gray-100 px-4 py-3 rounded-none shadow-sm">
                        <Search size={18} />
                        <input type="text" placeholder="Search by name or email..." className="bg-transparent border-none outline-none text-sm w-64 font-bold" />
                    </div>
                    <button className="bg-primary text-white p-3 shadow-xl shadow-primary/20 hover:bg-black transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-wrap gap-8 items-center">
                <div className="flex gap-4">
                    {['all', 'admin', 'student', 'lead'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 transition-all ${filter === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="w-px h-6 bg-gray-100"></div>
                <div className="flex gap-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary">Verified Only</button>
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary">Enrolled Only</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enrolment</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black text-sm">{user.name}</p>
                                            <p className="text-gray-400 text-xs font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${user.role === 'admin' ? 'text-red-500 bg-red-50' : user.role === 'student' ? 'text-primary bg-primary/5' : 'text-gray-500 bg-gray-100'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    {user.verified ? (
                                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 size={14} /> Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                            <XCircle size={14} /> Pending
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-bold text-gray-600">{user.enrolment}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        to={`/admin/users/${user.id}`}
                                        className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-black transition-colors"
                                    >
                                        Manage Profile <ChevronRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex justify-between items-center bg-white p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing 5 of 842 total users</p>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <button key={i} className={`w-8 h-8 flex items-center justify-center text-[10px] font-black ${i === 1 ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}>0{i}</button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
