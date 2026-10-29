#!/usr/bin/env python3
"""Mix voice + music (ducked) + SFX to -14 LUFS.

  python3 scripts/mix-audio.py <voice.wav> <bed.wav> <sfxDir> <events.json> <out.wav> [--bed-db -22]
events.json: [{"t": 4.25, "sfx": "whoosh", "db": -10}, ...]   (keep them >= 0.9 s apart)
"""
import json, subprocess, sys, wave
import numpy as np

voice, bed, sfxd, ev_p, out = sys.argv[1:6]
bed_db = float(sys.argv[sys.argv.index("--bed-db") + 1]) if "--bed-db" in sys.argv else -22.0
def rd(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; c = w.getnchannels()
        return x.reshape(-1, c).T, w.getframerate()
v, sr = rd(voice); v = np.vstack([v[0], v[0]]) if v.shape[0] == 1 else v
N = v.shape[1]
ev = json.load(open(ev_p)); ts = sorted(e["t"] for e in ev)
assert all(b - a >= 0.9 for a, b in zip(ts, ts[1:])), "SFX closer than 0.9 s"
sfx = np.zeros((2, N), np.float32)
for e in ev:
    x, _ = rd(f"{sfxd}/{e['sfx']}.wav"); g = 10 ** (e.get("db", -10) / 20); i = int(e["t"] * sr); j = min(N, i + x.shape[1])
    if i < N: sfx[:, i:j] += x[:, : j - i] * g
b, _ = rd(bed); b = np.pad(b, ((0, 0), (0, max(0, N - b.shape[1]))))[:, :N]
def save(p, x):
    with wave.open(p, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1).T * 32767).astype(np.int16).tobytes())
tmp = out + ".parts"; 
save(tmp + "_v.wav", v); save(tmp + "_b.wav", b * 10 ** (bed_db / 20)); save(tmp + "_s.wav", sfx)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp + "_v.wav", "-i", tmp + "_b.wav", "-i", tmp + "_s.wav", "-filter_complex",
    "[0:a]asplit=2[v1][v2];[1:a][v2]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=450[bd];[v1][bd][2:a]amix=inputs=3:normalize=0:duration=first[m];"
    "[m]loudnorm=I=-14:TP=-1.5:LRA=11[o]", "-map", "[o]", "-ar", "48000", out], check=True)
print("wrote", out)
