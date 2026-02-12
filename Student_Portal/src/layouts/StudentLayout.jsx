import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    LayoutGrid, BookOpen, FileText,
    FolderOpen, Mail, Settings,
    LogOut, Menu, X, User, MessageSquare
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, href, active, onClick, badge }) => (
    <Link
        to={href}
        onClick={onClick}
        className={`flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all rounded-r-full mr-4 ${active
            ? 'bg-black text-white shadow-lg'
            : 'text-gray-500 hover:text-primary'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
        <span className="tracking-wide">{label}</span>
        {badge && (
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-secondary text-white' : 'bg-red-500 text-white'}`}>
                {badge}
            </span>
        )}
    </Link>
);

const StudentLayout = () => {
    const { profile, signOut } = useAuth();
    const { isLoading } = useLoading();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (href) => {
        if (href === '/student/dashboard') return location.pathname === href;
        return location.pathname.startsWith(href);
    };

    // Responsive Sidebar Handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { label: 'Dashboard', icon: LayoutGrid, href: '/student/dashboard' },
        { label: 'My Courses', icon: BookOpen, href: '/student/courses' },
        { label: 'Assignment', icon: FileText, href: '/student/assignments' },
        { label: 'Resources', icon: FolderOpen, href: '/student/resources' },
        { label: 'AI Assistance', icon: MessageSquare, href: '/student/ai-assistant' },
        { label: 'My Profile', icon: User, href: '/student/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex font-sans text-[#1a1a1a]">

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transition-transform duration-300 transform lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand Header */}
                <div className="h-24 flex items-center px-8">
                    <Link to="/student/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-10 w-auto" />
                        <span className="font-bold text-lg text-gray-900 leading-tight">
                            Core Connect<br />Academy.
                        </span>
                    </Link>
                </div>
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            {...item}
                            active={isActive(item.href)}
                            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                        />
                    ))}
                </nav>
                {/* Logout Button (Bottom) */}
                <div className="p-8 border-t border-gray-100">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-4 text-gray-400 hover:text-red-500 transition-colors font-medium text-sm"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            {/* Main Content Wrapper */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'} relative min-h-screen`}>

                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-white flex items-center justify-between px-4 border-b border-gray-100 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-500"
                    >
                        <Menu size={24} />
                    </button>
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    <div className="w-8" /> {/* Spacer */}
                </div>

                {/* Page Content Injection */}
                <div className="p-6 md:p-10 relative z-10">
                    {isLoading && <LoadingSpinner fullScreen={false} />}
                    <Outlet />
                </div>

            </main>
        </div>
    );
};
export default StudentLayout;