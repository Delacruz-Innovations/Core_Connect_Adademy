import React from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Partners from '../components/Partners';
import Courses from '../components/Courses';
import SuccessStories from '../components/SuccessStories';
import AboutFeatures from '../components/AboutFeatures';
import Podcast from '../components/Podcast';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

import WhyCoreConnect from '../components/WhyCoreConnect';
import HowWeTeach from '../components/HowWeTeach';
import AudienceFit from '../components/AudienceFit';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <SEO
                title="Hybrid Mentorship & Apprenticeship"
                description="Core Connect Academy bridges the gap between traditional education and industry requirements through high-impact mentorship and apprenticeship programs."
                url="/"
            />
            <Navbar />
            <Hero />
            <AudienceFit />
            <WhyCoreConnect />
            <HowWeTeach />
            {/* <Partners /> */}

            <SuccessStories />
            {/* <AboutFeatures /> */}
            {/* <Podcast /> */}
            {/* <FAQ /> */}
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
