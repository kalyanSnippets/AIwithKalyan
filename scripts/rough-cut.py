#!/usr/bin/env python3
"""Build a rough cut from an EDL (REA/edits/REA.edl.json) with FFmpeg.

  python3 scripts/rough-cut.py <edl.json> <rawDir> <transcriptsDir> <outDir> [--width 1920] [--ids S1-01,S1-02]
                              [--pad 0.2] [--join 0.45] [--text]

--pad/--join set the pause rule (gaps over --join become about 2x--pad). --text prints the kept words
per entry and the length, without rendering. An entry's "hold": N keeps N s of footage after its last word.

Each EDL range is snapped to words; pauses over ~0.45 s collapse to ~0.4 s; words inside "remove" windows are dropped.
Writes <outDir>/parts/<id>.mp4, <outDir>/rough_cut.mp4, <outDir>/markers.json (long gaps = where screen recordings go).
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument("edl"); ap.add_argument("raw"); ap.add_argument("tr"); ap.add_argument("out")
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--ids")
ap.add_argument("--pad", type=float, default=0.2)
ap.add_argument("--join", type=float, default=0.45)
ap.add_argument("--text", action="store_true")
a = ap.parse_args()
PAD, JOIN, LONG = a.pad, a.join, 2.0
edl = json.load(open(a.edl))
if a.ids: edl = [e for e in edl if e["id"] in a.ids.split(",")]
os.makedirs(os.path.join(a.out, "parts"), exist_ok=True)
words_cache, markers, parts = {}, [], []

def pieces(e):
    w = words_cache.setdefault(e["clip"], json.load(open(f"{a.tr}/{e['clip']}/words.json")))
    rem = e.get("remove", [])
    ws = [x for x in w if x["start"] >= e["src_in"] - 0.3 and x["end"] <= e["src_out"] + 0.3]
    kept = [x for x in ws if not any(r[0] - 0.01 <= x["start"] < r[1] for r in rem)]
    out, cur = [], [kept[0]["start"], kept[0]["end"]]
    for p, n in zip(kept, kept[1:]):
        gap = n["start"] - p["end"]
        forced = any(p["end"] <= r[0] + 0.05 and n["start"] >= r[1] - 0.05 for r in rem)
        if gap > JOIN or forced:
            pad_a = min(PAD, max(0.02, gap / 2 - 0.02)) if forced else PAD
            cur[1] = p["end"] + pad_a
            out.append(cur)
            if gap > LONG: markers.append({"id": e["id"], "clip": e["clip"], "src_gap_start": round(p["end"], 2), "src_gap_len": round(gap, 1)})
            cur = [n["start"] - pad_a, n["end"]]
        else:
            cur[1] = n["end"]
    cur[1] += PAD + e.get("hold", 0); cur[0] = max(0, cur[0] - PAD / 2)
    out.append(cur)
    if a.text:
        print(f"{e['id']:7} {sum(t - s for s, t in out):5.1f}s  " + " ".join(x["text"] for x in kept))
    return [(round(s, 3), round(t, 3)) for s, t in out if t - s > 0.15]

if a.text:
    tot = sum(sum(t - s for s, t in pieces(e)) for e in edl)
    print(f"total {tot:.1f}s ({tot/60:.2f} min)"); sys.exit()

for e in edl:
    ps = pieces(e)
    base = max(0, ps[0][0] - 1)
    end = ps[-1][1] + 0.5
    n = len(ps)
    pre = f"[0:v]scale={a.width}:-2:flags=lanczos,fps=30,format=yuv420p,split={n}" + "".join(f"[s{i}]" for i in range(n)) + ";"
    pre += f"[0:a]aresample=48000,asplit={n}" + "".join(f"[b{i}]" for i in range(n)) + ";"
    v = pre + ";".join(f"[s{i}]trim={s0-base:.3f}:{t0-base:.3f},setpts=PTS-STARTPTS[v{i}];[b{i}]atrim={s0-base:.3f}:{t0-base:.3f},asetpts=PTS-STARTPTS[a{i}]" for i, (s0, t0) in enumerate(ps))
    cat = "".join(f"[v{i}][a{i}]" for i in range(len(ps))) + f"concat=n={len(ps)}:v=1:a=1[v][a]"
    dst = os.path.join(a.out, "parts", e["id"] + ".mp4")
    dur = sum(t - s for s, t in ps)
    parts.append((e["id"], dst, dur))
    if os.path.exists(dst): print("skip", e["id"], flush=True); continue
    cmd = ["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{base:.3f}", "-t", f"{end-base:.3f}", "-i", f"{a.raw}/{e['clip']}.mp4",
           "-filter_complex", v + ";" + cat, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst + ".tmp.mp4"]
    subprocess.run(cmd, check=True); os.rename(dst + ".tmp.mp4", dst)
    print(f"{e['id']} {len(ps)} pieces {dur:.1f}s", flush=True)

lst = os.path.join(a.out, "concat.txt")
open(lst, "w").write("".join(f"file '{os.path.abspath(d)}'\n" for _, d, _ in parts))
t = 0; tl = []
for i, d, du in parts: tl.append({"id": i, "start": round(t, 2), "dur": round(du, 2)}); t += du
json.dump({"parts": tl, "long_gaps": markers}, open(os.path.join(a.out, "markers.json"), "w"), indent=1)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(a.out, "rough_cut.mp4")], check=True)
print(f"rough cut {t:.1f}s ({t/60:.1f} min)")
