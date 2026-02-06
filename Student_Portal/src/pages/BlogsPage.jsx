import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Clock } from 'lucide-react';

const BlogsPage = () => {
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = [
        'All', 'Blog', 'Tech', 'Tips', 'Training', 'General', 'Development', 'Latest News'
    ];

    const blogPosts = [
        { title: "The Future of Project Management in a Digital...", cat: "Latest News", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Which role is better, BA or PM?", cat: "Tech", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Can a Business Analyst do Project Management?", cat: "Tips", img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "What is the salary of a BA vs PM?", cat: "General", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "PRINCE2 or PRINCE2 Agile: Which One is for me...", cat: "Training", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "CORE CONNECT ACADEMY Becomes a PeopleCert Accredite...", cat: "Latest News", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "From Novice to Expert: How to Launch a Cybers...", cat: "Development", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "AI for Non-Tech Professionals: 5 Essential Sk...", cat: "Tech", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "Project Management vs. Business Analysis: Whi...", cat: "Tips", img: "https://images.unsplash.com/photo-1552664688-cf412bb27db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { title: "What are the most popular business analysis c...", cat: "Training", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
    ];

    const filteredPosts = activeCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.cat === activeCategory || (activeCategory === 'Blog' && post.cat !== 'Latest News'));

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url("/mug-hero.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/70"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-7xl font-black mb-6 italic tracking-tight uppercase"
                    >
                        Blog
                    </motion.h1>
                    <p className="max-w-3xl mx-auto text-lg text-white/90 font-medium leading-relaxed italic">
                        Discover the latest tech trends, expert advice, and practical guides from our instructors and industry specialists. Empower your tech journey with our in-depth articles and thought leadership.
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap justify-center gap-4 border-b border-gray-100 pb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeCategory === cat ? 'text-primary' : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            {cat}
                            {activeCategory === cat && (
                                <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Blog Grid */}
            <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, i) => (
                        <motion.div
                            layout
                            key={i}
                            className="group relative h-[400px] overflow-hidden bg-gray-200"
                        >
                            <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-10 flex flex-col justify-end transition-colors group-hover:from-primary/90">
                                <div className="flex gap-4 items-center mb-4">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Blog</span>
                                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">{post.cat}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-6 leading-tight transition-transform group-hover:-translate-y-2">{post.title}</h3>
                                <button className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] flex items-center gap-2 group-hover:text-white transition-colors">
                                    Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Dummy */}
                <div className="mt-20 flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <button key={i} className={`w-10 h-10 font-bold text-xs ${i === 1 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'} transition-all`}>
                            0{i}
                        </button>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BlogsPage;
