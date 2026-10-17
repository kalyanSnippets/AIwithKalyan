# Video analysis: CLD_1279 final ("How I used Claude Code to edit this video")

Analysed on 2026-10-17. The original was read only, never modified.

## Source

| | |
|---|---|
| File analysed | `renders/CLD_1279-final-youtube.mp4`, the same render as `C:\Users\kavya\OneDrive\Desktop\AWK-Videos\Claude Editor\CLD_1279-final-youtube.mp4` |
| Duration | 10:12.5 (612.52 s) |
| Video | H.264 High, 1920×1080, 25 fps |
| Audio | AAC-LC, 48 kHz stereo, mixed to −14 LUFS |
| Size and bitrate | 350.5 MB, about 4.6 Mb/s |

The cloud session can't reach the Windows path, so the analysis used the identical render in this repo.

How it was analysed:
- ffprobe for the specs above.
- 41 frames sampled every 15 s, in `scratchpad/f_01–41.png`.
- The ElevenLabs Scribe transcript, mapped onto the final timeline in `source/transcript-final-timeline.txt`.
- The two sample clips the video shows: the raw teleprompter take and the Claude-edited short.
- Kalyan's seven screen recordings from 2026-10-09.

## What the video is

A first-person explainer. Kalyan gave Claude Code the raw footage of a ~50 s vertical
talking-head clip. Claude Code coordinated:
- ElevenLabs: transcription, music and SFX
- FFmpeg: cuts and rendering
- Descript: Studio Sound
- HyperFrames: motion graphics

The result was a 41.8 s edited short. Kalyan reviewed it, gave feedback, and set the rules along the way.

The video walks through six steps, then shows the full result and concludes honestly.

## Story and key timestamps (final timeline)

| Time | Beat |
|---|---|
| 0:00 | "after I record a YouTube video, that's when the real work starts". Editing is the part he enjoys least. |
| 0:24 | "I gave the entire raw footage to Claude Code: the mistakes, the retakes, the awkward pauses, the bad audio" |
| 0:38–0:46 | **Raw clip plays** ("No cuts, no graphics, no captions, no music, nothing") |
| 0:54–1:01 | **Edited clip plays** ("compare that with this… This is the final version") |
| 1:10 | "I didn't manually build this entire edit inside a traditional video editor" |
| 1:16 | "Claude Code managed the workflow, not with one magical AI tool, but by coordinating different tools" |
| 1:27 | Six-step overview |
| 1:58 | Step 1, the editing engine: ElevenLabs, FFmpeg, Descript, HyperFrames, browser research. AGENTS.md becomes the rule book. |
| 3:05 | Step 2, decoding the footage: FFmpeg inspection, ElevenLabs word-level transcript. "editing the video starts looking a lot more like editing a document" |
| 3:59 | Step 3, shaping the edit: an edit plan first; keep natural pauses; ~50 s became ~41 s; FFmpeg rough cut |
| 5:05–5:24 | **Audio before/after** (Descript Studio Sound) |
| 5:28 | Step 4, design: "What should the viewer see while I'm saying this?" Never cover the face; liquid-glass style; HyperFrames |
| 6:39 | Step 5, assembly: music and SFX kept minimal; review version 1 |
| 7:09 | "I still didn't just accept whatever Claude created": timestamped feedback, then reusable rules saved |
| 7:44 | Step 6, QA and export: "the final edit passed all checks" (25/25 ring on screen) |
| 8:09 | Final spec: 41.8 s, 1080×1920, 30 fps |
| 8:19–9:03 | **The full Claude-edited short plays with its own audio** |
| 9:03 | "So did Claude Code edit the entire video? In a way, yes. … Claude Code was the coordinator. … I still made the creative decisions." |
| 9:45–10:12 | Outro and calls to action |

## What the video proves, and what it doesn't

**Supported by the footage:**
- Claude Code turned a real raw take into a finished, motion-graphics short. The raw and edited
  versions are both shown, and the result plays in full.
- It did this by coordinating several tools; Claude Code isn't a video editor itself (said twice).
- A human stayed in the loop: an approved plan, timestamped review feedback, and creative decisions.
- An automated QA pass ran on the final short ("passed all checks").
- The workflow is reusable, because the preferences were saved to AGENTS.md.

**Not supported. Thumbnails and titles must not imply these:**
- That Claude Code edited everything automatically with no human input. The video says the opposite.
- That an AI beat a human editor. There is no head-to-head contest; it's a collaboration.
- Speed claims ("in 10 minutes"). Those words come from the *sample short's* own script, about
  Higgsfield, not from this workflow.
- That the 10-minute explainer itself is the result being demonstrated. The demonstrated result
  is the 41.8 s short. The explainer was also produced with the workflow, but the video only
  implies this in its closing line.
- Any integration beyond the ones named: ElevenLabs, FFmpeg, Descript, HyperFrames, browser research.

## Truthful promise

> "Watch me hand my raw footage to Claude Code and see what it actually produced, plus the
> six-step workflow (and the human decisions) behind it."

## Usable thumbnail assets (all real, all in `assets/`)

| Asset | From | Use |
|---|---|---|
| `frames/raw-36.png` | sample-raw.mp4 at 36 s (shown at 0:38) | the "before" |
| `frames/edited-15/21/27.png` | sample-edited.mp4 (shown at 0:54 and 8:19–9:03) | the "after" or result. Avoided: the frames saying "10 minutes", an unverified sample claim |
| `../assets/cutouts/kalyan-k121.png` | raw camera at 2:01 | genuine sceptical, raised-brow look, unaltered |
| `../assets/cutouts/kalyan-k330.png` | raw camera at 5:30 | neutral, direct to camera |
| `screens/hf-timeline.png` | Screen Recording 1.32.59 pm at 78 s | the real HyperFrames Studio timeline of the short (browser bookmarks cropped out) |
| `screens/cc-review-mid.png` | Screen Recording 12.37.52 pm at 5 s | the real Claude Code panel: "Rough cut is done… Review version v1… I've stopped here for your feedback" (sidebar and chat list cropped out) |
| `logo/claude-wordmark.svg/png` | claude.com inline SVG, 2026-10-17 | the official Claude wordmark, unmodified |

## Thumbnail opportunities

1. **The transformation is the hook.** A genuine raw → edited pair exists, and competitors
   mostly show a logo plus a timeline (see the research in THUMBNAIL-STRATEGY.md).
2. **An honest open question** ("can it edit?") fits the video's own conclusion ("in a way, yes").
3. **A real, believable expression** (k121) rather than a staged shock face.
4. **Authentic Claude Code UI** that says, on screen, that it stopped for human feedback. It's
   proof, and it guards against over-claiming.
