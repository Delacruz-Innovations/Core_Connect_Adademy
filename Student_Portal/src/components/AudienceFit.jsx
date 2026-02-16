import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';

const AudienceFit = () => {
    return (
        <section className="py-4 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl border border-gray-100 bg-gray-100">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Team collaborating"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck className="text-green-400 w-8 h-8" />
                                    <span className="text-white font-bold text-lg">No Tech Degree Required</span>
                                </div>
                                <p className="text-white/90 text-sm font-medium">We focus on your potential, not your past.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                Who is CoreConnect for?
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed theme-text">
                                For people who are <span className="text-primary font-bold">capable, curious, and willing to learn</span> — but were never shown how tech careers actually work.
                            </p>
                        </motion.div>

                        <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">What You Need To Start</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {["A working laptop", "Full attention", "Dedication to learn", "Drive to succeed", "Determination"].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-primary" strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-base font-medium text-gray-900">
                                We teach from the beginning. <span className="text-primary font-bold">Properly.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AudienceFit;
