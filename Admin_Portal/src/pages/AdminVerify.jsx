import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, RefreshCw, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminVerify = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const resendEmail = async () => {
        setLoading(true);
        try {
            await supabase.auth.resend({
                type: 'signup',
                email: user?.email,
            });
            setSent(true);
            setTimeout(() => setSent(false), 5000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                    <ShieldCheck size={40} />
                </div>

                <h1 className="text-4xl font-black italic mb-4">Verification Required</h1>
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    We've sent a verification link to <span className="text-black font-bold">{user?.email}</span>.
                    Please check your inbox (and spam folder) to gain access to the admin portal.
                </p>

                <div className="bg-white p-8 border border-gray-100 shadow-xl space-y-4">
                    <button
                        onClick={resendEmail}
                        disabled={loading || sent}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-md font-bold text-xs uppercase tracking-widest transition-all ${sent ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-black shadow-lg shadow-primary/20'
                            }`}
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : (sent ? 'Check your email!' : 'Resend Verification Link')}
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-md font-bold text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-8 h-px bg-gray-200"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
                    <div className="w-8 h-px bg-gray-200"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminVerify;
