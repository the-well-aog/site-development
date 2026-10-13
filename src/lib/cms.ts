import { glob, type Loader } from 'astro/loaders';
import { photoAlt } from '../data/photo-alt';

/*
  Content comes from Strapi (cms.wellspringstudiollc.com) when STRAPI_URL is set at build time.
  Without it, the Markdown in src/content is used, which keeps local development working offline.
  If STRAPI_URL is set but the CMS cannot be reached, the build fails on purpose: a failed build
  leaves the last good site online instead of publishing stale or sample content.
*/

const apiBase = (process.env.STRAPI_URL || '').replace(/\/$/, '');
// Where browsers load uploaded images from. The server build talks to Strapi over the
// internal network, so the public origin can differ from STRAPI_URL.
const publicBase = (process.env.STRAPI_PUBLIC_URL || apiBase).replace(/\/$/, '');

export type Media = { url: string; alternativeText?: string | null } | null | undefined;
export type CmsItem = Record<string, any> & { photo?: Media };

export function mediaUrl(media: Media): string | undefined {
  if (!media?.url) return undefined;
  return /^https?:/.test(media.url) ? media.url : `${publicBase}${media.url}`;
}

async function getJson(url: string, attempts = 3): Promise<any> {
  let last: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (response.ok) return await response.json();
      last = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      last = error;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }
  throw new Error(`Strapi request failed for ${url}: ${last instanceof Error ? last.message : last}`);
}

async function fetchAll(endpoint: string, populate: boolean): Promise<CmsItem[]> {
  const items: CmsItem[] = [];
  for (let page = 1; ; page++) {
    const query = new URLSearchParams({ 'pagination[page]': String(page), 'pagination[pageSize]': '100' });
    if (populate) query.set('populate', 'photo');
    const json = await getJson(`${apiBase}/api/${endpoint}?${query}`);
    items.push(...(json.data ?? []));
    if (page >= (json.meta?.pagination?.pageCount ?? 1)) return items;
  }
}

interface Options {
  /** Strapi REST endpoint, e.g. "events". Also the src/content folder name used as the fallback. */
  endpoint: string;
  /** Whether the content type has a `photo` media field to populate. */
  photo?: boolean;
  /** Map a Strapi item onto the collection schema. `body` is Markdown. */
  map: (item: CmsItem) => { id: string; data: Record<string, unknown>; body?: string };
}

export function cmsLoader({ endpoint, photo = false, map }: Options): Loader {
  const fallback = glob({ pattern: '**/*.md', base: `./src/content/${endpoint}` });
  return {
    name: `cms-${endpoint}`,
    async load(context) {
      if (!apiBase) return fallback.load(context);
      const items = await fetchAll(endpoint, photo);
      context.store.clear();
      for (const item of items) {
        const { id, data, body } = map(item);
        const parsed = await context.parseData({ id, data });
        context.store.set({
          id,
          data: parsed,
          body,
          rendered: body ? await context.renderMarkdown(body) : undefined,
          digest: context.generateDigest({ data: parsed, body: body ?? '' }),
        });
      }
      context.logger.info(`Loaded ${items.length} ${endpoint} from Strapi.`);
    },
  };
}

/** Image description: an upload's own alt text; for a stock photo, what that photo shows; then the entry's, then a fallback. */
export function altFor(item: CmsItem, fallback: string): string {
  if (item.photo?.url) return item.photo.alternativeText || item.alt || fallback;
  return photoAlt[item.stockPhoto] || item.alt || fallback;
}
