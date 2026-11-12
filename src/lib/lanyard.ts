/**
 * Reads what you're listening to from Lanyard (https://github.com/Phineas/lanyard),
 * which exposes your Discord presence, including Spotify, as a public JSON API.
 * No API key is needed. Lanyard only knows what is playing right now, not history.
 */

export type NowPlaying =
  | { configured: false }
  | {
      configured: true;
      isPlaying: boolean;
      title?: string;
      artist?: string;
      album?: string;
      albumImageUrl?: string | null;
      songUrl?: string | null;
      /** When the song started and will end, in ms since epoch (for the progress bar). */
      startedAt?: number;
      endsAt?: number;
    };

const NOT_CONFIGURED: NowPlaying = { configured: false };
const DISCORD_ID = /^\d{15,25}$/;

type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

const MAX_SONG_MS = 6 * 3600_000; // anything longer is nonsense (or a podcast); drop the progress

/** The song's start and end times, if Lanyard sent sensible ones. */
function timing(v: unknown): { startedAt: number; endsAt: number } | null {
  if (!isObject(v)) return null;
  const { start, end } = v;
  if (typeof start !== "number" || typeof end !== "number") return null;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (end <= start || end - start > MAX_SONG_MS) return null;
  return { startedAt: start, endsAt: end };
}

/** Turns a Lanyard API response body into what the now-playing tile needs. */
export function toNowPlaying(body: unknown): NowPlaying {
  if (!isObject(body) || body.success !== true || !isObject(body.data)) {
    return NOT_CONFIGURED; // not in the Lanyard server, or an unexpected reply
  }
  const spotify = body.data.spotify;
  if (!isObject(spotify)) return { configured: true, isPlaying: false };

  const title = str(spotify.song);
  if (!title) return { configured: true, isPlaying: false };

  const trackId = str(spotify.track_id);
  const art = str(spotify.album_art_url);
  return {
    configured: true,
    isPlaying: true,
    title,
    artist: str(spotify.artist)?.replaceAll("; ", ", "), // Lanyard joins artists with ";"
    album: str(spotify.album),
    albumImageUrl: art?.startsWith("https://") ? art : null,
    songUrl: trackId ? `https://open.spotify.com/track/${encodeURIComponent(trackId)}` : null,
    ...timing(spotify.timestamps),
  };
}

/** Asks Lanyard about one Discord user. Never throws; failures read as "not configured". */
export async function fetchNowPlaying(
  discordId: string,
  fetcher: FetchLike = fetch,
): Promise<NowPlaying> {
  if (!DISCORD_ID.test(discordId)) return NOT_CONFIGURED;
  try {
    const res = await fetcher(`https://api.lanyard.rest/v1/users/${discordId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return toNowPlaying(await res.json());
  } catch {
    return NOT_CONFIGURED;
  }
}
