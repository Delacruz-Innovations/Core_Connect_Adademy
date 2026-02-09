import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../context/ModalContext';
import { ArrowLeft, Save, Layout, Trash2, Plus, Upload, X, Eye, Check } from 'lucide-react';
import BrandedLoader from '../../components/BrandedLoader';

export default function CourseEditPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        short_description: '',
        level: 'Beginner',
        thumbnail_url: '',
        is_published: false,
        duration: '',
        prerequisites: [],
        learning_outcomes: [],
        target_audience: [],
        career_prospects: []
    });

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) throw error;

            setFormData({
                ...data,
                prerequisites: data.prerequisites || [],
                learning_outcomes: data.learning_outcomes || [],
                target_audience: data.target_audience || [],
                career_prospects: data.career_prospects || []
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleListItemChange = (field, index, value) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const addListItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeListItem = (field, index) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `thumbnails/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('course-thumbnails')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('course-thumbnails')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            await showAlert('Error uploading image: ' + error.message, 'Upload Failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    ...formData,
                    // Filter out empty items
                    prerequisites: formData.prerequisites.filter(i => i.trim()),
                    learning_outcomes: formData.learning_outcomes.filter(i => i.trim()),
                    target_audience: formData.target_audience.filter(i => i.trim()),
                    career_prospects: formData.career_prospects.filter(i => i.trim()),
                    updated_at: new Date().toISOString()
                })
                .eq('id', courseId);

            if (error) throw error;
            navigate(`/admin/courses/${courseId}`);

        } catch (error) {
            await showAlert('Error updating course: ' + error.message, 'Update Failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const ListSection = ({ title, field, placeholder }) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-gray-400">{title}</label>
                <button
                    type="button"
                    onClick={() => addListItem(field)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-primary hover:text-black transition-colors"
                >
                    <Plus size={14} /> Add Item
                </button>
            </div>
            <div className="space-y-2">
                {formData[field].map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            value={item}
                            onChange={(e) => handleListItemChange(field, index, e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            placeholder={placeholder}
                        />
                        <button
                            type="button"
                            onClick={() => removeListItem(field, index)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {formData[field].length === 0 && (
                    <p className="text-[10px] text-gray-300 italic">No items added yet. Click "Add Item" to start.</p>
                )}
            </div>
        </div>
    );

    if (loading) return <BrandedLoader message="Loading Editor..." />;

    return (
        <div className="mx-auto py-8 max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${courseId}`} className="text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Metadata</h1>
                </div>

                <Link
                    to={`/admin/courses/${courseId}/modules`}
                    className="text-xs font-bold text-primary flex items-center gap-2 hover:underline"
                >
                    <Layout size={14} /> Edit Curriculum Structure
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-10">

                {/* Core Info */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-100 pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Internal Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">URL Slug</label>
                            <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                <span className="px-3 py-3 text-gray-400 font-mono text-xs border-r border-gray-200 bg-gray-100 flex items-center">
                                    /courses/
                                </span>
                                <input
                                    required
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-mono text-sm text-gray-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Difficulty Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all appearance-none"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Duration (e.g. 12 Weeks)</label>
                            <input
                                name="duration"
                                value={formData.duration || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                                placeholder="e.g. 8 Weeks / 3 Months"
                            />
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-100 pb-2">Course Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Thumbnail Image</label>
                            <div className="flex flex-col gap-4">
                                <div className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center ${formData.thumbnail_url ? 'border-primary/20 bg-primary/5' : 'border-gray-200 hover:border-black bg-gray-50'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    ) : formData.thumbnail_url ? (
                                        <div className="space-y-2">
                                            <Check className="mx-auto text-green-500" size={32} />
                                            <p className="text-[10px] font-black uppercase text-green-600">Image Uploaded Successfully</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="mx-auto text-gray-300" size={32} />
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Click or drag to upload</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        name="thumbnail_url"
                                        value={formData.thumbnail_url || ''}
                                        onChange={handleChange}
                                        placeholder="Or paste external URL..."
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-xs font-mono"
                                    />
                                    {formData.thumbnail_url && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-md"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Short Summary (For Cards)</label>
                                <textarea
                                    name="short_description"
                                    rows="3"
                                    value={formData.short_description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Description */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <label className="block text-xs font-bold uppercase text-gray-400">Full Description & Sales Pitch</label>
                    <textarea
                        required
                        name="description"
                        rows="8"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y text-sm leading-relaxed"
                    />
                </div>

                {/* Marketing Lists */}
                <div className="space-y-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black border-b border-gray-100 pb-2">Program Details & Outcomes</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ListSection
                            title="Learning Outcomes (What You Master)"
                            field="learning_outcomes"
                            placeholder="e.g. Master React Hooks and Context API"
                        />
                        <ListSection
                            title="Target Audience (Who Should Enroll)"
                            field="target_audience"
                            placeholder="e.g. Aspiring Frontend Developers"
                        />
                        <ListSection
                            title="Career Prospects (Roles)"
                            field="career_prospects"
                            placeholder="e.g. Junior Web Developer"
                        />
                        <ListSection
                            title="Prerequisites"
                            field="prerequisites"
                            placeholder="e.g. Basic understanding of HTML/CSS"
                        />
                    </div>
                </div>

                {/* Publish Settings */}
                <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${formData.is_published ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-widest text-black">Visibility Status</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{formData.is_published ? 'Publicly Visible' : 'Restricted (Draft)'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                        <input
                            type="checkbox"
                            name="is_published"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={handleChange}
                            className="w-5 h-5 accent-black rounded border-gray-300"
                        />
                        <label htmlFor="is_published" className="text-xs font-black uppercase text-gray-600 cursor-pointer">Published</label>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="pt-10 flex justify-between gap-4">
                    <button
                        type="button"
                        onClick={async () => {
                            if (await showConfirm('Delete course? This cannot be undone.', 'Confirm Deletion')) {
                                // Delete logic would normally go here
                            }
                        }}
                        className="px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div className="flex gap-4">
                        <Link
                            to={`/admin/courses/${courseId}`}
                            className="px-8 py-4 rounded-xl border border-gray-200 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-black transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="px-12 py-4 rounded-xl bg-black text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>

            </form>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <div className="aspect-video w-full bg-gray-100">
                            <img src={formData.thumbnail_url} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Thumbnail Preview</h3>
                            <p className="text-sm text-gray-500 italic">This is how your course header will look on the detail page.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
