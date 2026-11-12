import { connection, NextResponse } from "next/server";
import { fetchNowPlaying } from "@/lib/lanyard";

/**
 * Now-playing endpoint for the corner tile. Reads your Spotify listening through
 * Lanyard, which mirrors your Discord status. Needs one env var, DISCORD_USER_ID
 * (see .env.example). Until it is set the tile shows a quiet resting state.
 */

// The CDN shares one answer across visitors for 15s so Lanyard isn't hit per visitor.
// Browsers get max-age=0: no stale copy, so no hidden background revalidation request.
const CACHE_HEADERS = { "Cache-Control": "public, max-age=0, s-maxage=15" };

export async function GET() {
  await connection(); // opt out of build-time prerendering: this must run per request

  const discordId = process.env.DISCORD_USER_ID;
  if (!discordId) {
    return NextResponse.json({ configured: false }, { headers: CACHE_HEADERS });
  }
  return NextResponse.json(await fetchNowPlaying(discordId), { headers: CACHE_HEADERS });
}
