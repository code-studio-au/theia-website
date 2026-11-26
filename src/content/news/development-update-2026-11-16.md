---
title: Development Update — 16 November 2026
description: Native character creation, party features, and terrain editing across the Covenant map.
date: 2026-11-22T09:45:51Z
category: Development
image: images/news-development.webp
imageAlt: Fantasy city beneath blue and gold banners
---

From 16–22 November, we tested the full Millhaven terrain, expanded the editor to cover the seven-zone Covenant map, and brought character creation into the game window.

## Client

- Bring local development sign-in, character selection, and customisation into a single game window. Add a dedicated courtyard for the character roster.
- Refresh the interface with gold frames, sapphire buttons, and illustrated Millhaven loading art. Add saved controls for VSync, frame rate limits, and interface scale.
- Show party invitations in-game and add compact party frames. Click a member’s frame to select them and see their current health and mana.
- Add an overview of Millhaven with named landmarks, pins, and distances, from village centre to bandit caves. Add a Covenant map that highlights each of its seven zones by name.

## Characters and animation

- Build modular heroes with seven cosmetic choices and an animated preview that rotates to show different angles. Verify that a character’s look is restored after leaving and returning to the game.

## Server

- Let eligible party members share an active escort, with each character earning and saving their quest completion individually.
- Give party leaders shared unit marks that only their party can see. Leaders can clear an individual mark.
- Save each character’s appearance and show their custom look to other players.

## World building

- Outline the Aelari First Hunt and Road Home epilogue, and refine the early Human and Aelari zone plans for Millhaven and Boughstead, including their level 1–20 progression.
- Prepare a gentler terrain variant across the seven Covenant zones, including Millhaven, Stoneford, and Valecrown, for traversal and authoring tests.

## Editor

- Open and edit the full imported Millhaven terrain. Sculpt and paint across tile boundaries, preview changes, and save edits with undo and redo without changing the original terrain file.
- Add multi-object selection and grouped transforms for scenery, markers, and other placements. Extend the smoothing brush and add a tool that flattens an area to the height sampled when the stroke starts.

## Engine

- Stream the imported Millhaven terrain at one-metre spacing near the player and use simpler meshes farther away. Test village traversal, terrain edges, and high ground in the local multiplayer build, checking that distant terrain unloads correctly.
- Use optimised builds by default for local Millhaven playtests.
