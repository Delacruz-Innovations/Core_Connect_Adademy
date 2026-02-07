import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
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
            // Step 1: Lookup email by username from profiles table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, username, full_name, role')
                .eq('username', formData.username)
                .single();

            if (profileError || !profileData) {
                throw new Error('Invalid username or password');
            }

            // Check if user is a student
            if (profileData.role !== 'student') {
                throw new Error('This portal is for students only. Please use the admin portal.');
            }

            // Step 2: Authenticate with Supabase using email and password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: profileData.email,
                password: formData.password
            });

            if (authError) {
                throw new Error('Invalid username or password');
            }

            // Step 3: Redirect to student dashboard
            navigate('/student/dashboard');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-black flex flex-col justify-between">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white border border-gray-100 shadow-2xl overflow-hidden relative"
                >
                    <div className="bg-black text-white p-8 text-center">
                        <User className="mx-auto h-12 w-12 text-primary mb-4" />
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Student Portal</h2>
                        <p className="mt-2 text-sm text-gray-400 font-medium uppercase tracking-widest">Secure Access</p>
                    </div>

                    <form className="p-8 space-y-6" onSubmit={handleLogin}>
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
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
                            className="w-full bg-primary text-white py-4 font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
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

            <Footer />
        </div>
    );
};

export default LoginPage;
