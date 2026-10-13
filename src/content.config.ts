import { defineCollection, z } from 'astro:content';
import { altFor, cmsLoader, mediaUrl } from './lib/cms';
import { clock } from './lib/format';

// Photos in src/assets/photos (see src/lib/url.ts). An uploaded CMS photo (`photo`, an absolute URL) takes precedence.
const image = z.enum(['worship', 'youth', 'fellowship', 'family', 'classes', 'sanctuary', 'water', 'table', 'kids', 'lounge', 'chapel', 'night', 'exterior', 'church']);
const photo = z.string().url().optional();

const events = defineCollection({
  loader: cmsLoader({
    endpoint: 'events',
    photo: true,
    map: (item) => ({
      id: item.slug,
      body: clock(item.body),
      data: {
        title: item.title,
        date: item.date,
        time: clock(item.time),
        place: item.place,
        image: item.stockPhoto,
        photo: mediaUrl(item.photo),
        summary: clock(item.summary),
        alt: altFor(item, item.title),
      },
    }),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    time: z.string(),
    place: z.string(),
    image,
    photo,
    // Markdown fallback only: draft events appear while site.preview is true, labelled as samples.
    // In Strapi, drafts are simply unpublished and never reach the site.
    draft: z.boolean().default(false),
    summary: z.string(),
    alt: z.string(),
  }),
});

const ministries = defineCollection({
  loader: cmsLoader({
    endpoint: 'ministries',
    photo: true,
    map: (item) => ({
      id: item.slug,
      body: clock(item.body),
      data: {
        title: item.title,
        order: item.order,
        when: clock(item.when),
        who: item.who,
        image: item.stockPhoto,
        photo: mediaUrl(item.photo),
        summary: clock(item.summary),
        alt: altFor(item, item.title),
      },
    }),
  }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    when: z.string(),
    who: z.string(),
    image,
    photo,
    summary: z.string(),
    alt: z.string(),
  }),
});

const leaders = defineCollection({
  loader: cmsLoader({
    endpoint: 'leaders',
    photo: true,
    map: (item) => ({
      id: item.documentId,
      data: { name: item.name, role: item.role, order: item.order, photo: mediaUrl(item.photo), summary: item.summary },
    }),
  }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number(),
    // An absolute URL (CMS upload) or a path under public/. Without one the site shows initials.
    photo: z.string().optional(),
    summary: z.string(),
  }),
});

const announcements = defineCollection({
  loader: cmsLoader({
    endpoint: 'announcements',
    map: (item) => ({
      id: item.documentId,
      data: { title: item.title, date: item.date, expires: item.expires, summary: clock(item.summary) },
    }),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    expires: z.coerce.date(),
    summary: z.string(),
  }),
});

export const collections = { events, ministries, leaders, announcements };
