"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const SEEK_STEP = 5; // seconds per arrow key

function clock(seconds: number) {
  const t = Math.max(0, Math.floor(seconds));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * A deliberately minimal video player: a play button in the middle and a progress
 * bar along the bottom. No fullscreen, no menu, no volume, no gradient over the video.
 * Fills its (relatively positioned) parent. Clicking anywhere plays or pauses.
 */
export function VideoPlayer({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const dragging = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // The video may have loaded its metadata before React attached the listeners below (common
  // when the file is cached or the connection is fast), so read the length once on mount too.
  useEffect(() => {
    const v = video.current;
    if (v && v.readyState >= 1 && Number.isFinite(v.duration)) setDuration(v.duration);
  }, []);

  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function seekTo(ratio: number) {
    const v = video.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const t = Math.min(Math.max(ratio, 0), 1) * v.duration;
    v.currentTime = t;
    setTime(t);
  }

  function ratioAt(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const v = video.current;
    if (!v || !Number.isFinite(v.duration)) return;
    let next: number;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = v.currentTime + SEEK_STEP;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = v.currentTime - SEEK_STEP;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = v.duration;
    else return;
    e.preventDefault();
    seekTo(next / v.duration);
  }

  const percent = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div data-player className="group/player absolute inset-0">
      <video
        ref={video}
        src={src}
        poster={poster}
        aria-label={label}
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 size-full object-cover"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!dragging.current) setTime(e.currentTarget.currentTime);
        }}
        onPlay={() => {
          setPlaying(true);
          // One video at a time, so two soundtracks never overlap.
          document.querySelectorAll("video").forEach((other) => {
            if (other !== video.current) other.pause();
          });
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* Covers the video, so clicking anywhere plays or pauses. */}
      <button
        type="button"
        data-play-button
        onClick={toggle}
        aria-label={`${playing ? "Pause" : "Play"}: ${label}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-offset-[-3px]"
      >
        <span
          data-play-circle
          className={`flex size-16 items-center justify-center rounded-full bg-surface/90 text-accent shadow-[0_6px_20px_-6px_var(--shadow)] transition-opacity duration-150 motion-reduce:transition-none ${
            playing
              ? "opacity-0 group-hover/player:opacity-100 group-has-[:focus-visible]/player:opacity-100"
              : "opacity-100"
          }`}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z" />
            </svg>
          )}
        </span>
      </button>

      {/* Progress: click or drag to seek, arrow keys step 5s. The touch area is taller than the bar. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Video progress: ${label}`}
        aria-valuemin={0}
        aria-valuemax={Math.max(1, Math.round(duration))}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${clock(time)} of ${clock(duration)}`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          seekTo(ratioAt(e));
        }}
        onPointerMove={(e) => {
          if (dragging.current) seekTo(ratioAt(e));
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        className="group/seek absolute inset-x-0 bottom-0 z-10 flex h-8 cursor-pointer touch-none items-end px-3 pb-3 focus-visible:outline-offset-[-2px]"
      >
        {/* Light bar with a hairline shadow: readable on both bright and dark footage, no gradient. */}
        <div className="h-1 w-full origin-bottom rounded-full bg-white/45 drop-shadow-[0_0_1px_rgba(0,0,0,0.55)] transition-transform duration-150 group-hover/seek:scale-y-150 motion-reduce:transition-none">
          <div
            data-seek-fill
            className="h-full rounded-full bg-white transition-[width] duration-200 ease-linear motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
