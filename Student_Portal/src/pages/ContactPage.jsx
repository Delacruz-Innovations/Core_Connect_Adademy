import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
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
                    <div className="p-12 lg:p-16 bg-gray-50">
                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                                    <input type="text" className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                                <input type="email" className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                                <select className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors appearance-none">
                                    <option>Course Enquiry</option>
                                    <option>Support</option>
                                    <option>Partnership</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                                <textarea rows="4" className="w-full bg-white border border-gray-200 p-4 font-bold text-gray-900 focus:outline-none focus:border-primary transition-colors" placeholder="How can we help?"></textarea>
                            </div>

                            <button className="w-full bg-black text-white py-5 font-bold text-sm uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-3 shadow-xl">
                                Send Message <Send size={16} />
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
