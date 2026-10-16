# AGENTS.md — AI with Kalyan video editing

This repo is the workspace for editing **AI with Kalyan** videos with AI agents. Raw footage stays
out of git (it lives in Google Drive and is copied into `media/` locally); the repo holds the
tooling, transcripts, HyperFrames compositions and edit notes.

## Tool stack — use these defaults, in this order

| Job | Default tool | How |
|---|---|---|
| **Transcription** | **ElevenLabs Scribe (always)** | `npm run transcribe -- <file>` |
| Music beds | ElevenLabs Music | `npm run music -- "<prompt>" --seconds 60` |
| Sound effects | ElevenLabs SFX | `npm run sfx -- "<description>" --duration 1.5` |
| Voiceover / TTS | ElevenLabs | HyperFrames `media-use` skill (ElevenLabs provider) or the ElevenLabs connector |
| Motion graphics, titles, lower-thirds, captions, overlays | HyperFrames | skills in `.claude/skills/` (start with `/hyperframes`) |
| Cutting, joining, proxies, audio mix, final encode | FFmpeg | `npm run media -- …` or `ffmpeg` directly |
| Source-based B-roll | Browser research + capture | `npm run broll -- <url>` |
| Screen demos | Kalyan's own screen recordings | `media/screen-recordings/` |

### Transcription rule (non-negotiable)

**ElevenLabs is the default and only transcription tool for this project.** Every transcript,
caption file and word-timing source must come from `npm run transcribe` (ElevenLabs Scribe,
`scribe_v2`), or from the ElevenLabs connector's `creative_transcribe_audio` tool when the script
cannot run.

- Do **not** use `hyperframes transcribe <video>`, Whisper, whisper.cpp, Parakeet, or the
  transcription step of `hyperframes init --video`. Always pass `--skip-transcribe` to `init`.
- When a HyperFrames skill (`embedded-captions`, `talking-head-recut`, `media-use`, …) says
  "transcribe", run `npm run transcribe` instead, then **import** the result:
  `npx hyperframes transcribe transcripts/<name>/words.json` (import mode only, no ASR).
  Export captions with `npx hyperframes transcribe transcripts/<name>/words.json --to srt -o out.srt`.
- Use another ASR only if the user explicitly asks for it in that conversation.
- If `ELEVENLABS_API_KEY` is empty or the API cannot be reached, stop and tell the user. Don't
  fall back to another engine.

Useful flags: `--language en`, `--speakers 1`, `--keyterms "Claude,HyperFrames,ElevenLabs"`
(names Scribe would otherwise misspell), `--offset <seconds>` (shift timings when transcribing one
segment of a longer recording).

Outputs land in `transcripts/<name>/`: `elevenlabs.json` (raw, includes audio events like
laughter), `words.json` (HyperFrames word array with speakers), `transcript.txt`, `captions.srt`.

## Setup and verification

`npm run setup` does all of the following in one go. Cloud sessions run it automatically through
the SessionStart hook in `.claude/settings.json`.

```bash
npm install                     # HyperFrames CLI, ElevenLabs SDK, playwright-core, gsap
npx hyperframes browser ensure  # headless Chrome used for rendering and B-roll capture
pip install elevenlabs          # used by HyperFrames media-use TTS
cp .env.example .env            # then paste ELEVENLABS_API_KEY
npm run doctor                  # all checks green; `npm run doctor -- --live` also tests the API key
```

`.env` is git-ignored. Never print, log or commit the key. Scripts load `.env` themselves, and so
does the HyperFrames CLI when run from the repo root.

## Layout

```
media/raw/                 camera originals (CLD_1279 segments, etc.) — never modified
media/screen-recordings/   Kalyan's screen captures
media/joined/              full takes rebuilt from camera segments
media/proxies/             1080p H.264 editing proxies (npm run media -- proxy)
media/broll/               captured B-roll + SOURCES.md (committed)
media/music, media/sfx, media/voiceover   ElevenLabs output
transcripts/<name>/        ElevenLabs transcripts (committed — small and useful)
compositions/<name>/       HyperFrames projects (npx hyperframes init compositions/<name> --skip-transcribe)
edits/                     paper edits / EDL notes per video (committed)
renders/                   final exports (git-ignored)
scripts/                   pipeline helpers (see below)
.claude/skills/            HyperFrames skills (.agents/skills symlinks here)
```

Everything under `media/` and `renders/` is git-ignored except `.gitkeep` and `media/broll/SOURCES.md`.

## Footage source

Google Drive folder **"Claude video editor"** (`1KAb19At4u-HwGcLobwuFW8F1EngAlTeU`):

- `CLD_1279-<start>-<end>-seg01..10.MOV`: one 16:45 camera recording split into 10 back-to-back
  segments (~19 GB, ~150 Mbps). The timecodes in the file names are each segment's offset in the
  full recording; pass the start time as `--offset` when transcribing a single segment.
- Subfolder **"Claude video editing clips"** (`1gDB1IqUr3PBISlMIc_PFSBR20goUK49j`): 7 screen
  recordings from 2026-10-09 (~1.1 GB), plus a stray `.DS_Store`.

Rebuild the full camera take losslessly with
`npm run media -- join media/joined/CLD_1279.mov media/raw/CLD_1279-*-seg*.MOV` (the glob sorts by
start time). Transcribe the joined file, or each segment with `--offset`.

## Editing workflow

1. **Ingest:** copy footage into `media/raw/` and `media/screen-recordings/`, then
   `npm run media -- probe <files>`.
2. **Proxy:** `npm run media -- proxy <file>` for anything above 1080p or over ~50 Mbps. Edit on
   proxies and do the final render from the originals.
3. **Transcribe (ElevenLabs):** `npm run transcribe -- <file> --language en --keyterms "…"`.
4. **Paper edit:** read `transcript.txt` and write `edits/<video>.md`, listing the keep ranges by
   word timestamps, cuts (fluff, retakes, long pauses), where each screen recording or B-roll
   clip goes, and graphics beats.
5. **Cut:** use FFmpeg (`-ss/-to` + concat, or `trim`/`atrim` in a filter graph). Re-encode at cut
   points so cuts land on exact frames; don't stream-copy across non-keyframes.
6. **Graphics:** use HyperFrames. Read `/hyperframes` first. For a talking head use
   `/talking-head-recut` (overlays) or `/embedded-captions` (captions). Short standalone pieces use
   `/motion-graphics`; longer ones use `/general-video`. Render transparent overlays or full
   scenes, then composite with FFmpeg, or let HyperFrames own the whole timeline.
7. **Audio:** ElevenLabs music/SFX. Duck music under speech (about −18 to −22 dB under the voice).
   Mix with HyperFrames `/hyperframes-audio` or FFmpeg `sidechaincompress`/`amix`. Loudness
   target: **−14 LUFS integrated, −1 dBTP** (`loudnorm=I=-14:TP=-1:LRA=11`).
8. **Export:** H.264 High, yuv420p, 1920×1080 (or the requested aspect), source frame rate,
   CRF 18, AAC 320k, `-movflags +faststart`, written to `renders/`.

## Kalyan's editing preferences

Learned from his review notes on CLD_1279 (v1 → v3). Apply them to every new video.

**Pacing and voice**
- Start on the first real line. No separate hook unless he asks for one.
- Cut every hesitation, stumble, false start and retake, including small ones. Keep silences
  under about 0.35 s, but keep pauses that carry emotion.
- If he misspeaks a word or number, cut it. If the sentence still reads, let the graphic carry
  the fact (the "passed all … checks" fix with a 25/25 ring).
- Lines like "And this was the result" become an announcement card plus the reveal.
  Don't leave a flat line.

**Face and eye contact**
- Never cover his face. Never put graphics over the plant or tree behind him.
- Don't split the frame or slide him to one side. When information matters more than his face,
  use a full-screen graphic with him in the rounded PiP card, bottom-left.
- Run `scripts/gaze.py` (MediaPipe) on the kept ranges. Cover look-aways while he's full-frame
  with a relevant full-screen visual, not a plain text card on black.
- No shots of him pointing to the side. Put the thing he points at on screen as he says the
  line, with no PiP in that moment.

**Showing clips and demos**
- When he introduces a clip ("this is the raw footage…", "compare that with…"), show the clip
  while he says it, play it with its own sound, then continue the explanation.
- Don't show screen recordings of prompts being copy-pasted. Show prompts as a large,
  readable, typed prompt window with key phrases highlighted.
- Claude's output is an animated terminal: lines tick off as he says them, and nothing sits
  on top of the text.
- Keep AGENTS.md / rule-book visuals in the step where those rules are actually written,
  not in the setup step.

**Motion graphics**
- Every sentence gets a visual that explains it with icons, animated visuals or real footage
  frames. Avoid text lists in boxes, and don't reuse the same layout beat after beat.
- Make it big and fill the frame. No dead or blank stretches: every scene has content from
  its first frame.
- Give each step of a step-by-step section a full-screen numbered transition. In the overview,
  the named step grows with its own icon.
- Keep graphics and icons off text. Rows of icons go beside or under a card, never over it.
- Style: dark glass, Claude coral `#E8775F` accent, Inter, quick back-out/power3 eases.
- Captions: short phrases (≤ 5 words), bottom-centre. Hide them while kinetic text already
  shows the same words.

**Audio**
- Music stays subtle (bed about 0.11, dipped under clips that play with their own sound). SFX
  are sparse: ≥ 0.9 s apart, mostly whooshes and pops.
- Studio Sound (Descript) on his voice. Mix to −14 LUFS integrated, −1 dBTP.
- Comparison or sample sections use the sample video's own audio (e.g. the teleprompter
  raw vs Claude-edited clip), not generic before/after audio.

**Ending**
- Rich conclusion with visuals (split screens, flow cards, a big closing line).
- Then his outro voice recording (ElevenLabs voice clone, voice only) over full-screen graphics:
  - a recap
  - Like → Subscribe → bell for "AI with Kalyan"
  - a description panel and a pinned-comment card
  - a "Thanks for watching / See you in the next video" end card

**Review loop**
- Send a compressed review copy (< 30 MB) after each version. He marks up screenshots;
  treat each mark ("remove", "replace", "improve", "diff approach") as a required change.

## B-roll rules

- Research on the open web. Prefer primary sources: official product pages, docs, announcements,
  the GitHub repo, the paper.
- Capture with `npm run broll -- <url> --name <slug>`. It saves a still, an eased-scroll MP4, and a
  row in `media/broll/SOURCES.md`. Every B-roll asset must have a SOURCES.md row.
- Don't download or reuse other creators' videos, stock footage or copyrighted images without a
  license the user has confirmed. Page captures of public sources, the user's own recordings and
  generated graphics are fine.
- Prefer Kalyan's own screen recordings over web captures whenever they show the same thing.

## HyperFrames notes

- The CLI is a local dev dependency, so use `npx hyperframes …`. Run `npx hyperframes doctor`
  when rendering fails. whisper/Kokoro/MusicGen show as missing there on purpose: ElevenLabs
  replaces them.
- Create projects with `npx hyperframes init compositions/<name> --skip-transcribe --non-interactive`.
- Templates load GSAP from `cdn.jsdelivr.net`. If the CDN isn't reachable (sandboxed cloud
  sessions), copy `node_modules/gsap/dist/gsap.min.js` into the composition's `vendor/` and point
  the `<script src>` at it.
- Refresh skills with `npm run skills:update`. It updates the global copy, then syncs the
  project's `.claude/skills/`.

## Scripts

| Command | What it does |
|---|---|
| `npm run doctor [-- --live]` | Verifies Node, FFmpeg, HyperFrames, Chrome, SDKs, skills, `.env` and the API key |
| `npm run transcribe -- <file> [opts]` | ElevenLabs Scribe → `transcripts/<name>/` |
| `npm run music -- "<prompt>" [--seconds N] [--vocals]` | ElevenLabs Music → `media/music/` |
| `npm run sfx -- "<text>" [--duration s] [--loop]` | ElevenLabs SFX → `media/sfx/` |
| `npm run broll -- <url> [--name slug] [--seconds 6] [--still-only]` | Page still + scroll clip + SOURCES.md row |
| `npm run media -- probe/join/proxy/audio/frames …` | FFmpeg helpers |
| `npx hyperframes …` | HyperFrames CLI (init, lint, preview, render, transcribe-import, …) |

## Conventions

- Never modify or delete files in `media/raw/` or `media/screen-recordings/`. Write derived files
  elsewhere.
- Put large binaries in Drive, not git. Commit transcripts, edit notes, compositions and scripts.
- Keep secrets in `.env` only.
