import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Phone, Mail, Instagram, Twitter, Linkedin, Youtube, Music, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

const ContactPage = () => {
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
                        backgroundImage: 'url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4 flex flex-col items-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black mb-4 italic tracking-tight"
                    >
                        Want to reach out <br />to us?
                    </motion.h1>
                    <p className="text-sm font-bold uppercase tracking-[0.4em] text-white/70 mb-12">We want to hear about it</p>

                    <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
                        <div className="flex-1 bg-primary p-8 flex items-center gap-6 shadow-2xl">
                            <div className="w-14 h-14 bg-white/10 flex items-center justify-center shrink-0">
                                <Phone className="text-white" size={24} />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-1">Call Us Now</span>
                                <span className="text-2xl font-black text-white">+44 7401 262066</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-black/40 backdrop-blur-md p-8 flex items-center gap-6 shadow-2xl border border-white/10">
                            <div className="w-14 h-14 bg-white/10 flex items-center justify-center shrink-0">
                                <Mail className="text-white" size={24} />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 block mb-1">Get In Touch</span>
                                <span className="text-xl font-bold text-white">info@coreconnectacademy.co.uk</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schedule Call Section */}
            <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-px bg-primary/30"></div>
                                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">Contact</span>
                            </div>
                            <h2 className="text-6xl font-black italic tracking-tight mb-8">Schedule <br />A Call</h2>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-md">
                                Whether you're ready to kickstart your career in tech, upgrade your skills, or simply have questions about our programs, we're here to help! At CORE CONNECT ACADEMY, we're passionate about guiding you toward your goals and ensuring your journey in technology is as seamless as possible.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {[Instagram, Twitter, Linkedin, Youtube, Music, Linkedin].map((Icon, i) => (
                                <div key={i} className="w-10 h-10 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                                    <Icon size={18} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-2 border border-gray-100 shadow-sm">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
                            <input type="text" placeholder="First Name" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                            <input type="text" placeholder="Last Name" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                            <input type="text" placeholder="Phone Number" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                            <input type="email" placeholder="E-mail" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />

                            <div className="relative">
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                <option>Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                            <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                <option>Select Course</option>
                            </select>
                            <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                <option>Select Country</option>
                            </select>
                            <textarea className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400 md:col-span-2 h-32" placeholder="Your Message"></textarea>
                            <button className="md:col-span-2 bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20">
                                Book A Free Consultation
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="relative h-[600px] bg-gray-100 overflow-hidden">
                {/* Placeholder for map - using a stylized background for visual parity with the mockup */}
                <div className="absolute inset-0 grayscale opacity-50">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Map" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-12 shadow-2xl max-w-md w-full border border-gray-100"
                    >
                        <h3 className="text-2xl font-black mb-8 italic">CORE CONNECT <span className="text-gray-400">Academy</span></h3>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <MapPin className="text-primary shrink-0" size={20} />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Location</span>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">
                                        Enfield, Greater London, <br />United Kingdom
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Phone className="text-primary shrink-0" size={20} />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Contact</span>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">+44 7401 262066</p>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">+44 7496 149132</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Mail className="text-primary shrink-0" size={20} />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">E-mail</span>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">info@coreconnectacademy.co.uk</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-50">
                            <button className="w-full bg-primary text-white py-4 rounded-md font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all">
                                Schedule A Meeting <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
