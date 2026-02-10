import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
const Courses = () => {
    const categories = [
        { title: 'Project Management and Business Analysis', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { title: 'Data Analytics and Data Science', image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { title: 'Scrum Mastery and Agile Coaches', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { title: 'Cyber Security and Cloud Engineering', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ];

    return (
        <div className="flex flex-col">
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        {/* Grid */}
                        <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map((cat, index) => (
                                <div key={index} className="group relative overflow-hidden rounded-none h-64 shadow-sm hover:shadow-lg transition-all border border-gray-100 bg-white">
                                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent p-6 flex flex-col justify-end">
                                        <h3 className="text-white font-bold text-lg leading-tight transition-transform group-hover:-translate-y-1">{cat.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="lg:w-2/5">
                            <span className="text-primary font-bold uppercase tracking-widest text-[11px]">Training Programs</span>
                            <h2 className="text-4xl font-bold text-black mt-4 mb-8 leading-tight font-sans">
                                Explore a wide range of courses tailored to help you succeed in a growing industry.
                            </h2>
                            <p className="text-gray-500 mb-10 leading-relaxed text-[15px]">
                                We have a range of packages covering core aspects of project and product management, giving candidates hands-on experience and mentorships.
                            </p>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 mb-12">
                                {['Project Management', 'Data Analytics', 'Business Analysis', 'Scrum Coaching', 'Cyber Security', 'Cloud Eng'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-black text-sm font-semibold">
                                        <CheckCircle className="text-primary" size={16} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/courses" className="text-primary font-bold border-b-2 border-primary hover:text-secondary hover:border-secondary transition-all pb-1 text-sm uppercase tracking-wide">
                                View All Courses &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Career Path Survey Banner - Mid Section */}
            <section className="bg-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gray-50 border border-gray-100 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-center gap-8 z-10">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-md">
                                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-black italic">What is your Career Path? Take the survey below</h3>
                                <p className="text-gray-400 text-sm mt-1">Join 5000+ students who found their path</p>
                            </div>
                        </div>
                        <Link to="/show-interest">
                            <button className="bg-primary text-white px-8 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-black transition-all z-10 shrink-0">
                                Start Survey
                            </button>
                        </Link>
                        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover:translate-x-16 transition-transform duration-700"></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Courses;
