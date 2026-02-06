import React from 'react';
import { FileText, CheckCircle2, Clock, ArrowRight, ClipboardList } from 'lucide-react';
import { useFadeInOnScroll } from '../../hooks/useScrollAnimations';

const AssignmentHistory = () => {
    const listRef = useFadeInOnScroll('up', 0.8, 0.2);
    const headerRef = useFadeInOnScroll('up', 0.6);

    const submissions = [
        { id: 1, title: 'Module 4: Process Map Draft', course: 'Project Management & BA', date: '5 Oct 2026', status: 'Submitted' },
        { id: 2, title: 'Module 3: Project Charter', course: 'Project Management & BA', date: '28 Sep 2026', status: 'Reviewed', grade: 'Pass' },
        { id: 3, title: 'Module 2: Risk Register', course: 'Project Management & BA', date: '20 Sep 2026', status: 'Reviewed', grade: 'Pass' },
        { id: 4, title: 'Module 1: Stakeholder Analysis', course: 'Project Management & BA', date: '12 Sep 2026', status: 'Reviewed', grade: 'Pass' }
    ];

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Learning Records</span>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">Assignments</h1>
                </div>
                <div className="flex bg-white border border-gray-100 p-2 gap-2">
                    <div className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest">All</div>
                    <div className="px-4 py-2 hover:bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest cursor-pointer">Reviewed</div>
                    <div className="px-4 py-2 hover:bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest cursor-pointer">Pending</div>
                </div>
            </div>

            {/* Submissions List */}
            <div ref={listRef} className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 md:px-10 py-6">Assignment Task</th>
                                <th className="px-6 md:px-10 py-6">Course Programme</th>
                                <th className="px-6 md:px-10 py-6">Submitted Date</th>
                                <th className="px-6 md:px-10 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 md:px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                                <ClipboardList size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-black group-hover:text-primary transition-colors">{sub.title}</h4>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ref ID: CCA-{200 + sub.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-8">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{sub.course}</span>
                                    </td>
                                    <td className="px-6 md:px-10 py-8">
                                        <span className="text-[11px] font-black text-black italic tracking-tighter">{sub.date}</span>
                                    </td>
                                    <td className="px-6 md:px-10 py-8 text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`inline-block px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${sub.status === 'Reviewed' ? 'bg-green-50 text-green-500' : 'bg-primary text-white'
                                                }`}>
                                                {sub.status}
                                            </span>
                                            {sub.grade && (
                                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest italic">{sub.grade}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notice */}
            <div className="bg-primary/5 p-8 border border-primary/10 flex items-start gap-4">
                <Clock size={20} className="text-primary mt-1" />
                <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                    Assignments are typically reviewed within 48-72 hours of submission.
                    If your status is "Reviewed" but you wish to re-submit based on feedback,
                    please use the re-submission link in the assignment details.
                </p>
            </div>
        </div>
    );
};

export default AssignmentHistory;
