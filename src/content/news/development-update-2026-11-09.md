---
title: Development Update — 9 November 2026
description: An editable starter valley with NPCs, patrols, authored quests, and multiplayer playtests started from the editor.
date: 2026-11-15
category: Development
image: images/news-community.webp
imageAlt: Concept art of companions looking across a mountain valley
---

The editor and the game came together in a starter valley where we could place scenery and NPCs, export the zone, and play through quests with two accounts.

## Editor

- Add a scenery browser with model previews. Place huts, foliage, and props with checked scale, grounding, and collision.
- Draw and reshape NPC spawn areas, edit patrol routes, and inspect the quest and creature definitions tied to a placement. Add tools to locate escort routes and collection sites directly from the quest inspector.
- Configure test-player spawns and start or stop multiplayer sessions from the editor. Export checked terrain, navigation, and gameplay content together.

## Characters and animation

- Add animated player previews to editor playtests. Smooth the movement of contacts and roaming creatures, with walking and running animation driven by their actual movement.
- Show distinct attack windups and attack animations for multiple creatures in the same encounter.

## World building and quests

- Build an editable starter valley with access roads, named contacts, traders, and creature patrols. Test a hunt for pelts, location objectives, quest travel, and vendor interactions.
- Refine campaign dialogue and quest prerequisites across races, including shared Covenant chapters and race-specific homecomings.

## Engine, client, and server

- Use authored terrain and navigation in predicted multiplayer movement. Check patrols and player travel routes against the zone’s collision before play.
- Give spawned creatures independent pursuit, threat, return, and respawn behaviour. Verify that quest loot and rewards go to the eligible character and persist across reconnects.
- Add in-game party controls to the editor’s account playtests so two players can form and manage a group.
