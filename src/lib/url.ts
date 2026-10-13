const photos = {
  sanctuary: 'images/sanctuary.jpg',
  water: 'images/water.jpg',
  table: 'images/table.jpg',
  kids: 'images/kids.jpg',
  lounge: 'images/lounge.jpg',
  chapel: 'images/chapel.jpg',
  night: 'images/night.jpg',
  exterior: 'images/exterior.jpg',
  church: 'images/church-exterior.jpg',
} as const;

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

export function img(key: string): string {
  const path = key in photos ? photos[key as PhotoKey] : photos.sanctuary;
  return url(path);
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
