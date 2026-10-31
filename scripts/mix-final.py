#!/usr/bin/env python3
"""Final audio mix for a rendered video: cleaned voice + ducked music bed + timed SFX, loudness-normalised.

  python3 scripts/mix-final.py <video.mp4> <music.wav> <sfx-cues.json> <sfx-dir> <cut-words.json> <out.mp4>
                               [--bed 0.11] [--end-bed 0.32]

- Voice: high-pass, denoise, mud cut, presence lift, de-ess, gentle compression (the sample Kalyan approved).
- Music: bed at --bed, side-chain ducked under the voice; after the last spoken word it rises to --end-bed for the
  end screen; fades in/out.
- SFX: each cue from scripts/sfx-cues.py, at a per-type base level plus the cue's own gain.
- Master: two-pass loudnorm to -14 LUFS integrated, -1 dBTP; video stream copied; AAC 320k; faststart.
"""
import json, os, subprocess, sys, tempfile
import numpy as np

video, music, cues_f, sfx_dir, words_f, out = sys.argv[1:7]
opt = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
BED, END_BED, SR = opt("--bed", 0.11), opt("--end-bed", 0.32), 48000
BASE_DB = {"whoosh": -15, "whip": -13, "pop": -17, "click": -13, "type": -19, "riser": -12, "ding": -15}
run = lambda *a: subprocess.run(a, check=True)
tmp = tempfile.mkdtemp(prefix="mix-")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)
last_word = max(w["end"] for w in json.load(open(words_f)))

def load(f):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

# 1) SFX track
sfx = np.zeros((int(dur * SR) + SR, 2), dtype=np.float32); cache = {}
for c in json.load(open(cues_f)):
    if c["sfx"] not in cache:
        a = load(os.path.join(sfx_dir, c["sfx"] + ".mp3")); cache[c["sfx"]] = a / (np.abs(a).max() + 1e-9) * 10 ** (-1 / 20)
    a = cache[c["sfx"]] * 10 ** ((BASE_DB.get(c["sfx"], -16) + c.get("gain_db", 0)) / 20)
    i = max(0, int(c["t"] * SR)); j = min(len(sfx), i + len(a)); sfx[i:j] += a[: j - i]
sfx[: int(dur * SR)].astype("<f4").tofile(os.path.join(tmp, "sfx.f32"))

# 2) voice, music, sfx → mix (loudnorm pass 1 measures, pass 2 applies)
voice_chain = ("highpass=f=80,afftdn=nf=-28:tn=1,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.5:g=2.5,"
               "deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3")
t0 = last_word + 0.3
bed_vol = f"volume='if(lt(t,{t0:.2f}),{BED},if(lt(t,{t0 + 1.5:.2f}),{BED}+(t-{t0:.2f})/1.5*{END_BED - BED},{END_BED}))':eval=frame"
graph = (f"[0:a]aresample={SR},aformat=channel_layouts=stereo,{voice_chain},asplit=2[v][key];"
         f"[1:a]aresample={SR},aformat=channel_layouts=stereo,atrim=0:{dur:.3f},{bed_vol},afade=t=in:d=0.6,afade=t=out:st={dur - 4:.3f}:d=4[m];"
         f"[m][key]sidechaincompress=threshold=0.03:ratio=4:attack=15:release=350:makeup=1[md];"
         f"[2:a]aformat=channel_layouts=stereo[s];"
         f"[v][md][s]amix=inputs=3:normalize=0:duration=first[mix]")
ins = ["-i", video, "-i", music, "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", os.path.join(tmp, "sfx.f32")]
m = subprocess.run(["ffmpeg", "-hide_banner", *ins, "-filter_complex", graph + ";[mix]loudnorm=I=-14:TP=-1:LRA=11:print_format=json[o]",
                    "-map", "[o]", "-f", "null", "-"], capture_output=True, text=True).stderr
ln = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
lnorm = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={ln['input_i']}:measured_TP={ln['input_tp']}:measured_LRA={ln['input_lra']}:"
         f"measured_thresh={ln['input_thresh']}:offset={ln['target_offset']}:linear=true")
run("ffmpeg", "-loglevel", "error", "-y", *ins, "-filter_complex", graph + f";[mix]{lnorm},aresample={SR}[o]",
    "-map", "0:v", "-map", "[o]", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out)
print(f"mixed → {out}  (pass-1 input {ln['input_i']} LUFS, TP {ln['input_tp']})")
