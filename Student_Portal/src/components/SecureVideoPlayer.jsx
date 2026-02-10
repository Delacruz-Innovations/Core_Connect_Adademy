import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function SecureVideoPlayer({ lessonId, courseId, moduleId, videoPath, initialTime = 0, onProgressUpdate, onEnded }) {
    // --- State ---
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [hasResumed, setHasResumed] = useState(false);

    // --- Refs ---
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const progressSyncRef = useRef(null);
    const lastSyncTimeRef = useRef(0);

    // --- Effects ---

    // 1. Initial Load & Signed URL
    useEffect(() => {
        const fetchUrl = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!videoPath) throw new Error('ERR_SOURCE_MISSING');

                const { data, error: urlError } = await supabase.storage
                    .from('lesson-videos')
                    .createSignedUrl(videoPath, 3600); // 1hr validity

                if (urlError) throw urlError;
                setVideoUrl(data.signedUrl);
            } catch (err) {
                console.error('Player Load Fault:', err);
                setError('Secure channel authentication failed.');
            } finally {
                setLoading(false);
            }
        };

        fetchUrl();
        setHasResumed(false);
        return () => {
            clearInterval(progressSyncRef.current);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [lessonId, videoPath]);

    // 2. Keyboard Control
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    seek(10);
                    break;
                case 'ArrowLeft':
                    seek(-10);
                    break;
                case 'KeyM':
                    setIsMuted(prev => !prev);
                    break;
                case 'KeyF':
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted]);

    // --- Logic ---

    // 3. Sync Playback Rate
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(console.error);
        }
    };

    const seek = (seconds) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(duration, Math.max(0, videoRef.current.currentTime + seconds));
    };

    const handleProgressScrub = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = pos * duration;
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- Video Events ---

    const onTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);

        // Auto-Sync progress every 15 seconds to Supabase
        const now = Date.now();
        if (now - lastSyncTimeRef.current > 15000) {
            syncProgress();
            lastSyncTimeRef.current = now;
        }
    };

    const syncProgress = async () => {
        if (!videoRef.current) return;
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
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

    // 4. Resume Trigger (Robust)
    useEffect(() => {
        if (!videoRef.current || hasResumed || initialTime < 2) return;
        // Check if metadata is loaded (duration > 0 and readystate)
        if (duration > 0 || videoRef.current.readyState >= 1) {
            console.log(`🎬 Resuming playback at ${initialTime}s`);
            videoRef.current.currentTime = Math.max(0, initialTime - 2);
            setHasResumed(true);
        }
    }, [initialTime, hasResumed, duration]);

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
        setIsBuffering(false);
    };

    const handleActivity = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    const handleVideoError = () => {
        console.error('Video Playback Error Detected. Resetting secure stream...');
        setError('The secure video stream could not be established. This may be due to a brief network interruption or a missing resource.');
        setIsPlaying(false);
    };

    if (loading) return (
        <div className="aspect-video bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 border border-white/5 rounded-xl shadow-2xl">
            <Loader2 className="text-primary animate-spin" size={32} />
            <div className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Establishing Secure Channel</div>
        </div>
    );

    if (error) return (
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
        <div
            ref={containerRef}
            className={`relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-black group overflow-hidden ${!showControls ? 'cursor-none' : ''}`}
            onMouseMove={handleActivity}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Main Video Engine */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => { setIsPlaying(true); handleActivity(); }}
                onPause={() => setIsPlaying(false)}
                onEnded={async () => {
                    setIsPlaying(false);
                    await syncProgress();
                    if (onEnded) onEnded();
                }}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={handleVideoError}
                onStalled={() => setIsBuffering(true)}
                muted={isMuted}
            />

            {/* Click-to-Play Overlay */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            />

            {/* Buffering Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[2px]">
                    <div className="relative">
                        <Loader2 className="text-white animate-spin" size={64} strokeWidth={1} />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white italic tracking-tighter">HD</div>
                    </div>
                </div>
            )}

            {/* Premium Controls HUD */}
            <div className={`
                absolute bottom-0 left-0 right-0 z-30 transition-all duration-500 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12
                ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
            `}>
                {/* Progress Bar Tier */}
                <div className="relative h-1.5 mb-6 group/progress">
                    <div
                        className="absolute inset-0 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                        onClick={handleProgressScrub}
                    >
                        {/* Buffer Bar (Simulated) */}
                        <div className="absolute h-full bg-white/10 w-[85%] transition-all duration-1000" />

                        {/* Progress Fill */}
                        <div
                            className="absolute h-full bg-primary relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity scale-0 group-hover/progress:scale-100" />
                        </div>
                    </div>
                </div>

                {/* Control Icons Tier */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Playback Controls */}
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors hover:scale-110 active:scale-95">
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                        </button>

                        <div className="flex items-center gap-4">
                            <button onClick={() => seek(-10)} className="text-white/60 hover:text-white transition-colors">
                                <RotateCcw size={20} />
                            </button>
                            <button onClick={() => seek(10)} className="text-white/60 hover:text-white transition-colors">
                                <RotateCw size={20} />
                            </button>
                        </div>

                        {/* Volume Engine */}
                        <div className="flex items-center gap-3 group/volume">
                            <button onClick={() => setIsMuted(prev => !prev)} className="text-white hover:text-primary transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <div className="w-0 group-hover/volume:w-20 transition-all duration-300 overflow-hidden relative h-1 bg-white/10 rounded-full cursor-pointer">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); if (videoRef.current) videoRef.current.volume = e.target.value; }}
                                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="absolute h-full bg-white" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                            </div>
                        </div>

                        {/* Timing HUD */}
                        <div className="text-[11px] font-black text-white/90 uppercase tracking-widest font-mono">
                            <span className="text-primary">{formatTime(currentTime)}</span>
                            <span className="mx-2 text-white/20">/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Speed Controller */}
                        <div className="relative group/speed">
                            <button className="text-[10px] font-black text-white/60 hover:text-primary transition-colors uppercase tracking-[0.2em] border border-white/10 px-3 py-1.5 rounded-sm hover:border-primary/50">
                                {playbackRate}X
                            </button>
                            <div className="absolute bottom-full right-0 mb-4 opacity-0 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:pointer-events-auto transition-all bg-[#0a0a0b]/95 backdrop-blur-xl border border-white/5 p-2 rounded-sm shadow-2xl flex flex-col min-w-[80px]">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; }}
                                        className={`text-[9px] font-black uppercase tracking-widest text-left px-4 py-2 hover:bg-white/5 transition-colors ${playbackRate === rate ? 'text-primary' : 'text-gray-400'}`}
                                    >
                                        {rate}x Speed
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Resume / Checkpoint Toast */}
            {hasResumed && initialTime > 5 && (
                <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-xl border border-white/5 text-white p-4 flex items-center gap-4 animate-fade-out rounded-sm z-40">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <CheckCircle2 size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Session Re-Established</div>
                        <div className="text-xs font-bold uppercase tracking-tight">Resumed at {formatTime(initialTime)}</div>
                    </div>
                </div>
            )}

            {/* Watermark Logo (Corner) */}
            <div className={`
                absolute top-6 left-6 pointer-events-none transition-all duration-700
                ${showControls ? 'opacity-40 scale-100' : 'opacity-10 scale-90 -translate-x-2 -translate-y-2'}
            `}>
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Watermark" className="h-4 w-auto grayscale invert brightness-200" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mt-0.5">SECURE_NODE</span>
                </div>
            </div>
        </div>
    );
}
