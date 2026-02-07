import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Trash2, Layout } from 'lucide-react';

export default function ModuleEditPage() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        week_number: 1,
        status: 'locked'
    });

    useEffect(() => {
        supabase.from('modules').select('*').eq('id', moduleId).single()
            .then(({ data, error }) => {
                if (data) setFormData(data);
                setLoading(false);
            });
    }, [moduleId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('modules').update({
                title: formData.title,
                week_number: formData.week_number,
                status: formData.status,
                updated_at: new Date().toISOString()
            }).eq('id', moduleId);

            if (error) throw error;
            navigate(-1); // Go back

        } catch (err) {
            alert('Error updating module: ' + err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading module...</div>;

    return (
        <div className="max-w-xl mx-auto py-12">
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Module</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Week Number</label>
                    <input
                        type="number"
                        value={formData.week_number}
                        onChange={e => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Module Title</label>
                    <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Global Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="locked">Locked (Default)</option>
                        <option value="unlocked">Unlocked (Open to All)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                        "Locked" means students must complete the previous week first.
                        "Unlocked" bypasses the sequence check (use carefully).
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Link
                        to={-1}
                        className="flex-1 py-3 text-center rounded-lg border border-gray-200 text-gray-500 font-bold text-sm tracking-wide hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3 rounded-lg bg-black text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
}
