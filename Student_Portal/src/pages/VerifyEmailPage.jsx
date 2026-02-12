import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Mail, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
    const { user, signOut } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        if (!user?.email) return;
        setIsResending(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
                options: {
                    emailRedirectTo: window.location.origin + '/student/dashboard'
                }
            });

            if (error) throw error;
            setMessage('A new verification link has been sent to your email.');
        } catch (err) {
            setMessage('Error: ' + err.message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white border-2 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-8"
            >
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Mail size={40} />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">Verify Your Identity</h1>
                    <p className="text-gray-500 font-bold text-sm tracking-tight leading-relaxed">
                        We've sent a secure verification link to <span className="text-black">{user?.email}</span>.
                        Please confirm your email to unlock the platform.
                    </p>
                </div>

                {message && (
                    <div className={`p-4 border-2 text-xs font-black uppercase tracking-widest ${message.startsWith('Error') ? 'border-red-100 bg-red-50 text-red-600' : 'border-green-100 bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isResending ? <RefreshCw className="animate-spin" size={16} /> : <Mail size={16} />}
                        {isResending ? 'Sending...' : 'Resend Verification Link'}
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 border-2 border-black text-black font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        I've Confirmed my Email
                    </button>

                    <div className="pt-4 flex justify-center">
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                        >
                            <LogOut size={14} /> Use a Different Account
                        </button>
                    </div>
                </div>
            </motion.div>

            <p className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
                Core Connect Academy &bull; Secure Protocol
            </p>
        </div>
    );
};

export default VerifyEmailPage;
