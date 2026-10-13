// What is happening at church right now, on the church's own clock. Runs in the browser,
// so a static page can still say "starting soon" or "see you tomorrow".

export type Slot = { day: string; time: string; name: string; minutes: number };

export type ServiceStatus =
  | { kind: 'now'; service: Slot; next?: Slot }
  | { kind: 'soon'; service: Slot; minutesUntil: number }
  | { kind: 'tomorrow'; services: Slot[] }
  | null;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// How far ahead a service counts as "starting soon", and when "see you tomorrow" begins the evening before.
const SOON_MINUTES = 180;
const EVENING = 17 * 60;

/** "11:00 AM" as minutes after midnight. */
export function minutesOf(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*([AP])M/i);
  if (!match) return 0;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'P' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

/** The weekday and minutes after midnight in a time zone. */
export function zonedClock(timeZone: string, date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { day: DAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function serviceStatus(services: Slot[], timeZone: string, date = new Date()): ServiceStatus {
  const { day, minutes } = zonedClock(timeZone, date);
  const today = services.filter((service) => DAYS.indexOf(service.day) === day).sort((a, b) => minutesOf(a.time) - minutesOf(b.time));

  const current = today.find((service) => minutes >= minutesOf(service.time) && minutes < minutesOf(service.time) + service.minutes);
  if (current) {
    const next = today.find((service) => minutesOf(service.time) > minutesOf(current.time) && minutesOf(service.time) - minutes <= 90);
    return { kind: 'now', service: current, next };
  }

  const upcoming = today.find((service) => minutesOf(service.time) > minutes && minutesOf(service.time) - minutes <= SOON_MINUTES);
  if (upcoming) return { kind: 'soon', service: upcoming, minutesUntil: minutesOf(upcoming.time) - minutes };

  if (minutes >= EVENING) {
    const tomorrow = services.filter((service) => DAYS.indexOf(service.day) === (day + 1) % 7).sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
    if (tomorrow.length) return { kind: 'tomorrow', services: tomorrow };
  }
  return null;
}

/** One short sentence for a status. */
export function statusText(status: Exclude<ServiceStatus, null>): string {
  if (status.kind === 'now') {
    const then = status.next ? ` ${status.next.name} follows at ${status.next.time}.` : '';
    return `${status.service.name} is happening now. Come on in.${then}`;
  }
  if (status.kind === 'soon') {
    const when = status.minutesUntil <= 60 ? `in ${status.minutesUntil} minute${status.minutesUntil === 1 ? '' : 's'}` : `at ${status.service.time} today`;
    return `${status.service.name} starts ${when}. We’ll save you a seat.`;
  }
  const list = status.services.map((service) => `${service.name} at ${service.time}`);
  const joined = list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0];
  return `See you tomorrow: ${joined}.`;
}
