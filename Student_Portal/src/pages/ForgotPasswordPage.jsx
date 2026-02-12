import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Failed to send reset email. Please check the address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans text-black flex flex-col">
            <div className="fixed inset-0 z-0 bg-gray-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40"
                    style={{ backgroundImage: `url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")` }}
                />
            </div>

            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6 relative z-10 pt-20 md:pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-10 md:p-12 shadow-2xl skew-x-[-1deg]"
                >
                    <div className="skew-x-[1deg]">
                        <div className="mb-10 text-center">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Security Protocol</span>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none mb-4">Reset Access</h1>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
                                Enter your verified email address to receive a secure recovery link.
                            </p>
                        </div>

                        {success ? (
                            <div className="space-y-8 animate-in zoom-in duration-500">
                                <div className="p-8 bg-green-50 border border-green-100 flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center rounded-sm">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <p className="text-sm font-black text-green-700 uppercase leading-relaxed tracking-wider">
                                        Transmission Confirmed. Check your inbox for the secure link.
                                    </p>
                                </div>
                                <Link
                                    to="/login"
                                    className="w-full h-16 bg-black text-white flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary transition-all"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleResetRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-16 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white pl-12 pr-4 outline-none transition-all text-sm font-bold placeholder:text-gray-300 uppercase tracking-wide"
                                            placeholder="STUDENT@CORECONNECT.ACADEMY"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3"
                                    >
                                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary text-white flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            Initiate Recovery <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="pt-6 text-center">
                                    <Link to="/login" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                                        Wait, I remember it now. <span className="text-black border-b border-black/10">Login</span>
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
