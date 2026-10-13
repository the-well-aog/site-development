import { getCollection } from 'astro:content';
import { online } from './site';

export type NavLink = { href: string; label: string; note?: string };
export type NavGroup = { id: string; label: string; href: string; links: NavLink[] };

/** One navigation model for the header, the mobile menu, and the footer. */
export async function getNav() {
  const ministries = (await getCollection('ministries')).sort((a, b) => a.data.order - b.data.order);

  const groups: NavGroup[] = [
    {
      id: 'about',
      label: 'About',
      href: '/about',
      links: [
        { href: '/about', label: 'Our story', note: 'Who we are and why we exist' },
        { href: '/beliefs', label: 'What we believe', note: 'Our faith and the 16 Fundamental Truths' },
        { href: '/about#team', label: 'Our team', note: 'Pastors and ministry leaders' },
      ],
    },
    {
      id: 'ministries',
      label: 'Ministries',
      href: '/ministries',
      links: ministries.map((entry) => ({ href: `/ministries/${entry.id}`, label: entry.data.title, note: entry.data.who })),
    },
    {
      id: 'grow',
      label: 'Grow',
      href: '/next-steps',
      links: [
        { href: '/jesus', label: 'Know Jesus', note: 'The good news, simply put' },
        { href: '/next-steps', label: 'Next steps', note: 'Baptism, the Holy Spirit, groups, serving' },
        { href: '/prayer', label: 'Prayer', note: 'Let us pray with you' },
      ],
    },
  ];

  const links: NavLink[] = [
    ...(online ? [{ href: '/watch', label: 'Watch' }] : []),
    { href: '/events', label: 'Events' },
    { href: '/give', label: 'Give' },
  ];

  const cta: NavLink = { href: '/visit', label: 'Plan a visit' };

  return { groups, links, cta };
}
