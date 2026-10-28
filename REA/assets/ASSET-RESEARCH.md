# REA video: asset research and editor handoff

Approved script used: `YouTube_Script_I_Rebuilt_a_Kanban_App_with_REA_in_3_Prompts.docx` (8 sections, S1 to S8).
No separate "Script Lab handoff" file exists in Drive or this repo, so the attached docx is treated as the approved script.
The script is **not modified**. Corrections below are suggestions for Kalyan only.

Research date: 2026-10-28. Sources read through the web tools. Several hosts are blocked in this sandbox
(rea.tools, boards.wekan.team, pixabay.com, remotion.dev, brand.github.com, huggingface.co). Anything that depended on them is marked UNVERIFIED.
**Nothing was downloaded** except Kalyan's own Drive footage: the sandbox can only reach npm, PyPI, Drive and the web-fetch tool.

## 1. Fact-check of script claims

| # | Script claim | Result | Source |
|---|---|---|---|
| 1 | "almost 400,000 stars" | OK for the footage (399k on the recording). Live count on 28 Oct was about 402.4k, so say "over 400,000" or the real number on the day (script already says CHECK) | github.com/morluto/rea, footage frame |
| 2 | Free and open source | OK. REA-authored code is MIT; third-party material keeps its own licences; Hopper/IDA/JEB need their own licences | README |
| 3 | Works on websites, apps, old binaries | OK. README: native binaries, JavaScript and Electron apps, .NET assemblies, websites | README |
| 4 | "Shows evidence for every finding" | OK ("returns findings with their evidence"). The observed / inferred / not sure labels are **Kalyan's prompt**, not an REA feature. The script words it that way | README |
| 5 | Notion copy and paste traced to main process | OK (renderer clipboard API, preload, IPC, main process) | README showcase |
| 6 | DX-Ball sound panning "old DOS game" | Showcase confirmed (pan helper, 3,205 original-x86 cases). **"DOS" is unverified and probably wrong**: DX-Ball was a Windows/DirectX title. Suggest "an old PC game" | README. DOS point UNVERIFIED |
| 7 | Record a web session into a practice environment for AI agents | OK ("record a web app session, turn its API into tools, export an environment an AI agent can use") | README |
| 8 | Node "22 or 24 or newer" | Slightly loose. README: 22.x >= 22.23.4, 24.x >= 24.22.1, or 26.12.1+. Suggest "check the README for the exact minimum" | README |
| 9 | `npx rea-agents setup`, choose Claude Code, say no to Hopper | OK. Hopper is optional and needs approval; Claude Code is a supported agent | README |
| 10 | `npx.cmd` workaround on Windows | UNVERIFIED (not in sources). Test on the Windows machine as the script already says | n/a |
| 11 | `claude mcp list` shows REA | UNVERIFIED in sources fetched. Kalyan's own recording will prove it | n/a |
| 12 | Mac install `curl -fsSL https://claude.ai/install.sh \| bash`; Windows `irm https://claude.ai/install.ps1 \| iex`; `claude --version` | OK, exact match | code.claude.com/docs/en/setup |
| 13 | macOS 13+, Windows 10 1809+ | OK | same |
| 14 | "A Claude account" | Needs correcting: Claude Code needs Pro, Max, Team, Enterprise or Console. The free plan does not include it. Script says "check Anthropic's website for the plan", which is safe | same |
| 15 | Git for Windows "if it complains" | OK but now optional: without it Claude Code uses PowerShell | same |
| 16 | Claude in Chrome extension | Beta, paid plans only (Pro, Max, Team, Enterprise) | support.claude.com/en/articles/12012173 |
| 17 | Wekan: open source, MIT, public demo anyone can open | OK, with one nuance: the demo is a **public read-only board**. Built with Meteor, MongoDB/FerretDB, "real-time user interface" | github.com/wekan/wekan |
| 18 | Wekan "popular" | 21.1k stars | same |
| 19 | rea.tools/showcase page | UNVERIFIED (host blocked). The README showcase section matches what the script describes | n/a |

## 2. Copyright and licence decisions

| Asset | Decision | Reason |
|---|---|---|
| Own footage, screen recordings, generated graphics, prompt windows | USE | Own work |
| Page captures of github.com/morluto/rea, rea.tools, Wekan demo | USE (capture, not download) | Public pages of MIT projects; AGENTS.md allows page captures |
| GitHub / Claude / Chrome / Wekan / YouTube logos | REFERENCE_ONLY | Brand terms not verified (GitHub brand page blocked). Use plain text names. Existing GitHub UI inside Kalyan's own recording is fine |
| DX-Ball screenshots or audio | DO NOT USE | Copyrighted game; script only needs a graphic |
| Free stock music (Pixabay, YouTube Audio Library, Freesound) | REFERENCE_ONLY | Licence pages unreachable, so commercial/monetisation terms unverified |
| ElevenLabs Music / SFX | NOT USED | Paid API; Kalyan said no paid APIs for this video |
| SFX | USE, synthesised locally with FFmpeg | Own work, no licence |
| Remotion | NEEDS APPROVAL | Licence page unreachable. Remotion is free only for individuals and small teams as far as known; confirm at remotion.dev/docs/license before use. HyperFrames (already in repo, MIT-style local tool) is the safe fallback |

## 3. Manual capture tasks for Kalyan (nothing here can be captured from the sandbox)

1. rea.tools/showcase: slow scroll, 1080p or higher, about 20 s. (A03)
2. Wekan demo board: scroll lists and open one card, 1080p, about 20 s. (A08)
3. Claude in Chrome store page, about 8 s. (A15)
4. Mac Terminal steps 1 to 7, 1080p, no secrets visible. (A12)
5. Windows PowerShell steps 1 to 7, tested first. (A13)
6. Prompt 1 run on Wekan with the full report visible. (A17)
7. Prompt 2 build and real-browser test run. (A20)
8. REA Board demo: columns, cards, mouse drag, labels, overdue badge, checklist, side panel, refresh. (A21)
9. Side-by-side screenshot, REA Board vs Wekan. (A22)
10. Outro voice recording, and the URL of the video for the end screen. (A28)
11. Music decision (M01): pick a track from YouTube Audio Library (confirm licence in Studio), or approve a synthesised pad.

Save recordings to `REA/media/screen-recordings/` and add each to Drive. Drive upload from here is possible on request.

## 4. Editor handoff

`asset-manifest.csv` lists every asset (28 visuals A01 to A28, 2 audio M01/M02) with section, status, source URL, licence, placement and animation.
Status key: IN_HAND, GENERATE_IN_EDIT, CAPTURE_MANUALLY, NEEDS_DECISION.
Only A01 and A02 exist today; section mapping of footage is inferred until transcripts exist.
