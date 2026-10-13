import type { ImageMetadata } from 'astro';
import chapel from '../assets/photos/chapel.jpg';
import church from '../assets/photos/church-exterior.jpg';
import exterior from '../assets/photos/exterior.jpg';
import kids from '../assets/photos/kids.jpg';
import lounge from '../assets/photos/lounge.jpg';
import night from '../assets/photos/night.jpg';
import sanctuary from '../assets/photos/sanctuary.jpg';
import table from '../assets/photos/table.jpg';
import water from '../assets/photos/water.jpg';

// Stock photos live in src/assets so the build can serve each one at the size it is shown.
const photos = { sanctuary, water, table, kids, lounge, chapel, night, exterior, church } satisfies Record<string, ImageMetadata>;

export type PhotoKey = keyof typeof photos;

/** Prefix a site path with the deploy base. External, tel:, mailto:, and #hash links pass through. */
export function url(path = '/'): string {
  if (isExternal(path) || path.startsWith('#') || /^(tel|mailto|sms):/.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path || path === '/') return base === '' ? '/' : `${base}/`;
  return `${base}/${path.replace(/^\//, '')}`;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** A stock photo's built URL (already carries the deploy base). */
export function img(key: string): string {
  return photoMeta(key).src;
}

export function photoMeta(key: string): ImageMetadata {
  return key in photos ? photos[key as PhotoKey] : photos.sanctuary;
}

/** The stock photo behind a built URL, so <Photo> can serve it responsively. Uploads return undefined. */
export function localPhoto(src: string): ImageMetadata | undefined {
  return Object.values(photos).find((meta) => meta.src === src);
}

/** An entry's picture: its CMS upload when there is one, otherwise its stock photo. */
export function photoFor(data: { image: string; photo?: string }): string {
  return data.photo ?? img(data.image);
}

export function isActive(pathname: string, hrefPath: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = pathname.replace(/\/$/, '') || '/';
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || '/';
  }
  const target = hrefPath === '/' ? '/' : hrefPath.split('#')[0].replace(/\/$/, '');
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}
