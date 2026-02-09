import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Courses', href: '/courses' },
        { name: 'How It Works', href: '/how-it-works' },
    ];

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{ y: showNavbar ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTop ? 'bg-transparent py-6' : 'bg-white py-4 shadow-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img className="h-10 w-auto" src="/logo.png" alt="Core Connect Academy" />
                        <div className={`ml-2 flex flex-col leading-none transition-colors duration-300 ${isTop ? 'text-white' : 'text-primary'}`}>
                            <span className="text-xl font-bold tracking-tight uppercase">CORE CONNECT</span>
                            <span className="text-[10px] tracking-[0.3em] font-semibold uppercase">Academy</span>
                        </div>
                    </Link>

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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Slide-in Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
                        >
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <img className="h-8 w-auto" src="/logo.png" alt="Core Connect Academy" />
                                    <div className="flex flex-col leading-none text-primary">
                                        <span className="text-sm font-black tracking-tight uppercase">CORE CONNECT</span>
                                        <span className="text-[8px] tracking-[0.3em] font-bold uppercase">Academy</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Menu Links */}
                            <nav className="p-6 space-y-1">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={link.href}
                                            className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-all uppercase tracking-wider"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                                {user ? (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: navLinks.length * 0.05 }}
                                        >
                                            <Link
                                                to="/student/dashboard"
                                                className="block px-4 py-3 text-sm font-bold text-primary bg-primary/5 rounded-lg transition-all uppercase tracking-wider"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                My Dashboard
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (navLinks.length + 1) * 0.05 }}
                                        >
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all uppercase tracking-wider"
                                            >
                                                Log Out
                                            </button>
                                        </motion.div>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: navLinks.length * 0.05 }}
                                    >
                                        <Link
                                            to="/login"
                                            className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg transition-all uppercase tracking-wider"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login / Signup
                                        </Link>
                                    </motion.div>
                                )}
                            </nav>

                            {!user && (
                                <div className="p-6 border-t border-gray-100 mt-auto">
                                    <Link to="/show-interest" onClick={() => setIsOpen(false)}>
                                        <button className="w-full bg-primary text-white px-6 py-4 rounded-lg text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20">
                                            Register Interest
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
