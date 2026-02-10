import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'Course Enquiry',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Pipe to applications table as a general enquiry lead
            const { error } = await supabase.from('applications').insert({
                full_name: `${formData.firstName} ${formData.lastName}`,
                username: `contact_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                email: formData.email,
                program_interest: `Contact Form: ${formData.subject}`,
                motivation_text: formData.message,
                status: 'captured'
            });

            if (error) throw error;

            setIsSubmitted(true);
            setFormData({ firstName: '', lastName: '', email: '', subject: 'Course Enquiry', message: '' });
        } catch (error) {
            console.error('Contact submit error:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Get In Touch"
                description="Have questions about our tracks? Contact Core Connect Academy for personalized guidance on your journey into high-impact software engineering and design."
                url="/contact"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Get In Touch
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Intro Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold leading-tight text-gray-900">
                        If you’re unsure, confused, or <span className="text-primary italic">need clarification</span>, reach out.
                    </h2>

                    <p className="text-2xl font-black italic text-gray-500 border-l-4 border-primary pl-6 mx-auto max-w-xl">
                        "We’d rather explain things early than fix misunderstandings later."
                    </p>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 shadow-2xl bg-white overflow-hidden border border-gray-100">

                    {/* Contact Info */}
                    <div className="bg-black text-white p-12 lg:p-16 flex flex-col justify-between">
                        <div>
                            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-8 block">Contact Information</span>
                            <h3 className="text-3xl font-black italic mb-8">Let's Talk Properly</h3>
                            <p className="text-gray-400 mb-12 font-medium leading-relaxed">
                                Our team is ready to answer your questions honestly and transparently. No sales pressure, just clarity.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <Mail className="text-primary mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Email Us</h4>
                                        <p className="text-gray-400">hello@coreconnect.academy</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <Phone className="text-primary mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Call Us</h4>
                                        <p className="text-gray-400">+44 (0) 203 123 4567</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <MapPin className="text-primary mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Visit Us</h4>
                                        <p className="text-gray-400">123 Tech Street, London, UK</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 mt-12 border-t border-white/10">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">© 2026 Core Connect Academy</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-12 lg:p-16 bg-gray-50 relative">
                        <AnimatePresence mode="wait">
                            {isSubmitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                                >
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tight">Message Sent</h3>
                                    <p className="text-gray-500 font-medium max-w-sm">
                                        Thank you for reaching out. Our team will review your enquiry and get back to you shortly.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b-2 border-primary pb-1 hover:text-black hover:border-black transition-all"
                                    >
                                        Send Another Message
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors appearance-none"
                                        >
                                            <option>Course Enquiry</option>
                                            <option>Support</option>
                                            <option>Partnership</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                                        <textarea
                                            required
                                            rows="4"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors"
                                            placeholder="How can we help?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-black text-white py-5 font-bold text-sm uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                Send Message <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
