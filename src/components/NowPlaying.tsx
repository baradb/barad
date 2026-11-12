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
      album?: string;
      albumImageUrl?: string | null;
      songUrl?: string | null;
    };

/** Bottom-right corner: what Barad is listening to on Spotify right now (via Lanyard). */
export function NowPlaying() {
  // undefined = still loading, null = request failed
  const [data, setData] = useState<NowPlayingData | null | undefined>(undefined);
  const [failedArt, setFailedArt] = useState<string | null>(null);

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
  // Album cover, unless it is missing or failed to load (then the music icon stands in).
  const art =
    track?.albumImageUrl && track.albumImageUrl !== failedArt ? track.albumImageUrl : null;

  const body = (
    <>
      {art ? (
        // Plain <img>: a 56px thumbnail from Spotify's CDN, no image-optimizer config needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt={`Album cover for ${track?.album ?? track?.title}`}
          width={56}
          height={56}
          onError={() => setFailedArt(art)}
          className="size-14 shrink-0 rounded-lg bg-track object-cover"
        />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-track text-faint">
          <Icon name="music" size={20} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs tracking-[0.01em] text-faint">
          {track && (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
          )}
          What I&apos;m listening to
        </span>
        {loading ? (
          <span aria-hidden="true" className="mt-2 block space-y-2">
            <span className="block h-3.5 w-32 animate-pulse rounded bg-track motion-reduce:animate-none" />
            <span className="block h-3 w-20 animate-pulse rounded bg-track motion-reduce:animate-none" />
          </span>
        ) : track ? (
          <>
            <span className="mt-0.5 block truncate text-base font-medium text-foreground">
              {track.title}
            </span>
            <span className="block truncate text-sm text-muted">{track.artist}</span>
          </>
        ) : (
          <span className="mt-0.5 block truncate text-base text-muted">Nothing right now</span>
        )}
      </span>
    </>
  );

  // Inner radius = outer - padding: rounded-2xl (16px) - p-2 (8px) = rounded-lg (8px) on the cover.
  // Fixed width and height so the tile never resizes when the track changes or loads.
  const box =
    "flex h-[74px] w-[min(20rem,calc(100vw-3rem))] items-center gap-3.5 rounded-2xl border border-rule bg-surface p-2 pr-4 shadow-[0_6px_20px_-8px_var(--shadow)] sm:w-[min(20rem,calc(100vw-2rem))]";

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
