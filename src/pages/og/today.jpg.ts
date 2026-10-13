import type { APIRoute } from 'astro';
import { dailyVerse } from '../../lib/daily-verse';
import { verseOgImage } from '../../lib/og-verse';

// The link preview image for today's verse, rebuilt with the site each night.
export const GET: APIRoute = async () => {
  const jpeg = await verseOgImage(await dailyVerse());
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
