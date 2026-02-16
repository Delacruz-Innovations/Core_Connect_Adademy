import React from 'react';
import { Mail, Clock, Search, FileText, MessageSquare, UserPlus, Settings, CreditCard, Award, Wrench, Briefcase, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SupportPage = () => {
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
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 bg-black overflow-hidden">
                {/* Background Image/Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Support Team"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-white/5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Support Centre</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6">
                        We’re Here for You — <br /><span className="text-primary">Every Step</span> of the Way
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Need help with enrolment, access, certificates, or anything else? Our Support Centre is designed to give you fast, friendly, and effective assistance.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        {/* Categories */}
                        <div className="space-y-10">
                            <h2 className="text-2xl font-bold text-gray-900">Common Topics</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {supportCategories.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 hover:border-primary transition-colors group rounded-lg cursor-pointer hover:shadow-md">
                                        <div className="text-gray-400 group-hover:text-primary transition-colors">
                                            {cat.icon}
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-tight text-gray-700">{cat.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Options */}
                        <div className="bg-black text-white p-10 md:p-14 relative overflow-hidden rounded-2xl shadow-2xl">
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
            </div>

            <Footer />
        </div>
    );
};

export default SupportPage;
