import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Check, ArrowRight, X, Send, MapPin, Globe, BookOpen, Laptop, User, AtSign, Briefcase, Phone, Loader2, AlertCircle } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const ShowInterestPage = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        window.scrollTo(0, 0);

        // Handle URL Pre-filling
        const program = searchParams.get('program');
        const track = searchParams.get('track');

        if (program) {
            setFormData(prev => ({ ...prev, programType: program }));
        }
        if (track) {
            setFormData(prev => ({ ...prev, programName: track }));
        }
    }, [searchParams]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        countryCode: 'GB',
        countryName: 'United Kingdom',
        stateCode: '',
        stateName: '',
        city: '',
        postcode: '',
        phoneCode: '+44',
        phone: '',
        currentRole: '',
        programType: '',
        programName: '',
        reason: '',
        computerLiteracy: 5,
        referrerSource: '',
        referrerName: '',
        otherReferrer: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState('idle'); // idle, checking, available, taken
    const [courses, setCourses] = useState([]);

    // Data for selectors
    const countries = Country.getAllCountries();
    const states = formData.countryCode ? State.getStatesOfCountry(formData.countryCode) : [];
    const cities = (formData.countryCode && formData.stateCode) ? City.getCitiesOfState(formData.countryCode, formData.stateCode) : [];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase.from('courses').select('id, title');
            if (error) throw error;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const handleInterestClick = () => {
        setShowForm(true);
        setTimeout(() => {
            const element = document.getElementById('interest-form');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // Real-time Username Check
    useEffect(() => {
        if (!formData.username || formData.username.length < 3) {
            setUsernameStatus('idle');
            return;
        }

        const timeoutId = setTimeout(async () => {
            setUsernameStatus('checking');
            try {
                const isAvailable = await checkUsernameAvailability(formData.username);
                setUsernameStatus(isAvailable ? 'available' : 'taken');
            } catch (err) {
                console.error('Availability check failed:', err);
                setUsernameStatus('idle');
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.username]);

    const checkUsernameAvailability = async (username) => {
        try {
            const { count: appCount, error: appError } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('username', username);

            if (appError) throw appError;

            const { count: profileCount, error: profileError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('username', username);

            if (profileError) throw profileError;

            return (appCount === 0 && profileCount === 0);
        } catch (error) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (usernameStatus === 'taken') {
            alert('Please choose another username. This one is already taken.');
            return;
        }

        setIsChecking(true);

        try {
            const finalReferrer = formData.referrerSource === 'Other' ? formData.otherReferrer : formData.referrerName;

            const { error } = await supabase.from('applications').insert({
                full_name: formData.fullName,
                username: formData.username,
                email: formData.email,
                country: formData.countryName,
                city: formData.city || formData.stateName, // Fallback if city not picked
                postcode: formData.postcode,
                phone: `${formData.phoneCode}${formData.phone}`,
                job_role: formData.currentRole,
                program_interest: formData.programType === 'Mentorship' ? 'Mentorship Program' : 'Apprenticeship Program',
                motivation_text: formData.reason,
                computer_literacy_score: parseInt(formData.computerLiteracy),
                discovery_source: formData.referrerSource,
                referral_name: finalReferrer || null,
                requested_course_id: formData.programName,
                status: 'pending'
            });

            if (error) throw error;

            setIsSubmitted(true);
            setShowForm(false);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Submission error:', error);
            alert(`Error submitting application: ${error.message || 'Unknown error'}`);
        } finally {
            setIsChecking(false);
        }
    };

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
                            Thank you for registering. We've received your application and an automated confirmation email has been sent to you. One of our admins will be in touch shortly to welcome you and discuss your goals.
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
                <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-secondary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Join the Cohort</span>
                        <h1 className="text-5xl md:text-7xl lg:text-[10rem] font-black mb-10 italic uppercase tracking-tighter leading-[0.8]">
                            Apply <br /><span className="text-primary italic">Now</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">

                    {!showForm ? (
                        <div className="space-y-16">
                            <div className="space-y-10">
                                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black leading-[0.85] text-gray-900 uppercase italic tracking-tighter text-center">
                                    Registration is <br /><span className="text-primary">by application only</span>.
                                </h2>

                                <div className="bg-white border border-gray-100 p-12 lg:p-20 text-left shadow-2xl max-w-4xl mx-auto relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10">Requirements Checklist</h3>
                                    <ul className="space-y-10">
                                        {[
                                            "Ready to commit to a structured 12-week program.",
                                            "Basic computer literacy (Laptop/PC required).",
                                            "Willingness to join group mentoring sessions."
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-6 items-center group/item">
                                                <div className="w-12 h-12 border border-gray-100 flex items-center justify-center text-primary bg-gray-50 group-hover/item:bg-primary group-hover/item:text-white transition-all shrink-0 shadow-inner">
                                                    <Check size={24} strokeWidth={3} />
                                                </div>
                                                <span className="text-lg md:text-2xl font-black text-gray-800 italic uppercase tracking-tighter transition-all group-hover/item:pl-2">{item}</span>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={handleInterestClick}
                                className="bg-primary text-white px-16 py-6 rounded-full font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 transition-all flex items-center gap-4 mx-auto group active:translate-y-0"
                            >
                                Start Registration <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
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

                            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-14">

                                {/* Personal Details */}
                                <div className="space-y-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <User size={16} /> Personal Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Names <span className="text-primary">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
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
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                                    className={`w-full pl-12 bg-gray-50 border p-4 font-bold text-sm focus:outline-none focus:bg-white transition-all rounded-none ${usernameStatus === 'available' ? 'border-green-500' : usernameStatus === 'taken' ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                                        }`}
                                                    placeholder="janedoe23"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                                    {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-gray-400" />}
                                                    {usernameStatus === 'available' && <Check size={16} className="text-green-500" />}
                                                    {usernameStatus === 'taken' && <X size={16} className="text-red-500" />}
                                                </div>
                                            </div>
                                            {usernameStatus === 'taken' && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">This username is already taken</p>}
                                            {usernameStatus === 'available' && <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-1">Username is available</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address <span className="text-primary">*</span></label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                placeholder="jane@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number <span className="text-primary">*</span></label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={formData.phoneCode}
                                                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                                                    className="w-32 bg-gray-50 border border-gray-200 p-4 font-bold text-xs focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none appearance-none"
                                                >
                                                    {countries.map(c => (
                                                        <option key={c.isoCode} value={c.phonecode}>
                                                            +{c.phonecode.replace('+', '')} {c.isoCode}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="relative flex-1">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full pl-12 bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                        placeholder="7123 456789"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <MapPin size={16} /> Location Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Country <span className="text-primary">*</span></label>
                                            <select
                                                required
                                                value={formData.countryCode}
                                                onChange={(e) => {
                                                    const c = countries.find(x => x.isoCode === e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        countryCode: e.target.value,
                                                        countryName: c?.name || '',
                                                        stateCode: '',
                                                        stateName: '',
                                                        city: '',
                                                        phoneCode: `+${c?.phonecode.replace('+', '')}`
                                                    });
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-xs focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">State / Region <span className="text-primary">*</span></label>
                                            <select
                                                required
                                                value={formData.stateCode}
                                                onChange={(e) => {
                                                    const s = states.find(x => x.isoCode === e.target.value);
                                                    setFormData({ ...formData, stateCode: e.target.value, stateName: s?.name || '', city: '' });
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-xs focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                disabled={!states.length}
                                            >
                                                <option value="">Select State</option>
                                                {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">City <span className="text-primary">*</span></label>
                                            <select
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-xs focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                disabled={!cities.length}
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(ct => <option key={ct.name} value={ct.name}>{ct.name}</option>)}
                                                {!cities.length && formData.stateName && <option value={formData.stateName}>{formData.stateName} (Generic)</option>}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Postcode / Zip <span className="text-primary">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.postcode}
                                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                placeholder="SW1A 1AA"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional & Program */}
                                <div className="space-y-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                        <BookOpen size={16} /> Program Selection
                                    </h4>
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Current Role <span className="text-primary">*</span></label>
                                            <select
                                                required
                                                value={formData.currentRole}
                                                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none appearance-none"
                                            >
                                                <option value="">Select your status...</option>
                                                <option value="Student">Undergraduate Student</option>
                                                <option value="Unemployed">Job Seeker / Unemployed</option>
                                                <option value="Professional">Working Professional</option>
                                                <option value="Freelancer">Freelancer / Self-Employed</option>
                                                <option value="Transitioning">Switching Careers</option>
                                                <option value="Other">Other</option>
                                            </select>
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
                                                        className="w-full bg-white border-2 border-primary/10 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all appearance-none rounded-none"
                                                    >
                                                        <option value="">Select a track...</option>
                                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all rounded-none"
                                                placeholder="Tell us about your goals and motivation..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills & Source */}
                                <div className="space-y-8">
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
                                                className="w-full bg-gray-50 border border-gray-200 p-4 font-bold text-sm focus:outline-none focus:border-primary focus:bg-white transition-all appearance-none rounded-none"
                                            >
                                                <option value="">Select Source...</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Google">Google Search</option>
                                                <option value="Referral">Friend / Referral</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {(formData.referrerSource === 'Referral' || formData.referrerSource === 'Other') && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                    {formData.referrerSource === 'Referral' ? 'Who referred you?' : 'Please specify source'} <span className="text-primary">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.referrerSource === 'Referral' ? formData.referrerName : formData.otherReferrer}
                                                    onChange={(e) => {
                                                        if (formData.referrerSource === 'Referral') {
                                                            setFormData({ ...formData, referrerName: e.target.value });
                                                        } else {
                                                            setFormData({ ...formData, otherReferrer: e.target.value });
                                                        }
                                                    }}
                                                    className="w-full bg-white border-2 border-primary/20 p-4 font-bold text-sm focus:outline-none focus:border-primary transition-all rounded-none"
                                                    placeholder={formData.referrerSource === 'Referral' ? "Enter their full name" : "Where did you hear about us?"}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isChecking || usernameStatus === 'taken'}
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
            </section >

            <Footer />
        </div >
    );
};

export default ShowInterestPage;
