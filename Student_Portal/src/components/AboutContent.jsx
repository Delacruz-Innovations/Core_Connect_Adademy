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

const AboutContent = () => {
    const faqList = [
        { q: "What is CoreConnectAcademy?", a: "CoreConnectAcademy is an online learning platform dedicated to delivering career-aligned education, skills training, and professional development programs that prepare learners for the modern workforce." },
        { q: "Who can enrol in your programs?", a: "Anyone! From career changers and recent graduates to professionals looking to upskill, all backgrounds are welcome." },
        { q: "Are your courses instructor-led or self-paced?", a: "Both. Some programs are self-paced for flexible learning, while others include live sessions, workshops, and coach support." },
        { q: "How do I enrol?", a: "Just create an account, select your desired course, and complete enrolment. We’ll walk you through every step." },
        { q: "Do you provide certificates?", a: "Yes. Upon successful completion of qualifying programs, you’ll receive a certificate you can share on LinkedIn or add to your resume." },
        { q: "Can I get financial support or payment plans?", a: "We offer flexible payment options and occasional support programs. Check individual course pages or contact our Support Centre for details." },
        { q: "Is there career support after course completion?", a: "Yes! We offer resources such as resume reviews, mock interviews, job placement guidance, and community networking opportunities." },
        { q: "How do I get help if I have an issue?", a: "Visit our Support Centre or email support@coreconnectacademy.com — we’re here to help!" }
    ];

    const supportCategories = [
        { title: "Account setup and access", icon: <UserPlus size={20} /> },
        { title: "Course troubleshooting", icon: <Settings size={20} /> },
        { title: "Billing and payment inquiries", icon: <CreditCard size={20} /> },
        { title: "Certificate requests", icon: <Award size={20} /> },
        { title: "Technical issues", icon: <Wrench size={20} /> },
        { title: "Career services support", icon: <Briefcase size={20} /> },
        { title: "General questions", icon: <HelpCircle size={20} /> }
    ];

    const privacySections = [
        { title: "Information We Collect", icon: <Database size={24} />, content: ["Account Information: name, email, password", "Usage Data: courses viewed, progress, interactions", "Technical Data: IP address, device type, browser", "Communication Data: messages, support inquiries"] },
        { title: "How We Use Your Information", icon: <UserCheck size={24} />, content: ["Deliver and improve services", "Personalize your learning experience", "Process payments", "Communicate updates and support", "Comply with legal obligations"] },
        { title: "Data Sharing", icon: <Share2 size={24} />, content: ["We do not sell your personal data.", "Shared with service providers only to deliver our platform", "When required by law", "With your consent"] }
    ];

    return (
        <div className="flex flex-col">
            {/* ABOUT US Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Welcome to CoreConnectAcademy</span>
                                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-black leading-[0.9] italic uppercase tracking-tighter mb-8">
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

            {/* FAQs Section */}
            <section id="faqs" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Knowledge Base</span>
                        <h2 className="text-4xl md:text-6xl font-black text-black italic uppercase tracking-tighter mb-4">
                            Frequently Asked <span className="text-primary">Questions</span>
                        </h2>
                    </div>
                    <div className="bg-white shadow-2xl overflow-hidden border border-gray-100">
                        {faqList.map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* SUPPORT Section */}
            <section id="support" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Support Centre</span>
                                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">We’re Here for You — <br /><span className="text-primary">Every Step</span> of the Way</h2>
                                <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                                    Need help with enrolment, access, certificates, or anything else? Our Support Centre is designed to give you fast, friendly, and effective assistance.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {supportCategories.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 hover:border-primary transition-colors group">
                                        <div className="text-gray-400 group-hover:text-primary transition-colors">
                                            {cat.icon}
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-tight text-gray-700">{cat.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black text-white p-10 md:p-14 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-xl font-bold italic uppercase tracking-tighter mb-10">How to Get Support</h3>
                            <div className="space-y-8 relative z-10">
                                <div className="flex gap-6 items-start">
                                    <Search className="text-primary mt-1" size={24} />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Search Knowledge Base</h4>
                                        <p className="text-gray-400 text-xs font-medium">Quick answers to common questions</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <FileText className="text-primary mt-1" size={24} />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Submit a Request</h4>
                                        <p className="text-gray-400 text-xs font-medium">Our team personally reviews and responds</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <MessageSquare className="text-primary mt-1" size={24} />
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Chat with Us</h4>
                                        <p className="text-gray-400 text-xs font-medium">Live support available Monday — Friday</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-white/10 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="text-primary" size={20} />
                                    <span className="text-lg font-bold">support@coreconnectacademy.com</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Clock className="text-primary" size={20} />
                                    <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">9:00 AM — 6:00 PM (Local Time)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CAREERS Section */}
            <section id="careers" className="py-24 bg-gray-50 overflow-hidden">
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

            {/* PRIVACY Section */}
            <section id="privacy" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mb-16">
                        <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-primary decoration-2 underline-offset-4">Privacy Policy</span>
                        <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8">
                            Privacy & <span className="text-primary italic">Protection</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Last Updated: February 13, 2026</p>
                        <p className="text-xl text-gray-900 font-medium leading-relaxed italic border-l-4 border-primary pl-8">
                            This Privacy Policy explains how CoreConnectAcademy collects, uses, shares, and protects your personal information.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {privacySections.map((section, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors text-primary">
                                        {section.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{section.title}</h3>
                                </div>
                                <ul className="pl-16 space-y-3 text-sm text-gray-600 font-medium list-disc list-inside">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="leading-relaxed">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-10 bg-black text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="text-xl font-bold italic uppercase tracking-tighter mb-2">Questions about your Privacy?</h4>
                            <p className="text-gray-400 text-sm font-medium">Contact our legal protocol team for any inquiries.</p>
                        </div>
                        <a href="mailto:privacy@coreconnectacademy.com" className="text-primary font-black text-xl hover:underline">privacy@coreconnectacademy.com</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutContent;
