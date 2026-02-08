import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Briefcase, Users, Star, ArrowRight } from 'lucide-react';

const Hero = () => {
    // Video background replaces the image slideshow

    const badges = [
        { icon: <Award className="text-secondary" />, text: "Quality Training Provider", label: "UK Accredited" },
        { icon: <Briefcase className="text-secondary" />, text: "Practical Projects", label: "Work Experience" },
        { icon: <Users className="text-secondary" />, text: "Expert Mentors", label: "Industry Leaders" },
        { icon: <Star className="text-secondary" />, text: "Career Success", label: "Graduate Support" }
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Content */}
            <section className="relative bg-primary text-white overflow-hidden min-h-screen flex items-center pt-20 lg:pt-0">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 blur-3xl -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/2 w-64 h-64 bg-secondary/10 blur-3xl translate-y-1/2"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col lg:flex-row items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 py-20 lg:py-32 lg:pr-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-xs font-medium text-white mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 animate-pulse"></span>
                            New Cohort Enrolling Now
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
                            Learn <span className="text-white">properly</span>. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">
                                Transition
                            </span>
                            <br />
                            confidently.
                        </h1>

                        <p className="text-xl text-white/80 mb-12 leading-relaxed font-medium max-w-xl border-l-2 border-secondary pl-8 py-2">
                            A structured, mentor-led academy for anyone ready to move into tech-adjacent careers — even if you're starting from zero.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Link to="/show-interest">
                                <button className="bg-white text-primary px-12 py-5 rounded-full font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3 group active:translate-y-0">
                                    Register Interest
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <div className="flex flex-col justify-center h-full">
                                <p className="text-xs text-secondary font-black uppercase tracking-widest opacity-80">
                                    No pressure. Just clarity.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Video Section (Desktop & Mobile) */}
                    <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0">
                        {/* Decorative Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

                        {/* Browser Mockup Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm"
                        >
                            {/* Browser Header */}
                            <div className="h-10 bg-gray-800/80 border-b border-white/5 flex items-center px-4 gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mx-auto bg-black/20 px-4 py-1 rounded-full text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    app.coreconnect.academy
                                </div>
                            </div>

                            {/* Video Player */}
                            <div className="relative aspect-video bg-black rounded-b-xl overflow-hidden group">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                >
                                    <source src="/assets/videos/hero-background.mp4" type="video/mp4" />
                                </video>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                            </div>
                        </motion.div>

                        {/* Floating Experience Badge - Repositioned */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -bottom-6 -right-6 z-20 hidden lg:block"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    <img className="w-10 h-10 border-2 border-white rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Student" />
                                    <img className="w-10 h-10 border-2 border-white rounded-full object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Student" />
                                    <div className="w-10 h-10 border-2 border-white bg-secondary text-white flex items-center justify-center text-xs font-bold rounded-full">+200</div>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Join the Academy</p>
                                    <p className="text-white/60 text-xs">New cohort starting soon</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
