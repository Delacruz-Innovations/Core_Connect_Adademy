import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, Globe, Shield, Settings, Layers, Video, Link2, ExternalLink, Trash2, Edit3, ArrowLeft, BookOpen, FileText, Eye, Users, ChevronRight, Search, Clock, CheckCircle, BarChart3, Layout, AlertTriangle } from 'lucide-react';
import CourseStatusPanel from './CourseStatusPanel';
import DocumentManager from '../../components/documents/DocumentManager';
import BrandedLoader from '../../components/BrandedLoader';
import StudentProgressModal from '../../components/StudentProgressModal';
import { useModal } from '../../context/ModalContext';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('architecture'); // 'architecture', 'cohort', 'settings'

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            // Get Course with nested modules and lessons
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select(`
                    *,
                    modules (
                        *,
                        lessons (id, title, video_path, is_published, thumbnail_url)
                    )
                `)
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            // Fetch Students Analytics
            const { data: studentsData, error: studentError } = await supabase
                .rpc('get_course_students_progress', { p_course_id: courseId });

            if (studentError) console.error('Analytics Error:', studentError); // Don't block main page load

            // Sort modules by week_number manually because Supabase's nested ordering can be tricky
            if (courseData.modules) {
                courseData.modules.sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
            }

            setCourse(courseData);
            setModules(courseData.modules || []);
            setStudents(studentsData || []);

        } catch (err) {
            console.error('Error fetching course:', err);
            await showAlert('Failed to load course details.', 'Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ is_published: newStatus === 'Published' })
                .eq('id', courseId);

            if (error) throw error;
            fetchData();
        } catch (error) {
            await showAlert('Error updating status: ' + error.message, 'Error', 'error');
        }
    };

    const handleDelete = async () => {
        if (!await showConfirm('PROTOCOL OVERRIDE: Are you sure? This will permanently terminate the course entity and all hierarchical children.', 'System Warning')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;
            await showAlert('Course deleted', 'Success', 'success');
            navigate('/admin/courses');
        } catch (err) {
            console.error('Error deleting course:', err);
            await showAlert('Failed to delete course.', 'Error', 'error');
        }
    };

    if (loading) return <BrandedLoader message="Accessing Core Identity Hub..." />;
    if (!course) return <div className="p-24 text-center text-red-500 font-bold">CRITICAL ERROR: COURSE ENTITY NOT RESOLVED</div>;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">

            {/* Header Identity Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/courses" className="text-gray-400 hover:text-primary transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest border ${course.is_published
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                            {course.is_published ? 'Network Live' : 'Draft Mode'}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-sm uppercase tracking-widest">
                            {course.level || 'Professional'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">
                        {course.title}
                    </h1>
                </div>

                <div className="flex gap-3">
                    <Link
                        to={`/admin/courses/${courseId}/review`}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 px-5 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                    >
                        <Eye size={14} /> View Live
                    </Link>
                    <Link
                        to={`/admin/courses/${courseId}/edit`}
                        className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-5 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        <Edit3 size={14} /> Edit Metadata
                    </Link>
                </div>
            </div>

            {/* High Level Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">{students.length}</span>
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Enrolled</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Rate</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">
                            {students.length > 0
                                ? Math.round((students.filter(s => s.progress_percent > 0 && s.progress_percent < 100).length / students.length) * 100)
                                : 0}%
                        </span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">Engagement</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle size={64} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completion</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">
                            {students.filter(s => s.progress_percent === 100).length}
                        </span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Certified</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers size={64} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scale</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">{course.modules?.length || 0}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Modules</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Tabs */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm min-h-[600px]">
                <div className="border-b border-gray-100 flex overflow-x-auto">
                    <TabButton id="architecture" label="Architecture" icon={Layout} />
                    <TabButton id="cohort" label="Cohort Data" icon={Users} />
                    <TabButton id="settings" label="Settings & Assets" icon={Settings} />
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'architecture' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Curriculum Structure</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Manage modules, lessons, and content hierarchy.</p>
                                </div>
                                <Link
                                    to={`/admin/courses/${courseId}/modules`}
                                    className="px-5 py-2.5 bg-primary text-white text-[10px] font-black rounded-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg"
                                >
                                    + Architect Module
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {course.modules && course.modules.length > 0 ? (
                                    course.modules.map((mod) => (
                                        <details key={mod.id} className="group bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-300 transition-all">
                                            <summary className="flex justify-between items-center p-5 cursor-pointer list-none select-none bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-5">
                                                    {mod.thumbnail_url ? (
                                                        <img src={mod.thumbnail_url} alt="" className="w-10 h-10 object-cover rounded-sm border border-gray-200 shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-sm flex items-center justify-center font-black text-xs text-gray-900 shadow-sm">
                                                            W{mod.week_number}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors block">{mod.title}</span>
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter border ${mod.is_published ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                                                {mod.is_published ? 'Live' : 'Draft'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mod.lessons?.length || 0} Units • ~{(mod.lessons?.length || 0) * 15}m Run-time</span>
                                                    </div>
                                                </div>
                                                <div className="text-gray-300 group-open:rotate-180 transition-transform">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </summary>
                                            <div className="p-5 border-t border-gray-100 space-y-2">
                                                {mod.lessons && mod.lessons.map((lesson, idx) => (
                                                    <div key={lesson.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-sm border border-transparent hover:border-gray-200 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-gray-300 w-6">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                                            {lesson.thumbnail_url && <img src={lesson.thumbnail_url} alt="" className="w-6 h-6 object-cover rounded-[1px] border border-gray-200" />}
                                                            <span className="text-xs font-bold text-gray-700">{lesson.title}</span>
                                                            <span className={`text-[7px] font-black px-1 py-0.5 rounded-[1px] uppercase tracking-tighter border ${lesson.is_published ? 'bg-green-50 text-green-500 border-green-100' : 'bg-white text-gray-300 border-gray-100'}`}>
                                                                {lesson.is_published ? 'Live' : 'Draft'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {lesson.video_path ?
                                                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-sm uppercase border border-green-100">Ready</span> :
                                                                <span className="text-[9px] font-black text-red-400 bg-red-50 px-2 py-0.5 rounded-sm uppercase border border-red-100">Empty</span>
                                                            }
                                                            <Link to={`/admin/lessons/${lesson.id}/edit`} className="text-gray-300 hover:text-black transition-colors">
                                                                <Settings size={14} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="pt-4 flex justify-between items-center">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { error } = await supabase.from('lessons').update({ is_published: true }).eq('module_id', mod.id);
                                                                if (error) throw error;
                                                                fetchData();
                                                            } catch (err) {
                                                                showAlert('Bulk publish failed: ' + err.message, 'Error', 'error');
                                                            }
                                                        }}
                                                        className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                                                    >
                                                        ϟ Bulk Publish Lessons
                                                    </button>
                                                    <Link to={`/admin/modules/${mod.id}/lessons`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                                        Manage Detailed Content →
                                                    </Link>
                                                </div>
                                            </div>
                                        </details>
                                    ))
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-sm">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No modules defined</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cohort' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Active Cohort</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Real-time student progress and engagement logs.</p>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH IDENTITY..."
                                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-sm text-[10px] font-bold uppercase tracking-wide focus:outline-none focus:border-primary w-full transition-all"
                                    />
                                </div>
                            </div>

                            {students.length === 0 ? (
                                <div className="py-20 text-center bg-gray-50/50 rounded-sm border border-gray-100">
                                    <Users size={32} className="text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase">Cohort Empty</h3>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-100 rounded-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Student</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Progress</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Current Module</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Last Active</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">View</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 bg-white">
                                            {students.map((student) => (
                                                <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => {
                                                    setSelectedStudentId(student.student_id);
                                                    setIsModalOpen(true);
                                                }}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center font-black text-[10px] text-gray-500 uppercase">
                                                                {student.full_name?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{student.full_name}</p>
                                                                <p className="text-[9px] text-gray-400">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 w-1/4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                                                                <div className={`h-full ${student.progress_percent === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${student.progress_percent}%` }} />
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-500">{student.progress_percent}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">{student.current_module_title || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${student.last_active_at ? 'bg-green-400' : 'bg-gray-300'}`} />
                                                            {student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : 'Inactive'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Eye size={14} className="text-gray-300 group-hover:text-black inline-block" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Course Assets</h3>
                                    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Thumbnail Identity</h4>
                                        <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden relative group">
                                            <img
                                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&w=1200&q=80'}
                                                alt="Course Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/courses/${courseId}/edit`} className="text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/30 rounded-sm hover:bg-white hover:text-black transition-all">
                                                    Update Asset
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Document Vault</h4>
                                        <DocumentManager parentType="course" parentId={courseId} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Operations</h3>
                                    <CourseStatusPanel
                                        status={course.is_published ? 'Published' : 'Draft'}
                                        onStatusChange={handleStatusChange}
                                    />
                                    <div className="border border-red-200 bg-red-50/10 rounded-sm p-6 space-y-4">
                                        <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-2">
                                            <AlertTriangle size={14} /> Danger Zone
                                        </h4>
                                        <p className="text-[10px] text-red-600/70 font-medium">
                                            Permanently delete this course and all associated data. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Delete Course
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <StudentProgressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studentId={selectedStudentId}
                courseId={courseId}
            />
        </div>
    );
}
