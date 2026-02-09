import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Authentication failed. Verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <BrandedLoader message="Verifying Identity..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden brand-watermark-bg font-sans">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

            <div className="max-w-md w-full relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-xl shadow-primary/5 mb-6 border border-gray-100">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-12 w-auto" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Admin Console</h1>
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Restricted Access</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white p-10 shadow-2xl border-t-4 border-primary/20 rounded-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 text-xs font-bold flex items-center gap-3 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                <span className="uppercase tracking-wide">{error}</span>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Authorized Email</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-300 group-focus-within:text-primary transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold pl-10 pr-4 py-3 outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300 uppercase tracking-wide"
                                    placeholder="admin@coreconnect.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-300 group-focus-within:text-primary transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold pl-10 pr-4 py-3 outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0052a3] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Verifying Identity...
                                    </>
                                ) : (
                                    <>
                                        Authenticate <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Core Connect Academy &bull; System V2.4
                    </p>
                    <div className="flex justify-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-secondary rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-150" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
