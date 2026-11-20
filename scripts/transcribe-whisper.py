#!/usr/bin/env python3
"""Free local fallback transcription (faster-whisper), used ONLY when Kalyan explicitly
asks for it in the conversation (e.g. no ElevenLabs key). ElevenLabs Scribe stays the default.

Writes the same files as scripts/transcribe.mjs, minus elevenlabs.json:
  words.json (HyperFrames word array), transcript.txt, transcript-timestamped.txt,
  captions.srt, meta.json

usage: python3 scripts/transcribe-whisper.py <audio> <outDir> [--model large-v3] [--prompt "GTA, Rockstar"]
"""
import argparse, json, os, sys, time
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("audio"); ap.add_argument("out")
ap.add_argument("--model", default="large-v3")
ap.add_argument("--language", default="en")
ap.add_argument("--prompt", default="")
ap.add_argument("--threads", type=int, default=os.cpu_count() or 4)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

t0 = time.time()
model = WhisperModel(a.model, device="cpu", compute_type="int8", cpu_threads=a.threads)
# decode with ffmpeg (avoids PyAV version clashes) -> 16 kHz mono float32
import subprocess, numpy as np
pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", a.audio, "-ac", "1", "-ar", "16000",
                      "-f", "f32le", "-"], check=True, capture_output=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
segs, info = model.transcribe(
    audio, language=a.language, word_timestamps=True, beam_size=5,
    initial_prompt=a.prompt or None, vad_filter=True, condition_on_previous_text=False,
)
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:8.2f} - {s.end:8.2f}] {s.text.strip()}")
    for w in s.words or []:
        words.append({"text": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2),
                      "speaker": "speaker_0", "p": round(w.probability, 3)})
    print(lines[-1], flush=True)

def fmt(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)) % 1000:03}"

srt, cue, n = [], [], 1
for w in words:
    cue.append(w)
    if len(cue) >= 5 or w["text"].endswith((".", "?", "!")):
        srt.append(f"{n}\n{fmt(cue[0]['start'])} --> {fmt(cue[-1]['end'])}\n{' '.join(x['text'] for x in cue)}\n"); n += 1; cue = []
if cue:
    srt.append(f"{n}\n{fmt(cue[0]['start'])} --> {fmt(cue[-1]['end'])}\n{' '.join(x['text'] for x in cue)}\n")

json.dump([{k: v for k, v in w.items() if k != "p"} for w in words], open(f"{a.out}/words.json", "w"), indent=1)
json.dump(words, open(f"{a.out}/words-with-confidence.json", "w"))
open(f"{a.out}/transcript-timestamped.txt", "w").write("\n".join(lines) + "\n")
open(f"{a.out}/transcript.txt", "w").write(" ".join(w["text"] for w in words) + "\n")
open(f"{a.out}/captions.srt", "w").write("\n".join(srt))
json.dump({"engine": f"faster-whisper {a.model} int8 (local, free fallback)", "language": info.language,
           "duration": info.duration, "words": len(words), "seconds": round(time.time() - t0)},
          open(f"{a.out}/meta.json", "w"), indent=1)
print(f"done: {len(words)} words in {round(time.time()-t0)}s -> {a.out}", file=sys.stderr)
