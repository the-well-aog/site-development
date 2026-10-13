import type { ImageMetadata } from 'astro';
import chapel from '../assets/photos/chapel.jpg';
import church from '../assets/photos/church-exterior.jpg';
import exterior from '../assets/photos/exterior.jpg';
import family from '../assets/photos/family.jpg';
import fellowship from '../assets/photos/fellowship.jpg';
import kids from '../assets/photos/kids.jpg';
import night from '../assets/photos/night.jpg';
import water from '../assets/photos/water.jpg';
import worship from '../assets/photos/worship.jpg';
import youth from '../assets/photos/youth.jpg';

// Photos live in src/assets so the build can serve each one at the size it is shown.
// sanctuary, lounge, and table are older names the CMS still uses; they now point at the church's own photos.
const photos = {
  worship,
  youth,
  fellowship,
  family,
  water,
  kids,
  chapel,
  night,
  exterior,
  church,
  sanctuary: worship,
  lounge: family,
  table: fellowship,
} satisfies Record<string, ImageMetadata>;

export type PhotoKey = keyof typeof photos;

// Where each photo's subject sits, so tight crops (wide headers, square tiles) keep faces in frame.
const focus = new Map<ImageMetadata, string>([
  [fellowship, 'center 15%'],
  [family, 'center 65%'],
  [youth, 'center 45%'],
]);

/** The object-position that keeps a stock photo's subject in view, if it needs one. */
export function photoFocus(src: string): string | undefined {
  const meta = localPhoto(src);
  return meta && focus.get(meta);
}

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
  return key in photos ? photos[key as PhotoKey] : photos.worship;
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
