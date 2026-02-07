import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    ArrowLeft, Lock, CheckCircle,
    PlayCircle, FileText, Layout
} from 'lucide-react';

export default function CoursePlayerPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Get Course Info
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();
            setCourse(courseData);

            // 2. Get Modules (Ordered)
            const { data: modulesData } = await supabase
                .from('modules')
                .select('*')
                .eq('course_id', courseId)
                .order('week_number', { ascending: true });
            setModules(modulesData || []);

            // 3. Get User Progress
            const { data: progressData } = await supabase
                .from('module_progress')
                .select('module_id, status')
                .eq('user_id', user.id)
                .eq('course_id', courseId);

            // Convert array to map for O(1) lookups
            const progressMap = {};
            if (progressData) {
                progressData.forEach(p => {
                    progressMap[p.module_id] = p.status;
                });
            }
            setProgress(progressMap);

        } catch (error) {
            console.error('Error fetching course player:', error);
        } finally {
            setLoading(false);
        }
    };

    const isModuleLocked = (moduleId, weekNum) => {
        // Week 1 is always unlocked logically, unless explicitly locked by admin
        if (weekNum === 1) return false;

        // Otherwise check progress record
        const status = progress[moduleId];
        return status !== 'unlocked' && status !== 'completed';
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white animate-pulse">Loading Academy Enviroment...</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Sidebar (Navigation) */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10 shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <Link to="/student/dashboard" className="text-xs font-bold text-gray-400 hover:text-black flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 className="font-black text-lg leading-tight text-gray-900">{course.title}</h1>
                    <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: '0%' }} // TODO: Calculate %
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase tracking-widest">0% Complete</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {modules.map((mod) => {
                        const locked = isModuleLocked(mod.id, mod.week_number);
                        const completed = progress[mod.id] === 'completed';

                        return (
                            <div
                                key={mod.id}
                                className={`
                            relative overflow-hidden rounded-xl border transition-all duration-300 group
                            ${locked
                                        ? 'bg-gray-50 border-transparent opacity-60 cursor-not-allowed'
                                        : 'bg-white border-gray-200 hover:border-black cursor-pointer shadow-sm hover:shadow-md'
                                    }
                            ${completed ? 'border-green-200 bg-green-50/30' : ''}
                        `}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                            Week {mod.week_number}
                                        </span>
                                        {locked ? (
                                            <Lock size={12} className="text-gray-400" />
                                        ) : completed ? (
                                            <CheckCircle size={14} className="text-green-500" />
                                        ) : (
                                            <PlayCircle size={14} className="text-black" />
                                        )}
                                    </div>
                                    <h3 className={`font-bold text-sm ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {mod.title}
                                    </h3>
                                </div>

                                {/* Progress Bar (Visual Only for now) */}
                                {!locked && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
                                        <div className={`h-full ${completed ? 'bg-green-500 w-full' : 'bg-black w-0'}`}></div>
                                    </div>
                                )}

                                {/* Click Handler (Only if unlocked) */}
                                {!locked && (
                                    <Link to={`/student/course/${courseId}/module/${mod.id}`} className="absolute inset-0" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative">
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md p-8">
                        <Layout size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Module</h2>
                        <p className="text-gray-500 text-sm">
                            Choose a week from the sidebar to continue your learning journey.
                            Complete modules sequentially to unlock future content.
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
