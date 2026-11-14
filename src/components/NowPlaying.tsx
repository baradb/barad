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
      startedAt?: number;
      endsAt?: number;
      status?: string;
    };

const POLL_MS = 30_000;

/** The visitor's local wall-clock, e.g. "9:04 PM". */
function wallClock(ms: number) {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Bottom-right corner: Barad's Discord status, or what he's listening to (via Lanyard). */
export function NowPlaying() {
  // undefined = still loading, null = request failed
  const [data, setData] = useState<NowPlayingData | null | undefined>(undefined);
  const [failedArt, setFailedArt] = useState<string | null>(null);
  // Current wall-clock, refreshed every second so the embedded time stays live.
  // Starts at 0 (so server and first client render match — no hydration mismatch); the
  // effect fills it in on mount.
  const [now, setNow] = useState(0);

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
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Keep the embedded clock ticking. The interval is the only writer (updating at the top
  // of its first tick), which also satisfies the no-setState-in-effect-body rule.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    const first = requestAnimationFrame(tick);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(first);
    };
  }, []);

  const track = data?.configured && data.title ? data : null;
  const loading = data === undefined;

  // Album cover, unless it is missing or failed to load.
  const art =
    track?.albumImageUrl && track.albumImageUrl !== failedArt ? track.albumImageUrl : null;

  // Label: "listening to" while a song plays, otherwise the Discord status (lowercase).
  const status = data?.configured ? data.status : undefined;
  const label = loading ? "" : track ? "listening to rn" : (status ?? "offline");
  const nowClock = wallClock(now);
  // The pulsing dot shows while listening, or when the Discord status is online.
  const showDot = !loading && (!!track || status === "online");

  const statusLine = (
    <span className="flex items-center gap-1.5 text-xs tracking-[0.01em] text-faint">
      {showDot && (
        <span data-dot className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
        </span>
      )}
      <span data-label>{label}</span>
      {nowClock && (
        <>
          <span aria-hidden="true" className="text-faint/60">
            ·
          </span>
          <span data-clock className="tabular-nums">
            {nowClock}
          </span>
        </>
      )}
    </span>
  );

  // Playing: a 56px cover next to the status line, title and artist. No progress bar.
  // Only built when a track exists (so the non-null access below is safe).
  const playingBody = track && (
    <div className="flex h-14 items-center gap-3.5 pr-2">
      {art ? (
        // Plain <img>: a 56px thumbnail from Spotify's CDN, no image-optimizer config needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt={`Album cover for ${track.album ?? track.title}`}
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
        {statusLine}
        <span className="mt-0.5 block truncate text-base font-medium text-foreground">
          {track.title}
        </span>
        <span className="block truncate text-sm text-muted">{track.artist}</span>
      </span>
    </div>
  );

  // Idle / loading: a single compact line (just the status, or a skeleton).
  const idleBody = (
    <div className="flex flex-col justify-center py-0.5 pr-1">
      {loading ? (
        <span aria-hidden="true" className="h-3.5 w-28 animate-pulse rounded bg-track motion-reduce:animate-none" />
      ) : (
        <>
          <span className="text-[10px] leading-none tracking-[0.08em] text-faint/70 lowercase">
            my status
          </span>
          <span className="mt-1">{statusLine}</span>
        </>
      )}
    </div>
  );

  // Playing = a two-line card with a cover (74px, fixed 320px wide). Idle = a small
  // two-line chip ("status" label + status word) that fits its content.
  const box = track
    ? "flex h-[74px] w-[min(20rem,calc(100vw-3rem))] flex-col justify-center rounded-2xl border border-rule bg-surface p-2 shadow-[0_6px_20px_-8px_var(--shadow)] sm:w-[min(20rem,calc(100vw-2rem))]"
    : "flex w-fit max-w-[min(20rem,calc(100vw-3rem))] flex-col justify-center rounded-2xl border border-rule bg-surface px-3.5 py-2.5 shadow-[0_6px_20px_-8px_var(--shadow)]";

  return (
    <div className="mx-auto mt-auto w-full max-w-2xl px-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:fixed sm:right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:z-50 sm:mx-0 sm:w-auto sm:max-w-none sm:p-0">
      {track?.songUrl ? (
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${box} transition-colors duration-150 hover:border-accent`}
        >
          {playingBody}
          <span className="sr-only">(opens Spotify in a new tab)</span>
        </a>
      ) : (
        <div className={box}>{track ? playingBody : idleBody}</div>
      )}
    </div>
  );
}
