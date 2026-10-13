# The Well Assembly of God

A static website for The Well Assembly of God, published on GitHub Pages whenever `main` changes.

## Overview

The site gives a guest service times, a first-Sunday welcome, beliefs, ministries, sermons, and events. Page copy is written for the church and grounded in the Assemblies of God Fundamental Truths. The address and phone are real; service times, leader names, and events still need the church's confirmation (see `site.preview`).

Pages are Markdown and Astro templates in this repo. GitHub Actions builds them into plain files and deploys that folder. There is no server, database, or payment form.

```text
edit content  →  commit  →  pull request
merge to main →  GitHub Actions build  →  GitHub Pages
```

## Architecture

Astro compiles `src/pages` and the Markdown in `src/content` into `dist/`. Shared chrome lives in `src/layouts` and `src/components`. Stock photographs sit in `src/assets/photos`; the build serves each as AVIF/WebP at the sizes it is shown (`src/components/Photo.astro`). Logos stay in `public/images`.

GitHub Pages serves `dist/` at `https://the-well-aog.github.io/site-development/` until a custom domain is attached. Forms post to an external form host once `site.formEndpoint` is set; until then the site offers call, message, and directions. Giving links out to the church's provider. Nothing here calls n8n, and the repo holds no secrets.

## Quick start

```powershell
npm install
npm run dev
```

Open `http://localhost:4321`.

A production build with the GitHub Pages base path:

```powershell
$env:SITE_URL = "https://the-well-aog.github.io"
$env:BASE_PATH = "/site-development"
npm run build
npm run preview
```

`npm run build` also checks that local links and images in `dist/` resolve.

## Configuration

Build-time only. Copy `.env.example` to `.env` if you want `npm run build` to pick these up without setting them in the shell. `npm run dev` ignores them when they are unset and serves the site at `/`.

| Variable | Required | Description |
| --- | --- | --- |
| `SITE_URL` | Optional | Public origin, no trailing slash. Default `https://the-well-aog.github.io`. |
| `BASE_PATH` | Optional | URL prefix. Default `/` for local dev. The Pages workflow sets `/site-development`. Use `/` on a custom domain. |
| `FACEBOOK_PAGE` | Optional | Overrides `facebookPage` in `src/data/site.ts` for this build. A public Facebook Page URL. |
| `YOUTUBE_CHANNEL` | Optional | Overrides `youtubeChannel` in `src/data/site.ts`. An `@handle`, channel URL, or `UC…` id. |

Facebook and YouTube are set in `src/data/site.ts` (`facebookPage`, `youtubeChannel`). Leave them blank until the real profiles exist. YouTube titles and thumbnails are read from the channel's public RSS feed at build time, with no API key. The Pages workflow also runs once a day so a new upload shows up without a manual edit. Facebook is the official Page plugin: the timeline loads in the visitor's browser, and it does not use an app id or token.

There is no runtime environment and no `.env` secrets.

## Usage

| Command | What it does |
| --- | --- |
| `npm run dev` | Local site with reload |
| `npm run build` | Static build into `dist/`, then a link check |
| `npm run preview` | Serve `dist/` |
| `npm run check` | Re-check links in an existing `dist/` |

Public routes: `/`, `/visit`, `/about` (story, values, team), `/beliefs`, `/jesus`, `/next-steps`, `/prayer`, `/ministries` and one page per ministry, `/watch` (live, recent messages, sermon notes), `/watch/<video>`, `/sermons/<notes>`, `/events`, `/give`, `/contact`. `/sermons`, `/live`, and `/leadership` redirect to their new homes.

Sermons, events, ministries, leaders, and announcements are Markdown files under `src/content`. Add a file, and the next build publishes it.

## Project structure

```text
.github/workflows/pages.yml   build on pull request, deploy on main
public/                       images, favicon, robots.txt
src/components                the component library (see below)
src/content                   Markdown fallback for sermons, events, ministries, leaders, announcements
deploy/thewell                server builder, compose file, and Apache vhost
src/data                      church facts and service times, navigation, beliefs
src/layouts/Base.astro        document shell
src/pages                     one route per file
src/styles/global.css         design tokens, tone variables, base type and layout only
scripts/check-links.mjs       fails the build on a broken local link
astro.config.mjs              site URL, base path, sitemap
```

## Content (Strapi)

Sermons, events, ministries, leaders, and announcements are edited in Strapi at
https://cms.wellspringstudiollc.com/admin (behind the Wellspring login, then a Strapi account).
The Strapi project lives in `C:\Users\roger\dev\wellspring-cms` and runs on the Wellspring server
in `/opt/strapi` (SQLite, container `strapi`, 127.0.0.1:1337).

- A build reads Strapi when `STRAPI_URL` is set (`src/lib/cms.ts`, wired in `src/content.config.ts`).
  Without it, the Markdown in `src/content` is used, so local dev works offline. If `STRAPI_URL` is
  set and Strapi is unreachable, the build fails rather than publishing stale content.
- Only published entries reach the site. The sample events were imported as drafts.
- Uploaded photos override the stock photo chosen in each entry's `stockPhoto` field.
- Service times stay in `src/data/site.ts`.

## Hosting on the Wellspring server

The live site is https://thewell.wellspringstudiollc.com (temporary, until the church has its own
domain). Files in `deploy/thewell/` are copied to `/opt/thewell` on the server:

- `thewell-builder` clones this repo and builds against Strapi over the private `cms` Docker
  network. It rebuilds when published content changes (checked every minute), when `main` changes
  (checked every 5 minutes), and nightly. Each build is a new release folder; `site/current` is
  swapped atomically and a failed build leaves the live site as it was.
- Apache serves `/opt/thewell/site/current` (`deploy/thewell/thewell.conf`, TLS by certbot).
- Force a rebuild: `docker restart thewell-builder`. Logs: `docker logs -f thewell-builder`.
- Moving to the church's own domain: change `SITE_URL` in `/opt/thewell/docker-compose.yml`, add
  the domain to the vhost, run certbot, and redirect the subdomain to it.

GitHub Pages still builds from `main` (also from Strapi) as a backup copy.

## Components

Pages are composed from a small library in `src/components`. Each component owns its styles; `global.css` holds only tokens and base rules. Colour comes from tone variables (`--bg`, `--fg`, `--heading`, `--accent-ink`, …), so a component reads correctly inside a paper, sand, or navy `Section` without overrides.

| Component | Use |
| --- | --- |
| `PageHeader` | Every page's title block: eyebrow or back link, title, lede, meta, actions, optional image |
| `Section`, `SectionHeader` | Page bands (`tone`, `width`, `space`) and their heading row |
| `Button`, `Icon` | All links styled as actions; inline SVG icons |
| `ServiceTimes` | Renders `site.services` (compact or cards, filterable by day) |
| `FeatureGrid`, `NumberedList`, `Accordion` | Card or ruled grids, numbered steps, expandable Q&A and beliefs |
| `MessageCard`, `MinistryCard`, `EventList`, `VideoEmbed` | Content listings |
| `DetailLayout` | Ministry and event detail body with the sticky facts panel |
| `ContactOptions` | A real form when `site.formEndpoint` is set; otherwise call, message, and directions |
| `CtaBand`, `Scripture` | Closing invitations and quoted verses |

Navigation for the header, mobile menu, and footer comes from one model in `src/data/nav.ts`.

## Tech stack

- Astro 5, static output
- GitHub Actions and GitHub Pages
- Fraunces and Outfit from Google Fonts
- Markdown content collections

## Notes / conventions

- `/beliefs` restates each of the 16 Fundamental Truths in plain language with its Scripture references and links to the official statement on ag.org. Keep it faithful to that statement.
- Scripture quotations are NKJV.
- Service times live in `site.services` (confirmed by the church). Every page reads them from there.
- `site.preview` in `src/data/site.ts` notes that leader names and ministry meeting details are awaiting confirmation, and publishes events marked `draft: true` as samples. Set it to `false` at launch.
- `site.formEndpoint`: paste a Formspree, Basin, or Getform endpoint to turn the Visit, Contact, and Prayer panels into working forms.
- Leader files hold role descriptions only. Add real names, bios, and an optional `photo:` path (under `public/`). Without a photo the team grid shows initials.
- Do not collect card numbers, passwords, or prayer-request storage in this repo. Point Give at the church's giving provider when that URL exists.
- No secrets in the repo. This site does not call Autotask or n8n.
- One-time Pages setting: in the GitHub repo, Settings → Pages → Build and deployment → Source: GitHub Actions. After that, a merge to `main` publishes the site.
- For a custom domain, set `BASE_PATH` to `/` in `.github/workflows/pages.yml` and add the domain under Pages settings.
