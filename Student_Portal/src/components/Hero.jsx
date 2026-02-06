import React from 'react';
import { motion } from 'framer-motion';
import { Award, Briefcase, Users, Star } from 'lucide-react';

const Hero = () => {
    const badges = [
        { icon: <Award className="text-secondary" />, text: "Quality Training Provider", label: "UK Accredited" },
        { icon: <Briefcase className="text-secondary" />, text: "Practical Projects", label: "Work Experience" },
        { icon: <Users className="text-secondary" />, text: "Expert Mentors", label: "Industry Leaders" },
        { icon: <Star className="text-secondary" />, text: "Career Success", label: "Graduate Support" }
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Content */}
            <section className="relative bg-primary text-white overflow-hidden min-h-screen flex items-center pt-24 lg:pt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                Transform <br />
                                Your Career
                            </h1>
                            <p className="text-lg text-white/90 mb-10 max-w-xl leading-relaxed">
                                Become a project management professional and data analyst professional for several companies.
                                Our students earn £40k - £80k salaries. Get the required project and mentorship at CORE CONNECT ACADEMY to land your dream job.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-primary px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase shadow-lg shadow-black/10 transition-transform hover:-translate-y-1">
                                    Learn More
                                </button>
                                <button className="border border-white text-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-white hover:text-primary">
                                    Get Started
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex justify-center lg:justify-end"
                        >
                            <div className="relative max-w-lg">
                                {/* Mockup illustration shape */}
                                <div className="bg-black rounded-lg p-2 shadow-2xl border-4 border-gray-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Learning Platform"
                                        className="rounded-sm w-full"
                                    />
                                </div>
                                {/* Float elements to mimic illustration */}
                                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-md shadow-xl text-black">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Star className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs">Join Classes</p>
                                            <p className="text-[10px] text-gray-500">Live Session Now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Bar */}
            <section className="bg-white py-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {badges.map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 flex items-center justify-center shrink-0">
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
