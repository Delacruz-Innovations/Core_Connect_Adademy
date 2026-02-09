import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, Mail, Shield, ShieldCheck,
    Calendar, CheckCircle2, GraduationCap,
    Unlock, Ban, Trash2, MailQuestion,
    Loader2, X, Plus, BookOpen, Activity,
    AlertTriangle, ShieldAlert
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import BrandedLoader from '../components/BrandedLoader';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [actioning, setActioning] = useState(false);
    const [showEnrolModal, setShowEnrolModal] = useState(false);
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [selectedOverride, setSelectedOverride] = useState(null);
    const [overrideReason, setOverrideReason] = useState('');
    const [recentActivity, setRecentActivity] = useState([]);

    const { showAlert } = useModal();

    useEffect(() => {
        fetchUserData();
        fetchAllCourses();
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setUser(profile);

            // Fetch Enrollments
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('*, courses(id, title)')
                .eq('student_id', id);

            if (enrollError) throw enrollError;
            setEnrolledCourses(enrollments || []);

            // Fetch Progress
            const { data: progress, error: progressError } = await supabase
                .from('module_progress')
                .select('*, modules(title, week_number, course_id)')
                .eq('user_id', id);

            if (progressError) throw progressError;
            setProgressData(progress || []);

            // Fetch Recent Lesson Activity
            const { data: recents, error: recentError } = await supabase
                .from('lesson_progress')
                .select('*, lessons(title, module_id, modules(title))')
                .eq('user_id', id)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (recentError) console.error("Error fetching recents:", recentError);
            setRecentActivity(recents || []);

        } catch (err) {
            console.error('Error fetching user detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title').eq('is_published', true);
        setAllCourses(data || []);
    };

    const handleToggleEnrolment = async (courseId, alreadyEnrolled) => {
        setActioning(true);
        try {
            const { error } = await supabase.rpc('toggle_enrollment', {
                target_student_id: id,
                target_course_id: courseId,
                enrol_action: alreadyEnrolled ? 'unenrol' : 'enrol'
            });

            if (error) throw error;

            await fetchUserData(); // Refresh lists
        } catch (err) {
            console.error('Toggle enrollment error:', err);
            await showAlert(err.message, 'Enrollment Error', 'error');
        } finally {
            setActioning(false);
        }
    };

    const handleOverrideProgress = async () => {
        if (!overrideReason) {
            await showAlert('A valid reason is mandatory for manual progression overrides.', 'Audit Requirement', 'warning');
            return;
        }

        setActioning(true);
        try {
            const { error } = await supabase.rpc('admin_override_progress', {
                p_user_id: id,
                p_entity_type: 'module',
                p_entity_id: selectedOverride.module_id,
                p_status: 'completed',
                p_reason: overrideReason
            });

            if (error) throw error;

            setShowOverrideModal(false);
            setOverrideReason('');
            await fetchUserData();
            await showAlert('Student progression has been manually advanced. Event logged to audit registry.', 'Override Successful', 'success');
        } catch (err) {
            console.error('Override error:', err);
            await showAlert(err.message, 'Override Failed', 'error');
        } finally {
            setActioning(false);
        }
    };

    if (loading) return <BrandedLoader message="Accessing Profile Node..." />;

    if (!user) return (
        <div className="p-20 text-center uppercase tracking-[0.4em] font-black text-gray-400">
            User Node Not Found
        </div>
    );

    return (
        <div className="space-y-12">
            {actioning && <BrandedLoader message="Processing Node Action..." />}
            {/* Header */}
            <div className="flex items-center gap-8">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">User Identification: #{id.substring(0, 8)}</span>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-gray-900">
                        Profile <span className="text-primary">Node</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Profile Summary */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                        <div className="w-24 h-24 bg-black text-primary flex items-center justify-center font-black italic text-2xl mx-auto mb-6 shadow-xl">
                            {user.full_name ? user.full_name.substring(0, 1) : user.username?.[0] || 'U'}
                        </div>
                        <h2 className="text-2xl font-black italic mb-2 uppercase tracking-tight">{user.full_name || user.username}</h2>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mb-8">
                            <Shield size={14} className="text-primary" /> {user.role} Account
                        </p>

                        <div className="space-y-4 border-t border-gray-50 pt-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-300">Status</span>
                                <span className="text-green-500 bg-green-50 px-2 py-0.5">Active</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-300">Email</span>
                                <span className="text-gray-900 lowercase">{user.email || 'None'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-300">Joined</span>
                                <span className="text-gray-600 italic leading-none">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 block border-b border-gray-50 pb-4">Account Control</h3>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            <MailQuestion size={16} /> Resend verification
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-black hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            <Unlock size={16} /> Force Password Reset
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            <Ban size={16} /> Suspend Account
                        </button>
                    </div>
                </div>

                {/* Right Column: Enrolments & History */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Enrolled Courses */}
                    <div className="bg-white border border-gray-100 shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 text-gray-900">
                                <GraduationCap className="text-primary" /> Active Enrolments
                            </h3>
                            <button
                                onClick={() => setShowEnrolModal(true)}
                                className="bg-black text-white px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                            >
                                <Plus size={14} /> Assign New Track
                            </button>
                        </div>
                        <div className="p-8 overflow-x-auto min-h-[300px]">
                            {enrolledCourses.length === 0 ? (
                                <div className="py-20 text-center">
                                    <BookOpen size={48} className="mx-auto text-gray-100 mb-4" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No tracks assigned to this node</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Enrolled Track</th>
                                            <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date Node Verified</th>
                                            <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Access Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {enrolledCourses.map((enrollment) => (
                                            <tr key={enrollment.id} className="group hover:bg-gray-50/70 transition-colors">
                                                <td className="py-6">
                                                    <p className="font-black text-xs text-gray-900 uppercase italic tracking-tight">{enrollment.courses?.title || 'Unknown'}</p>
                                                </td>
                                                <td className="py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {new Date(enrollment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-6 text-right">
                                                    <span className={`inline-block px-4 py-2 text-[9px] font-black uppercase tracking-widest border ${enrollment.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                        {enrollment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Progression Audit Board */}
                    <div className="bg-white border border-gray-100 shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 text-gray-900">
                                <Activity className="text-primary" /> Progression Audit
                            </h3>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {progressData.length} active nodes
                            </div>
                        </div>
                        <div className="p-8">
                            {progressData.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No progression telemetry detected</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {progressData
                                        .sort((a, b) => (a.modules?.week_number || 0) - (b.modules?.week_number || 0))
                                        .map((prog) => (
                                            <div key={prog.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all">
                                                <div className="mb-4 md:mb-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Week {prog.modules?.week_number}</span>
                                                        <h4 className="font-black text-xs uppercase italic tracking-tight text-gray-900">{prog.modules?.title}</h4>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Course Registry: {enrolledCourses.find(e => e.course_id === prog.modules?.course_id)?.courses?.title || 'External Logic'}</p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${prog.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                                                            }`}>
                                                            {prog.status}
                                                        </span>
                                                        <div className="w-32 bg-gray-100 h-1 overflow-hidden">
                                                            <div className={`h-full transition-all duration-1000 ${prog.status === 'completed' ? 'bg-green-500 w-full' : 'bg-orange-500 w-[50%]'
                                                                }`}></div>
                                                        </div>
                                                    </div>

                                                    {prog.status !== 'completed' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOverride(prog);
                                                                setShowOverrideModal(true);
                                                            }}
                                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 transition-all group/btn"
                                                            title="Manual Override"
                                                        >
                                                            <ShieldCheck size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Learning Activity */}
                    <div className="bg-white border border-gray-100 shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 text-gray-900">
                                <Activity className="text-primary" /> Learning Telemetry
                            </h3>
                        </div>
                        <div className="p-8">
                            {recentActivity.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No learning session data found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((act) => (
                                        <div key={act.lesson_id} className="flex items-center justify-between p-4 border border-gray-50 bg-[#fafafa]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-[10px]">
                                                    {act.percent_watched}%
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xs uppercase text-gray-900 leading-tight mb-1">{act.lessons?.title}</h4>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                        <span>{act.lessons?.modules?.title}</span>
                                                        <span>•</span>
                                                        <span>{new Date(act.updated_at).toLocaleTimeString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${act.is_completed ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                                    }`}>
                                                    {act.is_completed ? 'Mastered' : 'In Progress'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-8 border border-gray-100 italic">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Admin Intelligence Notes</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-bold tracking-tight">
                                This node has been authorized for manual override. All track assignments are logged via the master audit system.
                            </p>
                        </div>
                        <div className="bg-white p-8 border border-gray-100 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Security Signature</h4>
                            <ul className="space-y-4">
                                <li className="text-[10px] font-bold text-gray-400 flex justify-between">
                                    <span>System UID:</span>
                                    <span className="text-black font-black">{id.substring(0, 18)}...</span>
                                </li>
                                <li className="text-[10px] font-bold text-gray-400 flex justify-between">
                                    <span>Auth Provider:</span>
                                    <span className="text-black font-black capitalize">{user.role || 'User'} Entry</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>

            {/* Manage Enrolments Modal */}
            {
                showEnrolModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-white w-full max-w-2xl shadow-2xl border-t-8 border-primary animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-black text-white px-10">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Track Allocation System</h3>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Node ID: {user.username || user.email}</p>
                                </div>
                                <button onClick={() => setShowEnrolModal(false)} className="p-2 hover:rotate-90 transition-transform">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-10">
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                    {allCourses.map(course => {
                                        const isEnrolled = enrolledCourses.some(e => e.course_id === course.id);
                                        return (
                                            <div
                                                key={course.id}
                                                className={`flex items-center justify-between p-5 border transition-all ${isEnrolled ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-transparent hover:border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center text-white font-black italic ${isEnrolled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400'}`}>
                                                        {course.title[0]}
                                                    </div>
                                                    <span className={`text-sm font-black uppercase italic tracking-tight ${isEnrolled ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {course.title}
                                                    </span>
                                                </div>

                                                <button
                                                    disabled={actioning}
                                                    onClick={() => handleToggleEnrolment(course.id, isEnrolled)}
                                                    className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${isEnrolled
                                                        ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white'
                                                        : 'bg-black text-white hover:bg-primary shadow-lg'
                                                        }`}
                                                >
                                                    {actioning ? <Loader2 className="animate-spin" size={12} /> : isEnrolled ? 'Revoke Access' : 'Grant Access'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setShowEnrolModal(false)}
                                        className="bg-gray-100 text-gray-500 px-10 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all underline decoration-primary decoration-4 underline-offset-8"
                                    >
                                        Finish Reconciliation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Manual Override Modal */}
            {
                showOverrideModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <div className="bg-white w-full max-w-md shadow-2xl border-t-8 border-primary animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-black text-white px-10">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Override Protocol</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Node: {selectedOverride?.modules?.title}</p>
                                </div>
                                <button onClick={() => setShowOverrideModal(false)} className="p-2 hover:rotate-90 transition-transform">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="bg-orange-50 p-6 border border-orange-100 italic">
                                    <p className="text-[11px] text-orange-800 font-bold leading-relaxed tracking-tight">
                                        <AlertTriangle size={14} className="inline mr-2 mb-1" />
                                        Warning: Manual progression bypasses all deterministic completion checks (video thresholds, assignments). This action is permanent and auditable.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">Mandatory Auditor Reason</label>
                                    <textarea
                                        required
                                        value={overrideReason}
                                        onChange={(e) => setOverrideReason(e.target.value)}
                                        placeholder="e.g., Technical error in video stream / Manual assessment verified..."
                                        className="w-full bg-gray-50 border border-gray-100 p-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all h-32 outline-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowOverrideModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-500 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                                    >
                                        Abort Action
                                    </button>
                                    <button
                                        onClick={handleOverrideProgress}
                                        disabled={actioning || !overrideReason}
                                        className="flex-1 bg-primary text-white py-4 font-black text-[10px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {actioning ? 'Syncing...' : 'Confirm Override'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserDetail;
