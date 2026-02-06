import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        { q: "Is previous tech experience required?", a: "No, our courses are designed to take you from beginner to professional level with intensive hands-on project experience." },
        { q: "How long are the training programs?", a: "Most programs range from 3 to 6 months including practical projects and career placement support." },
        { q: "Do you offer job placement assistance?", a: "Yes, we provide intensive CV workshops, interview prep, and personalized mentorship from industry experts." },
        { q: "Can I pay in installments?", a: "Yes, we offer flexible payment plans to suit your financial situation. Contact our support team for details." },
        { q: "Are the certificates accredited?", a: "Yes, our certifications are widely recognized in the industry and reflect real-world competence." }
    ];

    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-20">

                    <div className="lg:w-1/3">
                        <span className="text-primary font-bold uppercase tracking-widest text-[11px] mb-4 block">Help Center</span>
                        <h2 className="text-4xl font-bold text-black italic font-sans leading-tight">Got Questions? Uncover Answers Here</h2>
                        <div className="w-20 h-1 bg-primary mt-8"></div>
                    </div>

                    <div className="lg:w-2/3 space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`border-b border-gray-100 transition-all duration-300 ${openIndex === i ? 'bg-gray-50/50' : 'bg-transparent'}`}>
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                                    className="w-full py-8 flex justify-between items-center text-left group"
                                >
                                    <span className={`font-bold text-lg transition-colors ${openIndex === i ? 'text-primary' : 'text-black group-hover:text-primary'}`}>
                                        {faq.q}
                                    </span>
                                    <div className={`w-10 h-10 flex items-center justify-center transition-all ${openIndex === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-white'}`}>
                                        {openIndex === i ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-gray-500 text-[16px] leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FAQ;
