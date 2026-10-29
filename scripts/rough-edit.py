#!/usr/bin/env python3
"""Second-pass cleanup of a rough cut: phrase removals, inserts from source, silence collapse.

  python3 scripts/rough-edit.py <ops.json> <video.mp4> <words.json> <audio16k.wav> <outDir> [--dry]

ops.json: {"remove":[{"text":"...", "near":secs, "why":"..."}], "insert":[{"after":"...", "near":secs, "src":"file.mp4","t0":..,"t1":..}]}
Cuts land on the quietest 10 ms frame within +/-0.15 s of each word boundary, so they fall in pauses, not words.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

ops_p, video, words_p, wav_p, out = sys.argv[1:6]
dry = "--dry" in sys.argv
ops = json.load(open(ops_p)); W = json.load(open(words_p))
with wave.open(wav_p) as wf:
    x = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
FR = 160  # 10 ms at 16 kHz
n = len(x) // FR
env = 20 * np.log10(np.sqrt((x[:n * FR].reshape(n, FR) ** 2).mean(1)) + 1e-9)
DUR = len(x) / 16000
FLOOR = np.percentile(env, 10)
THR = -47.0            # silence for collapsing
THR2 = -43.0           # candidate cut points (pauses)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
toks = [norm(w["text"]) for w in W]

def quiet_runs(thr, mn):
    q, r, st = env < thr, [], None
    for k, v in enumerate(list(q) + [False]):
        if v and st is None: st = k
        if not v and st is not None:
            if (k - st) / 100 >= mn: r.append((st / 100, k / 100))
            st = None
    return r
PAUSES = [((a + b) / 2, a, b) for a, b in quiet_runs(THR2, 0.12)]
def left_pause(t, reach=0.9):
    """pause centre at or just before t (ASR word starts run late, so look left)"""
    c = [p for p in PAUSES if t - reach <= p[0] <= t + 0.05]
    if not c:
        a, b = max(0, int((t - 0.35) * 100)), min(n - 1, int((t + 0.05) * 100))
        v = (a + int(np.argmin(env[a:b + 1]))) / 100.0
        print(f"  warn: no pause near {t:.2f}s, cutting at the quietest frame {v:.2f}s (inside speech)")
        return v
    return max(c)[0]
def near_pause(t, reach=0.8):
    c = [p for p in PAUSES if abs(p[0] - t) <= reach]
    if not c:
        print(f"  warn: no pause near {t:.2f}s for the insert, using it as is")
        return t
    return min(c, key=lambda p: abs(p[0] - t))[0]

def find(text, near):
    q = [norm(t) for t in text.split() if norm(t)]
    best = None
    for i in range(len(toks) - len(q) + 1):
        if toks[i:i + len(q)] == q:
            d = abs(W[i]["start"] - near)
            if best is None or d < best[0]: best = (d, i)
    if best is None: raise SystemExit(f"NOT FOUND: {text!r} near {near}")
    if best[0] > 6: print(f"  warn: {text!r} nearest match is {best[0]:.1f}s from hint")
    return best[1], best[1] + len(q) - 1

cuts = []  # (start, end) windows to remove
for o in ops["remove"]:
    i, j = find(o["text"], o["near"])
    a = left_pause(W[i]["start"])
    b = left_pause(W[j + 1]["start"]) if j + 1 < len(W) else DUR
    if b <= a: print(f"  skip (no pause between): {o['text']!r}"); continue
    cuts.append((a, b))
    print(f"REMOVE {a:7.2f}-{b:7.2f} ({b-a:4.1f}s) '{' '.join(w['text'] for w in W[i:j+1])}'  [{o.get('why','')}]")

# silence collapse: only inside gaps between ASR words, never over recognised speech
runs = quiet_runs(THR, 0.7)
markers = []
ends = np.array([w["end"] for w in W]); starts = np.array([w["start"] for w in W])
cnt = 0
for s0, e0 in runs:
    pe = ends[ends <= e0 - 0.05].max(initial=0.0)
    ns = starts[starts >= s0 + 0.05].min(initial=DUR)
    a, b = max(s0 + 0.25, pe + 0.15), min(e0 - 0.25, ns - 0.15)
    if b - a >= 0.2: cuts.append((a, b)); cnt += 1
    if e0 - s0 >= 2.0: markers.append({"rough_time": round(s0, 2), "gap_s": round(e0 - s0, 1)})
print(f"silence runs >=0.7s: {len(runs)}, collapsed {cnt} (floor {FLOOR:.0f} dB)")

cuts.sort(); merged = []
for a, b in cuts:
    if merged and a <= merged[-1][1]: merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
    else: merged.append((a, b))
keep, t = [], 0.0
for a, b in merged:
    if a - t > 0.12: keep.append((t, a))
    t = b
if DUR - t > 0.12: keep.append((t, DUR))

inserts = []
for o in ops.get("insert", []):
    i, j = find(o["after"], o["near"]); pos = near_pause(W[j]["end"] + 0.1)
    inserts.append((pos, o)); print(f"INSERT at {pos:.2f} after '{o['after']}' <- {o['src']} {o['t0']}-{o['t1']}")
total = sum(b - a for a, b in keep) + sum(o["t1"] - o["t0"] for _, o in inserts)
print(f"result {total:.1f}s ({total/60:.1f} min) from {DUR:.1f}s; {len(keep)} pieces")
if dry: sys.exit()

os.makedirs(out, exist_ok=True)
ins_files = {}
for k, (pos, o) in enumerate(inserts):
    f = os.path.join(out, f"insert{k}.mp4")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(o["t0"]), "-t", str(o["t1"] - o["t0"]), "-i", o["src"],
                    "-vf", "scale=1920:-2:flags=lanczos,fps=30,format=yuv420p", "-af", "aresample=48000", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                    "-c:a", "aac", "-b:a", "192k", f], check=True)
    ins_files[k] = (pos, f)
def split_keep(keep, pos):
    A, B = [], []
    for a, b in keep:
        if b <= pos: A.append((a, b))
        elif a >= pos: B.append((a, b))
        else: A.append((a, pos)); B.append((pos, b))
    return A, B
def expr(ps):
    return "+".join(f"gte(t,{a:.3f})*lt(t,{b:.3f})" for a, b in ps)
groups = []
if inserts:
    A, B = split_keep(keep, inserts[0][0]); groups = [A, B]
else:
    groups = [keep]
fc, labels, inp = [], "", ["-i", video]
for gi, g in enumerate(groups):
    fc.append(f"[0:v]select='{expr(g)}',setpts=N/FRAME_RATE/TB[v{gi}];[0:a]aselect='{expr(g)}',asetpts=N/SR/TB,aresample=48000[a{gi}]")
    labels += f"[v{gi}][a{gi}]"
    if gi < len(inserts):
        inp += ["-i", ins_files[gi][1]]
        labels += f"[{gi+1}:v]fps=30,format=yuv420p[iv{gi}];[{gi+1}:a]aresample=48000[ia{gi}]"[:0] + f"[{gi+1}:v][{gi+1}:a]"
nseg = len(groups) + len(inserts)
fc.append(f"{labels}concat=n={nseg}:v=1:a=1[v][a]")
script = os.path.join(out, "v2.filter"); open(script, "w").write(";\n".join(fc))
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inp, "-filter_complex_script", script, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", os.path.join(out, "rough_cut_v2.mp4")], check=True)
json.dump({"long_gaps_in_v1": markers, "removed_windows": [(round(a, 2), round(b, 2)) for a, b in merged]}, open(os.path.join(out, "v2_markers.json"), "w"), indent=1)
print("done")
