import { site } from '../data/site';
import { verses } from '../data/verses';

/*
  The verse of the day, read at build time from discoverybiblestudy.org (the site rebuilds daily).
  The site quotes only the King James Version: if the service names another translation, the KJV
  text for the same reference comes from bible-api.com instead. If neither can be reached, the
  verse is picked from the KJV list in src/data/verses.ts, so the build never fails over it.
*/
export type DailyVerse = { text: string; reference: string; source: 'service' | 'fallback' };

const SERVICE = 'https://discoverybiblestudy.org/daily/api/';
const KJV_LOOKUP = (reference: string) => `https://bible-api.com/${encodeURIComponent(reference.replace(/[–—]/g, '-'))}?translation=kjv`;

const TEXT_KEYS = ['text', 'verse_text', 'versetext', 'verse', 'content', 'body', 'passage', 'scripture', 'quote'];
const REF_KEYS = ['reference', 'ref', 'citation', 'verse_reference', 'passage_reference', 'title', 'display_ref'];
const VERSION_KEYS = ['version', 'translation', 'translation_id', 'bible', 'version_abbr', 'abbreviation'];

const plain = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/g, '"').replace(/\s+/g, ' ').trim();
const unquote = (value: string) => value.replace(/^["“]+|["”]+$/g, '').trim();

/** The first string found under any of the keys, searching nested objects and arrays. */
function find(node: unknown, keys: string[], depth = 0): string | undefined {
  if (!node || typeof node !== 'object' || depth > 4) return undefined;
  for (const key of keys) {
    for (const [name, value] of Object.entries(node)) {
      if (name.toLowerCase() === key && typeof value === 'string' && value.trim()) return plain(value);
    }
  }
  for (const value of Object.values(node)) {
    const hit = find(value, keys, depth + 1);
    if (hit) return hit;
  }
  return undefined;
}

/** A verse from the service's JSON, or from plain text/HTML shaped like `"text" Reference`. */
function parse(body: string): { text?: string; reference?: string; version?: string } {
  try {
    const json = JSON.parse(body);
    const book = find(json, ['book', 'book_name']);
    const chapter = find(json, ['chapter']);
    const verse = find(json, ['verses', 'verse_number', 'verse_range']);
    const reference = find(json, REF_KEYS) ?? (book && chapter && verse ? `${book} ${chapter}:${verse}` : undefined);
    return { text: find(json, TEXT_KEYS), reference, version: find(json, VERSION_KEYS) };
  } catch {
    const text = plain(body);
    const match = text.match(/["“](.+?)["”]\s*[-–—]?\s*((?:[1-3]\s?)?[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s\d+:\d+(?:[-–]\d+)?)\s*(?:\(?([A-Z]{2,6})\)?)?/);
    return match ? { text: match[1], reference: match[2], version: match[3] } : {};
  }
}

async function get(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: 'application/json, text/plain, */*', 'User-Agent': 'TheWellSite/1.0' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

/** The KJV text for a reference, e.g. "John 3:16". */
async function kjv(reference: string): Promise<string | undefined> {
  const json = JSON.parse(await get(KJV_LOOKUP(reference)));
  return typeof json.text === 'string' ? plain(json.text) : undefined;
}

function fallback(): DailyVerse {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: site.timeZone }).format(new Date()).split('-').map(Number);
  const verse = verses[Math.floor(Date.UTC(y, m - 1, d) / 86400000) % verses.length];
  return { ...verse, source: 'fallback' };
}

async function load(): Promise<DailyVerse> {
  try {
    const body = await get(SERVICE);
    const found = parse(body);
    console.log(`Daily verse service answered: ${JSON.stringify(found)} (response starts: ${JSON.stringify(body.slice(0, 300))})`);
    if (!found.reference) throw new Error('no verse reference in the response');
    const isKjv = /^(kjv|king james)/i.test(found.version ?? '');
    const text = isKjv && found.text ? found.text : await kjv(found.reference);
    if (!text) throw new Error(`no KJV text for ${found.reference}`);
    return { text: unquote(text), reference: found.reference.replace(/-/g, '–'), source: 'service' };
  } catch (error) {
    console.warn(`Daily verse: using the built-in KJV list (${error instanceof Error ? error.message : error}).`);
    return fallback();
  }
}

let pending: Promise<DailyVerse> | null = null;

/** Today's verse, fetched once per build. */
export function dailyVerse(): Promise<DailyVerse> {
  pending ??= load();
  return pending;
}
