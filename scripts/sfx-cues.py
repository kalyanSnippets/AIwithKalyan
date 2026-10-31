#!/usr/bin/env python3
"""Turn a phrase-anchored SFX plan into timed cues on the final cut.

  python3 scripts/sfx-cues.py <cut-words.json> <plan.txt> <out cues.json> [--min-gap 0.9]

plan.txt: one cue per line, in video order:   <sfx>  <offset_s>  <phrase…>
  e.g.  pop  0.05  four hundred thousand
Each phrase is searched after the previous match (so repeated words resolve in order); the cue time is the
phrase's first-word start + offset. Cues closer than --min-gap to the previous kept cue are dropped.
Lines starting with # are comments. A sfx name may carry a gain, e.g. pop@-4 (dB).
"""
import json, re, sys

src, plan, out = sys.argv[1], sys.argv[2], sys.argv[3]
gap = float(sys.argv[sys.argv.index("--min-gap") + 1]) if "--min-gap" in sys.argv else 0.9
norm = lambda s: re.sub(r"[^a-z0-9#'%]", "", s.lower())
words = json.load(open(src)); toks = [norm(w["text"]) for w in words]
pos, cues, last = 0, [], -9.0
for line in open(plan):
    line = line.strip()
    if not line or line.startswith("#"): continue
    sfx, off, phrase = line.split(None, 2)
    want = [norm(t) for t in phrase.split()]
    for i in range(pos, len(toks) - len(want) + 1):
        if toks[i:i + len(want)] == want: break
    else:
        sys.exit(f"phrase not found after word {pos}: {phrase!r}")
    pos = i + len(want)
    t = round(words[i]["start"] + float(off), 3)
    name, _, g = sfx.partition("@")
    if t - last < gap: print(f"  skip {name:6} {t:7.2f}  {phrase}  (too close)"); continue
    cues.append({"t": t, "sfx": name, "gain_db": float(g or 0), "phrase": phrase}); last = t
json.dump(cues, open(out, "w"), indent=1)
print(f"{len(cues)} cues → {out}")
