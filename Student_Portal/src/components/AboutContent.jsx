import React from 'react';

const AboutContent = () => {
    return (
        <div className="flex flex-col">
            {/* Welcome / Mission / Vision Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-4xl font-bold text-black mb-6 font-sans">Welcome to CORE CONNECT ACADEMY</h2>
                                <p className="text-gray-500 leading-relaxed text-[15px]">
                                    At CORE CONNECT ACADEMY, we believe technology is not just a tool; it's a gateway to transformation. In a world where traditional career paths are constantly disrupted, we stand at the crossroads of change, empowering individuals to harness technology and redefine their futures.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4">Our Mission</h3>
                                <p className="text-gray-500 leading-relaxed text-[15px]">
                                    To empower Africans with practical, non-coding tech skills, real-world experience, and mentorship that enable confident career transitions into global technology roles.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4">Our Vision</h3>
                                <p className="text-gray-500 leading-relaxed text-[15px]">
                                    To become Africa’s most trusted academy for developing business-facing technology professionals who succeed globally.
                                </p>
                                <p className="text-gray-500 leading-relaxed text-[15px] mt-4">
                                    We envision a future where technology education knows no boundaries. CORE CONNECT ACADEMY is the cornerstone of global digital career transformation, enabling every individual, regardless of their background, to harness the power of technology for impactful innovation.
                                </p>
                            </div>

                            <p className="text-gray-500 leading-relaxed text-[15px] font-semibold italic">
                                Our graduates don't just earn certificates - they become architects of digital transformation, leveraging their skills to revolutionize industries, solve complex problems, and lead with confidence.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/5] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Students learning"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Sets Us Apart Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="aspect-square overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-8">
                            <h2 className="text-4xl font-bold text-black font-sans italic lowercase first-letter:uppercase">What Sets Us Apart</h2>

                            <div className="space-y-6">
                                {[
                                    { title: "Human Centric Approach", desc: "Every learner's story matters. From healthcare professionals embracing telehealth to educators driving digital innovation, we tailor education to real-world needs." },
                                    { title: "Practical Excellence", desc: "Our comprehensive curriculum bridges the gap between learning and doing, equipping learners with hands-on experience through live projects and simulations." },
                                    { title: "Global Impact", desc: "With a presence in the UK, Nigeria, the US, and Canada, we've helped over 5,000 professionals transition into high-demand tech roles." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center shrink-0 mt-1 bg-white group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="text-[10px] font-bold">✓</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-black mb-1 text-[15px]">{item.title}:</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 space-y-6">
                                <h4 className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">Our Values</h4>
                                <div className="space-y-4">
                                    {[
                                        "Innovation: Staying ahead of industry trends to provide cutting-edge skills.",
                                        "Excellence: Delivering top-tier, practical training aligned with global standards.",
                                        "Community: Building an inclusive ecosystem of learners, alumni, and mentors dedicated to lifelong growth."
                                    ].map((val, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                            <p className="text-gray-500 text-sm font-medium">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-800 font-bold text-sm leading-relaxed pt-4">
                                Join CORE CONNECT ACADEMY and take the first step toward a career transformation that not only prepares you for the future but empowers you to shape it.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Who We Serve Section */}
            <section className="py-24 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-primary mb-8 font-sans">Who We Serve</h2>
                            <p className="text-gray-800 font-bold mb-8 italic">We proudly serve:</p>
                            <ul className="space-y-4">
                                {[
                                    "Career switchers from admin, banking, sales, HR, operations, and support roles",
                                    "Beginners with zero tech background",
                                    "NYSC graduates seeking employable global skills",
                                    "Professionals aiming for UK, EU, UAE, US, and remote roles",
                                    "Africans based in Africa, the UAE, Europe, and the diaspora"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700">
                                        <span className="text-primary font-bold mt-1">•</span>
                                        <span className="text-[15px] leading-relaxed font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center">
                            <img src="/who-we-serve-ui.png" alt="Who We Serve Illustration" className="w-full max-w-lg object-contain" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Trainer Section */}
            <section className="py-24 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-4xl font-bold text-primary mb-8 font-sans leading-tight">Lead Trainer & <br />Curriculum Architect</h2>
                            <div className="space-y-6 text-gray-700">
                                <p className="text-[15px] leading-relaxed font-medium">
                                    <span className="text-primary font-bold border-b-2 border-primary/20 pb-0.5">Tosin Samuel Ojo</span> is the Lead Trainer and Curriculum Architect at <span className="text-primary font-bold">CoreConnectAcademy</span>.
                                </p>
                                <p className="text-[15px] leading-relaxed font-medium">
                                    With over 15 years of experience in the IT industry, <span className="border-b-2 border-primary/10">Tosin</span> has worked as an IT Programme Lead across both government and private sectors. He has successfully delivered training, mentoring, and curriculum design across the UK and Europe, specializing in helping non-technical learners transition into tech careers.
                                </p>
                                <p className="text-[15px] leading-relaxed font-medium">
                                    Through previous training initiatives, <span className="border-b-2 border-primary/10">Tosin</span> has contributed to over 2,021 success stories, helping individuals secure roles, grow confidence, and navigate real-world tech environments.
                                </p>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative group">
                            <div className="bg-primary/5 p-4 rounded-none transition-all group-hover:bg-primary/10">
                                <img src="/tosin-ui.png" alt="Tosin Samuel Ojo" className="w-full rounded-none shadow-2xl transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Company Achievement Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-primary mb-12 font-sans">Company Achievement</h2>
                            <ul className="space-y-6">
                                {[
                                    "Trained and mentored 2,000+ learners across Africa, the UK, and Europe",
                                    "Designed career-transition curricula tailored for non-technical professionals",
                                    "Supported learners into global tech roles and remote positions",
                                    "Built strong learning frameworks focused on confidence, delivery, and employability"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-700 group">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
                                        <span className="text-lg leading-relaxed font-bold group-hover:text-primary transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center relative">
                            <img src="/achievement-ui.png" alt="Company Achievement" className="w-full max-w-md relative z-10" />
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10 h-3/4 my-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutContent;
