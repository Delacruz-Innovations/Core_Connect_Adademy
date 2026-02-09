import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, Award, Share2, Download } from 'lucide-react';

const CourseCompletion = () => {
    const { courseId } = useParams();

    const recommendedCourses = [
        { id: 'da-456', title: 'Advanced Data Analysis', image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: 'scrum-789', title: 'Agile Scrum Mastery', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ];

    return (
        <div className="space-y-12 mx-auto min-h-screen">

            {/* Premium Header - Centered for Celebration */}
            <div className="flex flex-col items-center text-center gap-6 border-b border-gray-100 pb-12 pt-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 rounded-full mb-4"
                >
                    <Award size={48} />
                </motion.div>

                <div className="space-y-4 max-w-3xl">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Program Completed</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Congratulations!
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        You have successfully completed the <br />
                        <span className="text-gray-900 font-bold border-b-2 border-primary/20 pb-1">Project Management & Business Analysis Program</span>
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <button className="bg-primary text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-sm">
                        <Download size={16} /> Download Certificate
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-900 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-primary hover:text-primary transition-all rounded-sm shadow-sm">
                        <Share2 size={16} /> Share Achievement
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Summary */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-sm">
                            <CheckCircle2 size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Performance Summary</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            "All 12 learning modules completed",
                            "All assignments passed",
                            "Capstone project submitted",
                            "Attendance record: 100%"
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-white border border-gray-100 shadow-sm hover:border-primary/20 transition-all group rounded-sm">
                                <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                                    <CheckCircle2 size={12} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide leading-snug group-hover:text-black transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                        <div className="p-2 bg-primary/10 text-primary rounded-sm">
                            <GraduationCap size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Next Steps</h3>
                    </div>
                    <div className="bg-gray-50 p-8 border border-gray-100 relative overflow-hidden h-full flex flex-col justify-between rounded-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-8">
                            <p className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary pl-4">
                                "Now that you've mastered the foundations, your certification will be verified within 48 hours. We recommend updating your LinkedIn profile with your new credentials."
                            </p>

                            <div className="space-y-4 pt-4">
                                <Link to="/student/profile" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors group bg-white p-4 border border-gray-200 hover:border-primary shadow-sm rounded-sm">
                                    <span className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                        <ArrowRight size={14} />
                                    </span>
                                    Update Profile Skills
                                </Link>
                                <Link to="/student/dashboard" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors group bg-white p-4 border border-gray-200 hover:border-primary shadow-sm rounded-sm">
                                    <span className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                        <ArrowRight size={14} />
                                    </span>
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recommendations */}
            <div className="space-y-8 pt-12 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Available Courses</span>
                        <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">Continue Learning</h3>
                    </div>
                    <Link to="/student/courses" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                        View All Courses <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {recommendedCourses.map((course) => (
                        <div key={course.id} className="group relative aspect-[16/9] overflow-hidden bg-black cursor-pointer rounded-sm shadow-md hover:shadow-xl transition-all">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-700 scale-100 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>

                            <div className="absolute inset-0 p-10 flex flex-col justify-end items-start border-4 border-transparent group-hover:border-primary/50 transition-all m-2">
                                <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6 leading-none translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {course.title}
                                </h4>
                                <span className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500 delay-100 rounded-sm">
                                    Explore Course <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseCompletion;
