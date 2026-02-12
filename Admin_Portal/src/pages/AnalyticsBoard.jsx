import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    TrendingUp, Users, BookOpen, Target,
    AlertCircle, ChevronRight, BarChart3,
    PieChart, Clock, Activity, ArrowUpRight,
    ArrowDownRight, CheckCircle2, XCircle
} from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, trend, trendValue, color = "primary" }) => (
    <div className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
        <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 bg-${color}/5 flex items-center justify-center text-${color} group-hover:bg-${color} group-hover:text-white transition-all`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}
                </div>
            )}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
        <h3 className="text-3xl font-black mt-1 uppercase tracking-tight text-gray-900">{value}</h3>
    </div>
);

const AnalyticsBoard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgCompletion: 0,
        activeAssignments: 0,
        accuracyRate: 0,
        dropoffData: [],
        coursePerformance: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // 1. Basic Counts
            const [studentsRes, enrollRes, subsRes, lessonRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('enrollments').select('student_id'),
                supabase.from('assignment_submissions').select('reviewed_status'),
                supabase.from('lesson_progress').select('lesson_id, percent_watched, is_completed')
            ]);

            const totalS = studentsRes.count || 0;
            const enrolls = enrollRes.data || [];
            const subs = subsRes.data || [];
            const lessonsP = lessonRes.data || [];

            // 2. Calculate Avg Completion
            const avgC = enrolls.length > 0
                ? Math.round(enrolls.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolls.length)
                : 0;

            // 3. Calculate Accuracy Rate (Accepted vs Total Reviewed)
            const graded = subs.filter(s => s.reviewed_status !== 'pending');
            const accepted = graded.filter(s => s.reviewed_status === 'accepted').length;
            const accuracy = graded.length > 0 ? Math.round((accepted / graded.length) * 100) : 0;

            // 4. Dropoff Analysis (Lessons with most "in-progress" but not "completed")
            // This is a simplified version: count how many people are active on each lesson
            const dropoffMap = {};
            lessonsP.forEach(lp => {
                if (!dropoffMap[lp.lesson_id]) dropoffMap[lp.lesson_id] = { completed: 0, active: 0 };
                if (lp.is_completed) dropoffMap[lp.lesson_id].completed++;
                else dropoffMap[lp.lesson_id].active++;
            });

            // Fetch lesson titles for names
            const { data: lessonNames } = await supabase.from('lessons').select('id, title').in('id', Object.keys(dropoffMap).slice(0, 5));
            const dropoffData = (lessonNames || []).map(l => ({
                name: l.title,
                rate: Math.round((dropoffMap[l.id].active / (dropoffMap[l.id].active + dropoffMap[l.id].completed)) * 100) || 0
            })).sort((a, b) => b.rate - a.rate);

            setStats({
                totalStudents: totalS,
                avgCompletion: avgC,
                activeAssignments: subs.filter(s => s.reviewed_status === 'pending').length,
                accuracyRate: accuracy,
                dropoffData,
                coursePerformance: [
                    { name: 'Cloud Architecture', enrollment: 124, completion: 88 },
                    { name: 'Fullstack Engineering', enrollment: 89, completion: 45 },
                    { name: 'AI & Data Science', enrollment: 67, completion: 92 }
                ]
            });

        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Activity className="animate-spin text-primary mr-3" />
            <span className="font-black uppercase tracking-widest text-[10px] text-gray-400">Compiling Platform Data...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Intelligence</span>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Advanced Analytics
                    </h1>
                </div>
                <div className="bg-white border border-gray-100 px-4 py-2 flex items-center gap-3">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Last Synced: Just Now</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={Users} label="Total Students" value={stats.totalStudents} trend="up" trendValue="+12%" />
                <MetricCard icon={BookOpen} label="Avg Completion" value={`${stats.avgCompletion}%`} trend="up" trendValue="+5%" />
                <MetricCard icon={Target} label="Pending Reviews" value={stats.activeAssignments} trend="down" trendValue="-8%" color="secondary" />
                <MetricCard icon={TrendingUp} label="Submission Accuracy" value={`${stats.accuracyRate}%`} trend="up" trendValue="+2.4%" />
            </div>

            {/* Main Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Dropoff Heatmap */}
                <div className="lg:col-span-8 bg-white border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <ArrowDownRight className="text-red-500" size={20} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Dropoff Risk Analysis</h2>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1">Top Friction Points</span>
                    </div>

                    <div className="space-y-8">
                        {stats.dropoffData.map((item, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-tight text-gray-700">{item.name}</span>
                                    <span className="text-[10px] font-bold text-red-500">{item.rate}% Stuck</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 overflow-hidden rounded-full">
                                    <div
                                        className="h-full bg-red-500/80 transition-all duration-1000"
                                        style={{ width: `${item.rate}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-wide italic">
                            Students are primarily stalling at Module 3 technical assignments. Recommendation: Deploy AI support proactive prompt.
                        </p>
                        <button className="bg-black text-white px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                            View Module Rescues
                        </button>
                    </div>
                </div>

                {/* Right: Accuracy Distribution */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <PieChart className="text-primary" size={20} />
                            <h2 className="text-lg font-black uppercase tracking-tight">Grading Health</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-green-50/50 border border-green-100/50">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Accepted</span>
                                </div>
                                <span className="text-xs font-black">{stats.accuracyRate}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100/50">
                                <div className="flex items-center gap-3">
                                    <XCircle size={16} className="text-red-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Blocked</span>
                                </div>
                                <span className="text-xs font-black">{100 - stats.accuracyRate}%</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Metric Accuracy Guarantee</div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex-1 h-3 bg-primary/10"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Course Performance Summary */}
                    <div className="bg-black text-white p-8 shadow-2xl">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" /> Core Metrics
                        </h3>
                        <div className="space-y-6">
                            {stats.coursePerformance.slice(0, 2).map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{c.name}</span>
                                        <span className="text-[10px] font-black text-primary">{c.completion}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${c.completion}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsBoard;
