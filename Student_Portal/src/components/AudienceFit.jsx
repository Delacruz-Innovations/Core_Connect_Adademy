import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck } from 'lucide-react';

const AudienceFit = () => {
    return (
        <section className="py-24 bg-gray-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Visual Side */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 -z-10 -translate-x-4 -translate-y-4"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 -z-10 translate-x-4 translate-y-4"></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="overflow-hidden shadow-2xl relative"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Minimalist laptop setup"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck className="text-green-400 w-8 h-8" />
                                    <span className="text-white font-bold text-lg">No Tech Degree Required</span>
                                </div>
                                <p className="text-white/80 text-sm">We focus on your potential, not your past credential.</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                Who is CoreConnect for?
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                For people who are <span className="text-primary font-bold">capable, curious, and willing to learn</span> — but were never shown how tech careers actually work.
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            {/* Don't Need Group */}
                            {/* <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 shadow-sm border border-gray-100/50"
                            >
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">You Don't Need</h3>
                                <div className="space-y-3">
                                    {["A tech background", "To know how to code", "To sound confident"].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-500">
                                            <X size={18} className="text-red-300 shrink-0" />
                                            <span className="line-through decoration-gray-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div> */}

                            {/* Do Need Group */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-6 shadow-lg border-l-4 border-primary relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5"></div>
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">What You Need Is</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                                    {["A laptop", "Full attention", "Dedication", "Drive", "Determination"].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-900 font-medium">
                                            <div className="p-1 bg-primary text-white flex items-center justify-center shrink-0">
                                                <Check size={14} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="mt-10 pt-6 border-t border-gray-200"
                        >
                            <p className="text-lg font-medium text-gray-900">
                                We teach from the beginning. <span className="text-primary font-bold">Properly.</span>
                            </p>
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AudienceFit;
