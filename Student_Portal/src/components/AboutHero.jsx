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
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-secondary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Est. CoreConnect</span>
                    <h1 className="text-4xl md:text-6xl lg:text-9xl font-black text-white mb-8 italic tracking-tighter uppercase leading-[0.85]">
                        The <span className="text-primary italic">Academy</span> Story
                    </h1>
                    <p className="text-lg md:text-xl lg:text-3xl text-white/80 max-w-4xl mx-auto font-medium leading-relaxed tracking-tight">
                        A Multi-Award winning tech training company providing <span className="text-white">practical work experience</span> and lifelong mentorship.
                    </p>
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <div className="w-20 h-px bg-white/20"></div>
                        <div className="w-3 h-3 rounded-full border border-secondary"></div>
                        <div className="w-20 h-px bg-white/20"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutHero;
