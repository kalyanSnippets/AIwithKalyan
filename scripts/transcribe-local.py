#!/usr/bin/env python3
"""Free local transcription (faster-whisper) for videos where paid ASR is off the table.

  python3 scripts/transcribe-local.py <audio.wav> <outDir> [--model DIR] [--offset S]

Writes words.json (HyperFrames-style word array), transcript.txt (timestamped segments), captions.srt.
Filler words are kept on purpose (prompted) so the edit can find them.
"""
import argparse, json, os, sys, wave
import numpy as np
from faster_whisper import WhisperModel

p = argparse.ArgumentParser()
p.add_argument("audio"); p.add_argument("out")
p.add_argument("--model", default="/tmp/work/models/small.en")
p.add_argument("--offset", type=float, default=0.0)
p.add_argument("--vad", action="store_true", help="Silero VAD: tighter word times around silences")
a = p.parse_args()
os.makedirs(a.out, exist_ok=True)

model = WhisperModel(a.model, device="cpu", compute_type="int8", cpu_threads=4)
prompt = "Um, uh, so, like, you know, I mean, okay. REA, Reverse Engineer Anything, Wekan, Kanban, Claude Code, Vite, localStorage, Hopper, Node.js."
with wave.open(a.audio) as wf:  # 16 kHz mono s16 WAV; avoids the PyAV decode path
    audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
segs, info = model.transcribe(audio, language="en", beam_size=1, word_timestamps=True,
                              condition_on_previous_text=False, initial_prompt=prompt, vad_filter=a.vad, vad_parameters=dict(min_silence_duration_ms=300, speech_pad_ms=120) if a.vad else None)

def ts(t, srt=False):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",") if srt else f"{int(t//60):02d}:{s:05.2f}"

words, lines, srt = [], [], []
for i, s in enumerate(segs, 1):
    for w in s.words or []:
        words.append({"text": w.word.strip(), "start": round(w.start + a.offset, 3), "end": round(w.end + a.offset, 3), "prob": round(w.probability, 3)})
    lines.append(f"[{ts(s.start + a.offset)}-{ts(s.end + a.offset)}] {s.text.strip()}")
    srt.append(f"{i}\n{ts(s.start + a.offset, True)} --> {ts(s.end + a.offset, True)}\n{s.text.strip()}\n")
    print(lines[-1], flush=True)

json.dump(words, open(os.path.join(a.out, "words.json"), "w"), indent=1)
open(os.path.join(a.out, "transcript.txt"), "w").write("\n".join(lines) + "\n")
open(os.path.join(a.out, "captions.srt"), "w").write("\n".join(srt))
print(f"done {len(words)} words, duration {info.duration:.1f}s")
