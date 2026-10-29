#!/usr/bin/env python3
"""Original intro music + SFX for the REA video (numpy only, no licence issues).

  python3 scripts/synth-intro.py <musicOut.wav> <sfxDir>
Music: 120 BPM, A minor. Sections follow the edit: build (0-15.4), drop (15.4-34.8), groove, lift (71-88),
calm (88-107), final build to the 'let's go' impact at 118.95.
"""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(11)
musicOut, sfxDir = sys.argv[1], sys.argv[2]

def save(path, x):
    x = np.atleast_2d(x)
    if x.shape[0] == 1: x = np.vstack([x, x])
    pk = np.abs(x).max()
    x = x / pk * 0.92 if pk > 0 else x
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1).T * 32767).astype(np.int16).tobytes())

def T(n): return np.arange(n) / SR
def env(n, a, d): t = T(n); return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def fft_band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((f - lo) / max(lo * 0.3, 20), 0, 1) * np.clip((hi - f) / max(hi * 0.3, 20), 0, 1)
    return np.fft.irfft(X * g, len(x))
def lowpass(x, fc): return fft_band(x, 1, fc)
def highpass(x, fc): return x - lowpass(x, fc)
def sweep_noise(n, f0, f1, q=0.5):
    """noise through a bandpass whose centre sweeps f0 -> f1 (block-wise FFT)"""
    out = np.zeros(n + 2 * 2048); blk = 2048; w = np.hanning(blk)
    nz = rng.standard_normal(n + 2 * blk)
    for i in range(0, n, blk // 2):
        k = i / n; fc = f0 * (f1 / f0) ** k
        seg = nz[i:i + blk] * w
        S = np.fft.rfft(seg); f = np.fft.rfftfreq(blk, 1 / SR)
        g = np.exp(-((np.log2(np.maximum(f, 1) / fc)) ** 2) / (2 * q * q))
        out[i:i + blk] += np.fft.irfft(S * g, blk) * w
    out = out[:n]
    return out / (np.abs(out).max() + 1e-9)
def pan(x, p):  # p -1..1 constant-power, p may be array
    p = np.broadcast_to(p, x.shape); a = (p + 1) * np.pi / 4
    return np.vstack([x * np.cos(a), x * np.sin(a)])
def place(buf, x, at):
    i = int(at * SR); x = np.atleast_2d(x)
    if x.shape[0] == 1: x = np.vstack([x, x])
    j = min(buf.shape[1], i + x.shape[1])
    if i < buf.shape[1]: buf[:, i:j] += x[:, : j - i]

# ---------------- SFX ----------------
sfx = {}
n = int(0.5 * SR); t = T(n); e = np.sin(np.pi * t / 0.5) ** 2
sfx["whoosh_fast"] = pan(sweep_noise(n, 500, 6000) * e, np.linspace(-0.7, 0.7, n))
sfx["whoosh_down"] = pan(sweep_noise(n, 5000, 400) * e, np.linspace(0.7, -0.7, n))
n = int(1.0 * SR); t = T(n); e = np.sin(np.pi * t / 1.0) ** 1.5
sfx["whoosh_slow"] = pan(sweep_noise(n, 250, 3500, 0.7) * e, np.linspace(-0.4, 0.4, n))
n = int(1.8 * SR); t = T(n); e = (t / 1.8) ** 2.2 * np.minimum((1.8 - t) / 0.05, 1)
sfx["riser"] = pan((sweep_noise(n, 300, 9000, 0.9) * 0.9 + np.sin(2 * np.pi * np.cumsum(200 * (8 ** (t / 1.8))) / SR) * 0.35) * e, 0)
n = int(1.4 * SR); t = T(n)
boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.45)
crack = lowpass(rng.standard_normal(n), 4000) * np.exp(-t / 0.05) * 0.8
sfx["impact"] = boom + crack + lowpass(rng.standard_normal(n), 300) * np.exp(-t / 0.5) * 0.4
n = int(0.9 * SR); t = T(n); g = np.zeros(n)
for k in range(8):  # stutter, then boom at 0.61 s
    s0 = int(k * 0.07 * SR); L = int(0.045 * SR)
    seg = np.sign(rng.standard_normal(L)) * 0.5 * (1 + (k % 2)) * np.hanning(L); g[s0:s0 + L] += seg * (1 - k / 10)
g = np.round(g * 6) / 6
b2 = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-np.maximum(t - 0.61, 0) / 0.08)) / SR) * np.exp(-np.maximum(t - 0.61, 0) / 0.4) * (t >= 0.61)
sfx["glitch_impact"] = g + b2 * 1.2 + lowpass(rng.standard_normal(n), 3000) * np.exp(-np.maximum(t - 0.61, 0) / 0.05) * (t >= 0.61) * 0.6
n = int(0.4 * SR); g = np.zeros(n)
for k in range(6):
    s0 = int(k * 0.06 * SR); L = int(0.035 * SR); g[s0:s0 + L] += np.round(np.sign(rng.standard_normal(L)) * np.hanning(L) * 5) / 5 * 0.7
sfx["glitch"] = g
n = int(0.09 * SR); t = T(n); sfx["click"] = (np.sin(2 * np.pi * 1900 * t) * 0.5 + highpass(rng.standard_normal(n), 3000) * 0.3) * env(n, 0.0005, 0.012)
n = int(0.16 * SR); t = T(n); sfx["pop"] = np.sin(2 * np.pi * (500 + 700 * np.exp(-t / 0.03)) * t) * env(n, 0.001, 0.04)
n = int(1.0 * SR); t = T(n); sfx["ping"] = (np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)) * env(n, 0.002, 0.24)
n = int(1.6 * SR); c = np.zeros((2, n))
for k, m in enumerate([76, 79, 83, 88]):
    f = 440 * 2 ** ((m - 69) / 12); nn = n - int(k * 0.09 * SR); t = T(nn)
    place(c, pan((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * env(nn, 0.002, 0.35) * 0.5, (k - 1.5) * 0.4), k * 0.09)
sfx["chime"] = c
n = int(0.5 * SR); t = T(n)
sfx["stamp"] = np.sin(2 * np.pi * (110 * np.exp(-t / 0.08) + 45) * t) * env(n, 0.001, 0.12) + highpass(rng.standard_normal(n), 1500) * env(n, 0.0005, 0.02) * 0.7
n = int(0.35 * SR); t = T(n)
sfx["slam"] = np.sin(2 * np.pi * (140 * np.exp(-t / 0.05) + 55) * t) * env(n, 0.001, 0.1) + lowpass(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.04) * 0.6
n = int(1.2 * SR); sp = np.zeros((2, n))
for k in range(14):
    f = rng.uniform(2500, 9000); at = rng.uniform(0, 0.8); nn = int(0.35 * SR); t = T(nn)
    place(sp, pan(np.sin(2 * np.pi * f * t) * env(nn, 0.002, 0.08) * 0.4, rng.uniform(-0.8, 0.8)), at)
sfx["sparkle"] = sp
n = int(2.1 * SR); cs = np.zeros(n)
at = 0.0; i = 0
while at < 2.0:
    nn = int(0.03 * SR); t = T(nn); place_ = int(at * SR); f = 900 + 1700 * (at / 2.0)
    cs[place_:place_ + nn] += np.sin(2 * np.pi * f * t) * env(nn, 0.0005, 0.008); at += 0.14 - 0.1 * (at / 2.0)
sfx["counter_sweep"] = cs
n = int(1.4 * SR); t = T(n); sfx["scan"] = sweep_noise(n, 600, 4500, 0.4) * np.sin(np.pi * t / 1.4) ** 2 * 0.8
n = int(0.5 * SR); t = T(n); ty = np.zeros(n)
for k in range(5):
    s0 = int(k * 0.09 * SR); L = int(0.02 * SR); ty[s0:s0 + L] += highpass(rng.standard_normal(L), 2000) * np.hanning(L) * 0.8
sfx["type"] = ty
for k, v in sfx.items(): save(f"{sfxDir}/{k}.wav", v)

# ---------------- music ----------------
D = 121.0; N = int(D * SR); L = np.zeros(N); R = np.zeros(N); beat = 0.5
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G, one per bar (2 s)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def gain(t, pts):  # piecewise-linear automation, pts=[(time,value)...]
    return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
kickG = [(0, .25), (13.5, .35), (15.3, 0), (15.4, 1), (61.8, .85), (70.5, .85), (71, 1), (87.5, 1), (88, .0), (106.8, .0), (107, .5), (117, .9), (118.9, 0), (119.2, 0)]
hatG = [(0, 0), (8, .5), (15.3, .1), (15.4, .8), (88, .2), (107, .5), (118.9, .0)]
bassG = [(0, .0), (4, .35), (15.3, .0), (15.4, .9), (61.8, .7), (71, .9), (88, .2), (106.8, .2), (107, .6), (118.9, 0)]
arpG = [(0, .4), (15.4, .8), (34.8, .6), (61.8, .7), (71, .9), (88, .45), (107, .6), (118.9, 0)]
padG = [(0, .9), (15.4, .6), (71, .8), (88, 1.0), (107, .8), (118.9, 0)]
bars = int(D / 2) + 1
def add(x, at, g=1.0, p=0.0):
    i = int(at * SR); j = min(N, i + x.shape[-1])
    if i >= N: return
    a = (p + 1) * np.pi / 4
    L[i:j] += x[: j - i] * g * np.cos(a); R[i:j] += x[: j - i] * g * np.sin(a)
kn = int(0.28 * SR); tk = T(kn); KICK = np.sin(2 * np.pi * np.cumsum(48 + 100 * np.exp(-tk / 0.035)) / SR) * np.exp(-tk / 0.11)
hn = int(0.06 * SR); HAT = highpass(rng.standard_normal(hn), 7000) * env(hn, 0.0005, 0.012)
cn = int(0.25 * SR); CLAP = (highpass(lowpass(rng.standard_normal(cn), 6000), 900)) * env(cn, 0.001, 0.07)
for b in range(bars):
    t0 = b * 2.0; ch = chords[b % 4]
    # pad
    pn = int(2.6 * SR); tt = T(pn); pad = sum(np.sin(2 * np.pi * nt(m - 12) * tt) + 0.5 * np.sin(2 * np.pi * nt(m - 12) * 1.004 * tt) + 0.25 * np.sin(2 * np.pi * nt(m) * tt) for m in ch)
    pad = pad * np.minimum(tt / 0.5, 1) * np.minimum((2.6 - tt) / 0.5, 1)
    add(pad, t0, 0.032 * gain(t0, padG), -0.2)
    # bass on off-beat 8ths
    for k in range(8):
        at = t0 + k * 0.25; bn = int(0.24 * SR); tb = T(bn)
        m = ch[0] - 24 + (12 if k in (3, 7) else 0)
        saw = (2 * ((nt(m) * tb) % 1) - 1) * 0.6 + np.sin(2 * np.pi * nt(m) * tb)
        add(saw * env(bn, 0.004, 0.16), at, 0.11 * gain(at, bassG) * (1 if k % 2 else 0.6))
    # arp
    for k in range(16):
        at = t0 + k * 0.125; m = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24][k % 4]
        an = int(0.3 * SR); ta = T(an)
        add((np.sin(2 * np.pi * nt(m) * ta) + 0.35 * np.sin(2 * np.pi * 2 * nt(m) * ta)) * env(an, 0.002, 0.11), at, 0.028 * gain(at, arpG), np.sin(k) * 0.5)
    for k in range(4):
        at = t0 + k * beat
        add(KICK, at, 0.34 * gain(at, kickG))
        if k % 2 == 1: add(CLAP, at, 0.10 * (1 if t0 >= 15.4 else 0) * gain(at, kickG))
    for k in range(8):
        at = t0 + k * 0.25 + 0.125
        add(HAT, at, 0.05 * gain(at, hatG), 0.3 * (1 if k % 2 else -1))
# risers and impacts that follow the picture
riseN = int(2.2 * SR); tr = T(riseN); rise = (sweep_noise(riseN, 300, 10000, 0.9) * 0.8 + np.sin(2 * np.pi * np.cumsum(180 * (10 ** (tr / 2.2))) / SR) * 0.3) * (tr / 2.2) ** 2
add(rise, 13.2, 0.16); add(rise, 116.7, 0.18)
imp = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-T(int(1.6 * SR)) / 0.08)) / SR) * np.exp(-T(int(1.6 * SR)) / 0.5)
add(imp, 15.4, 0.38); add(imp, 118.95, 0.45); add(imp, 71.0, 0.28)
fade = np.minimum(np.arange(N) / (SR * 0.8), 1) * np.minimum((N - np.arange(N)) / (SR * 1.2), 1)
save(musicOut, np.vstack([L * fade, R * fade]))
print("music", D, "s;", len(sfx), "sfx")
