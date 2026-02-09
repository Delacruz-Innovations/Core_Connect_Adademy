import React from 'react';

const BrandedLoader = ({ message = "Loading System resources..." }) => {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center brand-watermark-bg">
            <div className="relative w-24 h-24 mb-6">
                {/* Spinning Rings */}
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

                {/* Centered Static Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="Loading"
                        className="w-10 h-auto animate-pulse"
                    />
                </div>
            </div>

            <div className="text-center space-y-2 relative z-10">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                    Core Connect Academy
                </h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default BrandedLoader;
