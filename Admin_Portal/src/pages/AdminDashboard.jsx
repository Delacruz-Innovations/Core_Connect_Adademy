import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Users, UserCheck, BookOpen, GraduationCap,
    ClipboardList, Database, TrendingUp, ArrowRight,
    UserPlus, PlusCircle, CheckSquare, BrainCircuit,
    AlertCircle, RefreshCw
} from 'lucide-react';
import BrandedLoader from '../components/BrandedLoader';

const StatCard = ({ icon: Icon, label, value, loading }) => (
    <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Icon size={24} />
            </div>
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        {loading ? (
            <div className="h-9 w-24 bg-gray-100 animate-pulse mt-1"></div>
        ) : (
            <h3 className="text-3xl font-black mt-1 italic tracking-tight">{value}</h3>
        )}
    </div>
);

const QuickAction = ({ icon: Icon, label, color = "bg-primary", to }) => (
    <Link to={to} className={`${color} text-white p-6 flex flex-col items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-primary/5 group text-center`}>
        <Icon size={28} className="group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        leads: 0,
        registered: 0,
        students: 0,
        courses: 0,
        published_courses: 0,
        draft_courses: 0,
        enrollments: 0,
        pending: 0
    });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Counts in parallel
            const responses = await Promise.all([
                supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
                supabase.from('enrollments').select('*', { count: 'exact', head: true }),
                supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }).eq('reviewed_status', 'pending')
            ]);

            // Check for errors in any response
            const errors = responses.filter(r => r.error);
            if (errors.length > 0) {
                console.error("❌ Dashboard Fetch Errors:", errors);
                // If it's a 403, we know it's RLS or Auth
                if (errors.some(e => e.error.code === '42501' || e.error.status === 403)) {
                    console.error("🎯 RLS/Permissions Error Detected. Admin role might be missing or policy is broken.");
                }
            }

            const [leads, profiles, students, allCourses, publishedCourses, enrollments, pendingSubmissions] = responses;

            setStats({
                leads: leads.count || 0,
                registered: profiles.count || 0,
                students: students.count || 0,
                courses: allCourses.count || 0,
                published_courses: publishedCourses.count || 0,
                draft_courses: (allCourses.count || 0) - (publishedCourses.count || 0),
                enrollments: enrollments.count || 0,
                pending: pendingSubmissions.count || 0
            });

            // Fetch Recent Enrollments
            const { data: recentEnrollmentsData, error: enrollError } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    created_at,
                    status,
                    profiles:student_id (
                        full_name
                    ),
                    application:application_id (
                        program_interest
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (enrollError) {
                console.error("❌ Error fetching recent enrollments:", enrollError);
            }

            setRecentEnrollments(recentEnrollmentsData || []);

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProtocolRescue = async () => {
        const confirm = window.confirm("PROTOCOL RESCUE: This will mark ALL existing courses, modules, and lessons as 'Published'. It will also add placeholders for missing Video IDs to satisfy system requirements. Proceed?");
        if (!confirm) return;

        setLoading(true);
        try {
            // 1. First, satisfy Lesson validations (Mux IDs)
            console.log("Stage 1: Satisfying video constraints...");
            const { error: videoErr } = await supabase
                .from('lessons')
                .update({ mux_playback_id: 'RECOVERY_PLACEHOLDER' })
                .eq('content_type', 'video')
                .or('mux_playback_id.eq.,mux_playback_id.is.null');

            if (videoErr) throw videoErr;

            // 2. Publish all lessons
            console.log("Stage 2: Publishing Units...");
            const { error: lErr } = await supabase
                .from('lessons')
                .update({ is_published: true })
                .eq('is_published', false);
            if (lErr) throw lErr;

            // 3. Publish all modules
            console.log("Stage 3: Publishing Sections...");
            const { error: mErr } = await supabase
                .from('modules')
                .update({ is_published: true })
                .eq('is_published', false);
            if (mErr) throw mErr;

            // 4. Publish all courses
            console.log("Stage 4: Publishing Courses...");
            const { error: cErr } = await supabase
                .from('courses')
                .update({ is_published: true })
                .eq('is_published', false);
            if (cErr) throw cErr;

            alert("SYSTEM RESTORED: All curriculum nodes are now LIVE. Student accessibility has been restored.");
            fetchDashboardData();
        } catch (err) {
            console.error("Rescue Failed:", err);
            alert("Rescue Failed: " + (err.details || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <BrandedLoader message="Syncing Dashboard Metrics..." />;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">System Overview</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Dashboard</h1>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <button
                        onClick={fetchDashboardData}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                        Sync Data
                    </button>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Live Sync: Active
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard icon={Users} label="Total Leads" value={stats.leads} loading={loading} />
                <StatCard icon={UserCheck} label="Profiles" value={stats.registered} loading={loading} />
                <StatCard icon={GraduationCap} label="Students" value={stats.students} loading={loading} />
                <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live/Draft Courses</span>
                            <h3 className="text-3xl font-black mt-1 italic tracking-tight">{stats.published_courses}/{stats.draft_courses}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{stats.published_courses} LIVE</span>
                        </div>
                    </div>
                </div>
                <StatCard icon={ClipboardList} label="Enrollments" value={stats.enrollments} loading={loading} />
                <StatCard icon={CheckSquare} label="Pending Tasks" value={stats.pending} loading={loading} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Quick Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={UserPlus} label="Enrollments" to="/admin/enrolments" />
                        <QuickAction icon={PlusCircle} label="New Course" to="/admin/courses/new" />
                        <QuickAction icon={CheckSquare} label="Audit Logs" color="bg-secondary" to="/admin/audit-logs" />
                        <QuickAction icon={TrendingUp} label="Analytics" to="/admin/analytics" />
                        <QuickAction icon={BrainCircuit} label="AI Settings" color="bg-black" to="/admin/ai-knowledge" />
                    </div>

                    <div className="bg-primary/5 p-8 border border-primary/10">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-4">Real-time Metrics</h3>
                        <p className="text-xs text-gray-500 leading-relaxed italic mb-6">
                            Statistics are automatically synchronized with the Supabase database. RLS policies ensure that only authorized admins can see these figures.
                        </p>

                        {stats.draft_courses > 0 && (
                            <div className="pt-6 border-t border-primary/10">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Detected {stats.draft_courses} Restricted Courses</p>
                                <button
                                    onClick={handleProtocolRescue}
                                    className="w-full py-4 bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <AlertCircle size={14} /> Restore System Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-sm p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tight">Recent Activity</h2>
                        <Link to="/admin/audit-logs" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-black flex items-center gap-2 transition-colors">
                            View Audit Logs <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        {loading && recentEnrollments.length === 0 ? (
                            <div className="py-12 flex justify-center"><RefreshCw className="animate-spin text-gray-200" size={32} /></div>
                        ) : recentEnrollments.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No recent enrollments found</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Program</th>
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentEnrollments.map((row) => (
                                        <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 text-sm font-bold text-black">{row.profiles?.full_name || 'Generic Student'}</td>
                                            <td className="py-4 text-sm text-gray-500 font-medium">{row.application?.program_interest || 'Enrolled Course'}</td>
                                            <td className="py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                {new Date(row.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
