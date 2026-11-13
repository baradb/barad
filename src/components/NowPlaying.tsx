"use client";

import { useEffect, useRef, useState } from "react";
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
      startedAt?: number;
      endsAt?: number;
    };

const POLL_MS = 30_000;
const END_GRACE_MS = 1_500; // after a song ends, give Lanyard a moment before asking again
const RETRY_MS = 5_000; // and do not ask more often than this while it still reports the old song

/** 83000 -> "1:23", 3725000 -> "1:02:05" */
function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** Bottom-right corner: what Barad is listening to on Spotify right now (via Lanyard). */
export function NowPlaying() {
  // undefined = still loading, null = request failed
  const [data, setData] = useState<NowPlayingData | null | undefined>(undefined);
  const [failedArt, setFailedArt] = useState<string | null>(null);
  // Wall-clock time as of the last tick. Kept in state (set from timers) so rendering stays pure.
  const [now, setNow] = useState(0);
  const lastFetch = useRef(0);
  // The fetch function lives inside the polling effect; the end-of-song timer calls it through this.
  const loadRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      lastFetch.current = Date.now();
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as NowPlayingData;
        if (!cancelled) {
          setData(json);
          setNow(Date.now());
        }
      } catch {
        if (!cancelled) setData((prev) => prev ?? null);
      }
    }

    loadRef.current = load;
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const track = data?.configured && data.title ? data : null;
  const loading = data === undefined;

  // The song's start/end, if Lanyard sent them. The browser counts the seconds itself.
  const startedAt = track?.startedAt;
  const endsAt = track?.endsAt;
  const timed = startedAt !== undefined && endsAt !== undefined;

  useEffect(() => {
    if (startedAt === undefined || endsAt === undefined) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      // The song is over: look for the next one soon instead of waiting for the next poll.
      if (t > endsAt + END_GRACE_MS && t - lastFetch.current > RETRY_MS) loadRef.current();
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, endsAt]);

  const duration = timed ? endsAt - startedAt : 0;
  const elapsed = timed ? Math.min(Math.max(now - startedAt, 0), duration) : 0;
  const percent = timed ? (elapsed / duration) * 100 : 0;

  // Album cover, unless it is missing or failed to load (then the music icon stands in).
  const art =
    track?.albumImageUrl && track.albumImageUrl !== failedArt ? track.albumImageUrl : null;

  const top = (
    <div className="flex h-14 items-center gap-3.5 pr-2">
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
          what i&apos;m listening to right now
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
    </div>
  );

  // Only when the song has start/end times; otherwise the tile is just the compact top row.
  const progress = timed && (
    <div aria-hidden="true" className="flex h-4 items-center gap-2 px-1 text-xs tabular-nums text-faint">
      <span data-time className="w-10 shrink-0 text-right">
        {clock(elapsed)}
      </span>
      <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
        <span
          data-progress
          className="block h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </span>
      <span data-time className="w-10 shrink-0">
        {clock(duration)}
      </span>
    </div>
  );

  const body = (
    <>
      {top}
      {progress}
    </>
  );

  // Inner radius = outer - padding: rounded-2xl (16px) - p-2 (8px) = rounded-lg (8px) on the cover.
  // Sized to its content with even padding all round: 74px (cover + padding + border), or 98px
  // with the progress row. It only changes height when a song with timing starts or stops.
  const box = `flex ${
    timed ? "h-[98px]" : "h-[74px]"
  } w-[min(20rem,calc(100vw-3rem))] flex-col justify-between rounded-2xl border border-rule bg-surface p-2 shadow-[0_6px_20px_-8px_var(--shadow)] sm:w-[min(20rem,calc(100vw-2rem))]`;

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
