import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const images = [
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
    ];

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login for:', formData.username);

            // Step 1: Secure email lookup via RPC (to prevent enumeration)
            const { data: resolvedEmail, error: rpcError } = await supabase
                .rpc('get_email_from_username', { p_username: formData.username });

            // Fail generic error even if RPC fails or returns no email
            if (rpcError || !resolvedEmail) {
                console.warn('Username resolution failed or not found');
                throw new Error('Invalid username or password');
            }

            // Step 2: Authenticate with Supabase using email and password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: resolvedEmail,
                password: formData.password
            });

            if (authError) {
                throw new Error('Invalid username or password');
            }

            // Step 3: Verify role strictly after auth
            const { data: profile, error: profileErr } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileErr || profile.role !== 'student') {
                await supabase.auth.signOut();
                throw new Error('This portal is for students only. Access denied.');
            }

            // Step 4: Success
            navigate('/student/dashboard');

        } catch (err) {
            console.error('Login process error:', err);
            setError(err.message || 'Verification failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans text-black flex flex-col">
            {/* Full Page Fixed Background Slideshow */}
            <div className="fixed inset-0 z-0 bg-gray-900 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                        style={{
                            backgroundImage: `url("${images[currentImage]}")`,
                        }}
                    >
                        {/* Dark Overlay for contrast */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <Navbar />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center text-white mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Student Portal</span>
                        <h1 className="text-3xl md:text-5xl font-bold italic uppercase tracking-tighter leading-none">
                            Welcome <span className="text-primary">Back</span>
                        </h1>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white border border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
                >
                    <div className="bg-primary text-white p-8 text-center border-b border-white/5">
                        <User className="mx-auto h-12 w-12 text-white mb-4" />
                        <h2 className="text-3xl font-bold italic uppercase tracking-tighter leading-none">Secure Login</h2>
                        <p className="mt-2 text-sm text-white/80 font-medium uppercase tracking-widest">Access your dashboard</p>
                    </div>

                    <form className="p-8 space-y-6 bg-white" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 font-medium text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                Username <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-black"
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                Password <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-black"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                <span className="font-bold text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-primary hover:text-black transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-5 font-bold text-xs uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary rounded-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500">
                                Don't have an account? <Link to="/show-interest" className="font-bold text-primary hover:text-black transition-colors">Register Interest</Link>
                            </p>
                        </div>
                    </form>

                    {/* Decorative Bar */}
                    <div className="h-1 bg-primary w-full"></div>
                </motion.div>
            </div>

        </div>
    );
};

export default LoginPage;
