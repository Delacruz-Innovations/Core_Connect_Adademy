import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-8 flex justify-between items-center text-left group"
            >
                <span className={`text-xl font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-900 group-hover:text-primary'}`}>{question}</span>
                <div className={`w-8 h-8 flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-white'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 text-gray-600 text-lg leading-relaxed font-medium">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqList = [
        { q: "Do I need a tech background?", a: "No." },
        { q: "Do I need to know how to code?", a: "No. Even in AI Vibe Coding, we start from the beginning." },
        { q: "Is this open to everyone?", a: "Yes. What matters is commitment." },
        { q: "Is this easy?", a: "No. It requires effort and discipline." },
        { q: "Do you guarantee jobs?", a: "No. We prepare you properly, but we don’t sell guarantees." },
        { q: "Are sessions recorded?", a: "Yes. Recordings are available within 48 hours." }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Frequently Asked Questions"
                description="Find answers to common questions about our software engineering and design mentorship tracks, prerequisites, and learning methodology."
                url="/faqs"
            />
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
                        Common Questions
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-2xl overflow-hidden border border-gray-100">
                        {faqList.map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/contact" className="inline-flex flex-col items-center gap-4 group">
                            <span className="text-2xl font-black italic text-gray-900">Still Have Questions?</span>
                            <button className="bg-primary text-white px-12 py-5 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform flex items-center gap-2">
                                Contact Us <MessageCircle size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQPage;
