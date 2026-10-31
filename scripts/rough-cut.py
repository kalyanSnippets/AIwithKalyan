#!/usr/bin/env python3
"""Build a rough cut from an EDL (REA/edits/REA.edl.json) with FFmpeg.

  python3 scripts/rough-cut.py <edl.json> <rawDir> <transcriptsDir> <outDir> [--width 1920] [--ids S1-01,S1-02]
                              [--pad 0.2] [--join 0.45] [--text] [--words out.json]
                              [--vf <prefilter>] [--crf 20] [--preset veryfast]

--pad/--join set the pause rule (gaps over --join become about 2x--pad). --text prints the kept words
per entry and the length, without rendering. --words writes every kept word with its time in the cut
(measured from the rendered parts, so it matches rough_cut.mp4). An entry's "hold": N keeps N s of footage after its last word; "speed": 1.1 plays it faster (pitch kept);
"pause_after": [[src_word_end, s], ...] holds the frame for s extra seconds after that word (a beat between examples).

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
ap.add_argument("--words")
ap.add_argument("--vf", default="", help="filter run on the source before scaling (e.g. an HLG→SDR tone-map)")
ap.add_argument("--crf", default="20"); ap.add_argument("--preset", default="veryfast")
a = ap.parse_args()
PAD, JOIN, LONG = a.pad, a.join, 2.0
edl = json.load(open(a.edl))
if a.ids: edl = [e for e in edl if e["id"] in a.ids.split(",")]
os.makedirs(os.path.join(a.out, "parts"), exist_ok=True)
words_cache, markers, parts, spans = {}, [], [], []

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
            ext = sum(x for t, x in e.get("pause_after", []) if abs(p["end"] - t) < 0.06)
            out.append(cur + [ext] if ext else cur)
            if gap > LONG: markers.append({"id": e["id"], "clip": e["clip"], "src_gap_start": round(p["end"], 2), "src_gap_len": round(gap, 1)})
            cur = [n["start"] - pad_a, n["end"]]
        else:
            cur[1] = n["end"]
    cur[1] += PAD + e.get("hold", 0); cur[0] = max(0, cur[0] - PAD / 2)
    ext = sum(x for t, x in e.get("pause_after", []) if abs(kept[-1]["end"] - t) < 0.06)
    out.append(cur + [ext] if ext else cur)
    if a.text:
        print(f"{e['id']:7} {sum(c[1] - c[0] for c in out):5.1f}s  " + " ".join(x["text"] for x in kept))
    return [(round(c[0], 3), round(c[1], 3), c[2] if len(c) > 2 else 0) for c in out if c[1] - c[0] > 0.15]

if a.text:
    tot = sum(sum(t - s + x for s, t, x in pieces(e)) for e in edl)
    print(f"total {tot:.1f}s ({tot/60:.2f} min)"); sys.exit()

for e in edl:
    ps = pieces(e)
    base = max(0, ps[0][0] - 1)
    end = ps[-1][1] + 0.5
    n = len(ps)
    pre = f"[0:v]{a.vf + ',' if a.vf else ''}scale={a.width}:-2:flags=lanczos,fps=30,format=yuv420p,split={n}" + "".join(f"[s{i}]" for i in range(n)) + ";"
    pre += f"[0:a]aresample=48000,asplit={n}" + "".join(f"[b{i}]" for i in range(n)) + ";"
    v = pre + ";".join(f"[s{i}]trim={s0-base:.3f}:{t0-base:.3f},setpts=PTS-STARTPTS" + (f",tpad=stop_mode=clone:stop_duration={x:.3f}" if x else "") + f"[v{i}];[b{i}]atrim={s0-base:.3f}:{t0-base:.3f},asetpts=PTS-STARTPTS" + (f",apad=pad_dur={x:.3f}" if x else "") + f"[a{i}]" for i, (s0, t0, x) in enumerate(ps))
    sp = e.get("speed", 1.0)
    cat = "".join(f"[v{i}][a{i}]" for i in range(len(ps))) + f"concat=n={len(ps)}:v=1:a=1" + ("[v][a]" if sp == 1.0 else f"[vc][ac];[vc]setpts=PTS/{sp},fps=30[v];[ac]atempo={sp}[a]")
    dst = os.path.join(a.out, "parts", e["id"] + ".mp4")
    dur = sum(t - s + x for s, t, x in ps) / e.get("speed", 1.0)
    parts.append((e["id"], dst, dur))
    spans.append((e, ps))
    if os.path.exists(dst): print("skip", e["id"], flush=True); continue
    cmd = ["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{base:.3f}", "-t", f"{end-base:.3f}", "-i", f"{a.raw}/{e['clip']}.mp4",
           "-filter_complex", v + ";" + cat, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", a.preset, "-crf", a.crf,
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

if a.words:
    # map each kept word to cut time; part starts use the real (probed) part lengths
    probe = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
    out, t0 = [], 0.0
    for (pid, dst, _), (e, ps) in zip(parts, spans):
        w, cum = words_cache[e["clip"]], 0.0
        for s0, t1, ext in ps:
            for x in w:
                if s0 <= x["start"] < t1 and not any(r[0] - 0.01 <= x["start"] < r[1] for r in e.get("remove", [])):
                    sp = e.get("speed", 1.0)
                    out.append({"text": x["text"], "start": round(t0 + (cum + x["start"] - s0) / sp, 3), "end": round(t0 + (cum + min(x["end"], t1) - s0) / sp, 3), "part": pid, "section": e["section"]})
            cum += t1 - s0 + ext
        t0 += probe(dst)
    json.dump(out, open(a.words, "w"), indent=0)
    print(f"words: {len(out)} -> {a.words}")
