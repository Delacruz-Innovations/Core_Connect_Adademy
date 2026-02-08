import React from 'react';
import { motion } from 'framer-motion';

const AboutContent = () => {
    return (
        <div className="flex flex-col">
            {/* OUR STORY Section (Replaces Welcome) */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div>
                                <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-6 block">Our Story</span>
                                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-black mb-10 leading-[0.9] italic uppercase tracking-tighter">Why this <br /><span className="text-primary italic">Academy</span> exists</h2>

                                <div className="text-gray-600 text-[18px] leading-relaxed font-medium space-y-8 italic">
                                    <p>
                                        CoreConnectAcademy was created because too many capable people were locked out of opportunity simply because no one explained things properly.
                                    </p>
                                    <ul className="space-y-3 border-l-4 border-primary/20 pl-6 my-6 text-gray-900 font-bold">
                                        <li>Not everyone grew up around tech.</li>
                                        <li>Not everyone had mentors.</li>
                                        <li>Not everyone knew where to start.</li>
                                    </ul>
                                    <p>
                                        We exist to make learning clear, structured, and human. We are African-led, supported by industry experts across the world, and open to anyone willing to learn properly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Side - Squared Off */}
                        <div className="relative">
                            <div className="aspect-[4/5] overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students learning"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT WE BELIEVE Section (Replaces 'Sets Us Apart') */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Image Side - Squared Off */}
                        <div className="order-2 lg:order-1">
                            <div className="aspect-square overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover grayscale contrast-125"
                                />
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-10">
                            <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-6 block">What We Believe</span>
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-black leading-[0.9] italic uppercase tracking-tighter">Our Core <br /><span className="text-primary italic">Belief</span></h2>

                            <div className="space-y-8 text-2xl text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-8">
                                <p>
                                    You are not incapable.<br />
                                    <span className="text-gray-900 font-bold bg-white/50 px-2">You are unstructured.</span>
                                </p>
                                <p className="text-3xl text-primary font-bold">
                                    And structure can be taught.
                                </p>

                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <p className="text-base text-gray-500">
                                        We don’t sell shortcuts.<br />
                                        We don’t promise outcomes we can’t control.<br />
                                        We focus on preparation, clarity, and growth.
                                    </p>
                                </div>

                                <div className="pt-6">
                                    <button className="bg-primary text-white px-10 py-4 rounded-md font-bold text-sm tracking-wide uppercase shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                                        Show Interest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Trainer Section - Preserved but Upgraded */}
            <section className="py-24 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-4xl font-bold text-primary mb-8 font-sans leading-tight">Lead Trainer & <br />Curriculum Architect</h2>
                            <div className="space-y-6 text-gray-700">
                                <p className="text-[17px] leading-relaxed font-medium">
                                    <span className="text-primary font-bold border-b-2 border-primary/20 pb-0.5">Tosin Samuel Ojo</span> is the Lead Trainer and Curriculum Architect at <span className="text-primary font-bold">CoreConnectAcademy</span>.
                                </p>
                                <p className="text-[15px] leading-relaxed font-medium text-gray-500">
                                    With over 15 years of experience in the IT industry, <span className="border-b-2 border-primary/10">Tosin</span> has worked as an IT Programme Lead across both government and private sectors. He has successfully delivered training, mentoring, and curriculum design across the UK and Europe, specializing in helping non-technical learners transition into tech careers.
                                </p>
                                <p className="text-[15px] leading-relaxed font-medium text-gray-500">
                                    Through previous training initiatives, <span className="border-b-2 border-primary/10">Tosin</span> has contributed to over 2,021 success stories, helping individuals secure roles, grow confidence, and navigate real-world tech environments.
                                </p>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative group">
                            <div className="bg-gray-100 p-8 transition-all group-hover:bg-primary/5">
                                <img src="/tosin-ui.png" alt="Tosin Samuel Ojo" className="w-full shadow-2xl transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Achievement Section - Preserved but Upgraded */}
            <section className="py-24 bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-12 font-sans">Company Achievement</h2>
                            <ul className="space-y-6">
                                {[
                                    "Trained and mentored 2,000+ learners across Africa, the UK, and Europe",
                                    "Designed career-transition curricula tailored for non-technical professionals",
                                    "Supported learners into global tech roles and remote positions",
                                    "Built strong learning frameworks focused on confidence, delivery, and employability"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 group">
                                        <div className="w-2 h-2 bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                                        <span className="text-lg leading-relaxed font-bold text-white/80 group-hover:text-white transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center relative">
                            <div className="relative z-10 p-4 border border-white/10 bg-white/5 backdrop-blur-sm">
                                <img src="/achievement-ui.png" alt="Company Achievement" className="w-full max-w-md grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 h-3/4 my-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutContent;
