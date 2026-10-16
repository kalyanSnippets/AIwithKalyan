#!/usr/bin/env python3
"""Find stretches where the speaker looks away from the lens.

    python3 scripts/gaze.py <video> <model.task> <out.json> [--fps 5] [--ranges ranges.json] [--margin 0.18]

Uses MediaPipe FaceLandmarker eye-look blendshapes (in/out/up/down per eye). Each frame gets an
off-gaze score = strongest look-away blendshape; frames above (median + margin) for >= 0.4 s are
reported as windows (seconds on the video's own timeline). With --ranges, only frames inside those
[{start,end}] ranges are analysed (e.g. the kept parts of an edit).
"""
import json
import subprocess
import sys

import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

args = sys.argv[1:]
video, model, out = args[0], args[1], args[2]
fps = float(args[args.index("--fps") + 1]) if "--fps" in args else 5.0
ranges = json.load(open(args[args.index("--ranges") + 1])) if "--ranges" in args else None
margin = float(args[args.index("--margin") + 1]) if "--margin" in args else 0.18

W, H = 640, 360
proc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={fps},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
lm = vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(
        base_options=mpp.BaseOptions(model_asset_path=model, delegate=mpp.BaseOptions.Delegate.CPU),
        output_face_blendshapes=True,
        running_mode=vision.RunningMode.IMAGE,
        num_faces=1,
    )
)
keys = ["eyeLookOutLeft", "eyeLookInLeft", "eyeLookUpLeft", "eyeLookDownLeft",
        "eyeLookOutRight", "eyeLookInRight", "eyeLookUpRight", "eyeLookDownRight"]
times, scores = [], []
k = 0
inside = lambda t: ranges is None or any(r["start"] <= t <= r["end"] for r in ranges)
while True:
    buf = proc.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    t = k / fps
    k += 1
    if not inside(t):
        continue
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.frombuffer(buf, np.uint8).reshape(H, W, 3))
    res = lm.detect(img)
    if not res.face_blendshapes:
        times.append(t); scores.append(1.0)  # no face found → treat as away
        continue
    b = {c.category_name: c.score for c in res.face_blendshapes[0]}
    # pair the eyes so a symmetric glance (both looking left) counts once
    horiz = max((b["eyeLookOutLeft"] + b["eyeLookInRight"]) / 2, (b["eyeLookInLeft"] + b["eyeLookOutRight"]) / 2)
    vert = max((b["eyeLookUpLeft"] + b["eyeLookUpRight"]) / 2, (b["eyeLookDownLeft"] + b["eyeLookDownRight"]) / 2)
    times.append(t); scores.append(max(horiz, vert))
    if k % 500 == 0:
        print(f"{t:.0f}s analysed", file=sys.stderr)

s = np.array(scores)
base = float(np.median(s))
thr = base + max(margin, 2.5 * float(np.median(np.abs(s - base))))
away = s > thr
windows, start = [], None
for i, (t, a) in enumerate(zip(times, away)):
    contiguous = i > 0 and t - times[i - 1] <= 1.5 / fps
    if a and start is None:
        start = t
    if start is not None and (not a or not contiguous):
        end = times[i - 1] + 1 / fps if not contiguous else t
        if end - start >= 0.4:
            windows.append({"start": round(start, 2), "end": round(end, 2), "peak": round(float(s[(np.array(times) >= start) & (np.array(times) < end)].max()), 3)})
        start = t if (a and not contiguous) else None
if start is not None and times[-1] - start >= 0.4:
    windows.append({"start": round(start, 2), "end": round(times[-1] + 1 / fps, 2), "peak": 1.0})
json.dump({"fps": fps, "baseline": round(base, 3), "threshold": round(thr, 3), "frames": len(times), "windows": windows, "scores": [[round(t, 2), round(float(v), 3)] for t, v in zip(times, s)]}, open(out, "w"), indent=1)
print(f"frames {len(times)}  baseline {base:.3f}  threshold {thr:.3f}  look-away windows {len(windows)} ({sum(w['end'] - w['start'] for w in windows):.1f} s)")
