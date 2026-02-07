import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Clock, Video, BookOpen, UserCheck, PlayCircle, MessageCircle } from 'lucide-react';

const HowWeTeach = () => {
    return (
        <section className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900"
                    >
                        How learning works here
                    </motion.h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We move at a serious pace — but we don't rush understanding.
                    </p>
                </div>

                {/* Bento Grid Layout - Squared Off */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">

                    {/* 1. Live Sessions (Large Feature) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 lg:col-span-2 row-span-2 overflow-hidden relative group shadow-sm bg-black"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Live Class"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                            <div className="w-12 h-12 bg-red-500 flex items-center justify-center mb-4 shadow-lg text-white">
                                <Video size={24} fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Live, instructor-led sessions</h3>
                            <p className="text-white/80">Direct interaction with experts who guide you through every concept in real-time.</p>
                        </div>
                    </motion.div>

                    {/* 2. Practical Exercises (Tall) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1 lg:col-span-1 row-span-2 bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                            <Check size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Practical Exercises</h3>
                        <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                            Apply what you learn immediately. We build real dashboards, manage real project artifacts, and solve actual business problems.
                        </p>
                        <div className="bg-gray-100 p-4 mt-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-red-400"></div>
                                <div className="w-3 h-3 bg-yellow-400"></div>
                                <div className="w-3 h-3 bg-green-400"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-gray-300 w-3/4"></div>
                                <div className="h-2 bg-gray-300 w-1/2"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Mentorship (Standard) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-primary/5 p-8 border border-primary/10 flex flex-col justify-between"
                    >
                        <div className="flex -space-x-2 mb-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 border-2 border-white bg-gray-200">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Mentor" className="w-full h-full" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-2">Mentorship</h3>
                            <p className="text-sm text-gray-600">Detailed feedback & accountability.</p>
                        </div>
                    </motion.div>

                    {/* 4. Recorded Sessions (Standard) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900 p-8 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <div className="border-4 border-white p-2">
                                <PlayCircle size={80} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <Clock className="w-8 h-8 text-secondary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Recorded Sessions</h3>
                            <p className="text-sm text-gray-400">Missed a class? Watch it within 48 hours.</p>
                        </div>
                    </motion.div>

                    {/* 5. Study Partners (Wide) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 lg:col-span-2 bg-white p-8 border border-gray-100 shadow-sm flex items-center gap-8"
                    >
                        <div className="hidden sm:block w-1/3 h-full">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Study Group"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                                <Users size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Study Partners</h3>
                            <p className="text-gray-600 mb-4">You don't do this alone. Collaborate, troubleshoot, and grow with peers in your cohort.</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                                <MessageCircle size={16} />
                                <span>Private Community Access</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 6. Learning Materials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-1 lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 border border-gray-100 flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Clear Explanations</h3>
                            <p className="text-sm text-gray-500">We break down complex topics.</p>
                        </div>
                        <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm">
                            <BookOpen className="text-gray-400" size={20} />
                        </div>
                    </motion.div>

                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <button className="bg-primary text-white px-10 py-4 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 transition-transform hover:-translate-y-1">
                        Explore Our Courses
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default HowWeTeach;
