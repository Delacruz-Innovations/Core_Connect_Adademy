import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#0c0c0c] rounded-none p-12 lg:p-24 text-center text-white relative overflow-hidden group">
                    {/* Abstract geometric shapes typical of the style */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-48 -mt-48 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary opacity-10 -ml-40 -mb-40 blur-3xl transition-transform duration-1000 group-hover:scale-125"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-5xl lg:text-7xl font-bold mb-8 italic tracking-tighter uppercase leading-none">
                            Discover Your <br />
                            Perfect Tech Career
                        </h2>
                        <p className="not-italic text-lg lg:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                            Unlock your potential with our expert-led training at <span className="text-white">CORE CONNECT ACADEMY</span> and join thousands of successful graduates worldwide.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="bg-primary text-white px-12 py-5 rounded-md font-bold text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all flex items-center gap-3">
                                Apply Now <ArrowRight size={18} />
                            </button>
                            <button className="border border-white/20 text-white px-12 py-5 rounded-md font-bold text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-all">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
