import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, BarChart, CheckCircle2,
    ChevronDown, ChevronUp, Download,
    PlayCircle, FileText, Users,
    Target, Briefcase, GraduationCap,
    MessageCircle, ArrowLeft
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const courseData = {
        title: "Project Management and Business Analysis",
        description: "Master the dual expertise of project management and business analysis. Drive change and deliver results with this comprehensive 12-week program that transforms you into a versatile asset for any organization. This is one part of a full course which includes Business Analysis.",
        duration: "12 weeks",
        level: "Beginner to Intermediate",
        highlights: [
            "Project Manager",
            "Business Analyst",
            "Project Coordinator",
            "PMO Analyst",
            "Business Systems Analyst",
            "Process Analyst",
            "Consultant (Project Management or Business Analysis)",
            "AI-Enhanced Project Lead",
            "Operations Manager (with a project focus)"
        ],
        curriculum: [
            { id: 1, title: "Module 1: Foundations of Project Management", content: "Introduction to PM methodologies, lifecycle phases, and core project documents." },
            { id: 2, title: "Module 2: Project Planning & Scheduling", content: "Mastering Work Breakdown Structures (WBS), Gantt charts, and resource allocation." },
            { id: 3, title: "Module 3: Project Execution & Control", content: "Leading teams, monitoring progress, and managing change requests effectively." },
            { id: 4, title: "Module 4: Introduction to Business Analysis", content: "Defining the role of a BA and understanding the Business Analysis Body of Knowledge (BABOK)." },
            { id: 5, title: "Module 5: Requirements Elicitation & Collaboration", content: "Bridging the gap between stakeholders and technical teams through effective interviewing." },
            { id: 6, title: "Module 6: Requirements Analysis & Solution Design", content: "Documenting requirements, process mapping, and verifying vendor solutions." },
            { id: 7, title: "Module 7: Agile Project Management with Business Analysis", content: "Combining BA skills with Scrum and Kanban frameworks for rapid delivery." },
            { id: 8, title: "Module 8: AI in Project Management", content: "Leveraging generative AI for automated scheduling and risk prediction." },
            { id: 9, title: "Module 9: AI in Business Analysis", content: "Using AI for data synthesis, requirement generation, and competitive research." },
            { id: 10, title: "Module 10: Tools & Techniques for PM & BA", content: "Deep dive into Jira, Confluence, MS Project, and Miro." },
            { id: 11, title: "Module 11: Capstone Project / Real-World Application", content: "Applying learned concepts to a real-world business case with mentor feedback." }
        ],
        prerequisites: [
            "A keen interest in project management and business analysis.",
            "Strong communication and problem-solving aptitude.",
            "No formal prior experience is strictly required, but some professional exposure can be beneficial.",
            "Proficiency in English."
        ]
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <Navbar />

            {/* Hero Section - The big white card on dark background */}
            <section className="bg-primary pt-32 pb-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Courses
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
                    >
                        <div className="p-10 lg:p-20 lg:w-3/5 space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-6xl font-black text-black leading-tight tracking-tighter">
                                    {courseData.title}
                                </h1>
                                <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                    {courseData.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-4">
                                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full border border-gray-100">
                                    <Clock size={18} className="text-primary" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Duration: {courseData.duration}</span>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-full border border-gray-100">
                                    <BarChart size={18} className="text-primary" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Level: {courseData.level}</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link to="/show-interest">
                                    <button className="bg-primary text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-black transition-all transform hover:-translate-y-1">
                                        Register Interest
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-2/5 relative min-h-[400px]">
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Course Collaboration"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden lg:block"></div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section - 2 Column Layout */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-16">
                        <div className="space-y-10">
                            <div className="inline-block">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Course</span>
                                <h2 className="text-3xl font-black italic tracking-tighter text-black uppercase">{courseData.title}</h2>
                                <div className="w-12 h-1 bg-primary mt-2"></div>
                            </div>

                            <div className="aspect-video bg-gray-100 rounded-none overflow-hidden group relative">
                                <img
                                    src="https://images.unsplash.com/photo-1522071823907-b93933cb6681?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Training session"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <PlayCircle size={64} className="text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black mb-6">Unlock Your Dual Expertise: Master Project Management & Business Analysis</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    In today's fast-paced business world, effective project management with modern business analysis are essential for organizational success. This comprehensive course is designed to empower you with an integrated skill set, enabling you to not only plan and execute projects flawlessly but also to identify, analyze, and solve complex business challenges.
                                </p>
                                <p className="text-gray-600 leading-relaxed font-medium mt-6">
                                    At Core Connect Academy, we've designed this programme to transform you into a versatile asset for any organization. You'll learn to bridge the gap between business objectives and project delivery, ensuring that projects are not just completed on time and within budget, but that they also deliver real, tangible value. Get ready to become a strategic thinker, a problem solver, and a leader who can deliver successful outcomes.
                                </p>

                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black mt-16 mb-8">What You Will Master!</h3>
                                <div className="space-y-6">
                                    {[
                                        "Initiate & Plan Projects: Define project scope, objectives, and deliverables; develop comprehensive project plans, timelines, and budgets.",
                                        "Execute & Monitor: Lead project teams, manage resources effectively, track progress, and implement quality control measures.",
                                        "Manage Risks & Stakeholders: Identify potential project risks, develop mitigation strategies, and engage effectively with stakeholders at all levels.",
                                        "Elicit & Manage Requirements: Master techniques for gathering, documenting, analyzing, and managing business and stakeholder requirements.",
                                        "Analyze & Model Processes: Understand and model business processes to identify areas for improvement and design effective solutions.",
                                        "Bridge Business & Technology: Translate business needs into technical specifications and communicate effectively with both business and technical teams.",
                                        "Agile & Waterfall Methodologies: Gain an understanding of different project management methodologies and when to apply them.",
                                        "Leverage AI: Understand the application of Artificial Intelligence in streamlining project management tasks and enhancing business analysis insights.",
                                        "Deliver Value: Ensure projects align with strategic goals and deliver measurable business benefits."
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1.5 shrink-0">
                                                <CheckCircle2 size={18} className="text-primary" />
                                            </div>
                                            <p className="text-gray-600 font-bold leading-relaxed">
                                                <span className="text-black uppercase text-xs tracking-widest">{item.split(':')[0]}:</span>
                                                {item.split(':')[1]}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-black mt-16 mb-8">Who Should Enroll?</h3>
                                <p className="text-gray-600 font-medium mb-6 italic">This course is ideal for:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    {[
                                        "Aspiring Project Managers or Business Analysts",
                                        "Professionals looking to transition into tech roles",
                                        "Existing PMs or BAs wanting to formalize their knowledge",
                                        "Team leads, managers, or consultants",
                                        "Entrepreneurs and small business owners",
                                        "Anyone whose role involves project work or solving problems"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 bg-gray-50 p-4 border border-gray-100">
                                            <Users size={16} className="text-primary shrink-0" />
                                            <span className="text-xs font-bold text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-12">

                            {/* Curriculum Accordion */}
                            <div className="bg-white border border-gray-100 shadow-xl p-8 lg:p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Curriculum</span>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-black uppercase">Course Highlights</h3>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {courseData.curriculum.map((module, i) => (
                                        <div key={i} className="border-b border-gray-50 last:border-none">
                                            <button
                                                onClick={() => setActiveModule(activeModule === i ? -1 : i)}
                                                className="w-full py-5 flex items-center justify-between text-left group"
                                            >
                                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${activeModule === i ? 'text-primary' : 'text-gray-400 group-hover:text-black'}`}>
                                                    {module.title}
                                                </span>
                                                {activeModule === i ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-gray-300" />}
                                            </button>
                                            <AnimatePresence>
                                                {activeModule === i && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="pb-6 text-sm text-gray-500 font-medium leading-relaxed italic">
                                                            {module.content}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transform Your Career */}
                            <div className="p-8 lg:p-12 border-l-4 border-primary bg-gray-50">
                                <h3 className="text-2xl font-black italic tracking-tighter text-black uppercase mb-8">Transform Your Career Potential</h3>
                                <p className="text-sm font-medium text-gray-500 mb-8 italic">Graduates of this programme will be well-equipped to pursue a variety of rewarding roles, including:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    {courseData.highlights.map((role, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-800">{role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prerequisites */}
                            <div className="p-8 lg:p-12 border border-gray-100 bg-white">
                                <h3 className="text-2xl font-black italic tracking-tighter text-black uppercase mb-8">Prerequisites</h3>
                                <div className="space-y-4">
                                    {courseData.prerequisites.map((req, i) => (
                                        <div key={i} className="flex gap-4">
                                            <CheckCircle2 size={16} className="text-gray-300 shrink-0 mt-0.5" />
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed italic">{req}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Final CTA */}
                            <div className="bg-black text-white p-10 lg:p-16 text-center space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                                <div className="relative z-10 w-full">
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-6 leading-tight">Ready to Become an <br />Indispensable Asset?</h3>
                                    <p className="text-white/60 text-sm font-medium leading-relaxed mb-10 max-w-xs mx-auto">
                                        Take the next step in your career journey. Secure your spot in the Core Connect Academy's Project Management & Business Analysis course.
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <Link to="/show-interest">
                                            <button className="w-full bg-primary text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-white hover:text-primary transition-all">
                                                Register Interest
                                            </button>
                                        </Link>
                                        <button className="w-full border border-white/20 text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                            <Download size={16} /> Download Brochure
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* Floating WhatsApp - Just like in the image */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
                    <MessageCircle size={32} />
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default CourseDetailPage;
