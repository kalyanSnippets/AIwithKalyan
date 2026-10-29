#!/usr/bin/env python3
"""Original, licence-free placeholder audio made with numpy: minimal electronic bed + UI sound effects.

  python3 scripts/synth-audio.py <outDir> [--seconds 60]
Writes bed.wav (48 kHz stereo) and click.wav / whoosh.wav / ping.wav / pop.wav.
"""
import sys, wave
import numpy as np

out = sys.argv[1]; secs = float(sys.argv[sys.argv.index("--seconds") + 1]) if "--seconds" in sys.argv else 60.0
SR = 48000; rng = np.random.default_rng(7)

def save(name, x):
    x = np.atleast_2d(x)
    if x.shape[0] == 1: x = np.vstack([x, x])
    x = np.clip(x / max(1e-9, np.abs(x).max()) * 0.95, -1, 1)
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype(np.int16).tobytes())

def env(n, a, d):  # attack / exp decay
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def lp(x, fc):     # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---- SFX
n = int(0.09 * SR); t = np.arange(n) / SR
save("click", (np.sin(2 * np.pi * 1900 * t) * 0.5 + hp(rng.standard_normal(n), 3000) * 0.3) * env(n, 0.0005, 0.012))
n = int(0.5 * SR); t = np.arange(n) / SR; fc = 300 * 2 ** (t / 0.5 * 4.2)
ph = np.cumsum(fc) / SR; w = rng.standard_normal(n)
sw = lp(hp(w, 200), 6000) * np.sin(np.pi * t / 0.5) ** 2
save("whoosh", sw)
n = int(0.9 * SR); t = np.arange(n) / SR
save("ping", (np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)) * env(n, 0.002, 0.22))
n = int(0.16 * SR); t = np.arange(n) / SR
save("pop", np.sin(2 * np.pi * (500 + 700 * np.exp(-t / 0.03)) * t) * env(n, 0.001, 0.04))

# ---- bed: A minor, 96 BPM, sparse and quiet
bpm = 96; beat = 60 / bpm; N = int(secs * SR); L = np.zeros(N); R = np.zeros(N)
def add(buf, x, at):
    i = int(at * SR); j = min(N, i + len(x))
    if i < N: buf[i:j] += x[: j - i]
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
bar = 4 * beat
for b in range(int(secs / bar) + 1):
    ch = chords[b % 4]; t0 = b * bar; n = int((bar + 0.6) * SR); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * nt(m - 12) * tt) + 0.5 * np.sin(2 * np.pi * nt(m - 12) * 1.004 * tt) for m in ch) * np.minimum(tt / 0.6, 1) * np.minimum((bar + 0.6 - tt) / 0.6, 1)
    add(L, pad * 0.05, t0); add(R, pad * 0.05, t0 + 0.004)
    bass = np.sin(2 * np.pi * nt(ch[0] - 24) * tt) * env(n, 0.01, 1.2)
    add(L, bass * 0.12, t0); add(R, bass * 0.12, t0)
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
    for k in range(8):  # eighth-note plucks, panned
        m = arp[k % 4] + (12 if k == 6 else 0); nn = int(0.5 * SR); ta = np.arange(nn) / SR
        p = (np.sin(2 * np.pi * nt(m) * ta) + 0.3 * np.sin(2 * np.pi * nt(m) * 2 * ta)) * env(nn, 0.003, 0.18)
        at = t0 + k * beat / 2
        add(L, p * 0.045 * (1 - 0.4 * (k % 2)), at); add(R, p * 0.045 * (0.6 + 0.4 * (k % 2)), at + 0.003)
    for k in range(8):  # soft hats on the off-beats
        nn = int(0.05 * SR); h = hp(rng.standard_normal(nn), 6000) * env(nn, 0.001, 0.012)
        if k % 2: add(L, h * 0.02, t0 + k * beat / 2); add(R, h * 0.02, t0 + k * beat / 2)
    for k in range(4):  # very soft kick
        nn = int(0.3 * SR); tk = np.arange(nn) / SR
        kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-tk / 0.03)) * tk) * env(nn, 0.001, 0.09)
        add(L, kick * 0.07, t0 + k * beat); add(R, kick * 0.07, t0 + k * beat)
fade = np.minimum(np.arange(N) / (SR * 1.5), 1) * np.minimum((N - np.arange(N)) / (SR * 2.0), 1)
save("bed", np.vstack([L * fade, R * fade]))
print("wrote", out)
