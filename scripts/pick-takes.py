#!/usr/bin/env python3
"""Pick the best take of every script line from a long A-roll with retakes.

  python3 scripts/pick-takes.py <script.md> <words.json> <out.json> [--extra lines.txt]

For each spoken line of the script (stage directions in [brackets] and headings are skipped)
it scores every window of transcript words against the line (difflib ratio on normalised
tokens), keeps the takes that score close to the best one, and picks the LAST of them that
still comes after the previous line's pick: in a retake-heavy recording the final attempt is
usually the clean one. Output: [{line, start, end, score, takes:[...]}] for a human check.
"""
import json, re, sys
from difflib import SequenceMatcher

script_p, words_p, out_p = sys.argv[1:4]
extra = sys.argv[sys.argv.index("--extra") + 1] if "--extra" in sys.argv else None
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
NUM = {"6": "six", "3": "three", "4": "four", "5": "five", "1": "one", "2": "two"}

CONTR = {"n't": " not", "'re": " are", "'ve": " have", "'ll": " will", "'m": " am", "'d": " would"}
SPECIAL = {"can't": "can not", "won't": "will not", "let's": "let us", "it's": "it is", "that's": "that is",
           "here's": "here is", "there's": "there is", "what's": "what is", "he's": "he is", "she's": "she is"}

def toks(s):
    s = s.lower().replace("’", "'")
    for k, v in SPECIAL.items(): s = s.replace(k, v)
    for k, v in CONTR.items(): s = s.replace(k, v)
    s = re.sub(r"\bgt[as]\s*6('s)?", "gta 6", s)
    out = []
    for t in re.split(r"[\s—–-]+", s):
        t = norm(t)
        if t: out.append(NUM.get(t, t))
    return out

lines = []
for raw in open(script_p, encoding="utf-8"):
    s = raw.strip()
    if not s or s.startswith("#") or s.startswith("[") or s.startswith("Source:") or s.startswith("Target"):
        continue
    s = re.sub(r"\[.*?\]", "", s).strip()
    if s: lines.append(s)
if extra:  # "after: <line prefix> || <extra spoken line>"
    for raw in open(extra, encoding="utf-8"):
        if "||" in raw:
            after, txt = [x.strip() for x in raw.split("||")]
            i = next(k for k, l in enumerate(lines) if l.startswith(after))
            lines.insert(i + 1, txt)

W = json.load(open(words_p))
# one transcript word can expand to two tokens ("that's" -> "that is"); keep a token -> word index map
wt, widx = [], []
for k, w in enumerate(W):
    for t in toks(w["text"]):
        wt.append(t); widx.append(k)

def takes(lt):
    n, res = len(lt), []
    for i in range(len(wt)):
        if not wt[i]: continue
        best = (0, None)
        for m in range(max(1, int(n * .7)), int(n * 1.35) + 2):
            if i + m > len(wt): break
            r = SequenceMatcher(None, lt, wt[i:i + m], autojunk=False).ratio()
            if r > best[0]: best = (r, i + m - 1)
        if best[0] >= .6: res.append((best[0], i, best[1]))
    # local maxima, non-overlapping
    res.sort(key=lambda x: -x[0]); keep = []
    for r, a, b in res:
        if all(b < ka or a > kb for _, ka, kb in keep): keep.append((r, a, b))
    return sorted(keep, key=lambda x: x[1])

out, prev_end = [], -1
cands = [takes(toks(l)) for l in lines]
for k, (l, cs) in enumerate(zip(lines, cands)):
    ok = [c for c in cs if c[1] > prev_end]
    if not ok:
        out.append({"line": l, "start": None, "end": None, "score": 0, "takes": []}); continue
    best = max(c[0] for c in ok)
    good = [c for c in ok if c[0] >= best - .07 and c[0] >= .7] or [max(ok)]
    # don't jump past the next line's last good take
    nxt = [c for c in (cands[k + 1] if k + 1 < len(cands) else []) if c[0] >= .7 and c[1] > prev_end]
    lim = max((c[1] for c in nxt), default=10 ** 9)
    good = [c for c in good if c[2] < lim] or good[:1]
    r, a, b = good[-1]
    # widen the window so it covers the line's first and last words (the scorer can clip them)
    lt = toks(l); best_ab = (r, a, b)
    for a2 in range(max(prev_end + 1, a - 6), a + 1):
        for b2 in range(b, min(len(wt), b + 7)):
            r2 = SequenceMatcher(None, lt, wt[a2:b2 + 1], autojunk=False).ratio()
            if r2 > best_ab[0] + 1e-9: best_ab = (r2, a2, b2)
    r, a, b = best_ab
    prev_end = b
    wa, wb = widx[a], widx[b]
    out.append({"line": l, "start": W[wa]["start"], "end": W[wb]["end"], "score": round(r, 3),
                "w0": wa, "w1": wb, "said": " ".join(W[j]["text"] for j in range(wa, wb + 1)),
                "takes": [{"start": W[widx[x]]["start"], "end": W[widx[y]]["end"], "score": round(s, 3)} for s, x, y in cs]})
json.dump(out, open(out_p, "w"), indent=1)
for o in out:
    t = f'{o["start"]:7.2f}-{o["end"]:7.2f}' if o["start"] is not None else "   MISSING    "
    print(f'{t} {o["score"]:.2f} n={len(o["takes"])} | {o["line"][:70]}')
