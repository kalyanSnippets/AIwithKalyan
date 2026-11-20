# GTA6: Kalyan's decisions (2026-11-20)

| Topic | Decision |
|---|---|
| Script | Pasted in session = the recorded script (`GTA6/script.md`). |
| Claims | Keep the script's wording as is. No "CONCEPT" labels on graphics. |
| Gameplay footage | Editor fetches it. Source: Rockstar's official downloads (rockstargames.com/VI/media/videos → media-rockstargames-com.akamaized.net). YouTube download is blocked in this sandbox (age gate / bot check). |
| Monetisation | **Not monetised.** Official Rockstar footage approved for use with commentary. Still: no licensed songs from trailers (mute trailer audio or keep it under the voice, no music-only stretches), no story spoilers. |
| Accent | Vice City palette: pink #FF3D9A, sunset orange #FF8A3D, teal #19E3D3 on night ink #0D0818. Inter type. |
| Music | ElevenLabs Music approved; YouTube Audio Library for free tracks (needs manual download from YouTube Studio by Kalyan). |
| Transcription | No ElevenLabs key yet → Kalyan approved a free tool. Used faster-whisper large-v3-turbo locally (`scripts/transcribe-whisper.py`). Re-run with Scribe once the key is added. |
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
