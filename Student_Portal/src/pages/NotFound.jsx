import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                {/* 404 Large Text */}
                <div className="mb-8">
                    <h1 className="text-[12rem] md:text-[16rem] font-black italic tracking-tighter leading-none text-primary/10 select-none">
                        404
                    </h1>
                </div>

                {/* Content */}
                <div className="space-y-6 -mt-32 md:-mt-48 relative z-10">
                    <div className="inline-block mb-6">
                        <img src="/logo.png" alt="Core Connect Academy" className="h-16 w-auto opacity-50" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
                        Page Not Found
                    </h2>

                    <p className="text-lg text-gray-500 font-medium max-w-md mx-auto px-4">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    {/* Countdown */}
                    <div className="pt-8">
                        <div className="inline-flex items-center gap-3 bg-primary/5 px-8 py-4 border border-primary/10">
                            <Home size={20} className="text-primary" />
                            <span className="text-sm font-black uppercase tracking-widest text-gray-600">
                                Redirecting to home in <span className="text-primary text-xl mx-2">{countdown}</span> seconds
                            </span>
                        </div>
                    </div>

                    {/* Manual Navigation */}
                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-3 border-2 border-gray-200 px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            <ArrowLeft size={16} /> Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary transition-all"
                        >
                            <Home size={16} /> Go Home Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
