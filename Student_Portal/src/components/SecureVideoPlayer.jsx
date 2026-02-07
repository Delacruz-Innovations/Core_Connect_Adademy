import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlayCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SecureVideoPlayer({ lessonId, videoPath, initialTime = 0 }) {
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const progressInterval = useRef(null);
    const [hasResumed, setHasResumed] = useState(false);

    useEffect(() => {
        fetchSignedUrl();
        setHasResumed(false); // Reset on video change
        return () => clearInterval(progressInterval.current);
    }, [lessonId]);

    const fetchSignedUrl = async () => {
        try {
            if (!videoPath) {
                setError('No video source provided.');
                setLoading(false);
                return;
            }

            // Backend generates signed URL valid for 60 minutes
            const { data, error } = await supabase
                .storage
                .from('lesson-videos')
                .createSignedUrl(videoPath, 3600);

            if (error) throw error;
            setVideoUrl(data.signedUrl);

        } catch (err) {
            console.error('Video Load Error:', err);
            setError('Could not load secure video stream.');
        } finally {
            setLoading(false);
        }
    };

    const handleMetadataLoaded = () => {
        if (!hasResumed && initialTime > 5 && videoRef.current) {
            // Seek to saved position (-5s context)
            videoRef.current.currentTime = Math.max(0, initialTime - 5);
            setHasResumed(true);
        }
    };

    const handleProgress = async () => {
        if (!videoRef.current) return;

        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        if (duration > 0) {
            const percent = Math.round((currentTime / duration) * 100);

            // Report to backend every 5 seconds
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase
                    .from('lesson_progress')
                    .upsert({
                        user_id: user.id,
                        lesson_id: lessonId,
                        watched_seconds: Math.floor(currentTime),
                        percent_watched: percent,
                        last_position_seconds: Math.floor(currentTime)
                    }, { onConflict: 'user_id, lesson_id' });

            } catch (err) {
                console.error('Progress sync failed:', err);
            }
        }
    };

    const onPlay = () => {
        progressInterval.current = setInterval(handleProgress, 5000);
    };

    const onPause = () => {
        clearInterval(progressInterval.current);
        handleProgress();
    };

    if (loading) return (
        <div className="aspect-video bg-black flex items-center justify-center text-white">
            <Loader2 className="animate-spin" />
        </div>
    );

    if (error) return (
        <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center text-red-500 gap-2">
            <AlertCircle size={24} />
            <span className="text-sm font-bold">{error}</span>
        </div>
    );

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg group">
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                onLoadedMetadata={handleMetadataLoaded}
                onPlay={onPlay}
                onPause={onPause}
                onEnded={handleProgress}
            >
                Your browser does not support HTML5 video.
            </video>

            {/* Resume Toast */}
            {hasResumed && initialTime > 5 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded backdrop-blur animate-fade-out pointer-events-none">
                    Resumed from {Math.floor(initialTime / 60)}:{(initialTime % 60).toString().padStart(2, '0')}
                </div>
            )}
        </div>
    );
}
