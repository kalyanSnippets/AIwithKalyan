#!/usr/bin/env python3
"""Contact sheets of every shot in a clip (from an ffmpeg scene-detect metadata file).
usage: shot-sheet.py <video> <scenes.txt> <out_prefix> [--cols 6 --rows 5]
Writes <out_prefix>_NN.jpg sheets (one frame from the middle of each shot, labelled with its in-out time)
and <out_prefix>.json [{n, t0, t1}]."""
import json, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
vid, sc, pre = sys.argv[1:4]
cols, rows = 6, 5
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vid],
                           capture_output=True, text=True).stdout)
cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", open(sc).read())]
b = [0.0] + cuts + [dur]
shots = [{"n": i, "t0": round(b[i], 2), "t1": round(b[i + 1], 2)} for i in range(len(b) - 1) if b[i + 1] - b[i] > 0.4]
json.dump(shots, open(pre + ".json", "w"), indent=1)
W, H = 320, 180
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except Exception: font = ImageFont.load_default()
per = cols * rows
for p in range(0, len(shots), per):
    sheet = Image.new("RGB", (cols * W, rows * H), "black"); d = ImageDraw.Draw(sheet)
    for k, s in enumerate(shots[p:p + per]):
        t = (s["t0"] + s["t1"]) / 2
        img = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", vid, "-frames:v", "1",
                              "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2",
                              "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
        import io
        im = Image.open(io.BytesIO(img)).convert("RGB")
        x, y = (k % cols) * W, (k // cols) * H; sheet.paste(im, (x, y))
        lab = f"#{s['n']} {s['t0']:.1f}-{s['t1']:.1f}"
        d.rectangle([x, y, x + 8 + 9 * len(lab), y + 22], fill=(0, 0, 0)); d.text((x + 4, y + 2), lab, fill=(255, 220, 0), font=font)
    sheet.save(f"{pre}_{p // per:02d}.jpg", quality=80)
print(len(shots), "shots")
