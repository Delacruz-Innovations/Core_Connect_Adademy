import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Check, ArrowRight, X, Send, MapPin, Globe, BookOpen, Laptop, User, AtSign, Briefcase, Phone, Loader2 } from 'lucide-react';

const ShowInterestPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        country: '',
        stateCity: '',
        postcode: '',
        phone: '',
        currentRole: '',
        programType: '',
        programName: '',
        reason: '',
        computerLiteracy: 5,
        referrerSource: '',
        referrerName: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const handleInterestClick = () => {
        setShowForm(true);
        setTimeout(() => {
            document.getElementById('interest-form').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const checkUsername = async (username) => {
        if (!username) return false;

        try {
            // Check applications table
            const { count, error: appError } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('username', username);

            if (appError) throw appError;

            // Check profiles table (existing users)
            const { count: profileCount, error: profileError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('username', username);

            if (profileError) throw profileError;

            return (count === 0 && profileCount === 0);
        } catch (error) {
            // Propagate error to handle connection issues correctly instead of saying "Username Taken"
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsChecking(true);

        try {
            // Check username availability
            const isAvailable = await checkUsername(formData.username);
            if (!isAvailable) {
                alert("Username is already taken. Please choose another username.");
                setIsChecking(false);
                return;
            }

            // Insert Application
            const { data: newApplication, error } = await supabase.from('applications').insert({
                full_name: formData.fullName,
                username: formData.username,
                email: formData.email,
                country: formData.country,
                city: formData.stateCity,
                postcode: formData.postcode,
                phone: formData.phone,
                job_role: formData.currentRole, // Mapped from state
                program_type: formData.programType || 'Mentorship', // Default if empty
                program_name: formData.programName,
                reason: formData.reason,
                computer_literacy: formData.computerLiteracy,
                referrer_source: formData.referrerSource,
                referrer_name: formData.referrerName,
                notified_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;

            // SUCCESS! 
            // We no longer call the Edge Function or Audit Logs from here.
            // THE DATABASE TRIGGER (fn_handle_new_application) handles emails and logging 
            // automatically on the server side, which is faster and avoids CORS errors.

            setIsSubmitted(true);
            setShowForm(false);
            // Reset form
            setFormData({
                fullName: '',
                username: '',
                email: '',
                country: '',
                stateCity: '',
                postcode: '',
                phone: '',
                currentRole: '',
                programType: '',
                programName: '',
                reason: '',
                computerLiteracy: 5,
                referrerSource: '',
                referrerName: ''
            });
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Submission error:', error);

            // Handle specific error codes
            if (error.code === '23505') {
                // Unique constraint violation
                if (error.message.includes('username')) {
                    alert("This username is already taken. Please choose a different username.");
                } else if (error.message.includes('email')) {
                    alert("This email is already registered. Please use a different email or contact support.");
                } else {
                    alert("This information is already registered. Please check your details.");
                }
            } else if (error.message?.includes('Failed to fetch')) {
                alert("Connection error. Please check your internet connection and try again.");
            } else {
                alert(`Error submitting application: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsChecking(false);
        }
    };

    const programs = [
        "Business Analysis",
        "Product Owner",
        "Product Analyst",
        "Digital Operations Analyst",
        "Cybersecurity",
        "AI Vibe Coding",
        "None"
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white font-sans text-black flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">Registration Received</h2>
                        <div className="w-24 h-1 bg-primary mx-auto"></div>
                        <p className="text-lg lg:text-xl text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
                            Thank you for registering. One of our admins will be in touch to welcome you and better understand what your goals are and advise how we can assist you to achieve them.
                        </p>
                        <div className="pt-8">
                            <Link to="/" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-primary hover:text-black transition-colors border-b-2 border-primary pb-1 hover:border-black">
                                Return to Homepage <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Begin Your Journey
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">

                    {!showForm ? (
                        <div className="text-center space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                                    Registration is <span className="text-primary italic">by application only</span>.
                                </h2>

                                <div className="bg-gray-50 border border-gray-100 p-12 lg:p-16 my-12 text-left shadow-lg max-w-4xl mx-auto">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-gray-400 mb-8">Before Applying:</h3>
                                    <ul className="space-y-6">
                                        {[
                                            "You must be ready to commit to a structured program.",
                                            "You understand this requires computer literacy.",
                                            "You are willing to verify your location and identity."
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 items-center group">
                                                <div className="w-10 h-10 border border-gray-200 flex items-center justify-center text-primary bg-white group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                                    <Check size={20} strokeWidth={3} />
                                                </div>
                                                <span className="text-xl font-bold text-gray-800">{item}</span>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={handleInterestClick}
                                className="bg-primary text-white px-12 py-6 rounded-md font-bold text-lg tracking-widest uppercase shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-transform flex items-center gap-4 mx-auto group"
                            >
                                Start Registration <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            id="interest-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 shadow-2xl relative"
                        >
                            <div className="bg-black text-white p-8 md:p-12 flex justify-between items-start">
                                <div>
                                    <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Application Form</span>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tight">Student Registration</h3>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-2"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">

                                {/* Personal Details */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <User size={16} /> Personal Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Names <span className="text-primary">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                placeholder="Jane Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Create Username <span className="text-primary">*</span></label>
                                            <div className="relative">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full pl-12 bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                    placeholder="janedoe23"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address <span className="text-primary">*</span></label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                placeholder="jane@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number <span className="text-primary">*</span></label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-12 bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                    placeholder="+44 7123 456789"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <MapPin size={16} /> Location Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Country <span className="text-primary">*</span></label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="w-full pl-12 bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                    placeholder="United Kingdom"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">City / State <span className="text-primary">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.stateCity}
                                                onChange={(e) => setFormData({ ...formData, stateCity: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                placeholder="London"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Postcode / Zip <span className="text-primary">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.postcode}
                                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                placeholder="SW1A 1AA"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional & Program */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <BookOpen size={16} /> Program Selection
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Role <span className="text-primary">*</span></label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.currentRole}
                                                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                                                    className="w-full pl-12 bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                    placeholder="Student / Unemployed / Transitioning"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Interested In <span className="text-primary">*</span></label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, programType: 'Mentorship', programName: '' })}
                                                    className={`p-4 border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.programType === 'Mentorship'
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-300'
                                                        }`}
                                                >
                                                    Mentorship Program
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, programType: 'Apprenticeship', programName: '' })}
                                                    className={`p-4 border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.programType === 'Apprenticeship'
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-300'
                                                        }`}
                                                >
                                                    Apprenticeship Program
                                                </button>
                                            </div>

                                            {formData.programType && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                        Select {formData.programType} Track <span className="text-primary">*</span>
                                                    </label>
                                                    <select
                                                        required
                                                        value={formData.programName}
                                                        onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                                                        className="w-full bg-white border-2 border-primary/10 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all appearance-none"
                                                    >
                                                        <option value="">Select a track...</option>
                                                        {programs.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Why do you want to join? <span className="text-primary">*</span></label>
                                            <textarea
                                                required
                                                rows="4"
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                                                placeholder="Tell us about your goals and motivation..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills & Source */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <Laptop size={16} /> Additional Info
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Computer Literacy (1-10)</label>
                                            <span className="text-primary font-black text-xl">{formData.computerLiteracy}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.computerLiteracy}
                                            onChange={(e) => setFormData({ ...formData, computerLiteracy: e.target.value })}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Beginner</span>
                                            <span>Expert</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">How did you hear about us? <span className="text-primary">*</span></label>
                                            <select
                                                required
                                                value={formData.referrerSource}
                                                onChange={(e) => setFormData({ ...formData, referrerSource: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none"
                                            >
                                                <option value="">Select Source...</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Google">Google Search</option>
                                                <option value="Referral">Friend / Referral</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {formData.referrerSource === 'Referral' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Who referred you? <span className="text-primary">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.referrerName}
                                                    onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
                                                    className="w-full bg-white border-2 border-primary/20 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all"
                                                    placeholder="Enter their full name"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isChecking}
                                        className="w-full bg-black text-white py-6 font-black text-sm uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
                                    >
                                        {isChecking ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Submitting Application...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </motion.div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ShowInterestPage;
