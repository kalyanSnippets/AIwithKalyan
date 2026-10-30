# REA v2: graphics and motion plan (draft for approval)

Rough cut: `REA/renders/rough_v2/rough_cut.mp4` (9:29). Script: [`REA-v2.script.md`](REA-v2.script.md).
Sample templates: `REA/renders/samples/hf-templates.mp4` (HyperFrames, templates 01–11) and
`REA/renders/samples/remotion-templates.mp4` (Remotion, R1–R3). Sources: `compositions/REA-v2-samples/`,
`REA/remotion/src/Samples.tsx`.

## Decisions (30 Oct)

- Coral `#E8775F`, dark glass. No lime.
- HyperFrames and Remotion both, with rich, energetic motion in every frame: no static cards.
- No Higgsfield. Real footage, page captures and motion graphics only.
- S2 examples: animated icon flow plus a quick capture of the original public post (SOURCES.md row each).
- Approved direction to confirm: `REA/renders/samples/REA-v2-hook-sample.mp4` (hook 0:00–0:19).

## Who does what

| Tool | Job in this video |
|---|---|
| **HyperFrames** | Main timeline and anything over the talking head: viral captions, stickers, punch-ins, full-screen takeovers that shrink him into the PiP card, REA reveal, step transitions, command/prompt windows, terminal, end screen. Sample: `compositions/REA-v2-hook/`. |
| **Remotion** | Spring-physics and React-heavy scenes, rendered to MP4 and placed on the HyperFrames timeline: icon flows, counters, 3D flip reveal, charts, kinetic text. Sample: `REA/remotion/src/Hook2.tsx`. |
| **ElevenLabs** | Music bed and SFX (whoosh, pop, impact, tick, typing). Needs the API key fixed, or the connector. |
| **FFmpeg** | HDR → SDR conversion, blurs on private info, final composite, loudness, export. |
| Real footage | Screen recordings 114128 (terminal), 114559 (Wekan + REA Board), 28 Oct GitHub clip. |

## Motion style (applies to every beat)

- **Viral captions:** ≤ 5 words, uppercase Inter 800, white with a black stroke and drop shadow, key word in coral. Each word pops in on its ElevenLabs timestamp with a back-out bounce. Hidden while a sticker or kinetic text shows the same words.
- **Stickers:** tilted glass cards on the right-hand wall (x 1180–1860, y 100–620), never over his face or the plants. Icons draw on, fill, spin or swing. Counters roll up.
- **Camera:** punch-in (×1.15) on emphasis words, whip back out with a slight offset, whip-zoom with blur into reveals.
- **Takeovers:** for big moments the footage shrinks into the rounded PiP card (bottom-left, coral ring) while full-screen motion runs: word slams with impact bar and shake, glitch + RGB split, shockwave rings, particle burst, flash.
- **Icon flows:** nodes pop in on their spoken word, dotted connector draws with a travelling dot, active node glows coral.
- Every scene moves from its first frame; nothing static for more than about 1.5 s.

## Footage note: HDR

The Pixel footage is HDR (HLG, BT.2020). HyperFrames then switches to its HDR layering mode, which hides overlays over the video and washes out colours. All camera footage must be converted to SDR BT.709 before graphics:
`zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0:peak=4,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`.
The rough cut and proxies get rebuilt from SDR versions.

## Beat sheet

| Section (rough-cut time) | Beats → template |
|---|---|
| **S1 Hook** 0:00–0:30 | "400,000 stars" → **02** counter with PiP · "REA, Reverse Engineer Anything" → REA title sting (v1, recoloured) · "rebuild it" → icon flow open → measure → rebuild (**03** variant) · "it built THIS" → **01** "Which one is real?" split, held 1.2 s · "both side by side" → R1 flip teaser (2 s) · "I'm Kalyan…" → name lower-third |
| **S2 What is REA** 0:30–1:48 | GitHub page (28 Oct clip) with zoom on Stars and Forks, star burst · "free, MIT" → chip · "300K in two weeks" → line-graph spike · "connects your agent… to real RE tools" → node diagram Claude/Codex ↔ REA ↔ tools (animated, real logos only) · "runs locally" → laptop icon with lock · four examples, each its own **03** icon flow: Steam → C# (460K views), Blender (300K functions / 70 min counter), DX-Ball (3,205 test cases ring), Notion clipboard trace · "real or hype?" → scale tipping |
| **S3 Mission** 1:48–2:28 | Wekan scroll (114559) with "Mission: clone this board" title · "lists, cards, labels…" → callout pins on the real board · "NOT stealing" → three crossed icons (name, logo, images) · "REA Board" → name card |
| **S4 Subscribe** 2:28–2:39 | **11** small version, bottom-right, face stays clear |
| **S5 Setup** 2:39–3:31 | **04** step card per step (5 steps) · each command as **05** big window, typed as he says it · "Opus 5.5, auto mode" → model chip · sign-in and "Failed to connect" frames hidden |
| **S6 Prompt** 3:31–4:23 | "Pasted text +46 lines" → **06** prompt window, sections scroll past, MEASURE FIRST and TESTING highlighted · four reasons → numbered icon tiles (ruler, lock stack, layout map, eye check) |
| **S7 Claude works** 4:23–5:03 | 114128 sped up 4× inside a frame, plus **07** terminal: each file ticks as he names it, 18m 17s timer · usernames blurred |
| **S8 Comment hook** 5:03–5:20 | Freeze on "All 50 checks passed" → **08** guess poll |
| **S9 Reveal** 5:20–6:52 | R1 3D flip → **09** split with circle callouts on top bar, orange strip, (4/3), RB-IDs, "9 days overdue", covers · live test from 114559 full screen, with "Works!" ticks on each action |
| **S10 Opinion** 6:52–8:57 | **10** verdict tiles · R2 kinetic text on "it measures, it does not guess" · "but" side: lazy prompt → lazy result, 18 min clock, one screen only, hype vs proof scale · "only clone what you're allowed" → licence check card · star count flash (1 s) |
| **S11 Outro** 8:57–9:28 | Recap · **11** like → subscribe → bell · "which app next?" → app icon carousel (Spotify, notes, ?) · previous-video card (https://youtu.be/Lo-GJIU1gl8) · 20 s end screen |

Gaze check (`scripts/gaze.py`) runs after approval. Any look-away while he's full-frame gets a full-screen visual from this sheet.

## GSAP gotcha

The renderer seeks backwards, so a `fromTo` restores its start values before its start time. For tweens that start late, use `tl.set(...)` then `tl.to(...)`, or keep the element hidden until the tween starts.
