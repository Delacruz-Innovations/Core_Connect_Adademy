import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = ({ className = "", hideScroll = false }) => {
    return (
        <footer className={`bg-white pt-32 pb-12 border-t border-gray-100 italic relative z-10 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">

                    {/* Brand Info */}
                    <div className="lg:col-span-4 not-italic space-y-8">
                        <div className="flex items-center">
                            <img className="h-10 w-auto" src="/logo.png" alt="Core Connect Academy" />
                            <div className="ml-2 flex flex-col leading-none">
                                <span className="text-xl font-bold italic">CORE CONNECT</span>
                                <span className="text-[10px] tracking-[0.3em] font-semibold uppercase text-primary">Academy</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm font-medium">
                            Empowering the next generation of tech leaders through world-class training and mentorship at Core Connect Academy.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 bg-gray-50 rounded-none flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 not-italic">
                        <h4 className="font-bold text-black mb-8 uppercase tracking-[0.2em] text-[11px]">Courses</h4>
                        <ul className="space-y-4 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Project Mgmt</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Business Analysis</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Data Analysis</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Cyber Security</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Cloud Eng</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 not-italic">
                        <h4 className="font-bold text-black mb-8 uppercase tracking-[0.2em] text-[11px]">Useful Links</h4>
                        <ul className="space-y-4 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Support Center</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div className="lg:col-span-4 not-italic">
                        <h4 className="font-bold text-black mb-8 uppercase tracking-[0.2em] text-[11px]">Contact Us</h4>
                        <ul className="space-y-6 mb-10">
                            <li className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center shrink-0">
                                    <Phone size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Call Anywhere</p>
                                    <p className="text-sm font-bold">+44 7401 282068</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-gray-50 flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Email Support</p>
                                    <p className="text-sm font-bold">info@coreconnectacademy.co.uk</p>
                                </div>
                            </li>
                        </ul>

                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="YOUR EMAIL"
                                className="w-full bg-gray-50 border-0 p-5 pr-16 text-[11px] font-bold tracking-[0.2em] focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                            <button className="absolute right-0 top-0 bottom-0 px-6 bg-primary text-white hover:bg-black transition-colors">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="not-italic pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-primary"></span>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">© 2024 CORE CONNECT ACADEMY. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8">
                        {['Privacy', 'Terms', 'Sitemap'].map((item) => (
                            <a key={item} href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator typical of these designs */}
            {!hideScroll && (
                <div className="fixed bottom-10 right-10 z-40 hidden lg:block">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] rotate-90 mb-12 origin-right whitespace-nowrap">Scroll Down</p>
                        <div className="w-[1px] h-20 bg-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-primary animate-scrollIndicator"></div>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
