"""OCR index of screen-recording ranges: what text is on screen, where, and when.
Lets a shot sync to the narration: "when I say 'type hi', jump to the moment 'hi' appears and zoom on it".
Output: /tmp/fcc-style/ocr_<key>_<a>_<b>.json  -> [[t, text, x0, y0, x1, y1], ...] (box normalised 0..1)
Usage: python3 edits/fcc_ocr_index.py 142752:0:770 145317:0:610 ...
"""
import json, os, subprocess, sys
import numpy as np
from rapidocr_onnxruntime import RapidOCR
sys.path.insert(0, os.path.dirname(__file__))
FILES = None
import importlib.util
_s = importlib.util.spec_from_file_location('parts', os.path.join(os.path.dirname(__file__), 'free-claude-code.parts.py'))
_p = importlib.util.module_from_spec(_s); _s.loader.exec_module(_p); FILES = _p.FILES
ocr = RapidOCR()
STEP = float(os.environ.get('OCR_STEP', '1.0'))
for spec in sys.argv[1:]:
    key, a, b = spec.split(':'); a, b = float(a), float(b)
    out = f'/tmp/fcc-style/ocr_{key}_{a:g}_{b:g}.json'
    if os.path.exists(out): print('cached', out); continue
    w0, h0 = [int(x) for x in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of',
                                             'csv=p=0', FILES[key]], capture_output=True, text=True).stdout.strip().split(',')[:2]]
    sw = 1280; sh = int(round(h0 * sw / w0 / 2) * 2)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', FILES[key], '-vf', f'fps=1/{STEP},scale={sw}:{sh}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw, 3)
    rows = []
    for i, fr in enumerate(frames):
        res, _ = ocr(fr)
        for box, text, conf in (res or []):
            if float(conf) < 0.6: continue
            xs = [p[0] for p in box]; ys = [p[1] for p in box]
            rows.append([round(a + i * STEP, 2), text, round(min(xs) / sw, 4), round(min(ys) / sh, 4), round(max(xs) / sw, 4), round(max(ys) / sh, 4)])
    json.dump(rows, open(out, 'w'))
    print(key, a, b, len(frames), 'frames', len(rows), 'texts', flush=True)
