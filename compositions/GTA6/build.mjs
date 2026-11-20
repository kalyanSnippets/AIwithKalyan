#!/usr/bin/env node
// GTA6 v2 — builds index.html (HyperFrames) from the ElevenLabs Scribe transcript, the A-roll v3 EDL and the
// approved edit brief (GTA6/edit-brief.md). Every graphic is anchored to a spoken word.
//
//   node compositions/GTA6/prep.mjs     (once: cuts official footage shots, stages audio)
//   node compositions/GTA6/build.mjs    (writes index.html)
//
// Inputs: GTA6/transcripts/IMG_1825-scribe/words.json (source time), GTA6/edits/aroll-v3.edl.json (cut),
// GTA6/edits/gaze-v3.json (look-away windows on the cut timeline), GTA6/transcripts/outro_v1/words.json.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const rd = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf-8"));
const words = rd("GTA6/transcripts/IMG_1825-scribe/words.json");
const EDL = rd("GTA6/edits/aroll-v4.edl.json").segments;
const SHOTS = JSON.parse(readFileSync(join(HERE, "shots.json"), "utf-8"));
const gaze = existsSync(join(ROOT, "GTA6/edits/gaze-v4.json")) ? rd("GTA6/edits/gaze-v4.json") : { windows: [] };
const I = 8.0;            // hype intro length; the A-roll starts here
const END_DUR = 9.0;      // animated end screen (no voice)
const SCRIPT = readFileSync(join(ROOT, "GTA6/script.md"), "utf-8");

const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const J = JSON.stringify;

// ── source → cut time ──────────────────────────────────────────────────────
const pieces = []; { let o = 0; for (const e of EDL) { pieces.push({ src: e.src_in, dur: e.src_out - e.src_in, out: o }); o += e.src_out - e.src_in; } }
const RC_LEN = r3(pieces.reduce((s, p) => s + p.dur, 0));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const kept = (i) => pieces.some((p) => words[i].start >= p.src - 0.02 && words[i].start <= p.src + p.dur);
const rc = (src) => { for (const p of pieces) if (src >= p.src - 0.02 && src <= p.src + p.dur + 0.001) return r3(I + p.out + Math.max(0, Math.min(src - p.src, p.dur))); const n = pieces.find((p) => p.src > src); return r3(I + (n ? n.out : RC_LEN)); };
const toks = (phrase) => phrase.split(/\s+/).map(norm).filter(Boolean);
function find(phrase, from = 0) {
  const p = toks(phrase);
  const W = words.map((w, i) => i).filter((i) => i >= from && kept(i) && norm(words[i].text));
  for (let k = 0; k <= W.length - p.length; k++) if (p.every((t, q) => norm(words[W[k + q]].text) === t)) return W[k];
  throw new Error(`phrase not found: "${phrase}" after word ${from}`);
}
const T = (i) => rc(words[i].start);
const TE = (i) => rc(words[i].end);
const at = (phrase, from = 0) => T(find(phrase, from));
const lastIdx = (phrase, from = 0) => { const i = find(phrase, from); const n = toks(phrase).length; let j = i, c = 1; while (c < n) { j++; if (kept(j) && norm(words[j].text)) c++; } return j; };
const end = (phrase, from = 0) => TE(lastIdx(phrase, from));

const AEND = r3(I + RC_LEN);
const TOTAL = r3(AEND + END_DUR);

// ── accumulators + tween helpers (same contract as CLD_1279/build.mjs) ────
const html = [], js = [], sfxList = [], covered = [], noCaps = [], modes = [];
let uid = 0;
const nid = (p) => `${p}-${++uid}`;
const sfx = (t, name, vol) => sfxList.push([r3(t), name, vol]);
const fromTo = (sel, from, to, t) => js.push({ sel, from, to, t: r3(t) });
const emitJs = () => {
  const first = {}; for (const e of js) if (typeof e === "object" && (first[e.sel] === undefined || e.t < first[e.sel])) first[e.sel] = e.t;
  const seen = {};
  return js.map((e) => { if (typeof e === "string") return e; const lead = e.t === first[e.sel] && !seen[e.sel]; if (lead) seen[e.sel] = true; return `tl.fromTo(${J(e.sel)},${J(e.from)},${J(lead ? e.to : { ...e.to, immediateRender: false })},${e.t});`; });
};
const to = (sel, props, t) => js.push(`tl.to(${J(sel)},${J(props)},${r3(t)});`);
const set = (sel, props, t) => js.push(`tl.set(${J(sel)},${J(props)},${r3(t)});`);
const clipDiv = (id, cls, t0, t1, inner, style = "", track = 10) => html.push(`<div id="${id}" class="clip ${cls}" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="${track}" style="${style}">${inner}</div>`);
const enter = (sel, t, from = { y: 30 }, d = 0.55, ease = "back.out(1.6)") => fromTo(sel, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: d, ease }, t);
const leave = (sel, t, extra = {}, d = 0.3) => to(sel, { opacity: 0, duration: d, ease: "power2.in", ...extra }, t);
const mode = (t, m) => modes.push([r3(t), m]);

// ── icons ──────────────────────────────────────────────────────────────────
const ICON_DIR = join(ROOT, "node_modules/lucide-static/icons");
function icon(name, size = 64, color = "#fff", sw = 2) {
  const svg = readFileSync(join(ICON_DIR, `${name}.svg`), "utf-8").replace(/<!--[\s\S]*?-->/g, "").trim();
  return svg.replace(/<svg[^>]*?>/, (m) => m.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "").replace(/\sclass="[^"]*"/, "").replace(/\sstroke-width="[^"]*"/, "").replace("<svg", `<svg class="ic" width="${size}" height="${size}" stroke-width="${sw}" style="color:${color}"`));
}
const PINK = "#ff3d9a", ORANGE = "#ff8a3d", TEAL = "#19e3d3";

// ── components ─────────────────────────────────────────────────────────────
/** Full-screen graphic background; Kalyan drops into the rounded PiP (bottom-left) unless pip:false. */
function scene(t0, t1, { pip = true } = {}) {
  const id = nid("scene");
  clipDiv(id, "scene", t0, t1, `<div class="in"><div class="grid"></div><div class="glow"></div></div>`, "", 6);
  fromTo(`#${id} .in`, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, t0);
  leave(`#${id} .in`, t1 - 0.35, {}, 0.35);
  if (pip) { mode(t0, "pip"); mode(t1 - 0.4, "full"); }
  covered.push([t0, t1]);
  return id;
}
/** Official footage, full-screen, muted. Slows (≥0.5×) to fill the slot, then holds its last frame.
 *  fade: cross-dissolve in (s). kb: in | out | left | right | none | punch | whip. Returns {id,t0,t1,rate,play,shot}. */
function foot(shot, t0, t1, { kb = "in", freeze = null, dim = false, track = 8, fade = 0.22, hold = false } = {}) {
  const s = SHOTS[shot]; if (!s) throw new Error(`no shot ${shot}`);
  const sd = s.t1 - s.t0, slot = t1 - t0;
  const rate = hold ? 1 : Math.max(0.5, Math.min(1, sd / slot));
  const play = freeze ? Math.min(freeze - t0, sd / rate) : Math.min(slot, sd / rate);
  const id = nid("foot");
  const vid = `<video id="${id}-v" class="clip" src="media/shots/${shot}.mp4" muted playsinline data-start="${r3(t0)}" data-duration="${r3(play)}" data-media-start="0"${rate < 1 ? ` data-playback-rate="${r3(rate)}"` : ""} data-track-index="${track}"></video>`;
  const img = play < slot - 0.02 ? `<img id="${id}-i" class="clip" src="media/shots/${shot}-z.jpg" data-start="${r3(t0 + play)}" data-duration="${r3(slot - play)}" data-track-index="${track}" />` : "";
  html.push(`<div id="${id}" class="foot" style="z-index:8;opacity:0"><div class="kb" id="${id}-k">${vid}${img}</div><div class="shade"></div><div class="dim"></div><div class="vig"></div><div class="credit">GTA VI · © Rockstar Games</div></div>`);
  if (fade > 0) fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: fade, ease: "none" }, t0); else set(`#${id}`, { opacity: 1 }, t0);
  set(`#${id}`, { opacity: 0 }, t1);
  const dur = r3(freeze ? freeze - t0 : slot);
  if (kb === "punch") { fromTo(`#${id}-k`, { scale: 1.28 }, { scale: 1.06, duration: 0.3, ease: "power3.out" }, t0); }
  else if (kb === "whip") { fromTo(`#${id}-k`, { x: -260, scale: 1.12, filter: "blur(18px)" }, { x: 0, scale: 1.05, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }, t0); }
  else { const K = { in: [{ scale: 1.0 }, { scale: 1.08 }], out: [{ scale: 1.1 }, { scale: 1.0 }], left: [{ scale: 1.08, x: 40 }, { scale: 1.08, x: -40 }], right: [{ scale: 1.08, x: -40 }, { scale: 1.08, x: 40 }], none: [{ scale: 1 }, { scale: 1 }] }[kb]; fromTo(`#${id}-k`, K[0], { ...K[1], duration: dur, ease: "none" }, t0); }
  if (freeze) { fromTo(`#${id} .dim`, { opacity: 0 }, { opacity: 0.6, duration: 0.25 }, freeze); fromTo(`#${id} .vig`, { opacity: 0 }, { opacity: 1, duration: 0.25 }, freeze); }
  if (dim) fromTo(`#${id} .dim`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0);
  covered.push([t0, t1]);
  return { id, t0: r3(t0), t1: r3(t1), rate, play, shot };
}
/** Several shots back to back across [t0,t1], cross-dissolving into each other. Returns the foot infos. */
function montage(list, t0, t1, opts = {}) {
  const cuts = list.map((x, k) => (typeof x === "object" ? x.t : null) ?? t0 + ((t1 - t0) * k) / list.length);
  return list.map((x, k) => foot(typeof x === "object" ? x.shot : x, Math.max(t0, cuts[k]), k + 1 < list.length ? cuts[k + 1] + 0.2 : t1, { kb: ["in", "left", "out", "right"][k % 4], ...(k + 1 === list.length && opts.freezeLast ? { freeze: opts.freezeLast } : {}), ...(opts.dim ? { dim: true } : {}) }));
}
/** White flash frame (impact). */
function flash(t) { const id = nid("fl"); clipDiv(id, "flash", t, t + 0.3, "", "", 47); fromTo(`#${id}`, { opacity: 0.9 }, { opacity: 0, duration: 0.28, ease: "power2.out" }, t); }
/** Three.js scene from scenes3d.js on the shared canvas. Anchors are film times (converted to scene-relative). */
const S3D = [], HUDS = [];
function s3d(name, t0, t1, a = {}, { pip = true } = {}) {
  S3D.push({ name, t0: r3(t0), t1: r3(t1), a: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, r3(v - t0)])) });
  covered.push([t0, t1]); if (pip) { mode(t0, "pip"); mode(t1 - 0.4, "full"); }
}
/** HUD overlay (hud.js) on a footage clip returned by foot(). Option times (flip, linkAt, scanAt, box t) are clip-relative. */
function hudOn(f, mode, o = {}) { HUDS.push({ t0: f.t0, t1: f.t1, shot: f.shot, rate: f.rate, play: f.play, mode, o }); }
/** 3D chapter transition (2.2 s) + title; the chapter tag follows. */
function chapter3d(n, title, t) {
  const d = 2.2; s3d("chapter" + n, t, t + d, {}, { pip: false });
  const id = nid("ch3");
  clipDiv(id, "ch3", t, t + d, `<div class="lab">TECHNOLOGY ${n} OF 6</div><div class="ttl">${title.toUpperCase().split("").map((c) => `<span>${c === " " ? "&nbsp;" : esc(c)}</span>`).join("")}</div>`, "", 46);
  fromTo(`#${id} .lab`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, t + 1.0);
  js.push(`tl.fromTo(${J(`#${id} .ttl span`)},{opacity:0,y:60,rotationX:-80},{opacity:1,y:0,rotationX:0,duration:0.4,stagger:0.025,ease:"back.out(2)"},${r3(t + 1.1)});`);
  leave(`#${id}`, t + d - 0.25, {}, 0.25);
  sfx(t, "whoosh", 0.3); noCaps.push([t, t + d]); CHAPS.push({ n, title, t0: t + d });
}
/** Pink/teal ring + label on frozen footage. */
function ring({ x, y, r = 130, t, t1, teal = false, label, key, lx, ly }) {
  const id = nid("ring");
  clipDiv(id, "", t, t1, `<div class="ring${teal ? " t" : ""}" style="left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px"></div>` + (label ? `<div class="alab${teal ? " t" : ""}" style="left:${lx}px;top:${ly}px">${key ? `<div class="k">● ${key}</div>` : ""}<div class="v">${label}</div></div>` : ""), "position:absolute;inset:0;z-index:20", 20);
  fromTo(`#${id} .ring`, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t);
  if (label) enter(`#${id} .alab`, t + 0.15, { x: -30 }, 0.4, "power3.out");
  leave(`#${id} .ring, #${id} .alab`, t1 - 0.25);
  sfx(t, "pop", 0.14);
}
/** Kinetic typography; each word lands at its own time. */
function kinetic({ x, y, w = 760, size = 96, t1, parts, align = "left", z }) {
  const id = nid("kin");
  noCaps.push([parts[0].t - 0.05, t1]);
  clipDiv(id, "kin", parts[0].t - 0.05, t1, parts.map((p, k) => `<span class="w ${p.cls ?? ""}" id="${id}-w${k}">${esc(p.text)}</span>`).join(""), `left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;text-align:${align};${z ? `z-index:${z};` : ""}`, 17);
  parts.forEach((p, k) => fromTo(`#${id}-w${k}`, { opacity: 0, y: 40, rotationX: -60 }, { opacity: 1, y: 0, rotationX: 0, duration: 0.42, ease: "back.out(2)" }, p.t));
  leave(`#${id}`, t1 - 0.3);
  return id;
}
/** Headline across the top of a scene. */
function hd(t0, t1, text, small, y = 90) { const id = nid("hd"); clipDiv(id, "hd", t0, t1, `${small ? `<small>${small}</small>` : ""}${text}`, `top:${y}px`, 16); enter(`#${id}`, t0, { y: -30 }, 0.5, "power3.out"); leave(`#${id}`, t1 - 0.3); }
/** Icon tile. */
function tile({ x, y, ic, label, sub, t, t1, color = "#fff", cls = "" }) {
  const id = nid("tile");
  clipDiv(id, `tile ${cls}`, t, t1, `<div class="ib">${ic.startsWith("<") ? ic : icon(ic, 84, color, 1.8)}</div><b>${label}</b>${sub ? `<s>${sub}</s>` : ""}`, `left:${x}px;top:${y}px`, 15);
  enter(`#${id}`, t, { y: 60, scale: 0.8 }, 0.55); leave(`#${id}`, t1 - 0.3, { scale: 0.9 }); sfx(t, "pop", 0.12);
  return id;
}
function arrow({ x, y, w, t, t1, rot = 0 }) { const id = nid("arr"); clipDiv(id, "", t, t1, `<div class="arrow" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg)"></div>`, "position:absolute;inset:0;z-index:14", 14); fromTo(`#${id} .arrow`, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.4, ease: "power3.out" }, t); leave(`#${id} .arrow`, t1 - 0.3); }
/** Chapter transition (full screen, 2.0 s) + persistent chapter tag until the next one. */
const CHAPS = [];
function chapter(n, title, ic, t) {
  const id = nid("chapt"), d = 2.0;
  clipDiv(id, "chapt", t, t + d, `<div class="wipe"></div><div class="grid"></div><div class="num">0${n}</div><div class="lab">Technology ${n} of 6</div><div class="ttl">${title}</div><div class="big">${icon(ic, 260, "#fff", 1.4)}</div>`, "", 46);
  fromTo(`#${id} .wipe`, { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: "power4.inOut" }, t);
  fromTo(`#${id} .num`, { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power4.out" }, t + 0.22);
  fromTo(`#${id} .lab`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, t + 0.35);
  fromTo(`#${id} .ttl`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t + 0.4);
  fromTo(`#${id} .big`, { opacity: 0, scale: 0.4, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.65, ease: "back.out(1.7)" }, t + 0.3);
  to(`#${id} .num, #${id} .lab, #${id} .ttl, #${id} .big`, { opacity: 0, x: 80, duration: 0.3, ease: "power2.in" }, t + d - 0.5);
  to(`#${id} .wipe`, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power4.inOut" }, t + d - 0.42);
  sfx(t, "whoosh", 0.3);
  covered.push([t, t + d]); noCaps.push([t + 0.1, t + d - 0.15]);
  CHAPS.push({ n, title, t0: t + d });
}
/** Source card (article screenshot with highlighted line). */
function source({ t0, t1, img, by, hl = [] }) {
  const id = nid("src");
  clipDiv(id, "src", t0, t1, `<img src="media/${img}" />${hl.map((h, k) => `<div class="hl" id="${id}-h${k}" style="left:${h[0]}px;top:${h[1]}px;width:${h[2]}px;height:${h[3]}px"></div>`).join("")}<div class="by">${icon("newspaper", 28, TEAL)}${by}</div>`, "", 18);
  enter(`#${id}`, t0, { y: 80, scale: 0.92, rotation: -2 }, 0.6, "power3.out");
  hl.forEach((h, k) => fromTo(`#${id}-h${k}`, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, h[4]));
  fromTo(`#${id}`, { scale: 1 }, { scale: 1.05, duration: r3(t1 - t0 - 0.8), ease: "none", immediateRender: false }, t0 + 0.6);
  leave(`#${id}`, t1 - 0.3); sfx(t0, "whoosh", 0.2);
}
function quote({ t0, t1, q, who, role }) {
  const id = nid("quote");
  clipDiv(id, "quote", t0, t1, `${icon("quote", 70, PINK, 2)}<div class="q">${q}</div><div class="who">${icon("mic", 34, TEAL)}<span><b>${who}</b> · ${role}</span></div>`, "", 18);
  enter(`#${id}`, t0, { y: 60, scale: 0.94 }, 0.55, "power3.out"); leave(`#${id}`, t1 - 0.3); sfx(t0, "whoosh", 0.18);
}
/** Lower third. */
function lowerThird(t0, t1, text) { const id = nid("lt"); clipDiv(id, "lt", t0, t1, `<span class="dt"></span>${text}`, "", 30); enter(`#${id}`, t0, { x: -40 }, 0.45, "power3.out"); leave(`#${id}`, t1 - 0.3); }
/** Words of the transcript from a phrase, timed as spoken. */
function spoken(fromPhrase, n, from = 0, mark = {}) {
  const i = find(fromPhrase, from); const out = []; let j = i;
  while (out.length < n && j < words.length) { if (kept(j) && norm(words[j].text)) { const t = words[j].text.replace(/^"|"$/g, ""); out.push({ text: t, t: T(j), cls: mark[norm(t)] ?? "" }); } j++; }
  return out;
}

// ═══════════════════════════ INTRO — logo slam + hype montage ══════════════
{
  foot("logo", 0, 1.55, { kb: "punch", fade: 0 });
  sfx(0.02, "whoosh", 0.35);
  const HY = ["el_chase", "neon_street", "jetski", "el_heli", "night_street", "el_race", "jl_car", "bridge_aerial", "el_neon", "beach_crowd", "el_airboat", "el_sunset"];
  const step = (I - 1.55) / HY.length;
  HY.forEach((s, k) => { const t0 = 1.55 + k * step; foot(s, t0, t0 + step + (k + 1 < HY.length ? 0.04 : 0), { kb: k % 2 ? "punch" : "whip", fade: 0, hold: true }); if (k % 3 === 0) flash(t0); });
  kinetic({ x: 0, y: 380, w: 1920, size: 170, align: "center", t1: 3.45, parts: [{ text: "13 YEARS", t: 1.62, cls: "hl" }] });
  kinetic({ x: 0, y: 380, w: 1920, size: 170, align: "center", t1: 5.4, parts: [{ text: "OF HYPE", t: 3.5 }] });
  kinetic({ x: 0, y: 380, w: 1920, size: 170, align: "center", t1: I - 0.05, parts: [{ text: "IT'S", t: 5.45, cls: "t" }, { text: "HERE", t: 5.75, cls: "hl" }] });
  flash(I - 0.06); sfx(I - 0.1, "whoosh", 0.3);
  noCaps.push([0, I]);
}

// ═══════════════════════════ SCENE 1 — HOOK ═══════════════════════════════
{
  // "after all these years of waiting… fascinating" — the city
  const tAnd = at("and honestly"), tTech = at("the technology behind this game");
  montage([{ shot: "sunset_hwy", t: tAnd }, { shot: "night_aerial", t: tTech - 0.6 }], tAnd, at("but wait") - 0.1);
  kinetic({ x: 120, y: 760, w: 1200, size: 110, t1: at("but wait") - 0.1, parts: [{ text: "13", t: at("years"), cls: "hl" }, { text: "YEARS", t: at("years") + 0.15, cls: "hl" }, { text: "OF HYPE", t: at("waiting") }] });
  // twist — ZERO? beside him, then the real headline tilting in
  kinetic({ x: 1180, y: 120, w: 660, size: 170, align: "right", t1: at("yeah you heard"), parts: [{ text: "GENERATIVE AI", t: at("generative ai"), cls: "sm" }, { text: "ZERO?", t: at("generative ai") + 0.3, cls: "hl" }] });
  foot("night_aerial", at("yeah you heard"), at("no chatgpt") - 0.05, { kb: "in", dim: true });
  source({ t0: at("yeah you heard"), t1: at("no chatgpt") - 0.05, img: "gamesradar.png", by: "GamesRadar+ · Take-Two CEO Strauss Zelnick · Feb 2026", hl: [[0, 175, 1300, 330, at("you heard that right")]] });
  // "no ChatGPT generating an entire city… no single prompt" — 3D: a prompt beam grows a city that glitches apart
  const p0 = at("no chatgpt"), p1 = at("so then how") - 0.05;
  s3d("prompt", p0 - 0.1, p1, { single: at("no single") });
  hd(p0, p1, "No single prompt builds a city", "TAKE-TWO SAYS", 70);
  sfx(at("no single") + 0.3, "pop", 0.18);
  // open loops — literal footage with live tracking
  const t5 = at("so then how"), t5e = at("well that's where") - 0.05;
  const L5 = montage([{ shot: "el_listen", t: t5 }, { shot: "el_police", t: at("police can react") }, { shot: "beach_crowd", t: at("thousands of characters") }], t5, t5e);
  hudOn(L5[0], "aware", { flip: at("notice you following") - L5[0].t0 });
  hudOn(L5[1], "track", { label: "POLICE", lockText: " · REACTING", radar: true });
  hudOn(L5[2], "track", { label: "NPC", lock: false, max: 7 });
  kinetic({ x: 120, y: 760, w: 1600, size: 96, t1: t5e, parts: [{ text: "NPCs?", t: at("people can notice"), cls: "t" }, { text: "POLICE?", t: at("police can react"), cls: "hl" }, { text: "THOUSANDS?", t: at("thousands of characters") }] });
  // roadmap — six 3D monoliths, the last one locked
  const t6 = at("six technologies behind"), t6e = at("okay before we get") - 0.1;
  s3d("roadmap", t6 - 0.4, t6e, { k0: t6, k1: t6 + 0.25, k2: t6 + 0.5, k3: t6 + 0.75, k4: t6 + 1.0, last: at("the last one") });
  hd(t6 - 0.2, t6e, "6 technologies behind GTA 6", "TODAY", 60);
  sfx(at("the last one"), "pop", 0.18);
}

// ═══════════════════════════ SCENE 2 — WHAT KIND OF AI ═════════════════════
{
  const t0 = at("whenever we hear"), t1 = at("games have been using") - 0.05;
  s3d("aipanels", t0 - 0.2, t1, { chatgpt: at("chatgpt", find("whenever")), claude: at("claude", find("whenever")), video: at("videos", find("whenever")) });
  hd(t0, t1, "What we think “AI” means", "TODAY", 60);
  kinetic({ x: 1120, y: 120, w: 720, size: 120, align: "right", t1: at("for example") - 0.05, parts: [{ text: "GAME AI:", t: at("games have been"), cls: "sm" }, { text: "DECADES", t: at("decades"), cls: "hl" }] });
  // literal: playing → steal a car → a police officer notices → police chase
  const f0 = at("for example"), g1 = at("now somebody has") - 0.05;
  const F = montage([{ shot: "el_drive2", t: f0 }, { shot: "el_steal", t: at("you steal a car") }, { shot: "el_police", t: at("a police officer") }, { shot: "el_chase", t: at("police vehicles start") }, { shot: "el_heli", t: at("start chasing") + 0.7 }], f0, g1);
  hudOn(F[2], "track", { label: "POLICE", lockText: " · NOTICED YOU" });
  hudOn(F[3], "track", { label: "POLICE", lockText: " · IN PURSUIT", radar: true });
  hudOn(F[4], "track", { label: "UNIT", lockText: " · IN PURSUIT", radar: true });
  {
    const id = nid("flow"); const y = 150;
    clipDiv(id, "", f0 + 0.3, g1, ["CRIME", "WITNESS", "RESPONSE"].map((l, k) => `<div class="alab${k === 1 ? " t" : ""}" id="${id}-${k}" style="left:${200 + k * 560}px;top:${y}px"><div class="v">${l}</div></div>`).join(""), "position:absolute;inset:0;z-index:21", 21);
    [at("you steal a car"), at("a police officer"), at("police vehicles start")].forEach((t, k) => { enter(`#${id}-${k}`, t, { y: -30, scale: 0.8 }, 0.4); sfx(t, "pop", 0.13); });
    leave(`#${id} .alab`, g1 - 0.3);
  }
  // "somebody has to decide how police behave" — 3D: the police car's decision tree
  const d0 = at("now somebody has"), d1 = at("so let's start") - 0.05;
  s3d("brain", d0 - 0.2, d1, { rules: at("programmed rules"), decisions: at("decision-making"), sim: at("simulations") });
  hd(d0, at("and gta 6 takes") - 0.05, "Traditional game AI", "HOW THE POLICE DECIDE", 60);
  kinetic({ x: 0, y: 860, w: 1920, size: 72, align: "center", t1: d1, parts: [{ text: "GTA 6 TAKES IT", t: at("and gta 6 takes") }, { text: "MUCH FURTHER", t: at("much further"), cls: "hl" }] });
}

// ═══════════════════════════ SCENE 3 — TECH 1: NPC BEHAVIOUR ═══════════════
{
  chapter3d(1, "NPCs that notice you", at("let's start with technology") - 0.1);
  // walking → two people talking → you stop nearby
  const w0 = at("okay imagine this"), w1 = at("so you stop nearby") - 0.05;
  const W = montage([{ shot: "el_walk", t: w0 }, { shot: "el_talk", t: at("you notice two people") }], w0, w1);
  hudOn(W[0], "track", { label: "YOU", lockText: "", max: 1 });
  hudOn(W[1], "space", {});
  // 3D: you walk up and stop… they notice you eavesdropping
  const n0 = at("so you stop nearby"), n1 = at("bro imagine") - 0.05;
  s3d("notice", n0, n1, { notice: at("might actually notice") });
  hd(n0, n1, "They notice you", "NPC AWARENESS", 60);
  // "Rockstar has discussed… being followed or personal space"
  const q0 = at("one of the interesting details"), q1 = at("now why does this matter") - 0.05;
  const Q = montage([{ shot: "el_listen", t: q0 }, { shot: "el_talk", t: at("being followed") }], q0, q1);
  hudOn(Q[0], "aware", { flip: at("respond to situations") - Q[0].t0 });
  hudOn(Q[1], "space", {});
  lowerThird(q0 + 0.2, q1, "Rob Nelson, Rockstar Games · interview with Best Buy");
  // "most background characters barely acknowledge you… when they respond… believable"
  const m0 = at("because normally"), m1 = at("and if you think that's") - 0.05;
  const M = foot("el_neon", m0, m1, { kb: "in" });
  hudOn(M, "aware", { flip: at("respond to your actions") - m0, max: 7 });
  kinetic({ x: 1160, y: 140, w: 680, size: 92, align: "right", t1: at("okay picture this") - 0.1, parts: spoken("how police system works", 4, find("and if you think"), { police: "hl" }) });
}

// ═══════════════════════════ SCENE 4 — TECH 2: CRIMINAL PROFILE ════════════
{
  chapter3d(2, "The police remember", at("okay picture this") - 0.1);
  const c0 = at("you are driving around", find("okay picture this")), cF = at("the police see your car"), c1 = at("now in a typical game") - 0.05;
  const C = montage([{ shot: "el_drive2", t: c0 }, { shot: "el_crime", t: at("you commit a crime") }], c0, cF);
  hudOn(C[0], "track", { label: "YOU", lockText: " · DRIVING", max: 2, radar: true });
  hudOn(C[1], "scan", { scanAt: 0.1, boxes: [{ x: 560, y: 120, w: 520, h: 900, label: "CRIME DETECTED", t: 0.3 }] });
  // "your car… your clothes… your face" — freeze + police scanner
  const S = foot("jl_stand", cF, at("and somehow you manage") - 0.05, { freeze: cF + 0.05, kb: "none" });
  hudOn(S, "scan", { scanAt: 0.05, boxes: [{ x: 1330, y: 560, w: 470, h: 430, label: "CAR", sub: "plate logged", t: at("your car") - cF }, { x: 250, y: 390, w: 380, h: 360, label: "CLOTHES", sub: "outfit recorded", t: at("your clothes") - cF, col: TEAL }, { x: 330, y: 95, w: 230, h: 250, label: "FACE", sub: "partial match", t: at("your face") - cF }] });
  foot("el_chase", at("and somehow you manage") - 0.05, c1, { kb: "in" });
  // wanted level disappears → Criminal Profile database (3D)
  const p0 = at("now in a typical game"), pP = at("criminal profile"), p1 = at("i mean suddenly escaping") - 0.05;
  const Hh = foot("el_heli", p0, pP - 0.3, { kb: "in" });
  hudOn(Hh, "track", { label: "UNIT", lockText: " · SEARCHING", radar: true });
  kinetic({ x: 0, y: 760, w: 1920, size: 84, align: "center", t1: pP - 0.3, parts: [{ text: "WANTED LEVEL GONE", t: at("wanted level disappears") }, { text: "= SAFE?", t: at("back to normal"), cls: "hl" }] });
  s3d("profile", pP - 0.3, p1, { profile: pP, r0: at("details associated"), r1: at("details associated") + 0.6, r2: at("affect how the world"), r3: at("an outfit connected") });
  sfx(pP, "whoosh", 0.22);
  // not just speed — what people saw
  kinetic({ x: 1100, y: 130, w: 740, size: 88, align: "right", t1: at("it's also about what") - 0.05, parts: [{ text: "NOT JUST", t: at("isn't just about") }, { text: "SPEED", t: at("driving faster"), cls: "hl" }] });
  const s0 = at("it's also about what"), s1 = at("but okay npc behavior") - 0.05;
  s3d("witness", s0 - 0.1, s1, { saw: at("what people saw") });
}

// ═══════════════════════════ SCENE 5 — TECH 3: RETARGETING ═════════════════
{
  const b0 = at("but okay npc behavior"), bC = at("that's technology number three") - 0.1;
  const B = montage([{ shot: "beach_gym", t: b0 }, { shot: "beach_crowd", t: at("how do you make thousands") }], b0, bC);
  hudOn(B[1], "track", { label: "NPC", lock: false, max: 8 });
  chapter3d(3, "Realistic human movement", bC);
  // "one animation of a character sitting inside a car"
  const a0 = at("now here is something most"), a1 = at("but what happens when") - 0.05;
  const A1 = montage([{ shot: "el_incar", t: a0 }, { shot: "hands_wheel", t: at("imagine you have created") }], a0, a1, { freezeLast: at("sitting inside a car") });
  hudOn(A1[1], "scan", { scanAt: at("sitting inside a car") - A1[1].t0, boxes: [{ x: 420, y: 520, w: 1280, h: 540, label: "ONE SITTING ANIMATION", t: at("sitting inside a car") - A1[1].t0 + 0.2, col: TEAL }] });
  // tall vs short in 3D car seats → mismatch → retargeted
  const r0 = at("but what happens when"), r1 = at("and when you multiply") - 0.05;
  s3d("retarget", r0 - 0.2, r1, { tall: at("much taller"), short: at("different body proportion"), miss: at("their hands might not"), fix: at("runtime animation retargeting") });
  hd(at("so the rockstar developed"), r1, "Runtime animation retargeting", "ROCKSTAR", 50);
  // × a whole city
  const m0 = at("and when you multiply"), m1 = at("but here is where it gets") - 0.05;
  const Mm = montage([{ shot: "beach_crowd", t: m0 }, { shot: "bar_crowd", t: at("you start to understand") }], m0, m1);
  Mm.forEach((f) => hudOn(f, "retargeted", {}));
  kinetic({ x: 0, y: 760, w: 1920, size: 96, align: "center", t1: m1, parts: [{ text: "× A WHOLE CITY", t: at("huge population"), cls: "hl" }] });
  // individuals → interactions
  const i0 = at("but here is where it gets"), i1 = at("and that is where technology four") - 0.1;
  s3d("network", i0 - 0.2, i1, { link: at("building systems around") });
  hd(i0, i1, "Not just individuals", "ROCKSTAR IS SIMULATING", 60);
}

// ═══════════════════════════ SCENE 6 — TECH 4: RELATIONSHIPS ═══════════════
{
  chapter3d(4, "Characters with relationships", at("and that is where technology four") - 0.1);
  const j0 = at("now you already know gta 6"), j1 = at("think about that for") - 0.05;
  const Jc = foot("el_couple", j0, at("rockstar has discussed ai") - 0.05, { kb: "in" });
  hudOn(Jc, "names", { names: ["LUCIA", "JASON"] });
  const Ja = foot("el_arrive", at("rockstar has discussed ai") - 0.05, j1, { kb: "in" });
  hudOn(Ja, "names", { names: ["LUCIA", "JASON"], link: "COUPLE AI · IN SYNC", linkAt: at("as a couple") - Ja.t0 });
  lowerThird(at("rockstar has discussed ai"), j1, "Rob Nelson, Rockstar Games · interview with Best Buy");
  // follow because the mission says so vs move together
  const f0 = at("think about that for"), f1 = at("for example imagine two") - 0.05;
  s3d("follow", f0 - 0.2, f1, { together: at("move together") });
  hd(f0, f1, "Following vs. being together", "", 60);
  // arriving together: wait, reposition, react
  const a0 = at("for example imagine two"), a1 = at("and here is the important") - 0.05;
  s3d("arrive", a0 - 0.2, a1, { wait: at("one might need to wait"), repo: at("reposition"), react: at("or react") });
  hd(a0, a1, "Arriving together", "", 60);
  kinetic({ x: 1100, y: 140, w: 740, size: 92, align: "right", t1: at("now let's move from") - 0.05, parts: [{ text: "NOT", t: at("this doesn't mean jason") }, { text: "ChatGPT", t: at("powered by chatgpt"), cls: "x" }, { text: "DESIGNED SYSTEMS", t: at("carefully designed"), cls: "hl" }] });
}

// ═══════════════════════════ SCENE 7 — TECH 5: RAGE ════════════════════════
{
  const w0 = at("now let's move from"), wC = at("because technology number five") + 2.6;
  foot("night_aerial", w0, wC, { kb: "out" });
  chapter3d(5, "The world itself", wC);
  const b0 = at("okay have you seen"), b1 = at("but how does all") - 0.05;
  montage([{ shot: "neon_street", t: b0 }, { shot: "el_neon", t: at("the neon lights") }, { shot: "sunset_hwy", t: at("the weather", find("the neon lights")) }, { shot: "el_sunset", t: at("some of these scenes") }], b0, b1);
  const e0 = at("but how does all"), e1 = at("now imagine you are driving") - 0.05;
  s3d("rage", e0 - 0.2, e1, { l0: at("graphics", find("but how does all")), l1: at("physics", find("but how does all")), l2: at("animation", find("but how does all")), l3: at("systems running") });
  // night drive, rain, reflections
  const n0 = at("now imagine you are driving"), nF = at("streetlights reflect"), n1 = at("and here is something people") - 0.05;
  const N = foot("el_night", n0, n1, { freeze: nF, kb: "in" });
  hudOn(N, "rain", { boxes: [{ x: 1170, y: 60, w: 240, h: 240, label: "LIGHT", t: nF - n0, col: TEAL }, { x: 770, y: 680, w: 380, h: 340, label: "SURFACE", t: at("across the surface") - n0 }] });
  kinetic({ x: 1100, y: 120, w: 760, size: 84, align: "right", t1: n1, parts: [{ text: "WEATHER", t: at("atmosphere changes"), cls: "t" }, { text: "RAY TRACING", t: at("rate-traced"), cls: "hl" }] });
  kinetic({ x: 1100, y: 130, w: 740, size: 104, align: "right", t1: at("a lot of this comes") - 0.05, parts: [{ text: "GRAPHICS", t: at("realistic graphics") }, { text: "≠ AI", t: at("automatically mean ai"), cls: "hl" }] });
  const g0 = at("a lot of this comes"), g1 = at("and now technology number six") - 0.05;
  s3d("makereal", g0 - 0.2, g1, { code: at("graphics programming"), physics: at("physics", find("a lot of this")), art: at("artistic work"), believe: at("you get a world") });
}

// ═══════════════════════════ SCENE 8 — TECH 6: FUTURE ══════════════════════
{
  chapter3d(6, "What comes next?", at("and now technology number six"));
  {
    const f0 = Math.max(at("and now technology number six") + 2.2, at("this one is not just")), f1 = at("okay here is the really") - 0.05;
    foot("el_sunset", f0, f1, { kb: "in", dim: true });
    kinetic({ x: 0, y: 360, w: 1920, size: 110, align: "center", t1: f1, parts: [{ text: "WHAT COMES NEXT", t: at("what comes next") }, { text: "MACHINE LEARNING", t: at("machine learning", find("what comes next")), cls: "hl" }, { text: "+ THE FUTURE OF GAMING", t: at("future of gaming"), cls: "t" }] });
  }
  const h0 = at("okay here is the really"), h1 = at("imagine walking into a shop") - 0.05;
  foot("bridge_aerial", h0, h1, { kb: "in", dim: true });
  kinetic({ x: 0, y: 380, w: 1920, size: 100, align: "center", t1: h1, parts: [{ text: "HANDCRAFTED", t: at("hand-crafted") }, { text: "+", t: at("combine those systems") }, { text: "GENERATIVE AI?", t: at("generative ai", find("combine those")), cls: "hl" }] });
  // shop: the real store, with a future dialogue UI over it
  const c0 = at("imagine walking into a shop"), c1 = at("or imagine side missions") - 0.05;
  foot("el_shop", c0, c1, { kb: "in", dim: true });
  {
    const id = nid("chat");
    clipDiv(id, "chat", c0 + 0.3, c1, `<div class="bar"><span class="dot"></span>Shopkeeper · future game idea</div><div class="body"><div class="opts" id="${id}-o"><span>1. Buy</span><span>2. Sell</span><span>3. Leave</span></div><div class="msg me" id="${id}-m0">Got anything for a long drive tonight?</div><div class="msg npc" id="${id}-m1">For you? Sunglasses. Same as last time.</div><div class="msg mem" id="${id}-m2">MEMORY · Remembers: yesterday you said you were heading to the Keys</div><div class="msg npc" id="${id}-m3">Didn't you say you were heading to the Keys?</div></div>`, "left:auto;right:90px;top:120px;width:1000px;height:840px", 18);
    enter(`#${id}`, c0 + 0.3, { x: 80, rotation: 3 }, 0.55, "power3.out");
    fromTo(`#${id}-o`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at("three fixed dialogue"));
    to(`#${id}-o`, { opacity: 0.25, duration: 0.3 }, at("talk to the shopkeeper"));
    [at("talk to the shopkeeper"), at("talk to the shopkeeper") + 1.2, at("remembering a conversation"), at("maybe they react")].forEach((t, k) => { enter(`#${id}-m${k}`, t, { y: 30, scale: 0.9 }, 0.4); sfx(t, "tick", 0.16); });
    leave(`#${id}`, c1 - 0.3);
  }
  // side missions → the road forks
  const b0 = at("or imagine side missions"), bD = at("adapt to your decisions"), b1 = at("now to be clear") - 0.05;
  foot("el_race", b0, bD - 0.1, { kb: "in" });
  s3d("branch", bD - 0.15, b1, { decide: bD + 0.2 });
  hd(bD, b1, "Missions that adapt", "", 60);
  lowerThird(at("now to be clear"), at("rockstar has machine learning") - 0.05, "Future idea · not a confirmed GTA 6 feature");
  kinetic({ x: 1080, y: 130, w: 780, size: 84, align: "right", t1: at("and there is a reason") - 0.05, parts: [{ text: "ML TEAMS ✓", t: at("machine learning research"), cls: "t" }, { text: "EVERY NPC", t: at("doesn't mean every character") }, { text: "A CHATBOT ✗", t: at("language model"), cls: "x" }] });
  const s0 = at("if every character could"), s1 = at("and this brings us") - 0.05;
  s3d("story", s0 - 0.2, s1, { control: at("control the story"), consistent: at("stays consistent"), fun: at("fun", find("stays consistent")), safe: at("and safe") });
  hd(s0, s1, "Who controls the story?", "THE HARD PART", 50);
}

// ═══════════════════════════ SCENE 9 — TAKEAWAY + CTA ══════════════════════
{
  const a0 = at("and this brings us"), a1 = at("see here is what i find") - 0.05;
  const id = nid("ann");
  clipDiv(id, "ann", a0, a1, `<div class="k">AND THIS BRINGS US TO</div><div class="v grad">THE BIGGEST LESSON</div>`, "", 46);
  fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a0);
  fromTo(`#${id} .k`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, a0 + 0.1);
  fromTo(`#${id} .v`, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)" }, at("biggest lesson"));
  leave(`#${id}`, a1 - 0.3); sfx(a0, "whoosh", 0.25);
  covered.push([a0, a1]); noCaps.push([a0, a1]);
  const m0 = at("it's that human creativity"), m1 = at("and honestly that's") - 0.05;
  s3d("merge", m0 - 0.2, m1, { human: at("human creativity"), tech: at("sophisticated technology"), alive: at("feel alive") });
  kinetic({ x: 1100, y: 140, w: 760, size: 84, align: "right", t1: at("don't just ask") - 0.05, parts: [{ text: "APPS", t: at("building an app"), cls: "t" }, { text: "CONTENT", t: at("creating content") }, { text: "AI", t: at("learning ai"), cls: "hl" }] });
  kinetic({ x: 1080, y: 140, w: 780, size: 76, align: "right", t1: at("now i have a question") - 0.05, parts: [{ text: "DON'T ASK", t: at("don't just ask"), cls: "sm" }, { text: "“How can I add AI?”", t: at("how can i add"), cls: "x" }, { text: "ASK", t: at("ask what experience"), cls: "sm" }, { text: "“What can I make better?”", t: at("genuinely better"), cls: "hl" }] });
  const q0 = at("imagine gta 7"), q1 = at("would that make") - 0.05;
  foot("bridge_aerial", q0, q1, { kb: "in", dim: true });
  kinetic({ x: 0, y: 380, w: 1920, size: 110, align: "center", t1: q1, parts: [{ text: "GTA 7:", t: at("gta 7"), cls: "t" }, { text: "NPCs THAT", t: at("had npcs") }, { text: "REMEMBER YOU?", t: at("remember you", find("imagine gta 7")), cls: "hl" }] });
  const e0 = q1, e1 = at("and if you enjoy") - 0.05;
  const bid = nid("cta");
  clipDiv(bid, "", e0, e1, `<div class="btn2 ex" id="${bid}-a" style="left:1240px;top:180px">${icon("party-popper", 64, "#0d0818")}EXCITING</div><div class="btn2 cr" id="${bid}-b" style="left:1240px;top:380px">${icon("ghost", 64, "#fff")}CREEPY</div><div class="lt" id="${bid}-c" style="left:1240px;top:600px;bottom:auto">${icon("message-circle", 34, TEAL)}Comment below</div>`, "position:absolute;inset:0;z-index:18", 18);
  enter(`#${bid}-a`, at("more exciting"), { x: 60, scale: 0.8 }, 0.45); sfx(at("more exciting"), "pop", 0.18);
  enter(`#${bid}-b`, at("little creepy"), { x: 60, scale: 0.8 }, 0.45); sfx(at("little creepy"), "pop", 0.18);
  enter(`#${bid}-c`, at("comment exciting"), { y: 30 }, 0.4);
  to(`#${bid}-a, #${bid}-b`, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, at("tell me why"));
  leave(`#${bid} .btn2, #${bid} .lt`, e1 - 0.3);
  kinetic({ x: 1100, y: 160, w: 760, size: 84, align: "right", t1: AEND, parts: [{ text: "SUBSCRIBE", t: at("subscribe to ai"), cls: "hl" }, { text: "AI with Kalyan", t: at("ai with kalyan"), cls: "sm" }] });
}

// ═══════════════════════════ END SCREEN (no voice) ═════════════════════════
{
  const o = AEND, oe = TOTAL;
  s3d("endscreen", o - 0.35, oe, {}, { pip: false });
  set("#cam", { opacity: 0 }, o + 0.05);
  const id = nid("end");
  clipDiv(id, "endsc", o, oe, `<div class="chn" id="${id}-n">AI WITH KALYAN</div><div class="row"><div class="sbtn" id="${id}-s"><span class="a">${icon("circle-play", 64, "#fff")}Subscribe</span><span class="b">${icon("check", 56)}Subscribed</span></div><div class="bell" id="${id}-b">${icon("bell-ring", 120, "#ffd166", 2)}</div></div><div class="cmt" id="${id}-c">${icon("message-circle", 54, "#19e3d3")}<span>Comment: <b>EXCITING</b> or <b class="p">CREEPY</b>?</span></div><div class="nxt" id="${id}-x">See you in the next video</div>`, "", 46);
  enter(`#${id}-n`, o + 0.3, { y: -30 }, 0.5, "power3.out");
  enter(`#${id}-s`, o + 0.8, { scale: 0.4 }, 0.5);
  to(`#${id}-s`, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, o + 2.0); set(`#${id}-s`, { className: "sbtn on" }, o + 2.1);
  enter(`#${id}-b`, o + 2.4, { scale: 0.3, rotation: -30 }, 0.45);
  to(`#${id}-b`, { rotation: 18, duration: 0.09, yoyo: true, repeat: 9, ease: "sine.inOut", transformOrigin: "50% 10%" }, o + 2.8);
  enter(`#${id}-c`, o + 3.8, { y: 50 }, 0.5);
  enter(`#${id}-x`, o + 5.6, { y: 30 }, 0.6, "power3.out");
  sfx(o + 2.05, "pop", 0.25); sfx(o + 2.8, "tick", 0.22); sfx(o + 3.8, "pop", 0.2);
  noCaps.push([o, oe + 1]); covered.push([o, oe]);
}

// ── chapter tags: top-right on the wall, between chapters (hidden under full-screen cards) ──
{
  const ends = CHAPS.map((c, k) => (k + 1 < CHAPS.length ? CHAPS[k + 1].t0 - 2.2 : at("and this brings us")));
  CHAPS.forEach((c, k) => {
    const id = nid("ctag");
    clipDiv(id, "ctag", c.t0, ends[k], `<span class="n">0${c.n}</span><span class="t">${c.title.toUpperCase()}</span><span class="bar"><i style="width:${r3((c.n / 6) * 100)}%"></i></span>`, "left:auto;right:40px", 45);
    enter(`#${id}`, c.t0, { y: -20 }, 0.4, "power3.out"); leave(`#${id}`, ends[k] - 0.3);
  });
}

// ── look-away covers: relevant city footage + what he's saying ───────────────
let coverCount = 0;
{
  const coveredAt = (a, b) => covered.some(([c0, c1]) => c0 <= a + 0.05 && c1 >= b - 0.05);
  const pool = ["night_aerial", "neon_street", "bridge_aerial", "street_cars", "beach_crowd", "highway_day"];
  for (const wnd of gaze.windows ?? []) {
    let a = I + wnd.start - 0.2, b = I + wnd.end + 0.2;
    if (a > AEND || coveredAt(a, b)) continue;
    for (const [c0, c1] of covered) { if (c0 <= a && c1 > a) a = c1; if (c0 < b && c1 >= b) b = c0; }
    if (b - a < 0.4) continue;
    const t0 = r3(a), t1 = r3(Math.max(b, a + 1.4));
    foot(pool[coverCount % pool.length], t0, t1, { kb: "in", dim: true, track: 9 });
    coverCount++;
  }
}

// ── caption spelling: align transcript words to the script; 1-for-1 swaps take the script's spelling ──
function spellFromScript(cw) {
  const sw = SCRIPT.split("\n").filter((l) => l.trim() && !/^(#|\[|Source:|Target)/.test(l.trim())).join(" ").replace(/\[[^\]]*\]/g, "").split(/\s+/).filter(Boolean);
  const a = cw.map((w) => norm(w.text)), b = sw.map(norm);
  // simple DP alignment (Levenshtein on tokens) to find 1:1 substitutions
  const n = a.length, m = b.length, W = m + 1; const D = new Uint32Array((n + 1) * W);
  for (let i = 0; i <= n; i++) D[i * W] = i; for (let j = 0; j <= m; j++) D[j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i * W + j] = Math.min(D[(i - 1) * W + j] + 1, D[i * W + j - 1] + 1, D[(i - 1) * W + j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  let i = n, j = m, fixed = [];
  while (i > 0 && j > 0) {
    const d = D[i * W + j];
    if (d === D[(i - 1) * W + j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      if (a[i - 1] !== b[j - 1] && a[i - 1].length > 2 && b[j - 1].length > 2) { const s0 = a[i - 1], s1 = b[j - 1]; const lev = (x, y) => { const d = Array.from({ length: y.length + 1 }, (_, k) => k); for (let p = 1; p <= x.length; p++) { let prev = d[0]; d[0] = p; for (let q = 1; q <= y.length; q++) { const tmp = d[q]; d[q] = Math.min(d[q] + 1, d[q - 1] + 1, prev + (x[p - 1] === y[q - 1] ? 0 : 1)); prev = tmp; } } return d[y.length]; }; const plural = s0 + "s" === s1 || s1 + "s" === s0; const prefix = s0.startsWith(s1) || s1.startsWith(s0); if (lev(s0, s1) <= 2 && !plural && !prefix && s0 !== "scene") { const punct = (cw[i - 1].text.match(/[.,!?]+$/) || [""])[0]; fixed.push([cw[i - 1].text, sw[j - 1]]); cw[i - 1].text = sw[j - 1].replace(/[.,!?…:;"“”]+$/g, "") + punct; } }
      i--; j--;
    } else if (d === D[(i - 1) * W + j] + 1) i--; else j--;
  }
  SPELL.push(...fixed);
}
const SPELL = [];
// ── captions (≤5 words), hidden under kinetic text / cards ──────────────────
{
  const capWords = words.map((w, i) => i).filter((i) => kept(i) && norm(words[i].text)).map((i) => ({ t: T(i), e: TE(i), text: words[i].text.replace(/^"|"$/g, "") }));
  spellFromScript(capWords);
  const off = (t) => noCaps.some(([a, b]) => t >= a && t <= b);
  const groups = []; let g = [];
  for (const w of capWords) {
    if (off(w.t)) { if (g.length) groups.push(g); g = []; continue; }
    const prev = g.at(-1);
    if (g.length && (g.length >= 5 || w.t - prev.e > 0.6 || (/[.?!]$/.test(prev.text) && g.length >= 2) || (/,$/.test(prev.text) && g.length >= 3))) { groups.push(g); g = []; }
    g.push(w);
  }
  if (g.length) groups.push(g);
  groups.forEach((gr, k) => {
    const t0 = gr[0].t - 0.05, t1 = Math.min(Math.max(gr.at(-1).e + 0.3, t0 + 1.1), (groups[k + 1]?.[0].t ?? Infinity) - 0.06);
    if (t1 - t0 < 0.15) return;
    const id = nid("cap");
    clipDiv(id, "cap", t0, t1, `<div class="in" style="opacity:1">${gr.map((w, j) => `<span class="cw" id="${id}-${j}">${esc(w.text)}</span>`).join(" ")}</div>`, "", 44);
    gr.forEach((w, j) => set(`#${id}-${j}`, { opacity: 1 }, w.t));
  });
}

// ── music + SFX ─────────────────────────────────────────────────────────────
{
  const BED = 0.09;
  const lane = (pts) => J({ version: 1, lanes: [{ target: "volume", points: pts.map(([t, v]) => ({ t: r3(Math.max(0, t)), v })) }] });
  const audio = (aid, src, start, dur, ms, pts, track) => html.push(`<audio id="${aid}" class="clip" src="media/${src}" data-start="${r3(start)}" data-duration="${r3(dur)}" data-media-start="${r3(ms)}" data-volume="1" data-track-index="${track}" data-automation='${lane(pts)}'></audio>`);
  const env = (d, fi, fo, level = BED, dips = []) => { const p = [[0, fi ? 0 : level], [fi || 0.01, level]]; for (const [a, b] of dips) p.push([a - 0.3, level], [a, level * 0.35], [b, level * 0.35], [b + 0.4, level]); p.push([d - fo, level], [d, 0]); return p.sort((x, y) => x[0] - y[0]); };
  const c1 = at("okay before we get"), c3 = at("and now technology number six"), c4 = at("and this brings us");
  const tR = at("rockstar says"), tL = at("biggest lesson");
  audio("m0", "m0.mp3", 0, I + 0.6, 0, [[0, 0.5], [I - 0.4, 0.5], [I + 0.6, 0]], 29);
  audio("m1", "m1.mp3", I - 0.2, c1 - I + 1.7, 0, env(c1 - I + 1.7, 0.6, 1.5, 0.055, [[tR - I - 0.1, tR - I + 1.4]]), 30);
  audio("m2", "m2.mp3", c1 - 0.2, Math.min(330, c3 - c1 + 1.7), 0, env(Math.min(330, c3 - c1 + 1.7), 1.5, 1.5), 31);
  audio("m3", "m3.mp3", c3, Math.min(69, c4 - c3 + 1.2), 0, env(Math.min(69, c4 - c3 + 1.2), 1.0, 1.2), 32);
  const m4d = Math.min(86, TOTAL - (c4 - 0.2));
  audio("m4", "m4.mp3", c4 - 0.2, m4d, 0, [[0, 0], [0.8, BED], [tL - c4 - 0.4, BED], [tL - c4, BED * 0.35], [tL - c4 + 0.4, BED], [AEND - c4 - 0.2, BED], [AEND - c4 + 0.5, 0.32], [m4d - 2.0, 0.32], [m4d, 0]], 33);
  const DUR = { whoosh: 1.0, pop: 0.5, tick: 0.5 };
  const keepS = [];
  for (const s of sfxList.sort((a, b) => a[0] - b[0])) { const gap = keepS.length ? s[0] - keepS.at(-1)[0] : 99; if (gap >= (s[1] === "whoosh" ? 1.5 : 6.5)) keepS.push(s); }
  keepS.forEach(([t, name, vol], k) => html.push(`<audio id="sfx-${k}" class="clip" src="media/sfx-${name}.mp3" data-start="${t}" data-duration="${DUR[name]}" data-volume="${vol}" data-track-index="${40 + (k % 4)}"></audio>`));
  sfxList.length = 0; sfxList.push(...keepS);
}

// ── camera: full ↔ PiP ──────────────────────────────────────────────────────
const CAM = { full: { x: 0, y: 0, scale: 1, borderRadius: 0 }, pip: { x: 48, y: 770, scale: 480 / 1920, borderRadius: 120 } };
modes.sort((a, b) => a[0] - b[0]);
for (let k = modes.length - 2; k >= 0; k--) if (modes[k][1] === "full" && modes[k + 1][1] === "pip" && modes[k + 1][0] - modes[k][0] < 1.2) modes.splice(k, 2);
let cur = "full";
for (const [t, m] of modes) { if (m === cur) continue; if (m === "pip") set("#cam", { zIndex: 40 }, t); to("#cam", { ...CAM[m], duration: 0.55, ease: "power3.inOut" }, t); if (m === "full") set("#cam", { zIndex: 1 }, t + 0.55); cur = m; }

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
<div id="stage" data-composition-id="gta6" data-start="0" data-duration="${TOTAL}" data-fps="30" data-width="1920" data-height="1080">
  <div id="cam"><video id="cam-v" class="clip cam-v" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${I}" data-duration="${RC_LEN}" data-media-start="0" data-track-index="1"></video></div>
  <canvas id="gl" width="1920" height="1080"></canvas>
  <canvas id="hud2d" width="1920" height="1080"></canvas>
${html.map((h) => "  " + h).join("\n")}
  <script>window.__S3D = ${J(S3D)}; window.__HUD = ${J(HUDS)};</script>
  <script src="vendor/gsap.min.js"></script>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true });
    ${emitJs().join("\n    ")}
    window.__timelines = window.__timelines || {};
    window.__timelines["gta6"] = tl;
  })();
  </script>
  <script type="importmap">{ "imports": { "three": "./vendor/three/three.module.min.js", "three/addons/": "./vendor/three/addons/" } }</script>
  <script type="module" src="scenes3d.js"></script>
  <script type="module" src="hud.js"></script>
</div>
</body>
</html>
`;
writeFileSync(join(HERE, "index.html"), page);
writeFileSync(join(HERE, "meta.json"), J({ total: TOTAL, intro: I, aroll: RC_LEN, aend: AEND, chapters: CHAPS, covers: coverCount, sfx: sfxList.length, s3d: S3D.length, hud: HUDS.length, spelling: SPELL, covered }, null, 1));
console.log(`index.html: ${TOTAL.toFixed(2)} s · ${html.length} nodes · ${js.length} tweens · ${sfxList.length} SFX · ${coverCount} look-away covers`);
