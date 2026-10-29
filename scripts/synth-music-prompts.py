#!/usr/bin/env python3
"""Music for the prompts section (numpy only, original): focused and building.
P1 sparse pulse + arpeggio, question = playful marimba, report = bright reveal, P2 = driving groove, build = rising sped-up arp.

  python3 scripts/synth-music-prompts.py <out.wav> <map.json>
OLD-time anchors: 322.7 349.0 357.6 372.4 388.5 404.3 413.5
"""
import json, sys, wave
import numpy as np
SR = 48000; rng = np.random.default_rng(7)
out, mp = sys.argv[1], json.load(open(sys.argv[2]))
def M(t):
    for a, b, n in mp["keep"]:
        if t < a: return n
        if t <= b: return n + (t - a)
    return mp["new_len"]
D = mp["new_len"] + 2.0; N = int(D * SR); L = np.zeros(N); R = np.zeros(N)
T = lambda n: np.arange(n) / SR
env = lambda n, a, d: np.minimum(T(n) / max(a, 1e-4), 1) * np.exp(-T(n) / d)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(x, at, g=1.0, p=0.0):
    i = int(at * SR); j = min(N, i + len(x))
    if i < 0 or i >= N: return
    a = (p + 1) * np.pi / 4; L[i:j] += x[: j - i] * g * np.cos(a); R[i:j] += x[: j - i] * g * np.sin(a)
def ep(m, dur, g, at, p=0.0):      # electric piano: fm bell + body
    n = int(dur * SR); t = T(n); f = nt(m)
    x = (np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * 2 * t)) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.08)) * env(n, 0.004, dur / 3)
    add(x, at, g, p)
def bass(m, dur, g, at):
    n = int(dur * SR); t = T(n); f = nt(m); x = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.01, dur * 0.6); add(x, at, g)
def pluck(m, g, at, p=0.0):
    n = int(0.35 * SR); t = T(n); f = nt(m); x = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.05) + 0.15 * np.sign(np.sin(2 * np.pi * f * t))) * env(n, 0.002, 0.09); add(x, at, g, p)
def tick(at, g, hi=True):
    n = int(0.03 * SR); x = rng.standard_normal(n); x = np.diff(x, prepend=0) if hi else x; add(x * np.exp(-T(n) / 0.008) * 0.4, at, g, rng.uniform(-.4, .4))
def kick(at, g):
    n = int(0.28 * SR); t = T(n); x = np.sin(2 * np.pi * (50 + 90 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.12); add(x, at, g)

A = {k: M(v) for k, v in dict(p1=322.0, q=349.0, apps=357.6, rep=372.4, p2=388.5, bld=404.3).items()}; END = mp["new_len"]
def seg_of(t):
    return "p1" if t < A["q"] else "q" if t < A["rep"] else "rep" if t < A["p2"] else "p2" if t < A["bld"] else "bld"
bpm = 104; beat = 60 / bpm; k = 0
chp = {"p1": [[52, 59, 64], [48, 55, 60], [50, 57, 62], [47, 54, 59]], "q": [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]], "rep": [[64, 67, 71], [60, 64, 67], [57, 60, 64], [59, 62, 66]], "p2": [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], "bld": [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]]}
bar = 0
while bar * 4 * beat < END:
    at0 = bar * 4 * beat; sg = seg_of(at0); ch = chp[sg][bar % 4]
    for i, m in enumerate(ch): ep(m + (0 if sg != "p1" else -12), 2.4, {"p1": 0.04, "q": 0.045, "rep": 0.055, "p2": 0.05, "bld": 0.05}[sg], at0 + i * 0.012, (i - 1) * 0.3)
    root = ch[0] - 24
    for b in range(4):
        if sg == "p1" and b % 2: continue
        bass(root + (12 if b == 3 and sg in ("p2", "bld") else 0), beat * 0.85, {"p1": 0.12, "q": 0.12, "rep": 0.14, "p2": 0.16, "bld": 0.16}[sg], at0 + b * beat)
    n8 = 16 if sg in ("p1", "bld") else 8
    for e in range(n8):
        m = ch[[0, 1, 2, 1][e % 4]] + (12 if e % 8 >= 4 else 0) + (12 if sg == "bld" else 0)
        if sg != "rep" or e % 2 == 0: pluck(m, 0.04 if sg != "bld" else 0.05, at0 + e * 4 * beat / n8, np.sin(e) * 0.4)
    if sg in ("p2", "bld", "rep"):
        for b in range(4): kick(at0 + b * beat, 0.07 if sg != "rep" else 0.045)
    if sg in ("q", "p2", "bld"):
        for e in range(8): tick(at0 + e * beat / 2, 0.035 if e % 2 else 0.02)
    if sg == "q":
        for i, m in enumerate([76, 79, 81, 79]): ep(m, 0.6, 0.03, at0 + i * beat + 0.02, 0.4)
    bar += 1
# riser into the build and a soft drop-out at the end
at = A["bld"] - 0.9; n = int(1.0 * SR); t = T(n); add(np.sin(2 * np.pi * (200 + 2400 * (t / 1.0) ** 2) * t) * (t / 1.0) ** 2, at, 0.06)
at = A["rep"] - 0.4; n = int(0.8 * SR); t = T(n); add(np.sin(2 * np.pi * (300 + 1500 * (t / 0.8) ** 2) * t) * (t / 0.8) ** 2, at, 0.05)
fade = np.minimum(T(N) / 1.5, 1) * np.minimum((D - T(N)) / 1.2, 1)
def echo(x, d, g):
    y = x.copy(); i = int(d * SR); y[i:] += x[:-i] * g; return y
L = echo(L, 0.29, 0.28) * fade; R = echo(R, 0.33, 0.28) * fade
pk = max(np.abs(L).max(), np.abs(R).max()) + 1e-9
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([L, R]) / pk * 0.8, -1, 1).T * 32767).astype(np.int16).tobytes())
print("music", out, round(D, 1), "s")
