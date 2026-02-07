import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

const WhyCoreConnect = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mb-12"
                        >
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                                Why many people struggle to break into tech
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed border-l-4 border-red-200 pl-6">
                                Most people don't fail because they're not smart enough. <br />
                                <span className="font-semibold text-gray-900">They fail because nobody explained the structure.</span>
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            {/* The Trap */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-red-50 p-6 border border-red-100"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="text-red-500" />
                                    <h3 className="font-bold text-red-900">The Common Trap</h3>
                                </div>
                                <ul className="space-y-3">
                                    {["Watched random videos without direction", "Took isolated courses with no connection", "Tried to 'figure it out' alone"].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-red-800/80">
                                            <span className="w-1.5 h-1.5 bg-red-400 mt-2 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* The Solution */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-xl font-bold mb-4 text-gray-900">
                                    Tech roles are about:
                                </h3>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "Structured thinking",
                                        "Clear communication",
                                        "Understanding how teams actually work"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="bg-green-100 p-1">
                                                <CheckCircle className="text-green-600 w-5 h-5 shrink-0" />
                                            </div>
                                            <span className="text-lg font-medium text-gray-800">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="bg-primary text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide uppercase shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                                    Learn How We Teach
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative order-1 lg:order-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent -rotate-3 transform scale-105 -z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Structured Planning vs Chaos"
                            className="shadow-2xl w-full h-auto object-cover border border-gray-100"
                        />

                        {/* Floating Quote Card */}
                        <div className="absolute -bottom-10 -left-10 bg-white p-6 shadow-xl border border-gray-100 max-w-xs hidden md:block">
                            <p className="text-gray-600 italic mb-4">"I spent 6 months watching tutorials and got nowhere. CoreConnect gave me the roadmap in 2 weeks."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 flex items-center justify-center font-bold text-gray-500">JD</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">James D.</p>
                                    <p className="text-xs text-gray-500">Junior PM, Hired 2024</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default WhyCoreConnect;
