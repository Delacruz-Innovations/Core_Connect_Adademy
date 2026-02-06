import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Clock, BarChart, CheckCircle } from 'lucide-react';

const CoursesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const courseList = [
        { title: "Project Management & Business Analysis", desc: "Master the essential skills to effectively manage projects from initiation to completion.", duration: "12 weeks", level: "Beginner to Intermediate", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "AI for Professionals", desc: "Gain a solid grasp of the fundamentals of Artificial Intelligence and its practical applications.", duration: "4 days", level: "Beginner", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Cybersecurity", desc: "Develop critical knowledge in cybersecurity principles, learning to identify threats and implement measures.", duration: "8 weeks", level: "Beginner to Intermediate", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Digital Marketing", desc: "Explore the dynamic world of digital marketing, covering strategies for SEO, social media, and more.", duration: "6 weeks", level: "Beginner", img: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Scrum Mastery", desc: "Focus on the principles of Scrum, facilitate sprints and ceremonies, and drive continuous improvement.", duration: "4 weeks", level: "Beginner", img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Data Analysis", desc: "Learn to collect, process, and analyze data to uncover insights, inform decisions and tell stories.", duration: "10 weeks", level: "Beginner to Advanced", img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Virtual Assistant Programme", desc: "Acquire the diverse skills needed to excel as a Virtual Assistant, offering professional admin support.", duration: "6 weeks", level: "Beginner", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Product Management", desc: "Gain the expertise to guide a product's journey from concept to launch and beyond.", duration: "12 weeks", level: "Beginner", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url("/tablet-hero.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black mb-6 italic tracking-tighter"
                    >
                        Courses
                    </motion.h1>
                    <p className="max-w-xl mx-auto text-xl text-white/90 font-medium italic">
                        Transform Your Career in Project Management and Business Analysis
                    </p>
                </div>
            </section>

            {/* Course Grid */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-16 font-sans">Our Courses</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courseList.map((course, i) => (
                        <Link to={`/courses/${i}`} key={i} className="group flex flex-col h-full bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden rounded-none">
                            <div className="aspect-video overflow-hidden">
                                <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold mb-4 text-primary leading-tight">{course.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{course.desc}</p>

                                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <Clock size={14} className="text-primary" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <BarChart size={14} className="text-primary" />
                                        <span>{course.level}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Feature Focus Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 relative">
                            <div className="aspect-square overflow-hidden rounded-none shadow-2xl relative z-10 border-[12px] border-white">
                                <img src="https://images.unsplash.com/photo-1522071823907-b93933cb6681?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Student learning" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 -z-10 blur-3xl"></div>
                        </div>

                        <div className="lg:w-1/2 space-y-8">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Elite Tech Training Programme</span>
                            <h2 className="text-4xl font-bold leading-tight italic">Transform Your Career in Project Management and Business Analysis</h2>
                            <p className="text-gray-800 font-bold italic text-lg leading-snug">
                                Step into the future of work with the Elite Tech Training Programme, the ultimate gateway to high-paying, impactful roles in Project Management and Business Analysis. In just 12 weeks, you'll master the skills that top employers demand, gaining the confidence to lead projects and drive business success.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-4">What You'll Achieve:</h4>
                                    <ul className="space-y-3">
                                        {["Master Agile, Scrum, and Waterfall methodologies to deliver projects seamlessly.", "Bridge the gap between business needs and technical solutions with precision.", "Build a portfolio showcasing real-world project deliverables and analysis documents."].map((text, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-gray-600 font-medium">
                                                <CheckCircle size={16} className="text-primary shrink-0 mt-1" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-4">What You'll Learn:</h4>
                                    <ul className="space-y-3">
                                        {["Project Management: Plan, execute, and lead projects using tools like Jira, MS Project, and Trello.", "Business Analysis: Create process maps, elicit requirements, and develop impactful business cases.", "Soft Skills: Elevate your stakeholder management, communication, and leadership abilities."].map((text, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-gray-600 font-medium">
                                                <CheckCircle size={16} className="text-primary shrink-0 mt-1" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button className="bg-primary text-white px-12 py-5 rounded-md font-bold text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-black transition-all">
                                    Begin Your Elite Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CoursesPage;
