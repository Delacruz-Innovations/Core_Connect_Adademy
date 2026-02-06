import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessStories = () => {
    const stories = [
        {
            name: 'Sarah Jenkins',
            role: 'Project Manager at TechCo',
            text: 'Tritek Academy changed my life. Within 6 months, I went from a retail job to a £55k salary as a Junior PM.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        },
        {
            name: 'Michael Chen',
            role: 'Senior Data Analyst',
            text: 'The mentorship program is unparalleled. Having real-world projects to work on made all the difference in interviews.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        }
    ];

    return (
        <section className="py-24 bg-white overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-black mb-4 font-sans italic lowercase first-letter:uppercase">Success Stories: Real People, Real Results</h2>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i === 3 ? 'bg-primary w-6' : 'bg-gray-200'}`}></div>)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {stories.map((story, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row items-center gap-8 group"
                        >
                            <div className="relative shrink-0">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-gray-50 shadow-inner group-hover:border-primary/10 transition-colors duration-500">
                                    <img src={story.image} alt={story.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Quote size={20} fill="white" />
                                </div>
                            </div>
                            <div className="text-center md:text-left flex flex-col justify-center">
                                <p className="text-gray-600 text-[17px] leading-relaxed mb-6 italic font-sans font-medium">"{story.text}"</p>
                                <div>
                                    <h4 className="text-xl font-bold text-black mb-1">{story.name}</h4>
                                    <p className="text-primary font-bold text-sm uppercase tracking-widest">{story.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <button className="bg-primary text-white px-12 py-5 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-primary/10">
                        View All Testimonials
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
