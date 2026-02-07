import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Calendar, Users, Mic, ArrowRight } from 'lucide-react';

const EventsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-50 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Learn Before You Decide
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    <div className="space-y-8">
                        <div>
                            <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 block">Events</span>
                            <h2 className="text-4xl font-bold text-black mb-6 leading-tight">
                                Our events exist to help you understand what you’re getting into — <span className="text-primary italic">calmly and honestly</span>.
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">We host:</h4>
                            {[
                                { text: "Learning sessions", icon: <Users size={18} /> },
                                { text: "Career clarity talks", icon: <Mic size={18} /> },
                                { text: "Open Q&A discussions", icon: <Users size={18} /> },
                                { text: "Role walk-throughs", icon: <Calendar size={18} /> }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <div className="w-10 h-10 border border-gray-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all bg-white">
                                        {item.icon}
                                    </div>
                                    <span className="text-xl font-bold text-gray-800 group-hover:translate-x-1 transition-transform">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-12 lg:p-16 border-l-4 border-primary relative">
                        <div className="space-y-8 relative z-10">
                            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 uppercase tracking-tight leading-none">
                                These are not<br />
                                <span className="text-gray-400 line-through decoration-primary decoration-4">sales events.</span>
                            </h3>
                            <p className="text-2xl font-medium text-gray-600 italic">
                                They are spaces for <span className="text-black font-bold border-b-2 border-primary">understanding</span>.
                            </p>

                            <div className="pt-8">
                                <button className="bg-primary text-white px-10 py-5 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform flex items-center gap-2 group w-full sm:w-auto justify-center">
                                    View Upcoming Events
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default EventsPage;
