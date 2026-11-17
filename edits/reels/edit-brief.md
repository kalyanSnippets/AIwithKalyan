# Instagram Reels from "Free Claude Code, 3 ways": edit brief (awaiting approval)

## 1. Edit type, length, outputs
- **Style:** B · Shorts and Reels (style guide §7B): one idea, hook then payoff, fast but legible.
- **Outputs:** 2 Reels, 9:16, 1080×1920, 30 fps, **~30 s each**.
  - **Reel A:** "The Wi-Fi is OFF."
  - **Reel C:** "This almost cost me $20."
- **Source:** the approved long video. The voice is the final cut's cleaned voice track. Face shots come from the raw 1080p camera takes
  (native resolution, no upscaling). Screens come from Kalyan's original recordings with the same blurs as the long video.
- **Ending:** text card "Full 3-method video on YouTube · link in bio" (2.5 s). There is no new voice, because Kalyan never said this line.

## 2. Reference style
No new research (saves vidIQ credits). The approach is borrowed from the references already studied for the long video
(Sharbel's "Unlimited Claude Code For Free", Outskill's "3 Ways"): result shown early, soft pops on what appears, calm lo-fi bed.
Nothing is copied: no footage, music or sound from them.

## 3. Style and pacing
- **Layout:**
  - top panel (1080×1020): the screen or graphic for the current line, in the long video's Windows-style window card;
  - bottom (1080×900): Kalyan's face, cropped from the 1080p camera at native size;
  - on hook and payoff lines the face goes full-frame (1080×1920 crop of the camera, scaled 1.0, no upscaling past native height).
- **Captions:** word-by-word, 2–4 words per line, Inter Black 74 px, white with the key word in coral (#E8775F), on the seam between
  screen and face (never over the face or the key UI).
- **Hook text (0–2.5 s):** big top line, then gone.
- **Cut rate:** a visual change every 2–4 s (each beat below), no jump cuts inside a sentence.
- **Music:** the long video's lo-fi bed (ElevenLabs track, already licensed to Kalyan), about 20 dB under the voice, lifting 3 dB on the
  end card.

## 4. Effects palette (closed list)
| Effect | When | Reason |
|---|---|---|
| Hook text | 0–2.5 s only | Viewers decide in 1–2 s; it states the stakes before the voice finishes |
| Zoom onto the exact UI line | Only when the voice names it ("the top line", "openrouter/free") | Moves the eye to the detail being talked about |
| Magnifier bubble + coral ring | "Claude Pro?" and the $0.00 bill only | These are the two proofs; they must be readable on a phone |
| Stamp card ("$0 · OFFLINE · PRIVATE", "$0.00") | Payoff line only | Locks in the takeaway |
| Soft pop (synthesised, $0) | When the magnifier, stamp or hook text appears (≤ 4 per Reel) | Ties sound to a visible event |
| Soft whoosh (synthesised, $0) | Once, into the end card | Marks the change of topic |
Anything not listed is not used.

## 5. Per-beat table

**Reel A · "The Wi-Fi is OFF" (~33 s incl. end card)**

| # | Final-cut time | Line | Purpose / emotion / importance | Screen (top) | Need | Source | Tool |
|---|---|---|---|---|---|---|---|
| 1 | 2:56.9–3:01.1 | "So watch this. I'm turning the Wi-Fi off. See? No internet at all." | Hook · curiosity · high | Wi-Fi OFF graphic; hook text **"NO INTERNET. CAN AI STILL CODE?"** | REQUIRED | editor-built (existing scene) | HyperFrames render + FFmpeg |
| 2 | 1:32.1–1:37.6 | "Ollama is a free app that downloads AI models and runs them right on your own laptop." | Context · trust · medium | Ollama app window; label "Claude Code + Ollama · free · local" | REQUIRED | kalyan-recording | FFmpeg |
| 3 | 3:01.3–3:04.0 | "So be honest, do you think it can still write an app?" | Tension · curiosity · medium | Full face (direct question) | REQUIRED | kalyan-recording | FFmpeg |
| 4 | 3:04.2–3:10.7 | "I type, make a simple notes app, and it's thinking… completely offline." | Proof · focus · high | Real Ollama chat: typing, thinking, code appears (dead time sped up, "Wi-Fi: OFF" pill) | REQUIRED | kalyan-recording | FFmpeg |
| 5 | 3:10.9–3:13.9 | "Every single word came from a model sitting on this laptop." | Proof · delight · high | The finished notes app | REQUIRED | kalyan-recording | FFmpeg |
| 6 | 3:14.0–3:23.0 | "Is it pretty? No. But a laptop with no internet just wrote working software… your code never left your computer." | Payoff · satisfaction · high | Full face, then stamp **"$0 · OFFLINE · PRIVATE"** | REQUIRED | editor-built | HyperFrames |
| 7 | end | (no voice) | CTA · warmth | **"Full 3-method video on YouTube · link in bio"** | REQUIRED | editor-built | HyperFrames |

"Kind of like a media player, but for AI" is cut to keep the Reel under 35 s.

**Reel C · "This almost cost me $20" (~29 s incl. end card)**

| # | Final-cut time | Line | Purpose / emotion / importance | Screen (top) | Need | Source | Tool |
|---|---|---|---|---|---|---|---|
| 1 | 9:08.4–9:12.7 | "My paste failed silently. I typed Claude, it opened, and it looked fine." | Hook · tension · high | Terminal opening; hook text **"THIS ALMOST COST ME $20"**, small label "setting up FREE Claude Code" | REQUIRED | kalyan-recording | FFmpeg |
| 2 | 9:12.9–9:19.0 | "Look at the top line. Spot anything wrong? Claude Pro? Claude Code had quietly gone back to my paid subscription." | Reveal · surprise · high | Zoom to the header → magnifier + coral ring on **"Claude Pro"** | REQUIRED | kalyan-recording | FFmpeg |
| 3 | 9:19.3–9:22.5 | "If you see your Claude plan here, you're not on a free setup." | Lesson · trust · high | Full face (the takeaway) | REQUIRED | kalyan-recording | FFmpeg |
| 4 | 9:22.7–9:32.1 | "I opened a fresh terminal… Now it says OpenRouter/free, API usage billing. That's the free one." | Relief · focus · high | Fresh terminal → zoom on **"openrouter/free · API Usage Billing"** (key line blurred as in the long video) | REQUIRED | kalyan-recording | FFmpeg |
| 5 | 10:01.7–10:05.4 | "Three requests, about twenty-four thousand tokens and zero dollars." | Payoff · satisfaction · high | OpenRouter Activity: magnifier on **$0.00** | REQUIRED | kalyan-recording | FFmpeg |
| 6 | end | (no voice) | CTA · warmth | **"Full 3-method video on YouTube · link in bio"** | REQUIRED | editor-built | HyperFrames |

## 6. Sound plan
- Voice: the long video's cleaned voice, −14 LUFS integrated, −1.5 dBTP (Instagram normalises to around this).
- Music: lo-fi bed about 20 dB under the voice, ducked further on beat 2 of Reel C and beat 4 of Reel A (viewer load is high there).
- Sound family: one soft pop and one soft whoosh, both synthesised locally ($0). At most 4 pops per Reel, never on a key word.
- Silence: 0.3 s of near-silence before each payoff stamp.

## 7. Third-party skills or libraries
None new: FFmpeg, HyperFrames 0.8.160 and the existing Python compositor, all already used for the long video.

## 8. Asset needs list
None. Every visual already exists in Kalyan's recordings and the long video's scenes.

## 9. Self-review criteria
- Hook text and first spoken word both start within 0.3 s.
- Each Reel is 28–35 s.
- No caption covers the face or the zoomed UI.
- Captions are 2–4 words, every word matching the voice.
- No private data visible (keys, email, work paths): frame check every 0.5 s on screen beats.
- Voice is never masked: music at least 18 dB under voice.
- Pops ≤ 4 per Reel.
- Text holds at least 1.2 s.
- Output: 1080×1920, 30 fps, −14 LUFS.

## Delivery measured from the recording (final cut)
| Reel | Beat | WPM | Longest gap |
|---|---|---|---|
| A | 1 Hook | 187 | 0.38 s |
| A | 2 Ollama | 211 | 0.32 s |
| A | 3 Question | 269 | 0.16 s |
| A | 4 Proof | 176 | 0.38 s |
| A | 5 Proof | 220 | 0.08 s |
| A | 6 Payoff | 179 | 0.80 s |
| C | 1 Hook | 183 | 0.30 s |
| C | 2 Reveal | 194 | 0.34 s |
| C | 3 Lesson | 242 | 0.36 s |
| C | 4 Fix | 167 | 0.40 s |
| C | 5 Payoff | 145 | 0.30 s |

The delivery matches each beat's intended emotion: the hooks are quick and energetic, and the payoffs slow down. Nothing is flagged.

## As built (review v1)
- **Reel A (34.6 s):** hook "Watch this…" with the Wi-Fi panel → Ollama card (logo, FREE APP, models drop into the laptop) → full-face
  question → offline chat (3 pauses trimmed) → notes app → "Is it pretty? No." → kinetic payoff (captions hidden, "no subscription,
  no usage limits" cut for length) → stamp **$0 · OFFLINE · PRIVATE** → new voice ending over the "3 FREE WAYS" end card.
- **Reel C (31.6 s):** new-voice hook over the failed paste (paths blurred) → "Look at the top line… Claude Pro?" → full-face lesson →
  "Now it says OpenRouter/free…" (the key-typing part is skipped because it shows key material) → new-voice bridge "And the real bill
  for all of that?" → "$0.00" bill + stamp → new-voice ending over the end card.
- New lines: level- and tone-matched to the studio voice (`scripts/match-eq.py`). Music ~20 dB under the voice, +3 dB on the end card.
  3–4 synthesised pops + 1 whoosh. −14 LUFS.
- Privacy: OCR blur on every screen frame, then a 3 fps OCR re-scan of the output (0 hits on both).
- Build: `python3 edits/reels/build_reels.py A C [--review]`.
