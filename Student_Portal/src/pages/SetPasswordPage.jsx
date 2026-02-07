import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { validatePassword, passwordsMatch, getPasswordFeedback } from '../utils/passwordValidation';
import { Lock, Eye, EyeOff, Check, X, Shield, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

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

    const token = searchParams.get('token') || searchParams.get('access_token');
    const type = searchParams.get('type');

    useEffect(() => {
        // Validate that we have a token
        if (!token) {
            setError('Invalid or missing password reset link. Please check your email for the correct link.');
        }

        // Check if this is an invite link
        if (type === 'invite' || type === 'signup') {
            console.log('Password setup for new user invitation');
        }
    }, [token, type]);

    const validation = validatePassword(formData.password);
    const passwordsFeedback = getPasswordFeedback(formData.password);
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

        if (!token) {
            setError('Invalid password reset link');
            return;
        }

        setIsSubmitting(true);

        try {
            // Update password using the token
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: formData.password
            });

            if (updateError) throw updateError;

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Password setup error:', err);
            setError(err.message || 'Failed to set password. Please try again or request a new link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white font-sans text-black flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Password Set Successfully!</h2>
                        <p className="text-gray-600 font-medium">
                            Your password has been set. You will be redirected to the login page shortly.
                        </p>
                        <div className="pt-4">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-black flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-primary" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Set Your Password</h1>
                        <p className="text-gray-600 font-medium">
                            Create a strong password to secure your account
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                            <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 font-medium text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Input */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 block">
                                Password <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border-2 border-gray-200 pl-12 pr-12 py-4 font-medium focus:outline-none focus:border-primary transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500">Password Strength:</span>
                                        <span className={`text-xs font-black uppercase px-2 py-1 rounded bg-${validation.strength.color}-100 text-${validation.strength.color}-700`}>
                                            {validation.strength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${validation.strength.color}-500 transition-all duration-300`}
                                            style={{
                                                width: validation.strength.level === 'strong' ? '100%' :
                                                    validation.strength.level === 'good' ? '75%' :
                                                        validation.strength.level === 'fair' ? '50%' : '25%'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 block">
                                Confirm Password <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full border-2 border-gray-200 pl-12 pr-12 py-4 font-medium focus:outline-none focus:border-primary transition-all"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {formData.confirmPassword && (
                                <div className="mt-2 flex items-center gap-2">
                                    {doPasswordsMatch ? (
                                        <>
                                            <Check size={16} className="text-green-600" />
                                            <span className="text-xs font-bold text-green-600">Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={16} className="text-red-600" />
                                            <span className="text-xs font-bold text-red-600">Passwords do not match</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Password Requirements Checklist */}
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">
                                Password Requirements:
                            </h3>
                            <div className="space-y-2">
                                <RequirementItem
                                    met={validation.requirements.minLength}
                                    text="At least 12 characters long"
                                />
                                <RequirementItem
                                    met={validation.requirements.hasUppercase}
                                    text="At least one uppercase letter (A-Z)"
                                />
                                <RequirementItem
                                    met={validation.requirements.hasLowercase}
                                    text="At least one lowercase letter (a-z)"
                                />
                                <RequirementItem
                                    met={validation.requirements.hasNumber}
                                    text="At least one number (0-9)"
                                />
                                <RequirementItem
                                    met={validation.requirements.hasSpecial}
                                    text="At least one special character (!@#$%^&*...)"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !validation.isValid || !doPasswordsMatch}
                            className="w-full bg-black text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Setting Password...
                                </>
                            ) : (
                                <>
                                    <Shield size={20} />
                                    Set Password & Continue
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${met ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
            }`}>
            {met ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
        </div>
        <span className={`text-sm font-medium ${met ? 'text-green-700' : 'text-gray-600'}`}>
            {text}
        </span>
    </div>
);

export default SetPasswordPage;
