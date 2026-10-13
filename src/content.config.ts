import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const image = z.enum([
  'sanctuary',
  'water',
  'table',
  'kids',
  'lounge',
  'chapel',
  'night',
  'exterior',
]);

const sermons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sermons' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    speaker: z.string(),
    series: z.string(),
    passage: z.string(),
    image,
    summary: z.string(),
    alt: z.string(),
    // YouTube video id (the 11 characters after watch?v=). Optional.
    video: z.string().regex(/^[\w-]{11}$/).optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    time: z.string(),
    place: z.string(),
    image,
    // Draft events only appear while site.preview is true, labelled as samples.
    draft: z.boolean().default(false),
    summary: z.string(),
    alt: z.string(),
  }),
});

const ministries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ministries' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    when: z.string(),
    who: z.string(),
    image,
    summary: z.string(),
    alt: z.string(),
  }),
});

const leaders = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leaders' }),
  schema: z.object({
    name: z.string(),
    focus: z.string(),
    order: z.number(),
    image,
    summary: z.string(),
    alt: z.string(),
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/announcements' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    expires: z.coerce.date(),
    summary: z.string(),
  }),
});

export const collections = { sermons, events, ministries, leaders, announcements };
