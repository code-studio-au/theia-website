---
title: Development Update — 19 October 2026
description: Streamed terrain, predicted multiplayer movement, and validation for larger world imports.
date: 2026-10-25
category: Development
image: images/news-community.webp
imageAlt: Concept art of companions overlooking a mountain valley
---

The focus moved from a single reference scene to a world large enough to test terrain streaming and multiplayer movement over long distances.

## Engine and networking

- Make the client respond immediately to movement input and reconcile it with the server’s position. Exercise that correction over encrypted multiplayer connections with delay, packet loss, and out-of-order delivery.
- Prepare nearby terrain and collision as players move, then unload distant terrain. Test a full crossing of a 16 × 16 km prototype world with terrain coming and going along the route.
- Improve camera collision in large scenes by using the geometry already prepared for collision queries, reducing repeated scans of render meshes.
- Keep a short history of movement inputs and replay the remaining inputs after each server correction. At an unprepared terrain boundary, pause movement until collision is ready. The teleport test also waits for collision at the destination before restoring movement.

## Characters and animation

- Use a shared locomotion setup in the terrain prototype and smooth character movement between server updates. Test local and remote animation with two clients connected, including after a long-distance teleport.
- Drive idle, walk, run, and jump from the character’s movement. Blend remote movement between updates so a character seen by another player moves smoothly across the terrain.

## World building

- Assemble forest test packages with terrain, foliage, and static collision. Check that material placement and lighting survive conversion and that trees and ground line up with their collision surfaces, including where neighbouring terrain sections meet.
- Use the large prototype terrain as the default environment for traversal tests and retain the town and farmhouse scenarios for regression checks.
- Divide the prototype into 128-metre tiles. During the full crossing, the player travelled through 125 tile columns while the client kept at most 81 visual terrain tiles loaded.

## Editor and tools

- Validate terrain, materials, and collision as part of the import and inspection pipeline. Exercise the development launcher’s two-client startup and cleanup so repeated tests can start from a clean session after interruptions or a client failure.
- Check that imported terrain packages include their material dependencies and that neighbouring tiles meet at the same height along shared collision edges.
