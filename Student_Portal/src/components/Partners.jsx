import React from 'react';

const Partners = () => {
    const partners = [
        { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        { name: 'Capgemini', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_2017_logo.svg' },
        { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
        { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-bold text-black mb-1 font-sans">Our Graduates Work At</h2>
                <p className="text-gray-400 text-sm mb-16 italic">Join our network of professionals across leading global organizations</p>

                <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24">
                    {partners.map((partner) => (
                        <img
                            key={partner.name}
                            src={partner.logo}
                            alt={partner.name}
                            className="h-10 lg:h-12 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;
