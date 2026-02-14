import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    FileCheck, History, Database, UserCircle,
    LogOut, Menu, X, Bell, Search, ShieldCheck, Settings, HelpCircle,
    MessageSquare, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';

const SidebarItem = ({ icon: Icon, label, href, active, onClick }) => (
    <Link
        to={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all border-l-4 ${active
            ? 'bg-primary/10 text-primary border-primary'
            : 'text-gray-500 hover:bg-gray-50 hover:text-black border-transparent'
            }`}
    >
        <Icon size={18} className={active ? 'text-primary' : 'text-gray-400'} />
        <span className="uppercase tracking-wide text-[11px]">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 bg-secondary rounded-full" />}
    </Link>
);

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'User Operations', icon: Users, href: '/admin/users' },
        { label: 'Course Catalog', icon: BookOpen, href: '/admin/courses' },
        { label: 'Assignment Review', icon: FileCheck, href: '/admin/assignments' },
        { label: 'Admissions Desk', icon: FileCheck, href: '/admin/applications' },
        { label: 'Student Enrolments', icon: GraduationCap, href: '/admin/enrolments' },
        { label: 'Student Q&A Desk', icon: MessageSquare, href: '/admin/qa' },
        { label: 'AI Knowledge Base', icon: Database, href: '/admin/ai-knowledge' },
        { label: 'Advanced Analytics', icon: TrendingUp, href: '/admin/analytics' },
        { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
    ];

    const secondaryNav = [
        { label: 'Platform Settings', icon: Settings, href: '/admin/settings' },
        { label: 'Support & Help', icon: HelpCircle, href: '/admin/support' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-primary selection:text-white">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transition-transform duration-300 transform lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                        <div className="bg-primary/5 p-2 rounded border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm text-gray-900 uppercase tracking-tighter leading-none">Core Connect</span>
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest mt-0.5">Admin Console</span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
                    <div className="space-y-1">
                        <div className="px-6 mb-2 text-[10px] font-black uppercase text-gray-300 tracking-widest">Main Modules</div>
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={location.pathname.startsWith(item.href)}
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            />
                        ))}
                    </div>

                    <div className="space-y-1 pt-6 border-t border-gray-100 mx-4">
                        <div className="px-2 mb-2 text-[10px] font-black uppercase text-gray-300 tracking-widest">System</div>
                        {secondaryNav.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={location.pathname.startsWith(item.href)}
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            />
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border-l-4 border-transparent hover:border-red-600"
                        >
                            <LogOut size={18} />
                            <span className="uppercase tracking-wide text-[11px]">Secure Logout</span>
                        </button>
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-black text-xs">
                            {user?.email ? user.email.substring(0, 1).toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Super Admin</p>
                        </div>
                        <Link to="/admin/profile" className="ml-auto p-1.5 hover:bg-white rounded text-gray-400 hover:text-primary transition-colors">
                            <Settings size={14} />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'} bg-[#f8fafc] relative min-h-screen brand-watermark-bg`}>

                {/* Gradient Top Line */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-[#0052a3] to-secondary fixed top-0 left-0 right-0 z-[60]" />

                {/* Topbar */}
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-gray-400 hover:text-primary lg:hidden border border-gray-200 rounded hover:border-primary transition-colors shrink-0"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Mobile Logo Visibility */}
                        <div className="lg:hidden flex flex-col -space-y-1 shrink-0">
                            <span className="font-black text-[10px] text-gray-900 uppercase tracking-tighter leading-tight">Core Connect</span>
                            <span className="text-[8px] font-bold text-secondary uppercase tracking-widest leading-tight">Admin Console</span>
                        </div>

                        {/* Search Bar - Visible on Tablet (md) and Desktop (lg) */}
                        <div className="hidden md:flex items-center gap-3 text-gray-400 bg-gray-50 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white px-3 md:px-4 py-2 md:py-2.5 rounded transition-all w-full max-w-[120px] md:max-w-xs lg:max-w-md group ml-2">
                            <Search size={14} className="group-focus-within:text-primary transition-colors shrink-0" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-[10px] md:text-xs font-medium w-full text-gray-700 placeholder:text-gray-400 uppercase tracking-wide"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 leading-none">System Status</div>
                                <div className="flex items-center justify-end gap-1.5 leading-none mt-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-gray-900 uppercase">Operational</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                            <NotificationCenter />
                        </div>
                    </div>
                </header>

                {/* Page Content Injection */}
                <div className="p-4 sm:p-6 md:p-8 pb-20 relative z-10">
                    <Outlet />
                </div>

                {/* Footer Branding */}
                <footer className="mt-auto py-6 px-4 md:px-8 border-t border-gray-200 bg-white/50 backdrop-blur flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center md:text-left">
                    <span>&copy; 2026 Core Connect Academy. All Rights Reserved.</span>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                        <span className="hover:text-primary cursor-pointer whitespace-nowrap">Privacy Protocol</span>
                        <span className="hover:text-primary cursor-pointer whitespace-nowrap">Admin Terms</span>
                        <span className="flex items-center gap-1 whitespace-nowrap"><ShieldCheck size={10} /> Secure Environment</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
