import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../data/site';
import { backgroundFor } from '../data/verse-backgrounds';
import type { DailyVerse } from './daily-verse';

/*
  The link preview for today's verse (1200×630, the size Facebook, iMessage, and X show), drawn at
  build time. The site rebuilds just after midnight Central, so the preview changes with the verse.
  Same look as the share image: the verse's photograph under a light veil, cream italic type, gold
  reference, the white logo small at the foot.
*/
const WIDTH = 1200;
const HEIGHT = 630;
const root = process.cwd();
const file = (...parts: string[]) => readFile(join(root, ...parts));

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, props: Record<string, unknown> = {}): Node => ({ type, props: { ...props, style, children } });

/** The verse's type size: as large as its length allows. */
function verseSize(text: string): number {
  const length = text.length;
  if (length <= 70) return 54;
  if (length <= 120) return 46;
  if (length <= 180) return 40;
  if (length <= 250) return 34;
  return 29;
}

export async function verseOgImage(verse: DailyVerse): Promise<Buffer> {
  const art = backgroundFor(verse.reference);
  const [serif, sans, sansMedium, photo, logo] = await Promise.all([
    file('node_modules/@fontsource/fraunces/files/fraunces-latin-500-italic.woff'),
    file('node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff'),
    file('node_modules/@fontsource/outfit/files/outfit-latin-500-normal.woff'),
    file('public/verse', art.file),
    file('public/images/the-well-logo-white.png'),
  ]);
  const photoUri = `data:image/jpeg;base64,${photo.toString('base64')}`;
  const logoUri = `data:image/png;base64,${logo.toString('base64')}`;
  const date = new Intl.DateTimeFormat('en-US', { timeZone: site.timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const veil = art.dark ? 0.22 : 0.34;
  const ring = (radius: number, alpha: number) => h('div', {
    position: 'absolute', left: WIDTH / 2 - radius, top: HEIGHT / 2 - radius, width: radius * 2, height: radius * 2,
    borderRadius: radius, border: `1.5px solid rgba(255,255,255,${alpha})`,
  });
  const gold = h('div', { width: 36, height: 2, background: '#e2bb72' });

  const tree = h('div', { position: 'relative', display: 'flex', width: WIDTH, height: HEIGHT, background: '#0c2a3f', fontFamily: 'Outfit' }, [
    h('img', { position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT, objectFit: 'cover' }, undefined, { src: photoUri, width: WIDTH, height: HEIGHT }),
    h('div', {
      position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT,
      backgroundImage: `linear-gradient(180deg, rgba(6,18,28,${veil * 0.5 + 0.08}), rgba(6,18,28,${veil * 0.62 + 0.2}) 50%, rgba(6,18,28,${veil * 0.5 + 0.12}))`,
    }),
    ring(150, 0.08), ring(270, 0.06), ring(390, 0.045), ring(510, 0.03),
    h('div', { position: 'absolute', left: 26, top: 26, width: WIDTH - 52, height: HEIGHT - 52, border: '1.5px solid rgba(255,255,255,0.24)' }),
    h('div', { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 56, paddingBottom: 70, paddingLeft: 100, paddingRight: 100 }, [
      h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
        gold,
        h('div', { fontFamily: 'Outfit', fontWeight: 600, fontSize: 17, letterSpacing: 5.5, color: '#fbf8f1' }, 'A WORD FOR TODAY'),
        gold,
      ]),
      h('div', { marginTop: 8, fontFamily: 'Outfit', fontWeight: 500, fontSize: 14, letterSpacing: 3, color: 'rgba(251,248,241,0.72)' }, date.toUpperCase()),
      h('div', {
        display: 'flex', marginTop: 26, maxWidth: 980, textAlign: 'center', justifyContent: 'center',
        fontFamily: 'Fraunces', fontStyle: 'italic', fontWeight: 500, fontSize: verseSize(verse.text), lineHeight: 1.24,
        color: '#fbf8f1', textShadow: '0 2px 22px rgba(0,10,18,0.65)',
      }, `“${verse.text}”`),
      h('div', { marginTop: 24, width: 40, height: 2, background: '#e2bb72' }),
      h('div', { marginTop: 14, fontFamily: 'Outfit', fontWeight: 600, fontSize: 21, letterSpacing: 5, color: '#e2bb72' }, `${verse.reference.toUpperCase()}  ·  KJV`),
    ]),
    h('img', { position: 'absolute', left: WIDTH / 2 - 27, top: HEIGHT - 26 - 66, width: 54, height: 56, opacity: 0.9 }, undefined, { src: logoUri, width: 54, height: 56 }),
  ]);

  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Fraunces', data: serif, weight: 500, style: 'italic' },
      { name: 'Outfit', data: sans, weight: 600, style: 'normal' },
      { name: 'Outfit', data: sansMedium, weight: 500, style: 'normal' },
    ],
  });
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

/** Today's date on the church's clock, as 20261013: a cache key so link previews refresh daily. */
export function verseStamp(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: site.timeZone }).format(new Date()).replace(/-/g, '');
}
