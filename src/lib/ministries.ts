import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../data/site';

/** Whether a ministry is the small-groups one, which waits on site.features.groups. */
export const isGroups = (entry: CollectionEntry<'ministries'>) => entry.id === 'groups' || /\bgroups?\b/i.test(entry.data.title);

/** Ministries to show, in order. Groups stay hidden until site.features.groups is on. */
export async function ministries() {
  return (await getCollection('ministries'))
    .filter((entry) => site.features.groups || !isGroups(entry))
    .sort((a, b) => a.data.order - b.data.order);
}
