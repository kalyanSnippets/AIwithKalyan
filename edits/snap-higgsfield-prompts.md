# SNAP: detailed Higgsfield prompts

Source: `renders/snap/SNAP_roughcut_INSTAGRAM.mp4` (rough cut v1). The YouTube cut has the same
picture up to 1:07, so the generated clips work for both versions.

## 0. Model, settings and files

| Setting | Value |
|---|---|
| Model | **Seedance 2.5** (Higgsfield, ByteDance) |
| Mode | **`video_edit`**: edits your real clip, keeping your motion, gestures and lip movement |
| Aspect | 9:16 (follows the uploaded clip) |
| Resolution | Do a **480p draft first** (`draft: on`), then finalise at **1080p** once the draft looks right. Under the free trial, Seedance 2.5 is reported to be free at 480p (up to 30 s); 1080p may cost credits |
| Audio | **`generate_audio: OFF`**. Your real voice from the rough cut goes back on in the edit |
| Clip length | 4–30 s per generation. All four chunks below fit |

Upload these chunks (cut from the rough cut, in `renders/snap/higgsfield/`):

| Chunk | Rough-cut time | Length | What happens |
|---|---|---|---|
| `HF1_throne_mask.mp4` | 0:00.00–0:13.45 | 13.5 s | Snap → throne · mask peel → hero look |
| `HF2_suit_jungle.mp4` | 0:13.45–0:25.85 | 12.4 s | Shirt pull → black suit · snap → jungle |
| `HF3_jungle_explain.mp4` | 0:25.85–0:50.50 | 24.7 s | Hold in the jungle (MCP explanation + how-to) |
| `HF4_jungle_snapback.mp4` | 0:50.50–0:58.80 | 8.3 s | Jungle, paid-plan warning, ends on the final snap |

From 0:58.80 to the end, use the **original footage** with no generation. The final snap cuts straight
back to the real room, which is the "smash cut to silence".

**Order:** generate **HF1 → HF2 → HF3 → HF4** in sequence. After each one, take its **last frame** and add
it as an image reference to the next chunk, so the throne, face, suit and jungle stay identical.

---

## 1. Lock the looks first: three reference stills (image model)

Use **Nano Banana Pro** or **GPT Image 2** with `REF_kalyan_frame.jpg` as the image reference.
Output 9:16. These stills become `image_references` for the video chunks.

**R1, throne (original clothes)**
> Photorealistic vertical 9:16 photo. Keep this exact man from the reference image: same face, same curly voluminous black hair, same full dark beard, same clear champagne hexagonal glasses, same small earring, same white T-shirt with lavender raglan sleeves, lavender crew neck and black "BOSTON" chest print, same black fitness band on his right wrist. Same room: plain warm light-grey wall, soft natural window light, palm leaves at the left edge. Replace his blue office chair with a huge, ornate, hand-carved golden throne with deep red velvet cushions and tall carved back, gold catching the soft light. Same camera angle, chest-up framing, he sits relaxed and looks into the lens. No text, no watermark.

**R2, hero look on the throne**
> Same man, same framing, same room and golden throne as the reference. Change only his look into a movie-hero version of himself: dark gold-rimmed aviator sunglasses instead of his clear glasses, hair styled and swept back with volume, beard sharply groomed and lined, confident relaxed expression. Still the white T-shirt with lavender sleeves. Face must stay clearly recognisable as the same person. Photorealistic, 9:16, no text.

**R3, hero in a suit, in the jungle**
> Same man in the same hero look (aviator sunglasses, styled hair, groomed beard) sitting on the same golden red-velvet throne. He now wears a sharp, perfectly tailored black suit with a crisp white open-collar shirt, no tie. The room is gone: he sits in the middle of a lush sunlit rainforest with giant monstera and banana leaves, hanging vines, soft morning mist, and warm golden light rays through the canopy. Same chest-up framing and camera angle. Photorealistic, cinematic, 9:16, no text.

---

## 2. Identity and continuity block (paste at the top of EVERY video prompt)

> Edit this video. Keep the exact same person, performance, timing, head movement, hand gestures and mouth/lip movement from the source video — do not change what he says or how he moves. Keep his face identical and recognisable: Indian man, curly voluminous black hair, full dark beard, clear champagne hexagonal glasses, small earring, black fitness band on his right wrist. Keep the same camera: locked-off, vertical 9:16, chest-up framing, same lens and distance. Photorealistic, natural skin texture, believable lighting and shadows, cinematic but real. No subtitles, no captions, no text, no logos, no watermark.

## 3. Negative prompt (if there's a field for it)

> cartoon, anime, 3D render look, plastic skin, face morphing, different person, changed face, extra fingers, extra hands, distorted hands, warped glasses, flickering, jitter, camera shake, zoom changes, blurry face, text, captions, subtitles, watermark, logo, split screen, frame borders

---

## 4. Video prompts per chunk

### HF1: Throne + mask (`HF1_throne_mask.mp4`, 13.5 s)
Image references: `REF_kalyan_frame.jpg`, R1, R2

> [continuity block]
>
> Timeline of effects:
> 0.0–0.6 s: normal room, blue office chair, he sits and smiles.
> At 0.7 s, exactly on his finger snap: a quick white-gold light pulse bursts from his fingertips, and within 6–8 frames the blue office chair ripples and transforms into a huge ornate hand-carved golden throne with deep red velvet cushions and a tall carved back (match reference R1). Small gold sparkles fade out. The throne stays for the rest of the clip.
> 0.7–6.4 s: he keeps talking calmly on the throne; nothing else changes.
> 6.5–10.5 s: his arm comes across his face — he is peeling off a thin, realistic rubber mask of his own face, gripping it from under the jaw and pulling it up and away. Show the mask stretching and lifting off his face, then he flicks it away out of frame to the left at about 10.3 s.
> From 10.5 s to the end: underneath the mask he is the movie-hero version of himself (match reference R2): dark gold-rimmed aviator sunglasses instead of clear glasses, styled swept-back hair, sharply groomed beard. Same face, same person, same white T-shirt with lavender sleeves. He keeps talking calmly, not reacting at all.
> Lighting: soft warm daylight, gold reflections from the throne on his arms.

### HF2: Suit + jungle (`HF2_suit_jungle.mp4`, 12.4 s)
Image references: last frame of HF1, R2, R3

> [continuity block]
>
> Starting state: he is already in the hero look (aviator sunglasses, styled hair, groomed beard) sitting on the golden red-velvet throne, wearing the white T-shirt with lavender sleeves — match the last frame of the previous clip exactly.
> 0.0–4.3 s: he grabs the T-shirt at his shoulder and pulls it up and off over his head in one move. As the fabric passes his face and comes away, he is revealed already wearing a sharp, perfectly tailored black suit with a crisp white open-collar shirt (match reference R3). The T-shirt is tossed out of frame. Natural cloth physics.
> 4.3–7.7 s: he talks calmly in the black suit on the throne, still in the plain grey room.
> At 7.9 s, exactly on his finger snap: the grey walls crack into thousands of floating green leaves and golden light particles that blow away in a gust of wind over about one second, revealing a lush sunlit rainforest all around him — giant monstera and banana leaves, hanging vines, soft mist, warm golden light rays through the canopy (match reference R3). He and the throne stay exactly in place.
> 9.0 s to end: he sits in the jungle, completely unbothered, talking calmly. Leaves sway gently; light rays shimmer.

### HF3: Jungle hold (`HF3_jungle_explain.mp4`, 24.7 s)
Image references: last frame of HF2, R3

> [continuity block]
>
> The whole clip: he sits on the golden red-velvet throne in the sunlit rainforest, in the hero look (aviator sunglasses, styled hair, groomed beard) and the black suit with white open-collar shirt — match the last frame of the previous clip exactly. He explains something calmly and friendly, with his natural hand gestures from the source video.
> Environment motion only, subtle and continuous: leaves swaying in a light breeze, soft drifting mist, golden light rays slowly shifting, tiny dust particles glowing in the light. At around 10 s, a single bright blue morpho butterfly drifts slowly across the frame behind his shoulder (never in front of his face). Keep the background calm so his face and gestures stay the focus.
> Keep the lower third of the frame visually simple (on-screen step cards will be added there in the edit).
> No other changes; his appearance must stay perfectly consistent for the full 24 seconds.

### HF4: Jungle → final snap (`HF4_jungle_snapback.mp4`, 8.3 s)
Image references: last frame of HF3, R3

> [continuity block]
>
> 0.0–8.0 s: same as before — he sits on the golden throne in the sunlit rainforest, hero look, black suit, talking calmly and leaning in slightly like a friendly warning. Gentle leaf movement and light rays.
> At 8.0–8.3 s he raises his hand and snaps: on the snap, a sharp white flash fills the frame for 2 frames (the clip ends on the flash).
> Keep everything else identical to the previous clip.

*(In the edit, cut from the flash straight to the original footage at 0:58.80, the real room and white tee, and drop all sound for 0.5 s.)*

---

## 5. If a result goes wrong

| Problem | Fix |
|---|---|
| Face changes or drifts | Add R2/R3 again as image references; shorten the chunk; add "same person, identical face" at the start of the prompt |
| Effect happens at the wrong moment | Split the chunk at the gesture (e.g. HF1 into 0–6.4 s and 6.4–13.45 s) and generate each with one effect |
| Mask or shirt pull looks fake | Generate the transform as its own 4–5 s chunk; describe the hand motion more literally ("right hand grips under the jaw, pulls upward") |
| Lip movement no longer matches | Keep `video_edit` mode (not text-to-video), keep the source clip unchanged, and use your original audio in the edit |
| Jungle flickers between chunks | Always use the previous chunk's last frame as a reference; keep "match the last frame exactly" in the prompt |

## 6. Putting it back together

1. Lay HF1–HF4 back on the timeline at 0:00, 0:13.45, 0:25.85 and 0:50.50. Use the original footage from 0:58.80.
2. Mute the generated audio and use the rough cut's voice track.
3. Add SFX:
   - snaps: a snap and a deep whoomp
   - mask: a rubber peel
   - shirt: a cloth whoosh
   - jungle: wind, leaves and birds
   - final snap: silence for 0.5 s, then soft piano
4. Add the step cards in the lower third during HF3 (0:29–0:47), and the end card.
