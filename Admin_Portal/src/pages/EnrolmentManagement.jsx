import LeadsList from '../components/LeadsList';
import ApplicationsList from '../components/ApplicationsList';
import {
    PlusCircle, Search, UserPlus,
    BookOpen, Calendar, ArrowRight,
    Filter, CheckCircle2, History, List,
    UserSearch, RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import BrandedLoader from '../components/BrandedLoader';
import { Link } from 'react-router-dom';
import { sendEmail } from '@shared/lib/emailService';

const EnrolmentManagement = () => {
    const [activeTab, setActiveTab] = useState('leads');
    const [courses, setCourses] = useState([]);
    const [manualForm, setManualForm] = useState({
        fullName: '',
        email: '',
        courses: [], // Array for multi-select
        accessType: 'Full Access',
        startDate: new Date().toISOString().split('T')[0]
    });
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title').eq('is_published', true);
        setCourses(data || []);
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    created_at,
                    status,
                    payment_status,
                    profiles:student_id (
                        full_name
                    ),
                    application:application_id (
                        program_interest
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching enrollment history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleManualEnrol = async (e) => {
        e.preventDefault();

        if (manualForm.courses.length === 0) {
            await showAlert("Please select at least one course for manual enrollment.", "Selection Needed", "warning");
            return;
        }

        try {
            // 1. Get current Admin ID
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Resolve Course IDs from the array
            const selectedCourseIds = manualForm.courses;

            // 3. Create Application Record as a 'record of intent'
            const { data: newApp, error: appError } = await supabase
                .from('applications')
                .insert({
                    full_name: manualForm.fullName,
                    email: manualForm.email,
                    username: manualForm.email.split('@')[0] + Math.floor(Math.random() * 1000),
                    program_interest: 'Mentorship Program',
                    requested_course_id: selectedCourseIds[0], // Use first as primary for schema legacy
                    assigned_course_ids: selectedCourseIds,
                    status: 'approved',
                    discovery_source: 'Manual Admin Enrolment',
                    job_role: 'Student',
                    country: 'Unknown',
                    city: 'Unknown',
                    postcode: '0000',
                    phone: '0000000000',
                    motivation_text: `Manually enrolled by administrator in ${selectedCourseIds.length} tracks.`,
                    computer_literacy_score: 10,
                    admin_id: user?.id
                })
                .select()
                .single();

            if (appError) throw appError;

            // 4. Invite user via Auth to trigger verification/password setup
            console.log('Inviting student via Auth...');
            const { createClient } = await import('@supabase/supabase-js');
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const tempPassword = Math.random().toString(36).slice(-12) + "Tt1!";
            const siteUrl = import.meta.env.VITE_STUDENT_PORTAL_URL || 'https://coreconnectacademy.com';
            const studentPortalUrl = `${siteUrl}/set-password`;

            const { error: signUpError } = await tempClient.auth.signUp({
                email: manualForm.email,
                password: tempPassword,
                options: {
                    emailRedirectTo: studentPortalUrl,
                    data: {
                        full_name: manualForm.fullName,
                        role: 'student'
                    }
                }
            });

            if (signUpError && !signUpError.message.includes('already registered')) {
                throw signUpError;
            }

            // 5. Call the multi-course RPC 'approve_application'
            const { error: rpcError } = await supabase.rpc('approve_application', {
                target_application_id: newApp.id,
                final_course_ids: selectedCourseIds // Send the array!
            });

            if (rpcError) throw rpcError;

            // Trigger Welcome Email
            sendEmail(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_STUDENT_WELCOME,
                {
                    student_name: manualForm.fullName,
                    course_name: courses.find(c => c.id === selectedCourseIds[0])?.title || 'your chosen track',
                    module_one_name: 'Introduction to the Course',
                    student_email: manualForm.email
                }
            ).catch(err => console.error('Welcome email failed:', err));

            await showAlert(`Successfully enrolled ${manualForm.fullName} in ${selectedCourseIds.length} courses!`, "Enrollment Success", "success"); // Replaced alert

            // Reset form
            setManualForm({
                fullName: '',
                email: '',
                courses: [],
                accessType: 'Full Access',
                startDate: new Date().toISOString().split('T')[0]
            });

        } catch (error) {
            console.error('Enrolment error:', error);
            await showAlert(`Error enrolling student: ${error.message}`, "Enrollment Error", "error"); // Replaced alert
        }
    };


    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Student Admissions</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Enrolments</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 space-x-8">
                <button
                    onClick={() => setActiveTab('leads')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    New Leads
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Program Applications
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Manual Enrolment
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-black'}`}
                >
                    Enrolment History
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[60vh]">

                {/* New Leads Tab */}
                {activeTab === 'leads' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-black text-white p-8 border border-black shadow-xl">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tight">Active Pipeline</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Granular Follow-up & Engagement Tracking</p>
                            </div>
                            <Link
                                to="/admin/leads-pipeline"
                                className="bg-primary text-black px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                            >
                                Launch Pipeline View <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="bg-white border border-gray-100 shadow-xl p-10">
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Visitor Leads (Stage 1)</h2>
                            <LeadsList />
                        </div>
                    </div>
                )}

                {/* Pending Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="">
                        <div className="bg-white border border-gray-100 shadow-xl p-10">
                            <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Deep Enrollment (Stage 2)</h2>
                            <ApplicationsList />
                        </div>
                    </div>
                )}

                {/* Manual Enrolment Tab */}
                {activeTab === 'manual' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="bg-white border border-gray-100 shadow-xl p-10">
                                <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Enrol Student Manually</h2>

                                <form className="space-y-6" onSubmit={handleManualEnrol}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={manualForm.fullName}
                                                onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={manualForm.email}
                                                onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                placeholder="student@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Select Tracks (Multi-Select)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                            {courses.map(course => (
                                                <label
                                                    key={course.id}
                                                    className={`flex items-center gap-3 p-4 border transition-all cursor-pointer ${manualForm.courses.includes(course.id)
                                                        ? 'bg-black border-black text-white shadow-lg'
                                                        : 'bg-gray-50 border-transparent hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 border flex items-center justify-center ${manualForm.courses.includes(course.id) ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                                                        }`}>
                                                        {manualForm.courses.includes(course.id) && <div className="w-2 h-2 bg-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={manualForm.courses.includes(course.id)}
                                                        onChange={() => {
                                                            const current = manualForm.courses;
                                                            if (current.includes(course.id)) {
                                                                setManualForm({ ...manualForm, courses: current.filter(id => id !== course.id) });
                                                            } else {
                                                                setManualForm({ ...manualForm, courses: [...current, course.id] });
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-[11px] font-black uppercase tracking-wider truncate">{course.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Access Type</label>
                                            <select
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                                value={manualForm.accessType}
                                                onChange={(e) => setManualForm({ ...manualForm, accessType: e.target.value })}
                                            >
                                                <option value="Full Access">Full Access</option>
                                                <option value="Trial (7 Days)">Trial (7 Days)</option>
                                                <option value="Corporate Grant">Corporate Grant</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={manualForm.startDate}
                                                onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                                                className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="w-full bg-primary text-white py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                            <UserPlus size={18} /> Execute Enrolment
                                        </button>
                                        <p className="text-[10px] font-bold text-gray-400 text-center mt-6 uppercase tracking-widest">
                                            This action will grant immediate access and log the event.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="">
                        <div className="bg-white border border-gray-100 shadow-sm">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                                    <History className="text-primary" /> Enrolment History
                                </h3>
                                <button className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-all">
                                    Export Logs
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="space-y-6">
                                    {historyLoading && <BrandedLoader message="Syncing Enrollment Logs..." />}
                                    {!historyLoading && history.length === 0 ? (
                                        <div className="py-20 text-center border border-dashed border-gray-100 rounded-lg">
                                            <History className="mx-auto text-gray-200 mb-4" size={48} />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No enrolment records found</p>
                                        </div>
                                    ) : (
                                        history.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50/50 group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center text-primary font-black">
                                                        {item.profiles?.full_name ? item.profiles.full_name[0] : 'S'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-black text-sm">{item.profiles?.full_name || 'Generic Student'}</h4>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                            <BookOpen size={10} className="text-primary" /> {item.application?.program_interest || 'Assigned Course'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-black mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border italic ${item.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}>
                                                        {item.status} ({item.payment_status})
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button className="w-full py-4 mt-8 border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all">
                                    Load More History
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EnrolmentManagement;
