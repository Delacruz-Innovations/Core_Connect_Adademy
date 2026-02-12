import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen, Clock, CheckCircle, Search, Filter } from 'lucide-react';

const StudentCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchCourses = async () => {
            try {
                const { data, error } = await supabase
                    .from('enrollments')
                    .select('*, course:course_id(*, md:modules(*, lessons(id)))')
                    .eq('student_id', user.id);

                if (error) throw error;
                setCourses(data || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter(enrollment => {
        if (!enrollment.course) return false;
        const matchesSearch = enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isCompleted = enrollment.status === 'completed'; // Assuming status field exists or logic derived

        if (filter === 'active') return matchesSearch && !isCompleted;
        if (filter === 'completed') return matchesSearch && isCompleted;
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage and track your learning progress</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary w-full sm:w-64"
                        />
                    </div>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        {['all', 'active', 'completed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((enrollment) => {
                        const course = enrollment.course;
                        const totalLessons = course.md?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

                        return (
                            <div key={enrollment.id} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                                {/* Course Status Badge */}
                                <div className="h-32 bg-gray-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80 mix-blend-overlay" />
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                        {enrollment.status || 'IN PROGRESS'}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">
                                            {course.code || 'COURSE'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">
                                        {course.description || 'No description available for this course.'}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen size={14} />
                                            <span>{totalLessons} Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span>Self-paced</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/student/course/${course.id}`}
                                        className="w-full py-3 rounded-xl font-bold text-center text-sm transition-all bg-gray-900 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
                                    >
                                        Continue Learning
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {searchQuery ? `We couldn't find any courses matching "${searchQuery}"` : "You haven't enrolled in any courses yet."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
