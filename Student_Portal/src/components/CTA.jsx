import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CTA = () => {
    const { user } = useAuth();
    return (
        <section className="py-6 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-blue-700 to-indigo-900 shadow-2xl shadow-primary/30">

                    {/* Animated Background Artifacts */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
                        <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[150%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 px-6 py-10 md:py-12 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Left Side: Text */}
                        <div className="text-center md:text-left max-w-2xl">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
                                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Level Up?</span>
                            </h2>
                            <p className="text-blue-100/90 text-sm md:text-lg font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                                Join <span className="font-bold text-white">Core Connect Academy</span> today.
                                Master the skills that top tech companies are looking for.
                            </p>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 animate-fadeIn">
                            {user ? (
                                <Link to="/student/dashboard" className="w-full sm:w-auto">
                                    <button className="group relative w-full sm:w-auto bg-white text-primary px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden flex items-center justify-center gap-2">
                                        <span className="relative z-10">Go to Dashboard</span>
                                        <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/show-interest" className="w-full sm:w-auto">
                                        <button className="group relative w-full sm:w-auto bg-white text-primary px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden flex items-center justify-center gap-2">
                                            <span className="relative z-10">Start Learning</span>
                                            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <Link to="/contact" className="w-full sm:w-auto">
                                        <button className="group w-full sm:w-auto border border-white/30 bg-white/5 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center justify-center">
                                            Talk to Us
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
