---
title: Launcher 0.1.10
slug: auto-launcher-0-1-10
description: Two compressed downloads for fresh installs and automatic retry when a transfer drops.
date: 2026-11-25T22:27:30Z
category: Release Notes
image: images/covenant-high-city.webp
imageAlt: Concept art of the Covenant capital above its harbour
---

## Launcher

- Download an executable bundle and an asset bundle on fresh installs. Together they cut the 0.1.0.13 download from 296 MB to 159 MB.
- Retry interrupted downloads automatically and resume from the last saved byte when the server supports it.
- Reuse unchanged files on updates. Fetch individual files or binary patches for the changes.

## Release workflow

- Verify the signed bundle index and both ZIP checksums after publishing to GitHub Pages.
- Retain the previous release's downloads so existing installs can finish. Reuse the 0.1.0.13 client for this launcher-only release.

[Go to downloads](../../download/)
