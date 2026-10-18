export type Service = {
  day: string;
  time: string;
  name: string;
  detail: string;
  /** How long it usually runs, for the "happening now" notice. */
  minutes: number;
};

export const site = {
  name: 'The Well',
  legal: 'The Well Assembly of God',
  // While true, pages note that leader names and ministry meeting details are awaiting confirmation,
  // and events marked `draft: true` appear as samples. Set to false once the church has confirmed
  // the remaining facts in this file and in src/content.
  preview: true,
  tagline: 'Spirit-filled. Bible-based. A place to belong.',
  affiliation: 'Assemblies of God',
  // Oklahoma's Assemblies of God district. Confirm before launch.
  district: 'Oklahoma Ministry Network',
  // Confirmed by the church.
  services: [
    { day: 'Sunday', time: '10:00 AM', name: 'Sunday School', detail: 'Bible classes for every age', minutes: 40 },
    { day: 'Sunday', time: '10:45 AM', name: 'Sunday Worship', detail: 'Worship, the Word, and Kids', minutes: 90 },
    { day: 'Tuesday', time: '7:00 PM', name: 'Prayer Meeting', detail: 'Seeking God together in prayer', minutes: 60 },
    { day: 'Wednesday', time: '7:00 PM', name: 'Wednesday Service', detail: 'Worship and the Word', minutes: 75 },
  ] satisfies Service[],
  serviceLength: 'about 90 minutes',
  // The church's clock, for the notices that change with the day ("See you tomorrow", "Starting soon").
  timeZone: 'America/Chicago',
  // Turn online features on once they are ready. Each one is independent.
  features: {
    // Recent videos pulled from the YouTube channel below.
    youtube: false,
    // "Watch live" links and the live-stream panel.
    livestream: false,
    // The Groups ministry and every "find a group" link, until groups are meeting.
    groups: false,
  },
  address: '2902 S Pocola Blvd',
  city: 'Pocola, OK 74902',
  locality: 'Pocola',
  region: 'OK',
  postalCode: '74902',
  country: 'US',
  phoneDisplay: '(918) 436-0101',
  phoneHref: 'tel:+19184360101',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=2902%20S%20Pocola%20Blvd%2C%20Pocola%2C%20OK%2074902%2C%20United%20States',
  appleMapsHref: 'https://maps.apple.com/?q=2902%20S%20Pocola%20Blvd%2C%20Pocola%2C%20OK%2074902%2C%20United%20States',
  // Public embed. output=embed does not use the Maps Embed API or an API key.
  mapsEmbed: 'https://maps.google.com/maps?q=2902%20S%20Pocola%20Blvd%2C%20Pocola%2C%20OK%2074902%2C%20United%20States&z=16&hl=en&output=embed',
  // A form host endpoint (Formspree, Basin, Getform). Leave blank and the site offers call,
  // message, and directions instead of a form. Forms post straight to the host; nothing is stored here.
  formEndpoint: '',
  // Online giving (Zeffy). The Give links in the menu and footer open it directly.
  givingUrl: 'https://www.zeffy.com/en-US/donation-form/fd612afb-2973-43d9-90c4-d9be3049fa8a',
  // Public Facebook Page URL. No app id or token.
  facebookPage: 'https://www.facebook.com/profile.php?id=100083294263196',
  // @handle, channel URL, or UC… id. Latest uploads come from YouTube's public RSS. No API key.
  youtubeChannel: 'https://www.youtube.com/@thewellassemblyofgod',
};

const byName = (name: string) => site.services.find((service) => service.name === name)!;

/** The main Sunday gathering; "Join us Sundays at …" copy reads from this. */
export const sunday = byName('Sunday Worship');
export const sundaySchool = byName('Sunday School');
export const prayerMeeting = byName('Prayer Meeting');
export const midweek = byName('Wednesday Service');

/** Whether anything is on offer online, so "Watch" links appear only when there is something to watch. */
export const online = site.features.youtube || site.features.livestream;
