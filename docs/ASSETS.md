# Artwork and UI assets

## Reference and generated artwork

Visual reference supplied by the user: `Theia Online_ Explore a Living World.png`.

The built-in image generation tool produced `assets/artwork-source.png`, a text-free art plate preserving the reference composition. WebP regions are packaged in `public/images/`. The source plate is not served to browsers. All site text, layout, buttons, cards and links are real HTML/CSS; no image is used as a whole-page substitute.

The artwork was generated with this prompt:

> Edit target: the attached Theia website reference. Produce a clean art-only background plate maintaining EXACTLY the original 1024 by 1536 composition and every illustration's location and size. Remove ALL lettering, headings, logos, buttons, icons, gold rules, gold borders and interface elements, seamlessly inpainting with underlying artwork. Preserve the hero landscape at y60-500 with three adventurers left and castle right, navy header at y0-60, world ruins panorama y500-690, dark blue play section y690-940 with four distinct artwork thumbnails at x77-285,x300-507,x520-726,x740-948 and y744-850 (human elf dwarf portrait, sword combat, woman crafting, community gathering), story magical golden anchor panorama y940-1155, news art thumbnails y1210-1305 at x78-352,x376-653,x677-950, and misty mountain footer y1380-1450. Fill former text areas with natural matching navy backgrounds. NO TEXT anywhere, NO interface, NO borders. Highest fidelity to original artwork, painterly luminous epic fantasy style. This image will be used as an art atlas behind real accessible HTML, so precise placement is critical.

Assets: `hero.webp`, `world.webp`, `story.webp`, `races.webp`, `combat.webp`, `crafting.webp`, `community.webp`, `news-development.webp`, `news-anchors.webp`, `news-community.webp`, `mountains.webp`. News images can be freely replaced per Markdown entry.

## Existing game sprites

Copied at the user's request from `theia-mmo/content/ui/sprites-v3/sprites/`:

| Website file | Game source |
| --- | --- |
| `public/ui/swords.png` | `icon/swords.png` |
| `public/ui/party.png` | `icon/party.png` |
| `public/ui/experience.png` | `icon/experience.png` |
| `public/ui/crest.png` | `crest/compass.png` |

The thin compass in the wordmark is a code-native SVG matching the supplied reference. Fonts (Cinzel and Crimson Text) are self-hosted through Fontsource; their license files remain with their npm packages.

All project artwork and brand assets retain their original ownership. The repository does not grant a blanket third-party reuse license.
