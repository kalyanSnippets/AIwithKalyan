# REA v2: editing plan ("I gave REA one link…")

**Status:** analysis done, waiting on Kalyan's answers (see "Open questions"). Nothing is cut yet.
Script: [`REA-v2.script.md`](REA-v2.script.md). Footage: Drive folder **"Video -2"**
(`1OUojrUDw0WQk_CU-tVKRjAexffHeyLTQ`), copied to `REA/media/` (git-ignored).
Transcripts: `REA/transcripts/PXL_20261030_*/` (ElevenLabs Scribe, word timings).

This is a **reshoot**. It replaces the 28 Oct REA cut (`REA.edit-plan.md`, A-roll v3) with a new
11-section script and new screen recordings. The old plan stays in the repo for reference only.

## 1. What's in the folder

### Camera (Pixel, 3840×2160 HEVC, 30 fps, AAC 48 kHz, lapel mic). 31 min raw

All one locked-off medium shot: lavender wall, tall plant on the left, small plant and Buddha on the
right. The framing shifts slightly between clips (camera nudged), so every cut is a jump cut, and
cuts between clips need a small reframe to match.

| Clip | Length | Script sections | Notes |
|---|---|---|---|
| `PXL_20261030_072433489~2` | 5:03 | 1 Hook, 2 What is REA | 41 s of dead air at the start. Many retakes of the Steam and DX-Ball lines |
| `PXL_20261030_072433489~3` | 5:46 | 3 Mission, 4 Subscribe, 5 Setup, start of 6 | Reads the start of the prompt aloud |
| `PXL_20261030_072433489~5` | 7:41 | 6 Prompt (cont.), 7 Claude works, 8 Comment hook, start of 9 | Ends mid-sentence ("Now the big test is") |
| `PXL_20261030_075042392` | 7:53 | 9 Reveal (retake + live test), 10 Honest opinion | First 2 min is mostly silence. **7:46 onward is an unrelated Telugu conversation: always cut** |
| `PXL_20261030_080129730` | 4:52 | **Extra segment not in the script** (0:07–3:12), then 11 Outro (3:56–4:44) | See open question 2 |

`~2`, `~3` and `~5` are three trims of one long Pixel recording. They follow each other in script
order.

### Screen recordings (silent, H.264 30 fps)

| File | Size / length | What it shows | Use |
|---|---|---|---|
| `Screen_Recording_2026-10-30_114128.mp4` | 1732×928 · 7:32 | Full run on the **kmaduri** PC: `cd`, `mkdir kanban-rea-demo`, `npx rea-agents` (detects Claude Code + Codex, agent picker, "Install the guided REA skill? Yes", "REA is ready for local app analysis"), `claude mcp add`, `claude mcp list` (**first shows "Failed to connect" + "Conflicting scopes"**, then Connected), Claude Code welcome, prompt pasted, Claude writing Minicard (156 lines), List (210), useBoardDnd (157), Vite build (43 modules), tests, ends on **"Sautéed for 18m 17s"** | **Main source for sections 5–8** |
| `Screen Recording 2026-10-30 180259.mp4` | 1734×926 · 4:26 | Second run on the **kavya** PC: `rea --help` output, `claude mcp list` showing all claude.ai connectors, Claude Code v2.1.312 welcome with "Opus 5.5 is now your default model", auto-mode notice, prompt sections scrolling, "give me the link run on local server" → localhost:5173 | Backup shots: Opus 5.5 + auto mode line (section 5), clean prompt scroll (section 6) |
| `Screen_Recording_2026-10-30_114559.mp4` | 1920×1128 · 3:13 | Browser: **Wekan demo board** (≈0:00–1:10, scroll + card hover), REA Board at localhost:5173 (≈1:10–3:13): add list "kanban board", add card "Card creation is in progress", detail panel, labels/members/cover, drag and drop, delete dialog | Sections 1 (split teaser), 3 (Wekan scroll), 9 (reveal + live test) |

The recordings are below 1080p, so terminal text gets **zoomed crops** (2–3× on the region that
matters) rather than full-frame playback, and prompt text is re-typeset as a big prompt window
(Kalyan's rule: no copy-paste recordings of prompts).

## 2. How the edit will be cut

Kalyan's standing rules apply (AGENTS.md): first real line first, last clean take of every line,
every stumble and false start cut, silences ≤ 0.35 s except emotional pauses, misspoken
numbers cut and carried by the graphic.

Source times below are `clip mm:ss` from the transcripts. The word-exact EDL comes after approval.

| # | Section | Takes to keep | Cut | Fixes / graphic carries |
|---|---|---|---|---|
| 1 | Hook | `~2 00:41.6–00:51.9` ("This one tool…REA for short"), `00:57.1–01:05.1` ("It let AI open any app…it built this"), hold for split, `01:13.8–01:15.7`, `01:16.5–01:21.4` + the 2nd name take `01:25.9–01:29.4` ("I am Kalyan…Okay, let's go") | 41 s dead air, "It's called REA-- It's called…" retake, the first name take | Says **"twenty minutes later"**; screen says 18m 17s (open question 3). Split screen "Which one is real?" in the 8 s gap |
| 2 | What is REA | `01:41.3–02:00.7`, `02:06.7–02:20.5`, `02:28.6–02:37.0`, `02:45.3–02:47.4`, Steam `02:54.9–03:03.0` + `03:04.8–03:07.6` (drop "uh"), Blender `03:43.3–03:55.5`, DX-Ball `04:39.8–04:47.3`, Notion + "find out" `04:49.6–04:59.8` | ~1:40 of Steam/DX-Ball retakes ("matched all the thousand…", "two thousand two") | GitHub page needs a **fresh recording** (open question 4). Four example cards with the numbers on screen |
| 3 | Mission | `~3 00:02.3–00:21.3`, `00:26.6–00:46.8`, `00:46.9–00:51.1`, `00:53.8–00:57.0` | "it has list, it has list", "To give the Claude code--", "so we can--", "so can Rea," | Wekan scroll from `114559` 0:00–1:10, "Mission: clone this board" |
| 4 | Subscribe | `01:01.4–01:05.0`, `01:06.4–01:11.2`, `01:14.6–01:16.4`, `01:19.2–01:20.4` | "If you want me to clone--", first "it really helps this channel," | Small subscribe animation, no face cover |
| 5 | Setup | `01:42.4–01:47.8`, `01:49.8–01:51.8`, "To do that, type this command and go inside it", `02:02.0–02:04.5`, `02:24.3–02:26.9`, `02:45.2–02:57.7`, `02:59.4–03:01.1`, `03:04.1–03:06.5`, `03:48.6–03:54.8`, `03:58.9–04:12.4`, `04:18.7–04:21.8` | 5 broken install takes (02:05–02:23), "To do so--", "To check Re-- uh", the 20 s and 18 s pauses | He says "type this command", so **every command appears as big kinetic text** over the zoomed terminal. Hide the "Failed to connect / Conflicting scopes" frames; show only "✓ Connected" |
| 6 | The prompt | `04:31.9–04:36.9`, `04:52.4–04:53.9` ("So I'm pasting this in"), prompt read (open question 1), `~5 01:46.3–01:50.0` (description), `02:02.6–02:48.4` (four reasons) | Repeated reads, "Name it Rea Board" ×2, "stack tack", 4 broken "description" takes, "Not look--" | Typed prompt window, sections highlight: MEASURE FIRST, STACK, BOARD SCREEN, TESTING. Pinned-comment/description card for the prompt |
| 7 | Claude works | `~5 03:02.9–03:16.3`, `03:30.4–03:36.1` + one "robot" line, `03:43.2–03:55.6` (drop "fifty--"), `04:02.9–04:04.2`, `04:07.6–04:11.6`, "The whole thing took around eighteen minutes" `04:20.5–04:22.6` | 4 broken Playwright takes, "Hmm.", "The whole took--" | 3–4× sped-up `114128` with a running timer to **18m 17s**, zooms on file names + line counts. Script lines he didn't say (Roboto 14 px, 43 modules, "sped this up") become **silent on-screen captions** |
| 8 | Comment hook | `04:32.8–04:39.2`, `04:43.5–04:50.9`, `05:07.1–05:11.3` | Two full retakes (04:55, 05:21) | Freeze on "All 50 checks passed", "Guess the match %?" card |
| 9 | Reveal + test | `~5 06:00.6–06:30.1`, `06:31.0–06:36.5`, `06:41.1–06:47.0`; then `075042392 03:03.1–04:16.1` | "data badges", "But hey l-", the earlier 075042392 retakes (00:00–02:52) | Split ORIGINAL vs REA BOARD with circles. Says "blue with a **blue** menu" (graphic labels it "board menu") and "nine days **ago**" (graphic shows the real "9 days overdue" badge) |
| 10 | Honest opinion | `075042392 04:35.3–04:37.4`, `04:39.8–04:46.5`, `04:49.4–04:56.5`, `05:10.7–05:17.8`, `05:33.1–06:08.8`, `06:09.7–06:22.7`, `06:23.3–06:26.9` | 5 broken "Number two is it ju--" takes, first "three is" take | Says **"it took twenty minutes"** (open question 3). Ticks ×3 then "BUT"; star count flash |
| 11 | Outro | `080129730 03:56.3–04:44.3` | "I'm going to test more AI--", "which app should...", first "don't forget to share" | End screen: previous-video card + subscribe, held ~20 s |

**Estimated length:** about 9:30–10:00 including the sped-up build and the live test, close to the
script's 9:50.

## 3. Visual plan (short version; full beat sheet after approval)

- **Look:** dark glass, Claude coral `#E8775F`, Inter, power3/back-out eases (house style). The old
  REA cut used a lime accent; this version goes back to coral.
- **Face:** never covered; no graphics on the plant. When the screen matters, Kalyan goes into the
  rounded PiP card bottom-left. Cover look-aways (he glances at the laptop a lot in section 5) with
  full-screen terminal visuals, checked with `scripts/gaze.py`.
- **Hook:** split ORIGINAL | REA BOARD with labels hidden, "Which one is real?". The answer is held
  until section 9.
- **Section 2:** real GitHub page with zooms on Stars and Forks, a "0 → 300K in ~2 weeks" growth
  bar, a "your agent ↔ REA ↔ expert RE tools, runs locally" diagram, then four big example cards
  (Steam→Unity C# 30 min / 460K views; Blender 300K+ functions / 70 min; DX-Ball 3,205/3,205 cases;
  Notion clipboard trace).
- **Section 5:** full-screen numbered steps (1 folder, 2 install REA, 3 connect MCP, 4 start Claude)
  with each command as large typed text, plus a zoomed terminal.
- **Section 6:** typed prompt window, four "why it works" icons (ruler, locked stack, screen map,
  tick-with-eye).
- **Section 7:** animated terminal, files ticking in as he names them, timer to 18m 17s.
- **Section 9:** circles/arrows on each feature as named; then full-screen REA Board live test with
  the recording's own pacing.
- **Section 10:** "Worth the hype?" → ✓✓✓ → "BUT" card → ethics card (open source only, no
  name/logo/images).
- **Captions:** short phrases (≤ 5 words) bottom-centre, hidden under kinetic text.
- **Audio:** Studio Sound (Descript) on the voice, subtle music bed (~0.11), sparse whooshes/pops
  ≥ 0.9 s apart, master −14 LUFS / −1 dBTP.

## 4. Gaps and risks found

1. **Numbers that don't match the screen:** "twenty minutes" (hook + section 10) vs 18m 17s on screen.
2. **Prompt read aloud** for ~1 min in `~3`/`~5`, though the script says not to.
3. **Unscripted segment** in `080129730` 0:07–3:12: copyright "number three", REA's own "only
   software you own" quote, bonus tip ("you don't need REA every time"), "software engineering is
   not dead", the look→understand→rebuild loop, and a second like/share/subscribe + "comment
   desktop" + "watch this video next" ending. It starts at "number three", so numbers one and two
   aren't in this footage.
4. **No GitHub recording** in this folder. The only one in the repo is from 28 Oct (1024×552, 399K).
   The script now says 400K+ stars and 100K+ forks.
5. **Example claims** (Steam 460K views, Blender 300K functions/70 min, 0→300K stars in two weeks,
   "millions of views") need sources for the on-screen cards.
6. **Private info on screen:** Windows usernames (`kmaduri`, `kavya`), and the kavya run lists every
   connected claude.ai connector. Blur or crop these.
7. **ElevenLabs API key:** `.env` key is empty and the sandbox proxy's ElevenLabs credential is
   rejected (`invalid_authorization_header`), so `npm run transcribe/music/sfx` can't run here.
   Transcription was done through the ElevenLabs connector (≈ 10.3K credits). Music and SFX need
   the key fixed, or the connector.

## 5. Open questions (asked in chat)

1. Prompt section: keep him reading the prompt (over the typed prompt window) or cut to "I'm pasting
   this in" plus a short visual-only scroll?
2. The unscripted segment in `080129730`: drop it, or fold parts into section 10?
3. "Twenty minutes" vs 18m 17s: how to fix?
4. GitHub page: will Kalyan record github.com/morluto/rea fresh, or should I capture it?
5. Example cards: links to the original posts (Steam, Blender, DX-Ball, Notion), or should I research
   and cite them?
6. Previous video for the end screen: confirm it's the CLD_1279 "How I edit videos with Claude"
   video, and get its URL/title.
7. Outro: use his on-camera outro (section 11) rather than the usual voice-clone outro over
   graphics?

## 6. Next steps once answered

1. Word-exact EDL `REA/edits/REA-v2.edl.json` + rough cut proxy (1080p) for review.
2. Studio Sound on the voice track.
3. Gaze pass, then the full visual beat sheet `REA-v2.visual-plan.md`.
4. HyperFrames scenes section by section, music/SFX, mix, export, < 30 MB review copy.
