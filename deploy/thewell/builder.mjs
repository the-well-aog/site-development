// Builds and publishes the website on the server.
//
// - Builds on start, when content changes in Strapi (checked every POLL_SECONDS), when main
//   changes on GitHub (checked every 5 minutes), and nightly (refreshes the YouTube list).
// - Each build goes to its own release folder; `current` is swapped atomically, so visitors
//   never see a half-written site. A failed build leaves the live site untouched.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync } from 'node:fs';
import { promisify } from 'node:util';

const run = promisify(execFile);
const { REPO_URL, BRANCH = 'main', STRAPI_URL } = process.env;
const POLL = Number(process.env.POLL_SECONDS || 60) * 1000;
const WORK = '/srv/work/repo';
const SITE = '/srv/site';
const ENDPOINTS = ['sermons', 'events', 'ministries', 'leaders', 'announcements'];

const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`);
const sh = (cmd, args, options = {}) => run(cmd, args, { maxBuffer: 64 * 1024 * 1024, ...options });
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

/** A string that changes whenever published content is added, edited, unpublished, or deleted. */
async function contentFingerprint() {
  const parts = [];
  for (const endpoint of ENDPOINTS) {
    const url = `${STRAPI_URL}/api/${endpoint}?fields[0]=updatedAt&sort=updatedAt:desc&pagination[pageSize]=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`${endpoint}: ${response.status}`);
    const json = await response.json();
    parts.push(`${endpoint}:${json.meta?.pagination?.total}:${json.data?.[0]?.updatedAt ?? ''}`);
  }
  return parts.join('|');
}

async function remoteHead() {
  const { stdout } = await sh('git', ['ls-remote', REPO_URL, `refs/heads/${BRANCH}`]);
  return stdout.split(/\s/)[0];
}

let building = false;
let queued = null;
let installedLock = null;

async function build(reason) {
  if (building) {
    queued = reason;
    return;
  }
  building = true;
  const started = Date.now();
  log(`Build started: ${reason}`);
  try {
    if (!existsSync(`${WORK}/.git`)) {
      await sh('git', ['clone', '--depth', '1', '--branch', BRANCH, REPO_URL, WORK]);
    } else {
      await sh('git', ['fetch', '--depth', '1', 'origin', BRANCH], { cwd: WORK });
      await sh('git', ['reset', '--hard', `origin/${BRANCH}`], { cwd: WORK });
    }
    const lock = hash(`${WORK}/package-lock.json`);
    if (lock !== installedLock || !existsSync(`${WORK}/node_modules`)) {
      await sh('npm', ['ci', '--no-audit', '--no-fund'], { cwd: WORK });
      installedLock = lock;
    }
    await sh('npm', ['run', 'build'], { cwd: WORK, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });

    const release = `release-${Date.now()}`;
    cpSync(`${WORK}/dist`, `${SITE}/${release}`, { recursive: true });
    rmSync(`${SITE}/current.next`, { force: true });
    symlinkSync(release, `${SITE}/current.next`);
    renameSync(`${SITE}/current.next`, `${SITE}/current`);
    const old = readdirSync(SITE).filter((name) => name.startsWith('release-') && name !== release).sort();
    for (const name of old.slice(0, -1)) rmSync(`${SITE}/${name}`, { recursive: true, force: true });
    log(`Published ${release} in ${Math.round((Date.now() - started) / 1000)}s`);
  } catch (error) {
    const detail = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().slice(-3000) || error.message;
    log(`Build failed; the live site is unchanged.\n${detail}`);
  } finally {
    building = false;
    if (queued) {
      const next = queued;
      queued = null;
      build(next);
    }
  }
}

let lastContent = await contentFingerprint().catch(() => null);
let lastHead = await remoteHead().catch(() => null);
await build('startup');

setInterval(async () => {
  try {
    const fingerprint = await contentFingerprint();
    if (lastContent !== null && fingerprint !== lastContent) build('content changed in Strapi');
    lastContent = fingerprint;
  } catch (error) {
    log(`Could not check Strapi: ${error.message}`);
  }
}, POLL);

setInterval(async () => {
  try {
    const head = await remoteHead();
    if (lastHead !== null && head !== lastHead) build(`new commit ${head.slice(0, 7)}`);
    lastHead = head;
  } catch (error) {
    log(`Could not check GitHub: ${error.message}`);
  }
}, 5 * 60 * 1000);

setInterval(() => build('nightly refresh'), 24 * 60 * 60 * 1000);
