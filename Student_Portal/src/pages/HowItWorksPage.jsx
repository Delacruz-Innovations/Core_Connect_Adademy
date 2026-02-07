import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Upload, MessageSquare, ArrowRight, Zap } from 'lucide-react';

const HowItWorksPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const steps = [
        {
            title: "1. Structure & Discipline",
            icon: <ShieldCheck size={24} />,
            desc: "This is not a content dump. You don't pick and choose. You follow a sequential, expert-designed path."
        },
        {
            title: "2. Week-by-Week Unlocking",
            icon: <Lock size={24} />,
            desc: "Modules unlock only when you're ready. You must watch 90% of the videos and submit your assignments to proceed."
        },
        {
            title: "3. Commitment Tracking",
            icon: <Zap size={24} />,
            desc: "We track your momentum. Week-to-week consistency is required. Drop-offs are monitored."
        },
        {
            title: "4. Assignment-Based Progression",
            icon: <Upload size={24} />,
            desc: "Watching isn't enough. You must build. Upload your artifacts to prove your understanding."
        },
        {
            title: "5. AI-Assisted Support",
            icon: <MessageSquare size={24} />,
            desc: "Stuck? Our AI Assistant is trained on the curriculum to guide you through concepts instantly."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        How It Works
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
                    <p className="text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto italic">
                        "We don't sell courses. We build capabilities through structure."
                    </p>
                </div>
            </section>

            {/* Core Philosophy */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-black italic uppercase tracking-tight mb-8">
                        The System
                    </h2>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        Our Learning Management System is built on a simple truth: <br />
                        <span className="text-black font-bold">Unstructured learning leads to unfinished goals.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 p-8 hover:border-black transition-colors group">
                            <div className="w-12 h-12 bg-white flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all border border-gray-100">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">{step.title}</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}

                    {/* Final Card - CTA */}
                    <div className="bg-black text-white p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">Ready to Commit?</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                                If you're ready to follow the process, we're ready to guide you.
                            </p>
                        </div>
                        <button className="w-full bg-primary text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                            Start Journey <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorksPage;
