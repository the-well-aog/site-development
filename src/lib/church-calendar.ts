// The church calendar on the Events page: weekly services, special events, and the national and
// Christian holidays, worked out for any year. Shared by the build (this month) and the browser
// (the month buttons), so both draw the same markup.

export type CalendarKind = 'service' | 'event' | 'christian' | 'national';
export type CalendarItem = { date: string; title: string; kind: CalendarKind; time?: string; href?: string };
export type CalendarService = { day: string; time: string; name: string };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 86_400_000;

const isoOf = (date: Date) => date.toISOString().slice(0, 10);
const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));
const addDays = (date: Date, days: number) => new Date(date.valueOf() + days * DAY_MS);

/** The nth weekday of a month (n = -1 for the last), e.g. the fourth Thursday of November. */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  if (n < 0) {
    const last = utc(year, month + 1, 0);
    return addDays(last, -((last.getUTCDay() - weekday + 7) % 7));
  }
  const first = utc(year, month, 1);
  return addDays(first, ((weekday - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
}

/** Easter Sunday (Western), by the anonymous Gregorian computus. */
export function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month - 1, day);
}

/** National (US federal holidays and widely kept observances) and Christian holidays in a year. */
export function holidays(year: number): CalendarItem[] {
  const national = (date: Date, title: string): CalendarItem => ({ date: isoOf(date), title, kind: 'national' });
  const christian = (date: Date, title: string): CalendarItem => ({ date: isoOf(date), title, kind: 'christian' });
  const easterDay = easter(year);
  const christmas = utc(year, 11, 25);
  // Advent begins on the fourth Sunday before Christmas Day.
  const advent = addDays(christmas, -(christmas.getUTCDay() || 7) - 21);
  return [
    national(utc(year, 0, 1), 'New Year’s Day'),
    national(nthWeekday(year, 0, 1, 3), 'Martin Luther King Jr. Day'),
    national(nthWeekday(year, 1, 1, 3), 'Presidents’ Day'),
    national(nthWeekday(year, 4, 4, 1), 'National Day of Prayer'),
    national(nthWeekday(year, 4, 0, 2), 'Mother’s Day'),
    national(nthWeekday(year, 4, 1, -1), 'Memorial Day'),
    national(nthWeekday(year, 5, 0, 3), 'Father’s Day'),
    national(utc(year, 5, 19), 'Juneteenth'),
    national(utc(year, 6, 4), 'Independence Day'),
    national(nthWeekday(year, 8, 1, 1), 'Labor Day'),
    national(nthWeekday(year, 9, 1, 2), 'Columbus Day'),
    national(utc(year, 10, 11), 'Veterans Day'),
    national(nthWeekday(year, 10, 4, 4), 'Thanksgiving Day'),
    christian(utc(year, 0, 6), 'Epiphany'),
    christian(addDays(easterDay, -46), 'Ash Wednesday'),
    christian(addDays(easterDay, -7), 'Palm Sunday'),
    christian(addDays(easterDay, -3), 'Maundy Thursday'),
    christian(addDays(easterDay, -2), 'Good Friday'),
    christian(easterDay, 'Easter Sunday'),
    christian(addDays(easterDay, 39), 'Ascension Day'),
    christian(addDays(easterDay, 49), 'Pentecost Sunday'),
    ...[1, 2, 3, 4].map((n) => christian(addDays(advent, (n - 1) * 7), `${['First', 'Second', 'Third', 'Fourth'][n - 1]} Sunday of Advent`)),
    christian(utc(year, 11, 24), 'Christmas Eve'),
    christian(christmas, 'Christmas Day'),
  ];
}

const escape = (text: string) => text.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
const ORDER: CalendarKind[] = ['christian', 'national', 'event', 'service'];

/** One item as a line in a day: a link for special events, plain text otherwise. */
function itemHtml(item: CalendarItem): string {
  const time = item.time ? `<span class="cal-time">${escape(item.time.replace(/:00(?= [AP]M)/, ''))}</span> ` : '';
  const body = `${time}${escape(item.title)}`;
  return item.href
    ? `<li class="cal-item is-${item.kind}"><a href="${escape(item.href)}">${body}</a></li>`
    : `<li class="cal-item is-${item.kind}">${body}</li>`;
}

/** The weeks of a month (Sunday first), as calendar markup. month is 0–11. */
export function monthHtml(year: number, month: number, services: CalendarService[], events: CalendarItem[], today: string): string {
  const first = utc(year, month, 1);
  const start = addDays(first, -first.getUTCDay());
  const last = utc(year, month + 1, 0);
  const end = addDays(last, 6 - last.getUTCDay());
  const byDate = new Map<string, CalendarItem[]>();
  for (const item of [...holidays(year - 1), ...holidays(year), ...holidays(year + 1), ...events]) {
    byDate.set(item.date, [...(byDate.get(item.date) ?? []), item]);
  }
  const longDay = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });

  let cells = '';
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const key = isoOf(date);
    const weekly = services
      .filter((service) => DAYS.indexOf(service.day) === date.getUTCDay())
      .map((service): CalendarItem => ({ date: key, title: service.name, time: service.time, kind: 'service' }));
    const items = [...(byDate.get(key) ?? []), ...weekly].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
    const classes = ['cal-day', date.getUTCMonth() !== month && 'is-outside', key === today && 'is-today', items.length === 0 && 'is-empty', key < today && key.slice(0, 7) === today.slice(0, 7) && 'is-past'].filter(Boolean).join(' ');
    cells += `<li class="${classes}"><p class="cal-date"><span class="cal-num">${date.getUTCDate()}</span><span class="cal-long">${longDay.format(date)}</span>${key === today ? '<span class="cal-today">Today</span>' : ''}</p>${items.length ? `<ul class="cal-items" role="list">${items.map(itemHtml).join('')}</ul>` : ''}</li>`;
  }
  return cells;
}

/** "October 2026". */
export function monthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(utc(year, month, 1));
}
