import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

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
            // We don't necessarily need to navigate here if AuthContext 
            // state changes trigger a re-render of AdminGuard, but it's safe.
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-16 w-auto" />
                    </div>
                    <h1 className="text-3xl font-black text-black italic">Welcome Back, Admin</h1>
                    <p className="text-gray-400 mt-2 font-medium">Please enter your details to sign in</p>
                </div>

                {/* Form Container */}
                <div className="bg-white p-10 shadow-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 text-sm font-bold flex items-center gap-3 border-l-4 border-red-600">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="admin@coreconnect.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded-none border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Remember me</span>
                            </label>
                            <Link to="#" className="text-xs font-bold text-primary uppercase tracking-widest hover:text-black transition-colors">Forgot Password?</Link>
                        </div>

                        <div className="space-y-4 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Authenticating...' : (
                                    <>Sign In Securely <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                        <div className="text-center pt-4 border-t border-gray-100 mt-4">
                            <p className="text-xs font-bold text-gray-400">
                                Don't have an account? <Link to="/admin/signup" className="text-primary hover:text-black transition-colors">Sign Up Now</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    &copy; 2026 Core Connect Academy. Authorized Access Only.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
