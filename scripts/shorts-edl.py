#!/usr/bin/env python3
"""Turn Short segments (times in the long video's timeline) into an EDL on the raw camera files.

  python3 scripts/shorts-edl.py <shorts.json> <long-edl.json> <cut-words.json> <transcriptsDir> <outDir>

shorts.json: {"short1": [[t_start, t_end(, hold_s)], ...], ...}; an optional third value holds the shot that long after the last word. Each segment keeps the words whose start lies inside it,
mapped back to raw time through the long video's EDL (same words, same order), keeping the long cut's "remove"
windows and speed. Writes <outDir>/<short>.edl.json for scripts/rough-cut.py.
"""
import json, sys, os
shorts, edl_f, cw_f, tr, out = sys.argv[1:6]
edl = {e["id"]: e for e in json.load(open(edl_f))}
cw = json.load(open(cw_f))
words = {}
# map every cut word to its raw word (sequence match per EDL part)
raw_of = []
by_part = {}
for i, w in enumerate(cw): by_part.setdefault(w["part"], []).append(i)
raw_of = [None] * len(cw)
for pid, idx in by_part.items():
    e = edl[pid]; W = words.setdefault(e["clip"], json.load(open(f"{tr}/{e['clip']}/words.json")))
    rem = e.get("remove", [])
    kept = [x for x in W if x["start"] >= e["src_in"] - 0.3 and x["end"] <= e["src_out"] + 0.3
            and not any(r[0] - 0.01 <= x["start"] < r[1] for r in rem)]
    k = 0
    for i in idx:
        while k < len(kept) and kept[k]["text"] != cw[i]["text"]: k += 1
        assert k < len(kept), (pid, cw[i])
        raw_of[i] = kept[k]; k += 1
os.makedirs(out, exist_ok=True)
for name, segs in json.load(open(shorts)).items():
    entries = []
    for n, seg in enumerate(segs):
        a, b = seg[0], seg[1]
        idx = [i for i, w in enumerate(cw) if a - 0.05 <= w["start"] < b - 0.03]
        groups = []
        for i in idx:
            if groups and cw[groups[-1][-1]]["part"] == cw[i]["part"]: groups[-1].append(i)
            else: groups.append([i])
        for g in groups:
            e = edl[cw[g[0]]["part"]]; r0, r1 = raw_of[g[0]]["start"], raw_of[g[-1]]["end"]
            rem = [r for r in e.get("remove", []) if r[1] > r0 and r[0] < r1]
            rem += [[r0 - 1.0, r0 - 0.001], [r1 + 0.001, r1 + 1.0]]   # never pull in neighbouring words
            x = {"id": f"{name}-{n + 1:02d}{'abcdefg'[groups.index(g)] if len(groups) > 1 else ''}", "section": e["section"],
                 "clip": e["clip"], "src_in": round(r0 - 0.02, 3), "src_out": round(r1 + 0.02, 3), "remove": rem,
                 "text": " ".join(cw[i]["text"] for i in g)}
            if e.get("speed", 1) != 1: x["speed"] = e["speed"]
            if len(seg) > 2 and g is groups[-1]: x["hold"] = seg[2]
            entries.append(x)
    json.dump(entries, open(f"{out}/{name}.edl.json", "w"), indent=1)
    print(name, len(entries), "entries")
    for x in entries: print("  ", x["id"], x["clip"][-12:], x["src_in"], x["src_out"], x.get("speed", ""), "|", x["text"])
