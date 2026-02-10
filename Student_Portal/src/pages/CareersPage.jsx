import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';

const CareersPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Join Our Team of Mentors"
                description="Work with us to help shape the next generation of engineers. We're looking for tutors and mentors who care about teaching properly."
                url="/careers"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522071822107-119d81660415?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Work With Us
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    <div className="space-y-8">
                        <div>
                            <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 block">Our Team</span>
                            <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
                                We work with tutors, mentors, and professionals who care about <span className="text-primary italic">teaching properly</span>.
                            </h2>
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Can explain complex ideas simply",
                                "Value patience over ego",
                                "Believe learning should be done well"
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 items-center font-bold text-lg text-gray-700 bg-gray-50 p-6 shadow-sm border border-gray-100 hover:border-primary transition-colors">
                                    <div className="w-2 h-2 bg-primary group-hover:bg-primary-dark transition-colors shrink-0 rounded-full"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative bg-black text-white p-12 lg:p-16 flex flex-col justify-between h-full group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 scale-150 rounded-full blur-[120px] -z-10 translate-x-12 translate-y-12"></div>

                        <div className="space-y-8 relative z-10">
                            <h3 className="text-4xl lg:text-6xl font-black uppercase tracking-tight leading-none mb-4">
                                Join the <br />
                                <span className="text-primary">Academy.</span>
                            </h3>
                            <p className="text-xl text-gray-300 font-medium leading-relaxed">
                                "We’d like to hear from you."
                            </p>

                            <button className="bg-white text-black px-12 py-5 font-bold text-sm tracking-widest uppercase hover:bg-gray-100 transition-colors w-full sm:w-auto">
                                View Opportunities
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CareersPage;
