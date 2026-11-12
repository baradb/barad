"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type NowPlayingData =
  | { configured: false }
  | {
      configured: true;
      isPlaying: boolean;
      title?: string;
      artist?: string;
      songUrl?: string | null;
    };

/** Bottom-right corner: what Barad is playing on Spotify right now (via Lanyard). */
export function NowPlaying() {
  // undefined = still loading, null = request failed
  const [data, setData] = useState<NowPlayingData | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as NowPlayingData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData((prev) => prev ?? null);
      }
    }

    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const track = data?.configured && data.title ? data : null;
  const loading = data === undefined;

  let label = "Not listening";
  if (loading) label = "Loading";
  else if (track) label = "Now playing";

  const body = (
    <>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
          track ? "bg-accent text-on-accent" : "bg-track text-faint"
        }`}
      >
        <Icon name="music" size={16} />
      </span>
      <span className="min-w-0 pr-1">
        <span className="flex items-center gap-1.5 text-xs tracking-[0.01em] text-faint">
          {track && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
          )}
          {label}
        </span>
        {loading ? (
          <span
            aria-hidden="true"
            className="mt-1.5 block h-3 w-28 animate-pulse rounded bg-track motion-reduce:animate-none"
          />
        ) : track ? (
          <span className="block truncate text-sm font-medium text-foreground">
            {track.title}
            <span className="font-normal text-muted"> · {track.artist}</span>
          </span>
        ) : (
          <span className="block truncate text-sm text-muted">
            Nothing to show right now
          </span>
        )}
      </span>
    </>
  );

  // Inner radius = outer - padding: rounded-xl (12px) - p-1.5 (6px) = rounded-md (6px) on the icon tile.
  // Fixed width so the tile never resizes when the track changes or loads.
  const box =
    "flex w-[min(17.5rem,calc(100vw-2rem))] items-center gap-3 rounded-xl border border-rule bg-surface p-1.5 pr-3 shadow-[0_6px_20px_-8px_var(--shadow)]";

  return (
    <div className="mx-auto mt-auto w-full max-w-2xl px-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:fixed sm:right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:z-50 sm:mx-0 sm:w-auto sm:max-w-none sm:p-0">
      {track?.songUrl ? (
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${box} transition-colors duration-150 hover:border-accent`}
        >
          {body}
          <span className="sr-only">(opens Spotify in a new tab)</span>
        </a>
      ) : (
        <div className={box}>{body}</div>
      )}
    </div>
  );
}
