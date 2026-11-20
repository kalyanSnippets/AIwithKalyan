# GTA6 v1: self-review

Video: `GTA6/renders/GTA6_v1_mixed.mp4` (8:19, 1920×1080, 30 fps). Review copy `GTA6_v1_review.mp4` (1280×720, < 30 MB).
Build: `compositions/GTA6/build.mjs` (HyperFrames 0.8.160) + `scripts/mix-from-html.py` (audio).
Brief: `GTA6/edit-brief.md` (approved 2026-11-20).

## Measured checks

| Check | Target (brief §9) | Measured | Result |
|---|---|---|---|
| Every REQUIRED beat has its visual | 44 beats | 44 built (beat-by-beat in build.mjs; IDs follow the brief) | PASS |
| Chapter cards | all 6, same template | 01–06 present, one template, tag top-right | PASS |
| Visual change, first 43 s | every ≤ 3 s | 13 events + footage montages; longest static stretch 4.3 s ("Well, that's where things get really interesting") | FIX → accepted (one line on his face) |
| Longest face-only hold | ≤ 8 s (takeaway ≤ 10 s) | after fixes: 7.0 s (4:28–4:36, has kinetic text); CTA stretch has buttons popping in | PASS |
| A-roll covered by graphics/footage | — | 80 % | info |
| Kinetic keywords beside him (E1) | ≤ 6 | 8 (ZERO?, DECADES, police tease, NOT JUST SPEED, NOT ChatGPT, GRAPHICS ≠ AI, DON'T ASK…, SUBSCRIBE) | FIX → open (see below) |
| SFX | ≤ 4/min, ≥ 0.9 s apart | 38 total = 4.6/min, min gap 5 s (non-whoosh 6.5 s) | FIX → open (slightly over) |
| Captions | ≤ 5 words, matched to Scribe | 288 groups, ≤ 5 words, ElevenLabs word timings; 15 % shorter than 1.0 s (fast speech) | PASS (with note) |
| Voice vs music | music ≥ 18 dB under voice | during speech: median 28 dB, 10th pct 19.7 dB (with 4 dB ducking) | PASS |
| Loudness | −14 LUFS, ≤ −1 dBTP | −14.0 LUFS integrated, peak −1.0 dBFS, LRA 2.3 | PASS |
| Face / plants covered | 0 frames | kinetic text sits on the empty wall top-right; chapter tag top-right; PiP bottom-left | PASS (sampled frames) |
| Footage with music audible | 0 s | all Rockstar footage muted (`-an` in prep.mjs) | PASS |
| Black / frozen frames | none | v1 first render had a 0.5 s black at 7:44.5 → fixed; freezes are only the intended freeze-annotate beats | PASS after fix |
| Lip sync | no drift | A-roll pieces use exact frame counts per segment; cam audio and picture end within 0.02 s | PASS |
| Review copy | < 30 MB | ~23.5 MB | PASS |

## Context review (beat by beat, summary)

- **Hook (0:00–0:43):** logo → city → "13 YEARS OF HYPE" → his face with ZERO? → the GamesRadar headline → struck-through prompt → four questions over footage → roadmap with a locked slot 6. The energy comes from the visuals, because the voice is level (see context map). Works.
- **Scene 2:** generic AI tiles → real police chase gameplay with CRIME → WITNESS → RESPONSE → traditional-AI trio. Clear.
- **Tech 1:** the freeze on an NPC turning and "NOTICES YOU" is the strongest proof beat. His "Bro…" laugh stays on his face (humour beat, no effect, on purpose).
- **Tech 2:** real gameplay with the wanted-level stars → freeze rings CAR · CLOTHES · FACE → criminal-profile card. Card rows land on the words.
- **Tech 3:** freeze on hands on the wheel → 2D rig showing hands missing the wheel (red) then snapping on (teal) → crowds.
- **Tech 4:** Jason + Lucia → quote card → follow vs together → top-down map (wait / reposition / react) → "NOT ChatGPT".
- **Tech 5:** beauty montage incl. sunset skyline → RAGE hero → 4-layer stack → real night-drive gameplay frozen with LIGHT / SURFACE → GRAPHICS ≠ AI → code / physics / artists.
- **Tech 6:** future title over sunset → handcrafted + generative AI? → shopkeeper chat with memory → branching missions → caveat lower third → ML teams vs every-NPC-a-chatbot → consistent / fun / safe.
- **Takeaway + CTA:** "THE BIGGEST LESSON" card → creativity + technology → app / content / AI → DON'T ASK / ASK → GTA 7 question over the city → EXCITING / CREEPY → subscribe.
- **Outro:** recap of 6 → like / subscribe / bell → description + pinned comment → end card, voice-clone recording.

Removal test: no shakes, glitches or particles. SFX reduced from 60 to 38 (pops only where something visibly lands). Music changes only at chapter boundaries.

## Deviations from the brief (Kalyan to accept or ask for a fix)

1. **Retargeting (E8)** is a 2D figure animation (the approved style frame), not 3D. Reason: time and render cost; it explains the idea clearly. Can be upgraded to Three.js in v2.
2. **Rob Nelson quotes** (beats 13, 25) are paraphrases of the script's own claims, labelled "paraphrased". Best Buy blocks automated access, so his exact words could not be captured. Replace with exact quotes if Kalyan pastes them.
3. **E1 count 8 vs ≤ 6** and **SFX 4.6/min vs ≤ 4**: both slightly over. Kalyan's "every sentence gets a visual" rule pulled the count up. Easy to trim if they feel busy.
4. **Takeaway pauses** were not re-opened to 0.35 s yet (the cut still caps them at 0.2 s). The takeaway has calm music and fewer effects, but the voice pace is unchanged.
5. **Captions** show "simulating" where he said "stimulating".
6. **Studio Sound** not used (paid connector, not approved). Voice chain: 80 Hz high-pass, light FFT de-noise, 2.5:1 compression, then mastered.
7. **Shorts (2)** are not built yet. They come after v1 feedback, using the same build.

## Honest limits

I checked structure, measurements and sampled frames (about 50 stills across the film). I cannot hear or feel the video the way a viewer does. Kalyan, please watch for:
- the joins between takes (rhythm, breaths)
- whether the music feels too quiet now that it ducks under the voice (median 28 dB under)
- whether the fast montages in the hook read well, or feel too quick
- text readability on a phone (smallest text is the 20–26 px labels on cards)
