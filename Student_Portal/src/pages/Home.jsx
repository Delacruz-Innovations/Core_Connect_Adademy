import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-primary mb-4 italic">Core Connect Academy</h1>
                <p className="text-gray-600 mb-8">Welcome to the Student Portal. Your journey to excellence starts here.</p>
                <button className="bg-secondary text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-secondary/20">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Home;
