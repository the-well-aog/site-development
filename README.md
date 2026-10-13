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

Astro compiles `src/pages` and the Markdown in `src/content` into `dist/`. Shared chrome lives in `src/layouts` and `src/components`. Photographs sit in `public/images` and are copied through as-is.

GitHub Pages serves `dist/` at `https://the-well-aog.github.io/site-development/` until a custom domain is attached. Forms are visual only. Giving links out later. Nothing here calls n8n, and the repo holds no secrets.

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

Public routes: `/`, `/visit`, `/jesus`, `/about`, `/beliefs`, `/leadership`, `/ministries`, `/ministries/kids`, `/ministries/students`, `/ministries/groups`, `/sermons`, `/live`, `/events`, `/give`, `/contact`, `/prayer`, `/next-steps`.

Sermons, events, ministries, leaders, and announcements are Markdown files under `src/content`. Add a file, and the next build publishes it.

## Project structure

```text
.github/workflows/pages.yml   build on pull request, deploy on main
public/                       images, favicon, robots.txt
src/components                header, footer, page hero, placeholder form
src/content                   sermons, events, ministries, leaders, announcements
src/data                      church facts, belief titles, lorem copy
src/layouts/Base.astro        document shell
src/pages                     one route per file
src/styles/global.css         the visual system
scripts/check-links.mjs       fails the build on a broken local link
astro.config.mjs              site URL, base path, sitemap
```

## Tech stack

- Astro 5, static output
- GitHub Actions and GitHub Pages
- Fraunces and Outfit from Google Fonts
- Markdown content collections

## Notes / conventions

- `/beliefs` restates each of the 16 Fundamental Truths in plain language with its Scripture references and links to the official statement on ag.org. Keep it faithful to that statement.
- Scripture quotations are NKJV.
- `site.preview` in `src/data/site.ts` shows "awaiting confirmation" notes beside service times, leader names, and meeting times, and publishes events marked `draft: true` as samples. Set it to `false` at launch.
- Leader files hold role descriptions only. Add real names, photos, and bios the leaders approve.
- Do not collect card numbers, passwords, or prayer-request storage in this repo. Point Give at the church's giving provider when that URL exists.
- No secrets in the repo. This site does not call Autotask or n8n.
- One-time Pages setting: in the GitHub repo, Settings → Pages → Build and deployment → Source: GitHub Actions. After that, a merge to `main` publishes the site.
- For a custom domain, set `BASE_PATH` to `/` in `.github/workflows/pages.yml` and add the domain under Pages settings.
