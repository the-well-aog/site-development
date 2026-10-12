# The Well Assembly of God — website feature list

A public church site hosted on **GitHub Pages**, rebuilt and published by **GitHub Actions whenever `main` is updated** (direct push or merge). The site is static: HTML, CSS, JavaScript, and content files. Anything that needs a database, logins, or card processing lives on a service the site links to.

Working name: **The Well Assembly of God**. Address, pastor, service times, and giving link are content, not features. Several congregations use a similar name, so none of those facts are assumed here.

## What a visitor must be able to do

These jobs decide what ships first. If a feature does not serve one of them, it waits.

1. Learn **when and where** to show up, on a phone, in a few seconds.
2. Decide whether this church is a fit (**I'm new**, beliefs, kids, what Sunday feels like).
3. **Watch or listen** when they miss a service.
4. See **what is happening** this week and this month.
5. **Give**, contact the church, or ask for prayer.
6. Find a **next step**: kids, youth, a group, baptism, serving.

## Platform (required before the pages)

These are features of the project, not of the public site.

| ID | Feature | Notes |
| --- | --- | --- |
| P1 | GitHub repo is the source of truth | Pages, sermons metadata, events, and leadership live as Markdown or JSON in the repo. No separate CMS database. |
| P2 | Static build | A static-site generator (Astro is the default) compiles the repo into plain files. GitHub Pages only serves files. |
| P3 | Deploy on `main` | GitHub Actions workflow: push or merge to `main` → install → build → deploy to the GitHub Pages environment. A green run is the only way the live site changes. |
| P4 | Pull-request checks | On a pull request: build, HTML validation, and a broken-link check. A failed check blocks the merge. The live site does not change until merge. |
| P5 | `main` protection | Direct pushes of code are discouraged. Content edits may commit through a git-based editor (see E1) and still run the same deploy workflow. |
| P6 | Custom domain and HTTPS | GitHub Pages certificate on the church domain. `www` redirects to the apex, or the reverse, and that choice stays fixed. |
| P7 | Preview is optional | GitHub Pages has no built-in preview URL per pull request. Launch without it. Add deploy previews later only if editors need to see a branch before merge. |
| P8 | 404 page | Branded, with service times and a link home. |
| P9 | SEO defaults | Unique title and description per page, Open Graph image, `sitemap.xml`, `robots.txt`, canonical URL. |
| P10 | Shared chrome | Header, footer, and mobile nav on every page. Footer always repeats service times, address, phone, and giving link. |

### Deploy contract

```text
pull request  →  Actions: build + link check  →  merge to main
push to main  →  Actions: build + deploy      →  GitHub Pages (HTTPS)
```

A content change is a commit. The commit is the release.

## Phase 1 — Launch

Goal: a first-time guest can decide to come this Sunday, and a member can find times, location, and giving without calling the office.

### Home

| ID | Feature |
| --- | --- |
| H1 | Hero with the church name, one sentence of welcome, and two actions: **Plan your visit** and **Service times**. |
| H2 | Service times block above the fold on mobile. Day, time, and what happens (worship, Word, kids). |
| H3 | Address with a one-tap directions link (Google or Apple Maps). |
| H4 | Short "this Sunday" line: series title or a one-sentence welcome. Edited as a content file, not hard-coded. |
| H5 | Three ministry doorways: Kids, Youth, Adults (or the real ministries). Each links to its page. |
| H6 | Latest message: title, date, speaker, and a link to watch. Pulled from the sermon list, not typed twice. |
| H7 | Next three events, from the events list. |
| H8 | Giving prompt that leaves the site for the church's giving provider. |

### I'm new

| ID | Feature |
| --- | --- |
| N1 | What to expect on a first Sunday: arrival time, dress, service length, kids, parking. |
| N2 | A simple map or photo of where to enter. |
| N3 | "Come say hello" — who will greet them (a name and a role, when the church wants that public). |
| N4 | Optional plan-your-visit form (name, party size, kids' ages, questions). Submits to a form host (Formspree, Basin, or a Google Form). The site never stores the submission. |
| N5 | Accessibility facts the church can confirm: step-free entrance, accessible restroom, hearing assistance. Omitted until confirmed. |

### About and beliefs

| ID | Feature |
| --- | --- |
| A1 | Church story: who The Well is and who it is for. Written by the church. |
| A2 | Leadership page: photo, name, role, short bio. One Markdown file per person. |
| A3 | Beliefs page: a plain-language summary, then the Assemblies of God **16 Fundamental Truths**, quoted from the official statement with a link to [ag.org](https://ag.org/Beliefs/Statement-of-Fundamental-Truths). The site does not rewrite doctrine. |
| A4 | Affiliation line: Assemblies of God, plus the district once the church names it. |
| A5 | What a Sunday feels like: worship style in a sentence or two (for example contemporary, prayer, Bible teaching). |

### Ministries (thin is fine at launch)

| ID | Feature |
| --- | --- |
| M1 | One page per public ministry: who it is for, when it meets, who leads it, how to join. |
| M2 | Suggested starters: Kids, Students (youth), and Groups or Bible study. Add or drop to match real ministries. |
| M3 | Age ranges and meeting time on every ministry page. Parents look for those two facts first. |

### Visit and contact

| ID | Feature |
| --- | --- |
| V1 | Location page: street address, embedded map, parking notes, office hours if any. |
| V2 | Click-to-call phone number. |
| V3 | Contact form (name, email, message, optional "I'd like prayer"). Same form host as N4. A note on the page says a person reads it; it is not an emergency line. |
| V4 | Social links actually in use (Facebook, YouTube, Instagram). Unused icons stay off the page. |

### Give

| ID | Feature |
| --- | --- |
| G1 | Give page that explains why the church receives offerings, in the church's words, and buttons out to the provider (Tithe.ly, Pushpay, Planning Center Giving, or whichever they already use). |
| G2 | No card fields on this site. GitHub Pages must not see payment data. |
| G3 | Mailing address for checks, if the church accepts them. |

### Sitewide quality (launch bar)

| ID | Feature |
| --- | --- |
| Q1 | Readable on a phone without horizontal scroll. Service times and the phone number are thumb-reachable. |
| Q2 | Text contrast and visible keyboard focus. Headings in order. Form fields have labels. |
| Q3 | Images have alt text. Decorative images have empty alt. |
| Q4 | Fast first load: optimized images during the build, no large slider libraries. |
| Q5 | Printable service-times block (optional, small). |

## Phase 2 — Stay connected

Goal: people who already know the church can catch up and see what is coming. Still no accounts.

| ID | Feature | How it stays static |
| --- | --- | --- |
| S1 | Sermon archive | One Markdown file per message: date, title, speaker, series, YouTube or Vimeo URL, optional audio URL, passage. The page embeds the player. Newest first. |
| S2 | Series pages | A series is a tag on sermons. The series page lists its messages. |
| S3 | Livestream page | Embed the church YouTube live (or Facebook) player. Shows service time and a "we go live at…" line. When nothing is live, the embed shows the channel. |
| S4 | Events | One Markdown file per event: title, start, end, location, summary, optional external registration link. Home and an Events page both read this folder. Past events drop off the public list by date at build time. |
| S5 | Calendar view | Month list generated from those files. A Google Calendar embed is allowed instead if the office already keeps one calendar. Do not keep two calendars. |
| S6 | Announcements | Short dated notes (weather closure, potluck, special service). Show on Home until an expiry date, then hide. |
| S7 | Prayer request | Form hosted off-site. Public page states who sees the request (pastors only, or a prayer team). No public prayer wall in this phase. A public wall needs moderation the static site cannot do. |
| S8 | Newsletter signup | Embed or link to the list the church already uses (Mailchimp, Planning Center, Buttondown). |
| S9 | Photo galleries | Optimized images in the repo, grouped by event. Captions in Markdown. Keep galleries small. Large originals do not belong in git; export web-size images first. |
| S10 | Share cards | Each sermon and event has a title and image suitable for a text or Facebook share. |

## Phase 3 — Next steps

Add these when Phase 1 and 2 content is real and someone owns updates.

| ID | Feature | Notes |
| --- | --- | --- |
| X1 | Next Steps page | A path with only the steps the church actually offers: talk to a pastor, baptism, membership class, join a group, serve. Each step links to a time or a form. |
| X2 | Groups directory | Name, who it's for, when, where, leader first name, and how to join. No member roster. |
| X3 | Serve / volunteer | Teams that need people, plus a form. Responses go to a leader's email via the form host. |
| X4 | Baptism and dedication | What it is, how to ask, and the next date if one is set. |
| X5 | Missions and outreach | Partners and local serve days. Link out to a missionary page rather than rebuilding it. |
| X6 | Search | Client-side search (Pagefind) over pages, sermons, and events. Built in CI. |
| X7 | Pastor's notes or blog | Optional. Same Markdown pattern as sermons. Skip it if nobody will write. |
| X8 | Multi-campus or multiple services | Only if true. A single-service church gets one time, displayed clearly. |

## Editorial workflow

The site stays current only if a non-developer can change words without a release engineer.

| ID | Feature |
| --- | --- |
| E1 | Git-based editor (Decap CMS or equivalent) with a GitHub login for one or two church editors. Saving a sermon, event, or announcement commits to `main` and triggers P3. |
| E2 | Editor guide, one page: how to add an event, a sermon, and a closure notice, and how long until the live site updates (the Actions run, typically a few minutes). |
| E3 | Content templates with required fields so a sermon cannot publish without a title, date, and video URL. |
| E4 | Media rule: YouTube holds video. The repo holds photos already resized for the web. |

Code changes (layout, navigation, new page types) still go through a pull request and P4. Content saves from E1 may commit straight to `main` so a Wednesday announcement is not waiting on a developer.

## Explicitly out of scope

GitHub Pages cannot host these safely or at all. Link to a real system instead of rebuilding it.

- Online giving that collects card or bank details
- Member directory, logins, or a password-protected area
- Kids check-in, attendance, or background-check tracking (Planning Center or a similar church system)
- Live chat or pastoral counseling on the site
- A public, unmoderated prayer wall or comment section
- Email sending from the site itself (no server)
- A custom mobile app
- Donations, event payments, or store checkout
- Multi-language, unless the church commits to maintaining both languages

## Content the church still has to supply

The build can ship with placeholders. The launch cannot.

- Legal name, street address, mailing address, phone, public email
- Service times and what each gathering is
- Pastor and other public leaders: names, roles, photos, bios they approve
- One paragraph: who The Well is
- Worship style and what first-time guests should expect
- Kids: ages, where they go, anything a parent must know
- Giving URL
- YouTube channel or livestream URL
- Social profiles that are actually maintained
- Domain name and who controls DNS
- Who may edit the site (E1 logins)
- Statement that the 16 Fundamental Truths are the church's own confession, or a note where the church differs (do not invent a difference)

## Suggested build order

1. P1–P6, P8–P10 — empty branded shell that deploys itself on merge to `main`.
2. H2, H3, V1, V2, G1 — times, map, phone, giving. This is already useful.
3. H1, N1–N3, A1–A5, M1–M3, V3–V4, Q1–Q4 — launch.
4. E1–E4 — hand updates to the church.
5. S1–S8 — sermons, livestream, events, prayer, newsletter.
6. Phase 3 as the church asks for each item.

## Open decisions (need an answer before build)

1. Which congregation is this, and what is the public name and city?
2. Domain: new name, or an existing one to point at GitHub Pages?
3. Giving provider URL.
4. Where do videos live (YouTube channel)?
5. One editor or two for E1, and should their saves commit straight to `main`?
6. Which ministries exist on day one?
7. Is there already a Google Calendar the office will keep using?
