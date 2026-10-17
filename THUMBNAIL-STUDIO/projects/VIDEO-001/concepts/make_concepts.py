#!/usr/bin/env python3
"""VIDEO-001 concept specs (A–E). Positions are computed from the real cutout face boxes so the
face lands exactly where each layout wants it. Re-run after changing a concept; bump "revision"."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, "..", *a)
cut = lambda name: json.load(open(P("assets", "cutouts", f"{name}.json")))
REV = json.load(open(os.path.join(HERE, "revisions.json"))) if os.path.exists(os.path.join(HERE, "revisions.json")) else {}

def place(name, face_h, face_cx, face_top):
    m = cut(name); s = face_h / m["face"]["h"]
    W, H = m["size"][0] * s, m["size"][1] * s
    x = face_cx - (m["face"]["x"] + m["face"]["w"] / 2) * s
    y = face_top - m["face"]["y"] * s
    fb = {"x": round(x + m["face"]["x"] * s), "y": round(y + m["face"]["y"] * s), "w": round(m["face"]["w"] * s), "h": round(m["face"]["h"] * s)}
    return {"x": round(x), "y": round(y), "w": round(W), "h": round(H)}, fb

INK = "#0B0B12"; CORAL = "#E8775F"; WHITE = "#FFFFFF"; GREEN = "#4CD68A"; RED = "#FF4D4F"
TITLE = "I Let Claude Code Edit My Entire YouTube Video"
SHADOW = "0 6px 24px rgba(0,0,0,.65)"
base_bg = lambda glow="65% 40%": {"id": "bg", "type": "fill", "role": "background", "background": f"radial-gradient(900px 620px at {glow}, rgba(232,119,95,.28), transparent 70%), radial-gradient(700px 600px at 10% 100%, rgba(110,120,255,.20), transparent 70%), {INK}"}

concepts = {}

# ── A · Before/After: the real raw camera frame vs the real finished frame ──────────────────────
concepts["A"] = {
    "archetype": "Before/After", "headline": "RAW → EDITED",
    "story": "The same video, before and after Claude Code edited it. Left: Kalyan's untouched camera frame. Right: the finished edit's real QA screen, where all 25 automated checks passed.",
    "curiosity": "How did a plain raw recording become this, without a human editor?",
    "composition": "Hard vertical split with a thin coral seam and a round arrow badge at centre. Labels sit bottom-left on each half, clear of the duration badge. The raw half stays slightly desaturated so the edited half's bright 25/25 wins attention.",
    "evidence": "assets/frames/k330.png (raw 4K camera frame, CLD_1279 at 5:30); assets/evidence/final-486-qa-crop.png (finished edit at 8:06, the real 25/25 QA ring, cropped above the caption)",
    "background": "The two real frames are the background; nothing is generated.",
    "typography": "Two pill labels: 'RAW' (ink on white) and 'EDITED' (ink on coral, 6.5:1), in Inter Display Black at 72 px.",
    "colors": "Left is muted lavender and grey, right is the dark ink QA screen with a green progress arc and white 25/25. The coral seam and badge tie them together.",
    "canva": "Base image: both halves baked into one PNG. Labels become native Canva text so the wording can change.",
    "image_prompts": [],
    "why": ["Real transformation proof; competitors mostly show logos or timelines", "Instantly understood at feed size: two halves, an arrow and the word EDITED"],
    "risks": ["The QA ring's small check labels won't read on mobile; the big 25/25 carries it", "Before/after split layouts are common in editing videos generally"],
    "layers": [
        {"id": "raw", "type": "image", "role": "evidence", "src": "assets/frames/k330.png", "x": -330, "y": 0, "w": 1280, "h": 720, "fit": "cover", "filter": "saturate(.55) brightness(.92)", "css": "clip-path: inset(0 310px 0 330px);", "canva": "bake"},
        {"id": "edit", "type": "image", "role": "focal", "src": "assets/evidence/final-486-qa-crop.png", "x": 640, "y": 0, "w": 640, "h": 720, "fit": "cover", "canva": "bake"},
        {"id": "seam", "type": "shape", "x": 637, "y": 0, "w": 6, "h": 720, "background": CORAL, "shadow": "0 0 30px rgba(232,119,95,.9)"},
        {"id": "badge", "type": "shape", "x": 590, "y": 310, "w": 100, "h": 100, "radius": 50, "background": CORAL, "shadow": "0 8px 30px rgba(0,0,0,.5)"},
        {"id": "arrow", "type": "icon", "name": "arrow-right", "x": 612, "y": 332, "w": 56, "h": 56, "color": WHITE, "stroke": 3},
        {"id": "lab-raw", "type": "text", "role": "label", "text": "RAW", "x": 36, "y": 590, "size": 72, "color": "#1A1A22", "bg": {"color": "rgba(255,255,255,.88)", "padX": 22, "padY": 8, "radius": 14}},
        {"id": "lab-edit", "type": "text", "role": "headline", "text": "EDITED", "x": 676, "y": 590, "size": 72, "color": INK, "bg": {"color": CORAL, "padX": 22, "padY": 8, "radius": 14}, "shadow": "none"},
    ],
}

# ── B · Face + Emotion: real raised-brow expression + the one-line prompt ────────────────────────
fb_box, fb_face = place("kalyan-k121", 360, 960, 70)
concepts["B"] = {
    "archetype": "Face + Emotion", "headline": "I DIDN'T EDIT THIS",
    "story": "Kalyan reacts, half impressed and half sceptical, to a video he didn't edit himself. The edit came from one instruction to Claude Code.",
    "curiosity": "If he didn't edit it, who did, and how good is it?",
    "composition": "Face right of centre at about 50% of frame height, sharply lit, with a coral rim glow. Text block left-aligned on the left third with the prompt card above it. The face looks into the lens.",
    "evidence": "assets/frames/k121.png (genuine expression from CLD_1279 at 2:01, own footage); the prompt matches what he typed in the video",
    "background": "Dark ink with a coral glow behind the head (CSS gradient). In the Canva version, optionally the generated studio background (Canva media MAHYQV3aO4o).",
    "typography": "'I DIDN'T EDIT THIS' in Inter Display Black, two lines, 112 px, with DIDN'T in coral. The prompt card text is 36 px, secondary.",
    "colors": "Ink background, white text, one coral accent. Warm skin against the cool dark background separates the subject.",
    "canva": "Upload the face cutout separately (canva: separate) so it can be nudged. Text is native.",
    "image_prompts": ["Cinematic out-of-focus background of a dark modern video editing studio at night… (used: Canva generate-image → MAHYQV3aO4o)"],
    "why": ["A real, believable face (vidIQ penalised performative faces)", "The claim is literally true per the video ('I didn't manually edit it')", "The text poses a question the title answers ('Claude Code')"],
    "risks": ["4-word headline plus a prompt card is the busiest of the five", "Face-plus-text-on-dark is a familiar layout"],
    "layers": [
        base_bg("72% 38%"),
        {"id": "glow", "type": "shape", "x": 700, "y": 20, "w": 560, "h": 560, "radius": 280, "background": "radial-gradient(circle, rgba(232,119,95,.55), rgba(232,119,95,0) 68%)"},
        {"id": "face", "type": "image", "role": "face", "src": "assets/cutouts/kalyan-k121.png", **fb_box, "fit": "contain", "faceBox": fb_face, "filter": "drop-shadow(0 0 18px rgba(232,119,95,.55)) contrast(1.06) saturate(1.05)", "overflow": "visible", "canva": "separate"},
        {"id": "card", "type": "shape", "x": 48, "y": 92, "w": 560, "h": 104, "radius": 18, "background": "rgba(18,18,26,.92)", "border": "2px solid rgba(255,255,255,.18)", "shadow": "0 18px 50px rgba(0,0,0,.5)"},
        {"id": "prompt", "type": "text", "role": "detail", "text": "› edit my entire video", "x": 76, "y": 122, "size": 40, "font": "bold", "color": "#F6B39B", "letterSpacing": "0"},
        {"id": "head", "type": "text", "role": "headline", "text": "I DIDN'T\nEDIT THIS", "x": 44, "y": 300, "size": 116, "color": WHITE, "highlight": [{"word": "DIDN'T", "color": CORAL}], "shadow": SHADOW},
    ],
}

# ── C · Minimalist Tech: one prompt, one timeline ───────────────────────────────────────────────
thumbs = [0, 2, 4, 6, 8, 10, 12, 14]
cut_idx = {2: "x", 5: "x"}
layersC = [{"id": "bg", "type": "fill", "role": "background", "background": f"radial-gradient(1000px 500px at 50% 45%, rgba(232,119,95,.16), transparent 70%), {INK}"},
           {"id": "pill", "type": "text", "role": "label", "text": "CLAUDE CODE", "x": 92, "y": 104, "size": 40, "font": "heavy", "color": CORAL, "letterSpacing": ".08em"},
           {"id": "cmd", "type": "text", "role": "headline", "text": "› edit my video", "x": 86, "y": 176, "size": 150, "color": WHITE, "font": "display"},
           {"id": "cursor", "type": "shape", "x": 1150, "y": 196, "w": 26, "h": 130, "background": CORAL, "role": "focal"}]
for k, f in enumerate(thumbs):
    x = 92 + k * 140
    bad = k in cut_idx
    layersC.append({"id": f"t{k}", "type": "image", "role": "evidence", "src": f"@studio/projects/VIDEO-001/assets/strip/f{f}.jpg" if False else f"assets/strip/f{f}.jpg", "x": x, "y": 470, "w": 128, "h": 72, "radius": 10, "border": f"3px solid {RED if bad else 'rgba(138,160,255,.9)'}", "filter": "saturate(.35) brightness(.55)" if bad else "none", "canva": "bake"})
    if bad:
        layersC.append({"id": f"x{k}", "type": "icon", "name": "scissors", "x": x + 44, "y": 486, "w": 40, "h": 40, "color": RED, "stroke": 2.5})
layersC.append({"id": "track", "type": "shape", "x": 84, "y": 560, "w": 1112, "h": 6, "radius": 3, "background": "linear-gradient(90deg, rgba(232,119,95,.9), rgba(232,119,95,.1))"})
concepts["C"] = {
    "archetype": "Minimalist Tech", "headline": "› edit my video",
    "story": "The whole edit started as one line typed into Claude Code. The timeline underneath shows real frames from his footage, with the bad takes cut.",
    "curiosity": "Can one sentence really produce a finished video?",
    "composition": "Typographic: a huge command line across the upper half, then a filmstrip of real footage frames with two cut (red, scissors) clips, then a coral progress line. Lots of quiet space; no face.",
    "evidence": "assets/strip/*.jpg are real frames of the CLD_1279 camera footage. The command mirrors his instruction.",
    "background": "Flat ink with a faint coral bloom (CSS).",
    "typography": "The command is Inter Display Black at 150 px. 'CLAUDE CODE' is a small coral eyebrow. Total: 5 words.",
    "colors": "Near-monochrome with coral accents and red only on the cut clips.",
    "canva": "Filmstrip and shapes baked into the base; the command and eyebrow stay native text.",
    "image_prompts": [],
    "why": ["Lowest visual entropy of the set (vidIQ's most common penalty was clutter)", "Distinct from face-led thumbnails in the niche", "Readable at 320 px: a single sentence"],
    "risks": ["No face, so it may get less human attention in the feed", "Lower-case command text is less shouty than its competitors"],
    "layers": layersC,
}

# ── D · Curiosity/Mystery: who edited this? ─────────────────────────────────────────────────────
fd_box, fd_face = place("kalyan-k45", 330, 330, 120)
concepts["D"] = {
    "archetype": "Curiosity/Mystery", "headline": "WHO EDITED THIS?",
    "story": "Kalyan presents a finished, polished frame of his own video and poses the question. The title answers it: Claude Code.",
    "curiosity": "An explicit open question (vidIQ flagged a missing open question as a weakness on a reference).",
    "composition": "Kalyan on the left mid-explanation (a natural expression), the finished frame as a tilted card on the right, and a coral question badge on the card's corner. The question sits above the card.",
    "evidence": "assets/frames/k45.png (own footage, 0:45); assets/evidence/final-186.5.png (finished edit, the step 02 card)",
    "background": "Ink with a blue-left / coral-right glow (CSS).",
    "typography": "'WHO EDITED THIS?' in Inter Display Black at 92 px, white with EDITED in coral, placed over the right half.",
    "colors": "Ink, white, coral; the coral-heavy step 02 frame makes the card glow.",
    "canva": "Face cutout and finished frame are separate uploads; the question is native text.",
    "image_prompts": [],
    "why": ["Genuine curiosity gap with a truthful answer", "Shows the real finished output as the 'mystery object'"],
    "risks": ["The question format is common; it relies on the card looking impressive at small size", "The face is smaller than in B"],
    "layers": [
        base_bg("80% 45%"),
        {"id": "face", "type": "image", "role": "face", "src": "assets/cutouts/kalyan-k45.png", **fd_box, "fit": "contain", "faceBox": fd_face, "filter": "drop-shadow(0 0 16px rgba(110,120,255,.45)) contrast(1.05)", "overflow": "visible", "canva": "separate"},
        {"id": "card", "type": "image", "role": "focal", "src": "assets/evidence/final-186.5.png", "x": 640, "y": 250, "w": 600, "h": 338, "radius": 22, "rotate": 3, "border": "4px solid rgba(255,255,255,.85)", "shadow": "0 30px 80px rgba(0,0,0,.6)", "canva": "separate"},
        {"id": "qbadge", "type": "shape", "x": 1150, "y": 210, "w": 104, "h": 104, "radius": 52, "background": CORAL, "shadow": "0 10px 30px rgba(0,0,0,.5)"},
        {"id": "q", "type": "text", "role": "detail", "text": "?", "x": 1180, "y": 216, "size": 88, "color": WHITE},
        {"id": "head", "type": "text", "role": "headline", "text": "WHO EDITED\nTHIS?", "x": 650, "y": 36, "size": 96, "color": WHITE, "highlight": [{"word": "EDITED", "color": CORAL}], "shadow": SHADOW},
    ],
}

# ── E · AI Workflow/Result: raw in → Claude Code → finished + verified ──────────────────────────
concepts["E"] = {
    "archetype": "AI Workflow/Result", "headline": "RAW → DONE",
    "story": "The pipeline in one glance: raw footage in, Claude Code orchestrating the tools, a finished video out that passed 25/25 automated QA checks (true: the final edit's QA ring).",
    "curiosity": "What happens in the middle step, and what are the tools?",
    "composition": "Three-beat flow left to right: the raw frame card, then a Claude Code terminal tile, then the biggest element, the finished edit's real 25/25 QA screen, with a green proof badge. 'RAW → DONE' runs along the top.",
    "evidence": "assets/frames/k3.png (raw camera frame); assets/evidence/final-486-qa-crop.png (the real 25/25 QA ring in the finished edit)",
    "background": "Ink with a soft coral bloom behind the middle tile (CSS).",
    "typography": "'RAW → DONE' in Inter Display Black at 112 px. The green proof badge reads 'ALL CHECKS PASSED' at 40 px. A 'Claude Code' label sits under the terminal icon.",
    "colors": "Ink, white, coral for the process and green for verified.",
    "canva": "Cards are separate uploads; arrows, tiles and the badge are shapes; text is native.",
    "image_prompts": [],
    "why": ["Specific, verifiable proof (25/25 QA) that competitors can't claim", "Explains the 'how' the video promises"],
    "risks": ["Three objects is more than one focal point; the result card must dominate", "The 25/25 badge must stay true to the video (it is)"],
    "layers": [
        base_bg("50% 55%"),
        {"id": "raw", "type": "image", "role": "evidence", "src": "assets/frames/k3.png", "x": 36, "y": 268, "w": 330, "h": 186, "radius": 16, "filter": "saturate(.5) brightness(.85)", "border": "3px solid rgba(255,255,255,.5)", "canva": "separate"},
        {"id": "a1", "type": "icon", "name": "chevron-right", "x": 368, "y": 329, "w": 64, "h": 64, "color": CORAL, "stroke": 3.5},
        {"id": "tile", "type": "shape", "x": 430, "y": 268, "w": 200, "h": 186, "radius": 26, "background": "rgba(18,18,26,.95)", "border": f"3px solid {CORAL}", "shadow": "0 0 60px rgba(232,119,95,.5)"},
        {"id": "term", "type": "icon", "name": "square-terminal", "x": 480, "y": 284, "w": 100, "h": 100, "color": CORAL, "stroke": 2},
        {"id": "tlabel", "type": "text", "role": "detail", "text": "Claude Code", "x": 448, "y": 398, "w": 164, "size": 30, "font": "heavy", "color": WHITE, "align": "center", "letterSpacing": "0"},
        {"id": "a2", "type": "icon", "name": "chevron-right", "x": 632, "y": 329, "w": 64, "h": 64, "color": CORAL, "stroke": 3.5},
        {"id": "done", "type": "image", "role": "focal", "src": "assets/evidence/final-486-qa-crop.png", "x": 700, "y": 180, "w": 540, "h": 360, "fit": "cover", "radius": 22, "border": "4px solid rgba(255,255,255,.9)", "shadow": "0 30px 80px rgba(0,0,0,.6)", "canva": "separate"},
        {"id": "badge", "type": "text", "role": "proof", "text": "✓ ALL CHECKS PASSED", "x": 720, "y": 562, "size": 40, "font": "display", "color": "#0B0B12", "bg": {"color": GREEN, "padX": 22, "padY": 8, "radius": 14}, "letterSpacing": "0"},
        {"id": "head", "type": "text", "role": "headline", "text": "RAW → DONE", "x": 40, "y": 64, "size": 112, "color": WHITE, "highlight": [{"word": "DONE", "color": CORAL}], "shadow": SHADOW},
    ],
}

only = sys.argv[1:] or list(concepts)
for o in only:
    c = concepts[o]
    spec = {"option": o, "revision": REV.get(o, 0), "titleSynergy": TITLE, **c}
    json.dump(spec, open(os.path.join(HERE, f"{o}.json"), "w"), indent=1, ensure_ascii=False)
    print(o, c["archetype"], "rev", spec["revision"])
