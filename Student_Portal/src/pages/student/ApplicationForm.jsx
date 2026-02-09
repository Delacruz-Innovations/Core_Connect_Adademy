import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Globe, MapPin, Phone, Briefcase,
    BookOpen, Send, CheckCircle2, AlertCircle,
    Loader2, Users, Monitor, Info
} from 'lucide-react';

const ApplicationForm = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        username: profile?.username || '',
        email: profile?.email || '',
        country: '',
        city: '',
        postcode: '',
        phone: '',
        job_role: '',
        program_interest: 'Mentorship Program',
        motivation_text: '',
        computer_literacy_score: 5,
        discovery_source: 'Google',
        referral_name: '',
        requested_course_id: ''
    });

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('id, title')
                .eq('is_published', true);
            if (error) throw error;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { error: submitError } = await supabase
                .from('applications')
                .insert([formData]);

            if (submitError) throw submitError;
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err.message || 'Submission failed. Please check your data.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 flex items-center justify-center mx-auto rounded-full">
                        <CheckCircle2 className="text-green-500" size={40} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Application Submitted</h1>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            Your application has been successfully submitted. Our admissions team will review your details and contact you shortly.
                        </p>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="bg-primary text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg rounded-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-6 md:py-12 px-4 md:px-0">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

                {/* Branded Header */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">New Application</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 leading-[1.1]">
                        Apply for <span className="text-primary">Course</span>
                    </h1>
                    <p className="text-sm md:text-base font-medium text-gray-500 max-w-xl leading-relaxed border-l-2 border-gray-100 pl-4 md:pl-6">
                        Complete the form below to apply for a specialized learning track.
                        Note: All enrollments are subject to administrative approval.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 flex items-center gap-4 text-red-700 rounded-sm">
                        <AlertCircle size={20} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Identity Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <User size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-300 rounded-sm"
                                    placeholder="Enter full name..."
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Username</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-300 rounded-sm"
                                    placeholder="e.g. john_doe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <MapPin size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Location Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Country</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">City / State</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Postcode / Zip</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                    value={formData.postcode}
                                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Program & Course Selection */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <BookOpen size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Program Selection</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Program Track</label>
                                <select
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer rounded-sm"
                                    value={formData.program_interest}
                                    onChange={(e) => setFormData({ ...formData, program_interest: e.target.value })}
                                >
                                    <option value="Mentorship Program">Mentorship Program</option>
                                    <option value="Apprenticeship Program">Apprenticeship Program</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select Course</label>
                                <select
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer rounded-sm"
                                    value={formData.requested_course_id}
                                    onChange={(e) => setFormData({ ...formData, requested_course_id: e.target.value })}
                                >
                                    <option value="">-- Select Course --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Background & Motivation */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <Briefcase size={20} className="text-primary" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Professional Background</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current Role / Job Title</label>
                                <input
                                    required
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                    placeholder="Enter your current position..."
                                    value={formData.job_role}
                                    onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivation</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-white border border-gray-200 p-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                    placeholder="Why do you want to join this program?"
                                    value={formData.motivation_text}
                                    onChange={(e) => setFormData({ ...formData, motivation_text: e.target.value })}
                                />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Minimum 200 characters recommended</p>
                            </div>
                        </div>
                    </div>

                    {/* Intelligence & Discovery */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Monitor size={16} className="text-primary" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Computer Literacy</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                    <span>Novice</span>
                                    <span>Expert (10/10)</span>
                                </div>
                                <input
                                    type="range" min="1" max="10"
                                    className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                                    value={formData.computer_literacy_score}
                                    onChange={(e) => setFormData({ ...formData, computer_literacy_score: parseInt(e.target.value) })}
                                />
                                <div className="text-center font-black text-xl text-primary">{formData.computer_literacy_score}/10</div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Info size={16} className="text-primary" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">How did you hear about us?</h2>
                            </div>
                            <div className="space-y-4">
                                <select
                                    className="w-full bg-white border border-gray-200 p-4 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer rounded-sm"
                                    value={formData.discovery_source}
                                    onChange={(e) => setFormData({ ...formData, discovery_source: e.target.value })}
                                >
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Google">Google</option>
                                    <option value="Referral">Referral</option>
                                </select>
                                {formData.discovery_source === 'Referral' && (
                                    <input
                                        required
                                        className="w-full bg-white border border-gray-200 p-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-sm"
                                        placeholder="Enter Referral Name..."
                                        value={formData.referral_name}
                                        onChange={(e) => setFormData({ ...formData, referral_name: e.target.value })}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Component */}
                    <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 border border-gray-100 flex items-center justify-center text-gray-400 bg-white rounded-sm shadow-sm group-hover:border-primary/30 group-hover:text-primary transition-all">
                                <Send size={18} />
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Application Submission</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Please review your details before submitting.</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto bg-primary text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 rounded-sm"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );

};

export default ApplicationForm;
