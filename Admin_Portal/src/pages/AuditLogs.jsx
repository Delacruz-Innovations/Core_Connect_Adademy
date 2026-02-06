import React from 'react';
import {
    History, ShieldCheck, User,
    Terminal, Search, Filter,
    ArrowDownCircle, MoreHorizontal
} from 'lucide-react';

const AuditLogs = () => {
    const logs = [
        { id: 5001, actor: "Emily Brown (Admin)", action: "Enrolled Student", entity: "John Smith", timestamp: "Feb 05, 2026 - 15:15:22" },
        { id: 5002, actor: "Emily Brown (Admin)", action: "Login Success", entity: "Admin Portal", timestamp: "Feb 05, 2026 - 14:30:10" },
        { id: 5003, actor: "Sytem Engine", action: "Automatic Backup", entity: "Course Database", timestamp: "Feb 05, 2026 - 02:00:00" },
        { id: 5004, actor: "Admin User", action: "Deleted Resource", entity: "Wk1_Draft_v1.pdf", timestamp: "Feb 04, 2026 - 18:45:33" }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Compliance Monitoring</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Audit Logs</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 bg-white border border-gray-100 px-4 py-3 rounded-none shadow-sm">
                        <Search size={18} />
                        <input type="text" placeholder="Search logs..." className="bg-transparent border-none outline-none text-sm w-64 font-bold" />
                    </div>
                    <button className="bg-black text-white px-6 py-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <ArrowDownCircle size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Log Feed */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority (Actor)</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction (Action)</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entity Impacted</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Precise Timestamp</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Raw</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-mono">
                        {logs.map((log) => (
                            <tr key={log.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={14} className="text-primary" />
                                        <span className="text-xs font-bold text-black">{log.actor}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-medium text-gray-500">{log.entity}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-bold text-gray-400">{log.timestamp}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-gray-300 hover:text-black transition-colors">
                                        <Terminal size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-10 bg-gray-900 text-white font-mono text-[10px] leading-relaxed">
                <p className="text-primary font-black mb-4 uppercase tracking-widest">// RECENT RAW EVENTS STREAM</p>
                <p className="text-white/40 mb-1">[2026-02-05T15:15:22.451Z] INFO: adm_emily_brown triggered enrolment_created for ent_john_smith in crs_ba_mastery</p>
                <p className="text-white/40 mb-1">[2026-02-05T15:10:04.112Z] AUTH: adm_emily_brown session_extended</p>
                <p className="text-white/40 mb-1">[2026-02-05T14:30:10.887Z] AUTH: adm_emily_brown login_success from ip_192.168.1.45</p>
                <div className="w-2 h-4 bg-primary inline-block animate-pulse mt-2"></div>
            </div>
        </div>
    );
};

export default AuditLogs;
