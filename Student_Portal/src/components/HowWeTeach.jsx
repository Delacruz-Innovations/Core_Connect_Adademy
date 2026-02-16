import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Laptop, Users, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const HowWeTeach = () => {
    const [activeIndex, setActiveIndex] = useState(2);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const methods = [
        {
            id: 1,
            title: "Live Sessions",
            description: "Direct interaction with experts who guide you through every concept in real-time.",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            icon: <Video />
        },
        {
            id: 2,
            title: "Practical Exercises",
            description: "We don't just watch videos. We build. Every concept is backed by code and real dashboards.",
            image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            icon: <Laptop />
        },
        {
            id: 3,
            title: "1-on-1 Mentorship",
            description: "You're never stuck. Schedule private time with mentors to debug or discuss career moves.",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            icon: <Calendar />
        },
        {
            id: 4,
            title: "Community & Peers",
            description: "You learn faster when you learn together. Our community is active, helpful, and hungry.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            icon: <Users />
        },
        {
            id: 5,
            title: "Real World Projects",
            description: "You won't just learn syntax. You'll build a production-ready portfolio that gets you hired.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Kanban/Dashboard
            icon: <Award />
        }
    ];

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % methods.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, methods.length]);

    const handlePrev = () => {
        setIsAutoPlaying(false);
        setActiveIndex((prev) => (prev - 1 + methods.length) % methods.length);
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setActiveIndex((prev) => (prev + 1) % methods.length);
    };

    // Calculate ordered items to always keep active in middle for the view logic
    // Actually, simpler is to just render them all absolutely positioned or using a track
    // Let's use a centered track approach

    return (
        <section className="py-4 bg-gray-50 border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="text-primary font-bold tracking-wider uppercase text-xs mb-3 block">Our Methodology</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">
                        How We <span className="text-primary">Teach</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We move at a serious pace, but we don't rush understanding.
                    </p>
                </div>

                <div className="relative h-[450px] md:h-[500px] flex items-center justify-center">

                    {/* Navigation Buttons - Visible on large screens */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-12 z-30 p-3 bg-white/80  shadow-lg backdrop-blur-sm text-gray-800 hover:bg-white hover:text-primary transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-12 z-30 p-3 bg-white/80  shadow-lg backdrop-blur-sm text-gray-800 hover:bg-white hover:text-primary transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Cards Container */}
                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center perspective-1000">
                        {methods.map((method, index) => {
                            // Calculate relative position based on active index for cyclic behavior
                            let position = (index - activeIndex);
                            // Normalize position to be within [-length/2, length/2] for shortest path
                            if (position > methods.length / 2) position -= methods.length;
                            if (position < -methods.length / 2) position += methods.length;

                            const isActive = index === activeIndex;
                            const isPrev = position === -1; // Immediately left
                            const isNext = position === 1;  // Immediately right

                            // Determine visibility and styles
                            let xPercent = position * 100; // Default spacing

                            // Fine tune spacing for "Stacking" effect
                            if (isActive) xPercent = 0;
                            else if (isPrev) xPercent = -60; // 60% to left
                            else if (isNext) xPercent = 60;  // 60% to right
                            else xPercent = position * 40; // Clustered for others

                            // Determine scale and z-index
                            let scale = isActive ? 1 : 0.85;
                            let zIndex = isActive ? 20 : 10;
                            let opacity = isActive ? 1 : 0.5;
                            let blur = isActive ? 0 : 2;

                            // Hide far away items visually to avoid clutter?
                            if (Math.abs(position) > 1) {
                                opacity = 0;
                                zIndex = 0;
                            }

                            return (
                                <motion.div
                                    key={method.id}
                                    initial={false}
                                    animate={{
                                        x: `${xPercent}%`,
                                        scale: scale,
                                        opacity: opacity,
                                        zIndex: zIndex,
                                        filter: `blur(${blur}px)`
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="absolute w-[85%] md:w-[60%] lg:w-[45%] h-[400px] md:h-[450px]  overflow-hidden shadow-2xl bg-gray-900 "
                                    onClick={() => {
                                        if (isActive) return;
                                        setIsAutoPlaying(false);
                                        setActiveIndex(index);
                                    }}
                                >
                                    {/* Background Image */}
                                    <img
                                        src={method.image}
                                        alt={method.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full">
                                        <div className="transform transition-transform duration-500">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-12 h-12  flex items-center justify-center backdrop-blur-md transition-colors duration-300 ${isActive ? 'bg-primary text-white' : 'bg-white/20 text-white'
                                                    }`}>
                                                    {React.cloneElement(method.icon, { size: 24 })}
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
                                                    {method.title}
                                                </h3>
                                            </div>

                                            <p className={`text-white/90 text-sm md:text-base leading-relaxed border-l-2 border-primary pl-4 transition-all duration-500 ${isActive ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 hidden'
                                                }`}>
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Dots Navigation */}
                    <div className="absolute -bottom-8 flex justify-center gap-3">
                        {methods.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setIsAutoPlaying(false);
                                    setActiveIndex(i);
                                }}
                                className={`h-1.5  transition-all duration-300 ${i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowWeTeach;
