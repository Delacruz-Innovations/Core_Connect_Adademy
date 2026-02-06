import React, { useState } from 'react';
import { Download, FileText, Search, Filter, BookOpen, ExternalLink, FileType } from 'lucide-react';
import { useFadeInOnScroll, useStaggerOnScroll } from '../../hooks/useScrollAnimations';

const ResourceLibrary = () => {
    const [filter, setFilter] = useState('All');
    const headerRef = useFadeInOnScroll('up', 0.6);
    const gridRef = useStaggerOnScroll(0.1);

    const resources = [
        { id: 1, name: "Project Management Lifecycle Template", course: "Project Management & BA", type: "XLSX", size: "2.8 MB" },
        { id: 2, name: "Stakeholder Management Grid", course: "Project Management & BA", type: "PDF", size: "1.2 MB" },
        { id: 3, name: "BA Requirement Gathering Checklist", course: "Project Management & BA", type: "DOCX", size: "850 KB" },
        { id: 4, name: "Digital Strategy Framework 2026", course: "Digital Marketing", type: "PDF", size: "15.4 MB" },
        { id: 5, name: "SEO Audit Guidelines", course: "Digital Marketing", type: "PDF", size: "4.1 MB" }
    ];

    const filteredResources = filter === 'All' ? resources : resources.filter(r => r.course === filter);

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Central Knowledge Base</span>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">Resources</h1>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        className="w-full bg-white border border-gray-100 p-4 pl-12 font-bold text-xs md:text-sm outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-100 pb-8">
                {['All', 'Project Management & BA', 'Digital Marketing'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 md:px-6 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredResources.map((res) => (
                    <div key={res.id} className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <FileType size={48} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <FileText size={24} />
                            </div>

                            <div>
                                <h4 className="text-md font-black italic uppercase tracking-tight text-black leading-tight mb-2 pr-8">{res.name}</h4>
                                <div className="flex flex-wrap gap-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
                                    <span className="flex items-center gap-1"><BookOpen size={12} /> {res.course}</span>
                                    <span>{res.type} • {res.size}</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors">
                                <Download size={16} /> Download Resource
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bulk Actions Placeholder */}
            {filteredResources.length > 0 && (
                <div className="pt-8 border-t border-gray-50 flex justify-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Showing {filteredResources.length} downloadable materials for your active curriculum</p>
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
