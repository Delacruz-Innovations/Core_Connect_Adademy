import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Check, ArrowRight, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ServicesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Tailored Support Services"
                description="Discover the comprehensive support services provided to every student, from CV development to interview coaching and on-the-job guidance."
                url="/services"
            />
            <Navbar />

            {/* Hero Section - Full Screen & Fixed BG */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-50 contrast-125 saturate-0 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl lg:text-8xl font-black mb-6 italic uppercase tracking-tighter"
                    >
                        Services
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Intro Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 block">What We Offer</span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                        What we support you with
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed font-medium">
                        Our services are designed to guide you from <span className="text-black font-bold">confusion</span> to <span className="text-primary font-bold">confidence</span>.
                    </p>
                </div>
            </section>

            {/* Support List Section */}
            <section className="pb-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Image Side */}
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-[4/5] overflow-hidden shadow-2xl bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Mentorship session"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 -z-10"></div>
                        </div>

                        {/* List Content */}
                        <div className="space-y-8 order-1 lg:order-2">
                            <div className="space-y-6">
                                {[
                                    "Structured learning pathways",
                                    "Live training with experienced tutors",
                                    "Mentorship and study support",
                                    "Practical assignments and simulations",
                                    "CV and portfolio development",
                                    "Interview preparation and communication coaching",
                                    "On-the-job guidance after training"
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="w-8 h-8 bg-white border border-primary flex items-center justify-center shrink-0 mt-1 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-800 leading-snug group-hover:text-primary transition-colors">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Statement Section */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                        <div className="space-y-10">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-black leading-tight uppercase tracking-tight text-gray-900 mb-6">
                                    This is not a self-paced video course.
                                </h2>
                                <p className="text-3xl font-medium text-gray-500 italic border-l-4 border-primary pl-6">
                                    It’s <span className="text-primary font-bold">guided</span>, <span className="text-primary font-bold">structured</span>, and <span className="text-primary font-bold">mentored</span>.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button className="bg-primary text-white px-10 py-5 rounded-md font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform flex items-center gap-3 group">
                                    See Our Programmes
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 mt-8">
                                    <div className="bg-white p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                        <BookOpen className="text-primary w-8 h-8 mb-4" />
                                        <span className="font-bold text-sm uppercase tracking-wider">Live Classes</span>
                                    </div>
                                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="w-full aspect-square object-cover grayscale" alt="Class" />
                                </div>
                                <div className="space-y-4">
                                    <img src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="w-full aspect-square object-cover grayscale" alt="Work" />
                                    <div className="bg-white p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
                                        <Users className="text-primary w-8 h-8 mb-4" />
                                        <span className="font-bold text-sm uppercase tracking-wider">Mentorship</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ServicesPage;
