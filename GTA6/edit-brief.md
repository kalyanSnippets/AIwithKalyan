# GTA6: edit brief v1

**Video:** "GTA 6: Six Technologies Behind the World" · AI with Kalyan · not monetised
**Status:** awaiting Kalyan's APPROVE / IMPROVE. Nothing in BUILD starts until this is approved.
**A-roll:** cut v3, 7:44 (`edits/aroll-v3.edl.json`). Timestamps below are v3 cut times.
**Finished length:** about 8:30 (7:44 A-roll + full-screen clip moments + ~35 s outro).

---

## 1. Edit type, length, outputs

| | |
|---|---|
| Style (style guide §7) | **C: explainer with motion graphics**, opening with B's hook energy. Face-cam anchor plus official GTA VI footage plus original diagrams. |
| Long-form | 16:9 1920×1080, 29.97 fps, about 8:30 |
| Shorts | **2** vertical 1080×1920 (see §10) |
| Review copies | < 30 MB after every version |

## 2. Reference styles (approach only, nothing copied)

Page with frames and style frames: https://claude.ai/artifact/1xmvnCXPaMNWFQk58D3skm.
Kalyan said "start next step", so I'm treating the recommended mix as the working choice. Swap any one in your review.

| Ref | Borrow | Used for |
|---|---|---|
| Tech Burner, *Inside ₹16,000 Crore Tech of GTA 6* | Kinetic keyword next to the presenter, fast face ↔ footage rhythm in the first 30 s, frame never empty | Hook 0:00–0:43, myth-bust lines, EXCITING / CREEPY ending |
| Corridor Crew, *VFX Artists Breakdown GTA 6* | Freeze real footage, then ring and label the detail | Proof beats: NPC notices you, face/clothes/car, reflections |
| Sanchit Gamedev, *GTA 6 Patents Explained* | Simple figure diagrams; source on screen with the key line highlighted | Game AI vs gen AI, retargeting, companion logic, RAGE stack, future NPCs |

Not borrowed from any of them: their footage, music, sound effects, graphics, wording, meme sounds, text crossing the body, or speculation presented as fact.

## 3. Style and pacing

- **Look:** dark glass panels on night ink #0D0818. Vice pink #FF3D9A, sunset orange #FF8A3D, ocean teal #19E3D3. Inter 800/900 for display, Inter 600 for labels. Eases: back.out(1.6) for pops, power3.out for moves. One chapter tag style throughout (`01 NPCs THAT NOTICE YOU` with a 1/6 progress bar).
- **Cut rate targets:** first 43 s, a meaningful visual change every **≤ 3 s**. Explanations every **≤ 6 s**. Takeaway (6:54–7:22) allowed to breathe, with face holds up to **10 s**.
- **Face rules (AGENTS.md):** never cover his face or the plants. No split-screen pushing him to one side. When information matters more than his face, use a **full-screen graphic with him in the rounded PiP bottom-left**. Look-aways while full-frame get covered with a relevant visual (run `scripts/gaze.py` on v3).
- **Jump cuts:** v3 already alternates 1.0 / 1.1 framing at every join. Cuts that land under B-roll or graphics don't need it.
- **Captions:** ElevenLabs word timings, ≤ 5 words per phrase, bottom-centre, Inter 800 white on a 55% black pill, key word in teal. Hidden while kinetic text shows the same words.
- **Footage:** official Rockstar downloads only (§8). **Trailer audio is muted:** the trailers carry licensed songs. No story spoilers, no isolated cutscene montage, and no stretch longer than 6 s without his voice or a graphic on top.

### Delivery check (measured on v3)

| Scene | Cut time | WPM | Loudness (dBFS RMS) |
|---|---|---|---|
| 1 Hook | 0:00–0:43 | 180 | −26.2 |
| 2 What AI? | 0:43–1:19 | 171 | −26.1 |
| 3 Tech 1 NPCs | 1:19–2:09 | 174–203 | −26.7 |
| 4 Tech 2 Profile | 2:09–2:48 | 187 | −26.7 |
| 5 Tech 3 Retarget | 2:48–3:39 | 180 | −26.9 |
| 6 Tech 4 Relations | 3:39–4:36 | 187 | −27.0 |
| 7 Tech 5 RAGE | 4:36–5:44 | 175 | −27.0 |
| 8 Tech 6 Future | 5:44–6:54 | 177 | −26.9 |
| 9 Takeaway | 6:54–7:22 | 185 | −27.2 |
| 9 CTA | 7:22–7:45 | 194 | −27.0 |

**Flag:** the voice is even from start to finish. The hook isn't measurably louder or faster, and the takeaway isn't calmer: it is actually slightly *faster* (185 wpm) than the explainer sections. I won't fake energy with effects. Proposal: let the takeaway breathe by allowing pauses up to **0.35 s** in 6:54–7:22 (now capped at 0.2 s). That's about +4 s. **Kalyan: OK?**

## 4. Effects palette (closed list: anything not here is not used)

| # | Effect | When it is used | Why |
|---|---|---|---|
| E1 | **Kinetic keyword** beside him (on the empty wall top-right, never over face or plants) | Hook and myth-bust lines only (≤ 6 in the video) | Makes the surprising claim land at the moment it's said |
| E2 | **Full-screen footage** (official GTA VI) with his voice over it | Whenever he describes something visible in the game | Show, don't tell |
| E3 | **Freeze + ring + label** on footage | Proof moments: NPC reacts, face/clothes/car, wet reflections | Points the eye at the exact detail |
| E4 | **Full-screen diagram + PiP** (him bottom-left) | Concepts that can't be filmed | Information over face, per his rule |
| E5 | **Chapter transition**: full-screen number 01–06 with icon, plus a persistent chapter tag | Each of the 6 technologies | Step structure he asked for |
| E6 | **Source card**: article or interview screenshot with the key line highlighted | Claims attributed to Take-Two / Rockstar | Trust: shows where the claim comes from |
| E7 | **Typed dialogue UI** (chat bubbles typing) | Future-NPC section only | The idea *is* a conversation |
| E8 | **Light 3D**: two mannequins sharing one animation (Three.js) | Retargeting only (3:05–3:31) | Genuinely spatial: body proportions in a seat |
| E9 | **Punch-in 1.0 ↔ 1.1** at joins | A-roll joins not under graphics (already in v3) | Hides jump cuts |
| E10 | **Announcement card + reveal** | "And this brings us to the biggest lesson" | His rule: flat announcement lines get a card |

Not used: shakes, glitches, RGB splits, particle bursts, meme zooms, fake game UI, fake wanted stars.

## 5. Per-beat plan (v3 cut times)

Need: **R** required · **O** optional. Source: `kr` Kalyan recording · `rs` Rockstar official · `eb` editor-built · `web` page capture · `el` ElevenLabs generated.
Tool: **HF** HyperFrames · **FF** FFmpeg · **3D** Three.js inside HyperFrames.

| # | Time | Line (short) | Purpose / emotion | On screen | Need | Source | Tool |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:02.7 | "Guys… GTA 6 is finally here!" | Hook · excitement | Full-screen GTA VI logo reveal (official cover-art clip) → cut to him | R | rs | FF |
| 2 | 0:02.7–0:08.3 | "after all these years of waiting… fascinating" | Hook · anticipation | Two quick official city shots (Vice City aerial, neon street); kinetic `13 YEARS` | R | rs, eb | HF |
| 3 | 0:08.3–0:15.6 | "here's something… Rockstar says they didn't use generative AI" | Twist · surprise | Face punch-in; E1 `GENERATIVE AI — ZERO?` on wall; then E6 GamesRadar headline highlighted | R | kr, web | HF |
| 4 | 0:15.6–0:22.1 | "you heard that right… no ChatGPT… no single prompt" | Myth-bust · playful | Full-screen: chat prompt box "generate a whole city…", struck through | R | eb | HF |
| 5 | 0:22.1–0:31.0 | "notice you following… police… thousands move" | Open loops · curiosity | 3 fast official clips: crowd, police, street crowd, each with a 1-word label | R | rs | HF |
| 6 | 0:31.0–0:43.2 | "that's where it gets interesting… six technologies… last one" | Roadmap · anticipation | Full-screen 6-slot strip builds 1→6 with icons; slot 6 locked with `?` | R | eb | HF |
| 7 | 0:43.2–0:56.3 | "one thing you need to understand… ChatGPT, Claude, AI videos" | Reframe · curiosity | Face → full-screen: chat window, Claude-style window, AI-video tile (generic UI, no logos) + PiP | R | eb | HF |
| 8 | 0:56.3–1:09.7 | "Games have used AI for decades… steal a car… police chase" | Example · "oh" | Official driving / police footage with a CRIME → WITNESS → RESPONSE flow drawing over the top third | R | rs, eb | HF |
| 9 | 1:09.7–1:18.9 | "traditional game AI… rules, decisions, simulations… much further" | Definition | Full-screen trio cards: Rules · Decisions · Simulation + PiP | R | eb | HF |
| 10 | 1:18.9–1:23.0 | "technology number one, which is NPC behaviour" | Chapter | **E5 `01`** full-screen, icon: person + eye | R | eb | HF |
| 11 | 1:23.0–1:30.7 | "walking through Vice City… two people… stop to listen" | Setup · playful | Official crowd shot, slow push; player dot + proximity radius grows | R | rs, eb | HF |
| 12 | 1:30.7–1:39.9 | "they might notice you're eavesdropping… caught being nosy" | Payoff · humour | **E3** freeze NPC (style frame 2), ring + `NOTICES YOU`; then his laugh full-frame | R | rs, kr | HF |
| 13 | 1:39.9–1:49.1 | "detail Rockstar has discussed… personal space" | Trust | E6 developer-interview card (Rob Nelson) + PiP | R | web | HF |
| 14 | 1:49.1–2:00.9 | "why does this matter… barely acknowledge you… believable" | Meaning | Split *across time* (not frame): ignoring NPC icon → reacting NPC icon, full-screen | R | eb | HF |
| 15 | 2:00.9–2:09.2 | "wait until you hear how the police… escape a crime" | Open loop · tension | Face; siren-light sweep (pink/teal) at frame edge only | R | kr, eb | HF |
| 16 | 2:09.2–2:12.9 | chapter (spoken: "Okay, picture this") | Chapter | **E5 `02` THE POLICE REMEMBER**, icon: badge | R | eb | HF |
| 17 | 2:12.9–2:17.8 | "police see your car… clothes… face… escape" | Setup · tension | Official chase shot → **E3** freeze, 3 rings `CAR · CLOTHES · FACE` appear on each word | R | rs, eb | HF |
| 18 | 2:17.8–2:27.8 | "wanted level disappears… Criminal Profile system" | Reveal | Full-screen profile card builds (no "concept" label, per Kalyan) + PiP | R | eb | HF |
| 19 | 2:27.8–2:48.0 | "details… outfit… not just driving faster… what people saw" | Aha · intrigue | Outfit icon gets flagged; speedometer icon crossed; eye icons; ends on face | R | eb, kr | HF |
| 20 | 2:48.0–2:57.8 | "NPC behaviour is one thing… thousands… technology three, retargeting" | Bridge + chapter | Official crowd montage → **E5 `03`**, icon: stick figure | R | rs, eb | HF |
| 21 | 2:57.8–3:09.9 | "most people won't notice… one animation… sitting in a car" | Problem | Official car-entry shot; freeze; seat outline | R | rs | HF |
| 22 | 3:09.9–3:23.1 | "taller character… hands… legs… looks weird" | Problem · fun | **E8** 3D: same pose on tall/short mannequin, hands miss the wheel (red), legs miss the pedals | R | eb | 3D |
| 23 | 3:23.1–3:38.9 | "runtime animation retargeting… adapts… multiply… city feels natural" | Aha | 3D pose snaps to fit (teal ✓, style frame 3) → official dense-crowd shot | R | eb, rs | 3D, HF |
| 24 | 3:38.9–3:51.8 | "even more interesting… characters interact… technology four" | Bridge + chapter | Face → **E5 `04` CHARACTERS WITH RELATIONSHIPS**, icon: two figures | R | kr, eb | HF |
| 25 | 3:51.8–4:01.6 | "Jason and Lucia… AI systems… as a couple" | Setup · warmth | Official Jason + Lucia portraits, nameplates; E6 interview card | R | rs, web | HF |
| 26 | 4:01.6–4:16.6 | "think about that… follow because mission says so… move together, react" | Contrast | Full-screen: "follow" dotted line (old) vs coordinated paths (new) + PiP | R | eb | HF |
| 27 | 4:16.6–4:27.8 | "arriving together… wait, reposition, react… coordination" | Aha | Animated top-down: player dot moves, companion waits / repositions / reacts (3 labels on each word) | R | eb | HF |
| 28 | 4:27.8–4:36.3 | "not secretly powered by ChatGPT… designed gameplay" | Myth-bust | E1 kinetic `NOT ChatGPT` beside him → `DESIGNED SYSTEMS` | R | eb | HF |
| 29 | 4:36.3–4:46.5 | "from characters to the world… technology five… RAGE, lighting, weather" | Chapter | Official night-city beauty shot → **E5 `05` THE WORLD ITSELF**, icon: sun/rain | R | rs, eb | HF |
| 30 | 4:46.5–4:56.4 | "seen the lighting… reflections… neon… weather… incredible" | Wonder | 3 official beauty shots (reflections, neon, weather), one per noun, no graphics on top | R | rs | FF |
| 31 | 4:56.4–5:07.6 | "RAGE… brings the entire game together: graphics, physics, animation, systems" | Explain | Full-screen engine stack builds 4 layers on each word + PiP | R | eb | HF |
| 32 | 5:07.6–5:26.7 | "driving at night… raining… wet road… engine coordinates… ray-traced" | Proof · wonder | Official wet-night driving; **E3** freeze + arrows on reflections `LIGHT · SURFACE · WEATHER` | R | rs, eb | HF |
| 33 | 5:26.7–5:44.4 | "people misunderstand… graphics don't mean AI… artists… believable world" | Myth-bust | E1 `GRAPHICS ≠ AI` beside him → full-screen: code + physics + artist brush icons combine | R | eb | HF |
| 34 | 5:44.4–5:54.0 | "technology number six… what comes next… machine learning and future" | Chapter · wonder | **E5 `06` WHAT COMES NEXT?** (slot 6 from the roadmap unlocks) | R | eb | HF |
| 35 | 5:54.0–6:06.1 | "detailed world… what happens with generative AI?" | Question | Official Vice City aerial dissolving into a stylised "future" grid version | R | rs, eb | HF |
| 36 | 6:06.1–6:23.2 | "talk to the shopkeeper… NPC remembers… react differently" | Vision · excitement | **E7** typed dialogue UI: player types, shopkeeper replies; memory bubble "yesterday you said…" | R | eb | HF |
| 37 | 6:23.2–6:28.2 | "side missions adapt… possibilities are fascinating" | Vision | Branching path animation: choice A / B → different outcomes | R | eb | HF |
| 38 | 6:28.2–6:39.2 | "future possibilities… not confirmed… ML teams ≠ language model" | Caveat · trust | Face, calm; small lower-third `FUTURE IDEA, NOT A GTA 6 FEATURE` (his own words on screen) | R | kr, eb | HF |
| 39 | 6:39.2–6:53.7 | "careful… say anything… control the story… consistent, fun, safe" | Tension | Full-screen: story line with NPC speech bubbles branching off; 3 checks Consistent · Fun · Safe + PiP | R | eb | HF |
| 40 | 6:53.7–6:56.7 | "this brings us to the biggest lesson" | Announcement | **E10** card `THE BIGGEST LESSON` | R | eb | HF |
| 41 | 6:56.7–7:21.6 | takeaway: "human creativity + technology… what experience can I make better?" | Payoff · calm | Mostly face, held. One clean merge graphic (Human creativity + Technology → Experience). Key question as E1 text | R | kr, eb | HF |
| 42 | 7:21.6–7:35.3 | "GTA 7 NPCs… exciting or creepy? comment" | CTA · playful | Two big buttons `EXCITING` / `CREEPY` beside him, comment icon | R | eb | HF |
| 43 | 7:35.3–7:44.5 | "subscribe to AI with Kalyan… behind the screen" | CTA · warmth | Subscribe pill animation beside him | R | eb | HF |
| 44 | 7:44.5–~8:20 | **Outro** (his voice-clone recording, voice only) | Close | Full-screen: recap of the 6 → Like → Subscribe → bell → description panel → pinned-comment card → "Thanks for watching / See you in the next video" end card | R | el, eb | HF |

## 6. Sound plan

- **Music (ElevenLabs Music, approved):**
  - 0:00–0:43: dark synth-wave tension cue.
  - 0:43–5:44: low atmospheric tech pulse.
  - 5:44–6:54: wonder cue with no drop.
  - 6:54 onward: soft resolve, then the outro bed.
  - Bed level about **0.11**, ducked a further −4 dB on key lines. Never louder than about −20 dB under the voice. Changes only at chapter boundaries.
- **SFX family (ElevenLabs SFX, one family):** soft whoosh (chapter transitions), soft pop (labels/rings), single UI tick (typed dialogue). ≥ 0.9 s apart, ≤ 4 per minute, always synced to a visible event, never on a key word.
- **Silence:** 0.3 s of music dip before "Rockstar says they didn't use generative AI" and before "the biggest lesson".
- **Footage audio:** muted (licensed songs). Gameplay ambience only if it has no music.
- **Voice:** high-pass 80 Hz, gentle de-noise, light compression. Studio Sound (Descript) is his preference, but it's a paid connector, so **ask first**. Mix to **−14 LUFS integrated, −1 dBTP**.

## 7. Third-party installs

None new. HyperFrames (already in repo) for every beat. Three.js via HyperFrames' Three.js adapter for beat 22–23 only, with a short test render first. GSAP is vendored locally because the CDN may be blocked.

## 8. Asset needs (REQUIRED, not editor-built)

| ID | Asset | Status |
|---|---|---|
| A1 | Official GTA VI videos (Out Now, cover art, Trailer 1, Trailer 2, Launch trailer, Extended Look) | **Have**, downloaded from rockstargames.com/VI/media |
| A2 | Shot log: timecodes in A1 for the shots each beat needs (aerial, crowd, police chase, car entry, body variety, Jason & Lucia, neon, wet night road) | To do (editor, before BUILD) |
| A3 | Official stills: GTA VI logo/cover, Jason & Lucia portraits | To fetch from rockstargames.com/VI/media |
| A4 | Page capture: GamesRadar Take-Two "zero generative AI" article (headline + quote) | To capture (`npm run broll`) |
| A5 | Page capture: Best Buy Rob Nelson interview (NPC + couple systems quotes) | To capture |
| A6 | Music × 4 cues + SFX family | To generate (ElevenLabs) |
| A7 | Outro voice: his ElevenLabs voice-clone ID | **Need from Kalyan** |

No asset needs Kalyan to record anything, unless he wants pickups for "really gets interesting" and "stimulating".

## 9. Self-review targets

| Check | Target |
|---|---|
| Visual change, first 43 s | every ≤ 3 s |
| Visual change, explanations | every ≤ 6 s |
| Longest face-only hold | ≤ 8 s (takeaway ≤ 10 s) |
| Chapter cards | all 6 present, same template |
| Kinetic keywords (E1) | ≤ 6 total |
| SFX | ≤ 4/min, ≥ 0.9 s apart |
| Captions | ≤ 5 words, ≥ 1.2 s on screen, matched to Scribe timings |
| Text hold | ≥ 1.2 s + 0.3 s per word |
| Voice vs music | music ≥ 18 dB under voice |
| Loudness | −14 LUFS integrated, ≤ −1 dBTP |
| Face / plants covered | 0 frames |
| Footage with music audible | 0 s |
| Review copy | < 30 MB |

## 10. Shorts (2)

| Short | Source (v3) | Hook | Payoff |
|---|---|---|---|
| S1 "NPCs that notice you" | 1:23–2:00 (≈ 37 s) | "Imagine getting caught being nosy by a video game character" moved to the front | E3 freeze + ring, then his laugh |
| S2 "Exciting or creepy?" | 6:06–6:26 + 7:23–7:35 (≈ 32 s) | "Imagine talking to a shopkeeper naturally" | EXCITING / CREEPY comment prompt |

Alternate S2: "Realistic graphics ≠ AI" (4:46–5:44, trimmed to about 40 s).

## 11. Open questions for Kalyan

1. Approve the reference mix, or swap one?
2. Takeaway pauses up to 0.35 s (+4 s)?
3. Studio Sound via Descript (paid connector) or local cleanup only?
4. Your ElevenLabs voice-clone name / ID for the outro.
5. Keep or drop the spoken chapter names ("which is animation retargeting"…)? Plan above keeps them (chapter cards sit under them).
