#!/usr/bin/env python3
"""Re-mix a rendered HyperFrames film's audio with proper stem processing, then swap it into the render.

  python3 scripts/mix-from-html.py <composition_dir> <rendered.mp4> <out.mp4> [--voice-lufs -16] [--music-lufs -16]

Reads every <audio>/<video data-has-audio> clip from <composition_dir>/index.html (data-start, data-duration,
data-media-start, data-volume, data-automation volume lane) and rebuilds the mix:
  voice  = clips whose id starts with "cam" or "outro": high-pass 80 Hz, light FFT denoise, gentle compression,
           each normalised to --voice-lufs before its clip volume
  music  = ids m1..m9: each file normalised to --music-lufs, then clip volume x automation envelope
  sfx    = ids sfx-*: each normalised to -16 LUFS, then clip volume
The sum is mastered with two-pass loudnorm to -14 LUFS integrated, -1 dBTP, LRA 11 and muxed onto the
render's video stream (copied, not re-encoded). Prints a report of voice-vs-music level.
"""
import json, re, subprocess, sys, tempfile, os
import numpy as np

comp, render, out = sys.argv[1:4]
arg = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
VOICE_L, MUSIC_L = arg("--voice-lufs", -16.0), arg("--music-lufs", -16.0)
SR = 48000
html = open(os.path.join(comp, "index.html"), encoding="utf-8").read()
total = float(re.search(r'data-composition-id="[^"]+" data-start="0" data-duration="([\d.]+)"', html).group(1))
tmp = tempfile.mkdtemp(prefix="mix_")

def lufs(path, af=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn"] + (["-af", af + ",ebur128"] if af else ["-af", "ebur128"]) + ["-f", "null", "-"]
    o = subprocess.run(cmd, capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", o)
    return float(m[-1]) if m else -70.0

def decode(path, af=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(SR)] + (["-af", af] if af else []) + ["-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

clips = []
for m in re.finditer(r"<(audio|video)\s([^>]*?)>", html):
    a = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(2)))
    a.update({k: v for k, v in re.findall(r"([\w-]+)='([^']*)'", m.group(2))})
    if m.group(1) == "video" and a.get("data-has-audio") != "true": continue
    if "src" not in a: continue
    clips.append(a)

VOICE_CHAIN = "highpass=f=80,afftdn=nf=-28:nr=8,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=2"
mix = {k: np.zeros((int((total + 1) * SR), 2), np.float32) for k in ("voice", "music", "sfx")}
cache = {}
for a in clips:
    cid, src = a.get("id", ""), os.path.join(comp, a["src"])
    kind = "voice" if cid.startswith(("cam", "outro")) else "music" if re.match(r"m\d", cid) else "sfx"
    key = (src, kind)
    if key not in cache:
        if kind == "voice":
            proc = os.path.join(tmp, os.path.basename(src) + ".voice.wav")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vn", "-ac", "2", "-ar", str(SR), "-af", VOICE_CHAIN, proc], check=True)
            g = VOICE_L - lufs(proc); x = decode(proc)
        else:
            g = (MUSIC_L if kind == "music" else -16.0) - lufs(src); g = min(g, 12.0) if kind == "sfx" else g; x = decode(src)
        cache[key] = x * (10 ** (g / 20))
        print(f"{kind:5s} {os.path.basename(src):22s} gain {g:+.1f} dB")
    x = cache[key]
    st, du = float(a.get("data-start", 0)), float(a.get("data-duration", 0))
    ms, vol = float(a.get("data-media-start", 0)), float(a.get("data-volume", 1))
    seg = x[int(ms * SR):int((ms + du) * SR)].copy()
    env = np.full(len(seg), vol, np.float32)
    if "data-automation" in a:
        lane = next((l for l in json.loads(a["data-automation"])["lanes"] if l["target"] == "volume"), None)
        if lane:
            ts = np.array([p["t"] for p in lane["points"]]); vs = np.array([p["v"] for p in lane["points"]])
            env = np.interp(np.arange(len(seg)) / SR, ts, vs).astype(np.float32) * vol
    seg *= env[:, None]
    i0 = int(st * SR); n = min(len(seg), len(mix[kind]) - i0)
    mix[kind][i0:i0 + n] += seg[:n]

# sidechain-style ducking: music drops DUCK dB while the voice is speaking (50 ms attack, 350 ms release)
DUCK = arg("--duck", 2.5)
hop = 480
vv = mix["voice"][: len(mix["voice"]) // hop * hop].reshape(-1, hop, 2)
vdb = 20 * np.log10(np.sqrt((vv ** 2).mean((1, 2))) + 1e-12)
target = np.where(vdb > -38, -DUCK, 0.0)
g = np.zeros_like(target); cur = 0.0
for k, t in enumerate(target):
    coef = 0.2 if t < cur else 0.03          # per 10 ms hop: fast down, slow up
    cur += (t - cur) * coef; g[k] = cur
gl = np.repeat(10 ** (g / 20), hop).astype(np.float32)
mix["music"][: len(gl)] *= gl[:, None]
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
# voice vs music where the voice is active
vf = mix["voice"][: len(mix["voice"]) // 4800 * 4800].reshape(-1, 4800, 2); mf = mix["music"][: len(vf) * 4800].reshape(-1, 4800, 2)
v_db = 20 * np.log10(np.sqrt((vf ** 2).mean((1, 2))) + 1e-12); m_db = 20 * np.log10(np.sqrt((mf ** 2).mean((1, 2))) + 1e-12)
act = v_db > (np.percentile(v_db[v_db > -60], 50) - 6)   # frames with real speech energy
d = v_db[act] - m_db[act]
print(f"voice over music during speech: median {np.median(d):.1f} dB, 10th pct {np.percentile(d, 10):.1f} dB, min {d.min():.1f} dB")
bad = np.where(act & (v_db - m_db < 14))[0] * 0.1
if len(bad): print("closest spots (s):", sorted(set(round(t) for t in bad))[:20])
full = mix["voice"] + mix["music"] + mix["sfx"]
raw = os.path.join(tmp, "mix_raw.wav")
with open(raw + ".f32", "wb") as f: f.write(full[: int(total * SR)].astype(np.float32).tobytes())
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw + ".f32", raw], check=True)
# two-pass loudnorm
o = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(o[o.rindex("{"):o.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
master = os.path.join(tmp, "master.wav")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", ln + ",aresample=48000", "-ar", "48000", master], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", render, "-i", master, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", out], check=True)
o = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
s = o[o.rindex("Summary:"):]
print("final:", " ".join(re.findall(r"(I:\s+-?[\d.]+ LUFS|LRA:\s+[\d.]+ LU|Peak:\s+-?[\d.]+ dBFS)", s)))
subprocess.run(["rm", "-rf", tmp])
