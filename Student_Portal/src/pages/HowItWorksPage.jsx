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
                <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-secondary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Our Methodology</span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black mb-10 italic uppercase tracking-tighter leading-[0.85]">
                            The <span className="text-primary italic">Process</span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-3xl font-medium leading-relaxed max-w-3xl mx-auto text-white/70 italic">
                            "We don't sell courses. <span className="text-white">We build capabilities through structure.</span>"
                        </p>
                    </motion.div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {steps.map((step, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-10 hover:border-primary transition-all duration-500 group shadow-sm hover:shadow-xl relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-9xl font-black text-gray-50 group-hover:text-primary/5 transition-colors -z-0">
                                {i + 1}
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-primary mb-8 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                                <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Final Card - CTA */}
                    <div className="bg-black text-white p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl group-hover:bg-primary/40 transition-colors"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Ready to Commit?</h3>
                            <p className="text-white/60 text-[15px] font-medium leading-relaxed mb-10">
                                If you're ready to follow the process, we're ready to guide you. No shortcuts, just growth.
                            </p>
                        </div>
                        <button className="relative z-10 w-full bg-primary text-white py-5 font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                            Start Journey <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorksPage;
