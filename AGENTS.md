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
