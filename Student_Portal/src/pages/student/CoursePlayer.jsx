import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Play, Download, FileText, Upload,
    CheckCircle2, ChevronLeft, ChevronRight,
    MessageSquare, BookOpen, Clock, Layout
} from 'lucide-react';
import { useFadeInOnScroll } from '../../hooks/useScrollAnimations';

const CoursePlayer = () => {
    const { courseId, moduleId } = useParams();
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const videoRef = useFadeInOnScroll('up', 0.6);
    const contextRef = useFadeInOnScroll('up', 0.8, 0.2);

    const moduleData = {
        title: "Module 4: Business Analysis Basics",
        lesson: "Lesson 1: Introduction to Elicitation",
        progress: 60,
        videoUrl: "https://vimeo.com/placeholder-id",
        resources: [
            { id: 1, name: "Elicitation Techniques PDF", type: "PDF", size: "2.4 MB" },
            { id: 2, name: "Case Study Template", type: "DOCX", size: "1.2 MB" }
        ],
        assignment: {
            title: "Submit Process Map Draft",
            dueDate: "Friday, 20th Oct",
            description: "Create a high-level process map for the retail scenario discussed in the video."
        },
        curriculum: [
            { id: '1', title: '1. Fundamentals', completed: true },
            { id: '2', title: '2. Stakeholder Mapping', completed: true },
            { id: '3', title: '3. Elicitation Plans', completed: false, active: true },
            { id: '4', title: '4. Survey Design', completed: false }
        ]
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-4 md:-m-8 lg:-m-12 overflow-hidden bg-white">

            {/* Left/Sidebar Navigation for Modules */}
            <aside
                className={`bg-gray-50 border-r border-gray-100 transition-all duration-300 overflow-y-auto ${sidebarVisible ? 'w-80' : 'w-0'
                    }`}
            >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <Link to={`/student/course/${courseId}`} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-black">
                        Course Content
                    </Link>
                </div>
                <div className="p-4 space-y-2">
                    {moduleData.curriculum.map((item) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center gap-4 p-4 text-left transition-all ${item.active ? 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100 translate-x-1' : 'hover:bg-white/50'
                                }`}
                        >
                            <div className={`w-6 h-6 shrink-0 flex items-center justify-center ${item.completed ? 'text-green-500' : 'text-gray-300'
                                }`}>
                                {item.completed ? <CheckCircle2 size={16} /> : <Play size={14} fill="currentColor" />}
                            </div>
                            <div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${item.active ? 'text-black' : 'text-gray-400'
                                    }`}>
                                    {item.title}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Player Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header Info */}
                <div className="p-4 md:p-8 lg:p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{moduleData.title}</span>
                        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">{moduleData.lesson}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lesson Progress</span>
                            <div className="w-24 md:w-32 h-1.5 bg-gray-100 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <button className="w-full md:w-auto bg-primary text-white px-8 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20">
                            Mark as Complete
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-4 md:p-8 lg:p-12 space-y-12">

                    {/* Video Player Placeholder */}
                    <div ref={videoRef} className="aspect-video bg-black relative group shadow-2xl">
                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                                <Play size={32} className="text-white ml-1" fill="currentColor" />
                            </div>
                        </div>
                        <div className="absolute bottom-8 left-8 right-8 h-1 bg-white/20">
                            <div className="h-full bg-primary w-1/3"></div>
                        </div>
                    </div>

                    <div ref={contextRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Tab Content (Description/Brief) */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black italic tracking-tight uppercase border-b-2 border-primary inline-block pb-2">Lesson Overview</h3>
                                <p className="text-base text-gray-500 font-medium leading-relaxed">
                                    In this lesson, we dive deep into the first phase of the BA lifecycle: Elicitation.
                                    Learn how to ask the right questions, identify hidden stakeholders, and use surveys
                                    effectively to gather the root requirements of any project.
                                </p>
                            </div>

                            {/* Assignment Placeholder UI */}
                            <div className="bg-gray-50 p-6 md:p-10 border border-gray-100">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Pending Task</span>
                                <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-4">{moduleData.assignment.title}</h4>
                                <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed italic border-l-2 border-gray-200 pl-4">
                                    {moduleData.assignment.description}
                                </p>
                                <Link
                                    to={`/student/assignments/map-draft-123`}
                                    className="inline-flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest hover:text-black transition-colors"
                                >
                                    Go to Upload Area <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Right Rail: Resources & AI */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Resources */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Lesson Resources</h3>
                                <div className="space-y-3">
                                    {moduleData.resources.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="text-primary"><Download size={18} /></div>
                                                <div>
                                                    <p className="text-[11px] font-black text-black uppercase tracking-widest leading-none mb-1">{res.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{res.type} • {res.size}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI FAQ Button Placeholder */}
                            <div className="p-8 bg-black text-white space-y-6">
                                <div className="flex items-center gap-3 text-primary">
                                    <MessageSquare size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Knowledge Assistant</span>
                                </div>
                                <h4 className="text-md font-black italic uppercase leading-tight">Stuck on Elicitation techniques?</h4>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Our AI is primed with this lesson's content.</p>
                                <Link
                                    to="/student/ai-assistant"
                                    className="block w-full text-center bg-primary text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all underline underline-offset-8"
                                >
                                    Open Chat Support
                                </Link>
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            {/* Mobile Sidebar Toggle fixed bottom? No, just keep it simple */}
        </div>
    );
};

// Internal icon dependency fix
const ArrowRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
);

export default CoursePlayer;
