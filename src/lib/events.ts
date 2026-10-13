import { getCollection } from 'astro:content';
import { site } from '../data/site';
import { iso, todayIso } from './format';

/** Upcoming events, soonest first. Drafts are included only in preview mode. */
export async function upcomingEvents() {
  const today = todayIso();
  return (await getCollection('events'))
    .filter((entry) => iso(entry.data.date) >= today && (site.preview || !entry.data.draft))
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
}
