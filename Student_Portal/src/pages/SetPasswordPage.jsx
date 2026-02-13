import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { validatePassword, passwordsMatch } from '../utils/passwordValidation';
import { Lock, Eye, EyeOff, Check, X, Shield, Loader2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const SetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [username, setUsername] = useState('');

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

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user?.user_metadata?.username) {
                setUsername(session.user.user_metadata.username);
            }

            const token = searchParams.get('token') || searchParams.get('access_token');
            if (session || token || window.location.hash.includes('access_token')) {
                setError('');
            } else {
                setError('Invalid or missing password reset link. Please use the link sent to your email.');
            }
        };

        checkAuth();
    }, [searchParams]);

    const validation = validatePassword(formData.password);
    const doPasswordsMatch = passwordsMatch(formData.password, formData.confirmPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validation.isValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (!doPasswordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            let { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) throw new Error('Auth session could not be established.');

            if (!session) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const { data: { session: retrySession } } = await supabase.auth.getSession();
                session = retrySession;
            }

            if (!session) {
                throw new Error('Your session is missing or expired. Please click the link in your email again.');
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.password
            });

            if (updateError) throw updateError;

            // Log password_set event to trigger admin notification
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('audit_logs').insert({
                    actor_id: user.id,
                    actor_role: 'student',
                    action: 'password_set',
                    entity_type: 'user',
                    entity_id: user.id,
                    metadata: {
                        username: user.user_metadata?.username || user.email,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Password setup error:', err);
            setError(err.message || 'Failed to set password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative font-sans text-black flex flex-col">
                <div className="fixed inset-0 z-0 bg-gray-900 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-40" style={{ backgroundImage: `url("${images[0]}")` }}></div>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                </div>
                <Navbar />
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="bg-green-600 text-white p-12 text-center">
                            <Check size={64} className="mx-auto mb-6" strokeWidth={3} />
                            <h2 className="text-3xl font-bold italic uppercase tracking-tighter leading-none mb-4">Password Set!</h2>
                            <p className="text-sm text-white/80 font-medium uppercase tracking-widest leading-relaxed">
                                Security protocol complete. Redirecting you to the portal...
                            </p>
                        </div>
                        <div className="p-8 text-center bg-white flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Initializing Dashboard...</p>
                        </div>
                        <div className="h-1 bg-green-600 w-full"></div>
                    </motion.div>
                </div>
            </div>
        );
    }

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
                        <span className="text-secondary font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Account Security</span>
                        <h1 className="text-3xl md:text-5xl font-bold italic uppercase tracking-tighter leading-none">
                            Secure your <span className="text-primary">Future</span>
                        </h1>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg bg-white border border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
                >
                    <div className="bg-primary text-white p-8 text-center border-b border-white/5">
                        <Shield className="mx-auto h-12 w-12 text-white mb-4" />
                        <h2 className="text-3xl font-bold italic uppercase tracking-tighter leading-none">Set Password</h2>
                        {username && (
                            <p className="mt-2 text-xs text-white/80 font-black uppercase tracking-[0.2em]">
                                Verification for @{username}
                            </p>
                        )}
                    </div>

                    <form className="p-8 space-y-6 bg-white" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 font-medium text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    New Password <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-black"
                                        placeholder="Enter your new password"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Confirm Password <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-black"
                                        placeholder="Confirm your password"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password Requirements UI */}
                        <div className="bg-gray-50 border border-gray-200 p-5 space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Sparkles size={12} className="text-primary" />
                                Requirements Baseline
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <RequirementItem met={validation.requirements.minLength} text="12+ Characters" />
                                <RequirementItem met={validation.requirements.hasUppercase} text="Uppercase Letter" />
                                <RequirementItem met={validation.requirements.hasLowercase} text="Lowercase Letter" />
                                <RequirementItem met={validation.requirements.hasNumber} text="Numerical Digit" />
                                <RequirementItem met={validation.requirements.hasSpecial} text="Special Char" />
                                <RequirementItem met={doPasswordsMatch && formData.confirmPassword !== ''} text="Passwords Match" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !validation.isValid || !doPasswordsMatch}
                            className="w-full bg-primary text-white py-5 font-bold text-xs uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Complete Setup <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="h-1 bg-primary w-full"></div>
                </motion.div>
            </div>
        </div>
    );
};

const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2">
        <div className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
            {met ? <Check size={10} strokeWidth={4} /> : <div className="w-1 h-1 bg-current rounded-full" />}
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-tight ${met ? 'text-gray-900' : 'text-gray-400'}`}>
            {text}
        </span>
    </div>
);

export default SetPasswordPage;
