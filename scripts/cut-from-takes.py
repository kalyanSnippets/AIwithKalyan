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
dur = sum(e["src_out"] - e["src_in"] for e in edl)
json.dump({"source": "IMG_1825", "segments": edl, "duration": round(dur, 2)}, open(edl_p, "w"), indent=1)
print(f"{len(edl)} segments, {dur/60:.2f} min")

if "--render" in sys.argv:
    i = sys.argv.index("--render"); src, out = sys.argv[i + 1], sys.argv[i + 2]
    sc = int(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 1920
    fg = []
    for k, e in enumerate(edl):
        d = e["src_out"] - e["src_in"]
        fg.append(f"[0:v]trim={e['src_in']}:{e['src_out']},setpts=PTS-STARTPTS[v{k}];"
                  f"[0:a]atrim={e['src_in']}:{e['src_out']},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.012,afade=t=out:st={max(0, d - .015):.3f}:d=0.015[a{k}];")
    fg.append("".join(f"[v{k}][a{k}]" for k in range(len(edl))) + f"concat=n={len(edl)}:v=1:a=1[cv][ca];"
              f"[cv]scale={sc}:-2[ov]")
    script = edl_p + ".filter"
    open(script, "w").write("\n".join(fg))
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-filter_complex_script", script,
                    "-map", "[ov]", "-map", "[ca]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "27",
                    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out], check=True)
    print("rendered", out)
