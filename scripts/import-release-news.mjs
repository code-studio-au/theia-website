import { createPublicKey, verify } from 'node:crypto';
import { readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { developmentDetails } from './development-details.mjs';

const MAX_BYTES = 1024 * 1024;
const GENERATED = /^auto-(?:(client|launcher)-\d+(?:-\d+){2,3}|development-\d{4}-\d{2}-\d{2})\.md$/;
const FIRST_WEEK = '2026-11-23';
const SITE_DATE = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney', year: 'numeric', month: 'numeric', day: 'numeric',
});
const WEEK_TITLE = new Intl.DateTimeFormat('en-AU', { timeZone: 'UTC', dateStyle: 'long' });
const VERSION = /^(0|[1-9][0-9]{0,7})(\.(0|[1-9][0-9]{0,7})){2,3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const STYLE = {
  client: ['Client', 'images/news-development.webp', 'Fantasy city beneath blue and gold banners'],
  launcher: ['Launcher', 'images/covenant-high-city.webp', 'Concept art of the Covenant capital above its harbour'],
};

function base64(value) {
  if (typeof value !== 'string' || value.length > MAX_BYTES) throw new Error('Invalid release news encoding');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('Invalid release news encoding');
  return bytes;
}

function shape(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function escapeMarkdown(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replace(/[\\`*_\[\]{}()!#|]/g, '\\$&');
}

function decodeNews(input, encodedKey) {
  if (input.length > MAX_BYTES) throw new Error('Signed release news is too large');
  const envelope = JSON.parse(input);
  if (!shape(envelope, ['payload', 'signature'])) throw new Error('Invalid release news envelope');
  const der = base64(encodedKey);
  if (der.length !== 44 || der.subarray(0, 12).toString('hex') !== '302a300506032b6570032100') {
    throw new Error('Configure the Ed25519 release public key as base64 DER');
  }
  const payload = base64(envelope.payload);
  const signature = base64(envelope.signature);
  if (signature.length !== 64 || !verify(null, payload, createPublicKey({
    key: der, format: 'der', type: 'spki',
  }), signature)) throw new Error('Release news signature could not be verified');
  const archive = JSON.parse(payload);
  if (!shape(archive, ['schema', 'entries']) || archive.schema !== 1
      || !Array.isArray(archive.entries) || archive.entries.length > 256) {
    throw new Error('Unknown release news archive');
  }
  const seen = new Set();
  for (const entry of archive.entries) {
    if (!shape(entry, ['product', 'version', 'date', 'notes']) || typeof entry.product !== 'string' || !Object.hasOwn(STYLE, entry.product)
        || typeof entry.version !== 'string' || !VERSION.test(entry.version)
        || typeof entry.date !== 'string' || !DATE.test(entry.date)
        || !Number.isFinite(Date.parse(entry.date))
        || new Date(entry.date).toISOString().replace('.000Z', 'Z') !== entry.date
        || !Array.isArray(entry.notes) || entry.notes.length < 1 || entry.notes.length > 12
        || entry.notes.some(line => typeof line !== 'string' || [...line].length < 1
          || [...line].length > 280 || line.trim() !== line || /[\p{Cc}\p{Zl}\p{Zp}]/u.test(line))) {
      throw new Error('Invalid release news entry');
    }
    const id = slug(entry);
    if (seen.has(id)) throw new Error('Duplicate release news entry');
    seen.add(id);
  }
  return archive.entries;
}

function slug(entry) {
  return `${entry.product}-${entry.version.replaceAll('.', '-')}`;
}

function article(entry) {
  const [name, image, imageAlt] = STYLE[entry.product];
  const fields = { title: `${name} ${entry.version}`, description: entry.notes[0],
    date: entry.date, category: 'Release Notes', image, imageAlt };
  const header = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  return `---\n${header}\n---\n\n${name} **${entry.version}** is available on the Linux Development channel.\n\n`
    + '## Changes\n\n' + entry.notes.map(line => `- ${escapeMarkdown(line)}`).join('\n')
    + '\n\n[Go to downloads](../../download/)\n';
}

function weekOf(date) {
  const parts = Object.fromEntries(SITE_DATE.formatToParts(new Date(date)).map(({ type, value }) => [type, value]));
  const monday = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return monday.toISOString().slice(0, 10);
}

function weeklyArticle(week, entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)
    || a.version.localeCompare(b.version, 'en', { numeric: true }));
  const fields = { title: `Development Update — ${WEEK_TITLE.format(new Date(week))}`,
    description: 'This week’s Launcher, Client and Server changes for Theia.',
    date: sorted.at(-1).date, category: 'Development', image: STYLE.client[1], imageAlt: STYLE.client[2] };
  const header = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  const sections = [['launcher', 'Launcher'], ['client', 'Client'], ['server', 'Server']].map(([product, name]) => {
    const releases = sorted.filter(entry => entry.product === product);
    if (!releases.length) return `## ${name}\n\nNo builds recorded this week.`;
    const first = releases[0].version;
    const last = releases.at(-1).version;
    const versions = first === last ? `**${first}**` : `**${first} → ${last}**`;
    const notes = [...new Set(releases.flatMap(entry => entry.notes))];
    return `## ${name}\n\n${versions}\n\n${notes.map(line => `- ${escapeMarkdown(line)}`).join('\n')}`;
  });
  return `---\n${header}\n---\n\n${sections.join('\n\n')}\n`;
}

export async function importReleaseNews(input, key, output, details = []) {
  const entries = decodeNews(input, key);
  const existing = await readdir(output);
  const weeks = new Map();
  const posts = new Map();
  for (const entry of entries) {
    const week = weekOf(entry.date);
    if (week >= FIRST_WEEK) {
      if (!weeks.has(week)) weeks.set(week, new Map());
      weeks.get(week).set(slug(entry), entry);
    } else if (!existing.includes(`${slug(entry)}.md`)) {
      posts.set(`auto-${slug(entry)}.md`, article(entry));
    }
  }
  for (const entry of details) {
    const week = weekOf(entry.date);
    if (!weeks.has(week)) weeks.set(week, new Map());
    const weekly = weeks.get(week);
    const previous = weekly.get(slug(entry));
    const earlierNotes = previous?.notes.map(line => entry.corrections?.[line] ?? line) ?? [];
    weekly.set(slug(entry), { ...(previous ?? entry), notes: [...earlierNotes, ...entry.notes] });
  }
  for (const [week, releases] of weeks) {
    posts.set(`auto-development-${week}.md`, weeklyArticle(week, [...releases.values()]));
  }
  await Promise.all(existing.filter(name => GENERATED.test(name)).map(name => rm(resolve(output, name))));
  for (const [filename, content] of posts) await writeFile(resolve(output, filename), content, { flag: 'wx' });
  return posts.size;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path || (await stat(path)).size > MAX_BYTES) throw new Error('Expected a bounded release news file');
  const count = await importReleaseNews(await readFile(path), process.env.THEIA_RELEASE_PUBLIC_KEY,
    fileURLToPath(new URL('../src/content/news/', import.meta.url)), developmentDetails);
  console.log(`Imported ${count} release news posts.`);
}
