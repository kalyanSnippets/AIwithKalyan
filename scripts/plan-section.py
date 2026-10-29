#!/usr/bin/env python3
"""Plan one section of the film: tightened keep-ranges, lip-sync-corrected A-roll cuts, tight voice audio and a time map.

  python3 scripts/plan-section.py <name> <t0> <t1> --protect a,b ... [--within 0.10 --sentence 0.22]
Inputs (v3 timeline): /tmp/work/plan_lag.json (per-cut lip-sync offsets), /tmp/work/descript48_eq.wav (voice), REA/transcripts/aroll_v3/words.json
Outputs: /tmp/work/<name>_plan.json (render items), /tmp/work/<name>_voice.wav, REA/remotion/public/media/<name>_map.json
"""
import json, subprocess, sys, wave
import numpy as np
name, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
extra = [a for a in sys.argv[4:]]
subprocess.run(["python3", "-I", "scripts/tighten.py", "/tmp/work/descript48_eq.wav", "REA/transcripts/aroll_v3/words.json", str(t0), str(t1), f"/tmp/work/{name}_tight.json", *extra], check=True)
T = json.load(open(f"/tmp/work/{name}_tight.json")); P = json.load(open("/tmp/work/plan_lag.json")); FPS = 30
items = []
for fa, fb, newp in T["keep"]:
    qa, qb = fa / FPS, fb / FPS
    for it in P:
        a, b = max(qa, it["q0"]), min(qb, it["q1"])
        if b - a < 0.5 / FPS: continue
        fs, fe = round(a * FPS), round(b * FPS)
        if fe <= fs: continue
        items.append(dict(q0=(newp + (fs - fa)) / FPS, q1=(newp + (fe - fa)) / FPS, clip=it["clip"], src0=it["src0_fixed"] + (a - it["q0"]), crop=it["crop"], face=it["face"], lag=it["lag"]))
items.sort(key=lambda x: x["q0"])
for a, b in zip(items, items[1:]): a["q1"] = b["q0"]
json.dump(dict(items=items, total=items[-1]["q1"]), open(f"/tmp/work/{name}_plan.json", "w"), indent=1)
SR = 48000
with wave.open("/tmp/work/descript48_eq.wav") as wf: x = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
xf = int(0.004 * SR); out = np.zeros(int(T["new_len"] * SR) + SR); pos = 0
for fa, fb, newp in T["keep"]:
    seg = x[int(fa / FPS * SR):int(fb / FPS * SR)].copy()
    if pos > 0: seg[:xf] *= np.linspace(0, 1, xf)
    seg[-xf:] *= np.linspace(1, 0, xf); out[pos:pos + len(seg)] += seg; pos += len(seg)
out = out[:pos]
with wave.open(f"/tmp/work/{name}_voice.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(dict(keep=[[fa / FPS, fb / FPS, newp / FPS] for fa, fb, newp in T["keep"]], new_len=T["new_len"], t0=t0, t1=t1), open(f"REA/remotion/public/media/{name}_map.json", "w"))
print(f"{name}: {len(items)} render items, {T['new_len']:.1f}s (from {t1 - t0:.1f}s)")
