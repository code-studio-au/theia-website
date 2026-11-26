import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { importReleaseNews } from './import-release-news.mjs';

function signedNewsFixture() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const key = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
  function signed(entries, signingKey = privateKey) {
    const payload = Buffer.from(JSON.stringify({ schema: 1, entries }));
    return Buffer.from(JSON.stringify({
      payload: payload.toString('base64'), signature: sign(null, payload, signingKey).toString('base64'),
    }));
  }
  return { key, signed };
}

test('signed release news is repeatable, escapes notes, and preserves manual posts', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'theia-release-news-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const { key, signed } = signedNewsFixture();
  const date = '2026-11-20T12:00:00Z';
  const client = { product: 'client', version: '0.1.0.11', date, notes: ['Original client notes'] };
  const launcher = { product: 'launcher', version: '0.1.8', date,
    notes: ['Smaller updates', '<script>alert(1)</script> [link](javascript:alert(1))'] };
  await writeFile(join(folder, 'client-0-1-0-11.md'), 'hand-written post');
  const feed = signed([client, launcher]);
  assert.equal(await importReleaseNews(feed, key, folder), 1);
  assert.equal(await importReleaseNews(feed, key, folder), 1);
  assert.deepEqual((await readdir(folder)).sort(), ['auto-launcher-0-1-8.md', 'client-0-1-0-11.md']);
  const post = await readFile(join(folder, 'auto-launcher-0-1-8.md'), 'utf8');
  assert.match(post, /title: "Launcher 0\.1\.8"/);
  assert.ok(!post.includes('<script>'));
  assert.ok(post.includes('\\[link\\]\\('));
  assert.equal(await readFile(join(folder, 'client-0-1-0-11.md'), 'utf8'), 'hand-written post');

  const other = generateKeyPairSync('ed25519').privateKey;
  await assert.rejects(importReleaseNews(signed([client, launcher], other), key, folder), /signature/);
  await assert.rejects(importReleaseNews(signed([launcher, launcher]), key, folder), /Duplicate/);
  assert.equal(await readFile(join(folder, 'auto-launcher-0-1-8.md'), 'utf8'), post);
});

test('groups builds, server updates and website changes in Sydney calendar weeks', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'theia-weekly-news-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const { key, signed } = signedNewsFixture();
  const entries = [
    { product: 'launcher', version: '0.1.11', date: '2026-11-29T12:59:59Z', notes: ['Improved downloads', 'Updated account panel'] },
    { product: 'client', version: '0.1.0.15', date: '2026-11-26T00:00:00Z', notes: ['Quest journal'] },
    { product: 'launcher', version: '0.1.3', date: '2026-11-23T00:00:00Z', notes: ['Improved downloads', 'Launcher updates'] },
    { product: 'launcher', version: '0.1.12', date: '2026-11-29T13:00:00Z', notes: ['Next week'] },
  ];
  const details = [
    { product: 'server', version: 'realm-1', date: '2026-11-23T00:00:00Z', notes: ['Hosted playtest'] },
    { product: 'server', version: 'realm-2', date: '2026-11-26T00:00:00Z', notes: ['Idle shutdown'] },
    { product: 'website', version: '9bcdef0', date: '2026-11-26T00:00:00Z', notes: ['Account overview'] },
    { product: 'website', version: '123abc4', date: '2026-11-23T00:00:00Z', notes: ['Playtest downloads'] },
    { ...entries[1], notes: ['Qualified the Linux export'] },
  ];
  await writeFile(join(folder, 'auto-launcher-0-1-3.md'), 'old generated post');
  assert.equal(await importReleaseNews(signed(entries), key, folder, details), 2);
  assert.deepEqual((await readdir(folder)).sort(), ['auto-development-2026-11-23.md', 'auto-development-2026-11-30.md']);
  const post = await readFile(join(folder, 'auto-development-2026-11-23.md'), 'utf8');
  assert.match(post, /## Launcher\n\n\*\*0\.1\.3 → 0\.1\.11\*\*\n\n- Improved downloads\n- Launcher updates\n- Updated account panel/);
  assert.match(post, /## Client\n\n\*\*0\.1\.0\.15\*\*\n\n- Quest journal\n- Qualified the Linux export/);
  assert.match(post, /## Server\n\n\*\*realm-1 → realm-2\*\*\n\n- Hosted playtest\n- Idle shutdown/);
  assert.match(post, /## Website\n\n\*\*123abc4 → 9bcdef0\*\*\n\n- Playtest downloads\n- Account overview/);
  assert.doesNotMatch(post, /Next week/);
});
