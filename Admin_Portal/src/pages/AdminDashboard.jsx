import React from 'react';
import {
    Users, UserCheck, BookOpen, GraduationCap,
    ClipboardList, Database, TrendingUp, ArrowRight,
    UserPlus, PlusCircle, CheckSquare, BrainCircuit
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Icon size={24} />
            </div>
            {trend && (
                <span className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1">
                    <TrendingUp size={10} /> {trend}
                </span>
            )}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        <h3 className="text-3xl font-black mt-1 italic tracking-tight">{value}</h3>
    </div>
);

const QuickAction = ({ icon: Icon, label, color = "bg-primary" }) => (
    <button className={`${color} text-white p-6 flex flex-col items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-primary/5 group`}>
        <Icon size={28} className="group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

const AdminDashboard = () => {
    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">System Overview</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Dashboard</h1>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Status</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-500 text-[10px] font-black uppercase tracking-widest mt-2 border border-green-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        All Systems Operational
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard icon={Users} label="Total Leads" value="1,284" trend="+12%" />
                <StatCard icon={UserCheck} label="Registered Users" value="842" trend="+5%" />
                <StatCard icon={GraduationCap} label="Total Students" value="315" trend="+18%" />
                <StatCard icon={BookOpen} label="Total Courses" value="24" />
                <StatCard icon={ClipboardList} label="Active Enrolments" value="482" />
                <StatCard icon={CheckSquare} label="Pending Assignments" value="63" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Quick Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tight">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={UserPlus} label="Enrol Student" />
                        <QuickAction icon={PlusCircle} label="Create Course" />
                        <QuickAction icon={CheckSquare} label="Review Submissions" color="bg-secondary" />
                        <QuickAction icon={BrainCircuit} label="Manage AI Knowledge" color="bg-black" />
                    </div>

                    <div className="bg-primary/5 p-8 border border-primary/10">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-4">System Notice</h3>
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                            The next scheduled system maintenance will occur on Sunday at 02:00 AM GMT. Please ensure all critical audits are exported before this time.
                        </p>
                    </div>
                </div>

                {/* Recent Activity Table Placeholder */}
                <div className="lg:col-span-8 bg-white border border-gray-100 shadow-sm p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tight">Recent Enrolments</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-black flex items-center gap-2 transition-colors">
                            View All History <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: "John Smith", course: "Business Analysis", date: "2 mins ago", status: "Active" },
                                    { name: "Sarah Williams", course: "Project Management", date: "1 hour ago", status: "Pending" },
                                    { name: "Michael Chen", course: "Cybersecurity", date: "3 hours ago", status: "Active" },
                                    { name: "Emily Brown", course: "Digital Marketing", date: "Yesterday", status: "Active" },
                                    { name: "David Miller", course: "Data Analysis", date: "Yesterday", status: "Active" }
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 text-sm font-bold text-black">{row.name}</td>
                                        <td className="py-4 text-sm text-gray-500 font-medium">{row.course}</td>
                                        <td className="py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">{row.date}</td>
                                        <td className="py-4 text-right">
                                            <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.status === 'Active' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
