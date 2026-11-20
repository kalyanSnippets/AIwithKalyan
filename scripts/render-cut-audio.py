#!/usr/bin/env python3
"""Render just the audio of an EDL (fast check renders).  usage: render-cut-audio.py <edl.json> <src.wav> <out.(wav|mp3)>"""
import json, subprocess, sys
E = json.load(open(sys.argv[1]))["segments"]; src, out = sys.argv[2], sys.argv[3]
fg = []
for k, e in enumerate(E):
    d = e["src_out"] - e["src_in"]
    fg.append(f"[0:a]atrim={e['src_in']}:{e['src_out']},asetpts=PTS-STARTPTS,"
              f"afade=t=in:d=0.012,afade=t=out:st={max(0, d - .015):.3f}:d=0.015[a{k}];")
fg.append("".join(f"[a{k}]" for k in range(len(E))) + f"concat=n={len(E)}:v=0:a=1[ca]")
open(out + ".af", "w").write("\n".join(fg))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-filter_complex_script", out + ".af", "-map", "[ca]",
                *(["-c:a", "libmp3lame", "-b:a", "128k"] if out.endswith(".mp3") else []), out], check=True)
subprocess.run(["rm", "-f", out + ".af"])
