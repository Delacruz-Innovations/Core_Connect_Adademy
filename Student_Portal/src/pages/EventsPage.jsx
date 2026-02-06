import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Minus, Send, User, MapPin, Clock } from 'lucide-react';

const EventAccordion = ({ title, date, location, details, badge }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0 transition-all">
            <div className="py-12 flex flex-col lg:flex-row gap-12 items-start">
                <div className="lg:w-1/2">
                    {badge && <span className="inline-block bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest mb-6">{badge}</span>}
                    <h3 className="text-4xl font-bold mb-6 leading-tight italic">{title}</h3>
                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                        Join our exclusive Tech Day held twice a month. Its mission here is to transition the first-time analysts & Project Managers into tech with sessions with our CTO and Experts Trainers. Whether you're new to tech or looking to upskill, this is your chance to accelerate your Career.
                    </p>

                    <div className="space-y-4 mb-10">
                        {details.map((item, idx) => (
                            <div key={idx} className="border border-gray-100 p-6 shadow-sm bg-white overflow-hidden">
                                <button
                                    onClick={() => setIsOpen(isOpen === idx ? -1 : idx)}
                                    className="w-full flex justify-between items-center text-left"
                                >
                                    <span className="font-bold text-black text-sm">{item.q}</span>
                                    {isOpen === idx ? <Minus size={16} className="text-primary" /> : <Plus size={16} className="text-gray-300" />}
                                </button>
                                <AnimatePresence>
                                    {isOpen === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-4 pt-4 border-t border-gray-50 text-gray-500 text-sm leading-relaxed"
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button className="bg-primary text-white px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Register Now</button>
                        <button className="border border-gray-200 text-gray-400 px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2">
                            <Calendar size={14} className="text-primary" /> Add to Calendar
                        </button>
                    </div>
                </div>

                <div className="lg:w-1/2 aspect-square bg-gray-100 overflow-hidden shadow-2xl">
                    <img src={location.img} alt={title} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
    );
};

const EventsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const eventData = [
        {
            title: "Elite Tech Day in Business Analysis & Project Management",
            badge: "Free Class",
            location: { img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            details: [
                { q: "Is the Tech Day free to attend?", a: "Yes, our Tech Day is completely free for all pre-registered participants." },
                { q: "How do I join the virtual session?", a: "You will receive a Zoom link 24 hours before the event starts." },
                { q: "Do I need prior experience in tech to participate?", a: "No, beginners are more than welcome to join and learn." },
                { q: "What time does the event start?", a: "The event starts at 10:00 AM GMT sharp." }
            ]
        },
        {
            title: "Digital Conference",
            badge: "Upcoming",
            location: { img: "https://images.unsplash.com/photo-1540575861501-7ad0582373f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            details: [
                { q: "Is the Digital Conference free to attend?", a: "Registration is required, but general admission is free." },
                { q: "Will I get a recording of the session if I miss it?", a: "Yes, recordings will be sent to all registered attendees." },
                { q: "What topics will be covered during the conference?", a: "We cover AI, Cloud Computing, and Digital Transformation strategies." },
                { q: "Can I interact with the speakers?", a: "Absolutely! There's a dedicated Q&A session after each talk." }
            ]
        },
        {
            title: "Tech n Brunch",
            badge: "Networking",
            location: { img: "https://images.unsplash.com/photo-1528605248644-14dd04cb11c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            details: [
                { q: "Is Tech n Brunch a paid event?", a: "Yes, it includes a curated menu and premium networking opportunities." },
                { q: "Where will the event be held?", a: "Venues change monthly; we'll notify you of the central London location." },
                { q: "What is included in the cost?", a: "Full brunch, workshop materials, and exclusive access to our mentor network." },
                { q: "What should I wear to the event?", a: "Smart casual is recommended." }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1475721027785-f74dea327912?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/65"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl font-black mb-6 italic tracking-tight"
                    >
                        Events
                    </motion.h1>
                    <p className="max-w-2xl mx-auto text-xl text-white/90 font-medium italic">
                        Explore a World of Free and Paid Tech Events Designed to Empower, Inspire, and Keep You Ahead in the Industry
                    </p>
                </div>
            </section>

            {/* Events List */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12">
                    {eventData.map((event, i) => (
                        <EventAccordion key={i} {...event} />
                    ))}
                </div>
            </section>

            {/* Contact/Register Form Footer */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6">
                            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Register</span>
                            <h2 className="text-5xl font-black italic mb-8">We Will Reach Out</h2>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-lg mb-12">
                                Register now to secure your spot at our upcoming tech events! Whether you're aiming to learn basic skills, networking with like-minded professionals, or gaining hands-on experience, our events provide something for everyone.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-10 h-10 rounded-none bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"><User size={18} /></div>)}
                            </div>
                        </div>

                        <div className="bg-white p-8 lg:p-12 shadow-2xl">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="First Name" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                                <input type="text" placeholder="Last Name" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                                <input type="text" placeholder="Phone Number" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                                <input type="email" placeholder="E-mail" className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" placeholder="Date of Appointment" className="w-full bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                    <option>Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                                <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                    <option>Select Event</option>
                                    <option>Elite Tech Day</option>
                                    <option>Digital Conference</option>
                                    <option>Tech n Brunch</option>
                                </select>
                                <select className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400">
                                    <option>Select Country</option>
                                </select>
                                <textarea className="bg-gray-50 border-0 p-4 font-bold text-xs tracking-widest outline-none focus:ring-1 focus:ring-primary text-gray-400 md:col-span-2 h-32" placeholder="Your Message"></textarea>
                                <button className="md:col-span-2 bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Submit Registration</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default EventsPage;
