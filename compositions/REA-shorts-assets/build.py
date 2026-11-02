#!/usr/bin/env python3
"""Build the two REA v2 Shorts (1080x1920 HyperFrames compositions) from their cut word timings.

  python3 compositions/REA-shorts-assets/build.py      (run from the repo root)

Writes compositions/REA-short-1 and REA-short-2 (index.html, media, img, fonts, vendor) and
REA/renders/shorts/shortN/sfx-cues.json. Every visual is placed by the words it belongs to, so timings
follow the cut exactly. Style: the long video's look (dark glass, coral, Inter) at Shorts energy.
"""
import json, os, re, shutil, subprocess

ROOT = os.getcwd()
A = "compositions/REA-shorts-assets"
P3, P1 = "compositions/REA-v2-part3", "compositions/REA-v2-part1"
ICONS = "node_modules/lucide-static/icons/"


def icon(n):
    t = re.sub(r"<!--.*?-->", "", open(ICONS + n + ".svg").read(), flags=re.S).strip()
    return re.sub(r"\s+", " ", t)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


class Words:
    def __init__(self, f):
        self.w = json.load(open(f))

    def at(self, phrase, end=False, after=0.0):
        toks = [norm(x) for x in phrase.split()]
        for i in range(len(self.w) - len(toks) + 1):
            if self.w[i]["start"] < after:
                continue
            if all(norm(self.w[i + k]["text"]) == toks[k] for k in range(len(toks))):
                return self.w[i + len(toks) - 1]["end"] if end else self.w[i]["start"]
        raise KeyError(phrase)


CSS = """
@font-face { font-family:"Inter"; src:url("fonts/Inter-600.woff2") format("woff2"); font-weight:600; font-display:block; }
@font-face { font-family:"Inter"; src:url("fonts/Inter-800.woff2") format("woff2"); font-weight:800; font-display:block; }
:root { --bg:#0B0B0D; --ink:#F6F1EC; --mute:rgba(246,241,236,.68); --coral:#E8775F; --coralHi:#FF9E88; --steel:#7F95AB; --ok:#5BD69A; --red:#FF5A5A; }
html, body { margin:0; background:var(--bg); }
#root { position:relative; width:1080px; height:1920px; overflow:hidden; background:var(--bg); font-family:"Inter",system-ui,sans-serif; color:var(--ink); }
.fill { position:absolute; inset:0; }
.ic svg { width:100%; height:100%; display:block; }
.hot { color:var(--coral); }
#bd { z-index:0; opacity:0; }
.blob { position:absolute; border-radius:50%; filter:blur(110px); }
#grid { background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px); background-size:90px 90px; }
#camwrap { position:absolute; left:0; top:0; width:1080px; height:1920px; overflow:hidden; z-index:4; transform-origin:0 0; }
#camring { position:absolute; inset:0; border:0 solid var(--coral); pointer-events:none; }
#campush { position:absolute; inset:0; transform-origin:52% 36%; }
#cam { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:55% 34%; }
.v { position:absolute; visibility:hidden; z-index:3; }
.top { z-index:6; }
.card { border-radius:30px; overflow:hidden; background:#fff; border:3px solid rgba(255,255,255,.2); box-shadow:0 40px 100px rgba(0,0,0,.6); }
.card img, .card video { position:absolute; display:block; }
.glass { border-radius:36px; background:rgba(14,14,18,.82); border:2px solid rgba(255,255,255,.15); box-shadow:0 40px 90px rgba(0,0,0,.5); }
.pill { position:absolute; padding:14px 30px; border-radius:999px; font-weight:800; font-size:40px; white-space:nowrap; display:flex; align-items:center; gap:14px; }
.pill .ic { width:44px; height:44px; }
.pill.c { background:var(--coral); color:#111; }
.pill.d { background:rgba(14,14,18,.88); border:2px solid rgba(255,255,255,.18); color:var(--ink); }
.pill.d .ic { color:var(--coral); }
.pill.s { background:rgba(127,149,171,.92); color:#0b0b0d; }
.kin { position:absolute; left:40px; right:40px; text-align:center; font-weight:800; letter-spacing:-4px; line-height:.95; text-shadow:0 10px 30px rgba(0,0,0,.6); -webkit-text-stroke:3px rgba(0,0,0,.35); paint-order:stroke fill; }
.ring { position:absolute; border:8px solid var(--coral); border-radius:50%; opacity:0; box-shadow:0 0 0 4px rgba(0,0,0,.25); }
.box { position:absolute; border:7px solid var(--coral); border-radius:14px; opacity:0; }
.q { position:absolute; width:120px; height:120px; border-radius:50%; background:#0B0B12; border:8px solid var(--coral); color:#fff; font-weight:800; font-size:84px; display:flex; align-items:center; justify-content:center; box-shadow:0 14px 40px rgba(0,0,0,.6); }
.circ { position:absolute; width:250px; height:250px; border-radius:50%; background:rgba(14,14,18,.82); border:3px solid rgba(255,255,255,.18); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; font-weight:800; font-size:34px; letter-spacing:2px; }
.circ .ic { width:100px; height:100px; color:var(--coral); }
.rhead { position:absolute; left:40px; top:150px; display:flex; align-items:center; gap:24px; font-weight:800; font-size:62px; letter-spacing:-2px; }
.rhead .rn { width:110px; height:110px; border-radius:50%; background:var(--coral); color:#111; display:flex; align-items:center; justify-content:center; font-size:66px; flex:none; }
.chip { padding:22px 34px; border-radius:24px; font-weight:800; font-size:64px; text-align:center; }
.mono { font-family:"DejaVu Sans Mono",Consolas,monospace; }
.cap { position:absolute; left:60px; right:130px; top:1330px; display:flex; flex-wrap:wrap; justify-content:center; gap:4px 26px; visibility:hidden; z-index:8; }
.w { display:inline-block; font-weight:800; font-size:94px; line-height:1.02; letter-spacing:-2px; text-transform:uppercase; color:#fff; -webkit-text-stroke:7px #000; paint-order:stroke fill; text-shadow:0 10px 0 rgba(0,0,0,.5), 0 16px 34px rgba(0,0,0,.5); opacity:0; }
#flash { background:#fff; opacity:0; z-index:9; }
"""

JS_HELPERS = r"""
let tl = gsap.timeline({ paused: true });
const bo = "back.out(1.8)", p3 = "power3.out";
const $ = (s) => document.querySelector(s);
// PiP card bottom-left: the whole 9:16 frame scaled to 27% (292x518) at x 40, y 1075
const PS = .27, PX = 40, PY = 1075;
function pipIn(t, d = .45) {
  tl.to("#bd", { opacity: 1, duration: .25 }, t);
  tl.to("#camwrap", { x: PX, y: PY, scale: PS, borderRadius: 150, duration: d, ease: "expo.inOut" }, t);
  tl.to("#camring", { borderWidth: 30, borderRadius: 150, duration: d, ease: "expo.inOut" }, t);
  tl.to(".capbox", { x: 175, scale: .7, duration: d, ease: "expo.inOut" }, t);
}
function pipOut(t, d = .42) {
  tl.to("#camwrap", { x: 0, y: 0, scale: 1, borderRadius: 0, duration: d, ease: "expo.inOut" }, t);
  tl.to("#camring", { borderWidth: 0, borderRadius: 0, duration: d, ease: "expo.inOut" }, t);
  tl.to(".capbox", { x: 0, scale: 1, duration: d, ease: "expo.inOut" }, t);
  tl.to("#bd", { opacity: 0, duration: .25 }, t + d * .6);
}
function punch(a, b, s = 1.08) { tl.to("#campush", { scale: s, duration: .35, ease: p3 }, a); if (b) tl.to("#campush", { scale: 1, duration: .35, ease: p3 }, b); }
function flash(t) { tl.fromTo("#flash", { opacity: 0 }, { opacity: .45, duration: .05, yoyo: true, repeat: 1, ease: "none", immediateRender: false }, t); }
// whoosh-slide in from the right, out to the left
function slide(id, a, b) {
  tl.set(id, { visibility: "visible" }, a);
  tl.fromTo(id, { x: 1100, rotate: 4, opacity: 1 }, { x: 0, rotate: 0, duration: .32, ease: "power4.out", immediateRender: false }, a);
  if (b != null) { tl.to(id, { x: -1100, rotate: -4, duration: .26, ease: "power3.in" }, b - .26); tl.set(id, { visibility: "hidden" }, b); }
}
function pop(id, a, b, r = -3) {
  tl.set(id, { visibility: "visible" }, a);
  tl.fromTo(id, { scale: 0, rotate: r * 4, opacity: 1 }, { scale: 1, rotate: r, duration: .38, ease: bo, immediateRender: false }, a);
  if (b != null) { tl.to(id, { scale: 0, opacity: 0, duration: .18, ease: "power2.in" }, b - .18); tl.set(id, { visibility: "hidden" }, b); }
}
function fadeIn(id, a, b) {
  tl.set(id, { visibility: "visible" }, a);
  tl.fromTo(id, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .3, ease: p3, immediateRender: false }, a);
  if (b != null) { tl.to(id, { opacity: 0, duration: .18 }, b - .18); tl.set(id, { visibility: "hidden" }, b); }
}
function ring(id, a, b) {
  tl.to(id, { opacity: 1, duration: .01 }, a);
  tl.fromTo(id, { scale: 1.7 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, a);
  if (b != null) tl.to(id, { opacity: 0, duration: .2 }, b);
}
function boxIn(id, a, b) {
  tl.to(id, { opacity: 1, duration: .01 }, a);
  tl.fromTo(id, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: .35, ease: p3, immediateRender: false }, a);
  if (b != null) tl.to(id, { opacity: 0, duration: .2 }, b);
}
function count(sel, to, a, d, fmt) { const el = $(sel), c = { v: 0 }; tl.to(c, { v: to, duration: d, ease: "power3.out", onUpdate: () => { el.textContent = fmt(c.v); } }, a); }
function typeIn(sel, a, d) { const el = $(sel), txt = el.dataset.t, k = { n: 0 }; tl.to(k, { n: txt.length, duration: d, ease: "none", onUpdate: () => { el.textContent = txt.slice(0, Math.round(k.n)); } }, a); }
"""

JS_CAPTIONS = r"""
const groups = []; let g = null;
for (const [txt, s, e] of WORDS) {
  if (!g || g.w.length >= 3 || s - g.end > .35 || /[.?!:,]$/.test(g.w[g.w.length - 1][0])) { g = { w: [], end: e }; groups.push(g); }
  g.w.push([txt, s, e]); g.end = e;
}
const root = $("#root");
groups.forEach((gr, i) => {
  const d = document.createElement("div"); d.className = "cap capbox";
  gr.w.forEach(([txt]) => { const s = document.createElement("span"); s.className = "w"; s.textContent = txt.replace(/[,.!?;:"“”]+$/, "").replace(/^["“]/, ""); d.appendChild(s); });
  root.appendChild(d);
  const a = gr.w[0][1], next = groups[i + 1] ? groups[i + 1].w[0][1] : gr.end + .5;
  const b = Math.min(next, gr.end + .4);
  tl.set(d, { visibility: "visible" }, a);
  d.querySelectorAll(".w").forEach((w, k) => {
    tl.fromTo(w, { scale: .3, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: .2, ease: "back.out(2.6)", immediateRender: false }, gr.w[k][1]);
    tl.to(w, { color: "#E8775F", duration: .05 }, gr.w[k][1]);
    tl.to(w, { color: "#FFFFFF", duration: .08 }, Math.min(gr.w[k][2], b));
  });
  tl.set(d, { visibility: "hidden" }, b);
});
"""


def page(cid, dur, body, js):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>{cid}</title>
<script src="vendor/gsap.min.js"></script>
<script src="words.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="{cid}" data-start="0" data-width="1080" data-height="1920" data-duration="{dur:.3f}">
  <div id="bd" class="fill">
    <div class="blob" id="b1" style="width:800px;height:800px;left:-260px;top:-260px;background:rgba(232,119,95,.30)"></div>
    <div class="blob" id="b2" style="width:760px;height:760px;right:-280px;bottom:-200px;background:rgba(127,149,171,.22)"></div>
    <div id="grid" class="fill"></div>
  </div>
  <div id="camwrap"><div id="campush"><video id="cam" class="clip" src="media/cam.mp4" playsinline data-has-audio="true" data-start="0" data-duration="{dur:.3f}" data-media-start="0" data-track-index="1"></video></div><div id="camring"></div></div>
{body}
  <div id="flash" class="fill"></div>
</div>
<script>
{JS_HELPERS}
tl.fromTo("#b1", {{ x: 0, y: 0 }}, {{ x: 260, y: 300, duration: {dur:.3f}, ease: "none" }}, 0);
tl.fromTo("#grid", {{ y: 0 }}, {{ y: -450, duration: {dur:.3f}, ease: "none" }}, 0);
{JS_CAPTIONS}
{js}
window.__timelines["{cid}"] = tl;
</script>
</body>
</html>
"""


# ---------- shared visual blocks ----------
def gh_block():  # GitHub repo page (Kalyan's recording), star count
    return f"""  <div class="v" id="gh" style="left:40px;top:190px;width:1000px;height:560px">
    <div class="card" id="ghc" style="position:absolute;inset:0;background:#0d1117"><div id="ghz" style="position:absolute;left:0;top:0;width:1000px;height:500px;transform-origin:0 0">
      <video class="clip" id="ghv" src="media/gh.mp4" muted playsinline data-start="0" data-duration="5" data-media-start="1" data-track-index="2" style="left:0;top:0;width:1000px;height:500px"></video></div></div>
    <div class="pill d" style="left:0;top:-80px;font-size:30px"><span class="ic">{icon('link')}</span>github.com/morluto/rea</div></div>
  <div class="v top" id="stars" style="left:40px;top:800px;width:1000px;text-align:center">
    <div style="display:flex;align-items:center;justify-content:center;gap:24px"><span class="ic" style="width:150px;height:150px;color:var(--coral)">{icon('star')}</span>
    <span id="starN" style="font-weight:800;font-size:220px;letter-spacing:-10px;color:var(--coral);line-height:1">0K</span></div>
    <div style="font-weight:800;font-size:48px;letter-spacing:6px;color:var(--mute);margin-top:6px">STARS ON GITHUB</div></div>
"""


def gh_js(w):
    a = 0.0
    b = w.at("on GitHub", end=True) + 0.15
    return f"""
pipIn(0, .01);
tl.set("#gh", {{ visibility: "visible" }}, 0); tl.set("#gh", {{ visibility: "hidden" }}, {b:.2f});
tl.fromTo("#ghz", {{ scale: 1, x: 0, y: 0 }}, {{ scale: 2.4, x: -1640, y: -330, duration: 1.4, ease: "power3.inOut" }}, .35);
pop("#stars", {w.at("400,000"):.2f} - .15, {b:.2f});
count("#starN", 399, {w.at("400,000"):.2f} - .15, .9, (v) => Math.round(v) + "K");
"""


def built_block():  # one link -> ~20 min -> the REA Board
    return f"""  <div class="v" id="lnk" style="left:40px;top:260px;width:1000px">
    <div class="glass" style="padding:40px 44px">
      <div style="display:flex;align-items:center;gap:22px;font-weight:800;font-size:76px"><span class="ic" style="width:90px;height:90px;color:var(--coral)">{icon('link')}</span>1 LINK</div>
      <div class="mono" style="margin-top:20px;font-size:30px;color:var(--mute);word-break:break-all">boards.wekan.team/b/…/wekan-r-open-source-kanban-board</div>
      <div class="pill s" style="position:relative;display:inline-flex;margin-top:26px;font-size:34px">Original: open-source Kanban app (MIT)</div></div></div>
  <div class="v top" id="tmr" style="left:300px;top:760px"><div class="pill c" style="font-size:64px;padding:20px 44px"><span class="ic" style="width:66px;height:66px">{icon('timer')}</span>~20 MIN</div></div>
  <div class="v" id="built" style="left:40px;top:250px;width:1000px;height:780px">
    <div class="pill c" style="left:0;top:0;font-size:38px"><span class="ic">{icon('sparkles')}</span>Built by Claude Code + REA</div>
    <div class="card" style="position:absolute;left:0;top:96px;width:1000px;height:469px"><img src="img/reaboard.png" style="left:0;top:0;width:1000px;height:469px"></div>
    <div class="pill s" style="left:0;top:600px;font-size:32px">Copy of an open-source Kanban app (MIT)</div></div>
"""


def built_js(w, end):
    a = w.at("And today")
    l1 = w.at("one link")
    t20 = w.at("twenty minutes")
    bt = w.at("it built this")
    return f"""
pipIn({a:.2f});
slide("#lnk", {a + .05:.2f}, {bt:.2f});
pop("#tmr", {t20:.2f}, {bt:.2f}, 3);
slide("#built", {bt:.2f}, {end:.2f}); flash({bt + .05:.2f});
"""


def boards_split(prefix, labels):  # two boards side by side, cropped to the left lists
    lab = ""
    if labels:
        lab = f"""<div class="pill s" id="{prefix}LL" style="left:0;top:0;font-size:32px;visibility:hidden">ORIGINAL</div>
    <div class="pill c" id="{prefix}LR" style="left:510px;top:0;font-size:32px;visibility:hidden">REA BOARD</div>"""
    return f"""  <div class="v" id="{prefix}" style="left:40px;top:250px;width:1000px;height:640px">
    {lab}
    <div class="card" id="{prefix}PL" style="position:absolute;left:0;top:80px;width:490px;height:420px"><img src="img/wekan.png" style="left:0;top:0;width:857px;height:402px"></div>
    <div class="card" id="{prefix}PR" style="position:absolute;left:510px;top:80px;width:490px;height:420px"><img src="img/reaboard.png" style="left:0;top:-24px;width:857px;height:402px"></div>
  </div>
"""


# ---------- Short 1 ----------
def short1(w, dur):
    E = {}
    body = gh_block() + built_block()
    js = gh_js(w)
    # REA name + 3 verbs, full camera
    t = w.at("It's called")
    pipOut_t = t
    body += f"""  <div class="v top" id="reaT" style="left:0;top:70px;width:1080px;text-align:center">
    <div style="font-weight:800;font-size:200px;letter-spacing:-8px;line-height:1;color:#fff;text-shadow:0 12px 40px rgba(0,0,0,.6)">RE<span class="hot">A</span></div>
    <div style="font-weight:800;font-size:40px;letter-spacing:3px;margin-top:4px;text-shadow:0 6px 20px rgba(0,0,0,.7)">REVERSE ENGINEER ANYTHING</div></div>
  <div class="v top" id="vb" style="left:0;top:70px;width:1080px;height:260px">
    <div class="circ" id="vb1" style="left:60px;top:0;visibility:hidden"><span class="ic">{icon('eye')}</span>OPEN</div>
    <div class="circ" id="vb2" style="left:415px;top:0;visibility:hidden"><span class="ic">{icon('ruler')}</span>MEASURE</div>
    <div class="circ" id="vb3" style="left:770px;top:0;visibility:hidden"><span class="ic">{icon('hammer')}</span>REBUILD</div></div>
"""
    v1, v2, v3 = w.at("open any app"), w.at("measure it"), w.at("rebuild it")
    e3 = w.at("rebuild it", end=True) + .3
    js += f"""
pipOut({t - .1:.2f});
pop("#reaT", {w.at("Reverse Engineer"):.2f}, {v1 - .05:.2f}, 0); punch({w.at("REA for short"):.2f}, {v1:.2f});
tl.set("#vb", {{ visibility: "visible" }}, {v1:.2f}); tl.set("#vb, #vb1, #vb2, #vb3", {{ visibility: "hidden" }}, {e3:.2f});
pop("#vb1", {v1:.2f}, null, 0); pop("#vb2", {v2:.2f}, null, 0); pop("#vb3", {v3:.2f}, null, 0);
"""
    q = w.at("Can you tell")
    js += built_js(w, q)
    # which is real?
    left = w.at("On the left")
    body += boards_split("sp", True)
    body += """  <div class="v top" id="spQ" style="left:40px;top:330px;width:1000px;height:420px">
    <div class="q" style="left:185px;top:150px">?</div><div class="q" style="left:695px;top:150px">?</div></div>
  <div class="v top" id="spH" style="left:40px;top:800px;width:1000px;text-align:center;font-weight:800;font-size:120px;letter-spacing:-5px;line-height:.95;text-shadow:0 10px 30px rgba(0,0,0,.6)">WHICH IS <span class="hot">REAL?</span></div>
"""
    top = w.at("Look at the top bar")
    js += f"""
slide("#sp", {q:.2f}, {top:.2f});
pop("#spQ", {q + .2:.2f}, {left:.2f}, 0); pop("#spH", {w.at("real app"):.2f}, {left + .1:.2f}, -2);
pop("#spLL", {left:.2f}, null, -2); pop("#spLR", {w.at("On the right"):.2f}, null, 2);
"""
    # top bar + orange strip (REA board big, original below)
    s = 1000 / 1920
    body += f"""  <div class="v" id="tb" style="left:40px;top:170px;width:1000px;height:980px">
    <div class="pill c" style="left:0;top:0;font-size:30px">REA BOARD</div>
    <div class="card" style="position:absolute;left:0;top:64px;width:1000px;height:469px"><img src="img/reaboard.png" style="left:0;top:0;width:1000px;height:469px"></div>
    <div class="box" id="tbBar" style="left:-6px;top:58px;width:1012px;height:{60 * s + 12:.0f}px"></div>
    <div class="ring" id="tbMenu" style="left:{214 * s - 10:.0f}px;top:{64 + 2:.0f}px;width:{190 * s + 20:.0f}px;height:{26 + 20:.0f}px;border-radius:18px"></div>
    <div class="ring" id="tbAv" style="left:{1700 * s - 12:.0f}px;top:{64 - 4:.0f}px;width:{210 * s + 24:.0f}px;height:60px;border-radius:30px"></div>
    <div class="box" id="tbStripR" style="left:-6px;top:{64 + 60 * s - 4:.0f}px;width:1012px;height:{40 * s + 10:.0f}px"></div>
    <div id="tbO" style="position:absolute;left:0;top:545px;width:1000px;height:370px;visibility:hidden">
      <div class="pill s" style="left:0;top:0;font-size:30px">ORIGINAL</div>
      <div class="card" style="position:absolute;left:0;top:64px;width:1000px;height:290px"><img src="img/wekan.png" style="left:0;top:0;width:1000px;height:469px"></div>
      <div class="box" id="tbStripL" style="left:-6px;top:58px;width:1012px;height:{60 * s + 12:.0f}px"></div></div></div>
"""
    red = w.at("And see this red")
    strip = w.at("Below it")
    js += f"""
slide("#tb", {top:.2f}, {red:.2f});
boxIn("#tbBar", {top + .3:.2f}, {w.at("blue with"):.2f}); ring("#tbMenu", {w.at("blue menu"):.2f}, {w.at("four avatars"):.2f}); ring("#tbAv", {w.at("four avatars"):.2f}, {strip:.2f});
fadeIn("#tbO", {strip:.2f}); boxIn("#tbStripR", {w.at("orange strip"):.2f}); boxIn("#tbStripL", {w.at("orange strip") + .1:.2f});
"""
    # WIP 4/3 zoom on both
    body += """  <div class="v" id="wip" style="left:40px;top:220px;width:1000px;height:760px">
    <div class="pill s" style="left:0;top:0;font-size:32px">ORIGINAL</div><div class="pill c" style="left:510px;top:0;font-size:32px">REA BOARD</div>
    <div class="card" style="position:absolute;left:0;top:80px;width:490px;height:420px"><img src="img/wekan.png" style="left:-20px;top:-200px;width:2880px;height:1350px"></div>
    <div class="card" style="position:absolute;left:510px;top:80px;width:490px;height:420px"><img src="img/reaboard.png" style="left:-20px;top:-300px;width:2880px;height:1350px"></div>
    <div class="ring" id="wipL" style="left:20px;top:122px;width:150px;height:80px;border-radius:40px"></div>
    <div class="ring" id="wipR" style="left:530px;top:122px;width:150px;height:80px;border-radius:40px"></div>
    <div class="pill d" id="wipS" style="left:150px;top:560px;font-size:48px;visibility:hidden">WORK-IN-PROGRESS LIMIT</div>
    <div class="pill c" id="wipC" style="left:300px;top:660px;font-size:56px;visibility:hidden"><span class="ic" style="width:56px;height:56px">""" + icon("check") + """</span>COPIED</div></div>
"""
    drag = w.at("Now the big test")
    js += f"""
slide("#wip", {red:.2f}, {drag:.2f});
ring("#wipL", {w.at("four slash three"):.2f}); ring("#wipR", {w.at("four slash three") + .12:.2f});
tl.to("#wipL, #wipR", {{ scale: 1.15, duration: .2, yoyo: true, repeat: 3 }}, {w.at("turns red"):.2f});
pop("#wipS", {w.at("work in progress"):.2f}, null, -2); pop("#wipC", {w.at("Claude even copied"):.2f}, null, 3);
"""
    # live drag test (Kalyan's screen recording, the same moment as the long video)
    imp = w.at("Honestly")
    live_media = 25.31  # live.mp4 offset of "Now the big test" in the long video (6:10.93 - 5:45.62)
    body += f"""  <div class="v" id="lv" style="left:40px;top:180px;width:1000px;height:930px">
    <div class="card" style="position:absolute;left:0;top:0;width:1000px;height:930px">
      <video class="clip" id="lvv" src="media/live.mp4" muted playsinline data-start="{drag:.3f}" data-duration="{imp - drag:.3f}" data-media-start="{live_media:.2f}" data-track-index="2" style="left:-760px;top:-20px;width:2061px;height:966px"></video></div>
    <div class="pill c" id="lvS" style="left:220px;top:780px;font-size:56px;visibility:hidden"><span class="ic" style="width:56px;height:56px">{icon('mouse-pointer-click')}</span>DRAG &amp; DROP ✓</div></div>
"""
    js += f"""
slide("#lv", {drag:.2f}, {imp:.2f});
pop("#lvS", {w.at("then it works"):.2f}, null, -2);
"""
    # impressed, one prompt (full camera)
    hc = w.at("How close")
    body += f"""  <div class="v top" id="op" style="left:0;top:90px;width:1080px;text-align:center">
    <div class="pill c" style="position:relative;display:inline-flex;font-size:72px;padding:20px 46px"><span class="ic" style="width:72px;height:72px">{icon('sparkles')}</span>1 PROMPT</div></div>
"""
    js += f"""
pipOut({imp - .05:.2f}); punch({imp:.2f}, {hc - .4:.2f});
pop("#op", {w.at("one prompt"):.2f}, {hc:.2f}, -2);
"""
    # how close was it? comments -> loop
    body += boards_split("cl", False).replace('id="cl"', 'id="cl"')
    body += """  <div class="v top" id="clG" style="left:40px;top:790px;width:1000px;display:flex;justify-content:center;gap:26px">
    <div class="chip glass">50%</div><div class="chip glass">80%</div><div class="chip glass" style="background:var(--coral);color:#111">90%?</div></div>
  <div class="v top" id="clC" style="left:200px;top:180px"><div class="pill c" style="font-size:44px"><span class="ic" style="width:48px;height:48px">""" + icon("message-circle") + """</span>Tell me in the comments</div></div>
"""
    js += f"""
pipIn({hc - .05:.2f});
slide("#cl", {hc:.2f}, null); pop("#clG", {hc + .35:.2f}, null, 0); pop("#clC", {w.at("Tell me"):.2f}, null, -2);
"""
    cues = [(0.3, "whoosh"), (w.at("400,000") - .1, "pop"), (t, "whip"), (v1, "pop"), (v3, "pop"), (w.at("one link"), "whoosh"),
            (w.at("it built this"), "whoosh"), (q, "whoosh"), (left, "pop"), (top, "whoosh"), (red, "whoosh"), (w.at("Claude even copied"), "ding"),
            (drag, "whoosh"), (w.at("then it works"), "pop"), (imp, "whip"), (hc, "whoosh"), (w.at("Tell me"), "pop")]
    return body, js, cues


# ---------- Short 2 ----------
def short2(w, dur):
    body = gh_block() + built_block()
    js = gh_js(w)
    h = w.at("So is Rea")
    js += built_js(w, h)
    yes = w.at("My answer is yes")
    three = w.at("Three reasons")
    one = w.at("One, it measures")
    body += f"""  <div class="v top" id="hy" style="left:0;top:80px;width:1080px" ><div class="kin" style="font-size:118px">WORTH THE <span class="hot">HYPE?</span></div></div>
  <div class="v top" id="ys" style="left:290px;top:80px"><div class="pill c" style="font-size:110px;padding:18px 56px"><span class="ic" style="width:110px;height:110px">{icon('check')}</span>YES</div></div>
  <div class="v top" id="r3" style="left:0;top:90px;width:1080px;display:flex;justify-content:center;gap:30px">
    <div class="chip" id="r31" style="background:var(--coral);color:#111;font-size:90px;width:150px;padding:20px 0">1</div><div class="chip" id="r32" style="background:var(--coral);color:#111;font-size:90px;width:150px;padding:20px 0">2</div><div class="chip" id="r33" style="background:var(--coral);color:#111;font-size:90px;width:150px;padding:20px 0">3</div></div>
"""
    js += f"""
pipOut({h - .1:.2f});
pop("#hy", {w.at("worth the hype"):.2f}, {yes:.2f}, 0); punch({w.at("Let me be honest"):.2f}, null);
pop("#ys", {yes:.2f}, {three:.2f}, -3); tl.to("#campush", {{ scale: 1.12, duration: .3, ease: p3 }}, {yes:.2f});
tl.set("#r3", {{ visibility: "visible" }}, {three:.2f}); tl.set("#r3", {{ visibility: "hidden" }}, {one:.2f});
tl.fromTo("#r31, #r32, #r33", {{ scale: 0 }}, {{ scale: 1, duration: .3, ease: bo, stagger: .12, immediateRender: false }}, {three:.2f});
tl.to("#campush", {{ scale: 1, duration: .3, ease: p3 }}, {one - .1:.2f});
"""
    # reason 1: measured, real terminal output
    two = w.at("Number two")
    body += f"""  <div class="v" id="rs1" style="left:0;top:0;width:1080px;height:1150px">
    <div class="rhead"><div class="rn">1</div>MEASURES, NOT GUESSES</div>
    <div class="card" style="position:absolute;left:40px;top:330px;width:1000px;height:300px;background:#0C0C0C"><img src="img/term.png" style="left:-20px;top:-80px;width:2000px;height:625px"></div>
    <div class="box" id="rs1b" style="left:50px;top:440px;width:900px;height:150px"></div>
    <div class="pill d" style="left:40px;top:670px;font-size:30px">Claude's real report · exact colour codes</div></div>
"""
    js += f"""
pipIn({one - .05:.2f});
slide("#rs1", {one:.2f}, {two:.2f}); boxIn("#rs1b", {w.at("it does not guess"):.2f});
"""
    # reason 2: it really works, live test (drag, then card panel)
    t3 = w.at("Three is Claude")
    dd = w.at("Drag and drop")
    cp = w.at("the card panel")
    body += f"""  <div class="v" id="rs2" style="left:0;top:0;width:1080px;height:1150px">
    <div class="rhead"><div class="rn">2</div>IT REALLY WORKS</div>
    <div class="card" style="position:absolute;left:40px;top:330px;width:1000px;height:760px">
      <video class="clip" id="lvA" src="media/live.mp4" muted playsinline data-start="{two:.3f}" data-duration="{cp - two:.3f}" data-media-start="23.6" data-track-index="2" style="left:-760px;top:-60px;width:1781px;height:835px"></video>
      <video class="clip" id="lvB" src="media/live.mp4" muted playsinline data-start="{cp:.3f}" data-duration="{t3 - cp:.3f}" data-media-start="10.0" data-track-index="3" style="left:-1050px;top:-10px;width:2061px;height:966px"></video></div></div>
"""
    js += f"""
slide("#rs2", {two:.2f}, {t3:.2f}); flash({cp:.2f});
"""
    # reason 3: 50 checks with the real mouse
    but = w.at("But there is a but")
    body += f"""  <div class="v" id="rs3" style="left:0;top:0;width:1080px;height:1150px">
    <div class="rhead"><div class="rn">3</div>TESTED ITS OWN WORK</div>
    <div class="glass" style="position:absolute;left:40px;top:330px;width:1000px;height:330px;overflow:hidden;background:#0C0C0C">
      <div style="height:54px;display:flex;align-items:center;padding:0 26px;background:#1A1C21;font-weight:600;font-size:24px;color:var(--mute)">Claude Code · final report</div>
      <div class="mono" style="padding:26px 34px;font-size:36px;line-height:1.4;color:var(--ink)"><span style="color:var(--ok)">●</span> All <b style="color:var(--coral)">50 checks passed</b> in a visible Chrome window, and every drag used the <b style="color:var(--coral)">real mouse</b>.</div></div>
    <div class="box" id="rs3b" style="left:34px;top:324px;width:1012px;height:342px"></div>
    <div class="v top" id="rs3c" style="left:200px;top:700px"><div class="pill c" style="font-size:64px;padding:20px 44px"><span class="ic" style="width:64px;height:64px">{icon('badge-check')}</span>50 / 50 CHECKS</div></div>
    <div class="pill d" style="left:40px;top:860px;font-size:30px">Real mouse, real Chrome window</div></div>
"""
    js += f"""
slide("#rs3", {t3:.2f}, {but:.2f}); boxIn("#rs3b", {t3 + .3:.2f}); pop("#rs3c", {w.at("Fifty checks"):.2f}, null, -2);
"""
    # but…
    nm = w.at("Rea is not magic")
    body += """  <div class="v top" id="bt" style="left:0;top:70px;width:1080px"><div class="kin hot" style="font-size:190px">BUT…</div></div>
"""
    js += f"""
pipOut({but - .05:.2f}); pop("#bt", {w.at("a but"):.2f}, {nm:.2f}, 0); punch({w.at("a but"):.2f}, {nm - .1:.2f}, 1.14); flash({w.at("a but"):.2f});
"""
    # not magic: real prompt vs lazy prompt
    also = w.at("Also, it took")
    lazy = w.at("A lazy prompt")
    prompt = open("REA/edits/REA-v2.script.md").read().split("> Using what you learned")[1].split("\n\n## ")[0]
    prompt = "Using what you learned" + re.sub(r"\n> ?", "\n", prompt)
    prompt = prompt.replace("&", "&amp;").replace("<", "&lt;")
    body += f"""  <div class="v" id="nm" style="left:0;top:0;width:1080px;height:1150px">
    <div class="rhead" style="font-size:66px">NOT MAGIC</div>
    <div class="glass" id="nmG" style="position:absolute;left:40px;top:300px;width:1000px;height:560px;overflow:hidden">
      <div style="position:relative;z-index:2;height:58px;display:flex;align-items:center;padding:0 26px;background:#1A1C21;font-weight:600;font-size:26px;color:var(--mute)">My real prompt · 46 lines</div>
      <div style="position:absolute;left:0;top:58px;right:0;bottom:0;overflow:hidden"><div id="nmP" class="mono" style="padding:24px 30px;font-size:25px;line-height:1.45;white-space:pre-wrap;color:var(--ink)">{prompt}</div></div></div>
    <div id="nmL" style="position:absolute;left:40px;top:300px;width:1000px;height:560px;visibility:hidden">
      <div class="glass" style="position:absolute;left:0;top:0;width:1000px;height:300px;display:flex;flex-direction:column;justify-content:center;padding:0 50px;box-sizing:border-box">
        <div style="font-weight:600;font-size:30px;color:var(--mute)">Example lazy prompt</div>
        <div class="mono" style="font-size:58px;margin-top:16px">"clone this app"</div></div>
      <div class="pill" style="left:200px;top:340px;font-size:60px;background:rgba(255,90,90,.18);border:3px solid var(--red);color:#ffb3b3"><span class="ic" style="width:60px;height:60px;color:var(--red)">{icon('x')}</span>LAZY RESULT</div></div></div>
"""
    js += f"""
pipIn({nm - .05:.2f});
slide("#nm", {nm:.2f}, {also:.2f});
tl.fromTo("#nmP", {{ y: 0 }}, {{ y: -900, duration: {lazy - nm - .3:.2f}, ease: "none" }}, {nm + .3:.2f});
tl.to("#nmG", {{ opacity: 0, scale: .9, duration: .25 }}, {lazy:.2f}); slide("#nmL", {lazy:.2f}, null); flash({w.at("lazy result"):.2f});
"""
    # limits: 20 min, one screen
    ppl = w.at("And some people")
    body += f"""  <div class="v" id="lm" style="left:0;top:0;width:1080px;height:1150px">
    <div class="rhead" style="font-size:66px">THE LIMITS</div>
    <div id="lmT" class="pill d" style="left:40px;top:330px;font-size:70px;padding:24px 46px;visibility:hidden"><span class="ic" style="width:74px;height:74px">{icon('timer')}</span>~20 MINUTES</div>
    <div id="lmA" class="pill" style="left:40px;top:520px;font-size:58px;padding:24px 40px;background:rgba(91,214,154,.16);border:3px solid var(--ok);visibility:hidden"><span class="ic" style="width:60px;height:60px;color:var(--ok)">{icon('check')}</span>1 screen: the board</div>
    <div id="lmB" class="pill" style="left:40px;top:700px;font-size:58px;padding:24px 40px;background:rgba(255,90,90,.12);border:3px solid var(--red);color:#ffb3b3;visibility:hidden"><span class="ic" style="width:60px;height:60px;color:var(--red)">{icon('x')}</span>not the full app</div></div>
"""
    js += f"""
slide("#lm", {also:.2f}, {ppl:.2f});
pop("#lmT", {w.at("twenty minutes", after=also):.2f}, null, -2); pop("#lmA", {w.at("only one screen"):.2f}, null, 0); pop("#lmB", {w.at("not the full app"):.2f}, null, 0);
"""
    # the doubt, with its real source; then hype vs proof
    ver = w.at("So my verdict")
    hp = w.at("So the hype")
    body += f"""  <div class="v" id="gt" style="left:40px;top:200px;width:1000px;height:900px">
    <div class="pill d" style="left:0;top:0;font-size:30px"><span class="ic">{icon('link')}</span>gittested.com/reviews/morluto-rea</div>
    <div class="card" style="position:absolute;left:0;top:80px;width:1000px;height:420px;background:#F5F3EE"><img src="img/gittested.png" style="left:-180px;top:-200px;width:1600px;height:900px"></div>
    <div class="box" id="gtb" style="left:46px;top:326px;width:730px;height:84px"></div>
    <div class="pill d" style="left:0;top:530px;font-size:28px">Independent review · captured 31 Oct 2026</div></div>
  <div class="v" id="hpv" style="left:40px;top:300px;width:1000px;height:700px">
    <div style="display:flex;align-items:center;gap:30px;font-weight:800;font-size:64px"><span style="width:250px">HYPE</span><div style="flex:1;height:110px;border-radius:26px;background:rgba(255,255,255,.08);position:relative;overflow:hidden"><i id="hpH" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:var(--coral);transform-origin:left"></i></div></div>
    <div style="display:flex;align-items:center;gap:30px;font-weight:800;font-size:64px;margin-top:60px"><span style="width:250px">PROOF</span><div style="flex:1;height:110px;border-radius:26px;background:rgba(255,255,255,.08);position:relative;overflow:hidden"><i id="hpP" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:var(--steel);transform-origin:left"></i></div></div></div>
"""
    js += f"""
slide("#gt", {ppl:.2f}, {hp:.2f}); boxIn("#gtb", {w.at("What does Rea add"):.2f});
slide("#hpv", {hp:.2f}, {ver:.2f});
tl.fromTo("#hpH", {{ scaleX: 0 }}, {{ scaleX: .95, immediateRender: true, duration: .6, ease: p3 }}, {w.at("the hype is running"):.2f}); tl.fromTo("#hpP", {{ scaleX: 0 }}, {{ scaleX: .6, immediateRender: true, duration: .6, ease: p3 }}, {w.at("ahead of proof"):.2f});
"""
    # verdict + what next (full camera)
    nx = w.at("Which app")
    body += f"""  <div class="v top" id="vd" style="left:0;top:70px;width:1080px;text-align:center">
    <div class="pill c" style="position:relative;display:inline-flex;font-size:56px;padding:18px 40px"><span class="ic" style="width:62px;height:62px">{icon('scale')}</span>TRY IT · THE RIGHT WAY</div></div>
  <div class="v top" id="nx" style="left:0;top:80px;width:1080px;text-align:center">
    <div class="pill c" style="position:relative;display:inline-flex;font-size:60px;padding:18px 44px"><span class="ic" style="width:62px;height:62px">{icon('message-circle')}</span>WHICH APP NEXT?</div></div>
"""
    js += f"""
pipOut({ver - .05:.2f});
pop("#vd", {w.at("try it"):.2f}, {nx:.2f}, -2); punch({w.at("try it"):.2f}, {nx:.2f});
pop("#nx", {nx:.2f}, null, 2);
"""
    cues = [(0.3, "whoosh"), (w.at("400,000") - .1, "pop"), (w.at("one link"), "whoosh"), (w.at("it built this"), "whoosh"),
            (h, "whip"), (yes, "pop"), (three, "pop"), (one, "whoosh"), (two, "whoosh"), (t3, "whoosh"), (w.at("Fifty checks"), "ding"),
            (w.at("a but"), "whip"), (nm, "whoosh"), (lazy, "whoosh"), (also, "whoosh"), (ppl, "whoosh"), (hp, "whoosh"),
            (ver, "whip"), (nx, "pop")]
    return body, js, cues


def build(n, fn):
    sd = f"REA/renders/shorts/short{n}"
    w = Words(f"{sd}/words.json")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{sd}/rough_cut.mp4"],
                               capture_output=True, text=True).stdout)
    cid = f"rea-short-{n}"; out = f"compositions/REA-short-{n}"
    for d in ["media", "img", "fonts", "vendor"]:
        os.makedirs(f"{out}/{d}", exist_ok=True)
    shutil.copy(f"{sd}/rough_cut.mp4", f"{out}/media/cam.mp4")
    shutil.copy(f"{P1}/media/gh.mp4", f"{out}/media/gh.mp4")
    shutil.copy(f"{P3}/media/live.mp4", f"{out}/media/live.mp4")
    for f in ["wekan.png", "reaboard.png", "gittested.png"]:
        shutil.copy(f"{P3}/img/{f}", f"{out}/img/{f}")
    shutil.copy(f"{A}/term.png", f"{out}/img/term.png")
    for f in ["Inter-600.woff2", "Inter-800.woff2"]:
        shutil.copy(f"{P3}/fonts/{f}", f"{out}/fonts/{f}")
    shutil.copy(f"{P3}/vendor/gsap.min.js", f"{out}/vendor/gsap.min.js")
    shutil.copy(f"{P3}/hyperframes.json", f"{out}/hyperframes.json")
    open(f"{out}/words.js", "w").write("const WORDS=" + json.dumps([[x["text"], round(x["start"], 3), round(x["end"], 3)] for x in w.w]) + ";")
    body, js, cues = fn(w, dur)
    open(f"{out}/index.html", "w").write(page(cid, dur, body, js))
    # SFX: sparse, at least 0.9 s apart
    keep, last = [], -9
    for t, s in sorted(cues):
        if t - last >= 0.9:
            keep.append({"t": round(max(0, t - 0.05), 3), "sfx": s, "gain_db": 0.0}); last = t
    json.dump(keep, open(f"{sd}/sfx-cues.json", "w"), indent=1)
    print(f"{out}: {dur:.2f}s, {len(keep)} sfx cues")


build(1, short1)
build(2, short2)
