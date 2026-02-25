import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.scss';

interface AudioPlayerProps {
    audioUrl: string;
    onAudioEnd: () => void;
    autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    onAudioEnd,
    autoPlay = true,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setHasEnded(true);
            onAudioEnd();
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        // Auto-play on mount
        if (autoPlay) {
            audio.play().catch((error) => {
                console.error('Audio autoplay failed:', error);
            });
        }

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl, onAudioEnd, autoPlay]);

    return (
        <div className="audio-player">
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="auto"
            // No controls - prevents replay/seek
            />
            <div className="audio-status">
                {hasEnded ? (
                    <span className="status-ended">🔇 Audio đã kết thúc</span>
                ) : isPlaying ? (
                    <span className="status-playing">🔊 Đang phát audio...</span>
                ) : (
                    <span className="status-loading">⏳ Đang tải audio...</span>
                )}
            </div>
        </div>
    );
};

export default AudioPlayer;
