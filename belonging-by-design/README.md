# Belonging by Design · scroll POC

Build of the FirstPlace wireframe (Figma `6:137`) with GSAP + ScrollTrigger, testing the riskier pieces from the Wireframes note.

- Local: `yarn dev` → http://localhost:5173/belonging-by-design/
- Build: `yarn build:belonging-by-design` (writes `dist/`, which `index.html` references)

## How the wireframe interactions map to scroll

| Wireframe | Build |
| --- | --- |
| Click-to-advance slides (03, 05, 09, 12) | Advance as you scroll. Media is CSS-sticky; steps scroll past it (`src/js/lib/story.js`). Every state is a pure function of scroll position, so scrolling back rewinds. |
| Image stays, text changes (03, 05, 09) | Text fades in as it rises into the reading area and out as it leaves. Stacked on small screens: media pinned on top, text scrolls under it. |
| Community scene (06) | Scene sticks; callout cards scroll over it; each card grows its layer in from the layer's focal point. Below 16:9 the canvas pans to the newest layer. |
| See more (02, 05, 08, 10, 15) | Expands in place (`src/js/lib/expand.js`). Opening never moves the scroll position; closing holds the pressed link still. Native scroll anchoring is off so it can't double-correct. |
| Clickable brain (09) | Hotspots jump to their card. Under 900px the dots are too close for fingers (limbic/hypothalamus ~25px apart), so a row of region chips does the same job. |
| Video grid (07) | Stand-in collage; play buttons are placed by % on the faces and scale with it (48px minimum). Clicking opens a placeholder dialog. |
| Bridge cycle (12) | Tiles light in turn as you scroll; ring rotates with progress. Under 700px it becomes a vertical list. |
| Literata | Google Fonts variable build with the `opsz` axis, pinned with `font-variation-settings: "opsz" 12`. |

## Image format (community scene layers)

The seven layers are full-frame 2048×1152 transparent overlays, so they register with the base at any crop.

| | PNG (Figma export) | WebP q82 | AVIF q60 |
| --- | --- | --- | --- |
| Base (opaque) | 401 KB | 185 KB | 149 KB |
| 7 overlay layers | 847 KB | 263 KB | 153 KB |

Shipped as WebP (alpha, universal support). AVIF would save another ~40% on the layers if we want a `<picture>` fallback chain later.

## Placeholders

- 02 and 13 backgrounds are video fills in Figma; these use the video poster frames until the clips are delivered.
- "See more" on the brain region cards and slides 16–17, the PDF and resource links, and the Immune/Organ pills have no content in the wireframe yet; they show a "Content TBD" toast.
