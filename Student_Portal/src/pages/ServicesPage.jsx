import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, ArrowRight, Building2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const ServicesPage = () => {
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
                        backgroundImage: 'url("/pillow-hero.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-bold mb-6 italic"
                    >
                        Services
                    </motion.h1>
                    <p className="max-w-3xl mx-auto text-xl text-white/90 font-medium italic">
                        At CORE CONNECT ACADEMY, we don't just deliver training—we drive results that matter for businesses, government institutions, and public-sector organisations.
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs">Introduction</span>
                        <h2 className="text-4xl font-bold mt-4 mb-8 leading-tight">Helping You Solve Workforce Challenges</h2>
                        <p className="text-gray-500 leading-relaxed font-sans">
                            Organisations today face a rapidly shifting landscape: skills gaps, evolving technologies, and the need for agile, innovative teams. Whether you're a corporate entity or a public-sector organisation, CORE CONNECT ACADEMY provides targeted solutions to equip your teams with the knowledge, tools, and confidence they need to thrive.
                        </p>
                    </div>
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 border border-gray-100 shadow-sm text-center group">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                <Building2 size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-4">Corporate Training Services</h3>
                            <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary flex items-center justify-center gap-2 mx-auto">
                                Read More <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="bg-white p-10 border border-gray-100 shadow-sm text-center group">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                <Globe size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-4">Public-Sector Partnerships</h3>
                            <button className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary flex items-center justify-center gap-2 mx-auto">
                                Read More <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Corporate Detailed Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] overflow-hidden rounded-none shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Corporate training" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 -z-10"></div>
                        </div>
                        <div className="space-y-8">
                            <span className="text-primary font-bold uppercase tracking-widest text-[11px]">Corporate Training Services</span>
                            <h2 className="text-4xl font-bold leading-tight italic">Transform Your Teams. Elevate Your Results</h2>
                            <p className="text-gray-500 italic font-medium leading-relaxed">
                                Our corporate training programs are designed to address the unique challenges of businesses across industries. We deliver hands-on, practical training to upskill your workforce and ensure they're prepared for the demands of today—and tomorrow.
                            </p>

                            <div className="space-y-6">
                                <h4 className="font-bold uppercase tracking-[0.2em] text-[11px]">Key Features</h4>
                                {[
                                    { t: "Tailored Training Programs", d: "Customizable courses in areas like Business Analysis, Cybersecurity, Process Automation, and Artificial Intelligence to meet your team’s specific needs." },
                                    { t: "Practical Learning", d: "Real-world projects and case studies ensure participants gain applicable skills from day one." },
                                    { t: "Flexible Delivery", d: "Choose from on-site training, live virtual sessions, or hybrid models to suit your organisation’s schedule." },
                                    { t: "CPD-Certified Courses", d: "Our programs are globally recognised and designed to meet industry standards." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle className="text-primary shrink-0 mt-1" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-black">{item.t}: <span className="text-gray-500 font-medium normal-case">{item.d}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6">
                                <button className="bg-primary/10 text-primary px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all">
                                    Let’s Build a Smarter Workforce — Contact Us Today!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Public Sector Detailed Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 order-2 lg:order-1">
                            <span className="text-primary font-bold uppercase tracking-widest text-[11px]">Public-Sector Partnerships</span>
                            <h2 className="text-4xl font-bold leading-tight italic">Driving Impact for Communities and Institutions</h2>
                            <p className="text-gray-500 italic font-medium leading-relaxed">
                                We collaborate with government agencies and public-sector organisations to design impactful training programs that address societal and institutional challenges.
                            </p>

                            <div className="space-y-6">
                                <h4 className="font-bold uppercase tracking-[0.2em] text-[11px]">Our Approach</h4>
                                {[
                                    { t: "Strategic Collaboration", d: "We work closely with your organisation to identify gaps, set objectives, and deliver training aligned with your mission." },
                                    { t: "Specialised Training Areas", d: "From Telehealth to Education Technology and Robotics Engineering, we equip public-sector teams with cutting-edge skills to address modern challenges." },
                                    { t: "Building Capacity", d: "Our training programs empower government officials, healthcare workers, educators, and other public-sector employees to excel in their roles." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle className="text-primary shrink-0 mt-1" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-black">{item.t}: <span className="text-gray-500 font-medium normal-case">{item.d}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6">
                                <button className="bg-primary/10 text-primary px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all">
                                    Partner With Us To Drive Public-Sector Innovation—Contact Our Team!
                                </button>
                            </div>
                        </div>
                        <div className="relative order-1 lg:order-2">
                            <div className="aspect-[4/5] overflow-hidden rounded-none shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Public sector" className="w-full h-full object-cover" />
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
