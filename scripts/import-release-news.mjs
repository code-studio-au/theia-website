import { createPublicKey, verify } from 'node:crypto';
import { readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const GENERATED = /^auto-(client|launcher)-\d+(?:-\d+){2,3}\.md$/;
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

export async function importReleaseNews(input, key, output) {
  const entries = decodeNews(input, key);
  const existing = await readdir(output);
  await Promise.all(existing.filter(name => GENERATED.test(name)).map(name => rm(resolve(output, name))));
  const posts = entries.filter(entry => !existing.includes(`${slug(entry)}.md`));
  for (const entry of posts) {
    await writeFile(resolve(output, `auto-${slug(entry)}.md`), article(entry), { flag: 'wx' });
  }
  return posts.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path || (await stat(path)).size > MAX_BYTES) throw new Error('Expected a bounded release news file');
  const count = await importReleaseNews(await readFile(path), process.env.THEIA_RELEASE_PUBLIC_KEY,
    fileURLToPath(new URL('../src/content/news/', import.meta.url)));
  console.log(`Imported ${count} release news posts.`);
}
