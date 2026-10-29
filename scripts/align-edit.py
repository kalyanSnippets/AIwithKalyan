#!/usr/bin/env python3
"""Recover the keep-intervals of an edited audio (e.g. a Descript export) against the audio it was cut from.

  python3 scripts/align-edit.py <edited.wav> <reference.wav> <out.json>

Both 16 kHz mono. Log-mel features (per-file mean/variance normalised, so EQ / Studio Sound differences drop out),
then a DP with three states: matched, reference skipped (deleted material), edited-only (inserted material).
"""
import json, sys, wave
import numpy as np

HOP, WIN, NB = 640, 400, 32  # 40 ms hop

def load(p):
    with wave.open(p) as wf:
        return np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

def feats(x):
    n = (len(x) - WIN) // HOP
    idx = np.arange(WIN)[None, :] + HOP * np.arange(n)[:, None]
    S = np.abs(np.fft.rfft(x[idx] * np.hanning(WIN), n=512, axis=1)) ** 2
    f = np.fft.rfftfreq(512, 1 / 16000)
    mel = lambda h: 2595 * np.log10(1 + h / 700)
    ed = np.linspace(mel(80), mel(7000), NB + 2); hz = 700 * (10 ** (ed / 2595) - 1)
    fb = np.zeros((NB, len(f)))
    for b in range(NB):
        lo, c, hi = hz[b], hz[b + 1], hz[b + 2]
        fb[b] = np.clip(np.minimum((f - lo) / (c - lo), (hi - f) / (hi - c)), 0, None)
    L = np.log(S @ fb.T + 1e-7)
    L -= L.mean(0); L /= L.std(0) + 1e-6
    return L.astype(np.float32)

q, r = feats(load(sys.argv[1])), feats(load(sys.argv[2]))
nq, nr = len(q), len(r)
OPEN, EXT, QSKIP = 3.0, 0.04, 1.6
INF = np.float32(1e9)
rn = (r ** 2).sum(1)
Mm = np.full((nq, nr), INF, np.float32); Im = np.full((nq, nr), INF, np.float32)
kk = np.arange(nr, dtype=np.float32)
FORCE = [tuple(map(float, a.split(','))) for a in sys.argv[4:]]  # q ranges (s) that are inserted material
forced = lambda i: any(a <= i * HOP / 16000 < b for a, b in FORCE)
BETA = 0.0002  # prefer skipping the earlier of two repeated takes (keeps the later, cleaner one)
Mm[0] = ((q[0] ** 2).sum() + rn - 2 * r @ q[0]) / NB - BETA * kk
for i in range(1, nq):
    d = ((q[i] ** 2).sum() + rn - 2 * r @ q[i]) / NB
    pm, pi = Mm[i - 1], Im[i - 1]
    run = np.minimum.accumulate(pm - EXT * kk)                   # min_k<=j (M[i-1,k] - EXT*k)
    jump = np.full(nr, INF, np.float32); jump[2:] = run[:-2] + EXT * kk[2:] - EXT + OPEN  # k <= j-2
    best = np.full(nr, INF, np.float32)
    best[1:] = np.minimum(np.minimum(pm[:-1], pi[:-1]), jump[1:])
    Mm[i] = d - BETA * kk + best
    if forced(i): Mm[i] = INF
    Im[i] = np.minimum(pm, pi) + (0.0 if forced(i) else QSKIP)
j = int(np.argmin(np.minimum(Mm[-1], Im[-1]))); i = nq - 1
state = 0 if Mm[i, j] <= Im[i, j] else 1
path = []
while i >= 0:
    path.append((i, j, state))
    if i == 0: break
    if state == 1:
        state = 0 if Mm[i - 1, j] <= Im[i - 1, j] else 1; i -= 1
    else:
        opts = {"diag": Mm[i - 1, j - 1] if j > 0 else INF, "ins": Im[i - 1, j - 1] if j > 0 else INF}
        row = Mm[i - 1, : max(j - 1, 0)]
        if len(row):
            kv = row - EXT * np.arange(len(row)); k = int(np.argmin(kv)); opts["jump"] = kv[k] + EXT * (j - 1) + OPEN
        c = min(opts, key=opts.get)
        i -= 1
        if c == "diag": j -= 1; state = 0
        elif c == "ins": j -= 1; state = 1
        else: j = k; state = 0
path.reverse()
segs, cur = [], None
for i, j, st in path:
    if st != 0: cur = None; continue
    if cur and j == cur["r1"] + 1 and i == cur["q1"] + 1: cur["r1"], cur["q1"] = j, i
    else:
        cur = dict(q0=i, q1=i, r0=j, r1=j); segs.append(cur)
out = [dict(q0=s["q0"] * HOP / 16000, q1=(s["q1"] + 1) * HOP / 16000, r0=s["r0"] * HOP / 16000, r1=(s["r1"] + 1) * HOP / 16000) for s in segs]
ins = [(a, b) for a, b in zip([p[0] for p in path if p[2] == 1][:1], [p[0] for p in path if p[2] == 1][-1:])]
json.dump(dict(segments=out, inserted_query_frames=[p[0] for p in path if p[2] == 1]), open(sys.argv[3], "w"))
print(len(out), "segments; edited", nq * HOP / 16000, "s; reference", nr * HOP / 16000, "s; inserted frames", sum(1 for p in path if p[2] == 1))
