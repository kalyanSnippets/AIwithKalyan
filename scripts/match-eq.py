#!/usr/bin/env python3
"""Match the tone of one section of a voice track to another (long-term average spectrum), numpy only.

  python3 scripts/match-eq.py <in.wav 48k mono> <out.wav> <ref_start,ref_end> <fix_start,fix_end> [--max-db 6]
"""
import sys, wave
import numpy as np

inp, outp = sys.argv[1], sys.argv[2]
r0, r1 = map(float, sys.argv[3].split(",")); f0, f1 = map(float, sys.argv[4].split(","))
maxdb = float(sys.argv[sys.argv.index("--max-db") + 1]) if "--max-db" in sys.argv else 6.0
with wave.open(inp) as wf:
    sr = wf.getframerate(); x = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float64) / 32768
N = 4096
def ltas(a, b):
    seg = x[int(a * sr):int(b * sr)]; m = len(seg) // N
    fr = seg[:m * N].reshape(m, N); e = np.sqrt((fr ** 2).mean(1)); sp = fr[e > np.percentile(e, 60)]
    return (np.abs(np.fft.rfft(sp * np.hanning(N), axis=1)) ** 2).mean(0)
fq = np.fft.rfftfreq(N, 1 / sr)
R, F = ltas(r0, r1), ltas(f0, f1)
# smooth on a log-frequency axis (1/3 octave)
def smooth(p):
    out = np.zeros_like(p); lf = np.log2(np.maximum(fq, 1))
    for i, f in enumerate(fq):
        if f < 60: out[i] = p[i]; continue
        m = np.abs(lf - np.log2(f)) <= 1 / 6; out[i] = p[m].mean()
    return out
g_db = 10 * np.log10(smooth(R) / smooth(F))
g_db[fq < 70] = 0; g_db = np.clip(g_db, -maxdb, maxdb)
g_db[fq > 16000] = g_db[fq <= 16000][-1] * 0.5
print("EQ correction dB:", {int(b): round(float(np.interp(b, fq, g_db)), 1) for b in (100, 200, 400, 800, 1600, 3200, 6400, 12000)})
# linear-phase FIR from the magnitude curve
T = 4096
H = np.interp(np.fft.rfftfreq(T, 1 / sr), fq, 10 ** (g_db / 20))
h = np.roll(np.fft.irfft(H, n=T), T // 2) * np.hanning(T)
nfft = 1 << int(np.ceil(np.log2(len(x) + T)))
y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft))[T // 2: T // 2 + len(x)]
# blend: original before the fix section, corrected after, 60 ms crossfade
w = np.zeros(len(x)); a = int(f0 * sr); b = int(f1 * sr); xf = int(0.06 * sr)
w[a:b] = 1.0; w[a - xf // 2:a + xf // 2] = np.linspace(0, 1, xf)
out = x * (1 - w) + y * w
out = np.clip(out, -1, 1)
with wave.open(outp, "wb") as wo:
    wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(sr); wo.writeframes((out * 32767).astype(np.int16).tobytes())
