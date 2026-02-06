import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, Minus, Download } from 'lucide-react';

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
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/65"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black mb-6 italic tracking-tight"
                    >
                        Resources
                    </motion.h1>
                    <p className="max-w-2xl mx-auto text-xl text-white/90 font-medium italic">
                        Find helpful guides, insightful articles, informative videos, and valuable tools to enhance your experience
                    </p>
                </div>
            </section>

            {/* Free Resources Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Free Resources</span>
                        <h2 className="text-4xl font-black italic leading-tight">Start Your Journey with These Free Resources</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            We believe in giving everyone the tools to succeed. Our carefully curated career bundle is packed with actionable insights to help you transition, grow, and excel in the tech world.
                        </p>

                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">What's Included in the Career Bundle:</h4>
                            {[
                                { t: "LinkedIn Optimisation eBook", d: "Build a Profile That Gets You Noticed. Learn how to create a standout LinkedIn profile that attracts recruiters and boosts your professional presence." },
                                { t: "How to Transition into Tech eBook", d: "Your Step-by-Step Guide to Breaking into Tech as a Project Manager or Business Analyst. Discover proven strategies for transitioning into tech roles, even without prior experience." },
                                { t: "Acing Tech Interview eBook", d: "Confidence, Preparation, and Success. Master the art of tech interviews with expert tips on answering questions, showcasing your skills, and impressing hiring managers." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                    <div>
                                        <h5 className="font-bold text-black text-sm mb-1">{item.t}: <span className="text-gray-500 font-medium normal-case">{item.d}</span></h5>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Why It's For You:</h4>
                            {[
                                "You're considering a career change but need guidance.",
                                "You want to stand out to recruiters and land your dream role.",
                                "You're preparing for interviews and need proven techniques."
                            ].map((text, i) => (
                                <div key={i} className="flex gap-4">
                                    <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                    <p className="text-gray-500 text-sm font-medium">{text}</p>
                                </div>
                            ))}
                        </div>

                        <button className="bg-primary/10 text-primary border border-primary/20 px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-3 shadow-xl shadow-primary/5">
                            <Download size={18} /> Download the Free Career Bundle
                        </button>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/5] overflow-hidden shadow-2xl">
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
                            <div className="aspect-[4/5] overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Paid Resources" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 -z-10"></div>
                        </div>

                        <div className="space-y-8 order-1 lg:order-2">
                            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Paid Resources</span>
                            <h2 className="text-4xl font-black italic leading-tight">Invest in Your Professional Growth</h2>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Take your career to the next level with premium insights from our CEO. This exclusive Professional Development bundle is designed for ambitious professionals ready to plan their career strategically and build a powerful personal brand.
                            </p>

                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">What's Included in the Professional Development Bundle:</h4>
                                {[
                                    { t: "Career Planning eBook", d: "Design Your Career Path with Confidence. Learn to set meaningful goals, overcome challenges, and strategically plan your professional growth." },
                                    { t: "Personal Branding eBook", d: "Stand Out in a Crowded Market. Master the art of personal branding to position yourself as a thought leader and attract top opportunities." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                        <div>
                                            <h5 className="font-bold text-black text-sm mb-1">{item.t}: <span className="text-gray-500 font-medium normal-case">{item.d}</span></h5>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Why It's For You:</h4>
                                {[
                                    "You're ready to take control of your career path and make informed decisions.",
                                    "You want to establish a personal brand that reflects your value and expertise.",
                                    "You're seeking actionable strategies from a leader who has helped thousands of professionals excel."
                                ].map((text, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle size={18} className="text-primary shrink-0 mt-1" />
                                        <p className="text-gray-500 text-sm font-medium">{text}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-primary text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-primary/20">
                                <Download size={18} /> Download the Free Career Bundle
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Our Resources */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-black italic mb-12">Why Choose Our Resources?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { t: "Expert Insights", d: "Created by professionals with proven success in helping thousands transition and grow their careers." },
                        { t: "Actionable Advice", d: "No fluff—just practical, real-world strategies you can apply immediately." },
                        { t: "Transformational Outcomes", d: "Whether free or paid, our resources are designed to deliver results." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 bg-white p-8 border border-gray-100 shadow-sm group hover:border-primary transition-colors">
                            <CheckCircle size={20} className="text-primary shrink-0 mt-1" />
                            <div>
                                <h5 className="font-bold text-black text-sm mb-2">{item.t}:</h5>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block">Frequently Asked Questions:</span>
                    <div className="space-y-4">
                        <FAQItem question="Are the free resources really free?" answer="Yes, our career bundle is 100% free with no hidden charges. Just provide your email to receive the direct download link." />
                        <FAQItem question="How will I receive the paid bundle?" answer="After a successful transaction, you will receive an email immediately with a link to download your digital resources." />
                        <FAQItem question="Can I purchase the paid bundle if I'm outside the UK?" answer="Absolutely! Our digital resources are available globally. Payment can be made in multiple currencies via our secure gateway." />
                        <FAQItem question="Are the resources suitable for beginners?" answer="Yes, we've designed our guides specifically for individuals who are just starting their journey or looking to transition into the tech industry without prior background." />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ResourcesPage;
