---
title: Development Update — 12 October 2026
description: Theia’s first playable prototype, with two-player movement, animated characters, and an enterable farmhouse.
date: 2026-10-18
category: Development
image: images/world.webp
imageAlt: Concept art of the ruins of an older world
---

Theia’s first commit landed on 16 October. The initial prototype put two players in the same world and gave us a scene to test movement, animation, and collision together.

## Engine and networking

- Set up the game client and a server that controls player movement. Connect two clients to the same test world and verify that both see each other move.
- Add a third-person camera and collision against the terrain and buildings. Extend server-controlled walking from a flat test area to uneven terrain, including the approach to the farmhouse.
- Run the prototype server at 30 updates per second. Clients send movement input, and the server applies speed limits before sending back positions. The camera pulls in when a wall blocks the view and moves back out when the view clears.

## Characters and animation

- Bring a textured human character and a wolf into the reference scene. Check how the models and their animation clips look under the game’s lighting at rest and in motion.
- Animate human players as they move across the shared terrain, including the other player’s character.
- Select idle, walk, and run clips from movement. Preview the wolf’s attack clip separately in the model inspector before adding creature combat to the game.

## World building

- Assemble a reference map with textured terrain, buildings, props, and static water surfaces.
- Give the farmhouse a walkable ground floor and a fixed entrance ramp. Use the building to test outdoor-to-indoor movement and camera clearance around the ramp and doorway.
- Use the farmhouse floor and interior walls to check that a player can enter, move around inside, leave, and re-enter through the same doorway.

## Editor and tools

- Add inspection tools for textured model exports and animation previews. Verify terrain conversion and object placement before loading the assembled scene in the game, using textured previews to compare results.
- Frame previews using the model’s actual bounds, with a scale reference and named animation clips, so character size and poses can be checked before assembling the scene.
