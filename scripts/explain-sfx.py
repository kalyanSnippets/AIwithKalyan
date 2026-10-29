#!/usr/bin/env python3
"""SFX events for the explanation + setup sections, authored in OLD time and mapped to the tightened timeline.
  python3 scripts/explain-sfx.py <map.json> <events.json>"""
import json, sys
mp = json.load(open(sys.argv[1]))
def M(t):
    for a, b, n in mp["keep"]:
        if t < a: return n
        if t <= b: return n + (t - a)
    return mp["new_len"]
E = [(124.8, "pop", -13), (126.9, "whoosh_fast", -12), (131.0, "whoosh_fast", -9), (131.9, "pop", -14), (136.4, "click", -13), (140.8, "whoosh", -13), (142.0, "pop", -12),
 (144.5, "whoosh_slow", -12), (148.0, "stamp", -11), (151.8, "ping", -13), (154.0, "whoosh_down", -11), (159.2, "pop", -13), (160.0, "pop", -13), (160.8, "pop", -13), (161.6, "pop", -13), (162.4, "pop", -13), (163.3, "chime", -12),
 (165.2, "pop", -13), (170.0, "glitch", -12), (173.9, "whoosh_fast", -12), (176.2, "slam", -12), (179.4, "whoosh_fast", -10), (181.5, "click", -14), (185.0, "click", -14),
 (189.3, "whoosh", -11), (190.4, "stamp", -13), (192.1, "stamp", -13), (193.9, "stamp", -13), (195.5, "ping", -13), (196.9, "ping", -13), (198.3, "ping", -13), (202.1, "stamp", -10),
 (203.9, "pop", -12), (209.5, "whoosh_slow", -12), (210.3, "pop", -13), (213.3, "pop", -13), (214.8, "pop", -13),
 (219.5, "whoosh_fast", -9), (222.5, "type", -15), (225.1, "ping", -14), (228.8, "type", -15), (231.2, "ping", -14), (236.9, "type", -15),
 (243.8, "whoosh_fast", -9), (244.7, "type", -15), (246.3, "ping", -14), (255.6, "glitch", -15), (261.9, "type", -15),
 (262.8, "whoosh_fast", -9), (264.1, "type", -15), (270.9, "click", -14), (274.9, "click", -14), (276.9, "slam", -11), (280.7, "stamp", -11),
 (286.0, "whoosh_fast", -9), (293.8, "type", -15), (296.0, "chime", -11), (300.5, "whoosh_down", -11), (303.0, "pop", -13), (308.3, "ping", -13),
 (312.6, "whoosh_fast", -9), (316.5, "type", -15), (318.7, "type", -15), (320.8, "slam", -9)]
ev, last = [], -9
for t, s, d in sorted((M(t), s, d) for t, s, d in E):
    if t - last >= 0.65: ev.append(dict(t=round(t, 3), sfx=s, db=d)); last = t
json.dump(ev, open(sys.argv[2], "w"), indent=1); print(len(ev), "of", len(E), "events kept")
