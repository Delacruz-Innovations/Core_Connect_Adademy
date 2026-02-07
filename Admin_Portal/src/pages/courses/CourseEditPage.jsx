import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Layout, Trash2 } from 'lucide-react';

export default function CourseEditPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        short_description: '',
        level: 'Beginner',
        thumbnail_url: '',
        is_published: false
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
            setFormData(data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    description: formData.description,
                    short_description: formData.short_description,
                    level: formData.level,
                    thumbnail_url: formData.thumbnail_url,
                    is_published: formData.is_published,
                    updated_at: new Date().toISOString()
                })
                .eq('id', courseId);

            if (error) throw error;
            navigate(`/admin/courses/${courseId}`);

        } catch (error) {
            alert('Error updating course: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading editor...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/courses/${courseId}`} className="text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Metadata</h1>
                </div>

                {/* Helper Link */}
                <Link
                    to={`/admin/courses/${courseId}/modules`} // Future link
                    className="text-xs font-bold text-primary flex items-center gap-2 hover:underline opacity-50 cursor-not-allowed"
                    title="Module editing is handled in the Curriculum Builder (Coming Soon)"
                >
                    <Layout size={14} /> Edit Curriculum Structure
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">

                {/* Core Info */}
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
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Visibility</label>
                        <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded border border-gray-100">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                                className="w-5 h-5 accent-black rounded border-gray-300"
                            />
                            <span className={`text-sm font-bold ${formData.is_published ? 'text-green-600' : 'text-orange-500'}`}>
                                {formData.is_published ? 'Currently Published' : 'Draft Mode (Hidden)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Info */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Short Summary</label>
                    <textarea
                        name="short_description"
                        rows="2"
                        value={formData.short_description || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Full Description</label>
                    <textarea
                        name="description"
                        rows="6"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y text-sm font-light leading-relaxed"
                    />
                </div>

                {/* Media */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Thumbnail URL</label>
                    <input
                        name="thumbnail_url"
                        value={formData.thumbnail_url || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-mono text-xs"
                    />
                    {formData.thumbnail_url && (
                        <div className="mt-2 w-full h-32 bg-gray-100 rounded overflow-hidden relative group">
                            <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest pointer-events-none">Image Preview</span>
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="pt-6 mt-8 border-t border-gray-100 flex justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('Delete course? This cannot be undone.')) {
                                // Logic would go here
                                alert('Delete functionality is in "Danger Zone" on details page.');
                            }
                        }}
                        className="px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div className="flex gap-3">
                        <Link
                            to={`/admin/courses/${courseId}`}
                            className="px-6 py-3 rounded-lg border border-gray-200 text-gray-500 font-bold text-sm tracking-wide hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-lg bg-black text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
