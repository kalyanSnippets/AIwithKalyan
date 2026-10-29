# REA: missing assets (nothing below has been faked)

Video: "I Used Claude Code to Reverse Engineer an App, Then Rebuilt It".
Times are in the **corrected A-roll v3** (10:37). The matching time in the original 13:39 rough cut is given as `v1`.
Save every file under `REA/media/screen-recordings/` (or the folder named) and tell me the file names.

## General rules for every recording
- 1920x1080 or larger, 30 fps, MP4 (H.264) or MOV. No webcam, no mouse trail effects, cursor visible.
- Dark theme where the app allows it. Zoom the browser or terminal to 125 to 150% so text reads on a phone.
- No private data on screen: close email and chat, hide API keys, emails and tokens.
- Record real audio only if it matters (marked "with sound"). Otherwise record silent or mute it.
- Each clip: 3 s of calm before and after the action so I can trim.

## Must record (proof the viewer has to see)

| ID | Needed clip | Length | Shows | v3 time (v1) | Why |
|---|---|---|---|---|---|
| M-01 | `windows-install-claude.mp4` | 20 to 40 s | PowerShell: `irm https://claude.ai/install.ps1 \| iex`, then `claude --version` printing a version | 3:43 to 4:01 (v1 4:41) | The viewer sees the real command succeed |
| M-02 | `windows-node-check.mp4` | 10 to 20 s | `node -v` and `npm -v` printing versions (or the install fix you did) | 4:01 to 4:22 | Node requirement |
| M-03 | `rea-setup.mp4` | 30 to 60 s | `npx rea-agents setup`: "Ok to proceed", choose only Claude Code, the change list, **Hopper = no** | 4:22 to 4:40 | Hopper warning needs the real prompt |
| M-04 | `claude-mcp-list.mp4` | 10 to 15 s | restart Claude Code, `claude mcp list` showing rea | 4:40 to 5:05 | Confirms REA is connected |
| M-05 | `chrome-extension.mp4` | 8 to 12 s | Claude in Chrome page / install button (no sign-in details) | 5:05 | Setup step |
| M-06 | `project-folder.mp4` | 8 to 12 s | `mkdir kanban-rea-demo`, `cd`, `claude` | 5:05 to 5:26 | Setup step |
| M-07 | `prompt1-run.mp4` | 30 to 90 s | Prompt 1 pasted (not read aloud), REA tool calls running, the full report with **observed / inferred / not sure** labels visible and scrolled slowly | 5:26 to 6:25 | The core proof of the video |
| M-08 | `prompt2-build.mp4` | 60 to 180 s (I speed it up) | Prompt 2 running, files appearing, dev server starting, the browser test with a real mouse drag | 6:25 to 7:00 | Build proof |
| M-09 | `rea-board-demo.mp4` | 60 to 120 s | REA Board: add / rename / delete column, add / edit / delete card, drag card across and within columns, colour labels, past due date with red Overdue badge, checklist progress bar, side panel, **page refresh keeps data** | 7:00 to 7:30 (v1 9:01 to 9:46) | The result, shown for real |
| M-10 | `side-by-side.png` | still, 1920x1080 | REA Board next to the Wekan demo board | 7:30 to 7:49 | "How close it looks" |

## Should capture (page captures I can do once the sandbox allows these hosts, or you can record)

| ID | Needed clip | Length | Shows | v3 time | Notes |
|---|---|---|---|---|---|
| C-01 | `rea-tools-showcase.mp4` | 15 to 25 s | slow scroll of rea.tools/showcase (Notion, DX-Ball, web-session cards) | 0:47 to 1:01 | host `rea.tools` is blocked in the sandbox |
| C-02 | `wekan-demo-board.mp4` | 15 to 25 s | scroll the public demo board and open one card | 2:06 to 2:45 | `boards.wekan.team`. Do not use the Wekan logo as a graphic |
| C-03 | `github-rea-repo-fresh.mp4` | 10 s | github.com/morluto/rea with the star count on screen on the day you publish | 0:22 | I already have a 19 s recording at 399k. Re-record only if you want the live number (it was about 402k on 28 Oct) |

## Audio and end screen

| ID | Needed | Notes |
|---|---|---|
| A-01 | **Music bed** | I generated a minimal electronic placeholder myself (original, no licence). If you want a different track, send a file with its licence. YouTube Audio Library tracks are fine once you confirm the licence in YouTube Studio |
| A-02 | **End-screen target video URL** | For "see how I edit my videos using Claude" (10:08 to 10:31). Also confirm whether your outro voice recording should be used |
| A-03 | **Final star count** | Only if you re-record C-03 |

## Already in hand (no action)
- All A-roll (6 camera clips), the 19 s GitHub 399k screen recording (`Screen_Recording_2026-10-28_194316.mp4`), and the photo of the set.

## Not used on purpose
- No game screenshots or audio (DX-Ball), no Notion UI, no Wekan, GitHub, Claude or Chrome logos, no stock footage, no other creators' graphics.
- Diagrams in the edit are drawn from facts in REA's README (Notion trace, DX-Ball 3,205 cases, web-session environment) and carry a small source line.

## Wekan live demo board (not capturable)
`boards.wekan.team` serves a Cloudflare bot check that the cloud sandbox cannot pass (and we do not bypass it). The explanation section therefore uses an animated Kanban explainer labelled "recreated for this video". To swap in the real thing, record `https://boards.wekan.team/b/D2SzJKZDS4Z48yeQH/wekan-r-open-source-kanban-board-with-mit-license` on your PC (10 s of scrolling and hovering a card) and drop it in `REA/media/screen-recordings/wekan-demo.mp4`.
