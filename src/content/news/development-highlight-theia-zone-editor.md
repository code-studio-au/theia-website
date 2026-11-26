---
title: Development Highlight — Building Theia’s MMO Editor in Bevy
description: Our custom Bevy editor brings world building, particle authoring, and multiplayer playtesting into one workflow.
date: 2026-11-21
category: Development
image: images/story/heartlands.webp
imageAlt: Concept art of a village in the Heartlands
---

We’re building Theia’s MMO editor directly in Bevy, the same engine we use for the game. What began as a small terrain and object editor now brings world building, quests, and particle effects together with multiplayer playtesting. We can sculpt a road, lay out an escort along it, place an effect near its destination, then start a session and see how the whole route plays with two people.

## Shape and dress the terrain

We can raise, lower, flatten, and smooth imported terrain, then paint ground colours across tile boundaries. Brush previews show the area a stroke will affect. The editor saves brush changes separately from the imported heights, so we can undo a stroke or revisit a draft using the original terrain.

The scenery browser previews models before placement. In the viewport, we can move, rotate, and scale objects or enter exact values in the properties panel. Roads and streams use editable guides, and we can scatter vegetation with a saved seed to reproduce a placement.

Millhaven gave the editor a full zone to work with. A single brush stroke can cross several terrain tiles, for example to smooth the approach to a road or paint a continuous riverbank. We can reopen that draft, revisit the edit, and keep the imported height data intact.

## Build quests and encounters in the zone

We can place named NPCs, draw spawn areas for creatures, and define patrol routes. Selecting a quest contact brings up its linked quests in the inspector. For an escort, we can see the contact, route, and destination together on the terrain. For a collection objective, we can jump the camera to the relevant area.

<figure>
  <a href="../../images/news/theia-zone-editor-escort-route.webp">
    <img src="../../images/news/theia-zone-editor-escort-route.webp" width="3440" height="1440" loading="lazy" alt="The Theia zone editor showing an escort route, its destination marker, and the quest inspector">
  </a>
  <figcaption>An escort route in the starter valley. Select the screenshot to see the route and inspector at full size.</figcaption>
</figure>

## Author particle effects in the same editor

We ported the Sprinkles particle runtime and editor from Bevy 0.19 to 0.20 and embedded its authoring workspace in Theia. Artists can adjust emitter timing, lifetime, curves, and colour gradients in a live preview. Switching back to the zone keeps both the effect and the terrain draft open. The [particle workspace highlight](../development-highlight-particle-workspace/) shows the controls in action.

An effect can be saved once and placed at several locations, each with its own position, rotation, and scale. The zone export includes the placements, effect files, and textures they reference. The game client verifies those files and starts the effects once the surrounding scene is ready. We checked this handoff with two connected clients viewing the exported world.

## Compare the original and Theia’s port one to one

We ran all seven bundled Sprinkles effects in the original tool and in Theia’s Bevy 0.20 preview. Both runs used the same effect files, matching emitter seeds, and fixed 1/60-second simulation steps. We captured five points in each effect’s playback, giving us 35 side-by-side comparisons. A second run of Theia gave us a repeatability check.

The captured previews closely matched in shape, colour, and arrangement. The Magic Puff comparison below comes from a follow-up run with the emitter outlines hidden in both previews. We tested the exported effects separately in the connected game, where scene lighting, camera distance, and terrain loading affect what players see.

<figure>
  <a href="../../images/news/theia-particle-visual-comparison.webp">
    <img src="../../images/news/theia-particle-visual-comparison.webp" width="1500" height="712" loading="lazy" alt="Two closely matching Magic Puff particle previews, the original Sprinkles preview on the left and Theia’s port on the right">
  </a>
  <figcaption>The Magic Puff example at 30 simulation steps. Original Sprinkles on the left, Theia’s port on the right.</figcaption>
</figure>

## Go from editing to playtesting

The editor starts a local multiplayer playtest from configured player spawns. Its export carries terrain, collision, navigation, and gameplay references together. Route and collision checks can catch a blocked path before launch. In the connected game, we can walk that route ourselves and see how the same quest behaves when two players approach it from different parts of the zone.
