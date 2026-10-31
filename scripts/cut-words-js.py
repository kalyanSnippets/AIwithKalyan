#!/usr/bin/env python3
"""Write a composition's words.js (caption words) from the cut word timeline, with spelling fixes.

  python3 scripts/cut-words-js.py <cut-words.json> <start> <end> <out/words.js>

Times in the output are relative to <start>. Fixes product names and numbers Scribe spells out
(Rea → REA, Claude code → Claude Code, five point five → 5.5, DX Ball → DX-Ball, RB one → RB-1, …).
"""
import json, re, sys

src, a, b, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
w = [x for x in json.load(open(src)) if a <= x["start"] < b]

def split(t):  # word core + trailing punctuation
    m = re.match(r"^(.*?)([.,?!:]*)$", t); return m.group(1), m.group(2)

NUM = {"one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9"}
out_words, i = [], 0
while i < len(w):
    x = dict(w[i]); core, p = split(x["text"]); nxt = [split(y["text"])[0].lower() for y in w[i + 1:i + 3]]
    if core.lower() == "five" and nxt[:2] == ["point", "five"]:          # five point five → 5.5
        x["text"] = "5.5" + split(w[i + 2]["text"])[1]; x["end"] = w[i + 2]["end"]; out_words.append(x); i += 3; continue
    if core == "DX" and nxt[:1] == ["ball"]:                               # DX Ball → DX-Ball
        x["text"] = "DX-Ball" + split(w[i + 1]["text"])[1]; x["end"] = w[i + 1]["end"]; out_words.append(x); i += 2; continue
    if core == "RB" and nxt[:1] and nxt[0] in NUM:                         # RB one → RB-1
        x["text"] = "RB-" + NUM[nxt[0]] + split(w[i + 1]["text"])[1]; x["end"] = w[i + 1]["end"]; out_words.append(x); i += 2; continue
    if core in ("Rea", "REA", "rea"): core = "REA"
    elif core == "RES": core = "REA's"
    elif core.lower() == "code" and out_words and split(out_words[-1]["text"])[0] == "Claude": core = "Code"
    elif core.lower() == "board" and out_words and split(out_words[-1]["text"])[0] == "REA": core = "Board"
    elif core == "platform": core = "Platform"
    x["text"] = core + p; out_words.append(x); i += 1

res = [[x["text"], round(x["start"] - a, 3), round(x["end"] - a, 3)] for x in out_words]
open(out, "w").write("window.CUT_WORDS=" + json.dumps(res, separators=(",", ":")) + ";\n")
print(f"{len(res)} words → {out}")
