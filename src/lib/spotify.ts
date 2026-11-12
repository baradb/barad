import { cacheLife } from "next/cache";

export type CoverInfo = { image: string; url: string };

/**
 * Cover art for an album or artist, from Spotify's public oEmbed endpoint. No API
 * key is needed and it is not affected by developer-mode limits. The result is
 * cached for days; a failed lookup is retried within a minute instead.
 */
export async function getCover(
  kind: "album" | "artist",
  spotifyId: string,
): Promise<CoverInfo | null> {
  "use cache";
  cacheLife("days");
  const url = `https://open.spotify.com/${kind}/${encodeURIComponent(spotifyId)}`;
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) throw new Error(`oembed ${res.status}`);
    const data = (await res.json()) as { thumbnail_url?: unknown };
    if (typeof data.thumbnail_url !== "string") throw new Error("no thumbnail");
    return { image: data.thumbnail_url, url };
  } catch {
    cacheLife("seconds");
    return null;
  }
}
