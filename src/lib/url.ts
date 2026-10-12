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

export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path || path === '/') return base === '' ? '/' : `${base}/`;
  return `${base}/${path.replace(/^\//, '')}`;
}

export function img(key: string): string {
  const path = key in photos ? photos[key as PhotoKey] : photos.sanctuary;
  return url(path);
}

export function isActive(pathname: string, hrefPath: string): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = pathname.replace(/\/$/, '') || '/';
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || '/';
  }
  const target = hrefPath === '/' ? '/' : hrefPath.replace(/\/$/, '');
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}
