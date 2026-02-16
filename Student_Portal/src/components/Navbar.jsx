import { Menu, X, Home, Info, BookOpen, HelpCircle, LogIn, LayoutDashboard, LogOut, Instagram, Facebook, Linkedin, Mail, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { useState, useEffect } from "react"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTop, setIsTop] = useState(true);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { user, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsTop(currentScrollY < 10);
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navLinks = [
        { name: 'Home', href: '/', icon: <Home size={20} /> },
        { name: 'About', href: '/about', icon: <Info size={20} /> },
        { name: 'Courses', href: '/courses', icon: <BookOpen size={20} /> },
        { name: 'How It Works', href: '/how-it-works', icon: <HelpCircle size={20} /> },
    ];

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{ y: showNavbar ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTop ? 'bg-transparent py-6' : 'bg-white py-4 shadow-md'
                }`}
        >
            <div className=" mx-auto px-1">
                <div className="flex justify-between items-center">
                    {/* Logo stack */}
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img className="h-10 w-auto" src="/logo.png" alt="Core Connect Academy" />
                        <div className={`ml-2 flex flex-col leading-none transition-colors duration-300 ${isTop ? 'text-white' : 'text-primary'}`}>
                            <span className="text-xl font-bold tracking-tight uppercase">CORE CONNECT</span>
                            <span className="text-[10px] tracking-[0.3em] font-semibold uppercase">Academy</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-10">
                        <div className="flex space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`px-3 py-2 text-[14px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 ${isTop ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-primary'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center gap-6">
                            {user ? (
                                <>
                                    <Link to="/student/dashboard" className="px-8 py-2.5 bg-black text-white hover:bg-primary transition-all rounded-full text-[12px] font-black uppercase tracking-widest flex items-center gap-2">
                                        Dashboard
                                    </Link>
                                    <NotificationCenter />
                                    <button
                                        onClick={() => signOut()}
                                        className={`text-[12px] font-black uppercase tracking-widest transition-all ${isTop ? 'text-white hover:text-white/80' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={`text-[14px] font-extrabold uppercase tracking-widest transition-all hover:scale-105 ${isTop ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-primary'}`}>
                                        Login
                                    </Link>
                                    <Link to="/show-interest">
                                        <button className={`${isTop
                                            ? 'bg-white/10 border border-white/20 hover:bg-white text-white hover:text-primary'
                                            : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                                            } text-white px-8 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0`}>
                                            Register Interest
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-md ${isTop ? 'text-white' : 'text-primary'}`}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation - Slide-in from Right */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                        />

                        {/* Slide-in Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white text-gray-900 shadow-2xl z-[70] lg:hidden overflow-hidden flex flex-col"
                        >
                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] -z-10 rounded-full" />

                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                                        <img className="w-full h-full object-contain" src="/logo.png" alt="Core Connect" />
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-lg font-black tracking-tighter uppercase">CORE CONNECT</span>
                                        <span className="text-[10px] tracking-[0.4em] font-bold uppercase text-primary">Academy</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Main Navigation links */}
                            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 block">Navigation</span>
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.1 }}
                                    >
                                        <Link
                                            to={link.href}
                                            className="group flex items-center justify-between py-4 border-b border-gray-50 hover:border-primary/30 transition-all font-bold"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-gray-400 group-hover:text-primary transition-colors">
                                                    {link.icon}
                                                </div>
                                                <span className="text-lg font-bold uppercase tracking-tight text-gray-700 group-hover:text-primary transition-colors">
                                                    {link.name}
                                                </span>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300" />
                                        </Link>
                                    </motion.div>
                                ))}

                                {/* Auth Actions */}
                                <div className="pt-10 space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2 block">Account</span>
                                    {user ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            <Link
                                                to="/student/dashboard"
                                                className="flex items-center gap-3 p-4 bg-primary text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <LayoutDashboard size={18} /> My Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 text-red-500 font-bold uppercase tracking-widest text-xs transition-all hover:bg-red-50 active:scale-95"
                                            >
                                                <LogOut size={18} /> Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            <Link
                                                to="/login"
                                                className="flex items-center gap-3 p-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-black active:scale-95 shadow-lg"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <LogIn size={18} /> Student Login
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Menu Footer */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-8">
                                {!user && (
                                    <Link to="/show-interest" onClick={() => setIsOpen(false)}>
                                        <button className="w-full bg-primary text-white px-6 py-5 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                                            Register Interest
                                        </button>
                                    </Link>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                        <Mail size={14} className="text-primary" /> info@coreconnect.academy
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                        <Phone size={14} className="text-primary" />+971 55 369 1864
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                                        <Instagram size={18} />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                                        <Facebook size={18} />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                                        <Linkedin size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
