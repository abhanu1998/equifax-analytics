"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PremiumAudioPlayerProps = {
  src: string;
  expiresIn?: number;
  className?: string;
};

const PLAYBACK_SPEEDS = [1, 1.25, 1.5];

export function PremiumAudioPlayer({
  src,
  expiresIn,
  className,
}: PremiumAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeedIndex, setPlaybackSpeedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const playbackSpeed = PLAYBACK_SPEEDS[playbackSpeedIndex];
  const progressPercentage =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePercentage = isMuted ? 0 : Math.round(volume * 100);

  const progressStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, rgba(56, 189, 248, 0.95) 0%, rgba(56, 189, 248, 0.95) ${progressPercentage}%, rgba(148, 163, 184, 0.2) ${progressPercentage}%, rgba(148, 163, 184, 0.2) 100%)`,
    }),
    [progressPercentage],
  );

  const volumeStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, rgba(16, 185, 129, 0.95) 0%, rgba(16, 185, 129, 0.95) ${volumePercentage}%, rgba(148, 163, 184, 0.2) ${volumePercentage}%, rgba(148, 163, 184, 0.2) 100%)`,
    }),
    [volumePercentage],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
    audio.muted = isMuted;
    audio.playbackRate = playbackSpeed;
  }, [isMuted, playbackSpeed, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setHasError(true);
      }
      return;
    }

    audio.pause();
  }

  function seekTo(nextTime: number) {
    const audio = audioRef.current;
    if (!audio || duration <= 0) {
      return;
    }

    const clamped = Math.max(0, Math.min(duration, nextTime));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }

  function seekBy(seconds: number) {
    seekTo(currentTime + seconds);
  }

  function changePlaybackSpeed() {
    setPlaybackSpeedIndex((current) => (current + 1) % PLAYBACK_SPEEDS.length);
  }

  function handleVolumeChange(next: number) {
    const parsed = Number.isFinite(next) ? Math.max(0, Math.min(1, next)) : volume;
    setVolume(parsed);
    if (isMuted && parsed > 0) {
      setIsMuted(false);
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_rgba(2,6,23,0.55)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_52%)]" />

      <audio ref={audioRef} preload="metadata">
        <source src={src} />
      </audio>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Recording Playback
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
              {playbackSpeed}x
            </span>
            {typeof expiresIn === "number" ? (
              <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-2.5 py-1">
                Expires in {Math.max(1, Math.round(expiresIn / 60))}m
              </span>
            ) : null}
          </div>
        </div>

        {hasError ? (
          <div className="rounded-lg border border-rose-800/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Unable to load the recording stream. Try refreshing this call.
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex size-12 items-center justify-center rounded-full border border-sky-300/30 bg-gradient-to-br from-sky-300/30 via-sky-400/20 to-teal-300/20 text-sky-100 shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-transform hover:scale-[1.02]"
            aria-label={isPlaying ? "Pause recording" : "Play recording"}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 pl-0.5" />}
          </button>

          <div className="min-w-[98px] text-sm font-medium tabular-nums text-slate-100">
            {formatClock(currentTime)} / {formatClock(duration)}
          </div>

          <button
            type="button"
            onClick={() => seekBy(-10)}
            className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2 text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
            aria-label="Rewind 10 seconds"
          >
            <SkipBack className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => seekBy(10)}
            className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2 text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
            aria-label="Forward 10 seconds"
          >
            <SkipForward className="size-4" />
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => seekTo(Number(event.target.value))}
          className="premium-audio-range h-2 w-full"
          style={progressStyle}
          aria-label="Recording timeline"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((current) => !current)}
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2 text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume < 0.01 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(event) => handleVolumeChange(Number(event.target.value))}
              className="premium-audio-range h-1.5 w-28"
              style={volumeStyle}
              aria-label="Volume"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={changePlaybackSpeed}
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
            >
              Speed {playbackSpeed}x
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/70 px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
            >
              <Download className="size-3.5" />
              Open
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
