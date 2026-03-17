import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AudioPlayer.scss';

interface AudioPlayerProps {
    audioUrl: string;
    onAudioEnd: () => void;
    maxPlays?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    onAudioEnd,
    maxPlays = 2,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(false);
    const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);

    const hasAutoPlayedRef = useRef(false);
    const playCountRef = useRef(0);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // ── Cleanup timers ─────────────────────────────────────────
    const clearTimers = useCallback(() => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        countdownTimerRef.current = null;
        autoPlayTimerRef.current = null;
    }, []);

    // ── Play audio ─────────────────────────────────────────────
    const playAudio = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || playCountRef.current >= maxPlays) return;
        clearTimers();
        setAutoPlayCountdown(null);
        audio.currentTime = 0;
        audio.play().catch(() => setNeedsInteraction(true));
    }, [maxPlays, clearTimers]);

    // ── Start 30s countdown → auto-play ───────────────────────
    const startCountdown = useCallback((seconds = 30) => {
        setAutoPlayCountdown(seconds);

        countdownTimerRef.current = setInterval(() => {
            setAutoPlayCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownTimerRef.current!);
                    countdownTimerRef.current = null;
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        autoPlayTimerRef.current = setTimeout(() => {
            playAudio();
        }, seconds * 1000);
    }, [playAudio]);

    // ── Reset khi sang câu mới ─────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Reset state
        setPlayCount(0);
        playCountRef.current = 0;
        hasAutoPlayedRef.current = false;
        setIsLoading(true);
        setHasError(false);
        setNeedsInteraction(false);
        setAutoPlayCountdown(null);
        clearTimers();

        const handleLoadStart = () => setIsLoading(true);

        const handleCanPlay = () => {
            setIsLoading(false);
            if (!hasAutoPlayedRef.current) {
                hasAutoPlayedRef.current = true;
                audio.play().catch(() => {
                    setNeedsInteraction(true);
                    startCountdown(30);
                });
            }
        };

        const handlePlay = () => { setIsPlaying(true); setNeedsInteraction(false); setAutoPlayCountdown(null); clearTimers(); };
        const handleError = () => { setHasError(true); setIsLoading(false); };
        const handleEnded = () => {
            setIsPlaying(false);
            playCountRef.current += 1;
            setPlayCount(playCountRef.current);

            if (playCountRef.current >= maxPlays) {
                // ✅ Đã phát đủ số lần → auto next
                setTimeout(() => onAudioEnd(), 500);
            }
            // Nếu chưa đủ → user tự replay hoặc 30s countdown
            else {
                startCountdown(30);
            }
        };
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            clearTimers();
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioUrl]);


    const handleManualPlay = () => {
        if (!audioRef.current || playCount >= maxPlays) return;
        audioRef.current.play().catch(err => {
            console.error('Play failed:', err);
            setHasError(true);
        });
        setNeedsInteraction(false);
    };

    const handleReplay = () => {
        if (!audioRef.current || playCount >= maxPlays) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
            console.error('Replay failed:', err);
            setHasError(true);
        });
    };

    const remainingPlays = maxPlays - playCount;
    const canReplay = remainingPlays > 0 && !isPlaying;

    return (
        <div className="audio-player">
            <audio ref={audioRef} src={audioUrl} preload="auto" />

            <div className="audio-controls">
                {/* Status */}
                <div className="audio-status">
                    {hasError ? (
                        <span className="status-error">❌ Lỗi tải audio</span>
                    ) : isLoading ? (
                        <span className="status-loading">⏳ Đang tải audio...</span>
                    ) : isPlaying ? (
                        <span className="status-playing">🔊 Đang phát... (lần {playCount + 1}/{maxPlays})</span>
                    ) : playCount >= maxPlays ? (
                        <span className="status-done">✅ Đã phát đủ {maxPlays} lần — Đang chuyển câu...</span>
                    ) : (
                        <span className="status-paused">⏸️ Đã phát {playCount}/{maxPlays} lần</span>
                    )}
                </div>

                {/* Nút replay hoặc countdown */}
                {canReplay && playCount > 0 && playCount < maxPlays && (
                    <div className="replay-section">
                        <button className="replay-button" onClick={playAudio}>
                            🔁 Nghe lại ({remainingPlays} lần còn lại)
                        </button>
                        {autoPlayCountdown !== null && (
                            <span className="countdown-text">
                                Tự động phát sau {autoPlayCountdown}s...
                            </span>
                        )}
                    </div>
                )}

                {/* Cần tương tác lần đầu */}
                {needsInteraction && playCount === 0 && (
                    <div className="replay-section">
                        <button className="manual-play-button" onClick={playAudio}>
                            ▶️ Nhấn để phát audio
                        </button>
                        {autoPlayCountdown !== null && (
                            <span className="countdown-text">
                                Tự động phát sau {autoPlayCountdown}s...
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default AudioPlayer;