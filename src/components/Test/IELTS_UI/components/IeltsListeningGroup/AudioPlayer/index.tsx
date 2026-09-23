import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
    audioUrl: string;
    onEnded?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onEnded }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTime = () => setCurrentTime(audio.currentTime);
        const onLoad = () => setDuration(audio.duration);
        const onEnd = () => { setIsPlaying(false); onEnded?.(); };
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onLoad);
        audio.addEventListener('ended', onEnd);
        return () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onLoad);
            audio.removeEventListener('ended', onEnd);
        };
    }, [onEnded]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) { audio.pause(); } else { audio.play(); }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Number(e.target.value);
        setCurrentTime(Number(e.target.value));
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        setVolume(v);
        if (audioRef.current) audioRef.current.volume = v / 100;
    };

    const fmt = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div className="idp-audio-bar">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <button className="btn-play" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="audio-track-wrapper">
                <input
                    type="range"
                    className="audio-track"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                />
            </div>
            <span className="audio-time">{fmt(currentTime)} / {fmt(duration)}</span>
            <div className="audio-volume">
                <span>🔊</span>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={handleVolume}
                />
            </div>
        </div>
    );
};

export default AudioPlayer;