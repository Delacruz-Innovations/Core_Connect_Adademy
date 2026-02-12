import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, Download, Share2, Trophy, BookOpen, Star, Briefcase, Users, ExternalLink, Award, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const CourseCompletion = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [finalArtefact, setFinalArtefact] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && courseId) {
            fetchCompletionData();
            triggerCelebration();
        }
    }, [user, courseId]);

    const triggerCelebration = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const fetchCompletionData = async () => {
        try {
            // 1. Fetch Course Details
            const { data: courseData } = await supabase
                .from('courses')
                .select('title, description')
                .eq('id', courseId)
                .single();
            setCourse(courseData);

            // 2. Fetch Completion Stats
            // Get total modules
            const { count: moduleCount } = await supabase
                .from('modules')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', courseId);

            // Get total assignments for the course
            const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
            const moduleIds = modules?.map(m => m.id) || [];

            const { count: assignmentCount } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .in('module_id', moduleIds);

            // Get student's submissions for these assignments
            const { data: assignments } = await supabase.from('assignments').select('id').in('module_id', moduleIds);
            const assignmentIds = assignments?.map(a => a.id) || [];

            const { count: submissionsCount } = await supabase
                .from('assignment_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('assignment_id', assignmentIds)
                .eq('reviewed_status', 'reviewed');

            setStats({
                modules: moduleCount || 0,
                assignments: assignmentCount || 0,
                completedAssignments: submissionsCount || 0
            });

            // 3. Fetch Recommendations (Courses student isn't enrolled in)
            const { data: enrolledData } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user.id);

            const enrolledIds = enrolledData?.map(e => e.course_id) || [];

            const { data: recs } = await supabase
                .from('courses')
                .select('id, title, image_url')
                .not('id', 'in', `(${enrolledIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
                .limit(2);

            setRecommendations(recs || []);

            // 4. Fetch Final Artefact Pack submission
            const { data: finalArt } = await supabase
                .from('assignment_submissions')
                .select('file_url, id')
                .eq('user_id', user.id)
                .is('assignment_id', (
                    // Sub-select to find the final artefact assignment for this course
                    supabase.from('assignments')
                        .select('id')
                        .eq('is_final_artefact', true)
                        .in('module_id', moduleIds)
                ))
                .limit(1)
                .maybeSingle();

            setFinalArtefact(finalArt);

        } catch (err) {
            console.error('Error fetching completion data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(window.location.origin + `/student/course/${courseId}`);
        const text = encodeURIComponent(`I've just successfully completed the ${course?.title} at Core Connect Academy! #CoreConnect #Learning #TechCareerr`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Verifying Achievement...</span>
        </div>
    );

    return (
        <div className="space-y-12 mx-auto min-h-screen">

            {/* Premium Header - Centered for Celebration */}
            <div className="flex flex-col items-center text-center gap-6 border-b border-gray-100 pb-12 pt-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 rounded-full mb-4"
                >
                    <Award size={48} />
                </motion.div>

                <div className="space-y-4 max-w-3xl">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Program Completed</span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        Congratulations!
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        You have successfully completed the <br />
                        <span className="text-gray-900 font-bold border-b-2 border-primary/20 pb-1">{course?.title}</span>
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <button className="bg-primary text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 rounded-sm">
                        <Download size={16} /> Download Certificate
                    </button>
                    <button
                        onClick={handleShareLinkedIn}
                        className="bg-white border border-gray-200 text-gray-900 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:border-primary hover:text-primary transition-all rounded-sm shadow-sm"
                    >
                        <Share2 size={16} /> Share Achievement
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Summary */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-sm">
                            <CheckCircle2 size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Performance Summary</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            `All ${stats?.modules} learning modules completed`,
                            `${stats?.completedAssignments} of ${stats?.assignments} assignments graded`,
                            "Program graduation requirements met",
                            "Official transcript generated",
                            finalArtefact ? "Final Artefact Pack validated" : "Portfolio requirements met"
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-white border border-gray-100 shadow-sm hover:border-primary/20 transition-all group rounded-sm">
                                <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                                    <CheckCircle2 size={12} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide leading-snug group-hover:text-black transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                        <div className="p-2 bg-primary/10 text-primary rounded-sm">
                            <GraduationCap size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Next Steps</h3>
                    </div>
                    <div className="bg-gray-50 p-8 border border-gray-100 relative overflow-hidden h-full flex flex-col justify-between rounded-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-8">
                            <p className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary pl-4">
                                "Your digital credentials are being finalized. You can now access alumni-exclusive resources in the library and explore specialized tracks to further your career."
                            </p>

                            <div className="space-y-4 pt-4">
                                <Link to="/student/resources" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors group bg-white p-4 border border-gray-200 hover:border-primary shadow-sm rounded-sm">
                                    <span className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                        <ArrowRight size={14} />
                                    </span>
                                    Access Post-Course Resources
                                </Link>
                                {finalArtefact && (
                                    <a
                                        href={finalArtefact.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors group bg-white p-4 border border-gray-200 hover:border-primary shadow-sm rounded-sm"
                                    >
                                        <span className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                            <Download size={14} />
                                        </span>
                                        Download Your Final Artefact
                                    </a>
                                )}
                                <Link to="/student/dashboard" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors group bg-white p-4 border border-gray-200 hover:border-primary shadow-sm rounded-sm">
                                    <span className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-primary group-hover:text-white transition-all rounded-sm">
                                        <ArrowRight size={14} />
                                    </span>
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Career Support */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-black text-white p-8 border-4 border-black group relative"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Briefcase size={60} />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic mb-4">Career Support Portal</h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">
                        Get personalized CV reviews, interview prep, and direct access to our hiring partners.
                    </p>
                    <Link
                        to="/student/resources?filter=Post-Course Guidance"
                        className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest hover:gap-4 transition-all"
                    >
                        Access Toolkit <ArrowRight size={20} />
                    </Link>
                </motion.div>

                {/* Alumni Network */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-white text-black p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group relative"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Users size={60} />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic mb-4">The Alumni Network</h3>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">
                        Join 5,000+ graduates in our exclusive community. Networking, events, and peer support.
                    </p>
                    <a
                        href="https://community.coreconnect.academy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-black font-black uppercase tracking-widest hover:gap-4 transition-all"
                    >
                        Join Community <ExternalLink size={20} />
                    </a>
                </motion.div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="space-y-8 pt-12 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Specialized Tracks</span>
                            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none">Recommended For You</h3>
                        </div>
                        <Link to="/student/courses" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group">
                            View All Courses <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {recommendations.map((course) => (
                            <Link to={`/student/course/${course.id}`} key={course.id} className="group relative aspect-[16/9] overflow-hidden bg-black cursor-pointer rounded-sm shadow-md hover:shadow-xl transition-all">
                                <img
                                    src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                                    alt={course.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-700 scale-100 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>

                                <div className="absolute inset-0 p-10 flex flex-col justify-end items-start border-4 border-transparent group-hover:border-primary/50 transition-all m-2">
                                    <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6 leading-none translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        {course.title}
                                    </h4>
                                    <span className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500 delay-100 rounded-sm">
                                        Explore Course <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCompletion;
