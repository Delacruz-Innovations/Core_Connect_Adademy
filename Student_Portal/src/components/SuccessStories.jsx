import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SuccessStories = () => {
    const stories = [
        {
            name: 'Abdulsalam',
            role: 'Junior Business Analyst, NHS (UK)',
            stars: 5,
            text: "Before CoreConnect, I honestly didn’t think breaking into tech was possible for me. The way the program simplified everything from understanding business analysis fundamentals to real-life case scenarios gave me clarity.",
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Mofe',
            role: 'Business Analyst, DWP (UK)',
            stars: 5,
            text: "I was stuck in a role that paid the bills but didn’t excite me. CoreConnect made the transition realistic. They showed us how to think like Business Analysts. The real-world simulations changed everything.",
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Kazeem',
            role: 'Business Analyst, easyJet (Belgium)',
            stars: 5,
            text: "Switching careers in Europe without a tech degree felt intimidating. The structured training and portfolio support at CoreConnect made me confident. I learned how to articulate my value.",
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Babajide',
            role: 'Business Analyst, KPMG (UK)',
            stars: 5,
            text: "I always wanted to work in consulting. CoreConnect didn’t just teach business analysis — they taught strategy and confidence. Landing my role at KPMG felt like stepping into the version of myself I always saw.",
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        },
        {
            name: 'Samson',
            role: 'Business Analyst, MTN Nigeria',
            stars: 4,
            text: "I had experience but lacked structure. CoreConnect sharpened my thinking. The frameworks and stakeholder case studies were practical. It wasn’t just a job change. It was a career elevation.",
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    };

    return (
        <section className="py-4 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
                    <p className="text-gray-600 mt-2">Real people, real results.</p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-primary hover:border-primary transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-primary hover:border-primary transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="bg-white rounded-lg p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col md:flex-row gap-8 items-center md:items-start"
                            >
                                <div className="shrink-0">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
                                        <img
                                            src={stories[currentIndex].image}
                                            alt={stories[currentIndex].name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < stories[currentIndex].stars ? "currentColor" : "none"}
                                                className={i < stories[currentIndex].stars ? "text-yellow-400" : "text-gray-200"}
                                            />
                                        ))}
                                    </div>

                                    <Quote size={32} className="text-blue-100 mb-4 mx-auto md:mx-0" fill="currentColor" />

                                    <p className="text-lg text-gray-700 italic leading-relaxed mb-6">
                                        "{stories[currentIndex].text}"
                                    </p>

                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{stories[currentIndex].name}</h4>
                                        <p className="text-primary text-sm font-medium">{stories[currentIndex].role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-center gap-2 mt-6">
                        {stories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
