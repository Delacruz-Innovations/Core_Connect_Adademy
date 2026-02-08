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
                            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6 block">Our Philosphy</span>
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-black mb-10 leading-[0.9] italic uppercase tracking-tighter">We Care About <br />Your <span className="text-primary">Success.</span></h2>
                            <p className="text-gray-500 mb-12 text-[18px] leading-relaxed max-w-lg font-medium italic border-l-2 border-primary/20 pl-8">
                                "Our unique approach combines theory with intensive practical projects, ensuring you are job-ready from day one."
                            </p>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                                {features.map((f, i) => (
                                    <div key={i} className="flex flex-col gap-6 group">
                                        <div className="w-14 h-14 bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                            {React.cloneElement(f.icon, { className: "group-hover:text-white transition-colors" })}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-black text-lg mb-2 uppercase italic tracking-tighter">{f.title}</h4>
                                            <p className="text-sm text-gray-400 font-medium leading-tight">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="rounded-none overflow-hidden shadow-[40px_40px_0px_0px_rgba(0,102,204,0.05)] relative z-10 border-[20px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1522071823907-b93933cb6681?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students collaborating"
                                    className="w-full grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            {/* Abstract decorative elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 -z-10"></div>
                            <div className="absolute top-1/2 -left-10 w-20 h-20 bg-primary/10 translate-y-10 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Media Hash Section - News/Gallery */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">Academy Pulse</p>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-black italic uppercase tracking-tighter">Media <span className="text-primary">Hash</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Business Analysis Bootcamp" },
                            { img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Project Management Graduation" },
                            { img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Mentorship Circle" }
                        ].map((item, idx) => (
                            <div key={idx} className="group relative overflow-hidden aspect-[4/5] bg-gray-100 shadow-xl border border-white">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-12 text-center backdrop-blur-sm">
                                    <h4 className="text-white font-black text-3xl uppercase italic tracking-tighter translate-y-8 group-hover:translate-y-0 transition-transform duration-500 leading-none">{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <button className="bg-black text-white px-16 py-5 rounded-full font-black text-xs tracking-[0.2em] uppercase hover:bg-primary transition-all shadow-2xl shadow-black/20 hover:shadow-primary/40 active:translate-y-1">
                            Load More
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutFeatures;
