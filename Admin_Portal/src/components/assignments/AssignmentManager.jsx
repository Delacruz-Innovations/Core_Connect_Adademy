import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../context/ModalContext';
import { ClipboardList, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AssignmentManager({ parentType, parentId }) {
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [assignment, setAssignment] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        brief: '',
        submission_required: true,
        allowed_file_types: ['pdf', 'doc', 'docx']
    });

    useEffect(() => {
        if (parentId) {
            fetchAssignment();
        }
    }, [parentId, parentType]);

    const fetchAssignment = async () => {
        setLoading(true);
        try {
            const query = supabase.from('assignments').select('*');
            if (parentType === 'module') {
                query.eq('module_id', parentId).eq('parent_type', 'module');
            } else {
                query.eq('lesson_id', parentId).eq('parent_type', 'lesson');
            }

            const { data, error } = await query.maybeSingle();
            if (error) throw error;

            if (data) {
                setAssignment(data);
                setFormData({
                    title: data.title,
                    brief: data.brief,
                    submission_required: data.submission_required,
                    allowed_file_types: data.allowed_file_types || ['pdf', 'doc', 'docx']
                });
            } else {
                setAssignment(null);
                setFormData({
                    title: '',
                    brief: '',
                    submission_required: true,
                    allowed_file_types: ['pdf', 'doc', 'docx']
                });
            }
        } catch (err) {
            console.error('Error fetching assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.brief) {
            showAlert('Please provide both a title and a brief for the assignment.', 'Validation Error', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            const payload = {
                title: formData.title.trim(),
                brief: formData.brief.trim(),
                submission_required: formData.submission_required,
                allowed_file_types: formData.allowed_file_types,
                parent_type: parentType,
                updated_at: new Date().toISOString()
            };

            if (parentType === 'module') payload.module_id = parentId;
            else payload.lesson_id = parentId;

            if (assignment) {
                const { error } = await supabase
                    .from('assignments')
                    .update(payload)
                    .eq('id', assignment.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('assignments')
                    .insert({ ...payload, created_by: userId });
                if (error) throw error;
            }

            await fetchAssignment();
            showAlert('Assignment protocol updated successfully.', 'Sync Complete', 'success');
        } catch (err) {
            showAlert('Failed to save assignment: ' + err.message, 'System Error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-8 gap-3 animate-pulse">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Syncing Assignment Hub...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Assignment Title</label>
                    <input
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-bold text-xs"
                        placeholder="e.g. Master Stakeholder Interview"
                    />
                </div>

                <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Pedagogical Brief</label>
                    <textarea
                        rows="4"
                        value={formData.brief}
                        onChange={e => setFormData({ ...formData, brief: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-black font-medium text-xs leading-relaxed resize-none"
                        placeholder="Outline the submission requirements..."
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Mandatory Protocol</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Enforce as progression gate</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, submission_required: !formData.submission_required })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.submission_required ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.submission_required ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5"
            >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {assignment ? 'Update Assignment' : 'Initialize Assignment'}
            </button>
        </div>
    );
}
