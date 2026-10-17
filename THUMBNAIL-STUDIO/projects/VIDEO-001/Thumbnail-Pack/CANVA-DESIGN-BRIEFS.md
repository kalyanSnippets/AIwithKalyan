# Canva design briefs: layer-by-layer reconstruction

## Why these are briefs, not live Canva designs

The Canva connector works for native designs, but **uploads are blocked from this cloud sandbox**:
- `create-upload-url` followed by a POST to `www.canva.com` is refused by the network proxy (403).
- No public URL exists for `upload-asset-from-url`.

Without uploads, a Canva version would lose every real frame, cutout, screenshot and the
wordmark. That would make it a different, fake-looking design, so no Canva designs were made for
this pack.

The only Canva design in the project is an earlier draft (`../canva/C.json`) from a previous
concept round. It is not one of these five, and it was never committed.

**To rebuild in Canva:**
1. Create a YouTube Thumbnail design (1280×720).
2. Upload the listed assets from `assets/` and `../assets/cutouts/`.
3. Follow the layers bottom to top. Positions are in px from the top-left.

Every layer is also in the editable spec `source/specs/<file>.json`, which re-renders with
`source/render_pack.mjs`, and as standalone HTML in `source/render/<file>.html`.

Common to all five:
- Fonts: **Inter Display Black** for headlines and **Inter Display ExtraBold** for kickers.
  Canva has "Inter"; use its heaviest weight with letter-spacing −2%.
- Colours: ink `#0B0B12`, coral `#E8775F`, white `#FFFFFF`.
- Text shadow: `0 6px 30px` black at 65%.
- Keep text out of the bottom-right 190×80 (YouTube's duration badge).

---

## 01: RAW → EDITED (`thumbnail-01-before-after`)

| # | Layer | Type | Asset / value | x, y, w, h | Notes |
|---|---|---|---|---|---|
| 1 | Background | gradient | ink, coral glow top-right (22%), blue glow bottom-left (16%) | full | |
| 2 | Raw card | image | `assets/frames/raw-36.png` | 36, 30, 372, 660 | corner radius 26, 3 px white border at 35%, drop shadow |
| 3 | Edited card | image | `assets/frames/edited-21.png` | 872, 30, 372, 660 | radius 26, **4 px coral border**, coral outer glow |
| 4 | "RAW" | text | white, 150 px, centred | box 452, 132, 376 wide | |
| 5 | Arrow | icon | Lucide `arrow-right`, coral, stroke 3 | 580, 300, 120, 120 | Canva: "arrow right" line icon |
| 6 | "EDITED" | text | **ink on a coral pill**, 100 px, centred | box 440, 452, 400 wide | pill radius 14 |

## 02: AI EDITOR?! (`thumbnail-02-ai-editor`)

| # | Layer | Type | Asset / value | x, y, w, h | Notes |
|---|---|---|---|---|---|
| 1 | Background | gradient | as 01 | full | |
| 2 | Glow | circle | radial coral 50% → 0 | 700, 0, 620, 620 | behind the head |
| 3 | Timeline | image | `assets/screens/hf-timeline.png` | 24, 470, 820, 196 | rotate −2°, radius 16, 2 px white border at 40%, crop to the left/top |
| 4 | Face | image (cutout) | `../assets/cutouts/kalyan-k121.png` | 183, −64, 1393, 814 | The face box lands at 830, 92, 322×330. Coral drop-shadow glow. **Keep separate, never redraw.** |
| 5 | Claude wordmark | image | `assets/logo/claude-wordmark.png` | 50, 46, 300, 65 | official, unmodified |
| 6 | "AI / EDITOR?!" | text | white, 150 px, two lines, "?!" in coral | 46, 140 | line height 0.92 |

The cutout canvas is larger than the frame and its top bleeds off; the face stays fully inside.

## 03: THE RESULT (`thumbnail-03-final-result`)

| # | Layer | Type | Asset / value | x, y, w, h | Notes |
|---|---|---|---|---|---|
| 1 | Background | gradient | ink, coral glow centred right (30%) | full | |
| 2 | Left frame | image | `assets/frames/edited-27.png` | 600, 96, 280, 498 | rotate −7°, radius 22, 3 px white border at 30% |
| 3 | Right frame | image | `assets/frames/edited-21.png` | 960, 96, 280, 498 | rotate +7°, same style |
| 4 | Hero frame | image | `assets/frames/edited-15.png` | 718, 36, 344, 612 | radius 26, **4 px coral border**, coral glow |
| 5 | Kicker | text | "CLAUDE-EDITED SHORT", ink on a coral pill, 40 px ExtraBold, +2% tracking | 56, 196 | |
| 6 | "THE / RESULT" | text | white, 132 px, two lines | 48, 272 | line height 0.9 |

## 04: ME vs AI (`thumbnail-04-human-vs-ai`)

| # | Layer | Type | Asset / value | x, y, w, h | Notes |
|---|---|---|---|---|---|
| 1 | Left panel | rectangle | gradient #1b1b2a → ink | 0, 0, 640, 720 | |
| 2 | Right panel | rectangle | ink-red #120d10 with coral glow (28%) | 640, 0, 640, 720 | |
| 3 | Claude Code panel | image | `assets/screens/cc-review-mid.png` | 690, 150, 548, 411 | radius 18, 3 px coral border, crop to the left/top |
| 4 | Timeline | image | `assets/screens/hf-timeline.png` | 690, 586, 548, 118 | radius 14, crop to the left/top |
| 5 | Face | image (cutout) | `../assets/cutouts/kalyan-k330.png` | −341, 20, 1230, 710 | face box at 205, 150, 285×300. Separate layer, bleeds off the left edge. |
| 6 | Divider | rectangle | coral | 636, 0, 8, 720 | |
| 7 | "ME" | text | white, 128 px | 40, 26 | |
| 8 | "vs" | text | ink on a coral pill (radius 60), 76 px | 566, 310 | ink outline ring |
| 9 | "AI" | text | white, 128 px | 1080, 10 | |
| 10 | Claude wordmark | image | `assets/logo/claude-wordmark.png` | 698, 44, 300, 65 | |

## 05: CAN IT EDIT? (`thumbnail-05-minimal`)

| # | Layer | Type | Asset / value | x, y, w, h | Notes |
|---|---|---|---|---|---|
| 1 | Background | gradient | near-black #07070b, coral key light at 78%/48% (38%), navy floor glow | full | |
| 2 | Claude Code panel | image | `assets/screens/cc-review-mid.png` | 640, 96, 720, 540 | radius 20, 2 px white border at 28%, coral glow; 3D tilt (rotateY −14°, rotateX 3°). In Canva, use a slight perspective mockup frame or skip the tilt; it bleeds off the right edge. |
| 3 | Claude wordmark | image | `assets/logo/claude-wordmark.png` | 60, 70, 220, 48 | |
| 4 | "CAN IT / EDIT?" | text | white, 158 px, "EDIT?" in coral | 56, 210 | line height 0.9 |
