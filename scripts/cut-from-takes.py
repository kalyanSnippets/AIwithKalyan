#!/usr/bin/env python3
"""Turn picked takes (pick-takes.py) + word-level fixes into a tight A-roll EDL, and optionally render it.

  python3 scripts/cut-from-takes.py <takes.json> <words.json> <fixes.json> <audio.wav> <edl.json> [--render src.mp4 out.mp4 --scale 960]

fixes.json: {"remove":[[w0,w1,"why"],...], "extend":[[line_prefix, w_end_or_start, "why"],...], "max_gap":0.35, "pause":0.22}
- keeps only the words of the picked takes, minus removed word ranges
- any gap between kept words longer than max_gap (or across a removal) becomes a cut; the kept
  pause is `pause` seconds split around the cut point
- cut edges are snapped to the quietest 10 ms within the gap so cuts fall in silence
"""
import json, subprocess, sys
import numpy as np

takes_p, words_p, fixes_p, wav_p, edl_p = sys.argv[1:6]
T = json.load(open(takes_p)); W = json.load(open(words_p)); F = json.load(open(fixes_p))
MAXG, PAUSE = F.get("max_gap", .35), F.get("pause", .22)

pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav_p, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
FR = 160; n = len(x) // FR
env = 20 * np.log10(np.sqrt((x[:n * FR].reshape(n, FR) ** 2).mean(1)) + 1e-9)
quiet = lambda a, b: (a if b <= a else (int(a * 100) + int(np.argmin(env[int(a * 100):max(int(a * 100) + 1, int(b * 100))]))) / 100)

# Over-long words usually hide untranscribed retake fragments: keep only the first speech burst
SIL0 = F.get("silence_db", -50.0)
trimmed = []
for k, w in enumerate(W):
    exp = .15 + .08 * len(w["text"])
    if w["end"] - w["start"] > max(1.0, 3 * exp):
        a, b = int(w["start"] * 100), int(w["end"] * 100)
        sp = env[a:b] >= SIL0
        on = np.where(sp)[0]
        if len(on):
            j = on[0]
            while j < len(sp) and (sp[j] or sp[j:j + 12].any()): j += 1   # burst, bridging gaps < 0.12 s
            new_end = round((a + j) / 100 + .05, 2)
            if new_end < w["end"] - .3:
                trimmed.append((w["text"], w["start"], w["end"], new_end)); w["end"] = new_end
print(f"trimmed {len(trimmed)} over-long words")
for pre, w, why in F.get("extend", []):
    o = next(o for o in T if o["line"].startswith(pre))
    if w > o["w1"]: o["w1"] = w
    else: o["w0"] = w
keep = set()
for o in T:
    if o.get("w0") is not None: keep.update(range(o["w0"], o["w1"] + 1))
removed = set()
for a, b, why in F.get("remove", []):
    removed.update(range(a, b + 1))
keep = sorted(keep - removed)

# group words into segments
segs, cur = [], [keep[0]]
for i in keep[1:]:
    p = cur[-1]
    if i == p + 1 and W[i]["start"] - W[p]["end"] <= MAXG: cur.append(i)
    else: segs.append(cur); cur = [i]
segs.append(cur)

edl = []
for k, s in enumerate(segs):
    a, b = W[s[0]]["start"], W[s[-1]]["end"]
    # lead-in: look back up to 0.25 s for the quietest point before the first word
    prev_end = W[s[0] - 1]["end"] if s[0] > 0 else 0
    lead = quiet(max(prev_end, a - .25), a)
    nxt = W[s[-1] + 1]["start"] if s[-1] + 1 < len(W) else b + .5
    tail = quiet(b, min(nxt, b + PAUSE + .1))
    tail = max(tail, min(b + .06, nxt))
    edl.append({"src_in": round(max(0, min(lead, a - .04)), 3), "src_out": round(tail, 3),
                "text": " ".join(W[i]["text"] for i in s)})
# Whisper stretches word timings over pauses, so also shorten real silences found in the audio
SIL = F.get("silence_db", -50.0)
tight = []
for e in edl:
    a, b = int(e["src_in"] * 100), int(e["src_out"] * 100)
    q = env[a:b] < SIL
    cuts, k = [], 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]: j += 1
            if (j - k) / 100 > MAXG and k > 0 and j < len(q):   # internal pause only
                cuts.append(((a + k) / 100 + PAUSE / 2, (a + j) / 100 - PAUSE / 2))
            k = j
        else: k += 1
    s = e["src_in"]
    for c0, c1 in cuts:
        tight.append({"src_in": round(s, 3), "src_out": round(c0, 3), "text": e["text"]}); s = c1
    tight.append({"src_in": round(s, 3), "src_out": e["src_out"], "text": e["text"]})
    # trim leading/trailing silence of the whole segment down to PAUSE/2
for e in tight:
    a, b = int(e["src_in"] * 100), int(e["src_out"] * 100)
    act = np.where(env[a:b] >= SIL)[0]
    if len(act):
        e["src_in"] = round(max(e["src_in"], (a + act[0]) / 100 - .08), 3)
        e["src_out"] = round(min(e["src_out"], (a + act[-1]) / 100 + .12), 3)
edl = [e for e in tight if e["src_out"] - e["src_in"] > .08]
# source-time additions (words the ASR lumped into a neighbour, e.g. 'rage' inside 'RAGE engine')
for t0, t1, why in F.get("keep_time", []):
    edl.append({"src_in": t0, "src_out": t1, "text": why})
edl.sort(key=lambda e: e["src_in"]); merged = []
for e in edl:
    if merged and e["src_in"] <= merged[-1]["src_out"] + .02:
        merged[-1]["src_out"] = max(merged[-1]["src_out"], e["src_out"])
    else: merged.append(dict(e))
edl = merged
# source-time removals found by verify-cut.py (fragments hidden inside words)
for t0, t1, why in F.get("remove_time", []):
    out = []
    for e in edl:
        if e["src_out"] <= t0 or e["src_in"] >= t1: out.append(e); continue
        if e["src_in"] < t0: out.append({**e, "src_out": round(t0, 3)})
        if e["src_out"] > t1: out.append({**e, "src_in": round(t1, 3)})
    edl = [e for e in out if e["src_out"] - e["src_in"] > .08]
dur = sum(e["src_out"] - e["src_in"] for e in edl)
json.dump({"source": "IMG_1825", "segments": edl, "duration": round(dur, 2)}, open(edl_p, "w"), indent=1)
print(f"{len(edl)} segments, {dur/60:.2f} min")

if "--render" in sys.argv:
    # one accurate-seek encode per segment, then a stream-copy concat (low memory, frame-exact cuts)
    import os, tempfile
    i = sys.argv.index("--render"); src, out = sys.argv[i + 1], sys.argv[i + 2]
    sc = int(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 1920
    tmp = tempfile.mkdtemp(prefix="cut_", dir=os.path.dirname(os.path.abspath(out)))
    lst = []
    for k, e in enumerate(edl):
        d = e["src_out"] - e["src_in"]; f = os.path.join(tmp, f"s{k:04d}.mp4")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{e['src_in']:.3f}", "-i", src, "-t", f"{d:.3f}",
                        "-vf", f"scale={sc}:-2,fps=30000/1001", "-af",
                        f"afade=t=in:d=0.012,afade=t=out:st={max(0, d - .015):.3f}:d=0.015,aresample=48000",
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k", "-ac", "2", f], check=True)
        lst.append(f"file '{f}'")
    open(os.path.join(tmp, "list.txt"), "w").write("\n".join(lst))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(tmp, "list.txt"),
                    "-c", "copy", "-movflags", "+faststart", out], check=True)
    subprocess.run(["rm", "-rf", tmp])
    print("rendered", out)
