# AI with Kalyan — Thumbnail Studio

Type `/thumbnail Claude Code edits my videos` in Claude Code. The studio then:

1. researches competing videos with vidIQ;
2. writes a brief and five distinct concepts;
3. builds them from your real footage;
4. renders 1280x720 PNGs;
5. QA-checks them (size at mobile scale, contrast, overflow, face overlap, blank renders);
6. scores them on a transparent rubric and revises weak ones;
7. builds editable Canva versions;
8. delivers a contact sheet, a comparison table and a ranked recommendation.

It stops and asks you before anything final, paid or irreversible.

## Setup

```bash
cd THUMBNAIL-STUDIO
npm install                          # sharp, playwright-core, lucide-static
pip install mediapipe pillow numpy scipy
node scripts/studio.mjs doctor --fix # downloads the MediaPipe cutout model, checks everything
npm test
```

Chromium: the studio uses `CHROME_PATH`, then Playwright's browsers (`PLAYWRIGHT_BROWSERS_PATH`),
then system Chrome.

### Connectors (MCP, authenticated in Claude, with no keys in this repo)

| Connector | Used for | Set up |
|---|---|---|
| vidIQ | search, outliers, trending, similar thumbnails, metadata, thumbnail scoring, change history | claude.ai → Settings → Connectors → vidIQ (sign in with your vidIQ account). Calls cost credits; see `config/connectors.json`. |
| Canva | editable designs, uploads, generated images, export | claude.ai → Settings → Connectors → Canva (sign in). |
| Image generation | backgrounds and props only | Canva `generate-image` or the ElevenLabs connector. |

**Claude Code cloud sessions:** Canva uploads POST to `www.canva.com`. Add that host under the
environment's **Network access → Allowed domains**: the cloud environment menu in the session
title bar → Edit. See https://code.claude.com/docs/en/cloud-environments#network-access. Add
`i.ytimg.com` too if you want reference thumbnails downloaded for side-by-side study.

ChatGPT integrations do not carry over to Claude Code; connect each service in Claude.

## Usage

```
/thumbnail Claude Code edits my videos     new project (VIDEO-00n), full pipeline
/thumbnail VIDEO-001                       resume where it stopped
/thumbnail make 5 more options             options F–J, existing ones untouched
/thumbnail revise option 3                 revise C (max 2 revisions per concept)
/thumbnail finalise option 2               asks you, then copies B to exports/FINAL.png
```

CLI equivalents: `node scripts/studio.mjs help`.

## What's in a project

```
projects/VIDEO-001/
  brief/brief.md
  research/videos.json, analysis.md, report.md   (sources linked, metrics as reported)
  concepts/A–E.json (layered, editable), strategy.md, make_concepts.py
  assets/frames, cutouts, evidence, strip        (from your own footage; git-ignored, regenerable)
  canva/<OPT>.plan.json, <OPT>.json              (Canva build plan, design IDs)
  exports/A–E.png, contact-sheet.png, mobile-feed.png, history/
  reviews/<OPT>.qa.json, <OPT>.review.json, scores.json, comparison.md, recommendation.md
  delivery.md, state.json
```
