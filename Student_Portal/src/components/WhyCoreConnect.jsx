import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import frustratedStudentImg from '../assets/images/frustrated_student.png';

const WhyCoreConnect = () => {
    return (
        <section className="py-4 bg-gray-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">
                            Why many struggle to <br className="hidden md:block" /> break into tech
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 border-l-4 border-secondary pl-4">
                            Most people don't fail because they aren't smart enough. <br />
                            <span className="font-semibold text-gray-900">They fail because nobody explained the structure.</span>
                        </p>

                        <div className="space-y-4 mb-8">
                            <h3 className="text-lg font-bold text-gray-900">
                                Tech roles require:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Structured thinking",
                                    "Clear communication",
                                    "Understanding team dynamics"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link to="/how-it-works">
                            <button className="bg-white text-primary border border-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all shadow-sm">
                                Learn How We Teach
                            </button>
                        </Link>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-100">
                            <img
                                src={frustratedStudentImg}
                                alt="Student learning tech"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default WhyCoreConnect;
