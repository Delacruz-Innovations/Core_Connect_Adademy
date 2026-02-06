import React from 'react';
import { PlayCircle, Mic2, ArrowRight } from 'lucide-react';

const Podcast = () => {
    const episodes = [
        { title: 'Breaking into Tech as a Non-Techie', date: 'Feb 2024', duration: '45 mins', ep: 1 },
        { title: 'The Future of Business Analysis in AI Era', date: 'Jan 2024', duration: '38 mins', ep: 2 },
        { title: 'Winning in the UK Job Market', date: 'Dec 2023', duration: '52 mins', ep: 3 }
    ];

    return (
        <section className="py-24 bg-[#111] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    <div className="lg:w-2/5">
                        <div className="flex items-center gap-3 text-primary mb-6">
                            <Mic2 size={24} />
                            <span className="font-bold uppercase tracking-[0.3em] text-[11px]">Online Presence</span>
                        </div>
                        <h2 className="text-6xl font-black mb-8 italic tracking-tight uppercase leading-none">Stay <br />With Tech</h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                            Listen to industry experts and successful graduates share their professional journeys at CORE CONNECT ACADEMY.
                        </p>
                        <button className="bg-primary text-white px-8 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center gap-3">
                            Explore Channel <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="lg:w-3/5 w-full space-y-4">
                        <div className="bg-white rounded-none p-1 flex justify-between items-center mb-8">
                            <span className="px-6 py-2 text-black font-bold uppercase tracking-widest text-xs">Podcast Episodes</span>
                            <div className="flex gap-1 pr-2">
                                <div className="w-1 h-6 bg-primary"></div>
                                <div className="w-1 h-6 bg-primary opacity-50"></div>
                                <div className="w-1 h-6 bg-primary opacity-20"></div>
                            </div>
                        </div>

                        {episodes.map((ep, i) => (
                            <div key={i} className="group p-8 bg-white/5 border-b border-white/10 hover:bg-white/10 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-8 w-full">
                                    <span className="text-5xl font-black text-white/10 group-hover:text-primary/40 transition-colors">0{ep.ep}</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors italic leading-tight">{ep.title}</h4>
                                        <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                                            <span>{ep.date}</span>
                                            <span className="w-1 h-1 bg-primary rounded-full my-auto"></span>
                                            <span>{ep.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transition-transform hover:scale-110">
                                    <PlayCircle size={32} />
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Podcast;
