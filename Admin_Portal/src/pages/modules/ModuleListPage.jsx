import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, PlusCircle, Unlock, Lock,
    Trash2, Edit3, ArrowUp, ArrowDown
} from 'lucide-react';

export default function ModuleListPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            // 1. Get Course Info
            const { data: courseData } = await supabase
                .from('courses')
                .select('title')
                .eq('id', courseId)
                .single();
            setCourse(courseData);

            // 2. Get Modules (Ordered by week)
            const { data: modulesData, error } = await supabase
                .from('modules')
                .select('*')
                .eq('course_id', courseId)
                .order('week_number', { ascending: true });

            if (error) throw error;
            setModules(modulesData || []);

        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async () => {
        const title = prompt("Enter Module Title (e.g. 'Foundations of UI Design'):");
        if (!title) return;

        // Calculate next week number
        const nextWeek = modules.length > 0
            ? Math.max(...modules.map(m => m.week_number)) + 1
            : 1;

        try {
            const { error } = await supabase.from('modules').insert({
                course_id: courseId,
                title,
                week_number: nextWeek,
                status: 'locked' // Default
            });
            if (error) throw error;
            fetchData(); // Refresh list
        } catch (error) {
            alert('Error creating module: ' + error.message);
        }
    };

    const handleDelete = async (moduleId) => {
        if (!confirm('Area you sure? This deletes ALL lessons in this module!')) return;
        try {
            await supabase.from('modules').delete().eq('id', moduleId);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading curriculum...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${courseId}`} className="text-gray-400 hover:text-black">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Curriculum Builder</h1>
                        <p className="text-gray-500 text-sm">{course?.title}</p>
                    </div>
                </div>

                <button
                    onClick={handleAddModule}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <PlusCircle size={16} /> Add Week / Module
                </button>
            </div>

            {/* Module List */}
            <div className="space-y-4">
                {modules.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-gray-400 font-medium mb-4">No content yet.</p>
                        <button
                            onClick={handleAddModule}
                            className="text-primary font-bold hover:underline"
                        >
                            Create First Module →
                        </button>
                    </div>
                ) : (
                    modules.map((mod, index) => (
                        <div key={mod.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between group hover:shadow-md transition-all">

                            {/* Left: Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-black text-gray-400 text-sm">
                                    W{mod.week_number}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{mod.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${mod.status === 'unlocked'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                            {mod.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400">0 Lessons</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button title="Move Up" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded">
                                    <ArrowUp size={16} />
                                </button>
                                <button title="Move Down" className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded">
                                    <ArrowDown size={16} />
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-2"></div>

                                <Link
                                    to={`/admin/modules/${mod.id}/lessons`}
                                    className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800"
                                >
                                    Manage Lessons
                                </Link>

                                <Link
                                    to={`/admin/modules/${mod.id}/edit`}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                    title="Edit Details"
                                >
                                    <Edit3 size={16} />
                                </Link>

                                <button
                                    onClick={() => handleDelete(mod.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                    title="Delete Module"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
