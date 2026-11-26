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

- Add target selection and spell feedback, a backpack, and an in-game vendor panel for the first barter offer, trading a token for training stones.
- Show experience gains, quest objective progress, and supported rewards as players complete encounters.
- Show combat outcomes such as hits, misses, and deflections, giving players a way to see why a strike dealt damage or failed to land.

## Characters and animation

- Test an animated wolf that chases a player, attacks within reach, and returns to its patrol when the pursuit ends, resuming at its previous patrol position.
- Add equipment attachment points, sword holding poses, and upper-body attack animation that can play while a character walks or runs.
- Keep the sword grip in the right hand while the underlying walk or run animation plays, then clear that pose when the player switches to a wand.

## World building

- Exercise an NPC guide, initial kill objectives, personal rewards, and a vendor trade in the training zone.
- Draft the launch campaign and expand the lore and travel notes that would guide later zone and quest work, including routes between early campaign regions.
- Run the training loop on two accounts. Each character completes three kills, claims their own reward, and trades a Training Token for three Training Stones. The playtest leaves one character with a sword and the other with a wand.

## Server and gameplay

- Save character positions, bags, equipped items, and progression. Verify that earned rewards and trades survive reconnecting and restarting the server and database.
- Add server-checked combat outcomes, including sword strikes, status effects, and travelling spells that resolve on impact, with terrain able to block them.
- Restore both characters’ quest progress, experience, bags, and equipped weapons after a PostgreSQL restart. A retried reward request returns its recorded outcome, so the same reward cannot be claimed twice.

## Authoring tools

- Add an offline validator that checks references between the item, ability, NPC, and creature files before a gameplay build is run. It records hashes for checked files.
- Catch missing item, ability, and status references before the zone is loaded. This gives authors feedback at the point they define a reward or encounter.
