import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
            <div className="relative">
                {/* Spinning Border */}
                <div className="absolute inset-0 animate-spin">
                    <div className="w-32 h-32 border-4 border-gray-100 border-t-primary rounded-full"></div>
                </div>

                {/* Logo Center */}
                <div className="w-32 h-32 flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="Core Connect Academy"
                        className="w-20 h-auto animate-pulse"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
