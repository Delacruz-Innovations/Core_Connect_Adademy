import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SuccessStories = () => {
    const stories = [
        {
            name: 'Abdulsalam',
            role: 'Junior Business Analyst, NHS (UK)',
            stars: 4,
            text: "Before CoreConnectAcademy, I honestly didn’t think breaking into tech was possible for me. I had no technical background, just determination and my dedication. The way the program simplified everything from understanding business analysis fundamentals to real-life case scenarios — gave me clarity. The mock interviews were intense but necessary. A few months later, I landed my dream role as a Junior Business Analyst at the NHS in the UK.",
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Mofe',
            role: 'Business Analyst, DWP (UK)',
            stars: 4,
            text: "I was stuck in a role that paid the bills but didn’t excite me. I wanted growth. I wanted challenge. I wanted impact. CoreConnectAcademy made the transition realistic. They didn’t just throw theory at us — they showed us how to think like Business Analysts. The real-world project simulations changed everything for me. After consistent effort, I secured a Business Analyst role with DWP in the UK. That was my dream — stability, progression, and purpose.",
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Kazeem',
            role: 'Business Analyst, easyJet (Belgium)',
            stars: 5,
            text: "Switching careers in Europe without a tech degree felt intimidating. I kept doubting if companies would even take me seriously. But the structured training, portfolio support, and CV positioning sessions at CoreConnectAcademy made me confident. I learned how to articulate my value, not just my experience. I’m now working as a Business Analyst at easyJet in Belgium, and this is genuinely the opportunity I had been praying for.",
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Babajide',
            role: 'Business Analyst, KPMG (UK)',
            stars: 5,
            text: "I always wanted to work in consulting. Big firms. Big rooms. Big impact. But I didn’t know how to position myself. CoreConnectAcademy didn’t just teach business analysis — they taught strategy, stakeholder communication, and professional confidence. Landing my role as a Business Analyst at KPMG in the UK felt like stepping into the version of myself I always saw in my head. This wasn’t luck. It was preparation meeting opportunity.",
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Samson',
            role: 'Business Analyst, MTN Nigeria (Nigeria)',
            stars: 4,
            text: "I had experience but lacked structure. I knew I could do more, but I didn’t know how to level up. CoreConnectAcademy sharpened my thinking. The frameworks, the AI integration sessions, the stakeholder case studies, everything was practical. Shortly after completing the program, I secured a role as a Business Analyst at MTN Nigeria. It wasn’t just a job change. It was a career elevation.",
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        let timer;
        if (isAutoPlaying) {
            timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % stories.length);
            }, 6000);
        }
        return () => clearInterval(timer);
    }, [isAutoPlaying, stories.length]);

    const handlePrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    };

    return (
        <section id="success-stories" className="py-20 bg-white overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-2 block underline decoration-primary decoration-2 underline-offset-4">Success Stories</span>
                        <h2 className="text-3xl md:text-5xl font-black text-black italic uppercase tracking-tighter leading-[0.9]">
                            Real People, <span className="text-primary text-4xl md:text-6xl">Real Results</span>
                        </h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrevious}
                            className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="relative h-[550px] md:h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
                                {/* Image Col */}
                                <div className="md:col-span-4 h-full">
                                    <div className="relative h-full w-full rounded-sm overflow-hidden shadow-2xl group">
                                        <img
                                            src={stories[currentIndex].image}
                                            alt={stories[currentIndex].name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply transition-opacity group-hover:opacity-0"></div>
                                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                                    </div>
                                </div>

                                {/* Content Col */}
                                <div className="md:col-span-8 flex flex-col justify-center h-full py-6 md:px-8">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < stories[currentIndex].stars ? "currentColor" : "none"}
                                                className={i < stories[currentIndex].stars ? 'text-secondary' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <Quote size={60} className="absolute -top-10 -left-6 text-primary/5 italic" fill="currentColor" />
                                        <blockquote className="relative z-10">
                                            <p className="text-xl md:text-2xl font-bold leading-relaxed italic text-gray-800 tracking-tight">
                                                "{stories[currentIndex].text}"
                                            </p>
                                        </blockquote>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h4 className="text-2xl font-black uppercase tracking-tighter italic text-black">
                                            {stories[currentIndex].name}
                                        </h4>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                            {stories[currentIndex].role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dots / Indicators */}
                <div className="mt-12 flex justify-center gap-3">
                    {stories.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setCurrentIndex(i);
                            }}
                            className={`transition-all duration-300 rounded-full ${i === currentIndex ? 'w-12 h-1.5 bg-primary' : 'w-2 h-1.5 bg-gray-200 hover:bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link to="/about">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2">
                            Learn more about our impact
                            <span className="w-4 h-[1px] bg-current"></span>
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
