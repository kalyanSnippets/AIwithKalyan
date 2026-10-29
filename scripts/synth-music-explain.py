#!/usr/bin/env python3
"""Music for the explanation + setup sections (numpy only, original). Two different moods:
explanation = warm, curious mid-tempo (electric-piano chords, round bass, soft shaker);
setup = calm, clean tutorial groove (muted plucks, sub pulse, light ticks) that thins out for the final line.

  python3 scripts/synth-music-explain.py <out.wav> <map.json>
OLD-time anchors: setup starts 203.6; step transitions 219.5 243.8 262.8 286.0 312.6; "real fun" 320.8.
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
def gain(t, pts): return float(np.interp(t, [M(p[0]) for p in pts], [p[1] for p in pts]))
SET = M(203.6); END = mp["new_len"]
# ---- explanation: C major / A minor, 100 bpm
bpm = 100; beat = 60 / bpm; chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]; roots = [36, 33, 29, 31]
bar = 0
while bar * 4 * beat < SET + 1.5:
    at0 = bar * 4 * beat; ch = chords[bar % 4]; g = gain(at0, [(0, 0.6), (M(131.0) and 131.0, 1.0)]) if False else 1.0
    for k, m in enumerate(ch): ep(m, 2.2, 0.05 * g, at0 + k * 0.012, (k - 1.5) * 0.25)
    for b in range(4):
        bass(roots[bar % 4] + (12 if b % 2 else 0), beat * 0.9, 0.16 * g, at0 + b * beat)
    if at0 > 4:
        for e in range(8): tick(at0 + e * beat / 2, (0.05 if e % 2 else 0.025) * g, True)
    if at0 > 12 and bar % 2 == 0: kick(at0, 0.10); kick(at0 + 2 * beat, 0.08)
    if at0 > 8:
        mel = [76, 79, 81, 79, 76, 74, 72, 74]
        for e in range(8):
            if (bar + e) % 3: ep(mel[e], 0.9, 0.032, at0 + e * beat / 2 + 0.01, 0.4)
    bar += 1
# ---- setup: D minor-ish clean groove, 112 bpm, begins with a small lift
bpm2 = 112; beat2 = 60 / bpm2; ch2 = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64]]; roots2 = [38, 34, 36, 33]
t0 = SET - 0.1; bar = 0
while t0 + bar * 4 * beat2 < END:
    at0 = t0 + bar * 4 * beat2; ch = ch2[bar % 4]; thin = at0 > M(318.5)
    for e in range(16):
        m = ch[[0, 1, 2, 1][e % 4]] + (12 if e % 8 >= 4 else 0)
        if not thin or e % 4 == 0: pluck(m, 0.05, at0 + e * beat2 / 4, np.sin(e) * 0.4)
    for b in range(4):
        bass(roots2[bar % 4], beat2 * 0.85, 0.15, at0 + b * beat2)
    if not thin:
        for b in range(4): kick(at0 + b * beat2, 0.075)
        for e in range(8): tick(at0 + e * beat2 / 2, 0.035 if e % 2 else 0.02)
    for k, m in enumerate(ch): ep(m + 12, 3.6, 0.022, at0 + k * 0.01, (k - 1) * 0.3)
    bar += 1
# step transitions: small rising sweeps
for o in (219.5, 243.8, 262.8, 286.0, 312.6):
    at = M(o) - 0.5; n = int(0.5 * SR); t = T(n); x = np.sin(2 * np.pi * (300 + 1800 * (t / 0.5) ** 2) * t) * (t / 0.5) ** 2; add(x, at, 0.05)
# the "real fun" lift
at = M(320.8); n = int(1.6 * SR); t = T(n); add(np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.9) * 0.4 + np.sin(2 * np.pi * 220 * t) * np.exp(-t / 0.6) * 0.2, at, 0.5)
# global fades and light stereo reverb-ish echo
fade = np.minimum(T(N) / 1.5, 1) * np.minimum((D - T(N)) / 1.5, 1)
def echo(x, d, g):
    y = x.copy(); i = int(d * SR); y[i:] += x[:-i] * g; return y
L = echo(L, 0.29, 0.28) * fade; R = echo(R, 0.33, 0.28) * fade
pk = max(np.abs(L).max(), np.abs(R).max()) + 1e-9
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(np.stack([L, R]) / pk * 0.8, -1, 1).T * 32767).astype(np.int16).tobytes())
print("music", out, round(D, 1), "s")
