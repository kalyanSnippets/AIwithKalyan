# VIDEO-001 — delivery

**I Let Claude Code Edit My Entire YouTube Video** — Claude Code edits my entire YouTube video

## Ranked candidates

_Internal design rubric (1–5 per criterion, weighted to 100). Not a CTR prediction._

| Rank | Option | Archetype | Text | Score | File |
|---|---|---|---|---|---|
| 1 | B | Face + Emotion | "I DIDN'T EDIT THIS" | 87 | exports/B.png |
| 2 | A | Before/After | "RAW → EDITED" | 86 | exports/A.png |
| 3 | C | Minimalist Tech | "› edit my video" | 83 | exports/C.png |
| 4 | D | Curiosity/Mystery | "WHO EDITED THIS?" | 83 | exports/D.png |
| 5 | E | AI Workflow/Result | "RAW → DONE" | 80 | exports/E.png |

## Recommendation

**Lead with Option B (Face + Emotion, "I DIDN'T EDIT THIS").** Run it against **Option A
(Before/After)** and **Option C (Minimalist Tech)** in YouTube Studio's Test & Compare, which tests
up to three thumbnails on real impressions.

Why B leads:
- It is the only option that pairs a **real, believable expression** with a **true, tension-creating
  claim**. The video literally says "I didn't even manually edit it", and the title ("I Let Claude
  Code Edit My Entire YouTube Video") resolves the tension.
- vidIQ's feedback on the references rewarded sharp, well-lit faces and penalised staged,
  exaggerated ones. B uses an unstaged frame (k121) from Kalyan's own footage.
- Strongest subject isolation in the set: warm skin against ink with a coral rim.

Why test A and C alongside it:
- **A** is the most *differentiated* proof: the raw camera frame next to the real 25/25 QA screen.
  Nothing in the reference set showed a genuine before/after. It scored within a point of B on the
  rubric.
- **C** is the low-clutter bet. Clutter was vidIQ's most common criticism of the references, and C
  is unmissable at 320 px. Without a face it may lose human attention, which is exactly what a test
  would settle.

Hold back:
- **D** has the best curiosity gap, but three elements compete for first look. Reconsider it if B
  underperforms.
- **E** explains the "how" well but overlaps A's evidence; use it as an end-screen or community
  post image instead.

**Title pairing:** keep the working title. Avoid the closest competitor's wording ("I Didn't Touch
the Timeline"). An alternative with the same promise: "Claude Code Edited My Whole YouTube Video
(Raw → Final)".

_These rankings come from the internal design rubric and research evidence. They are not CTR
predictions; only a live test measures CTR._


## Files

- Research report: research/report.md (sources linked)
- Strategy: concepts/strategy.md
- Editable sources: concepts/<OPT>.json (layered spec) → exports/<OPT>.png
- Contact sheet: exports/contact-sheet.png · mobile feed: exports/mobile-feed.png
- Comparison: reviews/comparison.md · QA: reviews/<OPT>.qa.json

## Canva

- Option C: design DAHYQY_liMY — https://www.canva.com/d/FyHANhcfo2BSKgT — draft — edits applied in transaction 1193973150352962459, NOT committed (Canva requires the user to approve the preview before saving)

## Approval

Nothing is final until Kalyan picks one: `/thumbnail finalise option <n>` (runs `studio finalise VIDEO-001 <OPT> --approved`).
