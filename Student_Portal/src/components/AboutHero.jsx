import React from 'react';
import { motion } from 'framer-motion';

const AboutHero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Dark Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/tshirt-hero.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl lg:text-8xl font-black text-white mb-6 italic tracking-tighter uppercase leading-none">
                        About Us
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed font-sans">
                        We are a Multi-Award winning tech training company that provides both training and practical work experience with mentorship support.
                    </p>
                    <div className="mt-8 flex justify-center gap-2">
                        <div className="w-12 h-1 bg-primary"></div>
                        <div className="w-4 h-1 bg-primary/40"></div>
                        <div className="w-2 h-1 bg-primary/20"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutHero;
