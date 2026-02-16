import React from 'react';
import { Database, UserCheck, Share2, Mail, Shield, Lock, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    const privacySections = [
        {
            title: "Information We Collect",
            icon: <Database size={24} />,
            content: [
                "Account Information: name, email, password",
                "Usage Data: courses viewed, progress, interactions",
                "Technical Data: IP address, device type, browser",
                "Communication Data: messages, support inquiries"
            ]
        },
        {
            title: "How We Use Your Information",
            icon: <UserCheck size={24} />,
            content: [
                "Deliver and improve services",
                "Personalize your learning experience",
                "Process payments",
                "Communicate updates and support",
                "Comply with legal obligations"
            ]
        },
        {
            title: "Data Sharing",
            icon: <Share2 size={24} />,
            content: [
                "We do not sell your personal data.",
                "Shared with service providers only to deliver our platform",
                "When required by law",
                "With your consent"
            ]
        },
        {
            title: "Data Security",
            icon: <Shield size={24} />,
            content: [
                "We implement industry-standard security measures",
                "Encryption of sensitive data in transit and at rest",
                "Regular security audits and vulnerability assessments",
                "Access controls to limit internal data access"
            ]
        },
        {
            title: "Your Rights",
            icon: <Eye size={24} />,
            content: [
                "Access and update your personal information",
                "Request deletion of your account and data",
                "Opt-out of marketing communications",
                "Request a copy of your data"
            ]
        },
        {
            title: "Cookies & Tracking",
            icon: <Lock size={24} />,
            content: [
                "We use cookies to improve user experience",
                "Analytics to understand usage patterns",
                "You can control cookie preferences in your browser settings"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 bg-black overflow-hidden">
                {/* Background Image/Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Security"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-white/5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline decoration-primary decoration-2 underline-offset-4">Privacy Policy</span>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-8 text-white">
                        Privacy & <span className="text-primary italic">Protection</span>
                    </h1>
                    <p className="text-gray-300 font-bold uppercase tracking-widest text-xs mb-8">Last Updated: February 13, 2026</p>
                    <p className="text-xl text-gray-200 font-medium leading-relaxed italic border-l-4 border-primary pl-8 text-left mx-auto max-w-3xl">
                        This Privacy Policy explains how CoreConnectAcademy collects, uses, shares, and protects your personal information. We are committed to ensuring that your privacy is protected.
                    </p>
                </div>
            </div>

            <div className="pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {privacySections.map((section, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group hover:border-primary/20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary border border-gray-100">
                                        {section.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight leading-tight">{section.title}</h3>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-600 font-medium">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 items-start">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="p-10 bg-black text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="relative z-10">
                                <h4 className="text-2xl font-bold italic uppercase tracking-tighter mb-2">Questions about your Privacy?</h4>
                                <p className="text-gray-400 text-sm font-medium">Contact our legal protocol team for any inquiries.</p>
                            </div>
                            <a href="mailto:privacy@coreconnectacademy.com" className="relative z-10 flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-all border border-white/10">
                                <Mail size={18} className="text-primary" />
                                <span className="font-bold">privacy@coreconnectacademy.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
