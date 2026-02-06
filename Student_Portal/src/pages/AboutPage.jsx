import React, { useEffect } from 'react';
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
