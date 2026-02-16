import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 bg-black overflow-hidden">
                {/* Background Image/Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="FAQ Knowledge"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-white/5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Knowledge Base</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Everything you need to know about learning with us. Can't find the answer you're looking for? Contact our support team.
                    </p>
                </div>
            </div>

            <div className="pt-16 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Search Bar Placeholder */}
                    <div className="relative max-w-xl mx-auto mb-16">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <div className="bg-white shadow-2xl overflow-hidden border border-gray-100 rounded-2xl">
                        {faqList.map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>

                    <div className="mt-20 text-center bg-gray-50 rounded-2xl p-10 border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
                        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Get in touch
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FAQPage;
