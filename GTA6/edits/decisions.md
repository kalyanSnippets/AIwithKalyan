# GTA6: Kalyan's decisions (2026-11-20)

| Topic | Decision |
|---|---|
| Script | Pasted in session = the recorded script (`GTA6/script.md`). |
| Claims | Keep the script's wording as is. No "CONCEPT" labels on graphics. |
| Gameplay footage | Editor fetches it. Source: Rockstar's official downloads (rockstargames.com/VI/media/videos → media-rockstargames-com.akamaized.net). YouTube download is blocked in this sandbox (age gate / bot check). |
| Monetisation | **Not monetised.** Official Rockstar footage approved for use with commentary. Still: no licensed songs from trailers (mute trailer audio or keep it under the voice, no music-only stretches), no story spoilers. |
| Accent | Vice City palette: pink #FF3D9A, sunset orange #FF8A3D, teal #19E3D3 on night ink #0D0818. Inter type. |
| Music | ElevenLabs Music approved; YouTube Audio Library for free tracks (needs manual download from YouTube Studio by Kalyan). |
| Transcription | ElevenLabs key added (network secret for api.elevenlabs.io; `.env` holds the placeholder `proxy-injected`). Scribe transcript `transcripts/IMG_1825-scribe` is the source of truth. Whisper passes kept for reference only. |
| Shorts | 2. |
| Ending | Usual outro over full-screen graphics: recap → Like → Subscribe → bell → end card. |
| Length | 6–8 min, whatever remains after retakes and pauses are cut. |
| Reference styles | Proposed (awaiting pick): Tech Burner (hook energy), Corridor Crew (freeze + annotate), Sanchit Gamedev (diagrams). Page: https://claude.ai/artifact/1xmvnCXPaMNWFQk58D3skm |

## A-roll cut v1 (2026-11-20)
- Takes: `edits/takes.json` (last clean take of every script line, `scripts/pick-takes.py`),
  word fixes and source-time fixes in `edits/fixes.json`, EDL `edits/aroll-v1.edl.json` (201 segments).
- Length **8:15**, pauses over 0.30 s cut to 0.18 s. Transcript of the cut matches the script at 97.3%
  (`scripts/verify-cut.py`); leftovers are single words (ASR variants or natural additions).
- Review copy: `GTA6/renders/GTA6_aroll_v1_review.mp4` (960×540, 27.7 MB, not committed).
- Open: "Rockstar is not just *stimulating* individual characters" (only take). Graphic can carry "simulating".
- No audio cleanup, graphics, music or B-roll yet; brief needs the reference-style approval first.

## A-roll cut v2 (2026-11-20, ElevenLabs Scribe)
- Takes `edits/takes-scribe.json`, fixes `edits/fixes-scribe.json`, EDL `edits/aroll-v2.edl.json` (180 segments).
- Length **7:56**. Scribe re-transcription of the cut matches the script at 98.6%; leftovers are 1-word
  variants ("gets", "still", "very", "might").
- Notable fixes: opening line kept whole (Scribe timing glitch at 0:49), "Because today… break down" rebuilt
  from two takes, "polices, police, police vehicles" → "police vehicles", "mis-mission" swapped for clean retake.
- Spoken chapter names ("which is animation retargeting", …) are kept; dropping them saves ~20 s.
- Review copy `GTA6/renders/GTA6_aroll_v2_review.mp4` (26.7 MB, not committed).
