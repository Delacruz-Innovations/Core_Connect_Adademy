import React from 'react';
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

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-black">
            <Navbar />
            <Hero />
            <Partners />
            <Courses />
            <SuccessStories />
            <AboutFeatures />
            <Podcast />
            <FAQ />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
