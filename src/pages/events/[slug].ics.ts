import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../../data/site';
import { calendarFile, parseTimes } from '../../lib/ics';
import { url } from '../../lib/url';

// One calendar file per event page, for its "Add to calendar" button.
export async function getStaticPaths() {
  const events = (await getCollection('events')).filter((entry) => site.preview || !entry.data.draft);
  return events.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

export const GET: APIRoute = ({ props, site: origin }) => {
  const { entry } = props as { entry: CollectionEntry<'events'> };
  const { date, time, title, summary, place } = entry.data;
  const page = new URL(url(`/events/${entry.id}`), origin).href;
  const body = calendarFile({
    uid: `${entry.id}-${date.toISOString().slice(0, 10)}@thewell`,
    title,
    date: { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() },
    ...parseTimes(time),
    location: `${place}, ${site.address}, ${site.city}`,
    description: `${time}. ${summary}`,
    url: page,
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
