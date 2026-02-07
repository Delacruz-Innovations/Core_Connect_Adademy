import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, Minus, Download, ArrowDown } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-100 mb-4 bg-white shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex justify-between items-center text-left"
            >
                <span className="font-bold text-black text-sm">{question}</span>
                {isOpen ? <Minus size={16} className="text-primary" /> : <Plus size={16} className="text-gray-300" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ResourcesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Free Learning Resources
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Intro Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                        We believe people should understand <span className="text-primary italic">before they commit</span>.
                    </h2>

                    <div className="flex flex-col md:flex-row justify-center gap-8 py-8">
                        {["Understand tech careers", "Reduce fear and confusion", "Make informed decisions"].map((text, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary mb-2 shadow-sm border border-gray-100">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="text-lg font-bold text-gray-700">{text}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-2xl font-black italic text-gray-400">
                        "They’re free, practical, and beginner-friendly."
                    </p>

                    <button
                        onClick={() => document.getElementById('resources-content').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-primary text-white px-10 py-5 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform inline-flex items-center gap-2"
                    >
                        Explore Resources <ArrowDown size={16} />
                    </button>
                </div>
            </section>

            <div id="resources-content">
                {/* Free Resources Section */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Free Resources</span>
                            <h2 className="text-4xl font-black italic leading-tight">Start Your Journey</h2>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Our carefully curated career bundle is packed with actionable insights to help you transition, grow, and excel in the tech world.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { t: "LinkedIn Optimisation eBook", d: "Build a Profile That Gets You Noticed." },
                                    { t: "How to Transition into Tech eBook", d: "Your Step-by-Step Guide to Breaking into Tech." },
                                    { t: "Acing Tech Interview eBook", d: "Confidence, Preparation, and Success." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 border border-gray-100 bg-gray-50 hover:bg-white hover:border-primary transition-all shadow-sm">
                                        <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                        <div>
                                            <h5 className="font-bold text-black text-sm mb-1">{item.t}</h5>
                                            <p className="text-gray-500 text-xs">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-black text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-3 shadow-xl">
                                <Download size={18} /> Download Bundle
                            </button>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] overflow-hidden shadow-2xl skew-x-1">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Free Resources" className="w-full h-full object-cover grayscale" />
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* Paid Resources Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="relative order-2 lg:order-1">
                                <div className="aspect-[4/5] overflow-hidden shadow-2xl -skew-x-1">
                                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Paid Resources" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                </div>
                                <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 -z-10"></div>
                            </div>

                            <div className="space-y-8 order-1 lg:order-2">
                                <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Paid Resources</span>
                                <h2 className="text-4xl font-black italic leading-tight">Professional Development</h2>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    Premium insights from our CEO designed for ambitious professionals ready to plan their career strategically.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { t: "Career Planning eBook", d: "Design Your Career Path with Confidence." },
                                        { t: "Personal Branding eBook", d: "Stand Out in a Crowded Market." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 p-4 border border-gray-200 bg-white hover:border-black transition-all shadow-sm">
                                            <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                            <div>
                                                <h5 className="font-bold text-black text-sm mb-1">{item.t}</h5>
                                                <p className="text-gray-500 text-xs">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="bg-black text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-3 shadow-xl">
                                    <Download size={18} /> View Premium Bundle
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default ResourcesPage;
