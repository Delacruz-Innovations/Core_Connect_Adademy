import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Briefcase, Users, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const { user } = useAuth();

    const badges = [
        { icon: <Award className="text-secondary" />, text: "Quality Training", label: "UK Accredited" },
        { icon: <Briefcase className="text-secondary" />, text: "Real Projects", label: "Work Experience" },
        { icon: <Users className="text-secondary" />, text: "Expert Mentors", label: "Industry Leaders" },
        { icon: <Star className="text-secondary" />, text: "Career Success", label: "Graduate Support" }
    ];

    return (
        <div className="flex flex-col bg-slate-50">
            {/* Hero Content */}
            <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 bg-primary text-white">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 blur-3xl -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/2 w-64 h-64 bg-secondary/10 blur-3xl translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-1/2 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-white mb-6 mx-auto lg:mx-0 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            New Cohort Enrolling Now
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            Learn <span className="text-white/80">Properly</span>. <br />
                            Transition <span className="text-secondary">Confidently</span>.
                        </h1>

                        <p className="text-lg text-white/80 mb-8 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 border-l-2 border-secondary pl-6">
                            A structured, mentor-led academy for anyone ready to move into tech-adjacent careers—even if you're starting from zero.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to={user ? "/student/dashboard" : "/show-interest"} className="w-full sm:w-auto">
                                <button className="w-full bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                    {user ? "Go to Dashboard" : "Start Your Journey"}
                                    <ArrowRight size={18} />
                                </button>
                            </Link>
                            <div className="hidden sm:block text-sm text-white/60 font-medium">
                                {user ? "Welcome back!" : "No experience needed."}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Visual Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
                            {/* Browser Header */}
                            <div className="bg-gray-800/80 border-b border-white/5 px-4 py-3 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mx-auto bg-black/20 px-3 py-0.5 rounded text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    coreconnect.academy
                                </div>
                            </div>

                            {/* Video/Image Placeholder */}
                            <div className="aspect-video bg-black relative group">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                >
                                    <source src="/assets/videos/hero-background.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl border border-white/20 z-20">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                    +200
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Join the Community</p>
                                <p className="text-[10px] text-white/60">New cohort starting soon</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust Badges Bar */}
            <section className="bg-white py-10 border-b border-gray-100 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {badges.map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-default">
                                <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-gray-50 group-hover:bg-primary/10 transition-colors">
                                    {badge.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-black group-hover:text-primary transition-colors">{badge.text}</p>
                                    <p className="text-[11px] text-gray-500 uppercase tracking-widest">{badge.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Hero;
