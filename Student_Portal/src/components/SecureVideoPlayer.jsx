import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, AlertCircle } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';

export default function SecureVideoPlayer({
    lessonId,
    lessonTitle,
    courseId,
    courseTitle,
    moduleId,
    studentId,
    videoPath,
    muxPlaybackId,
    initialTime = 0,
    onProgressUpdate,
    onEnded
}) {
    // --- State ---
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);
    const lastSyncTimeRef = useRef(0);

    // 0. Mount Tracking
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // 1. Initial Load & Signed URL (Only if no Mux Playback ID)
    useEffect(() => {
        const fetchUrl = async () => {
            if (!isMounted.current) return;

            // If we have a Mux Playback ID, we don't need a signed URL from Supabase
            if (muxPlaybackId) {
                setLoading(false);
                return;
            }

            if (!videoPath) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Determine appropriate bucket
                const { data, error: urlError } = await supabase.storage
                    .from('lesson-videos')
                    .createSignedUrl(videoPath, 3600);

                if (!isMounted.current) return;

                if (urlError) {
                    if (urlError.name === 'AbortError' || urlError.message?.includes('aborted')) return;
                    throw urlError;
                }
                setVideoUrl(data.signedUrl);
            } catch (err) {
                if (!isMounted.current) return;
                if (err.name === 'AbortError' || err.message?.includes('aborted')) return;

                console.error('Player Load Fault:', err);
                setError('Secure channel authentication failed.');
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        fetchUrl();
    }, [lessonId, videoPath, muxPlaybackId]);

    const syncProgress = async (cur, dur) => {
        if (dur <= 0) return;
        const percent = Math.round((cur / dur) * 100);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('lesson_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    course_id: courseId,
                    module_id: moduleId,
                    watched_seconds: Math.floor(cur),
                    total_duration: Math.floor(dur),
                    percent_watched: percent,
                    last_position_seconds: Math.floor(cur),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, lesson_id' });

            if (onProgressUpdate) {
                onProgressUpdate({
                    lessonId,
                    percent_watched: percent,
                    is_completed: percent >= 90
                });
            }
        } catch (err) {
            console.warn('Silent Progress Sync Failure (Network):', err);
        }
    };

    if (loading) return (
        <div className="aspect-video bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 border border-white/5 rounded-xl shadow-2xl">
            <Loader2 className="text-primary animate-spin" size={32} />
            <div className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Establishing Secure Channel</div>
        </div>
    );

    if (error && !muxPlaybackId) return (
        <div className="aspect-video bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 border border-red-500/20 rounded-xl shadow-2xl p-12 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-lg">Transmission Fault</h3>
            <p className="text-gray-500 text-xs max-w-xs">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-sm"
            >
                Manual Override (Retry)
            </button>
        </div>
    );

    return (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-black">
            <MuxPlayer
                playbackId={muxPlaybackId || undefined}
                src={!muxPlaybackId ? videoUrl : undefined}
                streamType="on-demand"
                startTime={initialTime}
                onTimeUpdate={(e) => {
                    const cur = e.target.currentTime;
                    const dur = e.target.duration;
                    const now = Date.now();
                    // Sync every 5 seconds or on major jumps
                    if (now - lastSyncTimeRef.current > 5000) {
                        syncProgress(cur, dur);
                        lastSyncTimeRef.current = now;
                    }
                }}
                onEnded={async (e) => {
                    await syncProgress(e.target.currentTime, e.target.duration);
                    if (onEnded) onEnded();
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                envKey={import.meta.env.VITE_MUX_ENV_KEY}
                metadata={{
                    video_id: lessonId,
                    video_title: lessonTitle || lessonId,
                    viewer_user_id: studentId,
                    sub_property_id: courseTitle || courseId,
                    player_name: "Core Connect Mux Player",
                    video_series: courseTitle
                }}
                primaryColor="#3b82f6"
            />
        </div>
    );
}
