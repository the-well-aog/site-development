import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const fileEnv = loadEnv(process.env.NODE_ENV || '', process.cwd(), '');
const site = process.env.SITE_URL || fileEnv.SITE_URL || 'https://thewellpocola.com';
const base = process.env.BASE_PATH || fileEnv.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  // /today/ only forwards to the verse on the home page; it exists for link previews.
  integrations: [sitemap({ filter: (page) => !page.includes('/today/') })],
});
