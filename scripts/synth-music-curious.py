#!/usr/bin/env python3
"""Intro music for the REA video: curious and sparse until the reveal, then a full groove (numpy only, original).

  python3 scripts/synth-music-curious.py <out.wav> <map.json>
map.json: {"keep": [[old_start, old_end, new_start], ...], "new_len": s}  (old-time anchors are mapped onto the tightened timeline)
Anchors in OLD time: reveal 20.56 s; scenes at 4.3, 15.4, 34.8, 61.8, 71.0, 88.0, 107.0; final impact 118.95.
"""
import json, sys, wave
import numpy as np

SR = 48000; rng = np.random.default_rng(23)
out, mp = sys.argv[1], json.load(open(sys.argv[2]))
def M(t):
    for a, b, n in mp["keep"]:
        if t < a: return n
        if t <= b: return n + (t - a)
    return mp["new_len"]
D = mp["new_len"] + 2.0; N = int(D * SR)
L = np.zeros(N); R = np.zeros(N)
T = lambda n: np.arange(n) / SR
def env(n, a, d): t = T(n); return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def fft_band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((f - lo) / max(lo * .3, 20), 0, 1) * np.clip((hi - f) / max(hi * .3, 20), 0, 1)
    return np.fft.irfft(X * g, len(x))
lowpass = lambda x, fc: fft_band(x, 1, fc); highpass = lambda x, fc: x - lowpass(x, fc)
def add(x, at, g=1.0, p=0.0):
    i = int(at * SR); j = min(N, i + len(x))
    if i < 0 or i >= N: return
    a = (p + 1) * np.pi / 4; L[i:j] += x[: j - i] * g * np.cos(a); R[i:j] += x[: j - i] * g * np.sin(a)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def sweep_noise(n, f0, f1, q=.8):
    o = np.zeros(n + 4096); w = np.hanning(2048); nz = rng.standard_normal(n + 4096)
    for i in range(0, n, 1024):
        fc = f0 * (f1 / f0) ** (i / n); S = np.fft.rfft(nz[i:i + 2048] * w); f = np.fft.rfftfreq(2048, 1 / SR)
        o[i:i + 2048] += np.fft.irfft(S * np.exp(-(np.log2(np.maximum(f, 1) / fc) ** 2) / (2 * q * q)), 2048) * w
    o = o[:n]; return o / (np.abs(o).max() + 1e-9)
def gain(t, pts): return float(np.interp(t, [M(p[0]) for p in pts], [p[1] for p in pts]))

REV = M(20.56); bpm = 120; beat = 60 / bpm
# --- curious phase: marimba-like plucks on a question-shaped motif (A minor pentatonic), woodblock ticks, soft pad
motif = [(0, 69), (1, 72), (2, 76), (3.5, 74), (5, 72), (6, 76), (7, 79), (8.5, 77), (10, 74), (12, 72), (12.5, 74), (13, 76), (14.5, 81)]  # (beat in 16-beat phrase, midi)
t0 = 0.0; ph = 16 * beat
while t0 < REV - 0.2:
    for b, m in motif:
        at = t0 + b * beat
        if at >= REV - 0.25: continue
        n = int(0.55 * SR); tt = T(n)
        pl = (np.sin(2 * np.pi * nt(m) * tt) + 0.5 * np.sin(2 * np.pi * 3 * nt(m) * tt) * np.exp(-tt / 0.05) + 0.2 * np.sin(2 * np.pi * 4.1 * nt(m) * tt) * np.exp(-tt / 0.03)) * env(n, 0.002, 0.16)
        add(pl, at, 0.075 * (0.7 + 0.3 * np.sin(at)), np.sin(at * 1.7) * 0.5)
    t0 += ph
for k in range(int(REV / beat)):          # tick-tock woodblock that follows the beat, fading in
    at = k * beat + (beat / 2 if k % 2 else 0)
    if at > REV - 0.25: break
    n = int(0.05 * SR); tt = T(n)
    add(np.sin(2 * np.pi * (900 if k % 2 else 1250) * tt) * env(n, 0.0005, 0.012), at, 0.05 * min(1, at / 4), -0.3 if k % 2 else 0.3)
for k in range(int((REV - 0.3) / (4 * beat)) + 1):   # soft low pad that swells, chord changes every 4 beats
    ch = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]][k % 4]; at = k * 4 * beat
    if at >= REV - 0.3: break
    n = int(2.4 * SR); tt = T(n); pad = sum(np.sin(2 * np.pi * nt(m - 12) * tt) + 0.4 * np.sin(2 * np.pi * nt(m - 12) * 1.005 * tt) for m in ch) * np.minimum(tt / 0.8, 1) * np.minimum((2.4 - tt) / 0.8, 1)
    add(pad, at, 0.03 * (0.4 + 0.6 * min(1, at / REV)))
for k in range(int(REV / beat)):          # a heartbeat that only starts once the title begins (15.4)
    at = k * beat
    if at < M(15.4) or at > REV - 0.3: continue
    n = int(0.3 * SR); tt = T(n)
    add(np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-tt / 0.04)) / SR) * np.exp(-tt / 0.1), at, 0.16 * min(1, (at - M(15.4)) / 3))
# tension riser into the reveal, then a short suck-back silence
rn = int((REV - 0.12 - M(17.9)) * SR); rr = T(rn); rt = rr / (rn / SR)
rise = (sweep_noise(rn, 400, 11000, .9) * .8 + np.sin(2 * np.pi * np.cumsum(220 * (9 ** rt)) / SR) * .35) * rt ** 2.2
add(rise, M(17.9), 0.22)
# --- groove after the reveal (same sections as before, retimed)
kickG = [(0, 0), (20.5, 0), (20.56, 1), (61.8, .85), (70.5, .85), (71, 1), (87.5, 1), (88, 0), (106.8, 0), (107, .5), (117, .9), (118.9, 0), (119.5, 0)]
hatG = [(0, 0), (20.5, 0), (20.56, .8), (88, .2), (107, .5), (118.9, 0)]
bassG = [(0, 0), (20.5, 0), (20.56, .9), (61.8, .7), (71, .9), (88, .2), (106.8, .2), (107, .6), (118.9, 0)]
arpG = [(0, 0), (20.5, 0), (20.56, .8), (34.8, .6), (61.8, .7), (71, .9), (88, .45), (107, .6), (118.9, 0)]
padG = [(0, 0), (20.5, 0), (20.56, .6), (71, .8), (88, 1.0), (107, .8), (118.9, 0)]
KN = int(.28 * SR); tk = T(KN); KICK = np.sin(2 * np.pi * np.cumsum(48 + 100 * np.exp(-tk / .035)) / SR) * np.exp(-tk / .11)
HAT = highpass(rng.standard_normal(int(.06 * SR)), 7000) * env(int(.06 * SR), .0005, .012)
CLAP = highpass(lowpass(rng.standard_normal(int(.25 * SR)), 6000), 900) * env(int(.25 * SR), .001, .07)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
bars = int((D - REV) / 2) + 1
for b in range(bars):
    t0 = REV + b * 2.0; ch = chords[b % 4]
    if t0 >= D: break
    pn = int(2.6 * SR); tt = T(pn); pad = sum(np.sin(2 * np.pi * nt(m - 12) * tt) + .5 * np.sin(2 * np.pi * nt(m - 12) * 1.004 * tt) + .25 * np.sin(2 * np.pi * nt(m) * tt) for m in ch) * np.minimum(tt / .5, 1) * np.minimum((2.6 - tt) / .5, 1)
    add(pad, t0, .032 * gain(t0, padG), -.2)
    for k in range(8):
        at = t0 + k * .25; bn = int(.24 * SR); tb = T(bn); m = ch[0] - 24 + (12 if k in (3, 7) else 0)
        add(((2 * ((nt(m) * tb) % 1) - 1) * .6 + np.sin(2 * np.pi * nt(m) * tb)) * env(bn, .004, .16), at, .11 * gain(at, bassG) * (1 if k % 2 else .6))
    for k in range(16):
        at = t0 + k * .125; m = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24][k % 4]; an = int(.3 * SR); ta = T(an)
        add((np.sin(2 * np.pi * nt(m) * ta) + .35 * np.sin(2 * np.pi * 2 * nt(m) * ta)) * env(an, .002, .11), at, .028 * gain(at, arpG), np.sin(k) * .5)
    for k in range(4):
        at = t0 + k * beat; add(KICK, at, .34 * gain(at, kickG))
        if k % 2: add(CLAP, at, .10 * gain(at, kickG))
    for k in range(8): add(HAT, t0 + k * .25 + .125, .05 * gain(t0 + k * .25 + .125, hatG), .3 * (1 if k % 2 else -1))
big = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-T(int(1.6 * SR)) / .08)) / SR) * np.exp(-T(int(1.6 * SR)) / .5)
add(big, REV, .5); add(big, M(71.0), .26); add(big, M(118.95), .45)
rise2 = (sweep_noise(int(2.2 * SR), 300, 10000, .9) * .8) * (T(int(2.2 * SR)) / 2.2) ** 2
add(rise2, M(116.7), .16)
fade = np.minimum(np.arange(N) / (SR * .6), 1) * np.minimum((N - np.arange(N)) / (SR * 1.2), 1)
x = np.vstack([L * fade, R * fade]); x = x / np.abs(x).max() * .92
with wave.open(out, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1).T * 32767).astype(np.int16).tobytes())
print("music", round(D, 1), "s; reveal at", round(REV, 2), "s")
