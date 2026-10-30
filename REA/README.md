# REA

Separate video project, kept apart from CLD_1279 so its footage, transcripts, edits and
compositions don't mix. Same tool stack and editing preferences as the root `AGENTS.md`.

```
REA/media/raw/              camera originals (git-ignored)
REA/media/screen-recordings/ screen captures (git-ignored)
REA/media/broll|music|sfx|voiceover/
REA/transcripts/            ElevenLabs Scribe output (committed)
REA/compositions/           HyperFrames projects
REA/edits/                  paper edit / EDL notes (committed)
REA/renders/                final exports (git-ignored)
```

Run the root scripts with paths inside this folder, e.g.
`npm run transcribe -- REA/media/raw/<file>` (move outputs into `REA/transcripts/<name>/`).
Footage source: Drive "REA" (`1MLe7yMHPacIY1HnYQHwxdjoJOO2JMAkB`, 28 Oct shoot) and Drive "Video -2" (`1OUojrUDw0WQk_CU-tVKRjAexffHeyLTQ`, 30 Oct reshoot, see `edits/REA-v2.plan.md`).
