import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Users, Globe } from 'lucide-react';

const CareersPage = () => {
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
                        backgroundImage: 'url("https://images.unsplash.com/photo-1522071822107-119d81660415?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")',
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
                        className="text-6xl font-black mb-6 italic tracking-tight"
                    >
                        Careers
                    </motion.h1>
                    <p className="max-w-3xl mx-auto text-xl text-white/90 font-medium italic">
                        Join a team that's shaping the future of education, innovation, and technology. At CORE CONNECT ACADEMY, we don't just offer jobs—we offer careers that inspire and empower.
                    </p>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Why Join CORE CONNECT ACADEMY?</span>
                        <h2 className="text-4xl font-black italic">Be Part of Something Bigger</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            At CORE CONNECT ACADEMY, we're more than a company—we're a mission-driven organisation that transforms lives through cutting-edge training and education. Joining us means being part of a dynamic, innovative, and supportive team that values your growth as much as our impact.
                        </p>

                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Here’s Why You’ll Love Working With Us:</h4>
                            {[
                                { t: "Impactful Work", d: "Everything we do empowers individuals to unlock their potential and thrive in high-demand industries." },
                                { t: "Innovative Environment", d: "Work with passionate professionals at the forefront of technology education and business transformation." },
                                { t: "Growth Opportunities", d: "Whether you're just starting out or looking to take your career to the next level, we invest in your personal and professional development." },
                                { t: "A Culture of Excellence", d: "We celebrate collaboration, creativity, and results. You'll join a team where your ideas are valued and your successes are celebrated." },
                                { t: "Diversity and Inclusion", d: "At CORE CONNECT ACADEMY, we embrace the power of diverse perspectives. We thrive because of the variety of experiences and backgrounds our team brings to the table." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <CheckCircle size={18} className="text-primary shrink-0 mt-1 transition-transform group-hover:scale-125" />
                                    <div>
                                        <h5 className="font-bold text-black text-sm mb-1">{item.t}</h5>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/5] overflow-hidden shadow-2xl skew-x-1 hover:skew-x-0 transition-transform duration-1000">
                            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Team collaborating" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 -z-10 blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Values/Life Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-square bg-white p-4 shadow-2xl relative z-10">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Life at CORE CONNECT" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 -z-10 rotate-12"></div>
                        </div>
                        <div className="space-y-10 order-1 lg:order-2">
                            <div>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Life at CORE CONNECT ACADEMY</span>
                                <h2 className="text-4xl font-black italic mt-4">Where Passion Meets Purpose</h2>
                                <p className="text-gray-500 font-medium leading-relaxed mt-6">
                                    Life at CORE CONNECT ACADEMY is dynamic, inspiring, and rewarding. Here’s what you can expect when you join our team:
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Our Values in Action:</h4>
                                    {[
                                        "Innovation Every Day",
                                        "Collaborative Spirit",
                                        "Work-Life Balance",
                                        "Celebrating Success"
                                    ].map((val, i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <CheckCircle size={14} className="text-primary" />
                                            <span className="text-sm font-bold text-gray-700">{val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">What Our Team Loves:</h4>
                                    {[
                                        "Modern Workspace",
                                        "Professional Development",
                                        "Inclusive Culture"
                                    ].map((val, i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <CheckCircle size={14} className="text-primary" />
                                            <span className="text-sm font-bold text-gray-700">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-white border border-gray-100 italic">
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    "We value authenticity, so let your personality and passion shine. CORE CONNECT ACADEMY is a place where you can be yourself while contributing to something monumental."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Get Ready: Our Recruitment Process</span>
                                <h2 className="text-4xl font-black italic mt-4">Your Journey to Joining Our Team Starts Here</h2>
                                <p className="text-gray-500 font-medium leading-relaxed mt-6">
                                    We're excited to meet individuals who are passionate, innovative, and eager to make an impact. Our recruitment process is designed to be transparent, supportive, and fair.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { step: "Submit Your Application", desc: "Find a role that excites you and apply online. Be sure to tailor your CV to showcase your skills and achievements." },
                                    { step: "Initial Screening", desc: "Our recruitment team will review your application to ensure your skills align with the role. If short-listed, you’ll be invited for the next step." },
                                    { step: "Interviews", desc: "Depending on the role, you may go through 1-2 interview stages." },
                                    { step: "Offer and Onboarding", desc: "If you’re successful, you’ll receive an offer and be guided through a seamless onboarding process. Welcome to CORE CONNECT ACADEMY!" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-none border-2 border-primary flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/10">0{i + 1}</div>
                                            {i < 3 && <div className="w-0.5 flex-1 bg-primary/20 mt-2"></div>}
                                        </div>
                                        <div className="pb-8">
                                            <h4 className="font-bold text-lg mb-2">{item.step}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="bg-primary text-white px-12 py-5 rounded-md font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/10 hover:bg-black transition-all">
                                View Open Roles and Start Your Journey
                            </button>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-white shadow-2xl relative z-10 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1522071901873-41f8163cc400?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Recruitment" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 border-[1px] border-primary translate-x-10 translate-y-10 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CareersPage;
