#!/usr/bin/env python3
"""Find expressive, sharp, eye-contact frames of the creator in his own footage.

    python3 scripts/faces.py <video> <out.json> [--fps 1] [--model models/face_landmarker.task]
        [--from 0 --to 600] [--top 6]

Scores each sampled frame with MediaPipe FaceLandmarker blendshapes:
  surprise = jawOpen + browInnerUp + eyeWide   (good for "shock/curiosity" thumbnails)
  smile    = mouthSmile                          (good for "it worked" thumbnails)
  focus    = 1 - strongest eye look-away         (eye contact with the lens)
  sharp    = variance of the Laplacian on the face crop (motion blur rejection)
Writes the top frames per expression with timestamps; extract them with `studio frames`.
Never synthesises or alters a face — it only selects real frames.
"""
import json
import subprocess
import sys

import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

a = sys.argv[1:]
video, out = a[0], a[1]
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
fps, model, t0, t1, top = opt("--fps", 1.0), opt("--model", "models/face_landmarker.task"), opt("--from", 0.0), opt("--to", 0.0), opt("--top", 6)

W, H = 960, 540
cmd = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-to", str(t1)] if t1 else []) + ["-i", video, "-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=mpp.BaseOptions(model_asset_path=model, delegate=mpp.BaseOptions.Delegate.CPU),
    output_face_blendshapes=True, num_faces=1))
rows, k = [], 0
while True:
    buf = proc.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    t = t0 + k / fps
    k += 1
    arr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    res = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=arr))
    if not res.face_blendshapes:
        continue
    b = {c.category_name: c.score for c in res.face_blendshapes[0]}
    pts = np.array([[p.x * W, p.y * H] for p in res.face_landmarks[0]])
    x0, y0 = pts.min(0).astype(int); x1, y1 = pts.max(0).astype(int)
    crop = arr[max(0, y0):y1, max(0, x0):x1].mean(axis=2)
    sharp = float(np.var(np.diff(crop, n=2, axis=0))) if crop.shape[0] > 4 else 0.0
    away = max(b["eyeLookOutLeft"], b["eyeLookInLeft"], b["eyeLookOutRight"], b["eyeLookInRight"], b["eyeLookUpLeft"], b["eyeLookDownLeft"])
    rows.append({"t": round(t, 2), "surprise": round(b["jawOpen"] + b["browInnerUp"] + (b["eyeWideLeft"] + b["eyeWideRight"]) / 2, 3),
                 "smile": round((b["mouthSmileLeft"] + b["mouthSmileRight"]) / 2, 3), "focus": round(1 - away, 3), "sharp": round(sharp, 1),
                 "blink": round((b["eyeBlinkLeft"] + b["eyeBlinkRight"]) / 2, 3), "faceBox": {"x": int(x0 * 2), "y": int(y0 * 2), "w": int((x1 - x0) * 2), "h": int((y1 - y0) * 2)}})
if not rows:
    sys.exit("no faces found")
sh = np.array([r["sharp"] for r in rows]); sh_ok = np.percentile(sh, 40)
ok = [r for r in rows if r["blink"] < 0.35 and r["sharp"] >= sh_ok and r["focus"] > 0.55]
pick = lambda key: sorted(ok, key=lambda r: r[key] + 0.5 * r["focus"], reverse=True)[:top]
result = {"video": video, "frames": len(rows), "usable": len(ok), "surprise": pick("surprise"), "smile": pick("smile"), "neutral": sorted(ok, key=lambda r: r["focus"] - r["surprise"] * 0.3, reverse=True)[:top]}
json.dump(result, open(out, "w"), indent=1)
print(json.dumps({k: [r["t"] for r in result[k]] for k in ("surprise", "smile", "neutral")}))
