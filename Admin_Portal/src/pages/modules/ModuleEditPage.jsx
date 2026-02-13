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
        status: 'locked',
        is_published: false,
        thumbnail_url: ''
    });
    const [uploading, setUploading] = useState(false);

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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `modules/${fileName}`;

            // Using course-thumbnails bucket for consistency, or we could use a dedicated one
            const { error: uploadError } = await supabase.storage
                .from('course-thumbnails')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('course-thumbnails')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
            showAlert('Thumbnail uploaded successfully', 'Success', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            await showAlert('Error uploading image: ' + error.message, 'Upload Failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation: Block publish if any lesson is draft
        if (formData.is_published) {
            const drafts = lessons.filter(l => !l.is_published);
            if (drafts.length > 0) {
                showAlert(
                    `Cannot publish module: ${drafts.length} lesson(s) are still in Draft status. All lessons must be "Live" before a module can go live.`,
                    'Hierarchy Violation',
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
                is_published: formData.is_published,
                thumbnail_url: formData.thumbnail_url,
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
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Module Graphic Identity</label>
                        <div className="flex flex-col gap-4">
                            <div className={`relative border-2 border-dashed rounded-[1.5rem] p-8 transition-all flex flex-col items-center justify-center text-center ${formData.thumbnail_url ? 'border-primary/20 bg-primary/5' : 'border-gray-100 hover:border-black/20 bg-gray-50'}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                ) : formData.thumbnail_url ? (
                                    <div className="space-y-4">
                                        <img src={formData.thumbnail_url} alt="Preview" className="h-20 w-auto mx-auto rounded-lg shadow-sm border border-gray-100" />
                                        <p className="text-[9px] font-black uppercase text-primary tracking-widest leading-none">Identity Linked Surface</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Layout className="mx-auto text-gray-200" size={32} />
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Upload Module Thumbnail</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Global Access Tier</label>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-bold uppercase tracking-widest text-xs"
                            >
                                <option value="locked">Locked (Cohort Sequenced)</option>
                                <option value="unlocked">Unlocked (Open Protocol)</option>
                            </select>
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="is_published"
                                    checked={formData.is_published}
                                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 accent-black"
                                />
                                <label htmlFor="is_published" className="text-[10px] font-black uppercase tracking-widest text-gray-900 cursor-pointer">Live Node</label>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 italic">
                            "Live Node" exposes the module to the student portal. Draft nodes remain hidden from active curriculum views.
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
