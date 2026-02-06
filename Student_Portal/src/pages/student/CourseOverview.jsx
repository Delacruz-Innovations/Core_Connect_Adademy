import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle2, FileText, Download, ArrowLeft, Clock } from 'lucide-react';
import { useFadeInOnScroll, useStaggerOnScroll } from '../../hooks/useScrollAnimations';

const CourseOverview = () => {
    const { courseId } = useParams();
    const headerRef = useFadeInOnScroll('up', 0.6);
    const progressRef = useFadeInOnScroll('up', 0.8, 0.2);
    const curriculumRef = useFadeInOnScroll('left', 0.8, 0.3);

    const courseDetails = {
        title: "Project Management & Business Analysis",
        description: "Master the dual expertise of project management and business analysis. Drive change and deliver results with this comprehensive 12-week program.",
        progress: 45,
        modules: [
            { id: 1, title: 'Module 1: Foundations of PM', status: 'completed', duration: '2h 30m' },
            { id: 2, title: 'Module 2: Project Planning', status: 'completed', duration: '3h 15m' },
            { id: 3, title: 'Module 4: Business Analysis Basics', status: 'current', duration: '2h 45m' },
            { id: 4, title: 'Module 5: Requirements Elicitation', status: 'locked', duration: '3h 00m' },
            { id: 5, title: 'Module 6: Analysis & Design', status: 'locked', duration: '4h 15m' }
        ]
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Header / Breadcrumb */}
            <Link to="/student/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                {/* Left Side: Course Info */}
                <div ref={headerRef} className="lg:col-span-7 space-y-10">
                    <div className="space-y-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Course Programme</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-none">{courseDetails.title}</h1>
                        <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-2xl">{courseDetails.description}</p>
                    </div>

                    <div ref={progressRef} className="bg-white border border-gray-100 p-6 md:p-10 shadow-sm space-y-8">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest">Your Course Progress</h3>
                            <span className="text-2xl md:text-3xl font-black italic text-primary">{courseDetails.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-50 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${courseDetails.progress}%` }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-primary"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <span>{courseDetails.modules.filter(m => m.status === 'completed').length} Modules Completed</span>
                            <span>{courseDetails.modules.length} Total Modules</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link
                            to={`/student/course/${courseId}/module/3`} // Dummy jump to current module
                            className="inline-flex items-center gap-4 bg-black text-white px-8 md:px-12 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all"
                        >
                            Continue Learning <Play size={16} fill="currentColor" />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Curriculum */}
                <div ref={curriculumRef} className="lg:col-span-5">
                    <div className="bg-white border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-10 border-b border-gray-50">
                            <h2 className="text-xl font-black italic uppercase tracking-tight">Curriculum</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {courseDetails.modules.map((module) => (
                                <div
                                    key={module.id}
                                    className={`p-6 md:p-8 flex items-center justify-between group transition-colors ${module.status === 'locked' ? 'bg-gray-50/50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all ${module.status === 'completed' ? 'bg-green-50 text-green-500' :
                                            module.status === 'current' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' :
                                                'bg-gray-100 text-gray-300'
                                            }`}>
                                            {module.status === 'completed' ? <CheckCircle2 size={16} /> :
                                                module.status === 'locked' ? <Lock size={16} /> :
                                                    <Play size={14} fill="currentColor" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-xs md:text-sm font-black uppercase tracking-widest ${module.status === 'locked' ? 'text-gray-300' : 'text-black'
                                                }`}>
                                                {module.title}
                                            </h4>
                                            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                                <Clock size={12} /> {module.duration}
                                            </span>
                                        </div>
                                    </div>

                                    {module.status !== 'locked' && (
                                        <Link
                                            to={`/student/course/${courseId}/module/${module.id}`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight size={20} className="text-primary" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Internal icon dependency fix
const ChevronRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default CourseOverview;
