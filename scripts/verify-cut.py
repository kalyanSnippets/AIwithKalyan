#!/usr/bin/env python3
"""Check a rough cut against the script: re-transcribe the cut, then diff words.

  python3 scripts/verify-cut.py <takes.json> <cut_words.json>

Prints every stretch the cut has that the script doesn't (leftover retakes / false starts) and
every script stretch missing from the cut, with cut timestamps. Small 1-2 word swaps are
treated as spelling / ASR variants and skipped.
"""
import json, re, sys
from difflib import SequenceMatcher

CONTR = {"n't": " not", "'re": " are", "'ve": " have", "'ll": " will", "'m": " am", "'d": " would"}
SPECIAL = {"can't": "can not", "won't": "will not", "let's": "let us", "it's": "it is", "that's": "that is",
           "here's": "here is", "there's": "there is", "what's": "what is"}
NUM = {"6": "six", "3": "three", "4": "four", "5": "five", "1": "one", "2": "two", "7": "seven"}

def toks(s):
    s = s.lower().replace("’", "'")
    for k, v in SPECIAL.items(): s = s.replace(k, v)
    for k, v in CONTR.items(): s = s.replace(k, v)
    s = re.sub(r"\bgt[as]\s*6('s)?", "gta 6", s)
    out = []
    for t in re.split(r"[\s—–-]+", s):
        t = re.sub(r"[^a-z0-9]", "", t)
        if t: out.append(NUM.get(t, t))
    return out

T = json.load(open(sys.argv[1])); CW = json.load(open(sys.argv[2]))
st = [t for o in T for t in toks(o["line"])]
ct, ci = [], []
for k, w in enumerate(CW):
    for t in toks(w["text"]): ct.append(t); ci.append(k)
sm = SequenceMatcher(None, st, ct, autojunk=False)
fmt = lambda s: f"{int(s // 60)}:{s % 60:04.1f}"
extra_n = 0
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == "equal": continue
    if op == "replace" and b2 - b1 <= 2 and a2 - a1 <= 2: continue
    if op in ("insert", "replace"):
        extra_n += b2 - b1
        print(f"EXTRA   @{fmt(CW[ci[b1]]['start'])}-{fmt(CW[ci[b2 - 1]]['end'])}: {' '.join(ct[b1:b2])[:100]!r}"
              + (f"   (script: {' '.join(st[a1:a2])[:50]!r})" if a2 > a1 else ""))
    else:
        print(f"MISSING @{fmt(CW[ci[min(b1, len(ci) - 1)]]['start'])}: {' '.join(st[a1:a2])!r}")
print(f"script words {len(st)}, cut words {len(ct)}, extra {extra_n}, match ratio {sm.ratio():.3f}")
