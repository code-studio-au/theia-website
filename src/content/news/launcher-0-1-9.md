---
title: Launcher 0.1.9
slug: auto-launcher-0-1-9
description: Direct tester sign-in, smaller client updates, and on-demand operation for the Sydney realm.
date: 2026-11-25T10:40:52Z
category: Release Notes
image: images/covenant-high-city.webp
imageAlt: Concept art of the Covenant capital above its harbour
---

## Launcher

- Add direct Cognito sign-in for invited testers and keep browser sign-in available.
- Verify the signed client manifest and reuse unchanged files. Use a binary patch when one is available for a changed file.

## Infrastructure

- Enable on-demand startup and automatic idle shutdown for the Sydney development realm. Save pending progress before shutting the server down.
- Give gateway deployments dedicated AWS permissions and scope API stage tagging to the Sydney gateway.

## Release workflow

- Publish Linux downloads on GitHub Pages and verify the live launcher and client executable.
- Import signed release entries into the public News page and RSS feed.

[Go to downloads](../../download/)
