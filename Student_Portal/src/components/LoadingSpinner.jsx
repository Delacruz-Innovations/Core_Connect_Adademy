import React from 'react';

const LoadingSpinner = ({ fullScreen = true }) => {
    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-40'} bg-white flex items-center justify-center`}>
            <div className="relative">
                {/* Spinning Border */}
                <div className="absolute inset-0 animate-spin">
                    <div className={`${fullScreen ? 'w-32 h-32' : 'w-20 h-20'} border-4 border-gray-100 border-t-primary rounded-full`}></div>
                </div>

                {/* Logo Center */}
                <div className={`${fullScreen ? 'w-32 h-32' : 'w-20 h-20'} flex items-center justify-center`}>
                    <img
                        src="/logo.png"
                        alt="Core Connect Academy"
                        className={`${fullScreen ? 'w-20' : 'w-12'} h-auto animate-pulse`}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
