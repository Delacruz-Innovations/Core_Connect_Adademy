import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    FileCheck, History, Database, UserCircle,
    LogOut, Menu, X, Bell, Search, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
    <Link
        to={href}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

const AdminLayout = () => {
    const { profile, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'User Management', icon: Users, href: '/admin/users' },
        { label: 'Courses', icon: BookOpen, href: '/admin/courses' },
        { label: 'Enrolments', icon: GraduationCap, href: '/admin/enrolments' },
        { label: 'AI Knowledge', icon: Database, href: '/admin/ai-knowledge' },
        { label: 'Audit Logs', icon: History, href: '/admin/audit-logs' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-10 w-auto" />
                    </Link>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={location.pathname.startsWith(item.href)}
                        />
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-gray-400 hover:text-primary lg:hidden"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-md">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="bg-transparent border-none outline-none text-sm w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationCenter />

                        <div className="w-px h-8 bg-gray-100"></div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end leading-tight">
                                <span className="text-sm font-bold text-black">Master Admin</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck size={10} /> Root Authority
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                HQ
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
