#!/usr/bin/env python3
"""Rebuild the A-roll video to match an edited audio track (cut for cut), with one consistent framing.

  python3 scripts/build-aroll.py plan   <align.json> <edl.json> <rough_parts_dir> <transcripts_dir> <faces.json> <plan.json> [--insert q0,q1,clip,src0]
  python3 scripts/build-aroll.py render <plan.json> <raw_dir> <outDir>

plan : maps each aligned segment (edited-audio time -> rough-cut time) back to the original clip + timestamp.
render: cuts every item from the 4K originals, crops each clip so the face has the same size and position, 1080p30.
"""
import json, os, subprocess, sys
import numpy as np

mode = sys.argv[1]
FPS = 30
TARGET = dict(face_w=567.0, cx=1930.0, cy=900.0)   # 4K px: same face size / position in every clip

def crop_for(face):
    s = face["w"] / TARGET["face_w"]
    cw, ch = 3840 * s, 2160 * s
    x0 = min(max(face["cx"] - TARGET["cx"] * s, 0), 3840 - cw)
    y0 = min(max(face["cy"] - TARGET["cy"] * s, 0), 2160 - ch)
    ev = lambda v: int(round(v / 2) * 2)
    return ev(cw), ev(ch), ev(x0), ev(y0)

if mode == "plan":
    align_p, edl_p, parts_dir, tr_dir, faces_p, plan_p = sys.argv[2:8]
    ins = None
    if "--insert" in sys.argv:
        a = sys.argv[sys.argv.index("--insert") + 1].split(","); ins = dict(q0=float(a[0]), q1=float(a[1]), clip=a[2], src0=float(a[3]))
    edl = json.load(open(edl_p)); A = json.load(open(align_p))["segments"]
    PAD, JOIN = 0.2, 0.45
    cache, parts = {}, []
    def pieces(e):
        w = cache.setdefault(e["clip"], json.load(open(f"{tr_dir}/{e['clip']}/words.json")))
        rem = e.get("remove", [])
        ws = [x for x in w if x["start"] >= e["src_in"] - 0.3 and x["end"] <= e["src_out"] + 0.3]
        kept = [x for x in ws if not any(r[0] - 0.01 <= x["start"] < r[1] for r in rem)]
        out, cur = [], [kept[0]["start"], kept[0]["end"]]
        for p, n in zip(kept, kept[1:]):
            gap = n["start"] - p["end"]
            forced = any(p["end"] <= r[0] + 0.05 and n["start"] >= r[1] - 0.05 for r in rem)
            if gap > JOIN or forced:
                pad_a = min(PAD, max(0.02, gap / 2 - 0.02)) if forced else PAD
                cur[1] = p["end"] + pad_a; out.append(cur); cur = [n["start"] - pad_a, n["end"]]
            else: cur[1] = n["end"]
        cur[1] += PAD; cur[0] = max(0, cur[0] - PAD / 2); out.append(cur)
        return [(round(s, 3), round(t, 3)) for s, t in out if t - s > 0.15]
    t = 0.0
    for e in edl:
        ps = pieces(e)
        d = json.load(open(parts_dir))[e["id"]]
        planned = sum(b - a for a, b in ps)
        offs, c = [], 0.0
        for a, b in ps: offs.append((c, a, b)); c += (b - a)
        parts.append(dict(id=e["id"], clip=e["clip"], start=t, dur=d, planned=planned, pieces=offs)); t += d
    def to_src(r):
        for p in parts:
            if p["start"] <= r < p["start"] + p["dur"] + 1e-6:
                u = (r - p["start"]) * p["planned"] / p["dur"]
                for off, a, b in p["pieces"]:
                    if off <= u <= off + (b - a) + 1e-6: return p, a + (u - off)
                return p, p["pieces"][-1][2]
        raise SystemExit(f"rough time {r} outside parts")
    def src_runs(r0, r1):
        """split rough interval into (clip, src_start, src_end) runs, following piece boundaries"""
        out, r = [], r0
        while r < r1 - 1e-3:
            p, s = to_src(r + 1e-4)
            # end of this piece in rough time
            u = (r + 1e-4 - p["start"]) * p["planned"] / p["dur"]
            for off, a, b in p["pieces"]:
                if off <= u <= off + (b - a) + 1e-6: piece_end_u = off + (b - a); break
            r_end = min(r1, p["start"] + piece_end_u * p["dur"] / p["planned"])
            if r_end - r < 1e-3: r_end = r + 0.04
            out.append((p["clip"], s, s + (r_end - r), p["id"])); r = r_end
        return out
    faces = json.load(open(faces_p)); key = {"PXL_20261028_084617376": "A", "PXL_20261028_085709806": "B", "PXL_20261028_102753700": "E", "PXL_20261028_110231565": "F"}
    items, qpos = [], 0.0
    # merge near-contiguous segments
    M = []
    for s in A:
        if M and abs(s["r0"] - M[-1]["r1"]) < 0.06 and abs(s["q0"] - M[-1]["q1"]) < 0.06: M[-1]["r1"], M[-1]["q1"] = s["r1"], s["q1"]
        else: M.append(dict(s))
    for k, s in enumerate(M):
        if s["q0"] - qpos > 0.01:   # edited-only material or tiny hole
            if ins and abs(s["q0"] - ins["q1"]) < 0.3 and qpos <= ins["q0"] + 0.3:
                items.append(dict(q0=qpos, q1=s["q0"], clip=ins["clip"], src0=ins["src0"], note="restored sentence"))
            elif s["q0"] - qpos < 0.35 and items:
                items[-1]["q1"] = s["q0"]; items[-1]["_extend"] = True
            else: print(f"WARNING: unexplained edited-only gap q {qpos:.2f}-{s['q0']:.2f}")
        qa = s["q0"]
        for clip, a, b, pid in src_runs(s["r0"], s["r1"]):
            items.append(dict(q0=qa, q1=qa + (b - a), clip=clip, src0=a, note=pid)); qa += (b - a)
        qpos = s["q1"]
    # make the timeline gap-free: each item runs to the next item's start
    for a, b in zip(items, items[1:]): a["q1"] = b["q0"]
    items[-1]["q1"] = max(items[-1]["q1"], A[-1]["q1"])
    for it in items:
        it["face"] = faces[key[it["clip"]]]; it["crop"] = crop_for(it["face"])
    json.dump(dict(items=items, total=items[-1]["q1"]), open(plan_p, "w"), indent=1)
    print(len(items), "items,", round(items[-1]["q1"], 1), "s;", {k: crop_for(v) for k, v in faces.items()})

elif mode == "render":
    plan_p, raw, out = sys.argv[2:5]
    plan = json.load(open(plan_p)); os.makedirs(out + "/pieces", exist_ok=True)
    lst = []
    for k, it in enumerate(plan["items"]):
        f0, f1 = round(it["q0"] * FPS), round(it["q1"] * FPS); n = f1 - f0
        if n <= 0: continue
        cw, ch, x0, y0 = it["crop"]; dst = f"{out}/pieces/{k:04d}.mp4"
        if not os.path.exists(dst):
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{it['src0']:.3f}", "-i", f"{raw}/{it['clip']}.mp4", "-frames:v", str(n), "-an",
                            "-vf", f"crop={cw}:{ch}:{x0}:{y0},scale=1920:1080:flags=lanczos,fps={FPS},format=yuv420p",
                            "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-g", "30", "-r", str(FPS), dst], check=True)
        lst.append(f"file '{os.path.abspath(dst)}'"); print(k, n, flush=True)
    open(out + "/concat.txt", "w").write("\n".join(lst) + "\n")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", out + "/concat.txt", "-c", "copy", out + "/video_only.mp4"], check=True)
    print("video_only done")
