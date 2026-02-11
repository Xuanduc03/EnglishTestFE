import React, { useEffect, useRef, useState } from "react";
import './QuestionPart1.scss';

type Props = {
  src: string;
};

function formatTime(s: number) {
  if (!isFinite(s) || s <= 0) return "00:00";
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}

const AudioPlayer: React.FC<Props> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    
    const updateTime = () => setTime(a.currentTime);
    const updateDuration = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    
    a.addEventListener("timeupdate", updateTime);
    a.addEventListener("loadedmetadata", updateDuration);
    a.addEventListener("ended", onEnd);
    
    return () => {
      a.removeEventListener("timeupdate", updateTime);
      a.removeEventListener("loadedmetadata", updateDuration);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch(e => {
        console.error("Error playing audio:", e);
        setPlaying(false);
      });
      setPlaying(true);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    
    const val = Number(e.target.value);
    a.currentTime = val;
    setTime(val);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div className="audio-player">
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata"
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a) setDuration(a.duration);
        }}
      />
      
      <div className="audio-left">
        <button className="play-btn" onClick={togglePlay}>
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="time">{formatTime(time)} / {formatTime(duration)}</div>
      </div>

      <div className="audio-track">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={time}
          onChange={onSeek}
          className="progress-slider"
        />
      </div>

      <div className="audio-right">
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed"
        >
          <option value={0.75}>0.75x</option>
          <option value={1}>1.0x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
        </select>
        
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={muted ? 0 : volume}
            onChange={onVolumeChange}
            className="volume-slider"
          />
          <button 
            className="sound" 
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;