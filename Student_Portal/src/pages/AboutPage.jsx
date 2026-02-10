import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import AboutHero from '../components/AboutHero';
import AboutContent from '../components/AboutContent';
import Footer from '../components/Footer';

const AboutPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Our Mission & Industry Impact"
                description="Learn about the philosophy and hybrid mentorship model behind Core Connect Academy, designed to prepare the next generation for high-impact tech careers."
                url="/about"
            />
            <Navbar />
            <main>
                <AboutHero />
                <AboutContent />
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;
