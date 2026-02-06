import React from 'react';
import { Target, Users, BookOpen, Star } from 'lucide-react';

const AboutFeatures = () => {
    const features = [
        { title: 'Goal Driven', icon: <Target className="text-secondary" />, desc: 'We focus on your career goals.' },
        { title: 'Community', icon: <Users className="text-secondary" />, desc: 'Join a network of professionals.' },
        { title: 'Training', icon: <BookOpen className="text-secondary" />, desc: 'Hands-on practical training.' },
        { title: 'Mentorship', icon: <Star className="text-secondary" />, desc: 'Guaranteed support from experts.' }
    ];

    return (
        <div className="flex flex-col">
            {/* Feature Split section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2">
                            <span className="text-primary font-bold uppercase tracking-widest text-[11px] mb-4 block">Our Philosphy</span>
                            <h2 className="text-5xl font-bold text-black mb-8 leading-tight italic font-sans first-letter:uppercase">We Care About Your Success.</h2>
                            <p className="text-gray-500 mb-12 text-[17px] leading-relaxed max-w-lg font-medium">
                                Our unique approach combines theory with intensive practical projects at CORE CONNECT ACADEMY, ensuring you are job-ready from day one.
                            </p>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                {features.map((f, i) => (
                                    <div key={i} className="flex flex-col gap-4 group">
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-black text-lg mb-1">{f.title}</h4>
                                            <p className="text-sm text-gray-400 font-medium leading-tight">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="rounded-none overflow-hidden shadow-2xl relative z-10 border-[16px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1522071823907-b93933cb6681?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students collaborating"
                                    className="w-full grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            {/* Abstract decorative elements common in such designs */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 -z-10"></div>
                            <div className="absolute top-1/2 -left-10 w-20 h-20 bg-secondary/20 translate-y-10 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Media Hash Section - News/Gallery */}
            <section className="py-24 bg-white border-t border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-primary font-bold uppercase tracking-widest text-[11px] mb-2">Social Feed</p>
                        <h2 className="text-4xl font-bold text-black italic font-sans">Media Hash</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Business Analysis Bootcamp" },
                            { img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Project Management Graduation" },
                            { img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Mentorship Circle" }
                        ].map((item, idx) => (
                            <div key={idx} className="group relative overflow-hidden aspect-[4/5] bg-gray-100">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8 text-center">
                                    <h4 className="text-white font-bold text-xl uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-primary text-white px-10 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-black transition-all">
                            Load More
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutFeatures;
