# REA: edit decision list v1 (for approval)

Transcripts: local faster-whisper `small.en`, no paid API (`scripts/transcribe-local.py`). Machine-readable list: `REA.edl.json`.
Clips: A=084617376, B=085709806, C=091220786, D=092402126, E=102753700, F=110231565 (all under `REA/media/raw/`).
Times are `mm:ss` in the source clip. At the rough cut each in/out snaps to the nearest word, with 0.1 s handles, and internal pauses over 0.35 s shrink to 0.35 s.

## Result

| Section | Kept (after pause trim) | Script target |
|---|---|---|
| S1 | 2:26 | ~2:00 |
| S2 | 4:22 | ~3:00 |
| S3 | 2:19 | ~1:30 |
| S4 | 0:37 | ~1:30 |
| S5 | 1:50 | ~1:30 |
| S6 | 1:42 | ~1:15 |
| S7 | 1:04 | ~0:45 |
| S8 | 0:15 | ~0:15 |
| **Total** | **14:38** | 10 to 12 min |

S3 to S5 still contain waiting/typing time that the screen recordings will speed up (script says so), so the real total lands near the target. S4 and S5 total 2:28 against the script's 3:00, because the build recording itself carries the rest.

## Cut list (keep these ranges, in order)

| ID | Clip | In | Out | Why |
|---|---|---|---|---|
| S1-01 | B | 00:31.18 | 00:53.28 | Hook: 'Hey guys…REA for short' (clean take). Pre-roll REA test at 0:25 cut |
| S1-02 | B | 00:54.18 | 01:02.36 | 'now look at this' said twice: keep 2nd. Screen rec A02 (GitHub 399k) over this line |
| S1-03 | A | 01:51.84 | 01:57.96 | 'That is a crazy number…free and open source' (B's version said 'any developer tool' then repeated) |
| S1-04 | A | 02:23.88 | 02:39.80 | 'So what is it? Simple, you see a feature…build your own version' (cleanest of 3 attempts; B stumbled 'Claude Codex / React') |
| S1-05 | B | 02:37.78 | 04:03.78 | One clean run: wild things > 3 reasons > 'is it really that good' > stay till the end. Pause at 3:03 trimmed |
| S1-06 | A | 06:09.52 | 06:19.96 | 'Oh, and by the way, I am Kalyan…try today' (B had 4 false starts) |
| S1-07 | A | 06:25.16 | 06:30.02 | 'If you like this, tap subscribe…Okay, let's go.' Repeat at 6:21 cut |
| S2-01 | E | 01:29.44 | 01:48.26 | 'Let me explain…why I picked Wekan…columns like to do,' |
| S2-02 | E | 01:50.62 | 02:01.12 | 'doing and done' said twice: keep one |
| S2-03 | E | 02:01.70 | 02:14.92 | Wekan popular, public demo, MIT. False start 'it has a public demo' repeated: keep one |
| S2-04 | E | 02:19.24 | 02:34.92 | 'one more reason' (retake of 2:15) > behaviours > great test for REA |
| S2-05 | E | 02:35.60 | 02:48.80 | 'What we are trying to achieve…not copy the whole Wekan'. ~8 s dead air inside |
| S2-06 | E | 02:58.26 | 03:35.22 | Retake 'big team and a lot of prompts' > REA Board features > no login/sync/server > my own name and design. Drops 2:48-2:55 first attempt |
| S2-07 | E | 03:38.96 | 03:39.88 | 'Not the full product.' (2nd of 2) |
| S2-08 | E | 03:41.16 | 03:47.58 | 'Okay, now the setup. What we need before we start'. Stumble 'First we need first' trimmed |
| S2-09 | E | 04:16.98 | 04:37.52 | Requirements: Windows 10+, internet, Claude account. NOTE: he says 'Windows laptop', script says Mac first |
| S2-10 | E | 04:51.54 | 05:28.78 | PowerShell command, version check, first sign-in. Typing silence = speed up with screen recording |
| S2-11 | E | 05:32.78 | 05:48.36 | Node check intro |
| S2-12 | E | 06:13.98 | 06:27.40 | 'REA needs Node 22 or 24 or newer…install from nodejs.org'. Dead air 5:48-6:13 cut |
| S2-13 | E | 06:30.22 | 07:32.30 | REA setup: y > Claude Code only > list of changes > Hopper no > restart > mcp list. Repeated 'then it asks which agent' trimmed |
| S2-14 | E | 07:34.00 | 07:47.48 | Chrome extension |
| S2-15 | E | 07:52.94 | 08:00.86 | Project folder + start claude |
| S2-16 | E | 08:32.66 | 08:35.46 | 'And that is it. Now the real fun begins.' (2nd of 2) |
| S3-01 | E | 09:06.92 | 09:25.52 | Prompt 1 intro: Wekan link, web tools only, don't build |
| S3-02 | E | 09:53.78 | 10:52.58 | Explains the 5 report points. Stumble 'basically in the prompt I mentioned' x2 trimmed. Script says do NOT read prompts word by word: candidate to shorten (needs approval) |
| S3-03 | E | 11:01.68 | 11:21.92 | 'Study but do not build' + favourite trick: observed / inferred / not sure |
| S3-04 | E | 11:27.74 | 11:51.74 | Comment question while Claude works |
| S3-05 | E | 11:55.52 | 12:24.90 | 'Let's see what Claude found' (2nd of 2) > report reveal |
| S4-01 | E | 12:41.02 | 12:48.60 | 'Now Claude knows how the app works, it's time to build' (1st of 3). 'and this is Prompt 2' is garbled in all 3 attempts: PICKUP NEEDED or card 'PROMPT 2' |
| S4-02 | E | 13:20.38 | 13:32.20 | 'Notice one thing…my own name…not copying logos' |
| S4-03 | E | 14:36.08 | 14:53.30 | 'This takes a few minutes, speed it up…stay till the end' |
| S5-01 | E | 15:07.92 | 15:17.50 | 'Ok, here it is guys. This is my REA Board' (repeat 'this is my' trimmed) |
| S5-02 | E | 15:17.50 | 15:44.40 | Columns + cards demo lines. 'first columns I can add a column' said twice: keep one |
| S5-03 | F | 00:20.88 | 00:55.60 | Drag and drop (retake), extras, refresh = saved. Pairs with live demo recording |
| S5-04 | F | 00:55.60 | 01:09.86 | 'Now here is how close it looks to the original' + 'what it did not build'. FILL-IN: say what matches / differs: not in take |
| S5-05 | F | 01:10.42 | 01:43.94 | Not built: login, real-time sync, server. 'so Claude did not build it' said twice: keep one |
| S6-01 | F | 01:48.98 | 01:55.22 | 'Is REA worth the hype?' (1st of 3 attempts; 1:56-2:02 repeats cut) |
| S6-02 | F | 02:02.66 | 02:06.02 | 'My honest answer is yes. It is worth trying.' |
| S6-03 | F | 02:12.08 | 02:48.18 | Two prompts is powerful, evidence labels, 'not magic', downside 1. Repeat 'going from I like this feature' x2 and 'but it is not magic' x2: keep latter |
| S6-04 | F | 02:54.90 | 03:19.70 | Downside 1 end, downside 2, number 3 start. 'number two is to number two is' stumble trimmed |
| S6-05 | F | 03:26.08 | 04:02.92 | Vague prompt, test yourself, downside 4, authorised use, verdict. 6 s pause before 3:26 cut |
| S7-01 | F | 04:08.76 | 04:13.08 | 'Build any app…the best part guys' |
| S7-02 | F | 04:28.04 | 04:56.38 | Two-step recipe. 'same two steps for almost any' repeated x3 and misspoken 'almost anywhere that you like': FLAG (small fix with caption or pickup) |
| S7-03 | F | 04:59.96 | 05:07.56 | Homework (2nd of 2) |
| S7-04 | F | 05:07.94 | 05:10.86 | MISSPOKEN: 'which app you REVIEWED' (should be rebuilt). Recommend cut or pickup: needs approval |
| S7-05 | F | 06:02.14 | 06:25.32 | Last take of like / share / subscribe+bell / 'more AI tutorials coming'. Earlier passes at 5:12 and 5:33 cut as retakes. Stumble 'so if you do not miss' trimmed |
| S8-01 | F | 06:27.06 | 06:48.64 | End-screen line + thanks + bye |

## What was found

**Retakes (best take chosen, others dropped).** Hook: A and B are two full takes, plus a third pass inside A. Intro line: B has 4 false starts, A is clean. 'So what is it?': three attempts. Setup narration: E is the full take, C and D are the live version. Subscribe/like/bell: three passes in F. 'Is REA worth the hype?': three attempts.

**Repeated explanations.** The REA explanation is given in A, B and again in E in different words; the single-take version per section is kept. Setup (Hopper, 'only Claude Code', `mcp list`) is said twice: D (live) and E (to camera). Only E is in the cut. The Wekan explanation exists in B (5:33 to 8:29) and E (1:29 to 3:42). E is used for consistency with the setup.

**Stumbles and false starts cut at word level.** 'now look at this' x2, 'doing and done' x2, 'it has a public demo' x2, 'basically in the prompt I mentioned' x2, 'so Claude did not build it' x2, 'number two is to number two is', 'so if you do not miss'.

**Misspoken, need your decision.** (1) 'which app you reviewed' should be 'rebuilt' (F 05:07). (2) 'for almost anywhere that you like' instead of 'any web app you like' (F 04:22). (3) 'and this is Prompt 2' is garbled in all three attempts (E 12:41 to 13:20). (4) 'old DOS game' for DX-Ball is probably factually wrong (README says DX-Ball; DOS unverified).

**Long pauses.** Over 1 s: A 17 (110 s), B 22 (147 s), C 28 (341 s), D 13 (81 s), E 47 (306 s), F 15 (49 s). Most are typing or waiting on screen. Those stretches need the screen recordings, not talking-head footage.

**Filler words.** Whisper small drops most 'um/uh' on purpose: only 7 were detected (all in E 00:48 to 00:59, before the take starts, which is cut anyway). The rough cut will run an audio-level pass at each cut point to catch the ones the transcript misses. Say if you want stricter filler removal.

**Not used (held back).** C (all 9:34) and D (all 6:31): live Windows walkthrough with Kalyan looking at the laptop and little speech (277 and 134 words). Includes an unscripted PATH error fix (C 02:25 to 03:44). Unused unless you want a troubleshooting segment. The first 0:00 to 0:30 of every clip is set-up chatter.

## Decisions needed before the rough cut

1. **Mac vs Windows.** Script is Mac first with Windows second; the footage is Windows only ('I am using a Windows laptop'). OK to publish Windows-only and drop the Mac steps and the Mac/Windows split? Or will you record the Mac part?
2. **Screen recordings.** None of the terminal, Wekan, prompt, build or REA Board recordings are in the folder yet (see `assets/asset-manifest.csv`). The rough cut will use the camera track with placeholders where they go.
3. **Misspoken lines** above: cut and add a captioned correction, or record pickups?
4. **Prompts read aloud** (E 09:53 to 10:52, E 13:38 to 14:16): script says not to read them word by word. Shorten to the 'in simple words' summary lines?
5. **Look-aways.** While he looks at the laptop (C, D, parts of E) the plan is a full-screen cover, per your preferences. No face covering otherwise.
6. **Section 5 and 6 fill-ins** (how close the look is, what broke, what impressed you) are not in the takes. Add a pickup recording or skip?

Nothing has been deleted: the original clips are untouched and every cut is only a range in this list.

## v2: decisions applied (Kalyan, 29 Oct)

1. Windows only. No Mac steps. Footage already Windows.
2. "an old DOS game" removed from S1-05 (now "the sound panning of DX Ball"). "which app you reviewed" kept exactly as said (S7-04).
3. Prompts read aloud shortened: S3-02 (E 09:53 to 10:52, the 5-point recital) dropped; the prompt itself is shown on screen. The heading read aloud at F 04:08 ("Build any app plus subscribe like and share") is also cut; S7-01 is now F 04:11 to 04:16.
4. Section 5 and 6 fill-ins skipped. No pickups.
5. Screen recordings not provided, so the rough cut stays on the camera track. `REA.rough-cut-markers.json` lists where long silent gaps were (screen-recording slots).

Built with `scripts/rough-cut.py`: 41 ranges, word-snapped, pauses collapsed to about 0.4 s, 10 word-level dup trims. Result 13.6 min, 1080p30 H.264, voice chain applied (highpass, light denoise, gentle EQ and compression, loudnorm -14 LUFS / peak -1.3 dB).
