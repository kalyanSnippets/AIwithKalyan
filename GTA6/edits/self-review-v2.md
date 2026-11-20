# GTA6 v2: self-review

Video: `GTA6/renders/GTA6_v2_mixed.mp4` (490.6 s ≈ 8:11, 1080p). Review copy `GTA6_v2_review.mp4` (720p, 28.9 MB).
Built from Kalyan's v1 notes plus his answers: official Rockstar footage only, a mix of 3D and game-HUD overlays, an 8 s intro, and a full cuts pass done by the editor.

## Kalyan's v1 notes → what changed

| Note | Done in v2 |
|---|---|
| Replace plain cards with rich, moving 3D / animation | All tile/quote/profile/stack/map/branch cards replaced: 23 Three.js scene slots (18 scene types: prompt-city glitch, 6-monolith roadmap, AI holo-panels, police decision tree, NPC-notice diorama, police profile database, witnesses → police, 3D retargeting rig in car seats, interaction network, follow vs together, arriving together, RAGE layer stack, code/physics/artists → city, branching missions, story rail, creativity + technology merge, end-screen flythrough) |
| Hype intro: logo first, fast montage | Logo slam (official launch-trailer logo) → 12 fast cuts with whip/punch moves and flash frames, "13 YEARS / OF HYPE / IT'S HERE", ElevenLabs hype track; 8.0 s |
| Show literally what he says | Official footage matched per line: walking, two people talking, walking up behind them, stealing a car, police noticing, the real chase, masked robbery, driving, Jason & Lucia sitting / arriving together, the store clerk, street race, neon street. 22 HUD overlays track the real people and cars in those shots (MediaPipe object tracking): awareness meters, personal-space rings, police lock-on + radar, CAR/CLOTHES/FACE scanner, name tags, "retargeted" tags, rain overlay |
| Hard cuts in footage | Footage now cross-dissolves (0.22 s); intro uses deliberate whip/punch cuts with flashes |
| Words trimmed off | A-roll v4 cut: word-protection pass; 0 kept words clipped (27 were partly clipped in v1, 3 missing) |
| Spellings | Captions take the script's spelling where the transcript differs by a small edit: realize.→realise!, recognize→recognise, rate-traced→ray-traced, behavior→behaviour, behavior→behaviour |
| Remove the voice-clone CTA | Removed entirely. 9 s animated end screen: channel name, Subscribe → Subscribed, bell ring, "Comment: EXCITING or CREEPY?", "See you in the next video", over a 3D night-city flythrough with music |
| Technology intros as 3D | Each of the 6 chapters: camera flies down a neon avenue to an extruded 3D number, title letters flip in |

## Measured
- Loudness −14.0 LUFS integrated, peak −0.9 dBFS, LRA 2.4. Music under voice during speech: median 28 dB, 10th pct 19.9 dB (ducking 4 dB).
- No black frames (blackdetect). Freezes only where intended (freeze-scan beats).
- Captions ≤ 5 words; hidden under kinetic text, chapter and announcement cards.
- SFX: 17 (sparser than v1).

## Known issues (fix in v3)
1. ~3:28: "Runtime animation retargeting" headline collides with the big TALL / SHORT labels.
2. ~4:24: "Following vs. being together" headline collides with "MOVES TOGETHER".
3. 3D transitions fade in over his face for ~0.3 s before he moves to the corner window (brief particles over the face).
4. Roadmap monolith captions are small; the numbers read, the names are hard to read on a phone.
5. Dark footage (el_neon, night drive) is dim under the HUD.
6. Rob Nelson citations are now a lower third only (no paraphrased quote card).

## Honest limits
Checked about 85 sampled frames plus measurements. I can't judge the feel of the 3D motion or the music the way a viewer would. Watch especially the intro energy, whether the 3D scenes feel premium enough, and the pacing of the HUD beats.
