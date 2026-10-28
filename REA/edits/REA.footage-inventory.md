# REA video: footage inventory vs script (step 1)

Script: "I Rebuilt a Kanban App with REA in 3 Prompts" (8 sections, target 10 to 12 min).
Footage source: Drive folder REA (`1MLe7yMHPacIY1HnYQHwxdjoJOO2JMAkB`), copied to `REA/media/` (git-ignored).
Section mapping below is **inferred from frames and shoot order only**. It is not confirmed until the
ElevenLabs transcript exists.

## Camera clips (Pixel, 3840x2160 HEVC, ~43 Mbps, AAC 48k). Total about 55.8 min raw

| Shot (local time) | Length | What the frames show | Likely script section |
|---|---|---|---|
| PXL_20261028_084617376 | 8:00 | Face to camera, desk empty, very animated | 1 Hook / what is REA |
| PXL_20261028_085709806 | 8:55 | Same set-up, no laptop, explaining | 1 (cont.) / 2 Why Wekan, what we build |
| PXL_20261028_091220786 | 9:34 | Laptop in front, mostly looking at it / off to the side | 2 Setup steps (read-along) |
| PXL_20261028_092402126 | 6:31 | Laptop, looks down at the keyboard in last third | 3 Prompt 1 or 4 Prompt 2 (typing / waiting) |
| PXL_20261028_102753700 | 15:50 | Laptop, talks to camera, hands together, long | 5 Output + 6 Opinion + 7 CTA |
| PXL_20261028_110231565 | 6:56 | Laptop, talks to camera | 7 CTA / 8 Outro (or a retake of a section) |

Drive has `PXL_20261028_110231565.mp4` twice (two IDs, identical size). Only one copy was downloaded.

## Screen recordings
- `Screen_Recording_2026-10-28_194316.mp4`: 19 s, 1024x552, GitHub `morluto/rea`, star count 399k, hovers over Star.
  Covers the "almost 400,000 stars" beat in Section 1. Low resolution, so it will need a PiP or zoom treatment.
- `PXL_20261023_062436523.jpg`: 4032x2268 still of the set (plant, blue chair, Kalyan at the right edge). A reference/backdrop shot, not B-roll.

## Gaps against the script (nothing in the folder covers these yet)
- rea.tools/showcase page capture (Section 1). Can be done with `npm run broll`.
- Terminal / Claude Code setup recording, Mac steps 1 to 7 and the Windows PowerShell version (Section 2).
- Prompt 1 run on Wekan and the report with observed / inferred / not sure labels (Section 3).
- Prompt 2 build, side-by-side screenshot, REA Board demo and live drag test (Sections 4 and 5).
- Wekan demo board (Section 2/3). Page capture is fine.
- Outro voice recording and end-screen target video (Sections 7 and 8). The existing CLD_1279 outro voice may be reusable.
Script text still has `[fill in]` spots in Sections 5 and 6 that only the real result can answer.

## Issues to handle
- 55.8 min raw for a 10 to 12 min cut, so expect heavy cutting (retakes, long reads of commands).
- `092402126` is variable frame rate (359/12 fps). Normalise to 30 fps in the proxy.
- 4K HEVC decodes slowly on this box. Make 1080p H.264 proxies one at a time.
- **Transcription blocked:** `ELEVENLABS_API_KEY` is empty and the proxy-injected credential is rejected by
  `/v1/speech-to-text` (401). AGENTS.md forbids other ASR, so nothing is transcribed yet.

## Next steps
1. Put `ELEVENLABS_API_KEY` in `.env` (or confirm a different route).
2. `npm run transcribe -- REA/media/raw/<clip>.mp4 --language en --speakers 1 --keyterms "REA,Wekan,Kanban,Claude Code,Vite,localStorage,Hopper,rea-agents"` for each clip, then move output to `REA/transcripts/<clip>/`.
3. Align transcripts to the script, mark the best take per section, and write `REA/edits/REA.plan.md` (keep ranges, cuts, graphic beats).
4. Build proxies, then the cut.
