#!/usr/bin/env node
// CLD_1279 v2 — builds index.html (HyperFrames) from the transcript + edit decisions.
//
//   node compositions/CLD_1279/build.mjs
//
// Inputs: transcripts/CLD_1279/words.json, edits/CLD_1279.edl.json, renders/CLD_1279-cam.timeline.json
// (the tightened talking-head cut rendered by `npm run edl -- … --video-src … --audio-src …`), and
// optionally edits/CLD_1279.gaze.json (look-away windows from scripts/gaze.py).
// Every graphic is anchored to a spoken word; inserts (sample clips with their own audio, the result)
// shift everything after them.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const words = JSON.parse(readFileSync(join(ROOT, "transcripts/CLD_1279/words.json"), "utf-8"));
const pieces = JSON.parse(readFileSync(join(ROOT, "renders/CLD_1279-cam.timeline.json"), "utf-8"));
const gazePath = join(ROOT, "edits/CLD_1279.gaze.json");
const gaze = existsSync(gazePath) ? JSON.parse(readFileSync(gazePath, "utf-8")) : { windows: [] };
const RC_LEN = pieces.reduce((s, p) => s + p.dur, 0);
const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ── word lookup + time mapping ─────────────────────────────────────────────
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");
const kept = (i) => pieces.some((p) => words[i].start >= p.src - 0.001 && words[i].start <= p.src + p.dur + 0.001);
function find(phrase, from = 0) {
  const p = phrase.split(/\s+/).map(norm);
  for (let i = from; i <= words.length - p.length; i++) if (p.every((t, k) => norm(words[i + k].text) === t && kept(i + k))) return i;
  throw new Error(`phrase not found: "${phrase}" after word ${from}`);
}
function rc(src) {
  for (const p of pieces) if (src >= p.src - 0.001 && src <= p.src + p.dur + 0.001) return p.out + Math.min(src - p.src, p.dur);
  // between pieces (cut): snap to the next kept piece
  const nxt = pieces.find((p) => p.src > src);
  return nxt ? nxt.out : RC_LEN;
}
const inserts = [];
const F = (t) => r3(t + inserts.filter((x) => x.at <= t).reduce((s, x) => s + x.dur, 0));
const insertStart = (id) => {
  const x = inserts.find((i) => i.id === id);
  return r3(x.at + inserts.filter((i) => i.at < x.at).reduce((s, i) => s + i.dur, 0));
};
const T = (i) => F(rc(words[i].start));
const TE = (i) => F(rc(words[i].end));
const at = (phrase, from) => T(find(phrase, from));
const end = (phrase, from) => { const i = find(phrase, from); return TE(i + phrase.split(/\s+/).length - 1); };

// Inserts: sample clips play with their own sound right after Kalyan introduces them.
const addInsert = (id, afterPhrase, gap, dur, from) => {
  const i = find(afterPhrase, from) + afterPhrase.split(/\s+/).length - 1;
  inserts.push({ id, at: r3(rc(words[i].end) + gap), dur });
};
addInsert("raw", "the raw footage look like", 0.25, 7.6);
addInsert("edit", "compare that with this", 0.3, 6.25);
addInsert("before", "still needed work", 0.3, 3.5);
addInsert("after", "keep my natural voice", 0.3, 3.5);
addInsert("result", "normalized for playback", 0.25, 2.8 + 41.73);
inserts.sort((a, b) => a.at - b.at);
// Outro: Kalyan's ElevenLabs voice recording (no camera) after the last spoken word
const OUTRO = JSON.parse(readFileSync(join(ROOT, "transcripts/CLD_1279-outro/words.json"), "utf-8"));
const OUTRO_DUR = 25.52;
const OUTRO_AT = r3(RC_LEN + inserts.reduce((s, x) => s + x.dur, 0) + 0.4);
const TOTAL = r3(OUTRO_AT + OUTRO_DUR + 1.8);

// ── accumulators ───────────────────────────────────────────────────────────
const html = [];
const js = [];
const sfxList = [];
const covered = []; // [t0,t1] where Kalyan is not full-frame (scene, PiP, insert, transition)
const noCaps = []; // [t0,t1] caption-free windows
const OUTRO_CAPS = []; // outro words on the final timeline
let uid = 0;
const nid = (p) => `${p}-${++uid}`;
const sfx = (t, name, vol) => sfxList.push([r3(t), name, vol]);
const J = JSON.stringify;
const tw = (kind, sel, a, b, t) => js.push(`tl.${kind}(${J(sel)},${J(a)},${b ? J(b) + "," : ""}${r3(t)});`);
// fromTo calls are resolved at the end: when one target gets several, only the earliest keeps
// immediateRender so seeks before it show its "from" state.
const fromTo = (sel, from, to, t) => js.push({ sel, from, to, t: r3(t) });
const emitJs = () => {
  const first = {};
  for (const e of js) if (typeof e === "object" && (first[e.sel] === undefined || e.t < first[e.sel])) first[e.sel] = e.t;
  const seen = {};
  return js.map((e) => {
    if (typeof e === "string") return e;
    const lead = e.t === first[e.sel] && !seen[e.sel];
    if (lead) seen[e.sel] = true;
    const to = lead ? e.to : { ...e.to, immediateRender: false };
    return `tl.fromTo(${J(e.sel)},${J(e.from)},${J(to)},${e.t});`;
  });
};
const to = (sel, props, t) => js.push(`tl.to(${J(sel)},${J(props)},${r3(t)});`);
const set = (sel, props, t) => js.push(`tl.set(${J(sel)},${J(props)},${r3(t)});`);
const clipDiv = (id, cls, t0, t1, inner, style = "", track = 10) =>
  html.push(`<div id="${id}" class="clip ${cls}" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="${track}" style="${style}">${inner}</div>`);
// Untimed wrapper (visibility by tweens only) for groups that hold their own timed <video>.
const holdDiv = (id, cls, inner, style = "") => html.push(`<div id="${id}" class="${cls}" style="${style}">${inner}</div>`);
const enter = (sel, t, from = { y: 24 }, d = 0.55, ease = "back.out(1.6)") => fromTo(sel, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: d, ease }, t);
const leave = (sel, t, extra = {}, d = 0.35) => to(sel, { opacity: 0, duration: d, ease: "power2.in", ...extra }, t);
const floaty = (sel, t0, t1, amp = 10) => {
  const reps = Math.max(1, Math.floor((t1 - t0 - 0.8) / 1.6));
  js.push(`tl.to(${J(sel)},{y:-${amp},duration:1.6,repeat:${reps},yoyo:true,ease:"sine.inOut"},${r3(t0 + 0.6)});`);
};

// ── icons ──────────────────────────────────────────────────────────────────
const ICON_DIR = join(ROOT, "node_modules/lucide-static/icons");
function icon(name, size = 64, color = "#fff", sw = 2) {
  const svg = readFileSync(join(ICON_DIR, `${name}.svg`), "utf-8").replace(/<!--[\s\S]*?-->/g, "").trim();
  return svg
    .replace(/<svg[^>]*?>/, (m) => m.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "").replace(/\sclass="[^"]*"/, "").replace(/\sstroke-width="[^"]*"/, "").replace("<svg", `<svg class="ic" width="${size}" height="${size}" stroke-width="${sw}" style="color:${color}"`));
}
function spark(size = 180, color = "#e8775f") {
  const rays = Array.from({ length: 12 }, (_, k) => `<rect x="${size / 2 - size * 0.05}" y="${size * 0.04}" width="${size * 0.1}" height="${size * 0.42}" rx="${size * 0.05}" fill="${color}" transform="rotate(${k * 30} ${size / 2} ${size / 2})"/>`).join("");
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rays}</svg>`;
}

// ── camera layout ──────────────────────────────────────────────────────────
const CAM = {
  full: { x: 0, y: 0, scale: 1, borderRadius: 0 },
  pip: { x: 48, y: 760, scale: 470 / 1920, borderRadius: 110 },
  // Kalyan slides to the left third; graphics get the clean right panel (no tree, no face)
  side: { x: -470, y: 0, scale: 1, borderRadius: 0 },
};
const modes = [];
const mode = (t, m) => modes.push([r3(t), m]);
const camClips = [];
{
  let pos = 0;
  for (const x of inserts) {
    camClips.push(`<video id="cam-${camClips.length}" class="clip cam-v" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${F(pos)}" data-duration="${r3(x.at - pos)}" data-media-start="${r3(pos)}" data-track-index="1"></video>`);
    camClips.push(`<img id="freeze-${x.id}" class="clip cam-v" src="media/freeze-${x.id}.jpg" data-start="${insertStart(x.id)}" data-duration="${x.dur}" data-track-index="1" />`);
    covered.push([insertStart(x.id), insertStart(x.id) + x.dur]);
    noCaps.push([insertStart(x.id), insertStart(x.id) + x.dur]);
    pos = x.at;
  }
  camClips.push(`<video id="cam-${camClips.length}" class="clip cam-v" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${F(pos)}" data-duration="${r3(RC_LEN - pos)}" data-media-start="${r3(pos)}" data-track-index="1"></video>`);
}
const joins = [];
for (let k = 1; k < pieces.length; k++) {
  const a = pieces[k - 1], b = pieces[k];
  if (Math.abs(a.src + a.dur - b.src) > 0.05) joins.push(F(b.out));
}

// ── components ─────────────────────────────────────────────────────────────
/** Full-screen graphic scene; Kalyan drops into the rounded PiP card. */
function scene(t0, t1, { grid = true, pip = true } = {}) {
  const id = nid("scene");
  clipDiv(id, "scene", t0, t1, `<div class="in">${grid ? '<div class="grid"></div>' : ""}</div>`, "", 6);
  fromTo(`#${id} .in`, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, t0);
  leave(`#${id} .in`, t1 - 0.4, {}, 0.4);
  if (pip) { mode(t0, "pip"); mode(t1 - 0.45, "full"); }
  covered.push([t0, t1]);
}
/** Big icon bubble with a label, spread around Kalyan (no box). */
function pop({ x, y, ic, label, sub, t, t1, color = "#fff", glow, strike, check, size = 64 }) {
  const id = nid("pop");
  const extra = (strike ? '<div class="strike"></div>' : "") + (check ? `<div class="tickb">${icon("check", 30, "#111", 3)}</div>` : "");
  clipDiv(id, "pop", t, t1, `<div class="in"><div class="bub" style="${glow ? `--glow:${glow}` : ""}">${ic.startsWith("<") ? ic : icon(ic, size, color)}</div>${extra}<div class="lbl">${label}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`, `left:${x}px;top:${y}px`, 16);
  enter(`#${id} .in`, t, { scale: 0.3, rotation: -12, y: 30 }, 0.6);
  if (strike) fromTo(`#${id} .strike`, { scaleX: 0, rotation: -18 }, { scaleX: 1, rotation: -18, duration: 0.3, ease: "power3.out" }, t + 0.35);
  if (check) fromTo(`#${id} .tickb`, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)" }, t + 0.3);
  floaty(`#${id} .bub`, t, t1, 8);
  leave(`#${id} .in`, t1 - 0.35, { scale: 0.7 });
  sfx(t, "pop", 0.12);
  return id;
}
/** Kinetic typography; each word lands at its own time. */
function kinetic({ x, y, w = 760, size = 84, t1, parts, align = "left", z }) {
  const id = nid("kin");
  const spans = parts.map((p, k) => `<span class="w ${p.cls ?? ""}" id="${id}-w${k}">${esc(p.text)}</span>`).join("");
  noCaps.push([parts[0].t - 0.05, t1]); // the kinetic text is the caption here
  clipDiv(id, "kin", parts[0].t - 0.05, t1, spans, `left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;text-align:${align};${z ? `z-index:${z};` : ""}`, 17);
  parts.forEach((p, k) => fromTo(`#${id}-w${k}`, { opacity: 0, y: 40, rotationX: -60 }, { opacity: 1, y: 0, rotationX: 0, duration: 0.45, ease: "back.out(2)" }, p.t));
  leave(`#${id}`, t1 - 0.3, {}, 0.3);
  return id;
}
/** Words of the transcript from phrase a (inclusive) to phrase b's last word, timed as spoken. */
function spoken(fromPhrase, n, from = 0, mark = {}) {
  const i = find(fromPhrase, from);
  return Array.from({ length: n }, (_, k) => i + k).filter(kept).map((j) => {
    const t = words[j].text.replace(/^"|"$/g, "");
    return { text: t, t: T(j), cls: mark[norm(t)] ?? "" };
  });
}
/** Full-screen step transition card. */
function stepT(n, title, ic, t) {
  const id = nid("stept"), d = 2.0;
  clipDiv(id, "stept", t, t + d, `<div class="wipe"></div><div class="num">0${n}</div><div class="lab">Step ${n} of 6</div><div class="ttl">${title}</div><div class="big">${icon(ic, 300, "rgba(255,255,255,0.92)", 1.4)}</div>`, "", 46);
  fromTo(`#${id} .wipe`, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power4.inOut" }, t);
  fromTo(`#${id} .num`, { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power4.out" }, t + 0.25);
  fromTo(`#${id} .lab`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, t + 0.4);
  fromTo(`#${id} .ttl`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t + 0.45);
  fromTo(`#${id} .big`, { opacity: 0, scale: 0.4, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.7)" }, t + 0.35);
  to(`#${id} .num, #${id} .lab, #${id} .ttl, #${id} .big`, { opacity: 0, x: 80, duration: 0.3, ease: "power2.in" }, t + d - 0.55);
  to(`#${id} .wipe`, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power4.inOut" }, t + d - 0.45);
  sfx(t, "whoosh", 0.3);
  covered.push([t, t + d]);
  noCaps.push([t + 0.2, t + d - 0.2]);
}
/** Claude-Code-style prompt window that types the real prompt; highlights land on spoken words. */
function prompt({ t0, t1, title, text, typeDur = 3.2, file, highlights = [] }) {
  const id = nid("prompt");
  const ws = text.split(/\s+/);
  const body = (file ? `<span class="file" id="${id}-file">${icon("file-video", 28, "#6ea8ff")}${file}</span>` : "") + ws.map((w, k) => `<span class="w" id="${id}-w${k}">${esc(w)}</span>`).join(" ") + '<span class="cursor"></span>';
  clipDiv(id, "prompt", t0, t1, `<div class="win in"><div class="bar"><i></i><i></i><i></i><b>✳ Claude Code</b><span>${title}</span></div><div class="body">${body}</div></div>`, "", 18);
  enter(`#${id} .win`, t0, { y: 60, scale: 0.94 }, 0.6, "power3.out");
  let ts = t0 + 0.5;
  if (file) { fromTo(`#${id}-file`, { opacity: 0, x: -300, y: -120, rotation: -15 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.6, ease: "back.out(1.4)" }, ts); ts += 0.6; sfx(ts - 0.2, "pop", 0.18); }
  js.push(`tl.to(${J(`#${id} .w`)},{opacity:1,duration:0.01,stagger:${r3(typeDur / ws.length)}},${r3(ts)});`);
  for (const h of highlights) {
    const k = ws.findIndex((w, j) => h.phrase.split(" ").every((p, q) => norm(ws[j + q] ?? "") === norm(p)));
    if (k < 0) throw new Error(`highlight "${h.phrase}" not in prompt ${title}`);
    const sel = h.phrase.split(" ").map((_, q) => `#${id}-w${k + q}`).join(",");
    to(sel, { className: "w hl", duration: 0.01 }, Math.max(h.t, ts + typeDur * (k / ws.length) + 0.05));
  }
  // slow push-in so the text reads big
  fromTo(`#${id} .win`, { scale: 1 }, { scale: 1.06, duration: r3(t1 - t0 - 1), ease: "none" }, t0 + 0.6);
  leave(`#${id} .win`, t1 - 0.35);
  sfx(t0, "whoosh", 0.22);
}
/** Claude Code output as motion graphics: each result line lands as it is said (bar fills, then a tick). */
function terminal({ t0, t1, title, lines }) {
  const id = nid("term");
  const body = lines.map((l, k) => `<div class="tl ${l.kind}" id="${id}-l${k}">${l.kind === "ok" ? `<span class="tick">${icon("check", 26, "#0b0b12", 3.5)}</span>` : l.kind === "cmd" ? '<span class="pr">❯</span>' : `<span class="pr">${icon(l.icon ?? "settings-2", 28, "#e8775f")}</span>`}<span class="tx">${l.text}</span>${l.kind === "ok" ? '<span class="bar"><i></i></span>' : ""}</div>`).join("");
  clipDiv(id, "term", t0, t1, `<div class="win in"><div class="bar0"><i></i><i></i><i></i><b>✳ Claude Code</b><span>${title}</span></div><div class="body">${body}<span class="cursor"></span></div></div>`, "", 18);
  enter(`#${id} .win`, t0, { y: 60, scale: 0.94 }, 0.55, "power3.out");
  lines.forEach((l, k) => {
    fromTo(`#${id}-l${k}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, l.t);
    if (l.kind === "ok") {
      fromTo(`#${id}-l${k} .bar i`, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, l.t + 0.1);
      fromTo(`#${id}-l${k} .tick`, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(3)" }, l.t + 0.6);
      to(`#${id}-l${k} .bar`, { opacity: 0, duration: 0.2 }, l.t + 0.65);
      sfx(l.t + 0.6, "pop", 0.13);
    }
  });
  fromTo(`#${id} .win`, { scale: 1 }, { scale: 1.04, duration: r3(t1 - t0 - 1), ease: "none", immediateRender: false }, t0 + 0.6);
  leave(`#${id} .win`, t1 - 0.35);
  sfx(t0, "whoosh", 0.2);
}
/** Screen recording in a window with a Ken-Burns zoom to the readable part. */
function screen({ src, t0, t1, label, mediaStart = 0, zoom = [[1, 0, 0], [1.5, -300, -80]] }) {
  const id = nid("screen");
  html.push(`<div id="${id}" class="screen"><div class="bar"><i></i><i></i><i></i><span>${label}</span></div><div class="vp"><div class="zm" id="${id}-z"><video id="${id}-v" class="clip" src="media/${src}" muted playsinline data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-media-start="${mediaStart}" data-track-index="8"></video></div></div></div>`);
  fromTo(`#${id}`, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, t0);
  const [[s0, x0, y0], [s1, x1, y1]] = zoom;
  fromTo(`#${id}-z`, { scale: s0, x: x0, y: y0 }, { scale: s1, x: x1, y: y1, duration: r3(Math.min(2.2, (t1 - t0) / 3)), ease: "power2.inOut" }, t0 + 0.6);
  leave(`#${id}`, t1 - 0.35);
  sfx(t0, "whoosh", 0.2);
}
const tstrip = (cls, n, w, pattern) => `<div class="tstrip ${cls}" style="width:${w}px">${Array.from({ length: n }, (_, k) => `<i class="${pattern(k)}" style="width:${r3((w - 28 - 6 * (n - 1)) / n)}px"></i>`).join("")}<div class="ph"></div></div>`;

// ══ COLD OPEN: the chores, spread around Kalyan ═══════════════════════════
{
  const s = find("find the mistakes");
  const L = 90, R = 1600;
  const chores = [
    ["mistakes", "x-circle", "Mistakes", L, 110], ["bad takes", "rotate-ccw", "Bad takes", R, 110], ["pauses", "timer", "Pauses", L, 380],
    ["audio", "audio-waveform", "Audio", R, 380], ["visuals", "image", "Visuals", L, 650], ["b-rolls", "film", "B-roll", R, 650],
    ["captions", "captions", "Captions", 330, 120], ["music", "music", "Music", 1360, 120], ["sound effects", "volume-2", "Sound FX", 330, 690],
  ];
  const t1 = at("and honestly") - 0.1;
  chores.forEach(([p, ic, label, x, y]) => pop({ x, y, ic, label, t: at(p, s), t1 }));
  pop({ x: 1360, y: 690, ic: "upload", label: "Export", t: at("export everything", s), t1, glow: "rgba(76,214,138,0.5)", color: "#4cd68a" });
  // "the part I enjoy the least" — chores pile up, then sweep away
  kinetic({ x: 90, y: 790, w: 900, size: 64, t1: at("so this time") - 0.1, parts: spoken("the part i enjoy the least", 6, find("and honestly"), { least: "hl" }) });
  joins.push(at("the least"));
}

// ══ "I gave the entire raw footage to Claude Code" — Kalyan slides left, Claude edits on the right ═══
{
  const g = find("i gave the entire raw footage");
  const t0 = T(g + 6) - 0.2, t1 = at("and this is what the raw footage") - 0.15; // "Claude Code,"
  mode(t0 - 0.1, "side"); mode(t1, "full");
  const id = nid("cedit");
  const strip = tstrip("", 14, 760, (k) => ([2, 5, 9, 12].includes(k) ? "bad" : [7].includes(k) ? "dead" : ""));
  clipDiv(id, "cedit", t0, t1, `<div class="spark" style="left:270px;top:0">${spark(220)}</div><div class="lbl" style="top:236px;font-size:44px">Claude Code is editing…</div>${strip}`, "left:1100px;top:40px;width:800px;height:440px", 16);
  fromTo(`#${id}`, { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, t0 + 0.1);
  js.push(`tl.to("#${id} .spark",{rotation:360,duration:${r3(t1 - t0)},ease:"none"},${r3(t0)});`);
  js.push(`tl.fromTo("#${id} .ph",{x:0},{x:720,duration:${r3(Math.min(4, t1 - t0 - 1))},ease:"none"},${r3(t0 + 0.4)});`);
  to(`#${id} i.bad, #${id} i.dead`, { scaleY: 0, opacity: 0, duration: 0.25, stagger: 0.35, ease: "power3.in" }, t0 + 1.0);
  leave(`#${id}`, t1 - 0.35);
  sfx(t0, "whoosh", 0.2);
  // "the mistakes, the retakes, the awkward pauses, the bad audio, everything" — under it, same panel
  const m = find("the mistakes, the retakes", g);
  const items = [["mistakes", "x-circle", "Mistakes", 1100, 520], ["retakes", "rotate-ccw", "Retakes", 1380, 520], ["awkward", "pause-circle", "Awkward pauses", 1660, 520], ["bad audio", "mic-off", "Bad audio", 1380, 770], ["everything", "layers", "Everything", 1660, 770]];
  items.forEach(([p, ic, label, x, y]) => pop({ x, y, ic, label, t: at(p, m), t1, color: p === "everything" ? "#e8775f" : "#ff8a8a", glow: "rgba(255,77,79,0.4)" }));
}

// ══ RAW sample: plays first (with sound), then Kalyan continues ═══════════
{
  const t0 = insertStart("raw"), d = 7.6;
  const t1 = end("straight from the camera") + 0.5;
  // no pointing shot: the clip is already on screen while he introduces it
  const s0 = at("and this is what the raw footage") - 0.12;
  scene(s0, t0 + d, { pip: false });
  const id = "rawcard";
  html.push(`<div id="${id}" class="vcard raw" style="left:726px;top:60px;width:540px;height:960px">
    <video id="raw-a" class="clip" src="media/sample-raw.mp4" muted playsinline data-start="${r3(s0)}" data-duration="${r3(t0 - s0)}" data-media-start="${r3(34.35 - (t0 - s0))}" data-track-index="7"></video>
    <video id="raw-b" class="clip" src="media/sample-raw.mp4" playsinline data-has-audio="true" data-start="${t0}" data-duration="${d}" data-media-start="34.35" data-track-index="7"></video>
    <video id="raw-c" class="clip" src="media/sample-raw.mp4" muted playsinline data-start="${r3(t0 + d)}" data-duration="${r3(t1 - t0 - d)}" data-media-start="${r3(34.35 + d)}" data-track-index="6"></video>
    <div class="pill"><span class="dot"></span>Raw footage</div></div>`);
  fromTo(`#${id}`, { opacity: 0, scale: 0.7, rotation: -6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.4)" }, s0);
  sfx(s0, "whoosh", 0.28);
  kinetic({ x: 90, y: 380, w: 600, size: 66, t1: t0 + 0.2, parts: spoken("this is what the raw footage look like", 7, find("and this is what the raw footage"), { raw: "hl", footage: "hl" }) });
  // timeline strip under it with the mistakes marked
  const sid = nid("raws");
  clipDiv(sid, "", t0 + 0.3, t0 + d, tstrip("", 12, 760, (k) => (k === 4 ? "bad" : k === 5 ? "dead" : "")), "position:absolute;left:1300px;top:820px;z-index:24", 24);
  fromTo(`#${sid} .tstrip`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, t0 + 0.3);
  js.push(`tl.fromTo("#${sid} .ph",{x:0},{x:720,duration:${d - 0.6},ease:"none"},${r3(t0 + 0.4)});`);
  const flub = t0 + (37.3 - 34.35), dead = t0 + (38.22 - 34.35), retake = t0 + (38.9 - 34.35);
  const st = [[flub, "✕", 1330, 300], [retake, "↻", 1330, 520]];
  st.forEach(([t, ch, x, y]) => { const s2 = nid("stamp"); clipDiv(s2, "", t, t0 + d, `<div class="stamp" style="left:0;top:0;opacity:1">${ch}</div>`, `position:absolute;left:${x}px;top:${y}px;z-index:30`, 30); fromTo(`#${s2} .stamp`, { opacity: 0, scale: 2.4, rotation: -20 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.2, ease: "power4.in" }, t); sfx(t + 0.15, "stamp", 0.45); });
  kinetic({ x: 1520, y: 330, w: 380, size: 46, t1: t0 + d, parts: [{ text: "Mistake", t: flub, cls: "hl" }] });
  kinetic({ x: 1520, y: 440, w: 380, size: 46, t1: t0 + d, parts: [{ text: "Dead air", t: dead }] });
  kinetic({ x: 1520, y: 550, w: 380, size: 46, t1: t0 + d, parts: [{ text: "Retake", t: retake }] });
  // after: card slides left; "No cuts, no graphics, no captions, no music, nothing." as struck icons on the right
  to(`#${id}`, { x: -580, y: 70, scale: 0.86, duration: 0.6, ease: "power3.inOut" }, t0 + d - 0.2);
  leave(`#${id}`, t1 - 0.35);
  const n = find("no cuts, no graphics");
  const nos = [["cuts", "scissors", "No cuts", 1180, 120], ["graphics", "sparkles", "No graphics", 1500, 120], ["captions", "captions", "No captions", 1180, 420], ["music", "music", "No music", 1500, 420]];
  const nt1 = at("just the original recording") + 0.1;
  nos.forEach(([p, ic, label, x, y]) => pop({ x, y, ic, label, t: at(p, n), t1: nt1, strike: true, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" }));
  pop({ x: 1340, y: 300, ic: "video", label: "Straight from the camera", t: at("straight from the camera", n), t1, size: 72 });
}

// ══ EDITED sample: plays first (with sound), then the explanation ══════════
{
  const t0 = insertStart("edit"), d = 6.25;
  const t1 = end("sound effects, everything", find("graphics were added")) + 0.6;
  const s0 = at("and now compare that with this") - 0.12;
  scene(s0, t0 + d, { pip: false });
  leave("#rawcard", s0 - 0.3); // the raw card makes way
  const id = "editcard";
  html.push(`<div id="${id}" class="vcard edit" style="left:726px;top:60px;width:540px;height:960px">
    <video id="edit-a" class="clip" src="media/sample-edited.mp4" muted playsinline data-start="${r3(s0)}" data-duration="${r3(t0 - s0)}" data-media-start="${r3(32.15 - (t0 - s0))}" data-track-index="7"></video>
    <video id="edit-b" class="clip" src="media/sample-edited.mp4" playsinline data-has-audio="true" data-start="${t0}" data-duration="${d}" data-media-start="32.15" data-track-index="7"></video>
    <video id="edit-c" class="clip" src="media/sample-edited.mp4" muted playsinline data-start="${r3(t0 + d)}" data-duration="${r3(t1 - t0 - d)}" data-media-start="9.6" data-track-index="6"></video>
    <div class="pill">${spark(24)}Edited by Claude</div></div>`);
  fromTo(`#${id}`, { opacity: 0, scale: 0.7, rotation: 6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.4)" }, s0);
  sfx(s0, "riser", 0.3);
  kinetic({ x: 90, y: 400, w: 600, size: 66, t1: t0 + 0.2, parts: spoken("now compare that with this", 5, find("and now compare that with this"), { compare: "hl", this: "hl" }) });
  const sid = nid("edts");
  clipDiv(sid, "", t0 + 0.3, t0 + d, tstrip("", 9, 640, () => ""), "position:absolute;left:1320px;top:820px;z-index:24", 24);
  fromTo(`#${sid} .tstrip`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, t0 + 0.3);
  js.push(`tl.fromTo("#${sid} .ph",{x:0},{x:600,duration:${d - 0.6},ease:"none"},${r3(t0 + 0.4)});`);
  kinetic({ x: 1330, y: 360, w: 520, size: 64, t1: t0 + d, parts: [{ text: "Clean.", t: t0 + 0.8, cls: "g" }, { text: "Tight.", t: t0 + 1.6, cls: "g" }, { text: "Done.", t: t0 + 2.4, cls: "hl" }] });
  // then the card moves right while he explains what changed — checks spread on the left
  to(`#${id}`, { x: 560, y: 70, scale: 0.86, duration: 0.6, ease: "power3.inOut" }, t0 + d - 0.2);
  leave(`#${id}`, t1 - 0.35);
  const e = find("the mistakes were removed");
  const fixes = [["mistakes were removed", "x-circle", "Mistakes removed", 80, 110], ["pauses were tightened", "timer", "Pauses tightened", 380, 110], ["audio was cleaned", "audio-waveform", "Audio cleaned", 80, 400], ["graphics were added", "sparkles", "Graphics", 380, 400], ["captions", "captions", "Captions", 80, 690], ["music", "music", "Music + SFX", 380, 690]];
  fixes.forEach(([p, ic, label, x, y]) => pop({ x, y, ic, label, t: at(p, e), t1, check: true, color: "#9af0c0", glow: "rgba(76,214,138,0.45)" }));
  // "I didn't manually build this entire edit inside a traditional video editor"
  const m = find("i didn't manually build");
  const mt1 = end("traditional video editor") + 0.5;
  pop({ x: 1420, y: 220, ic: "clapperboard", label: "Traditional video editor", t: at("traditional video editor", m), t1: mt1, strike: true, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
  kinetic({ x: 90, y: 300, w: 760, size: 82, t1: mt1, parts: spoken("i didn't manually build", 4, m, { "didn't": "hl" }) });
}

// ══ THESIS: not one magic tool — different tools, different jobs (big) ═════
function orbit(t0, t1, lights, { title } = {}) {
  const id = nid("orbit"), cx = 650, cy = 410;
  const tools = [["ElevenLabs", "audio-waveform", "transcribe · music · SFX"], ["FFmpeg", "scissors", "cut · process · render"], ["Descript", "mic", "studio sound"], ["HyperFrames", "layers", "motion graphics"], ["Browser", "globe", "research · B-roll"]];
  const pos = tools.map((_, k) => { const a = (-90 + k * 72) * Math.PI / 180; return [cx + 470 * Math.cos(a), cy + 320 * Math.sin(a)]; });
  const lines = pos.map(([x, y], k) => `<line id="${id}-l${k}" x1="${cx}" y1="${cy}" x2="${r3(x)}" y2="${r3(y)}"/>`).join("");
  const nodes = tools.map(([n, ic, d], k) => `<div class="node" id="${id}-n${k}" style="left:${r3(pos[k][0] - 135)}px;top:${r3(pos[k][1] - 64)}px"><div class="bub">${icon(ic, 60)}</div><b>${n}</b><span>${d}</span></div>`).join("");
  const pulses = tools.map((_, k) => `<i class="pulse" id="${id}-p${k}" style="left:${cx - 8}px;top:${cy - 8}px"></i>`).join("");
  clipDiv(id, "orbit", t0, t1, `<div class="in"><svg class="lines" width="1300" height="960">${lines}</svg>${pulses}<div class="hub" id="${id}-hub" style="left:${cx - 140}px;top:${cy - 130}px;width:280px">${spark(150)}<b>Claude Code</b><span>${title ?? "the coordinator"}</span></div>${nodes}</div>`, "", 15);
  fromTo(`#${id} .in`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0);
  fromTo(`#${id}-hub`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.8)" }, t0 + 0.1);
  js.push(`tl.to("#${id}-hub svg",{rotation:180,duration:${r3(t1 - t0)},ease:"none"},${r3(t0)});`);
  lights.forEach((t, k) => {
    fromTo(`#${id}-l${k}`, { strokeDashoffset: 520 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, t - 0.2);
    fromTo(`#${id}-n${k}`, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, t);
    set(`#${id}-n${k}`, { className: "node on" }, t + 0.1);
    const [x, y] = pos[k];
    js.push(`tl.fromTo("#${id}-p${k}",{opacity:1,x:0,y:0},{opacity:0.9,x:${r3(x - cx)},y:${r3(y - cy)},duration:0.9,repeat:${Math.max(1, Math.floor((t1 - t - 0.5) / 0.9) - 1)},ease:"power1.in"},${r3(t + 0.2)});`);
    sfx(t, "pop", 0.12);
  });
  leave(`#${id} .in`, t1 - 0.4, { scale: 0.96 });
  return id;
}
{
  const s = find("claude code managed the workflow", 255);
  const t0 = T(s) - 0.2, t1 = at("so to make this simple") - 0.1;
  scene(t0, t1);
  // "Claude Code managed the workflow" — big, from the first word
  const wt = at("one magical ai tool", s);
  const hub = nid("hub");
  clipDiv(hub, "", t0, wt + 0.1, `<div class="in" style="position:absolute;left:820px;top:90px">${spark(300)}</div>`, "position:absolute;left:0;top:0;z-index:16", 16);
  fromTo(`#${hub} .in`, { opacity: 0, scale: 0.2, rotation: -120 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.6)" }, t0 + 0.1);
  js.push(`tl.to("#${hub} .in svg",{rotation:200,duration:${r3(wt - t0)},ease:"none"},${r3(t0)});`);
  to(`#${hub} .in`, { opacity: 0, scale: 0.4, duration: 0.3, ease: "power2.in" }, wt - 0.25);
  kinetic({ x: 300, y: 450, w: 1320, size: 96, align: "center", t1: wt - 0.05, parts: spoken("claude code managed the workflow", 5, s, { claude: "hl", code: "hl", workflow: "hl" }) });
  sfx(t0 + 0.1, "riser", 0.25);
  // "one magical AI tool" — a single big wand appears… then shatters into the tool orbit
  const wand = nid("wand");
  clipDiv(wand, "pop", wt, at("different tools", s) + 0.3, `<div class="in"><div class="bub" style="width:300px;height:300px">${icon("wand-sparkles", 170, "#f6b39b")}</div><div class="lbl" style="font-size:54px;margin-top:24px">One magic AI tool?</div></div>`, "left:610px;top:200px;width:700px", 16);
  enter(`#${wand} .in`, wt, { scale: 0.2, rotation: -30 }, 0.6);
  to(`#${wand} .in`, { scale: 1.6, opacity: 0, rotation: 25, duration: 0.45, ease: "power3.in" }, at("but by coordinating", s));
  sfx(at("but by coordinating", s), "snip", 0.3);
  const dt = at("different tools", s);
  orbit(dt - 0.3, t1, [0, 1, 2, 3, 4].map((k) => dt + k * 0.22));
  kinetic({ x: 560, y: 905, w: 1300, size: 58, align: "center", t1, parts: spoken("different tools for different jobs", 5, s, { tools: "hl", jobs: "hl" }) });
}

// ══ SIX STEPS: big rail, each step grows as it's named ═════════════════════
const STEPS = [
  ["Build the editing engine", "cpu"], ["Claude decodes the footage", "audio-waveform"], ["Shape the actual edit", "scissors"],
  ["Design the visual experience", "palette"], ["Assemble the first version", "layers"], ["Review, checks & export", "shield-check"],
];
{
  const s = find("so to make this simple");
  const t0 = T(s), t1 = at("so let's start with step one") + 0.1;
  scene(t0, t1);
  kinetic({ x: 560, y: 40, w: 1300, size: 40, t1, parts: spoken("six different steps", 3, s, { six: "hl" }) });
  const id = nid("rail");
  const tiles = STEPS.map(([t, ic], k) => `<div class="tile" id="${id}-t${k}"><div class="glow"></div><div class="n">STEP 0${k + 1}</div>${icon(ic, 96, k === 0 ? "#e8775f" : "#fff", 1.6)}<div class="t">${t}</div></div>`).join("");
  clipDiv(id, "rail", t0 + 0.2, t1, tiles, "", 15);
  const say = ["first step, we build", "step two", "step three", "step four", "step five is everything get assembled into", "step six is we review and"].map((p) => at(p, s));
  STEPS.forEach((_, k) => fromTo(`#${id}-t${k}`, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 0.45, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }, t0 + 0.4 + k * 0.12));
  say.forEach((t, k) => {
    to(`#${id}-t${k}`, { opacity: 1, scale: 1.12, zIndex: 5, duration: 0.45, ease: "back.out(2)" }, t);
    fromTo(`#${id}-t${k} .glow`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
    fromTo(`#${id}-t${k} svg`, { rotation: -25, scale: 0.6 }, { rotation: 0, scale: 1.15, duration: 0.6, ease: "back.out(3)" }, t);
    const nx = say[k + 1] ?? t1 - 0.4;
    to(`#${id}-t${k}`, { opacity: 0.85, scale: 1, zIndex: 1, duration: 0.35 }, nx - 0.05);
    to(`#${id}-t${k} .glow`, { opacity: 0, duration: 0.3 }, nx - 0.05);
    sfx(t, "pop", 0.16);
  });
  leave(`#${id}`, t1 - 0.4);
}

// ══ STEP 1 ═════════════════════════════════════════════════════════════════
{
  stepT(1, STEPS[0][0], STEPS[0][1], at("so let's start with step one"));
  // "Claude Code itself isn't really a video editor. Think of it more like the brain, coordinating everything."
  const b = find("because claude code itself");
  pop({ x: 1420, y: 180, ic: "clapperboard", label: "Not a video editor", t: at("isn't really a video editor", b), t1: at("think of it more like") + 0.2, strike: true, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
  const t0 = at("think of it more like") - 0.1, t1 = at("so i used elevenlabs") - 0.05;
  scene(t0, t1);
  const id = nid("brain");
  const tools = ["audio-waveform", "scissors", "mic", "layers", "globe"];
  const sats = tools.map((ic, k) => { const a = (-90 + k * 72) * Math.PI / 180; return `<div class="pop" id="${id}-s${k}" style="left:${r3(650 + 330 * Math.cos(a) - 120)}px;top:${r3(430 + 300 * Math.sin(a) - 66)}px;opacity:0"><div class="bub">${icon(ic, 56)}</div></div>`; }).join("");
  holdDiv(id, "brain", `<div class="bgv"><video id="${id}-v" class="clip" src="media/sr-skills.mp4" muted playsinline data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="8"></video></div><div class="ring"></div><div class="core">${icon("brain", 220, "#ffd6c9", 1.4)}</div>${sats}<div class="cap">Claude = the brain</div>`);
  fromTo(`#${id} .core`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, t0 + 0.2);
  js.push(`tl.to("#${id} .core",{scale:1.08,duration:0.6,repeat:${Math.max(1, Math.floor((t1 - t0) / 0.6) - 2)},yoyo:true,ease:"sine.inOut"},${r3(t0 + 0.9)});`);
  fromTo(`#${id} .ring`, { opacity: 0, rotation: 0 }, { opacity: 1, rotation: 120, duration: r3(t1 - t0), ease: "none" }, t0);
  tools.forEach((_, k) => enter(`#${id}-s${k}`, at("coordinating everything", b) + k * 0.12, { scale: 0.3 }, 0.45));
  fromTo(`#${id} .cap`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, at("brain", b));
  leave(`#${id}`, t1 - 0.35);
  sfx(t0, "riser", 0.25);
  joins.push(at("brain", b));
}
// Tool showcase — icons + animated mini visuals
{
  const s = find("so i used elevenlabs");
  const t0 = T(s) - 0.1, t1 = at("then i gave the claude") - 0.1;
  scene(t0, t1);
  const tools = [
    ["elevenlabs for", "ElevenLabs", "transcription · music · SFX", "audio-waveform", "wave"],
    ["ffmpeg for the cutting", "FFmpeg", "cutting · processing · rendering", "scissors", "film"],
    ["descript for", "Descript", "cleaning the audio", "mic", "clean"],
    ["hyperframes for motion", "HyperFrames", "motion graphics", "layers", "frames"],
    ["browser research for", "Browser research", "supporting visuals & B-roll", "globe", "search"],
  ];
  const slots = [[560, 110], [970, 110], [1380, 110], [765, 480], [1175, 480]];
  tools.forEach(([p, name, does, ic, viz], k) => {
    const id = nid("tool"), t = at(p, s);
    let v = "";
    if (viz === "wave" || viz === "clean") v = `<div class="viz wave">${Array.from({ length: 22 }, (_, j) => `<i style="height:${r3(30 + 110 * Math.abs(Math.sin(j * 1.3) * Math.cos(j * 0.4)))}px"></i>`).join("")}</div>`;
    if (viz === "film") v = `<div class="viz film">${"<i></i>".repeat(6)}</div>`;
    if (viz === "frames") v = `<div class="viz frames"><i style="left:0;top:20px"></i><i style="left:70px;top:10px"></i><i style="left:140px;top:0"></i></div>`;
    if (viz === "search") v = `<div class="viz search"><div class="q">${icon("search", 26)}<span class="qt">AI video editing</span></div><div class="r" style="width:90%"></div><div class="r" style="width:70%"></div></div>`;
    clipDiv(id, "tool", t, t1, `<div style="display:flex;align-items:center;gap:14px">${icon(ic, 46, "#e8775f")}<div class="name">${name}</div></div><div class="does">${does}</div>${v}`, `left:${slots[k][0]}px;top:${slots[k][1]}px`, 16);
    fromTo(`#${id}`, { opacity: 0, y: 80, scale: 0.8, rotation: k % 2 ? 4 : -4 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.5)" }, t);
    if (viz === "wave") js.push(`tl.fromTo("#${id} .viz i",{scaleY:0.2},{scaleY:1,duration:0.3,stagger:{each:0.03,repeat:${Math.max(1, Math.floor((t1 - t) / 0.6))},yoyo:true},ease:"sine.inOut"},${r3(t + 0.3)});`);
    if (viz === "clean") { js.push(`tl.fromTo("#${id} .viz i",{scaleY:1,background:"#8f8f9a"},{scaleY:0.35,background:"#4cd68a",duration:0.8,stagger:0.03,ease:"power2.inOut"},${r3(t + 0.5)});`); }
    if (viz === "film") js.push(`tl.to("#${id} .viz i:nth-child(2), #${id} .viz i:nth-child(5)",{scaleY:0,opacity:0,duration:0.3,stagger:0.3},${r3(t + 0.7)});`);
    if (viz === "frames") js.push(`tl.fromTo("#${id} .viz i",{x:-30,opacity:0},{x:0,opacity:1,duration:0.4,stagger:0.15,ease:"back.out(2)"},${r3(t + 0.3)});`);
    if (viz === "search") js.push(`tl.fromTo("#${id} .viz .r",{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:0.5,stagger:0.2},${r3(t + 0.5)});`);
    leave(`#${id}`, t1 - 0.35);
    sfx(t, "whoosh", 0.16);
  });
}
// Prompt 1 — typed big and readable, then the real output
const PROMPT1 = "Hey Claude, set up this project for AI video editing using ElevenLabs for transcription, music and SFX, HyperFrames for motion graphics, FFmpeg for video processing and rendering, browser research for source-based B-roll, and my own screen recordings when needed. Install and verify all dependencies, add the relevant HyperFrames skills, create a .env with ELEVENLABS_API_KEY=, add .env to .gitignore. Handle everything yourself and only ask me if you need login, password, admin approval or account authentication.";
{
  const s = find("then i gave the claude");
  const t0 = T(s) - 0.1, t1 = at("claude checked all the") - 0.1;
  scene(t0, t1);
  prompt({ t0, t1, title: "Prompt 1 · Setup", text: PROMPT1, typeDur: 4.2, highlights: [
    { phrase: "Install and verify all dependencies,", t: at("install and verify", s) },
    { phrase: "only ask me", t: at("only ask me", s) },
    { phrase: "login, password,", t: at("login, password", s) },
  ] });
  // Output: animated Claude Code log, each line on the word that names it
  const o0 = at("claude checked all the") - 0.1, o1 = at("so now the step two") - 0.15;
  scene(o0, o1);
  const c = find("claude checked all the");
  terminal({ t0: o0, t1: o1, title: "Output · setting up the editing engine", lines: [
    { kind: "cmd", text: "Setting up AI video editing…", t: o0 + 0.3 },
    { kind: "ok", text: "Dependencies verified — Node · FFmpeg · Chrome · ElevenLabs SDK", t: at("dependencies", c) },
    { kind: "ok", text: "HyperFrames skills installed", t: at("hyperframe skills, created", c) },
    { kind: "ok", text: "Folders — media/ · transcripts/ · edits/ · renders/", t: at("folders", c) },
    { kind: "ok", text: ".env ready — ELEVENLABS_API_KEY · git-ignored", t: at("environment file", c) },
    { kind: "cfg", icon: "audio-waveform", text: "Default transcription → ElevenLabs Scribe", t: at("use elevenlabs by default", c) },
    { kind: "ok", text: "Set up once — every next video starts here", t: at("set everything up again", c) },
  ] });
}

// ══ STEP 2 ═════════════════════════════════════════════════════════════════
const PROMPT2 = "I've added the raw talking-head video. Inspect it with FFmpeg, then use ElevenLabs to transcribe it with timestamps and save the full untouched transcript. Analyse the footage and transcript for mistakes, repeated takes, false starts, filler words and unnecessary silence, and create a clear edit plan showing what to keep, remove or shorten. Show me the edit plan first, wait for approval, then create a clean rough cut with FFmpeg.";
{
  stepT(2, STEPS[1][0], STEPS[1][1], at("so now the step two"));
  const s = find("now i dropped the entire raw video");
  const t0 = T(s) - 0.1, t1 = at("ffmpeg analyzed the duration") - 0.1;
  scene(t0, t1);
  prompt({ t0, t1, title: "Prompt 2 · Decode the footage", text: PROMPT2, typeDur: 3.0, file: "raw.mp4", highlights: [
    { phrase: "Inspect it with FFmpeg,", t: at("inspect everything first", s) },
  ] });
  // FFmpeg scan: the real raw clip with spec tags flying out
  const f = find("ffmpeg analyzed the duration");
  const f0 = T(f) - 0.1, f1 = at("but technically, that's still just") + 0.2;
  scene(f0, f1);
  const id = nid("scan");
  holdDiv(id, "", `<div class="scan" style="opacity:1"><video id="${id}-v" class="clip" src="media/sample-raw.mp4" muted playsinline data-start="${r3(f0)}" data-duration="${r3(f1 - f0)}" data-media-start="2" data-track-index="8"></video><div class="beam"></div></div>`, "position:absolute;left:0;top:0;z-index:16");
  fromTo(`#${id} .scan`, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, f0);
  js.push(`tl.fromTo("#${id} .beam",{y:0},{y:630,duration:1.1,repeat:${Math.max(1, Math.floor((f1 - f0) / 1.1) - 1)},yoyo:true,ease:"sine.inOut"},${r3(f0 + 0.3)});`);
  leave(`#${id} .scan`, f1 - 0.35);
  const specs = [["duration", "timer", "50 s", "duration", 1180, 120], ["resolution", "maximize", "2160×3840", "resolution", 1180, 380], ["frame rate", "film", "30 fps", "frame rate", 1180, 640], ["codec", "cpu", "HEVC", "codec", 1520, 250], ["audio", "audio-waveform", "AAC", "audio", 1520, 510]];
  specs.forEach(([p, ic, v, sub, x, y]) => pop({ x, y, ic, label: v, sub, t: at(p, f), t1: f1, size: 56 }));
  kinetic({ x: 1180, y: 840, w: 700, size: 48, t1: f1, parts: spoken("vertical four-k", 2, f, { "four-k": "hl" }) });
  // "still just a video file" → "Claude needs to understand what I'm saying"
  const v = find("but technically, that's still just");
  pop({ x: 1420, y: 200, ic: "file-video", label: "Just a video file", t: at("a video file", v), t1: at("so next, it used elevenlabs") + 0.1, size: 80 });
  kinetic({ x: 90, y: 260, w: 720, size: 74, t1: at("so next, it used elevenlabs") + 0.1, parts: spoken("understand what i am actually saying", 6, v, { understand: "hl", saying: "hl" }) });
  // ElevenLabs → word-level timestamps; every word, pause, mistake, retake
  const e = find("so next, it used elevenlabs");
  const e0 = T(e) - 0.1, e1 = at("claude could identify both versions") + 0.1;
  scene(e0, e1);
  const doc = nid("doc");
  const lines = [["34.52", "Claude will automatically use"], ["36.72", "Higgsfield <s>fee</s> MCP.", "bad"], ["38.22", "· · · 0.68 s pause", "dead"], ["38.90", "Claude will automatically use"], ["40.62", "Higgsfield MCP to edit your", "good"], ["42.74", "entire video in around ten minutes."]];
  clipDiv(doc, "", e0, e1, `<div class="doc" style="opacity:1"><div class="h">${icon("audio-waveform", 26, "#a0522d")} ElevenLabs · word-level timestamps</div>${lines.map(([ts, tx, c], k) => `<div class="ln ${c ?? ""}" id="${doc}-l${k}"><span class="ts">${ts}</span><span>${tx}</span></div>`).join("")}</div>`, "position:absolute;left:0;top:0;z-index:16", 16);
  fromTo(`#${doc} .doc`, { opacity: 0, y: 60, rotation: -2 }, { opacity: 1, y: 0, rotation: 0, duration: 0.6, ease: "power3.out" }, e0);
  lines.forEach((_, k) => fromTo(`#${doc}-l${k}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.35 }, e0 + 0.5 + k * 0.3));
  leave(`#${doc} .doc`, e1 - 0.35);
  const ev = find("every word, every pause", e);
  [["every word", "type", "Every word"], ["every pause", "pause-circle", "Every pause"], ["every mistake", "x-circle", "Every mistake"], ["every retake", "rotate-ccw", "Every retake"]].forEach(([p, ic, label], k) =>
    pop({ x: 620 + k * 300, y: 730, ic, label, t: at(p, ev), t1: at("for example, here i messed") + 0.2, size: 52 }));
  fromTo(`#${doc}-l1`, { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1 }, at("messed up one sentence", e));
  fromTo(`#${doc}-l4`, { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1 }, at("same line properly", e));
  // "editing the video starts looking a lot more like editing a document"
  const d0 = find("claude could identify both versions");
  pop({ x: 1420, y: 180, ic: "file-pen-line", label: "Editing a document", t: at("editing a document"), t1: end("editing a document") + 0.6, size: 80 });
  kinetic({ x: 90, y: 280, w: 760, size: 76, t1: end("editing a document") + 0.6, parts: spoken("both versions", 2, find("claude could identify both versions"), { both: "hl" }).concat(spoken("editing a document", 3, d0, { document: "hl" })) });
  joins.push(at("editing a document"));
}

// ══ STEP 3 ═════════════════════════════════════════════════════════════════
{
  const s = find("but i still didn't want claude randomly");
  pop({ x: 1420, y: 180, ic: "scissors", label: "No random cuts", t: at("randomly making cuts", s), t1: at("shape the edit", 830) - 0.3, strike: true, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
  stepT(3, STEPS[2][0], STEPS[2][1], at("shape the edit", 830) - 0.25);
  // Edit plan board: keep / remove / shorten
  const p = find("before making any cuts, i asked");
  const p0 = T(p), p1 = at("claude found the dead air at the beginning") - 0.1;
  scene(p0, p1);
  const id = nid("board");
  const cols = [["k", "check-circle-2", "Keep", [["trophy", "Best take of each line"], ["heart", "Natural pauses"], ["sparkles", "Emotional beats"]]], ["r", "x-circle", "Remove", [["corner-up-left", "False starts"], ["rotate-ccw", "Repeated takes"], ["volume-x", "Dead air"]]], ["s", "timer", "Shorten", [["timer-reset", "Long pauses → 0.3 s"], ["fast-forward", "Slow intros"], ["move-horizontal", "Gaps between lines"]]]];
  clipDiv(id, "board", p0, p1, `<div class="ttl0" id="${id}-h">${icon("clipboard-list", 46, "#e8775f")}The edit plan</div>` + cols.map(([c, ic, h, items], k) => `<div class="col ${c}" id="${id}-c${k}"><div class="hd">${icon(ic, 48)}${h}</div>${items.map(([ii, it], j) => `<div class="it" id="${id}-c${k}i${j}">${icon(ii, 30, ["#4cd68a", "#ff4d4f", "#ffb547"][k])}${it}</div>`).join("")}</div>`).join(""), "", 16);
  fromTo(`#${id}-h`, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.45 }, p0 + 0.1);
  const sayCol = [at("keep", p), at("remove", p), at("shorten", p)];
  cols.forEach((col, k) => {
    const tc = p0 + 0.4 + k * 0.45;
    fromTo(`#${id}-c${k}`, { opacity: 0, y: 80, rotation: k === 1 ? 0 : k ? 3 : -3 }, { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: "back.out(1.5)" }, tc);
    col[3].forEach((_, j) => fromTo(`#${id}-c${k}i${j}`, { opacity: 0, x: -30, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }, tc + 0.45 + j * 0.25));
    const tk = Math.max(sayCol[k], tc + 1.3);
    if (tk < p1 - 1) { to(`#${id}-c${k}`, { scale: 1.07, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, tk); sfx(tk, "pop", 0.14); }
  });
  leave(`#${id}`, p1 - 0.35);
  // Dead air / long pauses / repeated takes on a timeline that gets cut
  const d = find("claude found the dead air at the beginning");
  const d0 = T(d) - 0.1, d1 = at("but i gave claude one important rule") - 0.05;
  scene(d0, d1);
  const tl2 = nid("cuts");
  clipDiv(tl2, "", d0, d1, tstrip("", 16, 1200, (k) => (k < 2 ? "dead" : [5, 9, 13].includes(k) ? "dead" : [7, 11].includes(k) ? "bad" : "")) + `<div class="kin" style="position:absolute;left:0;top:-170px;width:1200px;font-size:58px"><span class="w" style="opacity:1">Dead air</span><span class="w" style="opacity:1;color:#ffb547">· Long pauses</span><span class="w" style="opacity:1;color:#ff6b6b">· Repeated takes</span></div>`, "position:absolute;left:600px;top:470px;z-index:16", 16);
  fromTo(`#${tl2} .tstrip`, { opacity: 0, scaleX: 0.7 }, { opacity: 1, scaleX: 1, duration: 0.5 }, d0);
  fromTo(`#${tl2} .kin .w`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.9 }, d0 + 0.3);
  to(`#${tl2} i.dead`, { y: -20, duration: 0.2, stagger: 0.1, yoyo: true, repeat: 1 }, at("dead air", d));
  to(`#${tl2} i.dead, #${tl2} i.bad`, { scaleY: 0, opacity: 0, duration: 0.3, stagger: 0.12, ease: "power3.in" }, d1 - 1.4);
  sfx(d1 - 1.4, "snip", 0.3); sfx(d1 - 0.9, "snip", 0.25);
  leave(`#${tl2}`, d1 - 0.35);
  // The pause rule — kinetic, robot crossed out, heart for emotional pauses
  const r = find("but i gave claude one important rule");
  const r1 = at("the original clip was around") - 0.1;
  pop({ x: 1420, y: 120, ic: "bot", label: "Not like a robot", t: at("like a robot", r), t1: r1, strike: true, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
  pop({ x: 1420, y: 470, ic: "heart", label: "Natural & emotional pauses stay", t: at("natural or emotional", r), t1: r1, size: 72, color: "#ff8fb1", glow: "rgba(255,120,170,0.45)" });
  kinetic({ x: 90, y: 200, w: 760, size: 80, t1: at("keep the pauses that feel") - 0.1, parts: spoken("don't remove every pause", 4, r, { "don't": "hl" }) });
  kinetic({ x: 90, y: 200, w: 760, size: 70, t1: r1, parts: spoken("only remove the silences that adds nothing", 7, r, { silences: "hl", nothing: "hl" }) });
  // 50 s → 41 s
  const c = find("the original clip was around");
  const c0 = T(c) - 0.1, c1 = at("once i approved the plan") - 0.1;
  const cid = nid("count");
  clipDiv(cid, "count", c0, c1, `<div class="big"><span id="${cid}-n">50</span><small>s</small></div><div class="bar" id="${cid}-b" style="width:600px"></div>`, "left:80px;top:220px;width:640px", 17);
  fromTo(`#${cid}`, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, c0);
  const ft = at("forty-one", c);
  fromTo(`#${cid}-n`, { textContent: 50 }, { textContent: 41, duration: 0.9, ease: "power2.out", snap: { textContent: 1 } }, ft);
  fromTo(`#${cid}-b`, { scaleX: 1 }, { scaleX: 0.82, duration: 0.9, ease: "power2.out" }, ft);
  to(`#${cid} .big`, { color: "#4cd68a", duration: 0.3 }, ft + 0.9);
  leave(`#${cid}`, c1 - 0.35);
  // rough cut via FFmpeg: no graphics, no B-roll, no music
  const a = find("once i approved the plan");
  const a1 = at("but there was one problem") - 0.1;
  pop({ x: 120, y: 160, ic: "scissors", label: "FFmpeg rough cut", t: at("ffmpeg to create", a), t1: a1, size: 76, check: true, color: "#9af0c0", glow: "rgba(76,214,138,0.4)" });
  const no = find("no graphics, no b-rolls", a);
  [["graphics", "sparkles", "No graphics", 1420, 100], ["b-rolls", "film", "No B-roll", 1420, 380], ["music", "music", "No music", 1420, 660]].forEach(([p2, ic, label, x, y]) => pop({ x, y, ic, label, t: at(p2, no), t1: a1, strike: true, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" }));
}

// ══ AUDIO: teleprompter raw vs Claude-edited (the sample we're working on) ═
{
  const p = find("but there was one problem");
  const p1 = insertStart("before");
  pop({ x: 1420, y: 180, ic: "mic-off", label: "No proper mic", t: at("without my proper mic", p), t1: p1, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
  const ab = (which, src, ms, label, sub, cls) => {
    const t0 = insertStart(which), d = 3.5, id = nid("ab");
    html.push(`<div id="${id}" class="vcard ${cls}" style="left:690px;top:70px;width:540px;height:960px"><video id="${id}-v" class="clip" src="media/${src}" playsinline data-has-audio="true" data-start="${t0}" data-duration="${d}" data-media-start="${ms}" data-track-index="7"></video><div class="pill">${label}</div></div>`);
    fromTo(`#${id}`, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" }, t0 - 0.05);
    leave(`#${id}`, t0 + d - 0.3);
    kinetic({ x: 1300, y: 420, w: 560, size: 60, t1: t0 + d, parts: [{ text: sub, t: t0 + 0.4, cls: which === "after" ? "g" : "hl" }] });
    const wid = nid("wv");
    clipDiv(wid, "", t0, t0 + d, `<div class="viz wave" style="position:absolute;left:0;top:0;width:520px;height:150px">${Array.from({ length: 26 }, (_, j) => `<i style="height:${r3(30 + 110 * Math.abs(Math.sin(j * 1.9) * Math.cos(j * 0.5)))}px;background:${which === "after" ? "#4cd68a" : "#9a9aa8"}"></i>`).join("")}</div>`, "position:absolute;left:80px;top:470px;z-index:24", 24);
    js.push(`tl.fromTo("#${wid} i",{scaleY:0.25},{scaleY:1,duration:0.22,stagger:{each:0.02,repeat:5,yoyo:true},ease:"sine.inOut"},${r3(t0 + 0.2)});`);
  };
  ab("before", "sample-raw.mp4", 44.9, '<span class="dot"></span>Before · raw', "Room noise", "raw");
  ab("after", "sample-edited.mp4", 38.3, `${spark(22)}After · Studio Sound`, "Clean voice", "edit");
  // Descript cleaning between the two
  const d = find("so i used descript audio sound to reduce");
  const d1 = insertStart("after") - 0.1;
  const steps = [["reduce the room noise", "volume-x", "Room noise ↓"], ["clarity", "sparkles", "Clarity ↑"], ["studio audio", "mic", "Studio feel"], ["natural voice", "user", "Natural voice"]];
  pop({ x: 120, y: 140, ic: "audio-waveform", label: "Descript", sub: "Studio Sound", t: T(d) + 0.3, t1: d1, size: 80 });
  steps.forEach(([p2, ic, label], k) => pop({ x: k % 2 ? 1620 : 1360, y: 140 + Math.floor(k / 2) * 320, ic, label, t: at(p2, d), t1: d1, size: 56, check: k > 0, color: k ? "#9af0c0" : "#ff9b9b", glow: k ? "rgba(76,214,138,0.4)" : "rgba(255,77,79,0.4)" }));
  const f = find("now we finally have a clean foundation");
  kinetic({ x: 90, y: 260, w: 760, size: 80, t1: at("so step four is the design") - 0.1, parts: spoken("a clean foundation", 3, f, { foundation: "hl" }) });
  pop({ x: 1420, y: 200, ic: "eye", label: "Next: the visual edit", t: at("the visual edit", f), t1: at("so step four is the design") - 0.1, size: 80 });
}

// ══ STEP 4 ═════════════════════════════════════════════════════════════════
{
  stepT(4, STEPS[3][0], STEPS[3][1], at("so step four is the design"));
  const q = find("this time, i didn't ask claude");
  const q1 = at("claude analyzed the transcript again") - 0.1;
  kinetic({ x: 90, y: 160, w: 800, size: 72, t1: at("i asked,", q) - 0.05, parts: spoken("what should i cut", 4, q, { what: "x", should: "x", i: "x", "cut": "x" }) });
  kinetic({ x: 90, y: 160, w: 800, size: 80, t1: q1, parts: spoken("what should the viewer see", 5, q, { viewer: "hl", see: "hl" }) });
  pop({ x: 1420, y: 220, ic: "eye", label: "What the viewer sees", t: at("what should the viewer see", q), t1: q1, size: 90 });
  // Layout vignettes — full-screen demo of each option, as he names it
  const g = find("claude analyzed the transcript again");
  const opts = [["full screen", "full"], ["typography", "type"], ["graphics", "graphics"], ["screen visuals", "screen"], ["b-rolls", "broll"], ["picture-in-picture", "pip"]];
  const times = opts.map(([p]) => at(p, g));
  const vEnd = at("when the information was more important") - 0.1;
  times.forEach((t, k) => {
    const t1 = (times[k + 1] ?? vEnd) + (k === opts.length - 1 ? 0 : 0.05);
    const kind = opts[k][1], id = nid("vig");
    let inner = "", style = "";
    if (kind === "full") inner = `<div class="brk"></div><div class="tag pill">${icon("user", 22)}Full screen</div>`;
    if (kind === "type") { inner = `<div class="huge">Typography</div><div class="tag pill">${icon("type", 22)}Typography</div>`; style = "solid"; }
    if (kind === "graphics") { inner = `<div class="bars">${[0.45, 0.8, 0.6, 1, 0.7].map((h) => `<i style="height:${h * 100}%"></i>`).join("")}</div><div class="tag pill">${icon("chart-column", 22)}Graphics</div>`; style = "solid"; }
    if (kind === "screen") inner = `<div class="tag pill">${icon("monitor", 22)}Screen visuals</div>`;
    if (kind === "broll") inner = `<div class="tag pill">${icon("film", 22)}B-roll</div>`;
    if (kind === "pip") inner = `<div class="tag pill">${icon("picture-in-picture-2", 22)}Picture-in-picture</div>`;
    clipDiv(id, `vig ${style}`, t - 0.05, t1, inner, "", 18);
    fromTo(`#${id}`, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, t - 0.05);
    if (kind === "type") fromTo(`#${id} .huge`, { scaleX: 1.35, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, t);
    if (kind === "graphics") fromTo(`#${id} .bars i`, { scaleY: 0 }, { scaleY: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.8)" }, t);
    if (kind === "screen") html.push(`<video id="${id}-v" class="clip" src="media/sr-review.mp4" muted playsinline data-start="${r3(t - 0.05)}" data-duration="${r3(t1 - t + 0.05)}" data-media-start="4" data-track-index="17" style="position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover;z-index:17"></video>`);
    if (kind === "broll") html.push(`<video id="${id}-v" class="clip" src="media/sr-github.mp4" muted playsinline data-start="${r3(t - 0.05)}" data-duration="${r3(t1 - t + 0.05)}" data-media-start="6" data-track-index="17" style="position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover;z-index:17"></video>`);
    if (kind === "pip") { html.push(`<video id="${id}-v" class="clip" src="media/sr-plan.mp4" muted playsinline data-start="${r3(t - 0.05)}" data-duration="${r3(t1 - t + 0.05)}" data-media-start="8" data-track-index="5" style="position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover;z-index:5"></video>`); mode(t, "pip"); mode(t1 - 0.3, "full"); }
    if (kind !== "full" && kind !== "pip") covered.push([t, t1]);
    sfx(t, "whoosh", 0.18);
  });
  // "my video in a rounded card at the bottom left" — the Claude-edited sample does exactly that
  const r = find("when the information was more important");
  const r0 = T(r) - 0.1, r1 = at("then i added one permanent rule") - 0.1;
  scene(r0, r1);
  const fd = nid("face");
  holdDiv(fd, "", `<div class="facedemo"><div class="vcard edit"><video id="${fd}-v" class="clip" src="media/sample-edited.mp4" muted playsinline data-start="${r3(r0)}" data-duration="${r3(r1 - r0)}" data-media-start="29.2" data-track-index="8"></video><div class="pill">${spark(22)}Claude-edited</div></div><div class="ring"></div><div class="callout">My face → rounded card, bottom-left</div></div>`, "position:absolute;left:0;top:0;z-index:18");
  fromTo(`#${fd} .facedemo`, { opacity: 0, y: 80, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, r0);
  const rc0 = at("rounded card", r);
  fromTo(`#${fd} .ring`, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, rc0);
  fromTo(`#${fd} .callout`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, rc0 + 0.2);
  kinetic({ x: 1500, y: 300, w: 380, size: 52, t1: r1, parts: spoken("the main screen explains", 4, r, { main: "hl", screen: "hl" }) });
  leave(`#${fd} .facedemo`, r1 - 0.35);
  // "never cover my face"
  const n = find("then i added one permanent rule");
  const n1 = at("for the style") - 0.1;
  pop({ x: 1420, y: 200, ic: "shield-check", label: "Never cover my face", t: at("never cover my face", n), t1: n1, size: 90, color: "#9af0c0", glow: "rgba(76,214,138,0.45)" });
  kinetic({ x: 90, y: 260, w: 760, size: 84, t1: n1, parts: spoken("never cover my face", 4, n, { never: "hl" }) });
  // Liquid glass — moving glass panes with kinetic words
  const st = find("for the style");
  const s0 = T(st) - 0.1, s1 = at("that's where hyperframes came in") - 0.1;
  scene(s0, s1);
  const lq = nid("liquid");
  const panes = [[80, 120, 520, 330, "rgba(232,119,95,0.22)"], [520, 300, 600, 360, "rgba(110,120,255,0.20)"], [300, 520, 520, 280, "rgba(255,255,255,0.10)"]];
  clipDiv(lq, "liquid", s0, s1, panes.map(([x, y, w, h, c], k) => `<div class="g" id="${lq}-g${k}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${c}"></div>`).join(""), "", 16);
  panes.forEach((_, k) => { fromTo(`#${lq}-g${k}`, { opacity: 0, y: 120, rotation: k % 2 ? 6 : -6 }, { opacity: 1, y: 0, rotation: 0, duration: 0.8, ease: "power3.out" }, s0 + 0.15 * k); js.push(`tl.to("#${lq}-g${k}",{x:${k % 2 ? -50 : 50},y:${k ? -30 : 30},duration:${r3(s1 - s0 - 1)},ease:"sine.inOut"},${r3(s0 + 0.9)});`); });
  kinetic({ x: 560, y: 400, w: 1320, size: 88, align: "center", z: 19, t1: s1, parts: spoken("clean, premium, modern", 3, st, { premium: "hl" }) });
  kinetic({ x: 560, y: 600, w: 1320, size: 52, align: "center", z: 19, t1: s1, parts: spoken("apple-style liquid glass look", 4, st, { liquid: "hl", glass: "hl" }) });
  // HyperFrames: GitHub + Studio, zoomed
  const h = find("that's where hyperframes came in");
  const h1 = at("i also gave it a rough visual balance") - 0.1;
  const mid = r3((T(h) + h1) / 2);
  scene(T(h) - 0.1, h1);
  screen({ src: "sr-github.mp4", t0: T(h) - 0.1, t1: mid, label: "github.com/heygen-com/hyperframes", zoom: [[1, 0, 0], [1.45, -300, -40]] });
  screen({ src: "sr-studio.mp4", t0: mid, t1: h1, label: "HyperFrames Studio · build, animate, render", zoom: [[1, 0, 0], [1.35, -200, -200]] });
  kinetic({ x: 560, y: 990, w: 1320, size: 40, align: "center", z: 20, t1: h1, parts: spoken("build and animate the graphics and render them", 8, h, { build: "hl", animate: "hl", render: "hl" }) });
  // 40 / 30 / 25 / 5 — animated donut with icons
  const b = find("i also gave it a rough visual balance");
  const b0 = T(b) - 0.1, b1 = at("not because those numbers") - 0.1;
  scene(b0, b1);
  const dn = nid("donut"), R = 250, C = 2 * Math.PI * R;
  const segs = [["forty percent", 40, "#e8775f", "user", "Me on camera"], ["thirty percent", 30, "#a78bfa", "type", "Graphics & type"], ["twenty-five percent", 25, "#6ea8ff", "monitor", "Screen visuals"], ["five percent", 5, "#4cd68a", "film", "B-roll & transitions"]];
  let acc = 0;
  const arcs = segs.map(([, v, c], k) => { const a = `<circle class="seg" id="${dn}-s${k}" cx="425" cy="420" r="${R}" stroke="${c}" stroke-dasharray="0 ${r3(C)}" transform="rotate(${-90 + acc * 3.6} 425 420)"/>`; acc += v; return a; }).join("");
  const legs = segs.map(([, v, c, ic, l], k) => `<div class="leg" id="${dn}-g${k}" style="top:${170 + k * 150}px;--c:${c}"><em>${v}%</em>${icon(ic, 40, c)}${l}</div>`).join("");
  clipDiv(dn, "donut", b0, b1, `<svg width="850" height="840"><circle cx="425" cy="420" r="${R}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="70"/>${arcs}</svg><div class="mid"><b id="${dn}-m">0%</b><span>visual balance</span></div>${legs}`, "", 16);
  fromTo(`#${dn}`, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, b0);
  let sum = 0;
  segs.forEach(([p, v], k) => {
    const t = at(p, b);
    fromTo(`#${dn}-s${k}`, { attr: { "stroke-dasharray": `0 ${r3(C)}` } }, { attr: { "stroke-dasharray": `${r3(C * v / 100 - 4)} ${r3(C)}` }, duration: 0.7, ease: "power3.out" }, t);
    fromTo(`#${dn}-g${k}`, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4 }, t);
    fromTo(`#${dn}-m`, { textContent: sum }, { textContent: sum + v, duration: 0.7, snap: { textContent: 1 }, ease: "power2.out" }, t);
    sum += v;
    sfx(t, "pop", 0.14);
  });
  leave(`#${dn}`, b1 - 0.35);
  const nb = find("not because those numbers");
  kinetic({ x: 90, y: 200, w: 780, size: 72, t1: at("so step", 1260) - 0.1, parts: spoken("the visuals should help the explanation", 6, nb, { help: "hl" }) });
  pop({ x: 1420, y: 180, ic: "sparkles", label: "No random animations", t: at("random animations", nb), t1: at("so step", 1260) - 0.1, strike: true, size: 80, color: "#ff9b9b", glow: "rgba(255,77,79,0.4)" });
}

// ══ STEP 5 ═════════════════════════════════════════════════════════════════
const PROMPT4 = "Review the latest edited version, add clean captions where useful, fix any remaining issues with cuts, graphics, B-roll, music, SFX, audio sync, black frames or anything covering my face, and save only the reusable editing preferences into AGENTS.md for future videos. Once everything passes QA, export the final YouTube-ready MP4.";
{
  stepT(5, STEPS[4][0], STEPS[4][1], at("so step", 1260));
  // Music + SFX with a mixer: voice up, music down
  const m = find("elevenlabs generated the background music");
  const m1 = at("and then claude brought all together") - 0.1;
  const mx = nid("mixer");
  clipDiv(mx, "mixer", T(m) - 0.1, m1, ["Voice", "Music", "SFX"].map((l, k) => `<div class="fader"><div class="rail2"><div class="fill" id="${mx}-f${k}" style="height:100%"></div><div class="knob" id="${mx}-k${k}" style="bottom:0"></div></div>${l}</div>`).join(""), "", 16);
  fromTo(`#${mx}`, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.5 }, T(m) - 0.1);
  const lv = [0.95, 0.22, 0.15];
  lv.forEach((v, k) => { fromTo(`#${mx}-f${k}`, { scaleY: 0.5 }, { scaleY: v, duration: 0.8, ease: "power3.out" }, at("keep them minimal", m) + k * 0.1); fromTo(`#${mx}-k${k}`, { y: -210 }, { y: -420 * v + 15, duration: 0.8, ease: "power3.out" }, at("keep them minimal", m) + k * 0.1); });
  pop({ x: 1420, y: 120, ic: "music", label: "Background music", sub: "ElevenLabs", t: at("background music", m), t1: m1, size: 64 });
  pop({ x: 1660, y: 400, ic: "volume-2", label: "Subtle SFX", t: at("subtle sound effects", m), t1: m1, size: 56 });
  kinetic({ x: 900, y: 690, w: 980, size: 58, t1: m1, parts: spoken("the voice should always be the focus", 7, m, { voice: "hl", focus: "hl" }) });
  // Assembly: layers stack into one video → Review v1
  const a = find("and then claude brought all together");
  const a0 = T(a) - 0.1, a1 = at("this was the first moment", 1350) - 0.1;
  scene(a0, a1);
  const st = nid("stack");
  const layers = [["the rough cut", "film", "Rough cut"], ["graphic captions", "captions", "Graphics & captions"], ["supporting visuals", "monitor", "Supporting visuals"], ["music,", "music", "Music"], ["sound effects", "volume-2", "Sound effects"]];
  clipDiv(st, "stack", a0, a1, layers.map(([, ic, l], k) => `<div class="ly" id="${st}-l${k}" style="top:${520 - k * 100}px">${icon(ic, 40, "#e8775f")}${l}</div>`).join("") + `<div class="badge" id="${st}-b">Review version 1</div>`, "", 16);
  layers.forEach(([p, ,], k) => fromTo(`#${st}-l${k}`, { opacity: 0, y: -260, rotation: k % 2 ? 8 : -8 }, { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: "bounce.out" }, at(p, a)));
  layers.forEach((_, k) => to(`#${st}-l${k}`, { y: k * 100 - 140, duration: 0.5, ease: "power3.in" }, at("review version one", a) - 0.3 + k * 0.04));
  fromTo(`#${st}-b`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, at("review version one", a));
  sfx(at("review version one", a), "riser", 0.25);
  leave(`#${st}`, a1 - 0.35);
  // First moment it came together: the real review v1 recording
  const f = find("this was the first moment", 1350);
  const f1 = at("but i still didn't just accept") - 0.1;
  scene(T(f) - 0.1, f1);
  screen({ src: "sr-review.mp4", t0: T(f) - 0.1, t1: f1, label: "Review version 1 · first full edit", zoom: [[1, 0, 0], [1.6, -100, -40]] });
  // Timestamped feedback as sticky notes pinned to a timeline
  const fb = find("but i still didn't just accept");
  const fb0 = T(fb) - 0.1, fb1 = at("claude applied only the changes") - 0.1;
  scene(fb0, fb1);
  const fid = nid("fb");
  const notes = [["graphic comes in", "0:12", "Graphic comes in too early", 40], ["music is too", "0:21", "Music is too loud", 360], ["keep me on screen", "0:30", "Keep me on screen longer", 680], ["remove this transaction", "0:35", "Remove this transition", 1000]];
  clipDiv(fid, "fb", fb0, fb1, `<div class="tl"></div>` + notes.map(([, ts, l, x], k) => `<div class="pin" id="${fid}-p${k}" style="left:${x + 140}px"></div><div class="note" id="${fid}-n${k}" style="left:${x}px;top:${k % 2 ? 260 : 120}px"><span class="t">${ts}</span>${l}</div>`).join(""), "", 16);
  fromTo(`#${fid} .tl`, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.5, transformOrigin: "left center" }, fb0);
  pop({ x: 1500, y: 40, ic: "eye", label: "I watched it all", t: at("i watched the whole thing", fb), t1: at("things like graphic comes in", fb), size: 56 });
  notes.forEach(([p, , , ], k) => { const t = at(p, fb); fromTo(`#${fid}-n${k}`, { opacity: 0, y: -200, rotation: k % 2 ? 10 : -10 }, { opacity: 1, y: 0, rotation: k % 2 ? 3 : -3, duration: 0.55, ease: "back.out(1.6)" }, t); fromTo(`#${fid}-p${k}`, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.3 }, t + 0.3); sfx(t, "pop", 0.15); });
  leave(`#${fid}`, fb1 - 0.35);
  // Prompt 4 + AGENTS.md: the reusable rules (moved here from the setup step)
  const ap = find("claude applied only the changes");
  const ap1 = at("and the final step is review") - 0.1;
  const mid = at("so instead of remembering", ap);
  scene(T(ap) - 0.1, ap1);
  prompt({ t0: T(ap) - 0.1, t1: mid + 0.2, title: "Prompt 4 · Review & save my style", text: PROMPT4, typeDur: 2.6, highlights: [{ phrase: "save only the reusable editing preferences into AGENTS.md", t: at("save the reusable rule", ap) }] });
  const ag = nid("agents");
  const rules = [["don't cover my face", "Never cover my face"], ["keep the music subtle", "Keep the music subtle"], ["overuse b-roll", "Don't overuse B-roll"], ["preserve natural pauses", "Preserve natural pauses"]];
  clipDiv(ag, "", mid, ap1, `<div class="agents" style="opacity:1;left:1060px"><div class="h">${icon("file-text", 40, "#b4524a")}AGENTS.md</div><div class="r" id="${ag}-r0"><b>•</b>Transcribe → ElevenLabs by default</div>${rules.map(([, l], k) => `<div class="r" id="${ag}-r${k + 1}"><b>•</b>${l}</div>`).join("")}</div>`, "position:absolute;left:0;top:0;z-index:17", 17);
  fromTo(`#${ag} .agents`, { opacity: 0, x: 120, rotation: 3 }, { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "power3.out" }, mid);
  fromTo(`#${ag}-r0`, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3 }, mid + 0.5);
  rules.forEach(([p], k) => { fromTo(`#${ag}-r${k + 1}`, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35 }, at(p, ap)); sfx(at(p, ap), "pop", 0.14); });
  kinetic({ x: 560, y: 260, w: 460, size: 60, t1: ap1, parts: spoken("closer to my style", 4, ap, { style: "hl" }) });
  leave(`#${ag} .agents`, ap1 - 0.35);
}

// ══ STEP 6 ═════════════════════════════════════════════════════════════════
{
  stepT(6, STEPS[5][0], STEPS[5][1], at("and the final step is review") - 0.1);
  const f = find("finally, i didn't want claude");
  kinetic({ x: 90, y: 220, w: 780, size: 80, t1: at("i asked it to run") - 0.05, parts: spoken("export the video and say done", 6, f, { done: "x" }) });
  kinetic({ x: 90, y: 220, w: 780, size: 84, t1: at("claude checked for black frames") - 0.1, parts: spoken("a complete qa check", 4, f, { qa: "hl", check: "hl" }) });
  const q = find("claude checked for black frames");
  const q0 = T(q) - 0.1, q1 = at("and finally", q) - 0.1;
  scene(q0, q1);
  const qa = nid("qa");
  const checks = [["black frames", "Black frames"], ["frozen frames", "Frozen frames"], ["long silences", "Long silences"], ["audio sync", "Audio sync"], ["missing assets", "Missing assets"], ["broken graphics", "Broken graphics"], ["covering my face", "Face never covered"], ["contrast and the final", "Graphic contrast"]];
  const ring = checks.map((_, k) => { const a = (-90 + k * 45) * Math.PI / 180; return [650 + 420 * Math.cos(a) - 130, 400 + 350 * Math.sin(a) - 26]; });
  clipDiv(qa, "qa", q0, q1, `<div class="frame"></div><div class="sweep" id="${qa}-sw"></div><div class="ctr"><span id="${qa}-n">0</span>/25<small>checks</small></div>` + checks.map(([, l], k) => `<div class="chk" id="${qa}-c${k}" style="left:${r3(ring[k][0])}px;top:${r3(ring[k][1])}px">${icon("check-circle-2", 30, "#4cd68a")}${l}</div>`).join(""), "", 16);
  fromTo(`#${qa}`, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, q0);
  js.push(`tl.fromTo("#${qa}-sw",{rotation:0},{rotation:${360 * Math.max(1, Math.floor((q1 - q0) / 1.5))},duration:${r3(q1 - q0 - 0.4)},ease:"none"},${r3(q0)});`);
  checks.forEach(([p], k) => { const t = at(p, q); fromTo(`#${qa}-c${k}`, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" }, t); fromTo(`#${qa}-n`, { textContent: k * 3 }, { textContent: (k + 1) * 3, duration: 0.3, snap: { textContent: 1 } }, t); sfx(t, "pop", 0.12); });
  // the spoken number was cut; the ring lands on 25/25 as he says "passed all … checks"
  const pa = at("passed all", q) + 0.2;
  fromTo(`#${qa}-n`, { textContent: 24 }, { textContent: 25, duration: 0.6, snap: { textContent: 1 } }, pa);
  to(`#${qa} .ctr`, { color: "#4cd68a", scale: 1.15, duration: 0.3, yoyo: true, repeat: 1 }, pa + 0.5);
  sfx(pa, "riser", 0.2);
  leave(`#${qa}`, q1 - 0.35);
  // export + final specs
  const e = find("and finally", q);
  const e0 = T(e) - 0.1, e1 = insertStart("result") - 0.05;
  scene(e0, e1);
  const ex = nid("export");
  const specs = [["forty-one point eight", "41.8 s", "length"], ["thousand eighty", "1080 × 1920", "vertical"], ["thirty frames", "30 fps", "frame rate"], ["normalized", "−14 LUFS", "audio normalized"]];
  const sp0 = find("the final clip came out");
  clipDiv(ex, "export", e0, e1, `<div class="lbl">${icon("upload", 34, "#4cd68a")} Exporting final video…</div><div class="pb"><i id="${ex}-p"></i></div><div class="specs">${specs.map(([, v, l], k) => `<div class="sp" id="${ex}-s${k}">${v}<span>${l}</span></div>`).join("")}</div>`, "", 17);
  fromTo(`#${ex}`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, e0);
  fromTo(`#${ex}-p`, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, e0 + 0.3);
  specs.forEach(([p], k) => { fromTo(`#${ex}-s${k}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, at(p, sp0)); sfx(at(p, sp0), "pop", 0.12); });
  leave(`#${ex}`, e1 - 0.35);
}

// ══ THE RESULT — announced, then played in full with its own sound ═════════
{
  const t0 = insertStart("result"), A = 2.8;
  const id = nid("ann");
  clipDiv(id, "ann", t0, t0 + A + 0.4, `<div class="rays">${spark(200)}</div><div class="k">Prompts in. Video out.</div><div class="t">Here's the result</div>`, "", 49);
  fromTo(`#${id} .rays`, { opacity: 0, scale: 0.2, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.6)" }, t0);
  fromTo(`#${id} .k`, { opacity: 0, scaleX: 1.6 }, { opacity: 1, scaleX: 1, duration: 0.7, ease: "power3.out" }, t0 + 0.3);
  fromTo(`#${id} .t`, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power4.out" }, t0 + 0.9);
  to(`#${id} .rays svg`, { rotation: 120, duration: A, ease: "none" }, t0);
  sfx(t0, "riser", 0.5); sfx(t0 + 0.95, "stamp", 0.4);
  const r0 = r3(t0 + A);
  html.push(`<div id="result" class="result"><video id="result-bg" class="clip" src="media/sample-edited-bg.mp4" muted playsinline data-start="${r0}" data-duration="41.73" data-track-index="13"></video><video id="result-v" class="clip" src="media/sample-edited.mp4" playsinline data-has-audio="true" data-start="${r0}" data-duration="41.73" data-track-index="14"></video><div class="pill">${spark(22)}Edited by Claude · the result</div></div>`);
  fromTo("#result", { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, r0 - 0.2);
  to("#result", { opacity: 0, duration: 0.4, ease: "power2.in" }, r0 + 41.73 - 0.4);
}

// ══ CONCLUSION — big, animated ═════════════════════════════════════════════
{
  const c = find("so finally the");
  const q = find("so did claude code edit the entire video");
  const yes = find("in a way, yes");
  kinetic({ x: 90, y: 180, w: 820, size: 80, t1: T(yes) - 0.05, parts: spoken("so did claude code edit the entire video", 8, q, { claude: "hl", code: "hl", entire: "hl" }) });
  const y1 = at("claude code was the coordinator") - 0.1;
  const yid = nid("yes");
  clipDiv(yid, "", T(yes), y1, `<div class="stamp" style="position:static;width:auto;height:auto;padding:10px 40px;border-radius:30px;border-color:#4cd68a;color:#4cd68a;font-size:110px;opacity:1">YES*</div>`, "position:absolute;left:1360px;top:200px;z-index:30", 30);
  fromTo(`#${yid} .stamp`, { opacity: 0, scale: 2.5, rotation: -15 }, { opacity: 1, scale: 1, rotation: -6, duration: 0.25, ease: "power4.in" }, T(yes) + 0.1);
  sfx(T(yes) + 0.3, "stamp", 0.4);
  kinetic({ x: 90, y: 600, w: 820, size: 54, t1: y1, parts: spoken("claude itself didn't replace every tool", 6, yes, { "didn't": "hl" }) });
  // orbit reprise: each tool lights as he names its job
  const o0 = at("claude code was the coordinator") - 0.1, o1 = TE(find("worked together", o0 > 0 ? find("claude code was the coordinator") : 0)) + 0.6;
  scene(o0, o1);
  const cc = find("claude code was the coordinator");
  orbit(o0, o1, [at("elevenlabs understood", cc), at("ffmpeg processed", cc), at("descript changed", cc), at("hyperframes created", cc), at("hyperframes created", cc) + 0.9], { title: "the coordinator" });
  kinetic({ x: 560, y: 960, w: 1300, size: 44, align: "center", z: 20, t1: o1, parts: spoken("claude managed how everything worked together", 6, cc, { managed: "hl" }) });
  // human creative decisions vs the system's repetitive work — split screen
  const h = find("i still made the creative decisions");
  const n = find("and now, because claude has saved");
  const h0 = T(h) - 0.1, h1 = T(n) - 0.1;
  scene(h0, h1);
  const vs = nid("vs");
  const side = (cls, ic, col, title, who, chips) => `<div class="side ${cls}"><div class="ico">${icon(ic, 120, col, 1.6)}</div><div class="who">${who}</div><div class="tt">${title}</div>${chips.map((c, j) => `<div class="chip" id="${vs}-${cls}${j}">${c}</div>`).join("")}</div>`;
  clipDiv(vs, "vs", h0, h1, side("me", "lightbulb", "#ffd166", "Creative decisions", "Me", ["The story", "The style", "What stays in"]) + `<div class="badge">VS</div>` + side("sys", "bot", "#e8775f", "Repetitive editing", "The system", ["Cuts & pauses", "Captions & sync", "Renders & QA"]), "", 16);
  const tMe = at("creative decisions", h), tSys = at("repetitive editing work", h);
  fromTo(`#${vs} .me`, { opacity: 0, x: -160, rotation: -4 }, { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.4)" }, tMe - 0.2);
  fromTo(`#${vs} .badge`, { opacity: 0, scale: 3 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power4.in" }, tSys - 0.4);
  fromTo(`#${vs} .sys`, { opacity: 0, x: 160, rotation: 4 }, { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.4)" }, tSys - 0.2);
  [0, 1, 2].forEach((j) => { fromTo(`#${vs}-me${j}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, tMe + 0.3 + j * 0.2); fromTo(`#${vs}-sys${j}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, tSys + 0.3 + j * 0.2); });
  js.push(`tl.fromTo("#${vs} .me .ico",{scale:1},{scale:1.1,duration:0.5,yoyo:true,repeat:${Math.max(1, Math.floor((h1 - tMe) / 0.5) - 2)},ease:"sine.inOut"},${r3(tMe + 0.6)});`);
  js.push(`tl.to("#${vs} .sys .ico",{rotation:10,duration:0.25,yoyo:true,repeat:${Math.max(1, Math.floor((h1 - tSys) / 0.25) - 3)},ease:"sine.inOut"},${r3(tSys + 0.6)});`);
  sfx(tMe, "whoosh", 0.2); sfx(tSys - 0.3, "stamp", 0.3);
  leave(`#${vs}`, h1 - 0.35);
  // saved preferences → the next video gets easier → "really interesting"
  const ri = find("that's where this gets", n);
  const n0 = T(n) - 0.1, r0 = T(ri) - 0.1;
  const n1 = r3(OUTRO_AT + 0.6); // runs under the outro's fade-in so the camera never flashes back
  scene(n0, n1);
  const nx = nid("nx");
  clipDiv(nx, "nx", n0, r0, `<div class="card a"><div class="h">${icon("file-text", 40, "#b4524a")}AGENTS.md</div><div class="r">Never cover my face</div><div class="r">Keep the music subtle</div><div class="r">Don't overuse B-roll</div><div class="r">Preserve natural pauses</div></div><div class="arrow">${icon("arrow-right", 90, "#e8775f", 2.5)}</div><div class="card b"><div class="h2">${icon("rocket", 64, "#4cd68a")}Next video</div><div class="lb">Editing effort</div><div class="meter"><i></i></div><div class="lb">Setup</div><div class="meter m2"><i></i></div></div>`, "", 16);
  fromTo(`#${nx} .a`, { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" }, at("saved my editing preferences", n) - 0.2);
  fromTo(`#${nx} .a .r`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.12 }, at("saved my editing preferences", n) + 0.3);
  const ez = at("next video should be even easier", n);
  fromTo(`#${nx} .arrow`, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, ez - 0.3);
  fromTo(`#${nx} .b`, { opacity: 0, x: 120, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" }, ez);
  fromTo(`#${nx} .meter i`, { scaleX: 1 }, { scaleX: 0.25, duration: 1.2, ease: "power3.inOut", stagger: 0.2 }, ez + 0.5);
  fromTo(`#${nx} .h2 svg`, { y: 0, x: 0 }, { y: -14, x: 14, duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut" }, ez + 0.4);
  sfx(ez, "whoosh", 0.22);
  leave(`#${nx}`, r0 - 0.3);
  const rb = nid("burst");
  clipDiv(rb, "", r0, n1, `<div class="in" style="position:absolute;left:810px;top:110px">${spark(300)}</div>`, "position:absolute;left:0;top:0;z-index:16", 16);
  fromTo(`#${rb} .in`, { opacity: 0, scale: 0.1, rotation: -180 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }, r0);
  js.push(`tl.to("#${rb} .in svg",{rotation:180,duration:${r3(n1 - r0)},ease:"none"},${r3(r0)});`);
  kinetic({ x: 300, y: 480, w: 1320, size: 104, align: "center", t1: OUTRO_AT - 0.2, parts: spoken("that's where this gets really interesting", 6, n, { really: "hl", interesting: "hl" }) });
  sfx(r0, "riser", 0.3);
}

// ══ OUTRO — Kalyan's voice recording over full-screen graphics ══════════════
{
  const o = OUTRO_AT, oe = TOTAL;
  const ow = (phrase, from = 0) => { const p = phrase.split(/\s+/).map(norm); for (let i = from; i <= OUTRO.length - p.length; i++) if (p.every((t, k) => norm(OUTRO[i + k].text) === t)) return i; throw new Error(`outro phrase not found: ${phrase}`); };
  const ot = (phrase) => r3(o + OUTRO[ow(phrase)].start);
  const ospoken = (phrase, n, mark = {}) => Array.from({ length: n }, (_, k) => ow(phrase) + k).map((j) => ({ text: OUTRO[j].text, t: r3(o + OUTRO[j].start), cls: mark[norm(OUTRO[j].text)] ?? "" }));
  scene(o - 0.4, oe, { pip: false });
  html.push(`<audio id="outro-voice" class="clip" src="media/outro-voice.wav" data-start="${o}" data-duration="${OUTRO_DUR}" data-volume="1" data-track-index="3"></audio>`);
  // 1) "And that's how I used Claude Code to edit this video." — the toolkit converges on Claude
  const b1 = ot("if you enjoyed") - 0.15;
  const rc1 = nid("recap");
  const tools = ["audio-waveform", "scissors", "mic", "layers", "globe"];
  clipDiv(rc1, "recap", o - 0.2, b1, `<div class="core">${spark(240)}</div>` + tools.map((ic, k) => `<div class="tb" id="${rc1}-t${k}">${icon(ic, 64)}</div>`).join(""), "", 16);
  fromTo(`#${rc1} .core`, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" }, o);
  tools.forEach((_, k) => { const a = (-90 + k * 72) * Math.PI / 180; fromTo(`#${rc1}-t${k}`, { opacity: 0, x: r3(700 * Math.cos(a)), y: r3(500 * Math.sin(a)) }, { opacity: 1, x: r3(230 * Math.cos(a)), y: r3(190 * Math.sin(a)), duration: 0.8, ease: "power3.out" }, o + 0.3 + k * 0.1); });
  js.push(`tl.to("#${rc1} .core svg",{rotation:180,duration:${r3(b1 - o)},ease:"none"},${o});`);
  leave(`#${rc1}`, b1 - 0.3);
  kinetic({ x: 160, y: 840, w: 1600, size: 64, align: "center", t1: b1, parts: ospoken("that's how i used claude code to edit this video.", 9, { claude: "hl", code: "hl" }) });
  sfx(o, "riser", 0.3);
  // 2) "…more practical AI tools, tutorials, and experiments"
  const b2 = ot("make sure") - 0.15;
  const cards = nid("more");
  clipDiv(cards, "more", b1, b2, [["tools,", "wrench", "AI tools"], ["tutorials,", "graduation-cap", "Tutorials"], ["experiments,", "flask-conical", "Experiments"]].map(([, ic, l], k) => `<div class="mc" id="${cards}-c${k}">${icon(ic, 110, ["#6ea8ff", "#ffd166", "#a78bfa"][k], 1.6)}<b>${l}</b></div>`).join(""), "", 16);
  kinetic({ x: 160, y: 150, w: 1600, size: 60, align: "center", t1: b2, parts: ospoken("want to see more practical ai", 6, { more: "hl", practical: "hl" }) });
  ["tools,", "tutorials,", "experiments,"].forEach((p, k) => { const t = r3(o + OUTRO[ow(p, 20)].start); fromTo(`#${cards}-c${k}`, { opacity: 0, y: 120, scale: 0.7, rotation: k === 1 ? 0 : k ? 6 : -6 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)" }, t); sfx(t, "pop", 0.16); });
  leave(`#${cards}`, b2 - 0.3);
  // 3) like + subscribe + bell
  const b3 = ot("i've also shared") - 0.15;
  const sub = nid("sub");
  clipDiv(sub, "subs", b2, b3, `<div class="like" id="${sub}-l">${icon("thumbs-up", 70)}<span>Like</span></div><div class="sbtn" id="${sub}-s"><span class="a">Subscribe</span><span class="b">${icon("check", 40)}Subscribed</span></div><div class="bell" id="${sub}-b">${icon("bell-ring", 90, "#ffd166", 2)}</div><div class="ch" id="${sub}-c">${spark(54)}AI with Kalyan</div>`, "", 16);
  const tl0 = ot("like"), ts0 = ot("subscribe"), tch = ot("ai with kalyan.");
  fromTo(`#${sub}-l`, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, tl0 - 0.35);
  to(`#${sub}-l`, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 }, tl0 + 0.1);
  set(`#${sub}-l`, { className: "like on" }, tl0 + 0.2);
  fromTo(`#${sub}-s`, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ts0 - 0.4);
  to(`#${sub}-s`, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, ts0 + 0.3);
  set(`#${sub}-s`, { className: "sbtn on" }, ts0 + 0.4);
  fromTo(`#${sub}-b`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, ts0 + 0.5);
  to(`#${sub}-b`, { rotation: 18, duration: 0.09, yoyo: true, repeat: 9, ease: "sine.inOut", transformOrigin: "50% 10%" }, ts0 + 0.9);
  fromTo(`#${sub}-c`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 }, tch - 0.1);
  sfx(tl0 + 0.1, "pop", 0.25); sfx(ts0 + 0.3, "stamp", 0.3); sfx(ts0 + 0.9, "pop", 0.2);
  leave(`#${sub}`, b3 - 0.3);
  // 4) prompts, tools & resources in the description + pinned comment
  const b4 = ot("thanks for watching") - 0.2;
  const ds = nid("desc");
  clipDiv(ds, "desc", b3, b4, `<div class="panel" id="${ds}-p"><div class="h">${icon("align-left", 34, "#aaa")}Description</div>${[["prompts,", "file-text", "All the prompts"], ["tools,", "wrench", "Tools I used"], ["resources", "link", "Useful resources"]].map(([, ic, l], k) => `<div class="row" id="${ds}-r${k}">${icon(ic, 36, "#e8775f")}${l}</div>`).join("")}</div><div class="down" id="${ds}-d">${icon("arrow-down", 80, "#fff", 2.5)}</div><div class="pin" id="${ds}-pin"><div class="ph">${icon("pin", 28, "#ffd166")}Pinned by AI with Kalyan</div><div class="pt">Prompts + tools for this edit are in the description ⬇</div></div>`, "", 16);
  fromTo(`#${ds}-p`, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, b3 + 0.1);
  [["prompts,", 0], ["tools,", 40], ["resources", 40]].forEach(([p, from], k) => { const t = r3(o + OUTRO[ow(p, from)].start); fromTo(`#${ds}-r${k}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, t); sfx(t, "pop", 0.13); });
  const tbelow = ot("below");
  fromTo(`#${ds}-d`, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3 }, tbelow - 0.2);
  js.push(`tl.to("#${ds}-d",{y:24,duration:0.3,yoyo:true,repeat:5,ease:"sine.inOut"},${r3(tbelow + 0.2)});`);
  const tpin = ot("pinned comment,");
  fromTo(`#${ds}-pin`, { opacity: 0, x: 140, rotation: 4 }, { opacity: 1, x: 0, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, tpin - 0.2);
  sfx(tpin, "whoosh", 0.2);
  const tco = ot("check them out.");
  to(`#${ds}-p, #${ds}-pin`, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1 }, tco);
  leave(`#${ds}`, b4 - 0.3);
  // 5) end card
  const ec = nid("endc");
  clipDiv(ec, "endc", b4, oe, `<div class="sp">${spark(180)}</div><div class="t1">Thanks for watching</div><div class="t2">See you in the next video</div><div class="ch">AI with Kalyan</div>`, "", 16);
  fromTo(`#${ec} .sp`, { opacity: 0, scale: 0.2, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.7)" }, b4 + 0.1);
  js.push(`tl.to("#${ec} .sp svg",{rotation:120,duration:${r3(oe - b4)},ease:"none"},${r3(b4)});`);
  fromTo(`#${ec} .t1`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ot("thanks for watching"));
  fromTo(`#${ec} .t2`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ot("see you in the next video"));
  fromTo(`#${ec} .ch`, { opacity: 0 }, { opacity: 1, duration: 0.5 }, ot("see you in the next video") + 0.5);
  noCaps.push([b4, oe + 1]);
  // outro captions use the same caption style as the rest of the video
  OUTRO_CAPS.push(...OUTRO.map((w) => ({ t: r3(o + w.start), e: r3(o + w.end), text: w.text })));
}

// ══ look-away covers: if Kalyan's eyes leave the lens while he's full-frame, a full-screen
//    kinetic card of what he's saying takes over for that moment ═════════════
const coveredAt = (a, b) => covered.some(([c0, c1]) => c0 <= a + 0.05 && c1 >= b - 0.05);
let coverCount = 0;
for (const wnd of gaze.windows) {
  let a = F(rc(wnd.start)) - 0.25, b = F(rc(wnd.end)) + 0.25;
  if (coveredAt(a, b)) continue;
  // trim to the part not already hidden by another graphic
  for (const [c0, c1] of covered) { if (c0 <= a && c1 > a) a = c1; if (c0 < b && c1 >= b) b = c0; }
  if (b - a < 0.3) continue;
  const t0 = r3(a), t1 = r3(Math.max(b, a + 1.3));
  const ws = words.map((w, i) => i).filter((i) => kept(i) && T(i) >= t0 - 0.6 && T(i) <= t1).slice(0, 7);
  if (!ws.length) continue;
  const id = nid("cover");
  clipDiv(id, "cover", t0, t1, `<div class="in"></div>`, "z-index:40", 12);
  fromTo(`#${id} .in`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t0);
  leave(`#${id} .in`, t1 - 0.25, {}, 0.25);
  kinetic({ x: 160, y: 380, w: 1600, size: 96, align: "center", z: 41, t1, parts: ws.map((i) => ({ text: words[i].text.replace(/[".,]/g, ""), t: Math.max(t0, T(i)) })) });
  covered.push([t0, t1]);
  coverCount++;
}

// ══ captions: short phrases, current word highlighted ══════════════════════
{
  const capWords = words.map((w, i) => i).filter(kept).map((i) => ({ i, t: T(i), e: TE(i), text: words[i].text.replace(/^"|"$/g, "").replace("transaction", "transition") })).concat(OUTRO_CAPS);
  const off = (t) => noCaps.some(([a, b]) => t >= a && t <= b);
  const groups = [];
  let g = [];
  for (const w of capWords) {
    if (off(w.t)) { if (g.length) groups.push(g); g = []; continue; }
    const prev = g.at(-1);
    if (g.length && (g.length >= 5 || w.t - prev.e > 0.45 || /[.?!]$/.test(prev.text))) { groups.push(g); g = []; }
    g.push(w);
  }
  if (g.length) groups.push(g);
  groups.forEach((gr, k) => {
    const t0 = gr[0].t - 0.05, t1 = Math.min(gr.at(-1).e + 0.25, groups[k + 1]?.[0].t - 0.06 ?? Infinity);
    const id = nid("cap");
    clipDiv(id, "cap", t0, t1, `<div class="in" style="opacity:1">${gr.map((w, j) => `<span class="cw" id="${id}-${j}">${esc(w.text)}</span>`).join(" ")}</div>`, "", 44);
    gr.forEach((w, j) => set(`#${id}-${j}`, { opacity: 1, color: "#ffffff" }, w.t));
  });
}

// ── music bed + SFX ─────────────────────────────────────────────────────────
{
  const BED = 0.11;
  const res0 = insertStart("result") + 2.8, res1 = r3(res0 + 41.73);
  const lane = (pts) => J({ version: 1, lanes: [{ target: "volume", points: pts.map(([t, v]) => ({ t: r3(t), v })) }] });
  const audio = (aid, src, start, dur, ms, pts, track) =>
    html.push(`<audio id="${aid}" class="clip" src="media/${src}" data-start="${r3(start)}" data-duration="${r3(dur)}" data-media-start="${r3(ms)}" data-volume="1" data-track-index="${track}" data-automation='${lane(pts)}'></audio>`);
  // sample inserts carry speech → dip the bed under them
  const dips = inserts.filter((x) => x.id !== "result").map((x) => [insertStart(x.id), insertStart(x.id) + x.dur]);
  const ptsFor = (start, endT, fadeIn, fadeOut) => {
    const p = [[0, fadeIn ? 0 : BED], [fadeIn ? 2 : 0.01, BED]];
    for (const [a, b] of dips) if (a > start && b < endT) p.push([a - start - 0.3, BED], [a - start, 0.04], [b - start, 0.04], [b - start + 0.4, BED]);
    p.push([endT - start - fadeOut, BED], [endT - start, 0]);
    return p.sort((x, y) => x[0] - y[0]);
  };
  audio("music-a", "music-a.wav", 0, 300, 0, ptsFor(0, 300, true, 3), 30);
  audio("music-b", "music-b.wav", 297, res0 - 297 - 2.2, 0, ptsFor(297, res0 - 2.2, true, 1.5), 33);
  audio("music-c", "music-a.wav", res1 - 0.2, TOTAL - res1 + 0.2, 120, ptsFor(res1 - 0.2, TOTAL, true, 3), 30);
  const DUR = { riser: 2.5, whoosh: 0.83, pop: 0.52, stamp: 0.62, snip: 0.73 };
  // thin out SFX that land within 0.25 s of another one
  const keepS = [];
  for (const s of sfxList.sort((a, b) => a[0] - b[0])) { const gap = keepS.length ? s[0] - keepS.at(-1)[0] : 99; if (gap > 0.9 || (gap > 0.4 && s[1] !== "pop")) keepS.push(s); } // sparse: the voice is the focus
  keepS.forEach(([t, name, vol], k) => html.push(`<audio id="sfx-${k}" class="clip" src="media/sfx-${name}.wav" data-start="${t}" data-duration="${DUR[name]}" data-volume="${vol}" data-track-index="${40 + (k % 4)}"></audio>`));
  sfxList.length = 0; sfxList.push(...keepS);
}

// ── camera moves + punch-ins ────────────────────────────────────────────────
modes.sort((a, b) => a[0] - b[0]);
for (let k = modes.length - 2; k >= 0; k--) if (modes[k][1] === "full" && modes[k + 1][1] === "pip" && modes[k + 1][0] - modes[k][0] < 1.2) modes.splice(k, 2, modes[k + 1]);
let cur = "full";
for (const [t, m] of modes) {
  if (m === cur) continue;
  if (m === "pip") set("#cam", { zIndex: 40 }, t);
  to("#cam", { ...CAM[m], duration: 0.6, ease: "power3.inOut" }, t);
  if (m === "full") set("#cam", { zIndex: 1 }, t + 0.6);
  cur = m;
}
const inPip = (t) => { let m = "full"; for (const [mt, mm] of modes) if (mt <= t) m = mm; return m !== "full"; };
let zoomed = false, lastToggle = -Infinity;
for (const t of [...new Set(joins)].sort((a, b) => a - b)) {
  if (t - lastToggle < 5 || inPip(t)) continue;
  zoomed = !zoomed; lastToggle = t;
  set("#cam-zoom", { scale: zoomed ? 1.12 : 1 }, t);
}
for (const [t, m] of modes) if (m !== "full") set("#cam-zoom", { scale: 1 }, t);

// ── assemble ────────────────────────────────────────────────────────────────
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<!-- GENERATED by build.mjs — edit the script, not this file. -->
<style>
${readFileSync(join(HERE, "style.css"), "utf-8")}
</style>
</head>
<body>
<div id="stage" data-composition-id="cld1279" data-start="0" data-duration="${TOTAL}" data-fps="25" data-width="1920" data-height="1080">
  <div id="backdrop"></div>
  <div id="cam"><div id="cam-zoom">
${camClips.map((c) => "    " + c).join("\n")}
  </div></div>
${html.map((h) => "  " + h).join("\n")}
  <script src="vendor/gsap.min.js"></script>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true });
    ${emitJs().join("\n    ")}
    window.__timelines["cld1279"] = tl;
  })();
  </script>
</div>
</body>
</html>
`;
writeFileSync(join(HERE, "index.html"), page);
writeFileSync(join(HERE, "inserts.json"), J({ inserts: inserts.map((x) => ({ ...x, final: insertStart(x.id) })), total: TOTAL, covers: coverCount }, null, 1));
console.log(`index.html: ${TOTAL.toFixed(2)} s · ${html.length} nodes · ${js.length} tweens · ${sfxList.length} SFX · ${coverCount} look-away covers`);
