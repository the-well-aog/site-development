const utc = { timeZone: 'UTC' } as const;

export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function longDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    ...utc,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function dayNum(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { ...utc, day: 'numeric' }).format(date);
}

export function monthShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { ...utc, month: 'short' }).format(date);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function weekdayShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { ...utc, weekday: 'short' }).format(date);
}

/** "11:00a" / "7:00p" shorthand, as typed in the CMS, written out as "11:00 AM" / "7:00 PM". */
export function clock(text: string): string;
export function clock(text: string | undefined): string | undefined;
export function clock(text: string | undefined): string | undefined {
  return text?.replace(/\b(1[0-2]|0?[1-9]):([0-5]\d)\s?(?:([ap])\.m\.|([ap])m?\b)/gi, (_, hour: string, minute: string, dotted?: string, plain?: string) => `${hour}:${minute} ${(dotted || plain)!.toUpperCase()}M`);
}

/** Split "11:00 AM" into ["11:00", "AM"] so the suffix can be set smaller beside large numerals. */
export function splitTime(time: string): [string, string] {
  const match = time.match(/^(.*?)\s*([AP]M)$/i);
  return match ? [match[1], match[2].toUpperCase()] : [time, ''];
}
