import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ArrowLeft, PlusCircle, Trash2, Edit3,
    ArrowUp, ArrowDown, Layout, BookOpen,
    ClipboardList
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import BrandedLoader from '../../components/BrandedLoader';

export default function ModuleListPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showAlert, showConfirm, showPrompt } = useModal();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReordering, setIsReordering] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            // 1. Get Course Info
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('title')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // 2. Get Modules (Ordered by week)
            const { data: modulesData, error } = await supabase
                .from('modules')
                .select('*, lessons:lessons(id)')
                .eq('course_id', courseId)
                .order('week_number', { ascending: true });

            if (error) throw error;
            setModules(modulesData || []);

        } catch (error) {
            console.error('Error fetching modules:', error);
            await showAlert('Failed to load modules.', 'Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddModule = async () => {
        if (isAdding) return;

        const title = await showPrompt("Enter Module Title (e.g. 'Foundations of UI Design'):", "Foundation 101");
        if (!title || !title.trim()) return;

        setIsAdding(true);
        const nextWeek = modules.length > 0
            ? Math.max(...modules.map(m => m.week_number)) + 1
            : 1;

        try {
            const { error } = await supabase.from('modules').insert({
                course_id: courseId,
                title: title.trim(),
                week_number: nextWeek,
                status: 'locked'
            });
            if (error) throw error;
            await fetchData();
        } catch (error) {
            await showAlert('Error creating module: ' + error.message, 'Creation Failed', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const handleMove = async (index, direction) => {
        if (isReordering) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= modules.length) return;

        setIsReordering(true);
        const currentMod = modules[index];
        const swapMod = modules[newIndex];

        try {
            // Swap week numbers using separate updates to avoid NOT NULL constraint issues on title
            const update1 = supabase.from('modules')
                .update({ week_number: swapMod.week_number })
                .eq('id', currentMod.id);

            const update2 = supabase.from('modules')
                .update({ week_number: currentMod.week_number })
                .eq('id', swapMod.id);

            const results = await Promise.all([update1, update2]);
            const error = results.find(r => r.error)?.error;

            if (error) throw error;
            await fetchData();
        } catch (err) {
            await showAlert('Reordering failed: ' + err.message, 'Error', 'error');
        } finally {
            setIsReordering(false);
        }
    };

    const handleDelete = async (moduleId) => {
        const confirmed = await showConfirm('Are you sure? This deletes ALL lessons in this module!', 'Confirm Deletion', 'warning');
        if (!confirmed) return;
        try {
            await supabase.from('modules').delete().eq('id', moduleId);
            fetchData();
        } catch (err) {
            await showAlert(err.message, 'Deletion Failed', 'error');
        }
    };

    if (loading) return <BrandedLoader message="Building Curriculum Hierarchy..." />;

    return (
        <div className="mx-auto py-8 px-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Layout size={24} className="text-primary" /> Curriculum Architect
                        </h1>
                        <p className="text-gray-500 text-sm font-medium italic">{course?.title}</p>
                    </div>
                </div>

                <button
                    onClick={handleAddModule}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
                >
                    <PlusCircle size={16} /> Add New Module
                </button>
            </div>

            {/* Module List */}
            <div className="space-y-4">
                {modules.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-4">The curriculum is currently empty</p>
                        <button
                            onClick={handleAddModule}
                            className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
                        >
                            + Deploy First Module
                        </button>
                    </div>
                ) : (
                    modules.map((mod, index) => (
                        <div key={mod.id} className={`bg-white border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between group transition-all ${isReordering ? 'opacity-50 grayscale' : 'hover:border-black/20 hover:shadow-xl'}`}>

                            {/* Left: Info */}
                            <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                <div className="w-12 h-12 bg-black text-white rounded-xl flex flex-col items-center justify-center font-black leading-none shrink-0 shadow-lg shadow-black/10">
                                    <span className="text-[8px] uppercase tracking-tighter opacity-50 mb-0.5">WEEK</span>
                                    <span className="text-lg italic">{mod.week_number}</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-gray-900 uppercase tracking-tight leading-tight">{mod.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border tracking-widest ${mod.status === 'unlocked'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                            {mod.status}
                                        </span>
                                        <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em]">{mod.lessons?.length || 0} Content Blocks</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                <button
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0 || isReordering}
                                    className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl disabled:opacity-20 transition-colors"
                                >
                                    <ArrowUp size={18} />
                                </button>
                                <button
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === modules.length - 1 || isReordering}
                                    className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl disabled:opacity-20 transition-colors"
                                >
                                    <ArrowDown size={18} />
                                </button>

                                <div className="w-px h-6 bg-gray-100 mx-3 hidden sm:block"></div>

                                <Link
                                    to={`/admin/modules/${mod.id}/assignments`}
                                    className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                    title="Milestone Assignments"
                                >
                                    <ClipboardList size={18} />
                                </Link>

                                <Link
                                    to={`/admin/modules/${mod.id}/lessons`}
                                    className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-colors shadow-sm"
                                >
                                    Manage Lessons
                                </Link>

                                <Link
                                    to={`/admin/modules/${mod.id}/edit`}
                                    className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                    title="Settings"
                                >
                                    <Edit3 size={18} />
                                </Link>

                                <button
                                    onClick={() => handleDelete(mod.id)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Destroy"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Safe Zone */}
            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Architectural Constraints</p>
                <ul className="text-[10px] font-bold text-gray-500 space-y-1 list-disc pl-4 italic">
                    <li>Modules are strictly bound to this course and cannot exist as orphans.</li>
                    <li>Reordering shifts the 'Week Number' which dictates content availability to students.</li>
                    <li>Deleting a module will permanently destroy all associated lessons and media records.</li>
                </ul>
            </div>
        </div>
    );
}
