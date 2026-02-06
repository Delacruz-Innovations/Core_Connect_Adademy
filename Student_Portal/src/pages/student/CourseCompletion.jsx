import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, Award, BookOpen, Share2 } from 'lucide-react';
import { useFadeInOnScroll, useStaggerOnScroll, useScaleInOnScroll } from '../../hooks/useScrollAnimations';

const CourseCompletion = () => {
    const { courseId } = useParams();
    const heroRef = useScaleInOnScroll(0.8);
    const summaryRef = useFadeInOnScroll('up', 0.8, 0.2);
    const guidanceRef = useFadeInOnScroll('up', 0.8, 0.4);
    const recommendedRef = useStaggerOnScroll(0.2);

    const recommendedCourses = [
        { id: 'da-456', title: 'Advanced Data Analysis', image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { id: 'scrum-789', title: 'Agile Scrum Mastery', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
    ];

    return (
        <div className="max-w-5xl mx-auto py-12 px-2 md:px-0 space-y-16 md:space-y-24 pb-24">

            {/* Completion Hero */}
            <div ref={heroRef} className="text-center space-y-8 py-10 md:py-16 bg-white border border-gray-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-primary text-white flex items-center justify-center mx-auto shadow-xl shadow-primary/20"
                >
                    <GraduationCap size={48} />
                </motion.div>

                <div className="space-y-4 px-4 md:px-0">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Programme Achieved</span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Congratulations!</h1>
                    <p className="text-base md:text-xl text-gray-400 font-medium max-w-2xl mx-auto italic">
                        You have successfully completed the Project Management & Business Analysis Professional Programme.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 pt-6 px-8">
                    <button className="bg-black text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all">
                        <Award size={18} /> Download Certificate
                    </button>
                    <button className="border border-gray-100 px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-gray-50 transition-all">
                        <Share2 size={18} /> Share Achievement
                    </button>
                </div>
            </div>

            {/* Completion Stats & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

                <div ref={summaryRef} className="space-y-8">
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Completion Summary</h3>
                    <div className="space-y-4">
                        {[
                            "All 12 learning modules finalized",
                            "All course assignments reviewed & passed",
                            "Final Capstone project successfully submitted",
                            "Attendance record: 100%"
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 md:p-5 bg-white border border-gray-50 group hover:border-primary/20 transition-all">
                                <CheckCircle2 size={18} className="text-primary shrink-0" />
                                <span className="text-[11px] md:text-xs font-bold text-gray-500 uppercase tracking-widest leading-snug">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div ref={guidanceRef} className="space-y-8">
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Next Step Guidance</h3>
                    <div className="bg-primary/5 p-8 md:p-10 border border-primary/10 relative">
                        <div className="absolute top-0 left-0 w-12 h-1 bg-primary"></div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed italic mb-8">
                            "Now that you've mastered the foundations, your certification will be verified within 48 hours. We recommend updating your LinkedIn profile with your new credentials and exploring our Career Support resources."
                        </p>
                        <Link
                            to="/student/profile"
                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2"
                        >
                            Update Profile Skills <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>

            {/* Recommendations */}
            <div className="space-y-12">
                <div className="flex flex-col items-center gap-3">
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Continue Your Evolution</h3>
                    <div className="w-12 h-1 bg-gray-100"></div>
                </div>

                <div ref={recommendedRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {recommendedCourses.map((course) => (
                        <div key={course.id} className="group relative aspect-[16/9] overflow-hidden bg-black shadow-xl">
                            <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
                            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                                <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white mb-6 leading-tight">{course.title}</h4>
                                <Link
                                    to={`/student/courses`}
                                    className="self-start inline-flex items-center gap-3 bg-white text-black px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                >
                                    Explore Course <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CourseCompletion;
