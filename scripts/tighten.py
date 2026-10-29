#!/usr/bin/env python3
"""Plan tighter pauses for an edited voice track. Writes keep-ranges (frame-aligned) so audio, A-roll and graphics can all be cut identically.

  python3 scripts/tighten.py <voice48k.wav> <words.json> <t0> <t1> <out.json> [--protect a,b ...] [--within 0.15] [--sentence 0.30]
Removes the middle of every inter-word gap longer than the target, leaving `--within` seconds inside a sentence and `--sentence` at sentence ends.
"""
import json, sys, wave
import numpy as np
inp, words_p, t0, t1, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
prot = [tuple(map(float, a.split(","))) for i, a in enumerate(sys.argv) if i and sys.argv[i - 1] == "--protect"]
opt = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
WITHIN, SENT = opt("--within", 0.15), opt("--sentence", 0.30)
FPS = 30
W = [w for w in json.load(open(words_p)) if t0 - 0.5 <= w["start"] <= t1 + 0.5]
cuts = []
for a, b in zip(W, W[1:]):
    gap = b["start"] - a["end"]
    keep = SENT if a["text"].rstrip()[-1:] in ".?!" else WITHIN
    if gap < keep + 0.06: continue
    ra, rb = a["end"] + keep / 2, b["start"] - keep / 2
    if any(ra < pb and rb > pa for pa, pb in prot): continue
    if rb <= t0 or ra >= t1: continue
    # frame-align inward so we never cut into speech
    fa, fb = int(np.ceil(ra * FPS)), int(np.floor(rb * FPS))
    if fb - fa >= 2: cuts.append((fa, fb))
f0, f1 = int(round(t0 * FPS)), int(round(t1 * FPS))
keep_r, cur, newp = [], f0, 0
for fa, fb in cuts:
    if fa > cur: keep_r.append([cur, fa, newp]); newp += fa - cur
    cur = fb
if f1 > cur: keep_r.append([cur, f1, newp]); newp += f1 - cur
saved = (f1 - f0 - newp) / FPS
json.dump(dict(fps=FPS, t0=t0, t1=t1, keep=keep_r, cuts=cuts, new_len=newp / FPS, saved=saved), open(out, "w"))
print(f"{len(cuts)} cuts, {t1 - t0:.1f}s -> {newp / FPS:.1f}s (saved {saved:.1f}s)")
