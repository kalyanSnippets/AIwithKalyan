# REA v2: real proofs shot list

Decisions (30 Oct): real first, motion as accents. Proof pages appear in a browser frame (URL bar + "Source · captured <date>"),
with a slow push-in, scroll to the evidence, highlight box, zoom and a count-up sticker beside the frame (never on the text).
He moves into the PiP card while a proof is on screen. Captions hide while a proof page is up.
Sample: `REA/renders/samples/REA-v2-proof-sample.mp4` (`compositions/REA-v2-proof/`).

Every capture: `npm run broll -- <url> --name <slug>` → `media/broll/` + a row in `media/broll/SOURCES.md`.
Prefer Kalyan's own recordings when they show the same thing.

## Network access needed

The cloud environment blocks these hosts today. Add them under Network access → Allowed domains
(keep "Allow package managers" ticked), or choose a broader level:

```
github.com, raw.githubusercontent.com, avatars.githubusercontent.com,
x.com, platform.twitter.com, cdn.syndication.twimg.com, pbs.twimg.com, abs.twimg.com,
www.youtube.com, i.ytimg.com,
boards.wekan.team, www.npmjs.com,
dev.to, medium.com, www.scientificamerican.com, gittested.com, www.mindstudio.ai, hyper.ai, moelueker.com
```

Already reachable: rea.tools.

## Claims → proof

| Script line (section) | Proof to show | Source | Status |
|---|---|---|---|
| "over 400,000 stars" (S1, S2) | Kalyan's 28 Oct GitHub recording (399K), plus a fresh capture on the day for the live count | `Screen_Recording_2026-10-28_194316.mp4`; https://github.com/morluto/rea | Recording in hand; live capture needs github.com |
| "forks, over 100,000" (S2) | Same GitHub page, zoom on Forks | https://github.com/morluto/rea | Needs github.com |
| "free, MIT license" (S2) | LICENSE file on GitHub, or rea.tools footer "Source MIT license" | https://github.com/morluto/rea/blob/main/LICENSE | rea.tools footer available now |
| "almost nothing to over 300K in about two weeks" (S2) | Headline wall: real article captures in date order, e.g. "140,000 stars in five days" → "248K stars" → "nearly 300k" → 352K → 399K (his recording). Trending #1 for 5 of 7 days, 6–12 Oct | https://medium.com/@info.booststash/rea-the-reverse-engineering-tool-for-ai-agents-hits-140-000-github-stars-in-five-days-d30fa52d8650 · https://dev.to/max_quimby/rea-hit-248k-stars-the-real-story-is-scarier-2m12 · https://hyper.ai/en/stories/5466749b77edd4705dba0e65415bad4d · https://aitoolly.com/ai-news/article/2026-10-13-rea-by-morluto-trends-on-github-leveraging-ai-agents-to-reverse-engineer-anything-from-app-behaviors | Exact "two weeks" not stated anywhere; the headline sequence shows the growth. Needs those hosts |
| "YouTube videos about it got millions of views" (S2) | YouTube search/result captures with view counts: Low Level "I Tested The Viral Reverse Engineering Repo" (~2.35M), Nick Saraev (~1.53M) | Figures from https://moelueker.com/blog/reverse-engineer-anything (19 Oct); verify on YouTube | Needs youtube.com |
| Steam game → C# in Unity, 30 min, ~460K views (S2) | The X post itself (embed render), zoom on text and view count | https://x.com/AIWarper/status/2109060856466264566 (467k views per awesome list) | Needs X embed hosts. Note: the post names no game and has no clip |
| Blender, 300K+ functions in ~70 min (S2) | blender-agent-sdk README line: REA + Ghidra pass over the stripped Blender 5.2.2 binary, 301,393 procedures in about 70 minutes | https://github.com/yazzang-homelab/blender-agent-sdk | Needs github.com |
| DX-Ball, 3,205 test cases (S2) | rea.tools DX-Ball case study, "3,205 behavior cases" | https://rea.tools/showcase/dx-ball/ | **Captured** (`media/broll/rea-showcase-dxball.*`), sample built |
| Notion clipboard (S2) | rea.tools Notion case study: page API → preload → IPC → clipboard | https://rea.tools/showcase/notion/ | **Captured** (`media/broll/rea-showcase-notion.*`) |
| REA connects agents to real RE tools; runs locally (S2) | rea.tools home "How it works" + setup section | https://rea.tools/ | **Captured** (`media/broll/rea-home.*`) |
| Wekan: open source, MIT, free demo (S3) | Kalyan's recording 114559 (board) + Wekan GitHub licence | `Screen_Recording_2026-10-30_114559.mp4`; https://github.com/wekan/wekan | Recording in hand |
| Setup commands, MCP connected, 18m 17s, 50 checks (S5–S8) | Kalyan's recordings 114128 / 180259 | own recordings | In hand (blur usernames) |
| Live REA Board test (S9) | Kalyan's recording 114559 | own recording | In hand |
| "What does REA add on top of an agent with normal tools?" (S10) | Headline + key line captures: GitTested review (same accuracy, ~2.5× tokens), rea-lab (482 runs, no significant gain), MindStudio explainer | https://gittested.com/reviews/morluto-rea/ · https://github.com/pablodiazjorge/rea-lab · https://www.mindstudio.ai/blog/reverse-engineer-anything-mcp | Needs those hosts |
| Viral / mainstream (optional, S2 or S10) | Scientific American interview headline | https://www.scientificamerican.com/article/an-exclusive-conversation-with-the-developer-of-rea-the-viral-ai-reverse-engineering-tool/ | Needs host |
| Star count flash (S10) | Same GitHub capture as S1 | — | — |

## Wording notes for Kalyan (lines stay as spoken)

- Steam claim comes from the poster's own account, with no game named and no clip. Show the post and let it speak; no "verified" badges.
- "300K in two weeks" has no single source. The headline wall shows the growth without stating the exact figure.
- DX-Ball: rea.tools shows 3,205 behavior cases and 63 matching bytes for one sound-pan function, not the whole game.

## Capture status (30 Oct, network set to Full)

Captured to `media/broll/` (still + scroll clip, each logged in SOURCES.md):

| File | Proves |
|---|---|
| `moelueker-youtube` | "went from 41 to 300K+ GitHub stars in 15 days" (Moe Lueker, 19 Oct): the "two weeks" line. Also lists the YouTube view counts |
| `aitoolly-trending` | Live repo card: 412k stars, 103k forks, trending headline (13 Oct). Covers "forks over 100,000" without github.com |
| `devto-248k` | "REA Hit 248K Stars" (dev.to) |
| `hyperai-300k` | "Goes Viral, Nearly 300k GitHub Stars" (HyperAI) |
| `devto-trending` | dev.to explainer: #1 trending 5 of 7 days |
| `yt-search-rea` | YouTube results for "I Tested The Viral Reverse Engineering Repo" with thumbnails and counts |
| `x-aiwarper-steam` | The Steam → Unity post (X's official embed view) |
| `gittested-review` | Critic: "an agent with ordinary shell tools already explained the code almost perfectly, so REA added cost and no accuracy" |
| `mindstudio-explainer` | "What the Viral REA MCP Actually Does" |
| `rea-home`, `rea-showcase`, `rea-showcase-dxball`, `rea-showcase-notion` | REA site, DX-Ball 3,205 cases, Notion clipboard trace |

Still blocked:

- github.com web pages (this session only allows git through GitHub's proxy). Needed: live repo page (stars/forks), LICENSE, `yazzang-homelab/blender-agent-sdk` README (Blender 301,393 procedures / ~70 min), `pablodiazjorge/rea-lab` results. Kalyan to screen-record, or use the 28 Oct recording + aitoolly card.
- medium.com, boards.wekan.team, scientificamerican.com: bot protection (403). Not worked around. Wekan is covered by Kalyan's recording; the Medium "140K in five days" headline is replaced by the 15-day line.

`npm run broll` gained `--dismiss "<label>|<label>"` to close cookie banners and promos before capturing (dev.to: "Minimize billboard", MindStudio: "Accept all").
