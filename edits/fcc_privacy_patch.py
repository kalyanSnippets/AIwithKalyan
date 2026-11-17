#!/usr/bin/env python3
"""Blur private text that slipped into the final long video, re-encoding only the affected GOPs.

  python3 edits/fcc_privacy_patch.py <scan.json> [--dry]

scan.json: [[t, text, x0, y0, x1, y1], ...] from a 1 fps OCR scan of the master.
Steps: windows around the hits (snapped to keyframes) -> split master at those keyframes (stream copy)
-> dense OCR (every 5th frame) inside each window -> blur matched boxes (held +-5 frames) -> re-encode the window
with the master's own x264 settings -> concat everything back with stream copy -> mux the untouched audio.
"""
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
MASTER = os.environ.get('SRC', 'renders/free-claude-code-3-ways-FINAL-1080p.mp4')
OUT = os.environ.get('DST', 'renders/free-claude-code-3-ways-FINAL-1080p-v2.mp4')
STEP = int(os.environ.get('STEP', '5'))
TMP = '/tmp/fcc-priv'; os.makedirs(TMP, exist_ok=True)
W, H = 1920, 1080
TERMS = [l.strip().lower() for l in open('media/privacy_terms.txt') if l.strip()]
PRIV = re.compile(r'(sk-or|r-v1-|r-vl-|sk-[a-z0-9]{6}|nvapi|aiza|[0-9a-f]{20,}|@gmail|@[a-z0-9-]+\.(com|net|org)|users[\\/]|/keys/)', re.I)
def bad(txt): return any(k in txt.lower() for k in TERMS) or bool(PRIV.search(txt))

hits = [h for h in json.load(open(sys.argv[1])) if bad(h[1])]
kf = [float(x.strip(',')) for x in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-skip_frame', 'nokey', '-show_entries',
      'frame=pts_time', '-of', 'csv=p=0', MASTER], capture_output=True, text=True).stdout.split()]
win = []
for t in sorted(h[0] for h in hits):
    a, b = t - 2.0, t + 2.0
    a = max([k for k in kf if k <= a] or [0.0]); b = min([k for k in kf if k >= b] or [kf[-1]])
    if win and a <= win[-1][1]: win[-1][1] = max(win[-1][1], b)
    else: win.append([a, b])
print('windows:', [(round(a, 2), round(b, 2)) for a, b in win], 'total', round(sum(b - a for a, b in win), 1), 's')
if '--dry' in sys.argv: sys.exit()

cuts = sorted({x for w in win for x in w if x > 0})
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', MASTER, '-map', '0:v', '-c', 'copy', '-f', 'segment', '-segment_times',
                ','.join(f'{c - 0.01:.6f}' for c in cuts), '-reset_timestamps', '1', f'{TMP}/seg%03d.ts'], check=True)
segs = sorted(f for f in os.listdir(TMP) if f.startswith('seg') and f.endswith('.ts'))
bounds = [0.0] + cuts
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
listing = []
def nframes(pth):
    return int(subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets',
                               '-of', 'csv=p=0', pth], capture_output=True, text=True).stdout.split()[0])
starts, acc = [], 0
for f in segs: starts.append(acc / 30); acc += nframes(f'{TMP}/{f}')
print('segment starts:', [round(x, 2) for x in starts], 'total frames', acc, flush=True)
for i, f in enumerate(segs):
    start = starts[i]
    is_win = start is not None and any(abs(start - a) < 0.02 for a, b in win)
    path = f'{TMP}/{f}'
    if not is_win:
        listing.append(path); continue
    n = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames',
                            '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.split()[0])
    def frames():
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        while True:
            buf = pr.stdout.read(W * H * 3)
            if len(buf) < W * H * 3: break
            yield np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        pr.wait()
    boxes = {}
    for k, fr in enumerate(frames()):
        if k % STEP: continue
        res, _ = ocr(fr[:, :, ::-1])
        for box, txt, conf in (res or []):
            if bad(txt):
                xs = [q[0] for q in box]; ys = [q[1] for q in box]
                bx = (max(0, int(min(xs)) - 8), max(0, int(min(ys)) - 8), min(W, int(max(xs)) + 8), min(H, int(max(ys)) + 8))
                for j in range(k - STEP - 1, k + STEP + 2): boxes.setdefault(j, []).append(bx)
    print(f'{f}: start {start:.2f}s, {n} frames, {sum(1 for j in boxes if 0 <= j < n)} frames blurred', flush=True)
    outp = f'{TMP}/fix_{f}'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
                            '-x264-params', 'keyint=250:min-keyint=25:bframes=3', '-bsf:v', 'h264_mp4toannexb', '-f', 'mpegts', outp], stdin=subprocess.PIPE)
    cnt = 0
    for j, im in enumerate(frames()):
        if boxes.get(j):
            p = Image.fromarray(im)
            for x0, y0, x1, y1 in boxes[j]:
                p.paste(p.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(16)), (x0, y0))
            im = np.asarray(p)
        enc.stdin.write(im.tobytes()); cnt += 1
    assert cnt == n, (cnt, n)
    enc.stdin.close(); enc.wait()
    listing.append(outp)
with open(f'{TMP}/list.txt', 'w') as fh:
    for p in listing: fh.write(f"file '{p}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{TMP}/list.txt', '-i', MASTER, '-map', '0:v', '-map', '1:a',
                '-c', 'copy', '-movflags', '+faststart', OUT], check=True)
print('wrote', OUT)
