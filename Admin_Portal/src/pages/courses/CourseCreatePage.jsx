import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Check, Save } from 'lucide-react';

export default function CourseCreatePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        short_description: '',
        level: 'Beginner',
        thumbnail_url: '',
        is_published: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSlugGen = () => {
        const slug = formData.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id || null;

            const { data, error } = await supabase
                .from('courses')
                .insert([{
                    ...formData,
                    author_id: userId
                }])
                .select()
                .single();

            if (error) throw error;
            navigate(`/admin/courses/${data.id}`);

        } catch (error) {
            alert('Error creating course: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8 flex items-center gap-4">
                <Link to="/admin/courses" className="text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create New Course</h1>
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
                            onBlur={handleSlugGen}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                            placeholder="e.g. Introduction to React Development"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">URL Slug (Generated)</label>
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
                        <p className="text-[10px] text-gray-400 mt-1">This will be the public URL for the course.</p>
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
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Status</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                                className="w-5 h-5 accent-black rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Publish immediately?</span>
                        </div>
                    </div>
                </div>

                {/* Content Info */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Short Summary (For Cards)</label>
                    <textarea
                        name="short_description"
                        rows="2"
                        value={formData.short_description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-none text-sm"
                        placeholder="Brief overview..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Full Description</label>
                    <textarea
                        name="description"
                        rows="6"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y text-sm font-light leading-relaxed"
                        placeholder="Comprehensive details about the curriculum..."
                    />
                </div>

                {/* Media */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Thumbnail URL</label>
                    <input
                        name="thumbnail_url"
                        value={formData.thumbnail_url}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-mono text-xs"
                        placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Paste a direct link to an image hosted on Unsplash, Cloudinary, etc.</p>
                </div>

                {/* Action Bar */}
                <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end gap-3">
                    <Link
                        to="/admin/courses"
                        className="px-6 py-3 rounded-lg border border-gray-200 text-gray-500 font-bold text-sm tracking-wide hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-lg bg-black text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={16} /> Create Course
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
