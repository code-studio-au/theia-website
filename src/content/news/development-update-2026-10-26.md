---
title: Development Update — 26 October 2026
description: Persistent characters, the first training-zone gameplay loop, and early melee and creature behaviour.
date: 2026-11-01
category: Development
image: images/story/heartlands.webp
imageAlt: Concept art of a village in the Heartlands
---

The training zone began to connect combat, quests, and inventory into a single playtest. Two accounts could play independently and pick up their progress again after a restart.

## Client

- Add target selection and spell feedback, a backpack, and an in-game vendor panel for the first barter offer.
- Show experience gains, quest objective progress, and supported rewards as players complete encounters.

## Characters and animation

- Test an animated wolf that chases a player, attacks within reach, and returns to its patrol when the pursuit ends.
- Add equipment attachment points, sword holding poses, and upper-body attack animation that can play while a character walks or runs.

## World building

- Exercise an NPC guide, initial kill objectives, personal rewards, and a vendor trade in the training zone.
- Draft the launch campaign and expand the lore and travel notes that would guide later zone and quest work.

## Server and gameplay

- Save character positions, bags, equipped items, and progression. Verify that earned rewards and trades survive reconnecting and restarting the server and database.
- Add server-checked combat outcomes, including sword strikes, status effects, and travelling spells that resolve on impact.

## Authoring tools

- Add an offline validator that checks references between the item, ability, NPC, and creature files before a gameplay build is run.
