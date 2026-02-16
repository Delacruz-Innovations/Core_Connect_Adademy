import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Plus, Minus, MessageCircle, Mail, Clock,
    UserPlus, Settings, CreditCard, Award,
    Wrench, Briefcase, HelpCircle, Search, FileText,
    MessageSquare, Shield, Lock, Eye, Database,
    Share2, Cookie, UserCheck, Star
} from 'lucide-react';
import SuccessStories from './SuccessStories';

const AboutContent = () => {
    const supportCategories = [
        { title: "Account setup and access", icon: <UserPlus size={20} /> },
        { title: "Course troubleshooting", icon: <Settings size={20} /> },
        { title: "Billing and payment inquiries", icon: <CreditCard size={20} /> },
        { title: "Certificate requests", icon: <Award size={20} /> },
        { title: "Technical issues", icon: <Wrench size={20} /> },
        { title: "Career services support", icon: <Briefcase size={20} /> },
        { title: "General questions", icon: <HelpCircle size={20} /> }
    ];

    return (
        <div className="flex flex-col">
            {/* ABOUT US Section */}
            <section id="about" className="py-4 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Welcome to CoreConnectAcademy</span>
                                <h2 className="text-3xl md:text-3xl lg:text-3xl font-black text-black leading-[0.9] italic uppercase tracking-tighter mb-8">
                                    Where potential <br />
                                    <span className="text-primary italic">meets purpose</span>
                                </h2>

                                <div className="text-gray-600 text-lg leading-relaxed font-medium space-y-6">
                                    <p className="text-xl text-gray-900 font-bold border-l-4 border-primary pl-6">
                                        At CoreConnectAcademy, we believe learning should be practical, accessible and impactful.
                                    </p>
                                    <p>
                                        We’re on a mission to bridge the gap between education and employment by equipping individuals—especially emerging professionals—with industry-aligned skills, hands-on learning, and real-world application.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="aspect-[4/3] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Collaborative learning"
                                    className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Industry-Validated", desc: "Curriculum designed with employers and practitioners" },
                            { title: "Expert Instructors", desc: "Professionals who’ve been there, done that" },
                            { title: "Interactive Experience", desc: "Learning that goes beyond lectures" },
                            { title: "Support Systems", desc: "Caring deeply about your individual progress" }
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="w-12 h-1 bg-primary mb-6 group-hover:w-full transition-all duration-500"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 border-t border-gray-100 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 font-sans uppercase italic tracking-tighter">Empowering Success</h3>
                            <p className="text-gray-600 leading-relaxed font-medium italic">
                                Our courses span digital skills, career acceleration, and professional development, all rooted in practical learning and measurable outcomes.
                            </p>
                            <p className="text-gray-900 font-black italic text-xl">
                                "At CoreConnectAcademy, we don’t just teach — we enable you to succeed."
                            </p>
                        </div>
                        <div className="bg-black p-10 text-white space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Why learners choose us</h4>
                            <ul className="space-y-4">
                                {[
                                    "Curriculum shaped by real jobs and hiring trends",
                                    "Flexible and supportive learning environments",
                                    "Continuous mentorship and community engagement",
                                    "Focus on doing, not just knowing"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-sm font-bold tracking-tight">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <SuccessStories />



            {/* CAREERS Section */}
            <section id="careers" className="py-4 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <div>
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Join Our Team</span>
                                <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[0.9] italic uppercase tracking-tighter">
                                    Build the <br /><span className="text-primary italic">Academy</span> With Us
                                </h2>
                                <p className="text-xl text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                                    Are you passionate about education, innovation, and transforming career journeys? So are we.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Why Work With Us</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { title: "Meaningful Work", desc: "Impact learners' lives in a growth-oriented company", icon: "✨" },
                                        { title: "Mission-Driven", desc: "Inclusive culture built on shared purpose", icon: "🤝" },
                                        { title: "Development", desc: "Continuous professional growth opportunities", icon: "📈" },
                                        { title: "Flexibility", desc: "Remote-first culture with flexible arrangements", icon: "🏠" },
                                        { title: "Autonomy", desc: "Collaborative teams with real decision-making power", icon: "🚀" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-6 bg-white border border-gray-100 items-center group hover:shadow-xl transition-all">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">{item.title}</h4>
                                                <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="bg-black text-white p-10 lg:p-16 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-10">Current Openings</h3>

                                <div className="space-y-4">
                                    {[
                                        "Instructional Designer",
                                        "Community Learning Facilitator",
                                        "Software Engineer (Full Stack)",
                                        "Career Coach",
                                        "Customer Success Specialist",
                                        "Content Marketing Specialist"
                                    ].map((job, i) => (
                                        <div key={i} className="py-4 border-b border-white/10 flex justify-between items-center group cursor-pointer hover:border-primary transition-colors">
                                            <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{job}</span>
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 space-y-6">
                                    <div className="p-8 border border-primary/30 bg-primary/5 rounded-sm">
                                        <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Ready to shape the future?</h4>
                                        <p className="text-sm text-gray-300 mb-6 font-medium">Submit your resume and cover letter to:</p>
                                        <a href="mailto:careers@coreconnectacademy.com" className="text-primary font-black text-xl hover:underline">careers@coreconnectacademy.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutContent;
