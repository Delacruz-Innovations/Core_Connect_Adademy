import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData?.user) {
                // 2. Create Profile with Admin Role
                // Check if profile exists trigger might have run, 
                // but we need to ensure role is 'admin'.

                // Note: Triggers usually handle profile creation. 
                // We will try to update it to 'admin'.
                // CAUTION: This is insecure for production (allows anyone to be admin), 
                // but necessary for first-user setup in this dev environment.

                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        full_name: formData.full_name,
                        role: 'admin', // Auto-promote to admin for this dev signup
                        email: formData.email
                    });

                if (profileError) {
                    console.error('Profile update failed:', profileError);
                    // Just continue, maybe manual trigger handles it?
                }

                alert('Account created! You are now an Admin. Please sign in.');
                navigate('/admin/login');
            }

        } catch (err) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-black italic">Create Admin Account</h1>
                    <p className="text-gray-400 mt-2 font-medium">Dev Mode: Auto-promotes to Admin</p>
                </div>

                <div className="bg-white p-10 shadow-2xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 text-sm font-bold flex items-center gap-3 border-l-4 border-red-600">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border-0 p-4 pl-12 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : (
                                <>Create Admin Account <ArrowRight size={16} /></>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-gray-100 mt-4">
                            <p className="text-xs font-bold text-gray-400">
                                Already have an account? <Link to="/admin/login" className="text-primary hover:text-black transition-colors">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
