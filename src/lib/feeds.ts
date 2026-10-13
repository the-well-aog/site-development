import { site } from '../data/site';

export type YoutubeVideo = {
  id: string;
  title: string;
  published: string;
  watchUrl: string;
  thumbnail: string;
  excerpt: string;
};

export type SocialFeeds = {
  facebookPage: string | null;
  facebookPlugin: string | null;
  channelId: string | null;
  channelUrl: string | null;
  videos: YoutubeVideo[];
};

const empty: SocialFeeds = {
  facebookPage: null,
  facebookPlugin: null,
  channelId: null,
  channelUrl: null,
  videos: [],
};

const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;

function textOf(source: string): string {
  return source
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .trim();
}

function excerpt(raw: string): string {
  const plain = textOf(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= 220) return plain;
  return `${plain.slice(0, 217).trimEnd()}…`;
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? textOf(match[1]) : '';
}

export function facebookPageUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'facebook.com' && host !== 'fb.com' && host !== 'm.facebook.com') return null;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    url.protocol = 'https:';
    url.hostname = 'www.facebook.com';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export function facebookPluginSrc(pageUrl: string): string {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: 'timeline',
    width: '500',
    height: '680',
    small_header: 'true',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
  });
  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}

function channelIdFrom(input: string): string | null {
  const trimmed = input.trim();
  if (CHANNEL_ID.test(trimmed)) return trimmed;
  const match = trimmed.match(/channel\/(UC[\w-]{22})/);
  return match && CHANNEL_ID.test(match[1]) ? match[1] : null;
}

function channelPage(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || channelIdFrom(trimmed)) return null;
  if (trimmed.startsWith('@')) return `https://www.youtube.com/${trimmed.split(/[/?#]/)[0]}`;
  if (/^[\w.-]{3,}$/.test(trimmed)) return `https://www.youtube.com/@${trimmed}`;
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host !== 'youtube.com') return null;
    url.protocol = 'https:';
    url.hostname = 'www.youtube.com';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

// YouTube intermittently times out or answers 404/5xx. Retry so a scheduled rebuild
// does not publish an empty sermon list.
async function fetchText(url: string, label: string, headers: Record<string, string>, attempts = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers });
      if (response.ok) return await response.text();
      console.warn(`${label} returned ${response.status} (attempt ${attempt}/${attempts}).`);
    } catch (error) {
      console.warn(`${label} failed: ${error instanceof Error ? error.message : error} (attempt ${attempt}/${attempts}).`);
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }
  return null;
}

const userAgent = 'Mozilla/5.0 (compatible; TheWellSite/1.0)';

async function resolveChannelId(input: string): Promise<string | null> {
  const direct = channelIdFrom(input);
  if (direct) return direct;
  const page = channelPage(input);
  if (!page) return null;
  const html = await fetchText(page, 'YouTube channel page', { 'User-Agent': userAgent, 'Accept-Language': 'en-US,en' });
  if (!html) return null;
  const canonical = html.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  if (canonical && CHANNEL_ID.test(canonical[1])) return canonical[1];
  const external = html.match(/"externalId":"(UC[\w-]{22})"/);
  if (external && CHANNEL_ID.test(external[1])) return external[1];
  return null;
}

function parseFeed(xml: string, limit: number): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = match[1];
    const id = tag(block, 'yt:videoId');
    if (!VIDEO_ID.test(id)) continue;
    const published = tag(block, 'published');
    if (Number.isNaN(new Date(published).valueOf())) continue;
    const description = block.match(/<media:description>([\s\S]*?)<\/media:description>/);
    videos.push({
      id,
      title: tag(block, 'title') || 'Untitled',
      published,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      excerpt: excerpt(description?.[1] ?? ''),
    });
    if (videos.length >= limit) break;
  }
  return videos;
}

async function fetchVideos(channelId: string): Promise<YoutubeVideo[]> {
  const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, 'YouTube feed', { 'User-Agent': userAgent });
  return xml ? parseFeed(xml, 12) : [];
}

async function load(): Promise<SocialFeeds> {
  const facebookInput = (process.env.FACEBOOK_PAGE || site.facebookPage || '').trim();
  const youtubeInput = (process.env.YOUTUBE_CHANNEL || site.youtubeChannel || '').trim();
  const facebookPage = facebookPageUrl(facebookInput);
  let channelId: string | null = null;
  let videos: YoutubeVideo[] = [];
  if (youtubeInput) {
    try {
      channelId = await resolveChannelId(youtubeInput);
      if (channelId) videos = await fetchVideos(channelId);
      else console.warn('YouTube feed skipped: could not resolve a channel id.');
    } catch (error) {
      console.warn('YouTube feed skipped:', error instanceof Error ? error.message : error);
    }
  }
  return {
    facebookPage,
    facebookPlugin: facebookPage ? facebookPluginSrc(facebookPage) : null,
    channelId,
    channelUrl: channelId ? `https://www.youtube.com/channel/${channelId}` : null,
    videos,
  };
}

let pending: Promise<SocialFeeds> | null = null;

export function loadSocial(): Promise<SocialFeeds> {
  pending ??= load().catch((error) => {
    console.warn('Social feeds skipped:', error instanceof Error ? error.message : error);
    return empty;
  });
  return pending;
}
