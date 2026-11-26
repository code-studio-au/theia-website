---
title: Development Highlight — A Particle Workspace for Theia
description: An in-editor workspace for previewing particle effects and adjusting how they change over time.
date: 2026-11-10
category: Development
image: images/news-development.webp
imageAlt: Fantasy city beneath blue and gold banners
---

We adapted the Sprinkles particle tools to run inside Theia’s Bevy zone editor. The Particles workspace has its own preview camera and input focus. We can orbit an effect and adjust its emitters, then switch back to the zone in the same window.

## See an effect change as you edit

Each emitter has controls for when it starts, how many particles it releases, and how long they last. Colour gradients set the colours a particle moves through as it ages. Curves shape how quickly a value changes over time. The live preview lets us check the timing of a burst and see how it fades.

An effect can use several emitters, each with its own timing. We can pause the animation, orbit the preview camera, and inspect how those layers overlap. The controls use the original Sprinkles curve and gradient editors, adapted to run in our Bevy 0.20 app.

<figure>
  <a href="../../images/news/theia-particle-workspace.webp">
    <img src="../../images/news/theia-particle-workspace.webp" width="3440" height="1440" loading="lazy" alt="A cyan particle burst playing in Theia’s integrated particle workspace beside the emitter controls">
  </a>
  <figcaption>A particle effect in the editor. Select the screenshot to see the preview and emitter controls at full size.</figcaption>
</figure>

## Keep the zone ready to edit

Switching workspaces preserves the zone draft and its undo history. The particle workspace keeps its project and playback state when we switch away. We can pause an effect to examine it, return to the terrain, then pick up the effect from where we left it.

Only the active workspace handles keyboard and mouse input. A shortcut in the particle workspace acts on the effect, and returning to the zone brings its camera and editing controls back into focus. Later in November, we tested how saved effects move from this workspace into a game build. [See the editor integration and side-by-side particle tests](../development-highlight-theia-zone-editor/).
