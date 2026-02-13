import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen, Clock, CheckCircle, Search, Filter } from 'lucide-react';

const StudentCourses = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchCourses = async () => {
            try {
                // Use the new optimized RPC
                const { data, error } = await supabase
                    .rpc('get_student_dashboard_progress', { p_student_id: user.id });

                if (error) throw error;
                setEnrollments(data || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    const filteredEnrollments = enrollments.filter(item => {
        const matchesSearch = (item.course_title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const isCompleted = item.progress_percent === 100;

        if (filter === 'active') return matchesSearch && !isCompleted;
        if (filter === 'completed') return matchesSearch && isCompleted;
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-0 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Curriculum</h1>
                    <p className="text-gray-500 font-medium">Track your active learning protocols and progress.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH PROTOCOLS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-primary w-full sm:w-64 transition-all uppercase tracking-wider placeholder:text-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                        {['all', 'active', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === f ? 'bg-white text-gray-900 shadow-md transform scale-105' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : filteredEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEnrollments.map((item) => {
                        const isCompleted = item.progress_percent === 100;

                        return (
                            <div key={item.course_id} className={`group bg-white rounded-[2rem] border-2 ${isCompleted ? 'border-primary/20' : 'border-gray-50'} hover:border-primary/50 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-2xl relative`}>

                                {/* Header / Image Area */}
                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                    <img
                                        src={item.course_image_path || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                        alt={item.course_title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                                    <div className="absolute top-5 right-5 z-10">
                                        {isCompleted ? (
                                            <div className="bg-[#EAB308] text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                                                <CheckCircle size={12} strokeWidth={3} /> Certified
                                            </div>
                                        ) : (
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                                Active Protocol
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-5 left-5 z-10">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-black/50 backdrop-blur-sm px-2 py-1 rounded mb-2 inline-block">
                                            {item.course_code || 'CCA-CORE'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 flex-1 flex flex-col space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                                            {item.course_title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {item.total_lessons} PROTOCOLS</span>
                                            {item.last_accessed_at && (
                                                <span className="flex items-center gap-1.5 text-primary"><Clock size={12} /> LAST ACTIVE: {new Date(item.last_accessed_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Completion Status</span>
                                            <span className="text-lg font-black italic text-gray-900">{item.progress_percent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#EAB308]' : 'bg-primary'}`}
                                                style={{ width: `${item.progress_percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto">
                                        <Link
                                            to={item.last_accessed_module_id && item.last_accessed_lesson_id
                                                ? `/student/course/${item.id}/module/${item.last_accessed_module_id}/lesson/${item.last_accessed_lesson_id}`
                                                : `/student/course/${item.id}`
                                            }
                                            className={`w-full py-4 rounded-xl font-black text-center text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1 ${isCompleted
                                                    ? 'bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-900'
                                                    : 'bg-black text-white hover:bg-primary'
                                                }`}
                                        >
                                            {isCompleted ? 'Review Materials' : item.progress_percent > 0 ? 'Resume Protocol' : 'Initialize Course'}
                                            {!isCompleted && <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Active Protocols</h3>
                    <p className="text-gray-400 font-medium max-w-md mx-auto mb-8">
                        {searchQuery ? `We couldn't find any courses matching "${searchQuery}"` : "Your curriculum queue is empty. Access the registry."}
                    </p>
                    <Link to="/student" className="inline-block px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
                        Browse Registry
                    </Link>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
