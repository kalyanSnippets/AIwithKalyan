#!/usr/bin/env python3
"""Estimate audio/video lip-sync offset: mouth openness (dark-pixel fraction between the mouth corners) vs voice loudness.

  python3 scripts/lipsync-check.py <video.mp4> <t0> <t1> [--audio other.wav]
Prints the lag (ms) that maximises correlation; positive = mouth moves AFTER the sound (audio early).
"""
import subprocess, sys
import cv2, numpy as np

video, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
aud = sys.argv[sys.argv.index("--audio") + 1] if "--audio" in sys.argv else video
W, H, FPS = 960, 540, 30
det = cv2.FaceDetectorYN.create("/tmp/work/models/yunet/face_detection_yunet_2023mar.onnx", "", (W, H), 0.6)
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", video, "-vf", f"scale={W}:{H},fps={FPS}", "-an", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
op = []
for im in fr:
    _, f = det.detect(im)
    if f is None or not len(f): op.append(np.nan); continue
    f = max(f, key=lambda r: r[2] * r[3])
    mx0, my0, mx1, my1 = f[10], f[11], f[12], f[13]          # mouth corners
    w = abs(mx1 - mx0); cx, cy = (mx0 + mx1) / 2, (my0 + my1) / 2
    x0, x1, y0, y1 = int(cx - w * .45), int(cx + w * .45), int(cy - w * .35), int(cy + w * .45)
    g = cv2.cvtColor(im[max(y0, 0):y1, max(x0, 0):x1], cv2.COLOR_BGR2GRAY).astype(np.float32)
    op.append(float((g < (g.mean() * 0.55)).mean()) if g.size else np.nan)
op = np.array(op); ok = ~np.isnan(op)
op = np.interp(np.arange(len(op)), np.where(ok)[0], op[ok]) if ok.sum() > 10 else op
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", aud, "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
spf = 16000 // FPS; n = min(len(op), len(a) // spf)
env = np.array([np.sqrt((a[i * spf:(i + 1) * spf] ** 2).mean()) for i in range(n)]); op = op[:n]
z = lambda x: (x - x.mean()) / (x.std() + 1e-9)
x, y = z(np.convolve(env, np.ones(3) / 3, "same")), z(np.convolve(op, np.ones(3) / 3, "same"))
res = []
for L in range(-9, 10):
    c = np.mean(x[:n - L] * y[L:]) if L >= 0 else np.mean(x[-L:] * y[:n + L]); res.append((L, c))
L, c = max(res, key=lambda r: r[1])
print(f"{t0:.0f}-{t1:.0f}s: lag {L * 1000 / FPS:+.0f} ms (corr {c:.2f}, faces found {ok.mean()*100:.0f}%)")
