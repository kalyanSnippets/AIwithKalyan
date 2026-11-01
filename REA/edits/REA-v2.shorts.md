# REA v2 — 2 YouTube Shorts (plan + cut script)

Source: the final long video timeline (`REA/edits/REA-v2.cut-words.json`, ElevenLabs word timings).
Times below are in the long video (m:ss.xx). Every cut lands on a word boundary from the transcript.
Format: 1080×1920, 30 fps, under 60 s, −14 LUFS / −1 dBTP.

## Shared production rules

- **Talking parts:** full-height 9:16 crop of Kalyan from the 4K originals (re-cut through the same tone-map + grade
  as the long video), so the face is sharper than the 16:9 master. Face centred, never covered.
- **Screen / proof moments:** the visual fills the frame, Kalyan in the rounded coral PiP card, bottom-left
  (same style as the long video).
- **Captions:** big bold word-by-word, 2–4 words at a time, current word coral, lower-middle (above YouTube's
  bottom UI, left of the right-hand buttons). Hidden while big kinetic text says the same words.
- **Audio:** voice from the master (no music in it), new subtle bed from the REA music at ~0.11, sparse whooshes
  (≥ 0.9 s apart). Cuts re-encoded on exact frames.
- **Loop:** each Short ends on a line that leads back into the opening.
- **Build:** one HyperFrames vertical composition per Short (`compositions/REA-short-1`, `REA-short-2`), rendered and
  mixed with FFmpeg; review copies < 30 MB.

---

## Short 1 — "Can you spot the real app?"  (~48 s)

**Title:** Can You Spot the Real App? (AI Cloned It From 1 Link) #shorts
**Hook visual:** the GitHub star count, then both boards side by side with "?" badges.

| # | Long-video time | Line | Visual (9:16) |
|---|---|---|---|
| 1 | 0:00.00–0:02.90 | "This one tool has 400,000 stars on GitHub." | GitHub page with the star count zooming in; Kalyan in PiP |
| 2 | 0:05.16–0:08.40 | "It's called Reverse Engineer Anything, REA for short." | Kalyan full height; "REA" kinetic title |
| 3 | 0:08.62–0:11.70 | "It let AI open any app, measure it, and rebuild it." | Open → Measure → Rebuild icons, one per word |
| 4 | 0:12.02–0:15.80 | "And today, I gave it one link, and twenty minutes later, it built this." | Link chip → 20:00 timer → REA Board slides in |
| 5 | 0:17.07–0:18.80 | "Can you tell which one is the real app?" | Both boards stacked (top/bottom), "?" badges, 1 s hold to let viewers guess |
| 6 | 5:06.07–5:10.29 | "On the left, the original board. On the right, our Rea board." | Labels drop in: ORIGINAL / REA BOARD (wording adapted on screen to top/bottom) |
| 7 | 5:11.81–5:17.50 | "Look at the top bar, blue with a blue menu and the four avatars. Below it, the orange strip." | Zoom on matching top bars, highlight ring |
| 8 | 5:17.81–5:27.40 | "And see this red four slash three … That's a work in progress limit. It turns red when there are too many cards. Claude even copied that." | Zoom on the red 4/3 on both boards |
| 9 | 6:10.93–6:16.49 | "Now the big test, drag and drop. I drag this card from Review to Done, and then it works." | Kalyan's screen recording of the drag, full frame, own sound |
| 10 | 6:34.23–6:38.00 | "Honestly, I'm really impressed. All of this from one prompt." | Kalyan full height |
| 11 | 9:01.58–9:03.04 + 5:01.65–5:02.90 | "How close was the copy? Tell me in the comments below." | Both boards again with 50% / 80% / 90% chips → loops to the opening |

Cut out: "Four hundred thousand. Crazy, right?", the channel intro, "Same layout. Let's see.", the card-panel
walkthrough (5:46–6:10), the delete/sample-list tests.

---

## Short 2 — "Is REA worth the hype? Honest verdict"  (~55 s)

**Title:** 400K Stars… Is REA Actually Worth the Hype? #shorts
**Hook visual:** 400K ★ count with a big "WORTH IT?" stamp.

| # | Long-video time | Line | Visual (9:16) |
|---|---|---|---|
| 1 | 0:00.00–0:02.90 | "This one tool has 400,000 stars on GitHub." | 400K ★ counter fills the frame; Kalyan in PiP |
| 2 | 6:38.00–6:41.20 | "So is Rea really worth the hype? Let me be honest." | "WORTH THE HYPE?" kinetic text; Kalyan full height |
| 3 | 6:42.72–6:45.20 | "My answer is yes. It's worth trying." | Big coral ✓ YES |
| 4 | 6:45.52–6:46.60 | "Three reasons for it." | 1 · 2 · 3 counter |
| 5 | 6:46.96–6:50.80 | "One, it measures, it does not guess. That's the big difference." | Ruler icon over the real board, exact colour code chip |
| 6 | 6:51.08–6:58.00 | "Number two is it doesn't just look nice. It really works. Drag and drop, saving, the card panel, everything." | Fast cuts of the live test (drag, card panel) |
| 7 | 6:58.28–7:02.80 | "Three is Claude tested its own work. Fifty checks with real mouse." | Terminal: "All 50 checks passed" ticking |
| 8 | 7:03.06–7:04.50 | "But there is a but." | Hard cut, coral "BUT…" |
| 9 | 7:07.34–7:14.00 | "Rea is not magic. My prompt was very detailed … A lazy prompt gives you a lazy result." | Detailed prompt window vs a one-line prompt |
| 10 | 7:14.34–7:20.30 | "Also, it took twenty minutes, and it copied only one screen, the board screen, not the full app." | 20 min timer + "1 screen, not the full app" |
| 11 | 7:20.64–7:29.90 | "And some people online are asking, 'What does Rea add…?' So the hype is running a little ahead of proof." | Hype vs Proof meter, hype bar ahead |
| 12 | 8:39.72–8:43.10 | "So my verdict, try it, but do it in the right way." | Kalyan full height; verdict card |
| 13 | 8:54.04–8:55.50 | "Which app should I clone next?" | Comment prompt card → loops to the opening |

If it runs over 59 s, drop row 10 first (−6 s).

Cut out: "Let me be fair", the copyright section (7:30–8:03), the bonus tip, the "software engineering is not dead" section.

---

## Steps after approval

1. Re-cut the 9:16 talking-head clips from the 4K originals at the times above (same tone-map + grade, CRF 12).
2. Pull the proof visuals: board stills, GitHub capture, the drag-and-drop screen recording, the terminal render.
3. Build the two vertical HyperFrames compositions (captions from the ElevenLabs word timings).
4. Mix (voice + bed 0.11 + sparse SFX), −14 LUFS.
5. Run the lip-sync check from the long video on both Shorts before sending.
6. Send review copies; full-quality files after approval.
