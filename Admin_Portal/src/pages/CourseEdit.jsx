import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Globe, Lock,
    Settings, Image as ImageIcon, Trash2
} from 'lucide-react';

const CourseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [formData, setFormData] = useState({
        title: isNew ? '' : 'Business Analysis Mastery',
        description: isNew ? '' : 'Comprehensive guide to becoming a world-class business analyst with real-world case studies.',
        status: isNew ? 'Draft' : 'Published'
    });

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">
                            Catalog Record: {isNew ? 'New Entry' : `#${id}`}
                        </span>
                        <h1 className="text-5xl font-black italic tracking-tighter">
                            {isNew ? 'Create Course' : 'Edit Fundamentals'}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    {!isNew && (
                        <button className="bg-red-50 text-red-600 px-8 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                            <Trash2 size={18} className="inline mr-2" /> Delete
                        </button>
                    )}
                    <button className="bg-primary text-white px-10 py-5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                        <Save size={18} /> Update Catalog
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Primary Info */}
                    <div className="bg-white border border-gray-100 shadow-sm p-10 space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 border-b border-gray-50 pb-6">
                            <Settings className="text-primary" /> Primary Configuration
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Course Branding Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Advanced Cybersecurity Fundamentals"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Course Narrative (Description)</label>
                                <textarea
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 border-0 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                                    placeholder="Describe the learning outcomes and target audience..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visual Assets */}
                    <div className="bg-white border border-gray-100 shadow-sm p-10 space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 border-b border-gray-50 pb-6">
                            <ImageIcon className="text-primary" /> Visual Assets
                        </h2>
                        <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:bg-white hover:border-primary transition-all">
                            <div className="w-16 h-16 bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-primary mb-4 transition-colors">
                                <ImageIcon size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Hero Representation</p>
                            <p className="text-[8px] font-bold text-gray-300 uppercase mt-2">Recommended: 1600x900px</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 block">Visibility Control</h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => setFormData({ ...formData, status: 'Published' })}
                                className={`w-full flex items-center justify-between p-4 px-6 font-bold text-xs uppercase tracking-widest transition-all ${formData.status === 'Published' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Globe size={18} /> Published
                                </div>
                                {formData.status === 'Published' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </button>

                            <button
                                onClick={() => setFormData({ ...formData, status: 'Draft' })}
                                className={`w-full flex items-center justify-between p-4 px-6 font-bold text-xs uppercase tracking-widest transition-all ${formData.status === 'Draft' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Lock size={18} /> Draft Mode
                                </div>
                                {formData.status === 'Draft' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </button>
                        </div>

                        <div className="mt-10 p-6 bg-primary/5 border border-primary/10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3">Public Access Impact</h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-bold italic">
                                Changing status to "Published" will make this course immediate visible to all students with appropriate enrolments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseEdit;
