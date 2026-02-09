import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../context/ModalContext';
import { ArrowLeft, Save, Trash2, Layout, FileText, Info } from 'lucide-react';
import BrandedLoader from '../../components/BrandedLoader';
import DocumentManager from '../../components/documents/DocumentManager';
import AssignmentManager from '../../components/assignments/AssignmentManager';
import { ClipboardList } from 'lucide-react';

export default function ModuleEditPage() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        week_number: 1,
        status: 'locked'
    });

    const [lessons, setLessons] = useState([]);
    const [lessonsLoading, setLessonsLoading] = useState(true);

    useEffect(() => {
        const fetchModuleAndLessons = async () => {
            setLoading(true);
            try {
                const [modRes, lessRes] = await Promise.all([
                    supabase.from('modules').select('*').eq('id', moduleId).single(),
                    supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index', { ascending: true })
                ]);

                if (modRes.data) setFormData(modRes.data);
                if (lessRes.data) setLessons(lessRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
                setLessonsLoading(false);
            }
        };
        fetchModuleAndLessons();
    }, [moduleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation: Block unlock if any lesson is draft
        if (formData.status === 'unlocked') {
            const drafts = lessons.filter(l => !l.video_path);
            if (drafts.length > 0) {
                showAlert(
                    `Cannot unlock module: ${drafts.length} lesson(s) are still in Draft status. All lessons must have video content before unlocking.`,
                    'Action Restricted',
                    'warning'
                );
                return;
            }
        }

        setIsSubmitting(true);
        setLoading(true);
        try {
            const { error } = await supabase.from('modules').update({
                title: formData.title.trim(),
                week_number: formData.week_number,
                status: formData.status,
                updated_at: new Date().toISOString()
            }).eq('id', moduleId);

            if (error) throw error;
            navigate(-1); // Go back

        } catch (err) {
            showAlert('Error updating module: ' + err.message, 'Error', 'error');
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    if (loading) return <BrandedLoader message="Loading Module..." />;

    return (
        <div className="mx-auto py-12 px-4 max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Module</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6">

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Protocol: Week Number</label>
                        <input
                            type="number"
                            value={formData.week_number}
                            onChange={e => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Module Nomenclature</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-bold"
                            placeholder="e.g. Strategic Analysis Frameworks"
                        />
                    </div>

                    <div className="p-6 bg-gray-900 text-white rounded-[1.5rem] space-y-4">
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Module Readiness Matrix</label>
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black italic tracking-tighter">{lessons.length}</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total Units</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black italic tracking-tighter text-primary">{lessons.filter(l => l.video_path).length}</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Live Nodes</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black italic tracking-tighter text-gray-600">{lessons.filter(l => !l.video_path).length}</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Draft Assets</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Global Access Tier</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-widest text-xs"
                        >
                            <option value="locked">Locked (Cohort Sequenced)</option>
                            <option value="unlocked">Unlocked (Open Protocol)</option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-3 italic">
                            "Locked" enforces sequential learning prerequisites. "Unlocked" exposes the node to all enrolled learners immediately.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            to={-1}
                            className="flex-1 py-4 text-center rounded-xl border border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Abort
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-4 rounded-xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            <Save size={16} /> {isSubmitting ? 'Syncing...' : 'Commit Changes'}
                        </button>
                    </div>
                </form>

                {/* Right Column: Resources & Info */}
                <div className="space-y-8">
                    {/* Resource Manager */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <FileText size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Module Resources</h3>
                        </div>
                        <DocumentManager parentType="module" parentId={moduleId} />
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-gray-400">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Contextual Identity</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic">
                            Resources attached here will reflect directly in the student's module view once the week is unlocked. Draft resources remain restricted.
                        </p>
                    </div>

                    {/* Assignment Manager */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-black text-white rounded-lg shadow-black/10 shadow-lg">
                                <ClipboardList size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Module Assignment</h3>
                        </div>
                        <AssignmentManager parentType="module" parentId={moduleId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
