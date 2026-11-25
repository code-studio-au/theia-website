import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { importReleaseNews } from './import-release-news.mjs';

test('signed release news is repeatable, escapes notes, and preserves manual posts', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'theia-release-news-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const key = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
  const signed = (entries, signingKey = privateKey) => {
    const payload = Buffer.from(JSON.stringify({ schema: 1, entries }));
    return Buffer.from(JSON.stringify({
      payload: payload.toString('base64'), signature: sign(null, payload, signingKey).toString('base64'),
    }));
  };
  const date = '2026-11-25T12:00:00Z';
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
