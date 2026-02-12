import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Database, Upload, Trash2,
    BrainCircuit, FileText, Globe,
    RefreshCw, CheckCircle2, Search,
    Plus, Filter, Tag, Info
} from 'lucide-react';

const AIKnowledgeManagement = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const fetchKnowledge = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('ai_knowledge')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSources(data || []);
        } catch (err) {
            console.error("Error fetching knowledge:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to purge this knowledge source?")) return;
        try {
            const { error } = await supabase.from('ai_knowledge').delete().eq('id', id);
            if (error) throw error;
            setSources(sources.filter(s => s.id !== id));
        } catch (err) {
            alert("Failed to delete source.");
        }
    };

    const filteredSources = sources.filter(s => {
        const matchesTab = filter === 'all' || s.source_type === filter;
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Artificial Intelligence Engine</span>
                    <h1 className="text-5xl font-black italic tracking-tighter">Knowledge Base</h1>
                </div>
                <button className="bg-primary text-white px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                    <Plus size={18} /> Ingest Context
                </button>
            </div>

            {/* Statistics Banner */}
            <div className="bg-black text-white p-8 shadow-2xl skew-x-[-1deg] flex flex-wrap items-center justify-between gap-8">
                <div className="skew-x-[1deg] flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary flex items-center justify-center text-white">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Engine Status: Optimized</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vector Index Health: 100% | Latency: 42ms</p>
                    </div>
                </div>
                <div className="skew-x-[1deg] flex items-center gap-10">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Knowledge Units</p>
                        <p className="text-2xl font-black italic">{sources.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Context Window</p>
                        <p className="text-2xl font-black italic">128k</p>
                    </div>
                    <button className="h-12 w-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Source Directory */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-gray-100">
                        <div className="flex items-center gap-2">
                            {['all', 'pdf', 'transcript', 'faq', 'policy'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Knowledge..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border-none outline-none text-[10px] font-bold uppercase tracking-widest w-64 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                                <RefreshCw size={32} className="animate-spin mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Vector Store...</span>
                            </div>
                        ) : filteredSources.length === 0 ? (
                            <div className="p-20 text-center text-gray-400">
                                <Database size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">No matching knowledge found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resource Identifier</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categorization</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sync Date</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSources.map((src) => (
                                        <tr key={src.id} className="group hover:bg-gray-50/10 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <FileText size={14} />
                                                    </div>
                                                    <p className="font-bold text-black text-xs uppercase tracking-tight truncate max-w-[200px]">{src.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={12} className="text-gray-300" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 text-gray-500">{src.source_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(src.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(src.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors bg-white p-2 border border-gray-100 hover:border-red-100 shadow-sm"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Content Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-gray-100 p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Upload className="text-primary" size={20} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Source Ingestion</h2>
                        </div>
                        <div className="space-y-8">
                            <div className="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center p-8 text-center hover:border-primary/20 hover:bg-white transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                    <Plus size={20} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-relaxed max-w-[150px]">
                                    Drop Technical Documents or Transcripts Here
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                                    <Globe size={16} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Web Scraper</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Crawl Industry News</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                                    <Database size={16} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Connect Database</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Sync Live Course Data</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] text-white p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full -mr-12 -mt-12"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2 relative z-10">
                            <Info size={14} /> Intelligence Policy
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest relative z-10 opacity-70">
                            Knowledge units are processed through the RAG pipeline to ensure Student Assistant accuracy. All data is sanitized before indexing.
                        </p>
                        <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase">
                                <span className="text-gray-500">Model Integrity</span>
                                <span className="text-green-500">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIKnowledgeManagement;
