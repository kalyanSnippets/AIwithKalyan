# My Room Went Crazy: v1 assembly (2026-11-20)

Rebuild with `bash edits/myroom/build.sh`.
Output: `renders/myroom/MyRoomWentCrazy_v1_1080p.mp4`, plus a `_review.mp4` copy for review.
The output is 1:54, 1920×1080 at 24 fps, −14.4 LUFS integrated, −1.0 dB peak.

## Sources

Seven Higgsfield clips came from Drive folder `1k39xks3sYcDJLDvchQZuNlz_YipTxB44` (2026-11-20). They're
in `media/raw/hf_gen/`, all 1280×720 at 24 fps. Transcripts are in `transcripts/<n>_*/`.

| # | Drive file | Used? |
|---|---|---|
| 1 | SCENE-1-V4-THE-FIRE-INCIDENT | ✅ |
| 2 | SCENE-2-V4-BEGIN-IMMEDIATELY-AFTER-THE (portal → space) | ✅ |
| 3 | HIGGSFIELD-SCENE-3-V4-ROBOT-TRANSFORM | ✅ |
| 4 | Create-a-photorealistic-15-second-sci-fi (clones in studio) | ❌ replaced by #6 (Kalyan's choice) |
| 5 | SCENE-5-V2-THE-GIANT-ESC-KEY-ESCAPE | ✅ from 1.85 s ("Come on" trimmed) |
| 6 | hf_20261120_010116 (clones in space) | ✅ |
| 7 | HIGGSFIELD-VIDEO-EDIT-SCENE-7-V2-BACK (reveal) | ✅ |

The space/Earth punchline was skipped: it wasn't generated, and space already features in clips 2, 3 and 6.

## Timeline

| Start | Clip | Transition into the next clip |
|---|---|---|
| 0:00.0 | 1 Fire | 0.30 s dissolve (near-identical frames) |
| 0:19.4 | 2 Portal | Punch-in on the floating chair over the last 0.9 s + 0.5 s dissolve |
| 0:31.0 | 3 Robot | 0.5 s dissolve (both clips in space) |
| 0:45.5 | 6 Clones (space) | 0.4 s white flash (energy rings → teleport home) |
| 1:09.2 | 5 Shrink / ESC | 0.25 s dissolve (5 ends on its own white flash; 7 opens on a particle burst) |
| 1:31.8 | 7 Reveal | runs to the end (1:53.9) |

## Audio

- **Dialogue:** each clip's own audio was levelled to −16 LUFS first, because the sources ranged from −12 to −22 LUFS. The voice is a mix of AI-generated and Kalyan's own, and is kept as delivered.
- **Music:** an ElevenLabs Music bed (`media/music/myroom/bed.mp3`) at 0.11, sidechain-ducked under the dialogue, with a 1.5 s fade-in and a 2.5 s fade-out.
- **SFX:** ElevenLabs SFX (`media/sfx/myroom/`), placed on frame-checked moments, each at least 0.9 s apart:

  | Time | SFX |
  |---|---|
  | 8.7 | Fire ignite |
  | 21.5 | Portal open |
  | 30.8 | Space whoosh |
  | 35.0 | Robot transform |
  | 48.1 | Clone pop |
  | 63.5 | Clones vanish |
  | 68.7 | Teleport |
  | 69.8 | Shrink |
  | 84.1 | ESC key zap |
  | 88.8 | Thunder |
  | 91.8 | Particles reassemble |

- **Master:** loudnorm to −14 LUFS, −1 dBTP.

## Notes for review

- **Upscale:** a free lanczos upscale with a light sharpen, from 720p. It won't add real detail. Higgsfield's upscaler would look better if credits allow.
- **Clip 7 wording:** "and I started with my normal studio videos in these exact prompts I used" is how the Higgsfield clip says it. It's slightly garbled; re-voice with Kalyan's own recording if wanted.
