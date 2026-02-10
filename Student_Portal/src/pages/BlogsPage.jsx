import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';

const BlogsPage = () => {
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = [
        'All', 'Programme Updates', 'New Cohorts', 'Reflections', 'Announcements'
    ];

    const blogPosts = [
        { title: "New Cohort Starting: Business Analysis Sept 2026", cat: "New Cohorts", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Academy Reflection: The Power of Mentorship", cat: "Reflections", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Important Update: Curriculum Enhancements", cat: "Programme Updates", img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Graduation Ceremony 2025 Highlights", cat: "Announcements", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Why we teach structure over shortcuts", cat: "Reflections", img: "https://images.unsplash.com/photo-1552664688-cf412bb27db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Cybersecurity Programme: Now Open", cat: "New Cohorts", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
    ];

    const filteredPosts = activeCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.cat === activeCategory);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Academy Updates & News"
                description="Stay informed with the latest cohort announcements, curriculum updates, and reflections from the Core Connect Academy team."
                url="/news"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
                <div
                    className="absolute inset-0 z-0 opacity-40 bg-fixed bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")' }}
                ></div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-black mb-6 italic uppercase tracking-tighter leading-none"
                    >
                        Academy Updates
                    </motion.h1>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
            </section>

            {/* Intro Content */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold leading-tight">
                        Here we share <span className="text-primary italic">what matters</span>.
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        <span>Programme updates</span>
                        <span>New cohorts</span>
                        <span>Academy reflections</span>
                        <span>Important announcements</span>
                    </div>

                    <p className="text-2xl font-black italic text-gray-900 border-t border-b border-gray-100 py-8">
                        "No noise. Just what matters."
                    </p>

                    <button
                        onClick={() => document.getElementById('updates-grid').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-primary text-white px-10 py-5 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform inline-flex items-center gap-2"
                    >
                        Read Latest Updates <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            {/* Updates Grid */}
            <section id="updates-grid" className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border ${activeCategory === cat
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredPosts.map((post, i) => (
                        <motion.div
                            layout
                            key={i}
                            className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="aspect-video overflow-hidden relative">
                                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                    {post.cat}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold mb-6 text-gray-900 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Bell size={12} /> Update
                                    </span>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Read &rarr;</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BlogsPage;
