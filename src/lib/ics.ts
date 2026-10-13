// A single-event calendar file (.ics) that Apple, Google, and Outlook calendars can import.
// Times are wall-clock times in the church's time zone, which the file declares.

export type CalendarDate = { year: number; month: number; day: number };
export type CalendarEvent = {
  uid: string;
  title: string;
  date: CalendarDate;
  /** Minutes after midnight. Leave out for an all-day event. */
  start?: number;
  /** Minutes after midnight. Defaults to 90 minutes after the start. */
  end?: number;
  location?: string;
  description?: string;
  url?: string;
};

const pad = (value: number) => String(value).padStart(2, '0');
const day = ({ year, month, day: d }: CalendarDate) => `${year}${pad(month)}${pad(d)}`;
const clock = (minutes: number) => `T${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`;
const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** Lines longer than 75 bytes continue on the next line after a space (RFC 5545). 70 characters keeps multi-byte text safe. */
function fold(line: string): string {
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 70) chunks.push(line.slice(i, i + 70));
  return chunks.join('\r\n ');
}

/** The next calendar day, for all-day events (whose end date is exclusive). */
function nextDay(date: CalendarDate): CalendarDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

// US Central time, with daylight saving rules, so every calendar app places the event correctly.
const central = [
  'BEGIN:VTIMEZONE',
  'TZID:America/Chicago',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:-0600',
  'TZOFFSETTO:-0500',
  'TZNAME:CDT',
  'DTSTART:19700308T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0600',
  'TZNAME:CST',
  'DTSTART:19701101T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

export function calendarFile(event: CalendarEvent): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const timed = event.start !== undefined;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Well Assembly of God//Website//EN',
    'CALSCALE:GREGORIAN',
    ...(timed ? central : []),
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    timed ? `DTSTART;TZID=America/Chicago:${day(event.date)}${clock(event.start!)}` : `DTSTART;VALUE=DATE:${day(event.date)}`,
    timed ? `DTEND;TZID=America/Chicago:${day(event.date)}${clock(event.end ?? event.start! + 90)}` : `DTEND;VALUE=DATE:${day(nextDay(event.date))}`,
    `SUMMARY:${escape(event.title)}`,
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${escape(event.description)}`] : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/**
 * Start and end from an event's free-text time, such as "5:00 PM–7:30 PM" or "6:00 PM".
 * Text that does not start with a time ("After the 11:00 AM service") gives an all-day event.
 */
export function parseTimes(text: string): { start?: number; end?: number } {
  const times = [...text.matchAll(/(\d{1,2}):(\d{2})\s*([AP])M/gi)].map((m) => (Number(m[1]) % 12 + (m[3].toUpperCase() === 'P' ? 12 : 0)) * 60 + Number(m[2]));
  if (!times.length || !/^\s*\d/.test(text)) return {};
  return { start: times[0], end: times[1] };
}
