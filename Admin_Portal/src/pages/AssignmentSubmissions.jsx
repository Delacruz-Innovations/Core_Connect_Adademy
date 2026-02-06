import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, CheckCircle2,
    Clock, User, FileText, ChevronRight,
    Filter, Search
} from 'lucide-react';

const AssignmentSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const submissions = [
        { id: 1001, student: "Alice Cooper", date: "Feb 05, 2026", time: "14:30", status: "Pending", file: "stakeholder_matrix_v1.pdf" },
        { id: 1002, student: "Bob Dylan", date: "Feb 04, 2026", time: "09:15", status: "Reviewed", file: "assignment_week1_final.docx" },
        { id: 1003, student: "Charlie Brown", date: "Feb 04, 2026", time: "11:45", status: "Reviewed", file: "matrix_analysis.pdf" },
        { id: 1004, student: "Diane Ross", date: "Feb 03, 2026", time: "16:20", status: "Pending", file: "BA_Stakeholders.pdf" }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Submission Review Board</span>
                        <h1 className="text-5xl font-black italic tracking-tighter">Submissions</h1>
                    </div>
                </div>
                <div className="flex bg-white border border-gray-100 p-2 shadow-sm">
                    <button className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">All</button>
                    <button className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-black">Pending</button>
                    <button className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-black">Reviewed</button>
                </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Information</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {submissions.map((sub) => (
                            <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                                            {sub.student[0]}
                                        </div>
                                        <p className="font-bold text-black text-sm">{sub.student}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-black">{sub.date}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{sub.time}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                        <FileText size={14} /> {sub.file}
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 ${sub.status === 'Reviewed' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                                        }`}>
                                        {sub.status === 'Reviewed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="bg-primary/5 text-primary px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10">
                                        Toggle Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentSubmissions;
