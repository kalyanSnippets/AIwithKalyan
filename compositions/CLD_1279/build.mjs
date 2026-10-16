#!/usr/bin/env node
// Builds index.html for the full CLD_1279 edit (visual plan: edits/CLD_1279.visual-plan.md).
//
//   node compositions/CLD_1279/build.mjs
//
// Every graphic is anchored to a transcript word, mapped through the rough cut's
// source→output timeline (renders/CLD_1279-roughcut.timeline.json) and then shifted by the
// inserts (hook, sample clips with sound, before/after audio) that come before it. Re-render
// the rough cut or change an insert and every beat re-times itself.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const words = JSON.parse(readFileSync(join(ROOT, "transcripts/CLD_1279/words.json"), "utf-8"));
const pieces = JSON.parse(readFileSync(join(ROOT, "renders/CLD_1279-roughcut.timeline.json"), "utf-8"));
const RC_LEN = pieces.reduce((s, p) => s + p.dur, 0);
const r3 = (n) => Math.round(n * 1000) / 1000;

// ── Word lookup + time mapping ─────────────────────────────────────────────
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");
const kept = (i) => pieces.some((p) => words[i].start >= p.src - 0.001 && words[i].start <= p.src + p.dur + 0.001);
/** Index of the first kept word at/after `from` that starts `phrase` (all of it kept). */
function find(phrase, from = 0) {
  const p = phrase.split(/\s+/).map(norm);
  for (let i = from; i <= words.length - p.length; i++) {
    if (p.every((t, k) => norm(words[i + k].text) === t && kept(i + k))) return i;
  }
  throw new Error(`phrase not found: "${phrase}" after word ${from}`);
}
/** Rough-cut time of a source time (must be inside a kept piece). */
function rc(src) {
  for (const p of pieces) if (src >= p.src - 0.001 && src <= p.src + p.dur + 0.001) return p.out + Math.min(src - p.src, p.dur);
  throw new Error(`source time ${src} was cut`);
}
const rcStart = (i) => rc(words[i].start);
const rcEnd = (i) => rc(words[i].end);

// ── Inserts (rough-cut time they're placed at → their length) ──────────────
const HOOK = 7.0;
const w = {
  camera: find("straight from the camera") + 3,
  compareThis: find("compare that with this") + 3,
  neededWork: find("still needed work") + 2,
  naturalVoice: find("keep my natural voice") + 3,
  result: find("and this was the result", 1600) + 4,
};
const inserts = [
  { id: "raw", at: rcEnd(w.camera) + 0.25, dur: 7.6 },
  { id: "edit", at: rcEnd(w.compareThis) + 0.3, dur: 6.25 },
  { id: "before", at: rcEnd(w.neededWork) + 0.3, dur: 3.3 },
  { id: "after", at: rcEnd(w.naturalVoice) + 0.3, dur: 3.3 },
  { id: "full", at: rcEnd(w.result) + 0.3, dur: 41.73 },
].map((x) => ({ ...x, at: r3(x.at) }));
/** Final time for a rough-cut time (inserts placed exactly at `at` push it later). */
const F = (t) => r3(HOOK + t + inserts.filter((x) => x.at <= t).reduce((s, x) => s + x.dur, 0));
const insertStart = (id) => {
  const x = inserts.find((i) => i.id === id);
  return r3(HOOK + x.at + inserts.filter((i) => i.at < x.at).reduce((s, i) => s + i.dur, 0));
};
const T = (i) => F(rcStart(i)); // final time a word starts
const TE = (i) => F(rcEnd(i)); // final time a word ends
const at = (phrase, from) => T(find(phrase, from));
const TOTAL = r3(HOOK + RC_LEN + inserts.reduce((s, x) => s + x.dur, 0));

// ── HTML + timeline accumulators ───────────────────────────────────────────
const html = [];
const js = [];
const sfxList = []; // [time, name, volume]
const sfx = (t, name, vol) => sfxList.push([r3(t), name, vol]);
let uid = 0;
const id = (p) => `${p}-${++uid}`;
const clip = (cls, start, dur, inner, extra = "", track = 5) =>
  `<div id="${id(cls.split(" ")[0])}" class="clip ${cls}" data-start="${r3(start)}" data-duration="${r3(dur)}" data-track-index="${track}" ${extra}>${inner}</div>`;
// enter/exit tweens act on the inner .in node (never on the .clip itself)
function pop(sel, t, from = { y: 18 }, d = 0.5) {
  js.push(`tl.fromTo(${JSON.stringify(sel)},${JSON.stringify({ opacity: 0, ...from })},${JSON.stringify({ opacity: 1, x: 0, y: 0, scale: 1, duration: d, ease: "power3.out" })},${r3(t)});`);
}
function fade(sel, t, to = {}, d = 0.35) {
  js.push(`tl.to(${JSON.stringify(sel)},${JSON.stringify({ opacity: 0, duration: d, ease: "power2.in", ...to })},${r3(t)});`);
}
function set(sel, t, props) {
  js.push(`tl.set(${JSON.stringify(sel)},${JSON.stringify(props)},${r3(t)});`);
}
function to(sel, t, props) {
  js.push(`tl.to(${JSON.stringify(sel)},${JSON.stringify(props)},${r3(t)});`);
}

// ── Camera: rough-cut segments between inserts, freeze frames during inserts ─
const CAM = {
  full: { x: 0, y: 0, scale: 1, borderRadius: 0 },
  pip: { x: 48, y: 780, scale: 448 / 1920, borderRadius: 120 }, // 120 px at full size ≈ 28 px in the PiP card
};
const camClips = [];
let rcPos = 0;
for (const x of inserts) {
  camClips.push(`<video id="cam-${camClips.length}" class="clip cam-v" src="media/roughcut.mp4" playsinline data-has-audio="true" data-start="${F(rcPos)}" data-duration="${r3(x.at - rcPos)}" data-media-start="${r3(rcPos)}" data-track-index="1"></video>`);
  camClips.push(`<img id="freeze-${x.id}" class="clip cam-v freeze" src="media/freeze-${x.id}.jpg" data-start="${insertStart(x.id)}" data-duration="${x.dur}" data-track-index="1" />`);
  rcPos = x.at;
}
camClips.push(`<video id="cam-${camClips.length}" class="clip cam-v" src="media/roughcut.mp4" playsinline data-has-audio="true" data-start="${F(rcPos)}" data-duration="${r3(RC_LEN - rcPos)}" data-media-start="${r3(rcPos)}" data-track-index="1"></video>`);

// Layout modes over time: [final time, mode]
const modes = [];
const mode = (t, m) => modes.push([r3(t), m]);

// Jump-cut punch-ins: alternate 100% / 110% at every join between kept passages.
const joins = [];
for (let k = 1; k < pieces.length; k++) {
  const a = pieces[k - 1], b = pieces[k];
  if (Math.abs(a.src + a.dur - b.src) > 0.05) joins.push(F(b.out));
}

// ── Components ─────────────────────────────────────────────────────────────
const glass = "glass";
/** Chapter chip, top-left. */
function chapter(n, title, t, dur = 4.5) {
  sfx(t, "whoosh", 0.22);
  html.push(clip("chapter", t, dur, `<div class="in ${glass}"><span class="num">0${n}</span><span>${title}</span></div>`, "", 20));
  pop(`#chapter-${uid} .in`, t, { x: -30 });
  fade(`#chapter-${uid} .in`, t + dur - 0.35, { x: -20 });
}
/** Side panel (glass) on the left or right of Kalyan, items revealed at times. */
function panel({ side = "left", top = 150, width = 560, t0, t1, title, items, cls = "" }) {
  const pid = id("panel");
  const pos = side === "left" ? `left:80px;` : `right:80px;`;
  const rows = items
    .map((it, k) => `<div class="row ${it.cls ?? ""}" id="${pid}-r${k}">${it.html}</div>`)
    .join("");
  html.push(`<div id="${pid}" class="clip panel ${cls}" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="10" style="${pos}top:${top}px;width:${width}px;"><div class="in ${glass}">${title ? `<div class="ptitle">${title}</div>` : ""}${rows}</div></div>`);
  pop(`#${pid} .in`, t0, { x: side === "left" ? -50 : 50, scale: 0.97 });
  sfx(t0, "whoosh", 0.2);
  items.forEach((it, k) => pop(`#${pid}-r${k}`, Math.max(t0 + 0.2, it.t), { y: 14 }, 0.4));
  fade(`#${pid} .in`, t1 - 0.35, { x: side === "left" ? -30 : 30 });
  return pid;
}
/** Quote card. */
function quote({ side = "left", top = 300, width = 600, t0, t1, text, sub }) {
  return panel({ side, top, width, t0, t1, items: [{ t: t0, html: `<div class="quote">${text}</div>${sub ? `<div class="qsub">${sub}</div>` : ""}` }], cls: "quotecard" });
}
/** Screen recording in a glass window (Kalyan in PiP while it plays). */
function screen({ src, t0, t1, mediaStart = 0, label, exit = true }) {
  const sid = id("screen");
  html.push(`<div id="${sid}" class="screenwin" style="opacity:0"><div class="bar"><i></i><i></i><i></i><span>${label ?? ""}</span></div><video id="${sid}-v" class="clip" src="media/${src}" muted playsinline data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-media-start="${mediaStart}" data-track-index="8"></video></div>`);
  js.push(`tl.fromTo("#${sid}",{opacity:0,scale:0.96},{opacity:1,scale:1,duration:0.5,ease:"power3.out"},${r3(t0)});`);
  sfx(t0, "whoosh", 0.2);
  js.push(`tl.to("#${sid}",{opacity:0,duration:0.3,ease:"power2.in"},${r3(t1 - 0.3)});`);
  mode(t0, "pip");
  if (exit) mode(t1 - 0.3, "full");
}
/** Small glass chips stacked (rule chips etc.), absolutely positioned. */
function chips({ x, y, t1, items, w = 420 }) {
  items.forEach((it) => {
    const cid = id("chip");
    html.push(`<div id="${cid}" class="clip chip" data-start="${r3(it.t)}" data-duration="${r3(t1 - it.t)}" data-track-index="12" style="left:${x}px;top:${y + it.k * 72}px;width:${w}px"><div class="in ${glass}">${it.html}</div></div>`);
    pop(`#${cid} .in`, it.t, { y: 14, scale: 0.95 }, 0.4);
    sfx(it.t, "pop", 0.16);
    fade(`#${cid} .in`, t1 - 0.3);
  });
}

// ══ HOOK (0–7 s) ═══════════════════════════════════════════════════════════
{
  const b = [
    { src: "blooper-1.mp4", dur: 1.4, x: 0.95 },
    { src: "blooper-2.mp4", dur: 1.45, x: 1.0 },
    { src: "blooper-3.mp4", dur: 0.8, x: 0.55 },
  ];
  let t = 0;
  b.forEach((c, k) => {
    html.push(`<video id="blooper-${k}" class="clip full" src="media/${c.src}" playsinline data-has-audio="true" data-start="${r3(t)}" data-duration="${c.dur}" data-track-index="2"></video>`);
    html.push(clip("stamp", t + c.x, c.dur - c.x, `<div class="in">✕</div>`, "", 3));
    js.push(`tl.fromTo("#stamp-${uid} .in",{opacity:0,scale:2.4,rotation:-18},{opacity:1,scale:1,rotation:-8,duration:0.18,ease:"power4.in"},${r3(t + c.x)});`);
    sfx(t + c.x + 0.12, "stamp", 0.5);
    t += c.dur;
  });
  html.push(clip("rawtag", 0.1, t - 0.1, `<div class="in ${glass}"><span class="dot"></span>Raw footage · 16:47</div>`, "", 4));
  pop(`#rawtag-${uid} .in`, 0.1, { y: -10 }, 0.3);
  // Payoff: timeline bar shrinks 16:47 → 9:56 with snips.
  const t0 = t, t1 = HOOK;
  const blocks = Array.from({ length: 22 }, (_, k) => `<i class="${[2, 5, 6, 9, 12, 13, 16, 19, 20].includes(k) ? "cut" : ""}"></i>`).join("");
  html.push(clip("hookend", t0, t1 - t0, `<div class="bg"></div><div class="in"><div class="kicker">✳ Edited by Claude Code</div><div class="track">${blocks}</div><div class="times"><span id="from">16:47</span><span class="arrow">→</span><span id="tot">9:56</span></div><div class="sub">No timeline. No manual cuts. One conversation.</div></div>`, "", 4));
  const hid = `#hookend-${uid}`;
  js.push(`tl.fromTo("${hid} .bg",{opacity:0},{opacity:1,duration:0.25},${r3(t0)});`);
  js.push(`tl.fromTo("${hid} .in",{opacity:0},{opacity:1,duration:0.2},${r3(t0)});`);
  pop(`${hid} .kicker`, t0 + 0.1, { y: -14 }, 0.4);
  sfx(t0, "riser", 0.45);
  sfx(t0 + 1.5, "snip", 0.4);
  sfx(t0 + 1.8, "snip", 0.35);
  pop(`${hid} .track`, t0 + 0.2, { scaleX: 0.6 }, 0.45);
  js.push(`tl.to("${hid} .track i.cut",{background:"#ff4d4f",duration:0.12,stagger:0.08},${r3(t0 + 0.8)});`);
  js.push(`tl.to("${hid} .track i.cut",{scaleY:0,opacity:0,duration:0.3,ease:"power3.in",stagger:0.05},${r3(t0 + 1.5)});`);
  js.push(`tl.to("${hid} .track",{scaleX:0.62,duration:0.5,ease:"power3.inOut"},${r3(t0 + 2.0)});`);
  pop(`${hid} .times`, t0 + 0.35, { y: 12 }, 0.4);
  js.push(`tl.fromTo("${hid} #tot",{opacity:0,x:-10},{opacity:1,x:0,duration:0.3},${r3(t0 + 1.9)});`);
  pop(`${hid} .sub`, t0 + 2.2, { y: 10 }, 0.4);
  js.push(`tl.to("${hid} .in",{opacity:0,scale:1.04,duration:0.3,ease:"power2.in"},${r3(t1 - 0.3)});`);
  js.push(`tl.to("${hid} .bg",{opacity:0,duration:0.3},${r3(t1 - 0.3)});`);
}

// ══ COLD OPEN: the chores ══════════════════════════════════════════════════
{
  const s = find("find the mistakes");
  const chores = [
    ["mistakes", "Find the mistakes"], ["bad takes", "Remove bad takes"], ["pauses", "Trim the pauses"],
    ["audio", "Clean the audio"], ["visuals", "Plan the visuals"], ["b-rolls", "Find B-roll"],
    ["captions", "Add captions"], ["music", "Music"], ["sound effects", "Sound effects"], ["export", "Export"],
  ];
  const items = chores.map(([p, label]) => ({ t: at(p, s), html: `<span class="tick">○</span>${label}` }));
  const end = at("and honestly");
  panel({ side: "left", top: 110, width: 520, t0: items[0].t - 0.3, t1: end + 0.6, title: "After every recording…", items, cls: "list" });
  // Pile-up: every chip shakes slightly on "finally export everything"
  js.push(`tl.to(".list .row",{x:6,duration:0.05,repeat:5,yoyo:true,ease:"none"},${at("export everything")});`);
  joins.push(at("the least")); // punch-in on "the least"
  chips({ x: 80, y: 900, t1: TE(find("everything", find("bad audio"))) + 0.5, w: 380, items: [{ t: at("to claude code", find("raw footage")), k: 0, html: `<span class="star">✳</span>Claude Code` }] });
}

// ══ INTRO SAMPLE CARDS (raw left, edit right) with sound inserts ═══════════
{
  const rawIn = at("and this is what the raw footage");
  const rawIns = insertStart("raw");
  // Raw card: muted lead-in, then the flub with sound at centre stage, then out.
  const rawLead = rawIns - rawIn;
  const rawMedia0 = 34.35 - rawLead; // so the audible part starts at 34.35 ("Claude will automatically…")
  html.push(`<div id="rawcard" class="samplecard" style="left:150px;top:124px;width:468px;height:832px;opacity:0">
    <video id="raw-a" class="clip" src="media/sample-raw.mp4" muted playsinline data-start="${rawIn}" data-duration="${r3(rawLead)}" data-media-start="${r3(rawMedia0)}" data-track-index="6"></video>
    <video id="raw-b" class="clip" src="media/sample-raw.mp4" playsinline data-has-audio="true" data-start="${rawIns}" data-duration="7.6" data-media-start="34.35" data-track-index="7"></video>
    <div class="pill ${glass}"><span class="dot"></span>Raw footage</div></div>`);
  sfx(rawIn, "whoosh", 0.2);
  js.push(`tl.fromTo("#rawcard",{opacity:0,x:-80,scale:0.96},{opacity:1,x:0,scale:1,duration:0.55,ease:"power3.out"},${rawIn});`);
  // Centre stage during the audible insert
  js.push(`tl.to("#rawcard",{x:576,y:-64,scale:${r3(960 / 832)},duration:0.5,ease:"power3.inOut"},${r3(rawIns - 0.1)});`);
  const flub = rawIns + (37.30 - 34.35), dead = rawIns + (38.22 - 34.35), retake = rawIns + (38.90 - 34.35);
  chips({ x: 1300, y: 400, t1: rawIns + 7.6, w: 470, items: [
    { t: flub, k: 0, html: `<span class="ic red">✕</span>Mistake <em>“Higgsfield <s>fee</s> MCP”</em>` },
    { t: dead, k: 1, html: `<span class="ic amber">❚❚</span>Dead air` },
    { t: retake, k: 2, html: `<span class="ic blue">↻</span>Retake` },
  ] });
  js.push(`tl.to("#rawcard",{opacity:0,duration:0.35,ease:"power2.in"},${r3(rawIns + 7.6 - 0.35)});`);

  const editIn = at("and now compare that");
  const editIns = insertStart("edit");
  const editLead = editIns - editIn;
  const editPostEnd = TE(find("everything", find("sound effects", find("graphics were added")))) + 0.6;
  html.push(`<div id="editcard" class="samplecard" style="left:1356px;top:96px;width:420px;height:746px;opacity:0">
    <video id="edit-a" class="clip" src="media/sample-edited.mp4" muted playsinline data-start="${editIn}" data-duration="${r3(editLead)}" data-media-start="${r3(32.15 - editLead)}" data-track-index="6"></video>
    <video id="edit-b" class="clip" src="media/sample-edited.mp4" playsinline data-has-audio="true" data-start="${editIns}" data-duration="6.25" data-media-start="32.15" data-track-index="7"></video>
    <video id="edit-c" class="clip" src="media/sample-edited.mp4" muted playsinline data-start="${r3(editIns + 6.25)}" data-duration="${r3(editPostEnd - editIns - 6.25)}" data-media-start="9.6" data-track-index="6"></video>
    <div class="pill ${glass}"><span class="star">✳</span>Edited by Claude</div></div>`);
  sfx(editIn, "whoosh", 0.2);
  js.push(`tl.fromTo("#editcard",{opacity:0,x:80,scale:0.96},{opacity:1,x:0,scale:1,duration:0.55,ease:"power3.out"},${editIn});`);
  js.push(`tl.to("#editcard",{x:-630,y:-36,scale:${r3(960 / 746)},duration:0.5,ease:"power3.inOut"},${r3(editIns - 0.1)});`);
  js.push(`tl.to("#editcard",{x:0,y:0,scale:1,duration:0.5,ease:"power3.inOut"},${r3(editIns + 6.25 - 0.1)});`);
  chips({ x: 1356, y: 870, t1: editPostEnd, w: 420, items: [
    { t: editIns + 0.4, k: 0, html: `<span class="ic green">✓</span>Clean take kept` },
    { t: at("the pauses were tightened"), k: 1, html: `<span class="ic coral">✂</span>Pauses tightened` },
  ] });
  js.push(`tl.to("#editcard",{opacity:0,duration:0.35,ease:"power2.in"},${r3(editPostEnd - 0.35)});`);
}

// ══ THESIS: orbit of tools ═════════════════════════════════════════════════
function orbit({ t0, t1, lights }) {
  const oid = id("orbit");
  const tools = [
    ["ElevenLabs", "transcription · music · SFX"], ["FFmpeg", "cut · process · render"], ["Descript", "studio sound"],
    ["HyperFrames", "motion graphics"], ["Browser", "research · B-roll"],
  ];
  const nodes = tools.map(([n, d], k) => {
    const a = (-90 + k * 72) * Math.PI / 180;
    return `<div class="node" id="${oid}-n${k}" style="left:${r3(480 + 330 * Math.cos(a) - 130)}px;top:${r3(380 + 300 * Math.sin(a) - 46)}px"><b>${n}</b><span>${d}</span></div>`;
  }).join("");
  const lines = tools.map((_, k) => {
    const a = (-90 + k * 72) * Math.PI / 180;
    return `<line id="${oid}-l${k}" x1="480" y1="380" x2="${r3(480 + 330 * Math.cos(a))}" y2="${r3(380 + 300 * Math.sin(a))}" />`;
  }).join("");
  html.push(`<div id="${oid}" class="clip orbit" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="10"><div class="in"><svg width="960" height="760">${lines}</svg><div class="hub glass">✳<b>Claude Code</b><span>the coordinator</span></div>${nodes}</div></div>`);
  pop(`#${oid} .in`, t0, { scale: 0.94 });
  pop(`#${oid} .hub`, t0 + 0.1, { scale: 0.6 });
  lights.forEach((t, k) => {
    pop(`#${oid}-n${k}`, t, { scale: 0.7 }, 0.4);
    js.push(`tl.fromTo("#${oid}-l${k}",{strokeDashoffset:400},{strokeDashoffset:0,duration:0.5,ease:"power2.out"},${r3(t - 0.15)});`);
  });
  fade(`#${oid} .in`, t1 - 0.35);
}
{
  const s = find("claude code managed the workflow", 255);
  const t0 = T(s), t1 = at("so to make this simple");
  const dt = at("different tools", s);
  orbit({ t0, t1, lights: [0, 1, 2, 3, 4].map((k) => dt + k * 0.25) });
  html.push(`<div id="${id("bgdim")}" class="clip bgdim" data-start="${t0}" data-duration="${r3(t1 - t0)}" data-track-index="9"><div class="in"></div></div>`);
  pop(`.bgdim[data-start="${t0}"] .in`, t0, {}, 0.4);
  fade(`.bgdim[data-start="${t0}"] .in`, t1 - 0.35);
  mode(t0, "pip"); mode(t1 - 0.3, "full");
}

// ══ SIX STEPS ══════════════════════════════════════════════════════════════
{
  const s = find("so to make this simple");
  const steps = [
    ["first step", "Build the editing engine"], ["step two", "Claude decodes the raw footage"],
    ["step three", "Shape the actual edit"], ["step four", "Claude designs the visuals"],
    ["step five is everything get assembled into", "Assemble the first version"], ["step six is we review and", "Review, final checks & export"],
  ];
  const t0 = T(s), t1 = at("so let's start with step one");
  const items = steps.map(([p, label], k) => ({ t: at(p, s), html: `<span class="num">0${k + 1}</span>${label}` }));
  const pid = panel({ side: "right", top: 150, width: 820, t0, t1: t1 + 0.4, title: "Six steps", items, cls: "steps" });
  html.push(`<div id="${id("bgdim")}" class="clip bgdim" data-start="${t0}" data-duration="${r3(t1 + 0.4 - t0)}" data-track-index="9"><div class="in"></div></div>`);
  pop(`.bgdim[data-start="${t0}"] .in`, t0, {}, 0.4);
  fade(`.bgdim[data-start="${t0}"] .in`, t1);
  mode(t0, "pip"); mode(t1, "full");
}

// ══ STEP 1 ═════════════════════════════════════════════════════════════════
{
  chapter(1, "Build the editing engine", at("so let's start with step one"));
  joins.push(at("the brain"));
  const s = find("so i used elevenlabs");
  const tools = [
    ["elevenlabs for", "ElevenLabs", "transcription · music · sound effects"],
    ["ffmpeg for the cutting", "FFmpeg", "cutting · processing · rendering"],
    ["descript for", "Descript", "cleaning the audio"],
    ["hyperframes for motion", "HyperFrames", "motion graphics"],
    ["browser research for", "Browser research", "supporting visuals & B-roll"],
  ];
  panel({ side: "left", top: 140, width: 560, t0: at("so i used elevenlabs") - 0.2, t1: at("then i gave the claude"), title: "The toolkit", cls: "tools",
    items: tools.map(([p, n, d]) => ({ t: at(p, s), html: `<b>${n}</b><span>${d}</span>` })) });
  // Setup prompt + skills on screen
  const p0 = at("then i gave the claude"), p1 = at("updated the hyperframe skills, created");
  screen({ src: "sr-setup.mp4", t0: p0, t1: p1, label: "Claude Code · setup prompt", exit: false });
  const k1 = at("so now the step two");
  screen({ src: "sr-skills.mp4", t0: p1, t1: k1 - 0.2, label: "Claude Code · project set up" });
  const rb = find("agents.md became");
  chips({ x: 1180, y: 150, t1: k1 - 0.3, w: 640, items: [
    { t: T(rb), k: 0, html: `<span class="ic coral">≡</span><b>AGENTS.md</b>&nbsp;= the permanent rule book` },
    { t: at("use elevenlabs by default"), k: 1, html: `<span class="ic green">✓</span>Transcribe → ElevenLabs by default` },
  ] });
}

// ══ STEP 2 ═════════════════════════════════════════════════════════════════
{
  const s2 = at("so now the step two");
  chapter(2, "Claude decodes the raw footage", s2);
  const fa = find("ffmpeg analyzed the duration");
  screen({ src: "sr-step2.mp4", t0: s2 + 0.2, t1: T(fa) - 0.1, label: "Inspect everything first" });
  const rows = [["duration", "Duration", "50 s"], ["resolution", "Resolution", "2160 × 3840"], ["frame rate", "Frame rate", "30 fps"], ["codec", "Codec", "HEVC"], ["audio", "Audio", "AAC"]];
  panel({ side: "left", top: 200, width: 540, t0: T(fa), t1: at("but technically, that's still just a video file") + 0.3, title: "ffprobe · raw.mp4", cls: "spec",
    items: rows.map(([p, k, v]) => ({ t: at(p, fa), html: `<span>${k}</span><b>${v}</b>` })) });
  // Word-timestamped transcript of the raw sample, with the flub and its retake
  const tw = at("so next, it used elevenlabs");
  const lines = [
    ["34.52", "Claude will automatically use"], ["36.72", "Higgsfield <s>fee</s> MCP.", "bad"], ["38.22", "· · · 0.68 s dead air", "dead"],
    ["38.90", "Claude will automatically use"], ["40.62", "Higgsfield MCP to edit your", "good"], ["42.74", "entire video in around ten minutes."],
  ];
  const tid = panel({ side: "left", top: 150, width: 640, t0: tw, t1: at("claude could identify both versions") + 0.2, title: "ElevenLabs · word timestamps", cls: "transcript",
    items: lines.map(([ts, txt, c], k) => ({ t: tw + 0.6 + k * 0.45, cls: c, html: `<span class="ts">${ts}</span><span>${txt}</span>` })) });
  js.push(`tl.to("#${tid} .row.bad",{backgroundColor:"rgba(255,77,79,0.28)",duration:0.3},${at("messed up one sentence")});`);
  js.push(`tl.to("#${tid} .row.good",{backgroundColor:"rgba(76,214,138,0.25)",duration:0.3},${at("said the same line properly")});`);
  joins.push(at("editing a document"));
}

// ══ STEP 3 ═════════════════════════════════════════════════════════════════
{
  chapter(3, "Shape the edit", at("shape the edit", 830) - 0.2);
  const p0 = at("before making any cuts, i asked"), p1 = at("don't remove every pause");
  screen({ src: "sr-plan.mp4", t0: p0, t1: p1 - 0.2, label: "Edit plan · keep / remove / shorten" });
  quote({ t0: p1, t1: at("the original clip was around"), text: "Fast editing ≠ talking like a robot.", sub: "Keep pauses that feel natural or emotional. Cut silences that add nothing." });
  const c0 = at("the original clip was around");
  const cid = panel({ side: "left", top: 300, width: 520, t0: c0, t1: at("but there was one problem") - 0.2, cls: "count",
    items: [{ t: c0, html: `<div class="big"><span id="cnt">50</span><small>s</small></div><div class="qsub">raw → after the planned cuts</div>` }] });
  js.push(`tl.fromTo("#cnt",{textContent:50},{textContent:41,duration:0.8,ease:"power2.out",snap:{textContent:1}},${at("forty-one", find("the original clip was around"))});`);
  js.push(`tl.to("#${cid} .big",{color:"#4cd68a",duration:0.3},${at("forty-one", find("the original clip was around")) + 0.8});`);
}

// ══ AUDIO: before / after Studio Sound ═════════════════════════════════════
function abCard(which, t, dur, label, sub) {
  const aid = id("ab");
  const bars = Array.from({ length: 48 }, (_, k) => `<i style="height:${r3(18 + 70 * Math.abs(Math.sin(k * 1.7) * Math.cos(k * 0.45)))}px"></i>`).join("");
  html.push(`<div id="${aid}" class="clip abcard ${which}" data-start="${r3(t)}" data-duration="${r3(dur)}" data-track-index="10"><div class="in glass"><div class="ptitle">${label}</div><div class="wave">${bars}</div><div class="qsub">${sub}</div></div></div>`);
  html.push(`<audio id="${aid}-a" class="clip" src="media/ab-${which}.wav" data-start="${r3(t + 0.2)}" data-duration="2.85" data-volume="1" data-track-index="11"></audio>`);
  pop(`#${aid} .in`, t, { scale: 0.92 });
  js.push(`tl.fromTo("#${aid} .wave i",{scaleY:0.2},{scaleY:1,duration:0.25,ease:"sine.inOut",stagger:{each:0.04,repeat:5,yoyo:true}},${r3(t + 0.2)});`);
  fade(`#${aid} .in`, t + dur - 0.3);
}
{
  const b = insertStart("before"), a = insertStart("after");
  abCard("before", b, 3.3, "Before · raw room audio", "“I recorded this video without my proper mic”");
  abCard("after", a, 3.3, "After · Descript Studio Sound", "Same line — room noise removed, voice kept natural");
  const d0 = at("so i used descript audio sound to reduce");
  panel({ side: "left", top: 260, width: 520, t0: d0, t1: a - 0.1, cls: "tools", items: [
    { t: d0 + 0.2, html: `<b>Descript</b><span>Studio Sound</span>` },
    { t: at("reduce the room noise"), html: `<b>−</b><span>room noise</span>` },
    { t: at("clarity", find("reduce the room noise")), html: `<b>+</b><span>clarity</span>` },
    { t: at("but still keep my natural voice"), html: `<b>=</b><span>your natural voice</span>` },
  ] });
}

// ══ STEP 4 ═════════════════════════════════════════════════════════════════
{
  const s4 = at("so step four is the design");
  chapter(4, "Design the visual experience", s4);
  const q0 = at("what should the viewer see");
  quote({ t0: q0 - 0.4, t1: at("claude analyzed the transcript again") - 0.1, text: "“What should the viewer see while I'm saying this?”" });
  const g0 = at("claude analyzed the transcript again");
  const tiles = [["full screen", "Full screen"], ["typography", "Typography"], ["graphics", "Graphics"], ["screen visuals", "Screen visuals"], ["b-rolls", "B-roll"], ["picture-in-picture", "Picture-in-picture"]];
  panel({ side: "left", top: 160, width: 560, t0: g0, t1: at("when the information was more important") - 0.1, cls: "grid",
    items: tiles.map(([p, l]) => ({ t: at(p, find("claude analyzed the transcript again")), html: `<div class="tile"></div><span>${l}</span>` })) });
  // The meta moment: Kalyan drops into the rounded card while describing it.
  const rc0 = at("rounded card");
  const ms0 = rc0 - 0.2, ms1 = at("for the style") - 0.2;
  html.push(`<div id="${id("mainscreen")}" class="clip mainscreen" data-start="${r3(ms0)}" data-duration="${r3(ms1 - ms0)}" data-track-index="8"><div class="in glass"><div class="ptitle">Main screen</div><div class="line l1"></div><div class="line l2"></div><div class="line l3"></div><div class="qsub">explains what I'm talking about</div></div></div>`);
  pop(`.mainscreen[data-start="${r3(ms0)}"] .in`, ms0, { scale: 0.95 });
  fade(`.mainscreen[data-start="${r3(ms0)}"] .in`, ms1 - 0.3);
  mode(ms0, "pip");
  chips({ x: 1180, y: 900, t1: ms1, w: 560, items: [{ t: at("never cover my face"), k: 0, html: `<span class="ic red">⊘</span>Rule: never cover my face` }] });
  // Liquid glass + HyperFrames
  const st0 = ms1 + 0.2, hf0 = at("that's where hyperframes came in");
  html.push(`<div id="${id("liquid")}" class="clip liquid" data-start="${r3(st0)}" data-duration="${r3(hf0 - st0)}" data-track-index="8"><div class="in"><div class="g g1"></div><div class="g g2"></div><div class="g g3"></div><div class="lq">Clean · Premium · Modern<span>liquid glass</span></div></div></div>`);
  pop(`.liquid[data-start="${r3(st0)}"] .in`, st0, { scale: 0.95 });
  js.push(`tl.fromTo(".liquid .g1",{x:-40,y:20},{x:40,y:-20,duration:${r3(hf0 - st0)},ease:"sine.inOut"},${r3(st0)});`);
  js.push(`tl.fromTo(".liquid .g2",{x:30,y:-30},{x:-30,y:30,duration:${r3(hf0 - st0)},ease:"sine.inOut"},${r3(st0)});`);
  fade(`.liquid[data-start="${r3(st0)}"] .in`, hf0 - 0.3);
  const bal0 = at("i also gave it a rough visual balance");
  screen({ src: "sr-github.mp4", t0: hf0, t1: hf0 + (bal0 - hf0) / 2, label: "github.com/heygen-com/hyperframes", exit: false });
  screen({ src: "sr-studio.mp4", t0: hf0 + (bal0 - hf0) / 2, t1: bal0, label: "HyperFrames Studio" });
  // 40 / 30 / 25 / 5
  const bars = [["forty percent", 40, "Me on camera"], ["thirty percent", 30, "Graphics & typography"], ["twenty-five percent", 25, "Screen visuals"], ["five percent", 5, "B-roll & transitions"]];
  const bid = panel({ side: "left", top: 200, width: 600, t0: bal0, t1: at("so step", 1260) - 0.2, title: "Visual balance", cls: "bars",
    items: bars.map(([p, v, l]) => ({ t: at(p, find("i also gave it a rough visual balance")), html: `<span>${l}</span><div class="bar"><i data-v="${v}"></i></div><b>${v}%</b>` })) });
  bars.forEach(([p, v], k) => js.push(`tl.fromTo("#${bid}-r${k} .bar i",{width:0},{width:${v * 4.2},duration:0.6,ease:"power3.out"},${at(p, find("i also gave it a rough visual balance")) + 0.1});`));
}

// ══ STEP 5 ═════════════════════════════════════════════════════════════════
{
  const s5 = at("so step", 1260);
  chapter(5, "Assemble the first version", s5);
  quote({ t0: at("i specifically told claude"), t1: at("and then claude brought all together") - 0.1, text: "“Keep them minimal. The voice should always be the focus.”", sub: "ElevenLabs · background music + a few subtle sound effects" });
  const r0 = at("and then claude brought all together"), r1 = at("this was the first moment", 1350);
  screen({ src: "sr-review.mp4", t0: r0, t1: r1 + 3, label: "Review version 1" });
  const notes = [["the graphic comes in too early", "graphic comes in too early", "0:12"], ["the music is too loud", "the music is too loud", "0:21"], ["keep me on screen longer", "keep me on screen longer", "0:30"], ["remove this transaction", "remove this transition", "0:35"]];
  const f0 = at("timestamped feedback");
  panel({ side: "left", top: 180, width: 560, t0: f0, t1: at("claude applied only the changes") - 0.1, title: "My feedback", cls: "notes",
    items: notes.map(([p, l, ts], k) => ({ t: k === 0 ? f0 + 0.3 : at(p, find("timestamped feedback")), html: `<span class="ts">${ts}</span><span>${l}</span>` })) });
  const a0 = at("claude applied only the changes"), a1 = at("and the final step is review");
  screen({ src: "sr-prefs.mp4", t0: a0, t1: a1 - 0.2, label: "AGENTS.md · Kalyan's editing preferences" });
  const rs = find("it remembers things like");
  chips({ x: 1240, y: 140, t1: a1 - 0.3, w: 560, items: [
    { t: at("don't cover my face", rs), k: 0, html: `<span class="ic green">✓</span>Don't cover my face` },
    { t: at("keep the music subtle", rs), k: 1, html: `<span class="ic green">✓</span>Keep the music subtle` },
    { t: at("overuse b-roll", rs), k: 2, html: `<span class="ic green">✓</span>Don't overuse B-roll` },
    { t: at("preserve natural pauses", rs), k: 3, html: `<span class="ic green">✓</span>Preserve natural pauses` },
  ] });
}

// ══ STEP 6 ═════════════════════════════════════════════════════════════════
{
  const s6 = at("and the final step is review");
  chapter(6, "Review, QA & export", s6);
  const q = find("claude checked for black frames");
  const checks = [["black frames", "Black frames"], ["frozen frames", "Frozen frames"], ["long silences", "Long silences"], ["audio sync", "Audio sync"], ["missing assets", "Missing assets"], ["broken graphics", "Broken graphics"], ["covering my face", "Anything covering my face"], ["contrast and the final", "Graphic contrast"]];
  const qid = panel({ side: "left", top: 110, width: 560, t0: T(q), t1: at("it exported the finished video") - 0.1, title: `QA · <span id="qa-n">0</span> / 25 checks`, cls: "qa",
    items: checks.map(([p, l]) => ({ t: at(p, q), html: `<span class="ic green">✓</span>${l}` })) });
  js.push(`tl.fromTo("#qa-n",{textContent:0},{textContent:25,duration:1.0,ease:"power2.out",snap:{textContent:1}},${at("twenty-five checks")});`);
  const e0 = at("it exported the finished video"), e1 = at("and this was the result", 1600);
  screen({ src: "sr-final.mp4", t0: e0, t1: e1 + 0.1, label: "Final export" });
  const sp = find("the final clip came out");
  chips({ x: 1240, y: 140, t1: e1 + 0.1, w: 560, items: [
    { t: at("forty-one point eight", sp), k: 0, html: `<b>41.8 s</b>&nbsp;final length` },
    { t: at("thousand eighty", sp), k: 1, html: `<b>1080 × 1920</b>&nbsp;vertical` },
    { t: at("thirty frames", sp), k: 2, html: `<b>30 fps</b>` },
    { t: at("normalized", sp), k: 3, html: `<b>Audio normalized</b>&nbsp;for playback` },
  ] });
}

// ══ THE RESULT: full Claude-edited video with sound ════════════════════════
{
  const t0 = insertStart("full");
  html.push(`<div id="result" class="result" style="opacity:0">
    <video id="result-bg" class="clip" src="media/sample-edited-bg.mp4" muted playsinline data-start="${t0}" data-duration="41.73" data-track-index="13"></video>
    <video id="result-v" class="clip" src="media/sample-edited.mp4" playsinline data-has-audio="true" data-start="${t0}" data-duration="41.73" data-track-index="14"></video>
    <div class="pill glass"><span class="star">✳</span>Edited by Claude · the result</div></div>`);
  js.push(`tl.fromTo("#result",{opacity:0,scale:1.03},{opacity:1,scale:1,duration:0.5,ease:"power3.out"},${t0});`);
  js.push(`tl.to("#result",{opacity:0,duration:0.4,ease:"power2.in"},${r3(t0 + 41.73 - 0.4)});`);
}

// ══ CONCLUSION: orbit reprise ══════════════════════════════════════════════
{
  const c = find("claude code was the coordinator");
  const lights = [["elevenlabs understood", c], ["ffmpeg processed", c], ["descript changed", c], ["hyperframes created", c], ["claude managed how", c]].map(([p, f]) => at(p, f));
  orbit({ t0: T(c) - 0.2, t1: TE(find("worked together", c)) + 0.8, lights: lights.slice(0, 4).concat([lights[0] + 0.1]) });
  const t0 = T(c) - 0.2, t1 = TE(find("worked together", c)) + 0.8;
  html.push(`<div id="${id("bgdim")}" class="clip bgdim" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="9"><div class="in"></div></div>`);
  pop(`.bgdim[data-start="${r3(t0)}"] .in`, t0, {}, 0.4);
  fade(`.bgdim[data-start="${r3(t0)}"] .in`, t1 - 0.35);
  mode(t0, "pip"); mode(t1 - 0.3, "full");
  // End tag
  const last = TE(words.length - 1);
  html.push(clip("endtag", last - 2.2, TOTAL - (last - 2.2), `<div class="in glass"><span class="star">✳</span>Edited with Claude Code · AI with Kalyan</div>`, "", 20));
  pop(`.endtag .in`, last - 2.2, { y: 20 });
}

// ── Music bed (ElevenLabs) + SFX ───────────────────────────────────────────
{
  const BED = 0.11; // ≈ −19 dB under the voice
  const res0 = insertStart("full"), res1 = r3(res0 + 41.73);
  const lane = (pts) => JSON.stringify({ version: 1, lanes: [{ target: "volume", points: pts.map(([t, v]) => ({ t: r3(t), v })) }] });
  const audio = (aid, src, start, dur, mediaStart, pts) =>
    html.push(`<audio id="${aid}" class="clip" src="media/${src}" data-start="${r3(start)}" data-duration="${r3(dur)}" data-media-start="${r3(mediaStart)}" data-volume="1" data-track-index="${aid === "music-b" ? 33 : 30}" data-automation='${lane(pts)}'></audio>`);
  // A: hook → 300 s (louder under the wordless hook payoff), crossfades into B
  audio("music-a", "music-a.wav", 0, 300, 0, [[0, 0.18], [3.6, 0.18], [4.2, 0.38], [6.6, 0.38], [7.6, BED], [297, BED], [300, 0]]);
  // B: 297 s → the result insert (the sample has its own music, so the bed fades out under it)
  audio("music-b", "music-b.wav", 297, res0 + 0.6 - 297, 0, [[0, 0], [3, BED], [res0 - 297 - 1.5, BED], [res0 - 297 + 0.6, 0]]);
  // Outro: back in after the result, out at the end
  audio("music-c", "music-a.wav", res1 - 0.2, TOTAL - res1 + 0.2, 120, [[0, 0], [1.5, BED], [TOTAL - res1 - 3, BED], [TOTAL - res1 + 0.2, 0]]);
  sfxList.sort((a, b) => a[0] - b[0]).forEach(([t, name, vol], k) =>
    html.push(`<audio id="sfx-${k}" class="clip" src="media/sfx-${name}.wav" data-start="${t}" data-duration="${{ riser: 2.5, whoosh: 0.83, pop: 0.52, stamp: 0.62, snip: 0.73 }[name]}" data-volume="${vol}" data-track-index="${40 + (k % 4)}"></audio>`));
}

// ── Camera mode + punch-in tweens ──────────────────────────────────────────
modes.sort((a, b) => a[0] - b[0]);
for (let k = modes.length - 2; k >= 0; k--) {
  if (modes[k][1] === "full" && modes[k + 1][1] === "pip" && modes[k + 1][0] - modes[k][0] < 1.0) modes.splice(k, 2, modes[k + 1]);
}
let cur = "full";
for (const [t, m] of modes) {
  if (m === cur) continue;
  if (m === "pip") set("#cam", t, { zIndex: 40 });
  js.push(`tl.to("#cam",${JSON.stringify({ ...CAM[m], duration: 0.6, ease: "power3.inOut" })},${t});`);
  if (m === "full") set("#cam", t + 0.6, { zIndex: 1 });
  cur = m;
}
const inPip = (t) => {
  let m = "full";
  for (const [mt, mm] of modes) if (mt <= t) m = mm;
  return m === "pip";
};
// Toggle at most every 6 s so the punch-ins hide jump cuts without feeling jumpy.
let zoomed = false;
let lastToggle = -Infinity;
for (const t of [...new Set(joins)].sort((a, b) => a - b)) {
  if (t < HOOK || t - lastToggle < 6 || inPip(t)) continue;
  zoomed = !zoomed;
  lastToggle = t;
  set("#cam-zoom", t, { scale: zoomed ? 1.1 : 1 });
}
for (const [t, m] of modes) if (m === "pip") set("#cam-zoom", t, { scale: 1 });

// ── Assemble ───────────────────────────────────────────────────────────────
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
    ${js.join("\n    ")}
    window.__timelines["cld1279"] = tl;
  })();
  </script>
</div>
</body>
</html>
`;
writeFileSync(join(HERE, "index.html"), page);
writeFileSync(join(HERE, "inserts.json"), JSON.stringify({ hook: HOOK, inserts: inserts.map((x) => ({ ...x, final: insertStart(x.id) })), total: TOTAL }, null, 1));
console.log(`index.html: ${TOTAL.toFixed(2)} s, ${html.length} nodes, ${js.length} tweens, ${sfxList.length} SFX`);
