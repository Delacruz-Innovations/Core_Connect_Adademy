import React from 'react';
import {
    Database, Upload, Trash2,
    BrainCircuit, FileText, Globe,
    RefreshCw, CheckCircle2, Search,
    Plus
} from 'lucide-react';

const AIKnowledgeManagement = () => {
    const sources = [
        { id: 1, type: "FAQ", status: "Indexed", name: "Student_Onboarding_FAQ.pdf", tokens: "4.2k" },
        { id: 2, type: "Course", status: "Synced", name: "Business_Analysis_Week1_Transcript.txt", tokens: "12.8k" },
        { id: 3, type: "Career", status: "Indexing", name: "UK_Market_Tech_Salaries_2026.xlsx", tokens: "1.5k" }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Artificial Intelligence Engine</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Knowledge Management</h1>
                </div>
                <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <Plus size={18} /> Feed AI Knowledge
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Main Content: Source List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-gray-100 shadow-sm p-8 flex items-center justify-between border-l-4 border-l-primary">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary">
                                <BrainCircuit size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-black text-lg italic tracking-tight">AI Engine Status</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active & Learning | 42.5k Total Context Tokens</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                            <RefreshCw size={14} /> Rebuild Index
                        </button>
                    </div>

                    <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Knowledge Source</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Focus</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Context Volume</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sources.map((src) => (
                                    <tr key={src.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <FileText size={16} className="text-gray-300" />
                                                <p className="font-bold text-black text-xs truncate max-w-[200px]">{src.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 italic">{src.type}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-gray-500">{src.tokens} tokens</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                {src.status === 'Indexing' ?
                                                    <span className="text-orange-500 flex items-center gap-2 animate-pulse"><RefreshCw size={12} className="animate-spin" /> {src.status}</span> :
                                                    <span className="text-green-500 flex items-center gap-2"><CheckCircle2 size={12} /> {src.status}</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Upload & Constraints */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-gray-100 shadow-xl p-10">
                        <h2 className="text-xl font-black italic uppercase tracking-tight mb-8">Ingest Data</h2>
                        <div className="space-y-6">
                            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:border-primary transition-all cursor-pointer">
                                <Upload size={32} className="text-gray-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-relaxed">
                                    Drag PDF, TXT or XLSX files to expand AI's context window.
                                </p>
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-primary/20">
                                Synchronize Now
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-8 border border-primary/10 italic">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Globe size={14} /> Global Brain Policy
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                            Knowledge sources are used to prime the Student Assistant LLM. Sensitive student data is NEVER indexed for search.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIKnowledgeManagement;
