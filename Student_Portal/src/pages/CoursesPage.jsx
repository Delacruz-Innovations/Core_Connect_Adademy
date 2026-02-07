import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Clock, BarChart, ArrowRight, MonitorPlay } from 'lucide-react';

const CoursesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const courseList = [
        {
            title: "Business Analysis",
            desc: "Learn how to understand problems, work with stakeholders, and support decision-making in organisations.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Product Owner / Product Fundamentals",
            desc: "Learn how products are planned, prioritised, and delivered in real teams.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Product Analyst",
            desc: "Learn how to analyse product performance, understand user behaviour, and support product decisions.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Digital Operations Analyst",
            desc: "Learn how businesses run digitally — processes, systems, and improvements.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "Cybersecurity (Foundations)",
            desc: "Learn how organisations protect systems, data, and users — without needing heavy coding skills.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        },
        {
            title: "AI Vibe Coding",
            desc: "Learn how to build websites and apps using AI tools — even if you’ve never written code before.",
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section - Full Screen & Fixed BG */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter"
                    >
                        Our Programmes
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>

                    <p className="text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                        All our programmes are beginner-friendly and commitment-driven.
                    </p>
                </div>
            </section>

            {/* Intro Content */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                        You don’t need experience to start.<br />
                        <span className="text-primary">You need willingness to learn properly.</span>
                    </p>
                </div>
            </section>

            {/* Course Grid */}
            <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courseList.map((course, i) => (
                        <div key={i} className="group flex flex-col h-full bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-video overflow-hidden bg-gray-100 relative">
                                <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300"></div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">{course.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1 font-medium">{course.desc}</p>

                                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1">
                                        {course.level}
                                    </span>
                                    <button className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                                        View Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Statement */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-32"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 backdrop-blur-md mb-8">
                        <MonitorPlay size={16} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Practical Application</span>
                    </div>

                    <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tight mb-8">
                        You’ll learn how to <span className="text-primary">build</span>,<br />
                        not just watch.
                    </h2>

                    <div>
                        <button className="bg-primary text-white px-10 py-5 font-bold text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                            View Course Details
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CoursesPage;
