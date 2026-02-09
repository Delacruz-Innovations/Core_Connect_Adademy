import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FileText, UploadCloud, Trash2, Eye,
    EyeOff, Plus, Info, AlertCircle, CheckCircle,
    Download, Loader2, FileDown
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';

/**
 * Reusable Resource Management component for Course, Module, and Lesson contexts.
 * Adheres to the v2 Resources & Document Reflection System PRD.
 */
export default function DocumentManager({ parentType, parentId }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);

    const { showAlert, showConfirm } = useModal();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resource_type: 'reference',
        visibility_status: 'draft'
    });

    const [file, setFile] = useState(null);

    useEffect(() => {
        if (parentId) {
            fetchResources();
        }
    }, [parentId, parentType]);

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('parent_type', parentType)
                .eq('parent_id', parentId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResources(data || []);
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            await showAlert('Please select a file', 'Error', 'error');
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const adminId = user?.id || null;

            // 1. Storage Upload
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;

            // PRD Structured Path: /courses/{course_id}/resources/ | /modules/{module_id}/resources/ | /lessons/{lesson_id}/resources/
            const storagePath = `${parentType}s/${parentId}/resources/${fileName}`;

            const { error: storageError } = await supabase.storage
                .from('lms-resources')
                .upload(storagePath, file);

            if (storageError) throw storageError;

            // 2. Database Record
            const { error: dbError } = await supabase.from('resources').insert({
                title: formData.title,
                description: formData.description,
                resource_type: formData.resource_type,
                parent_type: parentType,
                parent_id: parentId,
                file_path: storagePath,
                visibility_status: formData.visibility_status,
                created_by: adminId
            });

            if (dbError) {
                // Cleanup storage if DB fails
                await supabase.storage.from('lms-resources').remove([storagePath]);
                throw dbError;
            }

            // Reset
            setIsAddMode(false);
            setFile(null);
            setFormData({ title: '', description: '', resource_type: 'reference', visibility_status: 'draft' });
            fetchResources();
            await showAlert('Resource uploaded and attached successfully!', 'Success', 'success');
        } catch (err) {
            await showAlert('Failure: ' + err.message, 'Error', 'error');
        } finally {
            setUploading(false);
        }
    };

    const toggleVisibility = async (res) => {
        const newStatus = res.visibility_status === 'published' ? 'draft' : 'published';
        try {
            const { error } = await supabase
                .from('resources')
                .update({ visibility_status: newStatus })
                .eq('id', res.id);
            if (error) throw error;
            fetchResources();
            await showAlert(`Resource visibility changed to ${newStatus}.`, 'Success', 'success');
        } catch (err) {
            await showAlert(err.message, 'Error', 'error');
        }
    };

    const handleDelete = async (res) => {
        if (!await showConfirm('PROTOCOL OVERRIDE: Permanently terminate this resource node?')) return;
        try {
            // 1. Remove from Storage
            await supabase.storage.from('lms-resources').remove([res.file_path]);
            // 2. Remove from DB
            const { error } = await supabase.from('resources').delete().eq('id', res.id);
            if (error) throw error;
            fetchResources();
        } catch (err) {
            await showAlert(err.message, 'Deletion Error', 'error');
        }
    };

    const handleDownload = async (path, title) => {
        try {
            const { data, error } = await supabase.storage
                .from('lms-resources')
                .createSignedUrl(path, 60);

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) {
            console.error('Download failed:', err);
            await showAlert('Access denied or link expired.', 'Download Failed', 'error');
        }
    };

    if (loading) return <div className="p-4 flex gap-2 items-center text-gray-400 font-bold text-[10px] uppercase animate-pulse"><Loader2 className="animate-spin" size={14} /> Synchronizing Resource Node...</div>;

    return (
        <div className="space-y-4">

            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Info size={14} /> Repository: {parentType} Resources
                </h3>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="p-1 px-3 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                >
                    {isAddMode ? 'Abort' : '+ Attach Resource'}
                </button>
            </div>

            {/* Add Mode */}
            {isAddMode && (
                <form onSubmit={handleUpload} className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-black"
                                    placeholder="Resource Name..."
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Resource Type</label>
                                <select
                                    value={formData.resource_type}
                                    onChange={e => setFormData({ ...formData, resource_type: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none uppercase tracking-widest"
                                >
                                    <option value="reference">Reference Material</option>
                                    <option value="instruction">Instructions</option>
                                    <option value="assignment_support">Assignment Support</option>
                                    <option value="policy">Policy / Rules</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Visibility Status</label>
                                <select
                                    value={formData.visibility_status}
                                    onChange={e => setFormData({ ...formData, visibility_status: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none uppercase tracking-widest"
                                >
                                    <option value="draft">Draft (Admin Only)</option>
                                    <option value="published">Published (Learner Live)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">Attachment Source</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    className="w-full text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-black file:text-white file:uppercase hover:file:brightness-110"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Reflection Verification</span>
                            <span className="text-[10px] font-bold text-gray-600 italic">This will appear in the {parentType === 'course' ? 'Course Overview' : parentType === 'module' ? 'Module View' : 'Lesson Player'} for students.</span>
                        </div>
                        <CheckCircle className="text-primary/40" size={16} />
                    </div>
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        {uploading ? 'Processing Data Node...' : 'Commit Attachment'}
                    </button>
                </form>
            )}

            {/* List */}
            <div className="space-y-2">
                {resources.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/50 border border-gray-100 rounded-2xl italic text-[10px] text-gray-300 uppercase tracking-widest">
                        Resource Repository Empty
                    </div>
                ) : (
                    resources.map(res => (
                        <div key={res.id} className="flex justify-between items-center p-3 px-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-black text-gray-900 group-hover:text-black transition-colors truncate">{res.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">
                                            {res.resource_type}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${res.visibility_status === 'published' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                            {res.visibility_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button
                                    onClick={() => handleDownload(res.file_path, res.title)}
                                    className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                    title="Verify Download"
                                >
                                    <FileDown size={14} />
                                </button>
                                <button
                                    onClick={() => toggleVisibility(res)}
                                    className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
                                    title={res.visibility_status === 'published' ? 'Draft Protocol' : 'Deploy Protocol'}
                                >
                                    {res.visibility_status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(res)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Terminate Node"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
