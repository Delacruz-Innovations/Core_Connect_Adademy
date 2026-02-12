import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
const SuccessStories = () => {
    const stories = [
        {
            name: 'Kazman HKerem',
            role: 'Project Manager at TechCo',
            text: 'Core Connet Academy changed my life. Within 6 months, I went from a retail job to a £55k salary as a Junior PM.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Omobola ',
            role: 'Senior Data Analyst',
            text: 'The mentorship program is unparalleled. Having real-world projects to work on made all the difference in interviews.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Samson Olmilaken',
            role: 'UX Designer at CreativeMinds',
            text: 'I learned more in 3 months here than I did in 4 years of university. The hands-on approach is exactly what the industry needs.',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Tosin Ojo',
            role: 'Cloud Engineer at SkyHigh',
            text: 'The career support was fantastic. They helped me polish my CV and prep for interviews until I landed my dream job.',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        }
    ];

    return (
        <section className="py-5 bg-white overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 font-sans italic lowercase first-letter:uppercase">Success Stories: Real People, Real Results</h2>
                    <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-primary w-4' : 'bg-gray-200'}`}></div>)}
                    </div>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 md:gap-8 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {stories.map((story, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="min-w-[85vw] snap-center md:min-w-0 flex flex-col md:flex-row items-center gap-4 group p-4 border border-gray-100 rounded-xl bg-gray-50/50 md:border-none md:bg-transparent md:p-0"
                        >
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:border-primary/20 transition-colors duration-500">
                                    <img src={story.image} alt={story.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Quote size={14} fill="white" className="md:w-4 md:h-4" />
                                </div>
                            </div>
                            <div className="text-center md:text-left flex flex-col justify-center">
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 italic font-sans font-medium">"{story.text}"</p>
                                <div>
                                    <h4 className="text-lg font-bold text-black">{story.name}</h4>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest">{story.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center hidden md:block">
                    <Link to="/about">
                        <button className="bg-primary text-white px-8 py-3 rounded-md font-bold text-xs tracking-widest uppercase hover:bg-black transition-all shadow-lg shadow-primary/10">
                            View All Testimonials
                        </button>
                    </Link>
                </div>


            </div>
        </section>
    );
};

export default SuccessStories;
