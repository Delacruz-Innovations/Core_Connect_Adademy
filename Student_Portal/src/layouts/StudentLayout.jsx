import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import {
    LayoutDashboard, BookOpen, FileText,
    Download, MessageSquare, User,
    LogOut, Menu, X, ChevronRight,
    GraduationCap, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, href, active, onClick }) => (
    <Link
        to={href}
        onClick={onClick}
        className={`flex items-center justify-between px-6 py-3.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 group ${active
            ? 'text-primary bg-primary/5 border-r-4 border-primary'
            : 'text-gray-400 hover:text-black hover:bg-gray-50'
            }`}
    >
        <div className="flex items-center gap-4">
            <Icon size={18} className={`${active ? 'text-primary' : 'text-gray-400 group-hover:text-black'}`} />
            <span>{label}</span>
        </div>
        {active && <ChevronRight size={14} className="text-primary" />}
    </Link>
);

const SidebarSection = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="px-8 mb-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">{title}</h3>
        <div className="flex flex-col">
            {children}
        </div>
    </div>
);

const StudentLayout = () => {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Responsive Sidebar Handling
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const sections = [
        {
            title: "Navigation",
            items: [
                { label: 'Dashboard Overview', icon: LayoutDashboard, href: '/student/dashboard' },
                { label: 'Academic Courses', icon: BookOpen, href: '/student/courses' },
            ]
        },
        {
            title: "Academic Tools",
            items: [
                { label: 'Assignments Hub', icon: FileText, href: '/student/assignments' },
                { label: 'Resource Library', icon: Download, href: '/student/resources' },
            ]
        },
        {
            title: "Support & AI",
            items: [
                { label: 'AI Knowledge Hub', icon: MessageSquare, href: '/student/ai-assistant' },
            ]
        },
        {
            title: "User Account",
            items: [
                { label: 'My Learning Profile', icon: User, href: '/student/profile' },
            ]
        }
    ];

    const isActive = (href) => {
        if (href === '/student/dashboard') return location.pathname === href;
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex text-black">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-24 flex items-center px-8 border-b border-gray-50 bg-white sticky top-0 z-10">
                    <Link to="/student/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-10 w-auto" />
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-black tracking-tight uppercase">CORE CONNECT</span>
                            <span className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase">Academy</span>
                        </div>
                    </Link>
                </div>

                <div className="py-8 h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar">
                    {sections.map((section, idx) => (
                        <SidebarSection key={idx} title={section.title}>
                            {section.items.map((item) => (
                                <SidebarItem
                                    key={item.href}
                                    {...item}
                                    active={isActive(item.href)}
                                    onClick={() => isMobile && setIsSidebarOpen(false)}
                                />
                            ))}
                        </SidebarSection>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
                    <button
                        onClick={handleSignOut}
                        className="group w-full flex items-center justify-between px-6 py-4 rounded-xl bg-gray-50 hover:bg-black transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={16} className="text-red-500 group-hover:text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-white">Sign Out</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-white" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen && !isMobile ? 'lg:ml-72' : ''}`}>
                {/* Modern Top Header */}
                <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-gray-50 flex items-center justify-between px-6 md:px-12 sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-gray-50 rounded-xl text-black hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 italic">
                            <GraduationCap size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Enrollment: Elite Track</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6 pr-8 border-r border-gray-100">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Session</span>
                                <span className="text-xs font-bold text-black flex items-center gap-2">
                                    <Clock size={12} className="text-primary" /> Student Portal Active
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <NotificationCenter />

                            <Link to="/student/profile" className="flex items-center gap-3 group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[11px] font-black text-black group-hover:text-primary transition-colors">{profile?.full_name || 'Loading...'}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">@{profile?.username || 'user'}</p>
                                </div>
                                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xs hover:bg-primary transition-all shadow-lg shadow-black/10 uppercase">
                                    {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : 'ST'}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Dashboard Viewport */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="p-4 md:p-12 max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
