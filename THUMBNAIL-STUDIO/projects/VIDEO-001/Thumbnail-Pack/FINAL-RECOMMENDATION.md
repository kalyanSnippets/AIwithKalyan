# Final recommendation

## Recommended pair

**Thumbnail 01, RAW → EDITED**, paired with title **"I Gave Claude Code My Raw Footage. Here's What It Made"**.

Why this pair:
- The thumbnail and title tell one story: raw footage goes in, and what it made comes out.
  Both halves are real frames the viewer then sees in the video, at 0:38 and 0:54, and in full at 8:19.
- It promises a result, not a verdict, so the honest conclusion at 9:03 ("in a way, yes… I
  still made the creative decisions") doesn't feel like a bait-and-switch.
- It avoids the saturated face + timeline + logo layout (see THUMBNAIL-STRATEGY.md).

**Main weakness:** there is no face emotion. Kalyan appears only as a small, neutral face inside
both frames. At phone size the edited card's detail (the three style cards and the PiP) is tiny,
so the transformation reads mostly through the coral frame and the words, not the footage.

**Run-up:** 02 (AI EDITOR?!) with **"Can Claude Code Actually Edit a YouTube Video?"**. It has the
strongest face and the best mobile legibility, but it uses the most common layout in this niche.
If YouTube's thumbnail test is available, test 01 against 02.

## Scores (1–10, editorial judgement, not CTR predictions)

| Criterion | 01 RAW → EDITED | 02 AI EDITOR?! | 03 THE RESULT | 04 ME vs AI | 05 CAN IT EDIT? |
|---|---|---|---|---|---|
| Clarity | 9 | 8 | 7 | 7 | 8 |
| Curiosity | 7 | 8 | 7 | 8 | 8 |
| Mobile readability | 8 | 9 | 7 | 7 | 8 |
| Distinctiveness | 8 | 5 | 7 | 6 | 9 |
| Emotional impact | 5 | 8 | 5 | 6 | 4 |
| Authenticity | 10 | 9 | 9 | 7 | 10 |
| Title alignment | 9 | 8 | 7 | 6 | 9 |
| Audience relevance | 8 | 9 | 7 | 8 | 7 |
| **Average** | **8.0** | **8.0** | **7.0** | **6.9** | **7.9** |

01 and 02 tie on average. 01 wins on authenticity, distinctiveness and title alignment, which are
the criteria the research flagged as gaps in this niche.

### Notes per design
- **01 RAW → EDITED:** the clearest proof. Weakness: small detail at mobile size and no emotion (above).
- **02 AI EDITOR?!:** a genuine sceptical face, the official wordmark and a real timeline. Weakness:
  it's the expected layout, and the timeline is half-hidden behind his shoulder. It reads as a
  texture, not a readable UI.
- **03 THE RESULT:** honest "here's what came out". Weakness: the three phone frames compete,
  and "THE RESULT" without a face or a before frame gives no sense of scale. It works best as a
  test variant.
- **04 ME vs AI:** strong curiosity. Weakness: **framing risk**. The video is a collaboration, not
  a contest. The design shows no winner, and the Claude Code panel literally says "I've stopped
  here for your feedback", but the words still imply a showdown the video doesn't stage. Use it
  only with a title that frames the comparison honestly, e.g. #4.
- **05 CAN IT EDIT?:** the most premium and distinctive. Weakness: low emotion. The UI text is
  unreadable at phone size, so the panel reads as "an app with a video in it".

## QA checklist

| Check | Result |
|---|---|
| All required files exist | ✅ five PNGs, the comparison sheet, five .md files, editable sources in `source/` |
| 1280×720 PNG, 16:9 | ✅ all five (verified with PIL) |
| Automated QA (`source/render/*.qa.json`) | ✅ 75/75 checks pass. Headline sizes, contrast ≥ 4.5:1 for all text, in frame, clear of the timestamp badge, text off faces, one focal point, word count. |
| Readability at phone size | ✅ headlines 25–40 px at 320 px wide (see `source/mobile-feed.png`). The 03 kicker is 10 px, a secondary label. |
| Contrast | ✅ lowest is 6.76:1 (ink on coral). White headlines are 10–17:1. |
| No cropped text | ✅ checked visually and by the in-frame check |
| Headline words | ✅ 01 two words (RAW, EDITED) plus an arrow · 02 two · 03 two (+3-word kicker) · 04 three · 05 three |
| No sensitive info | ✅ browser bookmarks bar (Jira, Confluence, etc.) cropped out of the HyperFrames frame. Claude app sidebar and chat titles cropped out. Panels show only project file names. |
| Promise supported by the video | ✅ every image appears in or was produced for the video. Avoided the "10 minutes" claim and "fully automated". |
| Identity | ✅ Kalyan's real, unaltered face from his camera originals. No generation, swap or beautification. |
| Logos | ✅ only the official Claude wordmark (claude.com SVG, unmodified). HyperFrames and Higgsfield marks appear only as they do in the real screenshots. |
| Concepts distinct | ✅ comparison, face experiment, result reveal, split face-off, minimal product shot |
| Review loop | Revised after reviewing the comparison sheet: 01 EDITED contrast (3.5 → 6.8:1); 01 swapped to the brand-neutral "Many styles" frame; 03 headline overlapped a frame; 04 "vs"/"AI" contrast; 04 and 05 Claude Code panel re-cropped so it isn't an empty dark box. |
