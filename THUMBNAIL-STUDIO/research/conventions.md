# Cross-project learnings (AI with Kalyan thumbnails)

Update this after each project. It's the studio's memory, so new projects start from what we
already know instead of repeating paid research.

## From VIDEO-001: "Claude Code edits my video" (2026-10-17, vidIQ)
- The niche is moving fast. "Claude edits my video" videos broke out on tiny channels (breakout
  scores above 100 on channels with about 3k subscribers).
- vidIQ thumbnail feedback on 6 references: sharp, bright, high-contrast thumbnails scored 86–98.
  The most common penalty was clutter or low negative space (4 of 6). Also penalised: an
  exaggerated expression (49) and no open question (65).
- Views ≠ thumbnail quality: a 601k-view video had a 49 thumbnail score.
- "Face + editing timeline + AI logo" is saturated; similar-thumbnail results were mostly weak.
- No observed title or thumbnail changes on the two closest references.

## Standing rules that came out of it
- At most 4 headline words, ink background, one coral accent, real evidence frames.
- Use Kalyan's natural expressions from his own footage (scripts/faces.py ranks them).
- Never use the coral starburst as "the Claude logo".

## From VIDEO-002: "Claude Code for $0, 3 ways" (2026-11-12, vidIQ, 55 credits)
- "Free Claude Code" is saturated: 17 relevant videos in 3 months, 6 in the last 10 days; titles converge on FREE / Forever / Unlimited / $0.
- Two exact-angle competitors exist ("3 Ways": Outskill 147.6K; OmniRoute: Amidia 1.07M, Remigiusz 46.8K at 123x).
- vidIQ scores: clean rectilinear 3-ways layout 99; others 26–87. Penalties again: clutter/empty space, no visual guidance (4 of 6), exaggerated or over-processed faces, no open question.
- Views ≠ thumbnail quality again: a 1.07M-view video scored 46.
- Our gap: **receipts.** Real bills/log rows from the video differentiate a crowded "free" niche; keep them as supporting proof next to one big claim.
- Face model: scripts/faces.py needs models/face_landmarker.task (downloaded from MediaPipe's official storage; `doctor --fix` only fetches the cutout model).
