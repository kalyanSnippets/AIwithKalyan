#!/usr/bin/env python3
"""Detect and track people / vehicles in a clip for HUD overlays (MediaPipe ObjectDetector + IoU tracker).

  python3 scripts/track-objects.py <clip.mp4> <model.tflite> <out.json> [--fps 15] [--classes person,car,truck,motorcycle,bus] [--min 0.35]

Output: {"w":1920,"h":1080,"fps":15,"tracks":[{"id":1,"cls":"car","frames":[[t,x,y,w,h,score],...]}]}
Coordinates are in pixels of the source frame. Tracks shorter than 0.5 s are dropped; boxes are lightly smoothed.
"""
import json, subprocess, sys
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

clip, model, out = sys.argv[1:4]
A = sys.argv[4:]
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
FPS = float(opt("--fps", "15")); CLS = opt("--classes", "person,car,truck,motorcycle,bus").split(","); MIN = float(opt("--min", "0.35"))
W, H = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", clip], capture_output=True, text=True).stdout.strip().split(","))
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", clip, "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
det = vision.ObjectDetector.create_from_options(vision.ObjectDetectorOptions(base_options=mpp.BaseOptions(model_asset_path=model), score_threshold=MIN, max_results=25, running_mode=vision.RunningMode.IMAGE))

def iou(a, b):
    ax2, ay2, bx2, by2 = a[0] + a[2], a[1] + a[3], b[0] + b[2], b[1] + b[3]
    iw, ih = max(0, min(ax2, bx2) - max(a[0], b[0])), max(0, min(ay2, by2) - max(a[1], b[1]))
    inter = iw * ih; return inter / (a[2] * a[3] + b[2] * b[3] - inter + 1e-9)

tracks, nid = [], 1
for k, f in enumerate(frames):
    t = round(k / FPS, 3)
    res = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(f)))
    dets = []
    for d in res.detections:
        c = d.categories[0]
        if c.category_name in CLS: b = d.bounding_box; dets.append((c.category_name, [b.origin_x, b.origin_y, b.width, b.height], c.score))
    used = set()
    for tr in tracks:
        if tr["last"] < t - 0.4: continue
        best, bi = 0.25, None
        for i, (cn, box, sc) in enumerate(dets):
            if i in used or cn != tr["cls"]: continue
            v = iou(tr["frames"][-1][1:5], box)
            if v > best: best, bi = v, i
        if bi is not None:
            used.add(bi); cn, box, sc = dets[bi]; tr["frames"].append([t, *box, round(sc, 2)]); tr["last"] = t
    for i, (cn, box, sc) in enumerate(dets):
        if i not in used: tracks.append({"id": nid, "cls": cn, "frames": [[t, *box, round(sc, 2)]], "last": t}); nid += 1
out_tracks = []
for tr in tracks:
    fr = np.array(tr["frames"], float)
    if fr[-1, 0] - fr[0, 0] < 0.5: continue
    for j in range(1, 5):  # light smoothing
        fr[:, j] = np.convolve(np.pad(fr[:, j], 1, mode="edge"), np.ones(3) / 3, mode="valid")
    out_tracks.append({"id": tr["id"], "cls": tr["cls"], "frames": [[round(x, 3) if i == 0 else round(x, 1) for i, x in enumerate(r)] for r in fr.tolist()]})
json.dump({"w": W, "h": H, "fps": FPS, "tracks": out_tracks}, open(out, "w"))
print(f"{len(frames)} frames, {len(out_tracks)} tracks:", [(t['id'], t['cls'], len(t['frames'])) for t in out_tracks][:20])
