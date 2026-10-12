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
