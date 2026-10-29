#!/usr/bin/env python3
"""SFX events for the prompts section (old time -> tightened). python3 scripts/prompts-sfx.py <map.json> <events.json>"""
import json, sys
mp = json.load(open(sys.argv[1]))
def M(t):
    for a, b, n in mp["keep"]:
        if t < a: return n
        if t <= b: return n + (t - a)
    return mp["new_len"]
E = [(322.7, "whoosh_fast", -9), (323.2, "type", -14), (324.4, "pop", -14), (331.4, "pop", -14), (334.7, "pop", -14), (341.1, "ping", -13), (346.3, "pop", -12), (346.9, "pop", -12), (347.5, "pop", -12),
 (351.6, "pop", -13), (357.6, "whoosh", -11), (357.8, "pop", -13), (360.6, "pop", -13), (363.3, "pop", -13), (365.7, "click", -13), (366.5, "type", -15), (368.5, "ping", -13),
 (372.4, "whoosh_fast", -10), (373.7, "click", -14), (375.2, "click", -14), (376.7, "click", -14), (378.2, "click", -14), (379.7, "click", -14), (385.0, "stamp", -12),
 (388.5, "glitch", -11), (389.2, "type", -14), (393.2, "ping", -13), (397.0, "stamp", -11),
 (404.3, "riser", -12), (405.0, "click", -15), (406.1, "click", -15), (407.2, "click", -15), (407.7, "pop", -12), (408.3, "click", -15), (409.4, "click", -15), (411.0, "pop", -12)]
ev, last = [], -9
for t, s, d in sorted((M(t), s, d) for t, s, d in E):
    if t - last >= 0.65: ev.append(dict(t=round(t, 3), sfx=s, db=d)); last = t
json.dump(ev, open(sys.argv[2], "w"), indent=1); print(len(ev), "of", len(E))
