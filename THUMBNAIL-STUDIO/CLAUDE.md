# CLAUDE.md — AI with Kalyan Thumbnail Studio

Reusable research → strategy → design → critique → revision → delivery system for YouTube
thumbnails. The `/thumbnail` skill (`skills/thumbnail/SKILL.md`) drives it, and the parent repo
links it as `.claude/skills/thumbnail`.

## Rules
- **One project per video:** `projects/VIDEO-xxx/` with brief, research, concepts, assets, canva,
  exports and reviews. A project never reads or writes another project's files. `studio validate`
  checks this.
- **Resume, don't redo:** `state.json` and the saved research JSON are the source of truth.
  Reuse research before making paid calls again.
- **Approval:** pause before finalising or picking an option, overwriting an approved FINAL.png,
  committing Canva edits, or paid calls over the vidIQ budget. `studio finalise` refuses without
  `--approved`.
- **Truth:**
  - No fake results or metrics, and no misleading arrows or exaggerated claims.
  - Copy research numbers exactly from tool output, with source and date.
  - Video views and outlier scores are not thumbnail CTR.
  - The rubric score is not a CTR prediction.
- **Identity:** only Kalyan's real face, from his own footage or photos. Never generate, swap or
  beautify it.
- **Logos:** only official, properly sourced files. None are in `brand/` yet, so product names go
  in text.
- **Secrets:** environment variables or MCP auth only; `.env` is git-ignored. Never ask for keys
  in chat.
- **Revisions:** at most 2 per concept, then stop and report.

## Layout
```
config/      studio.json (sizes, archetypes, limits), connectors.json (audited capabilities + status)
brand/       brand.json (colours, type, rules), fonts/ (Inter Display, OFL)
research/    conventions.md (cross-project learnings)
references/  notes on reference thumbnails (links + evidence, no copied images)
templates/   concept + review JSON templates
skills/      thumbnail/SKILL.md (/thumbnail)
scripts/     studio.mjs CLI, lib/ (render, qa, rubric, sheet, canva, intent, paths, state),
             cutout.py, faces.py
tests/       node --test suite
projects/    VIDEO-001/ …
models/      MediaPipe models (git-ignored, `studio doctor --fix`)
```

## Commands
`npm test` · `node scripts/studio.mjs doctor|parse|new|status|frames|cutout|render|review|sheet|research-report|strategy|canva-plan|deliver|validate|finalise`
