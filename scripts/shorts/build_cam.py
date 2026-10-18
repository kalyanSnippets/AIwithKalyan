#!/usr/bin/env python3
"""Builds each Short's vertical camera track from the 4K camera originals.

For every `cam` range in scripts/shorts/edl.json (cam time = the reviewed talking-head cut), the
matching source pieces are pulled from media/raw (read only), cropped to 9:16 around Kalyan's face
and scaled to 1080x1920. Audio comes from the reviewed cut (compositions/CLD_1279/media/cam.mp4,
Studio Sound voice), with 10 ms fades at each joint.

    python3 scripts/shorts/build_cam.py [short-01 ...]

Writes media/shorts/<short>/cam.mp4 and media/shorts/<short>/cam.map.json (where each cam range
lands inside cam.mp4).
"""
import glob, json, os, re, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
FPS = 25
CROP = "crop=1215:2160:1278:0,scale=1080:1920:flags=lanczos,setsar=1"  # face centre x≈1885 of 3840
T = json.load(open(f"{ROOT}/renders/CLD_1279-cam.timeline.json"))
EDL = json.load(open(f"{ROOT}/scripts/shorts/edl.json"))
CAM = f"{ROOT}/compositions/CLD_1279/media/cam.mp4"

SEGS = []
for f in sorted(glob.glob(f"{ROOT}/media/raw/CLD_1279-*-seg*.MOV")):
    g = list(map(int, re.search(r"CLD_1279-(\d+)\.(\d+)\.(\d+)\.(\d+)-(\d+)\.(\d+)\.(\d+)\.(\d+)", f).groups()))
    SEGS.append((g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000, g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000, f))

fr = lambda t: round(t * FPS)  # frame index


def src_pieces(a, b):
    """cam range [a,b) -> list of (src_start, frames)."""
    out = []
    for p in T:
        lo, hi = max(a, p["out"]), min(b, p["out"] + p["dur"])
        if hi - lo > 1e-6:
            out.append((p["src"] + lo - p["out"], fr(hi) - fr(lo)))
    return out


def file_pieces(s, n):
    """src start + frame count -> (file, local start, frames), split at segment boundaries."""
    res = []
    while n > 0:
        a, b, f = next(x for x in SEGS if x[0] - 1e-6 <= s < x[1])
        take = min(n, fr(b - s)) if fr(b - s) > 0 else n
        res.append((f, s - a, take))
        n -= take
        s += take / FPS
    return res


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def build(name):
    out_dir = f"{ROOT}/media/shorts/{name}"
    os.makedirs(out_dir, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix=f"{name}-", dir=out_dir)
    parts, amap, pos, k = [], [], 0, 0
    afilt, ains = [], []
    for item in EDL[name]:
        if "cam" not in item:
            continue
        a, b = item["cam"]
        nfr = fr(b) - fr(a)
        for s, n in src_pieces(a, b):
            for f, local, take in file_pieces(s, n):
                p = f"{tmp}/p{k:03d}.mp4"
                run(["ffmpeg", "-y", "-ss", f"{local:.3f}", "-i", f, "-frames:v", str(take), "-an", "-vf", f"{CROP},fps={FPS}",
                     "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", "-r", str(FPS), p])
                parts.append(p)
                k += 1
        amap.append({"cam": [a, b], "at": round(pos, 3), "dur": round(nfr / FPS, 3)})
        i = len(ains)
        ains.append(f"[0:a]atrim={fr(a) / FPS}:{fr(b) / FPS},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={nfr / FPS - 0.01}:d=0.01[a{i}]")
        pos += nfr / FPS
    with open(f"{tmp}/list.txt", "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt", "-c", "copy", f"{tmp}/video.mp4"])
    graph = ";".join(ains) + ";" + "".join(f"[a{i}]" for i in range(len(ains))) + f"concat=n={len(ains)}:v=0:a=1[a]"
    run(["ffmpeg", "-y", "-i", CAM, "-filter_complex", graph, "-map", "[a]", "-c:a", "pcm_s16le", "-ar", "48000", f"{tmp}/audio.wav"])
    run(["ffmpeg", "-y", "-i", f"{tmp}/video.mp4", "-i", f"{tmp}/audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", f"{out_dir}/cam.mp4"])
    json.dump({"segments": amap, "duration": round(pos, 3)}, open(f"{out_dir}/cam.map.json", "w"), indent=1)
    subprocess.run(["rm", "-rf", tmp])
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,duration,nb_frames", "-of", "csv=p=0", f"{out_dir}/cam.mp4"], capture_output=True, text=True).stdout.split()
    print(name, "→", f"{out_dir}/cam.mp4", f"{pos:.2f}s", probe)


for n in sys.argv[1:] or [k for k in EDL if not k.startswith("_")]:
    build(n)
