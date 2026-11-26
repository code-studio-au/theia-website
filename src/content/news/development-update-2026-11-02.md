---
title: Development Update — 2 November 2026
description: The first interactive zone editor, more supported quest objectives, and a clearer combat interface.
date: 2026-11-08
category: Development
image: images/story/anchor-mystery.webp
imageAlt: Concept art of a golden crystal suspended within bronze rings
---

This week added an interactive zone editor and gave quest playtests more ways to track objectives, show rewards, and carry progress between sessions.

## Editor

- Add terrain sculpting and colour painting with brush previews, undo, and redo. Place and duplicate objects, ground them on the terrain, and frame selected objects in the viewport.
- Draw road and stream guides, place NPC and quest markers, and scatter vegetation from a saved seed. Mark where test players should enter a zone.
- Export a small playable example from the editor and validate its terrain and collision in a multiplayer session.

## World building and quests

- Extend the Human campaign outline and write missing quest dialogue. Develop longer story chapters alongside the quest briefs.
- Support quest steps that involve reading a document, finding a required item on a creature, and delivering items for a fixed reward. Add quest markers and minimap guidance for search areas.

## Client

- Improve enemy nameplates, floating damage, and combat history. Restyle NPC dialogue and the quest-document reader, and show item icons in reward lists.
- Test action-bar editing across several window sizes and show the character’s saved level in the player frame.

## Server and gameplay

- Adopt explicit targets, manual facing, character-relative movement, and weapon-timed autoattacks. Give each ability its own casting restrictions.
- Save journal progress and handle quest item pickup and fixed rewards through the server so reconnecting or retrying a request preserves the correct result.
