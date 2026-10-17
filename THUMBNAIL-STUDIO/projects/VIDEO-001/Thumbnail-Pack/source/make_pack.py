"""Builds the five Thumbnail-Pack specs (layered, editable JSON) for VIDEO-001.

Every image is a real frame from Kalyan's footage, the finished video, its sample short or his
screen recordings. The Claude wordmark is the official SVG from claude.com (assets/logo/SOURCE.md).
Run from the studio root:  python3 projects/VIDEO-001/Thumbnail-Pack/source/make_pack.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "specs")
os.makedirs(OUT, exist_ok=True)

A = "Thumbnail-Pack/assets/"
CORAL, INK, WHITE = "#E8775F", "#0B0B12", "#FFFFFF"
SHADOW = "0 6px 30px rgba(0,0,0,.65)"

CUT = {  # cutout size and face box (from assets/cutouts/<name>.json)
    "k121": dict(src="assets/cutouts/kalyan-k121.png", W=3427, H=2002, fx=1592, fy=384, fw=792, fh=812),
    "k330": dict(src="assets/cutouts/kalyan-k330.png", W=3431, H=1982, fx=1523, fy=364, fw=796, fh=837),
    "k45": dict(src="assets/cutouts/kalyan-k45.png", W=3413, H=1974, fx=1461, fy=332, fw=763, fh=844),
}


def face(name, face_x, face_y, face_h, **extra):
    """Place a cutout so its face box lands at (face_x, face_y) with height face_h."""
    c = CUT[name]
    s = face_h / c["fh"]
    layer = dict(id="face", type="image", role="face", src=c["src"],
                 x=round(face_x - c["fx"] * s), y=round(face_y - c["fy"] * s),
                 w=round(c["W"] * s), h=round(c["H"] * s), fit="contain", overflow="visible",
                 faceBox=dict(x=round(face_x), y=round(face_y), w=round(c["fw"] * s), h=round(face_h)),
                 canva="separate")
    layer.update(extra)
    return layer


def wordmark(x, y, w, **extra):
    h = round(w * 196 / 900)
    return dict(id="claude-wordmark", type="image", role="logo", src=A + "logo/claude-wordmark.png",
                x=x, y=y, w=w, h=h, fit="contain", canva="separate", **extra)


BG = f"radial-gradient(900px 600px at 75% 30%, rgba(232,119,95,.22), transparent 70%), radial-gradient(800px 600px at 0% 100%, rgba(90,100,255,.16), transparent 70%), {INK}"

specs = []

# 01 BEFORE VS AFTER: the real raw teleprompter frame next to the real Claude-edited frame.
specs.append(dict(
    option="01", file="thumbnail-01-before-after", archetype="Before vs After", headline="RAW → EDITED",
    story="The same 41 s clip before and after the Claude Code + HyperFrames workflow: plain raw take on the left, the edited short with motion graphics on the right.",
    evidence=["compositions/CLD_1279/media/sample-raw.mp4 @ 36 s (raw take, shown at 0:38 of the final video)",
              "compositions/CLD_1279/media/sample-edited.mp4 @ 21 s (Claude-edited short, shown at 0:54 and 8:13–8:55)"],
    layers=[
        dict(id="bg", type="fill", role="background", background=BG),
        dict(id="raw-card", type="image", role="evidence", src=A + "frames/raw-36.png", x=36, y=30, w=372, h=660, radius=26,
             border="3px solid rgba(255,255,255,.35)", shadow="0 24px 60px rgba(0,0,0,.6)", filter="saturate(.9)"),
        dict(id="edited-card", type="image", role="focal", src=A + "frames/edited-21.png", x=872, y=30, w=372, h=660, radius=26,
             border=f"4px solid {CORAL}", shadow="0 0 60px rgba(232,119,95,.55), 0 24px 60px rgba(0,0,0,.6)"),
        dict(id="h-raw", type="text", role="headline", text="RAW", x=452, y=132, size=150, color=WHITE, shadow=SHADOW, align="center", w=376),
        dict(id="arrow", type="icon", name="arrow-right", x=580, y=300, w=120, h=120, color=CORAL, stroke=3),
        dict(id="h-edited", type="text", role="headline", text="EDITED", x=440, y=452, size=100, color=INK, align="center", w=400, bg=dict(color=CORAL, padX=18, padY=8, radius=14)),
    ]))

# 02 AI EDITOR EXPERIMENT: sceptical face, official Claude wordmark, real HyperFrames timeline.
specs.append(dict(
    option="02", file="thumbnail-02-ai-editor", archetype="Experiment / face + tool", headline="AI EDITOR?!",
    story="Kalyan's genuine sceptical look (2:01 of the raw take) next to the real editing timeline Claude Code built in HyperFrames Studio.",
    evidence=["media/raw CLD_1279 @ 121 s (face, unaltered cutout)",
              "Screen Recording 2026-10-09 at 1.32.59 pm @ 78 s (HyperFrames Studio timeline of the sample short)",
              "Claude wordmark from claude.com"],
    layers=[
        dict(id="bg", type="fill", role="background", background=BG),
        dict(id="glow", type="shape", x=700, y=0, w=620, h=620, radius=310,
             background="radial-gradient(circle, rgba(232,119,95,.5), rgba(232,119,95,0) 68%)"),
        dict(id="timeline", type="image", role="evidence", src=A + "screens/hf-timeline.png", x=24, y=470, w=820, h=196, radius=16,
             border="2px solid rgba(255,255,255,.4)", shadow="0 20px 50px rgba(0,0,0,.6)", rotate=-2, position="left top"),
        face("k121", 830, 92, 330, filter="drop-shadow(0 0 20px rgba(232,119,95,.5)) contrast(1.05)"),
        wordmark(50, 46, 300),
        dict(id="headline", type="text", role="headline", text="AI\nEDITOR?!", x=46, y=140, size=150, color=WHITE,
             highlight=[dict(word="?!", color=CORAL)], shadow=SHADOW, lineHeight=0.92),
    ]))

# 03 THE RESULT: the finished Claude-edited short as hero (three real frames).
specs.append(dict(
    option="03", file="thumbnail-03-final-result", archetype="Result reveal", headline="THE RESULT",
    story="What came out of the workflow: three real frames from the finished 41.8 s short (motion graphics, PiP, captions), no added claims.",
    evidence=["compositions/CLD_1279/media/sample-edited.mp4 @ 15 s (hero), 21 s, 27 s (shown in full at 8:13–8:55 of the final video)"],
    layers=[
        dict(id="bg", type="fill", role="background", background=f"radial-gradient(800px 560px at 70% 50%, rgba(232,119,95,.30), transparent 70%), {INK}"),
        dict(id="frame-l", type="image", role="evidence", src=A + "frames/edited-27.png", x=600, y=96, w=280, h=498, radius=22, rotate=-7,
             border="3px solid rgba(255,255,255,.3)", shadow="0 24px 60px rgba(0,0,0,.7)", opacity=0.95),
        dict(id="frame-r", type="image", role="evidence", src=A + "frames/edited-21.png", x=960, y=96, w=280, h=498, radius=22, rotate=7,
             border="3px solid rgba(255,255,255,.3)", shadow="0 24px 60px rgba(0,0,0,.7)", opacity=0.95),
        dict(id="frame-hero", type="image", role="focal", src=A + "frames/edited-15.png", x=718, y=36, w=344, h=612, radius=26,
             border=f"4px solid {CORAL}", shadow="0 0 70px rgba(232,119,95,.6), 0 30px 70px rgba(0,0,0,.7)"),
        dict(id="kicker", type="text", role="detail", text="CLAUDE-EDITED SHORT", x=56, y=196, size=40, color=INK, font="heavy",
             bg=dict(color=CORAL, padX=16, padY=8, radius=10), letterSpacing="0.02em"),
        dict(id="headline", type="text", role="headline", text="THE\nRESULT", x=48, y=272, size=132, color=WHITE, shadow=SHADOW, lineHeight=0.9),
    ]))

# 04 HUMAN VS AI: Kalyan | Claude Code panel, joined by the real HyperFrames timeline.
specs.append(dict(
    option="04", file="thumbnail-04-human-vs-ai", archetype="Comparison", headline="ME vs AI",
    story="A neutral face-off: Kalyan (the creative decisions) against Claude Code's real 'Review version v1… stopped here for your feedback' panel. Nobody is shown winning.",
    evidence=["media/raw CLD_1279 @ 330 s (face)",
              "Screen Recording 2026-10-09 at 12.37.52 pm @ 5 s (Claude Code review v1 panel, sidebar cropped out)",
              "Screen Recording 2026-10-09 at 1.32.59 pm @ 78 s (timeline)"],
    layers=[
        dict(id="bg-left", type="shape", x=0, y=0, w=640, h=720, background="linear-gradient(160deg,#1b1b2a,#0b0b12)"),
        dict(id="bg-right", type="shape", x=640, y=0, w=640, h=720,
             background="radial-gradient(600px 500px at 60% 40%, rgba(232,119,95,.28), transparent 70%), #120d10"),
        dict(id="cc-panel", type="image", role="evidence", src=A + "screens/cc-review-mid.png", x=690, y=150, w=548, h=411, radius=18,
             border=f"3px solid {CORAL}", shadow="0 24px 60px rgba(0,0,0,.7)", position="left top"),
        dict(id="timeline", type="image", role="evidence", src=A + "screens/hf-timeline.png", x=690, y=586, w=548, h=118, radius=14,
             border="2px solid rgba(255,255,255,.35)", position="left top"),
        face("k330", 205, 150, 300, filter="contrast(1.05)"),
        dict(id="divider", type="shape", x=636, y=0, w=8, h=720, background=f"linear-gradient({CORAL},{CORAL})"),
        dict(id="h-me", type="text", role="headline", text="ME", x=40, y=26, size=128, color=WHITE, shadow=SHADOW),
        dict(id="h-vs", type="text", role="headline", text="vs", x=566, y=310, size=76, color=INK, bg=dict(color=CORAL, padX=20, padY=14, radius=60), css="filter:drop-shadow(0 0 0 #0B0B12) drop-shadow(0 10px 30px rgba(0,0,0,.6));"),
        dict(id="h-ai", type="text", role="headline", text="AI", x=1080, y=10, size=128, color=WHITE, shadow=SHADOW),
        wordmark(698, 44, 300),
    ]))

# 05 MINIMAL PREMIUM: one subject (the real Claude Code panel), cinematic light, negative space.
specs.append(dict(
    option="05", file="thumbnail-05-minimal", archetype="Minimal premium", headline="CAN IT EDIT?",
    story="Just the question and the real Claude Code panel reporting its rough cut and review version, lit like a product shot.",
    evidence=["Screen Recording 2026-10-09 at 12.37.52 pm @ 5 s (Claude Code panel: 'Rough cut is done… Review version v1')"],
    layers=[
        dict(id="bg", type="fill", role="background",
             background="radial-gradient(700px 520px at 78% 48%, rgba(232,119,95,.38), transparent 68%), radial-gradient(1200px 700px at 30% 120%, rgba(40,40,80,.5), transparent 70%), #07070b"),
        dict(id="panel", type="image", role="focal", src=A + "screens/cc-review-mid.png", x=640, y=96, w=720, h=540, radius=20,
             border="2px solid rgba(255,255,255,.28)", shadow="0 0 90px rgba(232,119,95,.45), 0 40px 80px rgba(0,0,0,.8)",
             css="transform:perspective(1400px) rotateY(-14deg) rotateX(3deg);", position="left top"),
        wordmark(60, 70, 220),
        dict(id="headline", type="text", role="headline", text="CAN IT\nEDIT?", x=56, y=210, size=158, color=WHITE, shadow=SHADOW,
             highlight=[dict(word="EDIT?", color=CORAL)], lineHeight=0.9),
    ]))

for s in specs:
    with open(os.path.join(OUT, s["file"] + ".json"), "w") as f:
        json.dump(s, f, indent=1, ensure_ascii=False)
print("wrote", len(specs), "specs to", OUT)
