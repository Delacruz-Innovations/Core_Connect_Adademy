import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Clock, Video, BookOpen, UserCheck, PlayCircle, MessageCircle, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import Branded Images
import liveSessionsImg from '../assets/images/live_sessions.png';
import practicalExercisesImg from '../assets/images/practical_exercises.png';
import mentorshipImg from '../assets/images/mentorship.png';
import studyGroupImg from '../assets/images/study_group.png';

const HowWeTeach = () => {
    return (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 mb-4 border border-primary/20 rounded-full bg-primary/5 text-primary text-sm font-bold tracking-wide uppercase"
                    >
                        Our Methodology
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight"
                    >
                        How learning works <span className="text-primary italic">here</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We move at a serious pace, but we don't rush understanding.
                        <br className="hidden md:block" /> Every element is designed for retention.
                    </p>
                </div>

                {/* Mobile Slider / Desktop Grid Container */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:auto-rows-[280px] md:pb-0 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                    {/* 1. Live Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="min-w-[85vw] snap-center md:min-w-0 md:col-span-2 lg:col-span-2 row-span-2 overflow-hidden relative group rounded-2xl shadow-sm bg-black"
                    >
                        <img
                            src={liveSessionsImg}
                            alt="Live Class"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 flex flex-col justify-end">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg text-white shadow-red-900/20">
                                <Video size={24} fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Live, instructor-led sessions</h3>
                            <p className="text-gray-200">Direct interaction with experts who guide you through every concept in real-time.</p>
                        </div>
                    </motion.div>

                    {/* 2. Practical Exercises */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="min-w-[85vw] snap-center md:min-w-0 md:col-span-1 lg:col-span-1 row-span-2 bg-black rounded-2xl p-8 border border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
                    >
                        <img
                            src={practicalExercisesImg}
                            alt="Practical"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-blue-900/20">
                            <Laptop size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4 relative z-10">Practical Exercises</h3>
                        <p className="text-gray-300 leading-relaxed mb-6 flex-grow relative z-10">
                            Apply what you learn immediately. We build real dashboards and solve actual business problems.
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-auto border border-white/10 relative z-10">
                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-white/20 rounded w-3/4"></div>
                                <div className="h-2 bg-white/20 rounded w-1/2"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Mentorship */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="min-w-[85vw] snap-center md:min-w-0 bg-black rounded-2xl p-8 border border-gray-800 flex flex-col justify-between group hover:border-primary/40 transition-colors relative overflow-hidden"
                    >
                        <img
                            src={mentorshipImg}
                            alt="Mentorship"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

                        <div className="flex -space-x-3 mb-4 relative z-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden shadow-sm">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Mentor" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                +5
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                Mentorship <Check size={16} className="text-primary" />
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">Detailed feedback & accountability. You are never stuck for long.</p>
                        </div>
                    </motion.div>

                    {/* 4. Recorded Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="min-w-[85vw] snap-center md:min-w-0 bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden group"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity bg-center"
                            alt="Recording"
                        />
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                            <PlayCircle size={64} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <Clock className="w-6 h-6 text-orange-400 mb-3" />
                            <h3 className="text-lg font-bold mb-1">Recorded Sessions</h3>
                            <p className="text-sm text-gray-400">Missed a class? Watch it anytime, anywhere.</p>
                        </div>
                    </motion.div>

                    {/* 5. Study Partners */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="min-w-[85vw] snap-center md:min-w-0 md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center gap-8 relative overflow-hidden group"
                    >
                        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-purple-50 to-transparent opacity-50"></div>
                        <div className="flex-1 relative z-10">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Study Partners</h3>
                            <p className="text-gray-600 mb-4 max-w-md">You don't do this alone. Collaborate, troubleshoot, and grow with peers in your cohort.</p>
                            <div className="flex items-center gap-3 text-sm font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1.5 rounded-lg">
                                <MessageCircle size={16} />
                                <span>Private Community Access</span>
                            </div>
                        </div>
                        <div className="hidden sm:block w-48 h-32 rounded-lg overflow-hidden shrink-0 shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <img
                                src={studyGroupImg}
                                alt="Study Group"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* 6. Learning Materials */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="min-w-[85vw] snap-center md:min-w-0 md:col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-50 flex items-center justify-between group hover:shadow-md transition-all"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Clear Explanations</h3>
                            <p className="text-sm text-gray-500">We break down complex topics.</p>
                        </div>
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                    </motion.div>

                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link to="/courses">
                        <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30">
                            Explore Our Courses
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default HowWeTeach;
