import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = join(process.cwd(), 'dist');
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

function localPath(ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (
    !clean ||
    clean.startsWith('http:') ||
    clean.startsWith('https:') ||
    clean.startsWith('mailto:') ||
    clean.startsWith('tel:') ||
    clean.startsWith('data:')
  ) {
    return null;
  }
  if (!clean.startsWith('/')) return null;

  let path = clean;
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || '/';
  }
  if (path.endsWith('/')) path += 'index.html';
  else if (!path.split('/').pop().includes('.')) path += '/index.html';
  return path.replace(/^\//, '');
}

if (!existsSync(dist)) {
  console.error('dist/ is missing. Run astro build first.');
  process.exit(1);
}

const files = walk(dist);
const missing = [];
const attr = /(?:href|src)="([^"]+)"/g;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(attr)) {
    const rel = localPath(match[1]);
    if (!rel) continue;
    const target = join(dist, rel);
    const flat = rel.endsWith('/index.html')
      ? join(dist, `${rel.slice(0, -'/index.html'.length)}.html`)
      : null;
    if (!existsSync(target) && !(flat && existsSync(flat))) {
      missing.push(`${relative(dist, file)} -> ${match[1]}`);
    }
  }
}

if (missing.length) {
  console.error(`Broken local links:\n${missing.join('\n')}`);
  process.exit(1);
}

console.log(`Checked ${files.length} pages.`);
