---
name: thumbnail
description: AI with Kalyan Thumbnail Studio. Research → strategy → design → critique → revision → delivery for YouTube thumbnails, using vidIQ research, Kalyan's real footage, local layered rendering, QA and Canva. Use for "/thumbnail <topic>", "/thumbnail VIDEO-001", "/thumbnail make 5 more options", "/thumbnail revise option 3", "/thumbnail finalise option 2", or any request to make, compare, fix or pick YouTube thumbnails for AI with Kalyan.
---

# /thumbnail — AI with Kalyan Thumbnail Studio

Studio root: `THUMBNAIL-STUDIO/` (run commands from there). CLI: `node scripts/studio.mjs <cmd>`.
Read `CLAUDE.md` there first (rules), then `brand/brand.json` and `research/conventions.md`.

## 0. Parse the instruction

```bash
node scripts/studio.mjs parse "<what the user typed after /thumbnail>"
```

| action | do |
|---|---|
| `new` | `studio new "<topic>" [--title "…"]` → steps 1–7 |
| `resume` | `studio status VIDEO-xxx`, continue from `state.json` stage |
| `more` | add options F, G, … (new archetype angles); keep A–E untouched |
| `revise` | revise that option only (≤ 2 revisions per concept, then stop and ask) |
| `finalise` | **ask Kalyan to confirm**, then `studio finalise VIDEO-xxx <OPT> --approved` |
| `status` | `studio status` |

With no project given, `more`/`revise`/`finalise` use the most recent project (`studio status`).

## 1. Audit (every run, cheap)
- `studio doctor`. Fix with `--fix`/npm/pip if anything local is red.
- Connectors: check that the vidIQ, Canva and image-generation MCP tools are actually in this
  session's tool list (load their schemas). Compare with `config/connectors.json` and update the
  `status` blocks when something changes. Never claim a connector works without a successful call.
- `vidiq_balance` (0 credits) before any paid research.

## 2. Brief
Fill `projects/<ID>/brief/brief.md`:
- topic, audience, emotional hook, promise
- real evidence available (footage, screens, results)
- what must NOT be claimed

Look for local material first: the repo's `renders/`, `media/`, `transcripts/` and
`compositions/`.

## 3. Research (reuse before paying)
- If `research/videos.json` exists for this project or a closely related one, reuse it. Read
  `research/conventions.md`.
- Budget: `config/connectors.json → vidiq.budget`. **Ask Kalyan before going over it.** A
  typical project costs about 55 credits:
  - `vidiq_outliers` (keyword, threeMonths) and `vidiq_youtube_search` (video, last 90 days,
    viewCount): together ≥ 15 relevant videos
  - `vidiq_similar_thumbnails` (text description of the obvious concept): saturation check
  - `vidiq_score_thumbnail` on 5–6 strong references: the only visual evidence available when
    i.ytimg.com is blocked
  - `vidiq_video_change_history` on the 2 closest references
- Save normalised data to `research/videos.json`. Format: see VIDEO-001.
  - Copy metrics exactly.
  - Use `null` when a metric wasn't provided.
  - Record each value's source and observation date.
- Write `research/analysis.md`: conventions, gaps, implications. Then run
  `studio research-report <ID>`.
- Never treat views or outlier scores as thumbnail CTR. Never invent numbers or claim to have seen
  an image you didn't.

## 4. Strategy and assets
- **Face:** only Kalyan's real face.
  - Find frames: `python3 scripts/faces.py <his video> projects/<ID>/assets/faces.json --model models/face_landmarker.task`.
  - Extract stills: `studio frames` (or ffmpeg from the 4K originals).
  - Cut out: `studio cutout <ID> <frame> <name> [--erase x,y,w,h]`.
  - Check the cutout on a dark background before using it.
  - If there is no footage or photo, make no face thumbnails.
- **Evidence:** real frames from the video (ffmpeg). No fake UI, results or metrics.
- **Generated images:** backgrounds and props only (Canva `generate-image` or ElevenLabs).
  Full-resolution output stays in Canva; only a preview reaches the sandbox.
- **Concepts:** write five concept specs A–E (Before/After, Face + Emotion, Minimalist Tech,
  Curiosity/Mystery, AI Workflow/Result). Adapt them to the research and drop an archetype that
  doesn't fit. Format: `templates/concept.template.json`. Keep the metadata filled: story,
  curiosity, composition, evidence, background, typography, colours, Canva, image prompts, why,
  risks.
- Run `studio strategy <ID>`.

## 5. Render → QA → critique → revise
```bash
node scripts/studio.mjs render <ID>        # PNG + automatic QA per option
```
- Look at every PNG yourself (Read the file) and the mobile sheet. Automated QA catches size,
  contrast, overflow, face overlap and blanks, not taste.
- Write `reviews/<OPT>.review.json` with honest 1–5 scores (`templates/review.template.json`).
- Then run `studio review <ID>`.
- Revise options under 70, or anything visibly broken. Bump `revision`, at most 2 per concept.
- Then `studio sheet <ID>`.

## 6. Canva (editable versions)
- Run `studio canva-plan <ID> <OPT>`. It writes `canva/<OPT>.plan.json`, a baked base PNG,
  separate image layers and native text.
- Upload with `create-upload-url` + POST. This needs www.canva.com reachable from the sandbox;
  if the proxy refuses it, say so and use native shapes/text only.
- Then: `create-design` (format "YouTube Thumbnail") → `read-design` with `open_transaction`
  → `edit-design` to match the spec. Verify against the returned thumbnail and document.
- **Do not commit** until Kalyan approves the preview. Record the design ID, URL and state in
  `canva/<OPT>.json`.

## 7. Deliver
- Write `reviews/recommendation.md`: ranked, reasoned, not a CTR claim.
- Run `studio deliver <ID>`, then `studio validate <ID>`.
- Send Kalyan the contact sheet and mobile feed, plus the top PNGs.

## Approval gates (always pause and ask)
- choosing or finalising a thumbnail
- overwriting an approved `FINAL.png`
- committing a Canva edit
- going over the vidIQ budget or making other significant paid calls

## Never
- Ask for API keys in chat or commit `.env`.
- Generate or alter Kalyan's face, or make a fictional face.
- Copy a competitor's layout; use real logos only when officially sourced.
- Use fake results or numbers.
- Claim a tool worked when the call failed.
