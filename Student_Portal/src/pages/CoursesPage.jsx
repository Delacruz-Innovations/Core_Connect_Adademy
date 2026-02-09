import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Clock, BarChart, ArrowRight, MonitorPlay } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('courses')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setCourses(data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />

            {/* Hero Section - Full Screen & Fixed BG */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-secondary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Master Practical Skills</span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 italic uppercase tracking-tighter leading-[0.8]">
                            Our <br /><span className="text-primary italic">Tracks</span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-3xl font-medium leading-relaxed max-w-3xl mx-auto text-white/70">
                            Beginner-friendly. Mentor-led. <span className="text-white">Built for careers.</span>
                        </p>
                    </motion.div>
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
            <section id="tracks-grid" className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[400px]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[450px] bg-gray-50 border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-gray-50 p-10">
                        <p className="text-red-500 font-bold mb-4">{error}</p>
                        <button
                            onClick={fetchCourses}
                            className="text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary"
                        >
                            Try Again
                        </button>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 italic text-gray-400">
                        No courses available at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                to={`/courses/${course.slug || course.id}`}
                                className="group flex flex-col h-full bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                            >
                                <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500"></div>
                                </div>
                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-px w-8 bg-secondary"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{course.level || 'Beginner'}</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-gray-900 leading-tight uppercase italic tracking-tighter">{course.title}</h3>
                                    <p className="text-gray-500 text-[15px] leading-relaxed mb-8 flex-1 font-medium italic line-clamp-3">"{course.short_description || (course.description && course.description.substring(0, 100) + '...')}"</p>

                                    <div className="flex justify-between items-center pt-8 border-t border-gray-50 mt-auto">
                                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3 group-hover:text-primary transition-all group-hover:translate-x-2">
                                            Explore Track <ArrowRight size={16} className="text-primary" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
                        {courses.length > 0 ? (
                            <Link to={`/courses/${courses[0].slug || courses[0].id}`}>
                                <button className="bg-primary text-white px-10 py-5 font-bold text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                                    Explore Most Popular Track
                                </button>
                            </Link>
                        ) : (
                            <Link to="/contact">
                                <button className="bg-primary text-white px-10 py-5 font-bold text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                                    Contact for Details
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CoursesPage;
