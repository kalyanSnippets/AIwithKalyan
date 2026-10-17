# Thumbnail strategy

## Research (vidIQ, observed 2026-10-17)

This reuses VIDEO-001's research, done earlier today for the same video. It cost 55 vidIQ credits,
and no new paid calls were made for this pack. The full data is in `../research/videos.json` (29
videos) and `../research/report.md`.

Calls made:
- `vidiq_outliers` ("Claude Code edits a YouTube video automatically with AI tools", 3 months)
- `vidiq_youtube_search` ("Claude Code video editing", since 2026-07-19, by views)
- `vidiq_similar_thumbnails`
- `vidiq_score_thumbnail` ×6
- `vidiq_video_change_history` ×2

Metrics below are copied from tool output:
- **Views** and **breakout** (views relative to the channel's norm) are video performance, **not thumbnail CTR**.
- **Thumb score** is vidIQ's automated thumbnail score.
- No CTR, impressions or search volume were available, and none are claimed.

### Reference thumbnails

| # | Video | Channel | Views | Breakout | vidIQ thumb score | What vidIQ said about the thumbnail |
|---|---|---|---|---|---|---|
| 1 | [Claude + Davinci Resolve: Edit Raw Footage… (FULL SETUP)](https://www.youtube.com/watch?v=Ewck-gckuzU) | Guney Topcu | 25,043 | 113.05 | 98 | sharp, high contrast, sharp well-lit face, clear value proposition |
| 2 | [I Fully Automated My Video Editing Using Claude Code](https://www.youtube.com/watch?v=HzXD4GVqXwM) | Christian Peverelli | 507,298 | 40.21 | 90 | sharp, bright, bold high-contrast |
| 3 | [I Had Opus 5.5 Create And Edit ENTIRE Videos (RAW results)](https://www.youtube.com/watch?v=MXh8tNsEdvU) | Tyler Mommsen | 130,458 | 113.16 | 87 | sharp, but cluttered composition, entropy 7.12 |
| 4 | [Claude Edited My Entire CapCut Video (I Didn't Touch the Timeline)](https://www.youtube.com/watch?v=5N1moUCsVhI) | Matt Loui | 506,578 | 11.27 | 86 | vibrant colour pop and red accents, but cluttered and busy, entropy 7.41 |
| 5 | [I taught Claude how to use Premiere Pro and it's INSANE.](https://www.youtube.com/watch?v=Ohyo6-VO1jY) | Jason Cooperson | 104,209 | 21.39 | 65 | well-lit face, but busy and **no open question or mystery** |
| 6 | [How to Make Insane Motion Graphics With Opus 5.5](https://www.youtube.com/watch?v=747ZnEtsRbg) | Lukas Margerie | 601,373 | 88.27 | 49 | cluttered, **exaggerated expression**, no clean structure (601k views anyway: performance ≠ thumbnail) |
| 7 | [Edit Videos In MINUTES Using Claude & Hyperframes](https://www.youtube.com/watch?v=ciCRH4Q8EkQ) | Tyler Mommsen | 16,320 | 2.5 | not scored | the closest tool-stack match, surfaced by the similar-thumbnails search |

Limitations:
- `i.ytimg.com` is blocked in this cloud sandbox, so I **did not see the reference images**. The
  visual notes are vidIQ's own analysis.
- Change history for #2 and #4 showed no title or thumbnail changes and no A/B tests.
- `vidiq_score_thumbnail` needs a published video ID, so the five new thumbnails could not be
  scored by vidIQ before upload.

### What this means
1. The niche uses face + timeline + logo by default. The similar-thumbnails search for that
   layout returned mostly weak performers (breakout about 1–7). → **Differentiate with real proof**:
   the raw → edited transformation and authentic UI.
2. The most common criticism was clutter. → **Keep one focal subject, a dark quiet background,
   coral on one element, and 2–3 words.**
3. Exaggerated faces were penalised, and so was having no open question. → **Use a believable
   sceptical face and an honest question.**
4. Competitor titles lean on total-automation claims. → Kalyan's truthful angle (human in the
   loop, six steps) is **distinct and safer**.

## The five concepts

| File | Concept | Title pairing | Story it tells | Evidence used |
|---|---|---|---|---|
| `thumbnail-01-before-after.png` | **RAW → EDITED**: raw phone frame on the left, Claude-edited frame on the right with a coral glow, words stacked between them | Title 3 or 5 | "this plain take became this" | sample-raw at 36 s; sample-edited at 21 s |
| `thumbnail-02-ai-editor.png` | **AI EDITOR?!**: the official Claude wordmark, the real HyperFrames timeline, and Kalyan's raised-brow look | Title 4 or 5 | sceptical creator testing an AI editor | raw camera at 2:01; HyperFrames Studio recording at 78 s; claude.com wordmark |
| `thumbnail-03-final-result.png` | **THE RESULT**: three real frames of the finished short fanned out, the hero in a coral frame, "CLAUDE-EDITED SHORT" kicker | Title 3 | "here's what came out" | sample-edited at 15 s (hero), 21 and 27 s |
| `thumbnail-04-human-vs-ai.png` | **ME vs AI**: Kalyan on the left; Claude Code's real review panel and the timeline on the right; neutral vs disc | Title 4 | human judgement vs AI coordinator (no winner shown) | raw camera at 5:30; Claude Code recording at 5 s; timeline |
| `thumbnail-05-minimal.png` | **CAN IT EDIT?**: one subject, the real Claude Code panel in perspective under coral key light; lots of negative space | Title 4 | a quiet, premium question | Claude Code recording 12.37.52 pm at 5 s |

**Design system:**
- Inter Display Black headlines at 100–158 px, which is 25–40 px at mobile width.
- Ink `#0B0B12` background.
- Claude coral `#E8775F` as the single accent; ink-on-coral where coral needs text (6.8:1).
- Official Claude wordmark (`#D97757`) only where the brand is the point (02, 04, 05).

**Truth guards:**
- No fabricated UI or metrics.
- The frames saying "10 minutes" were avoided.
- Faces are unaltered cutouts, with no beautification.
- 04 shows no winner.
- The Claude Code panel in 04 and 05 literally reads "I've stopped here for your feedback".
