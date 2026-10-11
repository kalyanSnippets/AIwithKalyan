# AI with Kalyan: video editing workspace

An AI-assisted editing pipeline built from:

- **ElevenLabs** for transcription (always the default), music, SFX and voice
- **HyperFrames** ([heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)) for motion graphics, captions and overlays
- **FFmpeg** for cutting, proxies, mixing and the final render
- **Browser capture** for source-based B-roll, logged in `media/broll/SOURCES.md`
- Kalyan's own screen recordings

```bash
npm run setup                 # install everything (Node 22+, FFmpeg, Python 3 required)
# put your key in .env → ELEVENLABS_API_KEY=...
npm run doctor -- --live      # verify
npm run transcribe -- media/raw/clip.mov --language en
```

Agent instructions and the full workflow are in [AGENTS.md](AGENTS.md).
