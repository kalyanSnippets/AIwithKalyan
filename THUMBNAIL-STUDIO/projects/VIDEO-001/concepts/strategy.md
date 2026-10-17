# VIDEO-001 — thumbnail strategy

**Video:** Claude Code edits my entire YouTube video
**Working title:** I Let Claude Code Edit My Entire YouTube Video

Five distinct archetypes adapted to the research (see research/report.md). Shared rules: 1280x720, one focal point, at most 4 headline words, readable at 320 px, real evidence only, Kalyan's real face only, no Claude logo (no officially sourced file), bottom-right kept clear for the duration badge.

## Option A — Before/After (revision 1)

- **Story:** The same video, before and after Claude Code edited it. Left: Kalyan's untouched camera frame. Right: the finished edit's real QA screen, where all 25 automated checks passed.
- **Curiosity trigger:** How did a plain raw recording become this, without a human editor?
- **Composition and subject positions:** Hard vertical split with a thin coral seam and a round arrow badge at centre. Labels sit bottom-left on each half, clear of the duration badge. The raw half stays slightly desaturated so the edited half's bright 25/25 wins attention.
- **Main image / genuine evidence:** assets/frames/k330.png (raw 4K camera frame, CLD_1279 at 5:30); assets/evidence/final-486-qa-crop.png (finished edit at 8:06, the real 25/25 QA ring, cropped above the caption)
- **Background:** The two real frames are the background; nothing is generated.
- **Typography:** Two pill labels: 'RAW' (ink on white) and 'EDITED' (ink on coral, 6.5:1), in Inter Display Black at 72 px. Layers: "RAW" (72px), "EDITED" (72px)
- **Colours, contrast, lighting:** Left is muted lavender and grey, right is the dark ink QA screen with a green progress arc and white 25/25. The coral seam and badge tie them together.
- **Canva instructions:** Base image: both halves baked into one PNG. Labels become native Canva text so the wording can change. (plan: `studio canva-plan VIDEO-001 A`)
- **Image-generation prompts:**
  - none
- **Why it could work:**
  - Real transformation proof; competitors mostly show logos or timelines
  - Instantly understood at feed size: two halves, an arrow and the word EDITED
- **Risks and weaknesses:**
  - The QA ring's small check labels won't read on mobile; the big 25/25 carries it
  - Before/after split layouts are common in editing videos generally

## Option B — Face + Emotion (revision 0)

- **Story:** Kalyan reacts, half impressed and half sceptical, to a video he didn't edit himself. The edit came from one instruction to Claude Code.
- **Curiosity trigger:** If he didn't edit it, who did, and how good is it?
- **Composition and subject positions:** Face right of centre at about 50% of frame height, sharply lit, with a coral rim glow. Text block left-aligned on the left third with the prompt card above it. The face looks into the lens.
- **Main image / genuine evidence:** assets/frames/k121.png (genuine expression from CLD_1279 at 2:01, own footage); the prompt matches what he typed in the video
- **Background:** Dark ink with a coral glow behind the head (CSS gradient). In the Canva version, optionally the generated studio background (Canva media MAHYQV3aO4o).
- **Typography:** 'I DIDN'T EDIT THIS' in Inter Display Black, two lines, 112 px, with DIDN'T in coral. The prompt card text is 36 px, secondary. Layers: "› edit my entire video" (40px), "I DIDN'T EDIT THIS" (116px)
- **Colours, contrast, lighting:** Ink background, white text, one coral accent. Warm skin against the cool dark background separates the subject.
- **Canva instructions:** Upload the face cutout separately (canva: separate) so it can be nudged. Text is native. (plan: `studio canva-plan VIDEO-001 B`)
- **Image-generation prompts:**
  - Cinematic out-of-focus background of a dark modern video editing studio at night… (used: Canva generate-image → MAHYQV3aO4o)
- **Why it could work:**
  - A real, believable face (vidIQ penalised performative faces)
  - The claim is literally true per the video ('I didn't manually edit it')
  - The text poses a question the title answers ('Claude Code')
- **Risks and weaknesses:**
  - 4-word headline plus a prompt card is the busiest of the five
  - Face-plus-text-on-dark is a familiar layout

## Option C — Minimalist Tech (revision 0)

- **Story:** The whole edit started as one line typed into Claude Code. The timeline underneath shows real frames from his footage, with the bad takes cut.
- **Curiosity trigger:** Can one sentence really produce a finished video?
- **Composition and subject positions:** Typographic: a huge command line across the upper half, then a filmstrip of real footage frames with two cut (red, scissors) clips, then a coral progress line. Lots of quiet space; no face.
- **Main image / genuine evidence:** assets/strip/*.jpg are real frames of the CLD_1279 camera footage. The command mirrors his instruction.
- **Background:** Flat ink with a faint coral bloom (CSS).
- **Typography:** The command is Inter Display Black at 150 px. 'CLAUDE CODE' is a small coral eyebrow. Total: 5 words. Layers: "CLAUDE CODE" (40px), "› edit my video" (150px)
- **Colours, contrast, lighting:** Near-monochrome with coral accents and red only on the cut clips.
- **Canva instructions:** Filmstrip and shapes baked into the base; the command and eyebrow stay native text. (plan: `studio canva-plan VIDEO-001 C`)
- **Image-generation prompts:**
  - none
- **Why it could work:**
  - Lowest visual entropy of the set (vidIQ's most common penalty was clutter)
  - Distinct from face-led thumbnails in the niche
  - Readable at 320 px: a single sentence
- **Risks and weaknesses:**
  - No face, so it may get less human attention in the feed
  - Lower-case command text is less shouty than its competitors

## Option D — Curiosity/Mystery (revision 0)

- **Story:** Kalyan presents a finished, polished frame of his own video and poses the question. The title answers it: Claude Code.
- **Curiosity trigger:** An explicit open question (vidIQ flagged a missing open question as a weakness on a reference).
- **Composition and subject positions:** Kalyan on the left mid-explanation (a natural expression), the finished frame as a tilted card on the right, and a coral question badge on the card's corner. The question sits above the card.
- **Main image / genuine evidence:** assets/frames/k45.png (own footage, 0:45); assets/evidence/final-186.5.png (finished edit, the step 02 card)
- **Background:** Ink with a blue-left / coral-right glow (CSS).
- **Typography:** 'WHO EDITED THIS?' in Inter Display Black at 92 px, white with EDITED in coral, placed over the right half. Layers: "?" (88px), "WHO EDITED THIS?" (96px)
- **Colours, contrast, lighting:** Ink, white, coral; the coral-heavy step 02 frame makes the card glow.
- **Canva instructions:** Face cutout and finished frame are separate uploads; the question is native text. (plan: `studio canva-plan VIDEO-001 D`)
- **Image-generation prompts:**
  - none
- **Why it could work:**
  - Genuine curiosity gap with a truthful answer
  - Shows the real finished output as the 'mystery object'
- **Risks and weaknesses:**
  - The question format is common; it relies on the card looking impressive at small size
  - The face is smaller than in B

## Option E — AI Workflow/Result (revision 1)

- **Story:** The pipeline in one glance: raw footage in, Claude Code orchestrating the tools, a finished video out that passed 25/25 automated QA checks (true: the final edit's QA ring).
- **Curiosity trigger:** What happens in the middle step, and what are the tools?
- **Composition and subject positions:** Three-beat flow left to right: the raw frame card, then a Claude Code terminal tile, then the biggest element, the finished edit's real 25/25 QA screen, with a green proof badge. 'RAW → DONE' runs along the top.
- **Main image / genuine evidence:** assets/frames/k3.png (raw camera frame); assets/evidence/final-486-qa-crop.png (the real 25/25 QA ring in the finished edit)
- **Background:** Ink with a soft coral bloom behind the middle tile (CSS).
- **Typography:** 'RAW → DONE' in Inter Display Black at 112 px. The green proof badge reads 'ALL CHECKS PASSED' at 40 px. A 'Claude Code' label sits under the terminal icon. Layers: "Claude Code" (30px), "✓ ALL CHECKS PASSED" (40px), "RAW → DONE" (112px)
- **Colours, contrast, lighting:** Ink, white, coral for the process and green for verified.
- **Canva instructions:** Cards are separate uploads; arrows, tiles and the badge are shapes; text is native. (plan: `studio canva-plan VIDEO-001 E`)
- **Image-generation prompts:**
  - none
- **Why it could work:**
  - Specific, verifiable proof (25/25 QA) that competitors can't claim
  - Explains the 'how' the video promises
- **Risks and weaknesses:**
  - Three objects is more than one focal point; the result card must dominate
  - The 25/25 badge must stay true to the video (it is)
