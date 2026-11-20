# GTA 6 — v3 self-review (Kalyan's v2 notes → fixes)

| # | Kalyan's note (v2) | v3 fix |
|---|---|---|
| 1 | "13 OF HYPE" → "13 years of waiting" | Intro and hook now read **13 YEARS / OF WAITING** |
| 2 | 0:13–0:18 sudden cut | Caused by a zero-length glitch word in the transcript, which ended the hook montage early. The builder now ignores zero-length words, so the aerial runs through cleanly into the line |
| 3 | "breakdown" misspelled / stuttered | The cutter clipped a removed retake ("break-- break down"). Word protection now stops at removed neighbours; the caption reads "breakdown" |
| 4 | 1:22 blank screen too long | The 3D brain scene's orbit camera passed inside a building. The city now keeps a clear radius around the camera, so the scene renders throughout |
| 5 | 1:25 "GTA 6" overlapped + black screen | "GTA 6 TAKES IT / MUCH FURTHER" moved clear of the 3D title; black frame removed |
| 6 | Technology titles | 01 NPC Behaviour · 02 Criminal Profiling · 03 Animation Retargeting · 04 Character Relationships · 05 RAGE · Rockstar Advanced Game Engine · 06 Machine Learning & the Future of Gaming (chapter cards and corner tags) |
| 7 | 2:32 "everything is back to normal" | Now a police helicopter shot with a GTA-style WANTED HUD: stars flash, then drain to **WANTED LEVEL CLEARED**, then a street shot with "BACK TO NORMAL?" |
| 8 | 6:10 repeated screen; redesign 6:10–6:20 | New 3D "hand-made vs generated" scene (handgen) replaces the reused bridge shot |
| 9 | 7:41 "GTA 7" wrong + same flight background | New 3D "remember" scene with the correct **GTA 7** title; the flight shot is gone |
| 10 | More GTA 6 B-roll | Face-only time went from 16% to 12%. 10 face-only stretches now get official Rockstar footage, each with a different shot (the picker never repeats a shot within 90 s). His face stays visible for the opening line, "Bro imagine", the caveat and the CTA |
| 11 | Mild background music while explaining | The music bed now plays under the whole explanation (bed 0.16), ducked under speech. See the mix report for the voice-over-music level |
| — | Smooth cuts | A-roll rebuilt (aroll-v5) with 0.12 s dissolves at every join instead of hard cuts |

## Checks run
- `hyperframes lint`: 0 errors
- Snapshot checks of every changed slot (0:04, 0:15, 0:18, 0:20, 0:24, 1:40, 2:35, 4:43, 5:42, 6:52, 7:30, 7:50, 8:04)
- Shot-repeat scan after the intro: no shot comes back within 20 s. Five shots return 20–57 s later (el_talk 1:35/1:55, el_police 0:34/1:10, beach_crowd 3:00/3:42, el_sunset 5:04/6:00, highway_day 6:53/7:46), each in a different context
