#!/usr/bin/env node
// GTA6 v1 — builds index.html (HyperFrames) from the ElevenLabs Scribe transcript, the A-roll v3 EDL and the
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
const EDL = rd("GTA6/edits/aroll-v3.edl.json").segments;
const SHOTS = JSON.parse(readFileSync(join(HERE, "shots.json"), "utf-8"));
const gaze = existsSync(join(ROOT, "GTA6/edits/gaze-v3.json")) ? rd("GTA6/edits/gaze-v3.json") : { windows: [] };
const OUTRO = rd("GTA6/transcripts/outro_v1/words.json");
const OUTRO_DUR = 31.61;

const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const J = JSON.stringify;

// ── source → cut time ──────────────────────────────────────────────────────
const pieces = []; { let o = 0; for (const e of EDL) { pieces.push({ src: e.src_in, dur: e.src_out - e.src_in, out: o }); o += e.src_out - e.src_in; } }
const RC_LEN = r3(pieces.reduce((s, p) => s + p.dur, 0));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const kept = (i) => pieces.some((p) => words[i].start >= p.src - 0.02 && words[i].start <= p.src + p.dur);
const rc = (src) => { for (const p of pieces) if (src >= p.src - 0.02 && src <= p.src + p.dur + 0.001) return r3(p.out + Math.max(0, Math.min(src - p.src, p.dur))); const n = pieces.find((p) => p.src > src); return n ? n.out : RC_LEN; };
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

const OUTRO_AT = r3(RC_LEN + 0.6);
const TOTAL = r3(OUTRO_AT + OUTRO_DUR + 2.2);

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
/** Official footage, full-screen, muted. Slows (≥0.5×) to fill the slot, then holds its last frame. */
function foot(shot, t0, t1, { kb = "in", freeze = null, dim = false, track = 8 } = {}) {
  const s = SHOTS[shot]; if (!s) throw new Error(`no shot ${shot}`);
  const sd = s.t1 - s.t0, slot = t1 - t0;
  const rate = Math.max(0.5, Math.min(1, sd / slot));
  const play = freeze ? Math.min(freeze - t0, sd / rate) : Math.min(slot, sd / rate);
  const id = nid("foot");
  const still = freeze ? "m" : "z";
  const vid = `<video id="${id}-v" class="clip" src="media/shots/${shot}.mp4" muted playsinline data-start="${r3(t0)}" data-duration="${r3(play)}" data-media-start="0"${rate < 1 ? ` data-playback-rate="${r3(rate)}"` : ""} data-track-index="${track}"></video>`;
  const img = play < slot - 0.02 ? `<img id="${id}-i" class="clip" src="media/shots/${shot}-${freeze ? "z" : still}.jpg" data-start="${r3(t0 + play)}" data-duration="${r3(slot - play)}" data-track-index="${track}" />` : "";
  html.push(`<div id="${id}" class="foot" style="z-index:8;opacity:0"><div class="kb" id="${id}-k">${vid}${img}</div><div class="shade"></div><div class="dim"></div><div class="vig"></div><div class="credit">GTA VI · © Rockstar Games</div></div>`);
  set(`#${id}`, { opacity: 1 }, t0); set(`#${id}`, { opacity: 0 }, t1);
  const K = { in: [{ scale: 1.0 }, { scale: 1.08 }], out: [{ scale: 1.1 }, { scale: 1.0 }], left: [{ scale: 1.08, x: 40 }, { scale: 1.08, x: -40 }], right: [{ scale: 1.08, x: -40 }, { scale: 1.08, x: 40 }], none: [{ scale: 1 }, { scale: 1 }] }[kb];
  fromTo(`#${id}-k`, K[0], { ...K[1], duration: r3(freeze ? freeze - t0 : slot), ease: "none" }, t0);
  if (freeze) { fromTo(`#${id} .dim`, { opacity: 0 }, { opacity: 1, duration: 0.25 }, freeze); fromTo(`#${id} .vig`, { opacity: 0 }, { opacity: 1, duration: 0.25 }, freeze); }
  if (dim) fromTo(`#${id} .dim`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0);
  covered.push([t0, t1]);
  return id;
}
/** Several shots back to back across [t0,t1], cut points at given times (or evenly). */
function montage(list, t0, t1, opts = {}) { const cuts = list.map((x, k) => (typeof x === "object" ? x.t : null) ?? t0 + ((t1 - t0) * k) / list.length); list.forEach((x, k) => foot(typeof x === "object" ? x.shot : x, Math.max(t0, cuts[k]), k + 1 < list.length ? cuts[k + 1] : t1, { kb: ["in", "left", "out", "right"][k % 4], ...opts })); }
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

// ═══════════════════════════ SCENE 1 — HOOK ═══════════════════════════════
{
  // 1. "Guys… GTA 6 is finally here!" — logo reveal, then him
  const tGta = at("GTA 6 is finally");
  foot("logo", 0, tGta + 1.6, { kb: "in" });
  sfx(0.05, "whoosh", 0.35);
  // 2. "after all these years of waiting… fascinating" — city shots, kinetic
  const tAnd = at("and honestly");
  const tTech = at("the technology behind this game");
  montage([{ shot: "sunset_hwy", t: tAnd }, { shot: "night_aerial", t: tTech - 0.6 }], tAnd, at("but wait") - 0.1);
  kinetic({ x: 120, y: 760, w: 1200, size: 110, t1: at("but wait") - 0.1, parts: [{ text: "13", t: at("years"), cls: "hl" }, { text: "YEARS", t: at("years") + 0.15, cls: "hl" }, { text: "OF HYPE", t: at("waiting") }] });
  // 3. twist — kinetic ZERO? beside him, then the source card
  const tR = at("rockstar says");
  kinetic({ x: 1180, y: 120, w: 660, size: 170, align: "right", t1: at("yeah you heard"), parts: [{ text: "GENERATIVE AI", t: at("generative ai"), cls: "sm" }, { text: "ZERO?", t: at("generative ai") + 0.3, cls: "hl" }] });
  scene(at("yeah you heard"), at("so then how") - 0.05);
  source({ t0: at("yeah you heard"), t1: at("no chatgpt") - 0.05, img: "gamesradar.png", by: "GamesRadar+ · Take-Two CEO Strauss Zelnick · Feb 2026", hl: [[0, 175, 1300, 330, at("you heard that right")]] });
  // 4. "no ChatGPT generating an entire city… no single prompt" — prompt box struck through
  {
    const t0 = at("no chatgpt"), t1 = at("so then how") - 0.1;
    const id = nid("gen");
    clipDiv(id, "win", t0, t1, `<div class="bar"><i></i><i></i><i></i>AI chat</div><div class="bd"><div class="prompt-box">Generate an entire open-world city, with every character…</div><div class="strikebar" id="${id}-s" style="left:40px;top:160px;width:1180px"></div></div>`, "left:560px;top:290px;width:1260px", 16);
    enter(`#${id}`, t0, { y: 60, scale: 0.94 }, 0.5, "power3.out");
    fromTo(`#${id}-s`, { scaleX: 0, rotation: -3 }, { scaleX: 1, rotation: -3, duration: 0.35, ease: "power3.out" }, at("no single"));
    leave(`#${id}`, t1 - 0.3);
    hd(t0, t1, "Not how GTA 6 was built", "TAKE-TWO SAYS", 120);
    sfx(at("no single") + 0.1, "pop", 0.18);
  }
  // 5. open loops: notice you / police / thousands move
  const t5 = at("so then how"), t5e = at("well that's where") - 0.05;
  montage([{ shot: "two_men", t: t5 }, { shot: "ocean_drive", t: at("people can notice") }, { shot: "police_view", t: at("police can react") }, { shot: "beach_crowd", t: at("thousands of characters") }], t5, t5e);
  kinetic({ x: 120, y: 760, w: 1600, size: 96, t1: t5e, parts: [{ text: "NPCs?", t: at("people can notice"), cls: "t" }, { text: "POLICE?", t: at("police can react"), cls: "hl" }, { text: "THOUSANDS?", t: at("thousands of characters") }] });
  // 6. roadmap of six (slot 6 locked)
  const t6 = at("six technologies behind"), t6e = at("okay before we get") - 0.1;
  scene(t6 - 0.3, t6e);
  hd(t6 - 0.2, t6e, "6 technologies behind GTA 6", "TODAY", 120);
  const ROAD = [["users", "NPC behaviour"], ["shield-alert", "Criminal profile"], ["person-standing", "Animation retargeting"], ["heart-handshake", "Character relationships"], ["sun", "RAGE engine & weather"]];
  const rid = nid("road");
  clipDiv(rid, "road", t6 - 0.2, t6e, ROAD.map(([ic, l], k) => `<div class="s" id="${rid}-${k}"><div class="n">0${k + 1}</div>${icon(ic, 96, "#fff", 1.6)}<b>${l}</b></div>`).join("") + `<div class="s lock" id="${rid}-5"><div class="n">06</div><div class="q">?</div><b>The last one…</b></div>`, "", 15);
  [0, 1, 2, 3, 4].forEach((k) => fromTo(`#${rid}-${k}`, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }, t6 + k * 0.22));
  fromTo(`#${rid}-5`, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, at("the last one"));
  to(`#${rid}-5`, { scale: 1.06, duration: 0.25, yoyo: true, repeat: 3 }, at("changes how you"));
  leave(`#${rid}`, t6e - 0.3); sfx(at("the last one"), "pop", 0.18);
}

// ═══════════════════════════ SCENE 2 — WHAT KIND OF AI ═════════════════════
{
  // 7. "whenever we hear AI… ChatGPT, Claude, AI-generated videos"
  const t0 = at("whenever we hear"), t1 = at("games have been using") - 0.05;
  scene(t0 - 0.2, t1);
  hd(t0, t1, "What we think “AI” means", "TODAY", 110);
  tile({ x: 340, y: 330, ic: "message-square", label: "ChatGPT", sub: "chatbot", t: at("chatgpt", find("whenever")), t1 });
  tile({ x: 780, y: 330, ic: "sparkles", label: "Claude", sub: "assistant", t: at("claude", find("whenever")), t1, color: ORANGE });
  tile({ x: 1220, y: 330, ic: "clapperboard", label: "AI video", sub: "generated clips", t: at("videos", find("whenever")), t1, color: PINK });
  // 8. "games have been using AI for decades… steal a car… police chase"
  const g0 = at("games have been using"), g1 = at("now somebody has") - 0.05;
  kinetic({ x: 1120, y: 120, w: 720, size: 120, align: "right", t1: at("for example") - 0.05, parts: [{ text: "GAME AI:", t: at("games have been"), cls: "sm" }, { text: "DECADES", t: at("decades"), cls: "hl" }] });
  const f0 = at("for example");
  montage([{ shot: "jason_drive", t: f0 }, { shot: "police_view", t: at("a police officer") }, { shot: "el_chase", t: at("police vehicles start") }], f0, g1);
  {
    const id = nid("flow"); const y = 150;
    clipDiv(id, "", f0 + 0.3, g1, ["CRIME", "WITNESS", "RESPONSE"].map((l, k) => `<div class="alab${k === 1 ? " t" : ""}" id="${id}-${k}" style="left:${200 + k * 560}px;top:${y}px"><div class="v">${l}</div></div>`).join(""), "position:absolute;inset:0;z-index:21", 21);
    [at("you steal a car"), at("a police officer"), at("police vehicles start")].forEach((t, k) => { enter(`#${id}-${k}`, t, { y: -30, scale: 0.8 }, 0.4); sfx(t, "pop", 0.13); });
    leave(`#${id} .alab`, g1 - 0.3);
  }
  // 9. "somebody has to decide… traditional game AI: rules, decisions, simulations… much further"
  const d0 = at("now somebody has"), d1 = at("so let's start") - 0.05;
  scene(d0 - 0.2, d1);
  hd(d0, d1, "Traditional game AI", "", 110);
  tile({ x: 340, y: 340, ic: "list-checks", label: "Rules", sub: "programmed", t: at("programmed rules"), t1: d1 });
  tile({ x: 780, y: 340, ic: "git-branch", label: "Decisions", sub: "what to do next", t: at("decision-making"), t1: d1, color: ORANGE });
  tile({ x: 1220, y: 340, ic: "globe", label: "Simulation", sub: "a living world", t: at("simulations"), t1: d1, color: TEAL });
  lowerThird(at("and gta 6 takes"), d1, "GTA 6 takes this much further");
}

// ═══════════════════════════ SCENE 3 — TECH 1: NPC BEHAVIOUR ═══════════════
{
  chapter(1, "NPCs that notice you", "eye", at("let's start with technology") - 0.1);
  // 11. walk, two people talk, you stop to listen — crowd + proximity radius
  const w0 = at("okay imagine this"), w1 = at("but instead of standing") - 0.05;
  montage([{ shot: "ocean_drive", t: w0 }, { shot: "two_men", t: at("you notice two people") }, { shot: "bar_crowd", t: at("so you stop nearby") }], w0, w1);
  ring({ x: 960, y: 560, r: 300, teal: true, t: at("just to listen"), t1: w1, label: "TOO CLOSE?", key: "YOU", lx: 1300, ly: 160 });
  // 12. they notice you're eavesdropping — freeze + ring on the NPC, then his laugh
  const n0 = at("but instead of standing"), nF = at("might actually notice"), n1 = at("bro imagine") - 0.05;
  foot("npc_turn", n0, n1, { freeze: nF, kb: "in" });
  ring({ x: 1060, y: 330, r: 150, t: nF, t1: n1, label: "NOTICES YOU", key: "NPC REACTION", lx: 1280, ly: 120 });
  // "Bro… caught being nosy" stays on his face (humour beat)
  // 13. Rockstar has discussed — interview citation
  const q0 = at("one of the interesting details"), q1 = at("now why does this matter") - 0.05;
  scene(q0 - 0.2, q1);
  quote({ t0: q0, t1: q1, q: "NPCs respond to being followed, or to their personal space being interrupted.", who: "Rob Nelson, Rockstar Games", role: "interview with Best Buy (paraphrased)" });
  // 14. why it matters — ignoring → reacting
  const m0 = at("because normally"), m1 = at("and if you think that's") - 0.05;
  scene(m0 - 0.2, m1);
  hd(m0, m1, "Why it matters", "", 110);
  tile({ x: 420, y: 340, ic: "user-x", label: "Ignores you", sub: "most games", t: at("barely acknowledge"), t1: m1, cls: "" });
  arrow({ x: 830, y: 520, w: 260, t: at("but when characters respond"), t1: m1 });
  tile({ x: 1140, y: 340, ic: "user-check", label: "Reacts", sub: "feels believable", t: at("respond to your actions"), t1: m1, color: TEAL, cls: "on" });
  // 15. police tease on his face — kinetic
  kinetic({ x: 1160, y: 140, w: 680, size: 92, align: "right", t1: at("okay picture this") - 0.1, parts: spoken("how police system works", 4, find("and if you think"), { police: "hl" }) });
}

// ═══════════════════════════ SCENE 4 — TECH 2: CRIMINAL PROFILE ════════════
{
  chapter(2, "The police remember", "shield-alert", at("okay picture this") - 0.1);
  // 17. car… clothes… face — freeze on Jason & Lucia by the car
  const c0 = at("you are driving around", find("okay picture this")), cF = at("the police see your car"), c1 = at("now in a typical game") - 0.05;
  montage([{ shot: "el_drive", t: c0 }, { shot: "el_heli", t: at("you commit a crime") }], c0, cF);
  foot("jl_stand", cF, c1, { freeze: cF + 0.05, kb: "none" });
  ring({ x: 1560, y: 780, r: 230, t: at("your car"), t1: c1, label: "CAR", lx: 1180, ly: 860 });
  ring({ x: 440, y: 560, r: 200, teal: true, t: at("your clothes"), t1: c1, label: "CLOTHES", lx: 120, ly: 820 });
  ring({ x: 440, y: 215, r: 140, t: at("your face"), t1: c1, label: "FACE", lx: 620, ly: 120 });
  // 18. wanted level gone → Criminal Profile card
  const p0 = at("now in a typical game"), p1 = at("i mean suddenly escaping") - 0.05;
  scene(p0 - 0.2, p1);
  {
    const id = nid("prof");
    const rows = [["car", "Vehicle", "SEEN"], ["shirt", "Outfit", "FLAGGED"], ["scan-face", "Face", "PARTIAL"], ["map-pin", "Last seen", "VICE CITY"]];
    clipDiv(id, "prof", at("criminal profile") - 0.2, p1, `<div class="top">${icon("file-search", 54, "#fff")}CRIMINAL PROFILE</div><div class="rows">${rows.map(([ic, l, st], k) => `<div class="row${k === 1 ? " flag" : ""}" id="${id}-r${k}">${icon(ic, 46, k === 1 ? PINK : TEAL)}${l}<span class="st">${st}</span></div>`).join("")}</div>`, "", 18);
    enter(`#${id}`, at("criminal profile") - 0.2, { y: 60, scale: 0.94 }, 0.55, "power3.out");
    const rt = [at("details associated"), at("details associated") + 0.6, at("affect how the world"), at("an outfit connected")];
    rows.forEach((_, k) => { fromTo(`#${id}-r${k}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, rt[k]); });
    sfx(rt[3], "pop", 0.16);
    leave(`#${id}`, p1 - 0.3);
    kinetic({ x: 0, y: 150, w: 1920, size: 70, align: "center", t1: at("but gta 6 introduces") - 0.05, parts: [{ text: "WANTED LEVEL GONE", t: at("wanted level disappears") }, { text: "= SAFE?", t: at("back to normal"), cls: "hl" }] });
    sfx(at("criminal profile"), "whoosh", 0.2);
  }
  // 19. not just speed — what people saw
  const s0 = at("i mean suddenly escaping"), s1 = at("but okay npc behavior") - 0.05;
  kinetic({ x: 1100, y: 130, w: 740, size: 88, align: "right", t1: at("it's also about what") - 0.05, parts: [{ text: "NOT JUST", t: at("isn't just about") }, { text: "SPEED", t: at("driving faster"), cls: "hl" }] });
  scene(at("it's also about what"), s1);
  tile({ x: 420, y: 330, ic: "eye", label: "What they saw", t: at("what people saw"), t1: s1, color: PINK });
  tile({ x: 1140, y: 330, ic: "database", label: "What still matters", t: at("what information"), t1: s1, color: TEAL });
}

// ═══════════════════════════ SCENE 5 — TECH 3: RETARGETING ═════════════════
{
  const b0 = at("but okay npc behavior"), bC = at("that's technology number three") - 0.1;
  montage([{ shot: "beach_gym", t: b0 }, { shot: "beach_crowd", t: at("how do you make thousands") }], b0, bC);
  chapter(3, "Realistic human movement", "person-standing", bC);
  // 21. one animation of sitting in a car
  const a0 = at("now here is something most"), aF = at("imagine you have created"), a1 = at("but what happens when") - 0.05;
  foot("hands_wheel", a0, a1, { freeze: aF + 1.2, kb: "in" });
  ring({ x: 1000, y: 690, r: 330, teal: true, t: at("sitting inside a car"), t1: a1, label: "ONE SITTING ANIMATION", key: "THE PROBLEM", lx: 120, ly: 120 });
  // 22–23. tall vs short figures (2D rig), then snap to fit
  const r0 = at("but what happens when"), r1 = at("and when you multiply") - 0.05;
  scene(r0 - 0.2, r1);
  hd(r0, at("so the rockstar developed") - 0.05, "One animation · different bodies", "", 100);
  hd(at("so the rockstar developed"), r1, "Runtime animation retargeting", "ROCKSTAR", 90);
  const fig = (id, x, h, bad) => {
    const legs = bad ? `<path d="M0 ${h * 0.55} L${h * 0.3} ${h * 0.58} L${h * 0.32} ${h * 0.88}" />` : `<path d="M0 ${h * 0.55} L${h * 0.33} ${h * 0.57} L${h * 0.36} ${h * 0.9}" />`;
    return `<g id="${id}" transform="translate(${x},${880 - h})"><circle cx="0" cy="${h * 0.1}" r="${h * 0.075}" fill="#fff"/><g stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"><path d="M0 ${h * 0.18} L0 ${h * 0.55}"/>${legs}<path id="${id}-arm" d="M0 ${h * 0.25} L${h * 0.22} ${h * 0.36} L${h * 0.33} ${h * 0.33}"/></g><path d="M-${h * 0.18} ${h * 0.58} L-${h * 0.12} ${h * 0.9} M-${h * 0.18} ${h * 0.58} L${h * 0.05} ${h * 0.58}" stroke="${PINK}" stroke-width="12" fill="none"/></g>`;
  };
  const sid = nid("rig");
  clipDiv(sid, "", r0, r1, `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;inset:0">${fig(`${sid}-a`, 760, 560, false)}${fig(`${sid}-b`, 1340, 380, false)}<circle id="${sid}-wa" cx="${760 + 560 * 0.42}" cy="${880 - 560 + 560 * 0.33}" r="34" stroke="${ORANGE}" stroke-width="9" fill="none"/><circle id="${sid}-wb" cx="${1340 + 380 * 0.5}" cy="${880 - 380 + 380 * 0.3}" r="34" stroke="${ORANGE}" stroke-width="9" fill="none"/></svg><div class="alab" id="${sid}-la" style="left:640px;top:200px"><div class="v">TALL</div></div><div class="alab t" id="${sid}-lb" style="left:1260px;top:380px"><div class="v">SHORT</div></div><div class="alab" id="${sid}-x" style="left:1460px;top:300px;border-color:#ff4d5e"><div class="k" style="color:#ff4d5e">● MISMATCH</div><div class="v">Hands miss · legs off</div></div><div class="alab t" id="${sid}-ok" style="left:1460px;top:300px"><div class="k">● RETARGETED</div><div class="v">Fits each body ✓</div></div>`, "position:absolute;inset:0;z-index:16", 16);
  fromTo(`#${sid}-a`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, at("much taller"));
  enter(`#${sid}-la`, at("much taller") + 0.1, { y: 20 }, 0.4);
  fromTo(`#${sid}-b`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, at("different body proportion"));
  enter(`#${sid}-lb`, at("different body proportion") + 0.1, { y: 20 }, 0.4);
  // mismatch: wheel circles shift away from the hands (red) on "hands might not reach"
  to(`#${sid}-wa`, { attr: { cx: 760 + 560 * 0.55 }, stroke: "#ff4d5e", duration: 0.4 }, at("their hands might not"));
  to(`#${sid}-wb`, { attr: { cx: 1340 + 380 * 0.62 }, stroke: "#ff4d5e", duration: 0.4 }, at("their hands might not"));
  enter(`#${sid}-x`, at("looks weird"), { scale: 0.7 }, 0.4); sfx(at("looks weird"), "pop", 0.16);
  // retarget: circles snap back onto the hands (teal) on "retargeting"
  leave(`#${sid}-x`, at("runtime animation retargeting") - 0.2);
  to(`#${sid}-wa`, { attr: { cx: 760 + 560 * 0.33 + 20 }, stroke: TEAL, duration: 0.5, ease: "back.out(2)" }, at("runtime animation retargeting"));
  to(`#${sid}-wb`, { attr: { cx: 1340 + 380 * 0.33 + 14 }, stroke: TEAL, duration: 0.5, ease: "back.out(2)" }, at("runtime animation retargeting"));
  enter(`#${sid}-ok`, at("runtime animation retargeting") + 0.3, { scale: 0.7 }, 0.4); sfx(at("runtime animation retargeting") + 0.3, "pop", 0.16);
  // 23b. multiply across a city
  const m0 = at("and when you multiply"), m1 = at("but here is where it gets") - 0.05;
  montage([{ shot: "beach_crowd", t: m0 }, { shot: "bar_crowd", t: at("you start to understand") }], m0, m1);
  kinetic({ x: 0, y: 760, w: 1920, size: 96, align: "center", t1: m1, parts: [{ text: "× A WHOLE CITY", t: at("huge population"), cls: "hl" }] });
}

// 23c. "not just simulating individual characters… how characters interact"
{
  const i0 = at("but here is where it gets"), i1 = at("and that is where technology four") - 0.1;
  scene(i0 - 0.2, i1);
  hd(i0, i1, "Not just individuals", "ROCKSTAR IS SIMULATING", 110);
  tile({ x: 420, y: 340, ic: "user", label: "Individuals", sub: "one character at a time", t: at("simulating individual"), t1: i1 });
  arrow({ x: 830, y: 520, w: 260, t: at("building systems around"), t1: i1 });
  tile({ x: 1140, y: 340, ic: "users", label: "Interactions", sub: "characters with each other", t: at("interact with each other"), t1: i1, color: TEAL, cls: "on" });
}

// ═══════════════════════════ SCENE 6 — TECH 4: RELATIONSHIPS ═══════════════
{
  chapter(4, "Characters with relationships", "heart-handshake", at("and that is where technology four") - 0.1);
  // 25. Jason & Lucia
  const j0 = at("now you already know gta 6"), j1 = at("think about that for") - 0.05;
  foot("jl_car", j0, at("but here is the interesting part"), { kb: "in" });
  kinetic({ x: 120, y: 740, w: 1600, size: 110, t1: at("but here is the interesting part"), parts: [{ text: "JASON", t: at("jason"), cls: "t" }, { text: "+", t: at("and lucia") }, { text: "LUCIA", t: at("lucia"), cls: "hl" }] });
  scene(at("but here is the interesting part"), j1);
  quote({ t0: at("but here is the interesting part"), t1: j1, q: "AI systems built to support Jason and Lucia's interactions as a couple.", who: "Rob Nelson, Rockstar Games", role: "interview with Best Buy (paraphrased)" });
  // 26. follow-because-mission vs move together
  const f0 = at("think about that for"), f1 = at("for example imagine two") - 0.05;
  scene(f0 - 0.2, f1);
  hd(f0, f1, "Following vs. being together", "", 100);
  tile({ x: 380, y: 330, ic: "footprints", label: "Just follows", sub: "“the mission says so”", t: at("might just follow"), t1: f1 });
  arrow({ x: 790, y: 510, w: 300, t: at("believable relationship"), t1: f1 });
  tile({ x: 1150, y: 330, ic: "users", label: "Moves together", sub: "reacts · joins in", t: at("move together"), t1: f1, color: TEAL, cls: "on" });
  // 27. arriving together: wait / reposition / react (top-down map)
  const a0 = at("for example imagine two"), a1 = at("and here is the important") - 0.05;
  scene(a0 - 0.2, a1);
  {
    const id = nid("map");
    clipDiv(id, "map", a0, a1, `<div class="road1"></div><div class="road2"></div><div class="bld" style="left:880px;top:80px;width:240px;height:240px"></div><div class="bld" style="left:80px;top:560px;width:300px;height:200px"></div><div class="dotp p" id="${id}-p" style="left:80px;top:410px">J</div><div class="dotp c" id="${id}-c" style="left:0px;top:410px">L</div><div class="mlab" id="${id}-l0" style="left:720px;top:560px">WAIT</div><div class="mlab" id="${id}-l1" style="left:840px;top:330px">REPOSITION</div><div class="mlab" id="${id}-l2" style="left:860px;top:640px">REACT</div>`, "", 16);
    enter(`#${id}`, a0, { y: 50, scale: 0.95 }, 0.5, "power3.out");
    to(`#${id}-p`, { x: 640, duration: 1.4, ease: "power2.inOut" }, a0 + 0.3);
    to(`#${id}-c`, { x: 560, duration: 1.6, ease: "power2.inOut" }, a0 + 0.5);
    const tw = at("one might need to wait"), tr = at("reposition"), tre = at("or react");
    enter(`#${id}-l0`, tw, { scale: 0.6 }, 0.35); sfx(tw, "pop", 0.13);
    to(`#${id}-c`, { x: 700, y: -110, duration: 0.6, ease: "power2.inOut" }, tr); enter(`#${id}-l1`, tr, { scale: 0.6 }, 0.35);
    to(`#${id}-c`, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 3 }, tre); enter(`#${id}-l2`, tre, { scale: 0.6 }, 0.35);
    leave(`#${id}`, a1 - 0.3);
    hd(a0, a1, "Arriving together", "", 40);
  }
  // 28. not ChatGPT — designed systems
  kinetic({ x: 1100, y: 140, w: 740, size: 92, align: "right", t1: at("now let's move from") - 0.05, parts: [{ text: "NOT", t: at("this doesn't mean jason") }, { text: "ChatGPT", t: at("powered by chatgpt"), cls: "x" }, { text: "DESIGNED SYSTEMS", t: at("carefully designed"), cls: "hl" }] });
}

// ═══════════════════════════ SCENE 7 — TECH 5: RAGE ════════════════════════
{
  const w0 = at("now let's move from"), wC = at("because technology number five") + 2.6;
  foot("night_aerial", w0, wC, { kb: "out" });
  chapter(5, "The world itself", "cloud-sun-rain", wC);
  // 30. beauty shots: reflections, neon, weather
  const b0 = at("okay have you seen"), b1 = at("but how does all") - 0.05;
  montage([{ shot: "neon_street", t: b0 }, { shot: "night_street", t: at("the neon lights") }, { shot: "sunset_hwy", t: at("the weather", find("the neon lights")) }, { shot: "el_sunset", t: at("some of these scenes") }], b0, b1);
  // 31. RAGE engine stack
  const e0 = at("but how does all"), e1 = at("now imagine you are driving") - 0.05;
  scene(e0 - 0.2, e1);
  hd(e0, e1, "RAGE", "ROCKSTAR ADVANCED GAME ENGINE", 70);
  {
    const first = at("graphics", find("but how does all"));
    const hid = nid("hero");
    clipDiv(hid, "hero", e0 + 0.2, first, `${icon("cog", 220, "#ff3d9a", 1.4)}<b class="grad">RAGE</b>`, "", 15);
    enter(`#${hid}`, e0 + 0.2, { scale: 0.7 }, 0.55); js.push(`tl.to("#${hid} svg",{rotation:120,duration:${r3(Math.max(0.5, first - e0))},ease:"none"},${r3(e0)});`); leave(`#${hid}`, first - 0.3);
    const id = nid("stk");
    const L = [["image", "Graphics", "graphics"], ["atom", "Physics", "physics"], ["person-standing", "Animation", "animation"], ["cpu", "World systems", "systems running"]];
    clipDiv(id, "stack", e0, e1, L.map(([ic, l]) => `<div class="ly">${icon(ic, 64, "#fff")}${l}</div>`).join(""), "", 16);
    L.forEach(([, , p], k) => { const t = at(p, find("but how does all")); fromTo(`#${id} .ly:nth-child(${k + 1})`, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.8)" }, t); sfx(t, "pop", 0.12); });
    leave(`#${id}`, e1 - 0.3);
  }
  // 32. night drive, rain, reflections — freeze + labels
  const n0 = at("now imagine you are driving"), nF = at("streetlights reflect"), n1 = at("and here is something people") - 0.05;
  foot("el_night", n0, n1, { freeze: nF, kb: "in" });
  ring({ x: 1290, y: 175, r: 120, teal: true, t: at("streetlights reflect"), t1: n1, label: "LIGHT", lx: 900, ly: 300 });
  ring({ x: 960, y: 860, r: 190, t: at("across the surface"), t1: n1, label: "SURFACE", lx: 1200, ly: 820 });
  kinetic({ x: 1100, y: 120, w: 760, size: 84, align: "right", t1: n1, parts: [{ text: "WEATHER", t: at("atmosphere changes"), cls: "t" }, { text: "RAY TRACING", t: at("rate-traced"), cls: "hl" }] });
  // 33. graphics ≠ AI
  kinetic({ x: 1100, y: 130, w: 740, size: 104, align: "right", t1: at("a lot of this comes") - 0.05, parts: [{ text: "GRAPHICS", t: at("realistic graphics") }, { text: "≠ AI", t: at("automatically mean ai"), cls: "hl" }] });
  const g0 = at("a lot of this comes"), g1 = at("and now technology number six") - 0.05;
  scene(g0 - 0.2, g1);
  hd(g0, g1, "What makes it look real", "", 110);
  tile({ x: 340, y: 330, ic: "code", label: "Graphics code", t: at("graphics programming"), t1: g1 });
  tile({ x: 780, y: 330, ic: "atom", label: "Physics", t: at("physics", find("a lot of this")), t1: g1, color: ORANGE });
  tile({ x: 1220, y: 330, ic: "brush", label: "Artists", t: at("artistic work"), t1: g1, color: PINK });
  kinetic({ x: 0, y: 860, w: 1920, size: 72, align: "center", t1: g1, parts: [{ text: "= A WORLD THAT FEELS", t: at("you get a world") }, { text: "BELIEVABLE", t: at("feels believable"), cls: "hl" }] });
}

// ═══════════════════════════ SCENE 8 — TECH 6: FUTURE ══════════════════════
{
  chapter(6, "What comes next?", "rocket", at("and now technology number six"));
  {
    const f0 = Math.max(at("and now technology number six") + 2.0, at("this one is not just")), f1 = at("okay here is the really") - 0.05;
    foot("el_sunset", f0, f1, { kb: "in", dim: true });
    kinetic({ x: 0, y: 360, w: 1920, size: 110, align: "center", t1: f1, parts: [{ text: "WHAT COMES NEXT", t: at("what comes next") }, { text: "MACHINE LEARNING", t: at("machine learning", find("what comes next")), cls: "hl" }, { text: "+ THE FUTURE OF GAMING", t: at("future of gaming"), cls: "t" }] });
  }
  // 35. handcrafted world → generative AI?
  const h0 = at("okay here is the really"), h1 = at("imagine walking into a shop") - 0.05;
  foot("bridge_aerial", h0, h1, { kb: "in", dim: true });
  kinetic({ x: 0, y: 380, w: 1920, size: 100, align: "center", t1: h1, parts: [{ text: "HANDCRAFTED", t: at("handcrafted") }, { text: "+", t: at("combine those systems") }, { text: "GENERATIVE AI?", t: at("generative ai", find("combine those")), cls: "hl" }] });
  // 36. shop chat + memory
  const c0 = at("imagine walking into a shop"), c1 = at("or imagine side missions") - 0.05;
  scene(c0 - 0.2, c1);
  {
    const id = nid("chat");
    clipDiv(id, "chat", c0, c1, `<div class="bar"><span class="dot"></span>Shopkeeper · future game idea</div><div class="body"><div class="opts" id="${id}-o"><span>1. Buy</span><span>2. Sell</span><span>3. Leave</span></div><div class="msg me" id="${id}-m0">Got anything for a long drive tonight?</div><div class="msg npc" id="${id}-m1">For you? Sunglasses. Same as last time.</div><div class="msg mem" id="${id}-m2">🧠 Remembers: you said yesterday you were heading to the Keys</div><div class="msg npc" id="${id}-m3">Didn't you say you were heading to the Keys?</div></div>`, "", 18);
    enter(`#${id}`, c0, { y: 60, scale: 0.95 }, 0.5, "power3.out");
    fromTo(`#${id}-o`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at("three fixed dialogue"));
    to(`#${id}-o`, { opacity: 0.25, duration: 0.3 }, at("talk to the shopkeeper"));
    const tt = [at("talk to the shopkeeper"), at("talk to the shopkeeper") + 1.2, at("remembering a conversation"), at("maybe they react")];
    tt.forEach((t, k) => { enter(`#${id}-m${k}`, t, { y: 30, scale: 0.9 }, 0.4); sfx(t, "tick", 0.16); });
    leave(`#${id}`, c1 - 0.3);
  }
  // 37. missions adapt — branch
  const b0 = at("or imagine side missions"), b1 = at("now to be clear") - 0.05;
  scene(b0 - 0.2, b1);
  {
    const id = nid("br");
    clipDiv(id, "br", b0, b1, `<svg class="lines" width="1920" height="1080"><path id="${id}-p1" d="M760 540 C 980 540, 1000 330, 1200 330" stroke="${TEAL}" stroke-width="8" fill="none"/><path id="${id}-p2" d="M760 540 C 980 540, 1000 750, 1200 750" stroke="${PINK}" stroke-width="8" fill="none"/></svg><div class="node" id="${id}-n0" style="left:420px;top:490px">Your choice</div><div class="node a" id="${id}-n1" style="left:1220px;top:280px">Mission A</div><div class="node b" id="${id}-n2" style="left:1220px;top:700px">Mission B</div>`, "", 16);
    enter(`#${id}-n0`, b0 + 0.1, { scale: 0.7 }, 0.4);
    fromTo(`#${id}-p1, #${id}-p2`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, at("adapt to your decisions"));
    enter(`#${id}-n1`, at("adapt to your decisions") + 0.2, { x: 40 }, 0.4); enter(`#${id}-n2`, at("adapt to your decisions") + 0.4, { x: 40 }, 0.4);
    sfx(at("adapt to your decisions"), "pop", 0.14);
    leave(`#${id} .node, #${id} .lines`, b1 - 0.3);
    hd(b0, b1, "Missions that adapt", "", 110);
  }
  // 38. caveat — his own words as a lower third
  lowerThird(at("now to be clear"), at("rockstar has machine learning") - 0.05, "Future idea · not a confirmed GTA 6 feature");
  {
    const l0 = at("rockstar has machine learning"), l1 = at("and there is a reason") - 0.05;
    scene(l0 - 0.2, l1);
    tile({ x: 420, y: 330, ic: "flask-conical", label: "ML research teams", sub: "Rockstar has them", t: at("machine learning research"), t1: l1, color: TEAL, cls: "on" });
    tile({ x: 1140, y: 330, ic: "message-square-x", label: "Every NPC a chatbot", sub: "not what that means", t: at("doesn't mean every character"), t1: l1, color: PINK, cls: "off" });
  }
  // 39. control the story — consistent, fun, safe
  const s0 = at("if every character could"), s1 = at("and this brings us") - 0.05;
  scene(s0 - 0.2, s1);
  hd(s0, s1, "Who controls the story?", "THE HARD PART", 100);
  tile({ x: 340, y: 340, ic: "book-open", label: "Consistent", t: at("stays consistent"), t1: s1, color: TEAL });
  tile({ x: 780, y: 340, ic: "gamepad-2", label: "Fun", t: at("fun", find("stays consistent")), t1: s1, color: ORANGE });
  tile({ x: 1220, y: 340, ic: "shield-check", label: "Safe", t: at("and safe"), t1: s1, color: PINK });
}

// ═══════════════════════════ SCENE 9 — TAKEAWAY + CTA ══════════════════════
{
  // 40. announcement card
  const a0 = at("and this brings us"), a1 = at("see here is what i find") - 0.05;
  const id = nid("ann");
  clipDiv(id, "ann", a0, a1, `<div class="k">AND THIS BRINGS US TO</div><div class="v grad">THE BIGGEST LESSON</div>`, "", 46);
  fromTo(`#${id}`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, a0);
  fromTo(`#${id} .k`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, a0 + 0.1);
  fromTo(`#${id} .v`, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)" }, at("biggest lesson"));
  leave(`#${id}`, a1 - 0.3); sfx(a0, "whoosh", 0.25);
  covered.push([a0, a1]); noCaps.push([a0, a1]);
  // 41. merge graphic + the question
  const m0 = at("it's that human creativity"), m1 = at("and honestly that's") - 0.05;
  scene(m0 - 0.2, m1);
  tile({ x: 300, y: 330, ic: "palette", label: "Human creativity", t: at("human creativity"), t1: m1, color: PINK });
  tile({ x: 780, y: 330, ic: "cpu", label: "Technology", t: at("sophisticated technology"), t1: m1, color: TEAL });
  tile({ x: 1260, y: 330, ic: "sparkles", label: "A world that feels alive", t: at("feel alive"), t1: m1, color: ORANGE, cls: "on" });
  kinetic({ x: 1080, y: 140, w: 780, size: 76, align: "right", t1: at("now i have a question") - 0.05, parts: [{ text: "DON'T ASK", t: at("don't just ask"), cls: "sm" }, { text: "“How can I add AI?”", t: at("how can i add"), cls: "x" }, { text: "ASK", t: at("ask what experience"), cls: "sm" }, { text: "“What can I make better?”", t: at("genuinely better"), cls: "hl" }] });
  // 41b. "whether you're building an app, creating content, or learning AI"
  {
    const w0 = at("whether you are building"), w1 = at("don't just ask") - 0.05;
    scene(w0 - 0.2, w1);
    tile({ x: 340, y: 330, ic: "app-window", label: "Building an app", t: at("building an app"), t1: w1, color: TEAL });
    tile({ x: 780, y: 330, ic: "video", label: "Creating content", t: at("creating content"), t1: w1, color: ORANGE });
    tile({ x: 1220, y: 330, ic: "brain", label: "Learning AI", t: at("learning ai"), t1: w1, color: PINK });
  }
  // 41c. GTA 7 question over the city
  {
    const q0 = at("imagine gta 7"), q1 = at("would that make") - 0.05;
    foot("bridge_aerial", q0, q1, { kb: "in", dim: true });
    kinetic({ x: 0, y: 380, w: 1920, size: 110, align: "center", t1: q1, parts: [{ text: "GTA 7:", t: at("gta 7"), cls: "t" }, { text: "NPCs THAT", t: at("had npcs") }, { text: "REMEMBER YOU?", t: at("remember you", find("imagine gta 7")), cls: "hl" }] });
  }
  // 42. EXCITING or CREEPY
  const e0 = at("imagine gta 7"), e1 = at("and if you enjoy") - 0.05;
  const bid = nid("cta");
  clipDiv(bid, "", e0, e1, `<div class="btn2 ex" id="${bid}-a" style="left:1240px;top:180px">${icon("party-popper", 64, "#0d0818")}EXCITING</div><div class="btn2 cr" id="${bid}-b" style="left:1240px;top:380px">${icon("ghost", 64, "#fff")}CREEPY</div><div class="lt" id="${bid}-c" style="left:1240px;top:600px;bottom:auto">${icon("message-circle", 34, TEAL)}Comment below</div>`, "position:absolute;inset:0;z-index:18", 18);
  enter(`#${bid}-a`, at("more exciting"), { x: 60, scale: 0.8 }, 0.45); sfx(at("more exciting"), "pop", 0.18);
  enter(`#${bid}-b`, at("little creepy"), { x: 60, scale: 0.8 }, 0.45); sfx(at("little creepy"), "pop", 0.18);
  enter(`#${bid}-c`, at("comment exciting"), { y: 30 }, 0.4);
  to(`#${bid}-a, #${bid}-b`, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, at("tell me why"));
  leave(`#${bid} .btn2, #${bid} .lt`, e1 - 0.3);
  kinetic({ x: 1100, y: 160, w: 760, size: 84, align: "right", t1: RC_LEN, parts: [{ text: "SUBSCRIBE", t: at("subscribe to ai"), cls: "hl" }, { text: "AI with Kalyan", t: at("ai with kalyan"), cls: "sm" }] });
}

// ═══════════════════════════ OUTRO (voice clone) ═══════════════════════════
{
  const o = OUTRO_AT, oe = TOTAL;
  const ow = (phrase, from = 0) => { const p = toks(phrase); for (let i = from; i <= OUTRO.length - p.length; i++) if (p.every((t, k) => norm(OUTRO[i + k].text) === t)) return i; throw new Error(`outro phrase not found: ${phrase}`); };
  const ot = (phrase, from = 0) => r3(o + OUTRO[ow(phrase, from)].start);
  scene(RC_LEN - 0.35, oe, { pip: false });
  set("#cam", { opacity: 0 }, o - 0.1);
  html.push(`<audio id="outro-voice" class="clip" src="media/outro-voice.mp3" data-start="${o}" data-duration="${OUTRO_DUR}" data-volume="1" data-track-index="3"></audio>`);
  // recap
  const b1 = ot("if you enjoyed") - 0.15;
  const rid = nid("recap");
  const R = [["NPCs that notice you", "npcs that notice"], ["Police that remember", "police that remember"], ["Animation retargeting", "animation retargeting"], ["Character relationships", "character relationships"], ["RAGE engine", "the rage engine"], ["The future of AI in games", "the future of ai"]];
  clipDiv(rid, "recap", o, b1, R.map(([l], k) => `<div class="r" id="${rid}-${k}"><span class="n">0${k + 1}</span><b>${l}</b></div>`).join(""), "", 16);
  R.forEach(([, p], k) => { const t = ot(p); fromTo(`#${rid}-${k}`, { opacity: 0, y: 50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t); });
  hd(o, b1, "6 technologies behind GTA 6", "RECAP", 90);
  leave(`#${rid}`, b1 - 0.3);
  // like / subscribe / bell
  const b2 = ot("i've shared") - 0.15;
  const sub = nid("sub");
  clipDiv(sub, "subs", b1, b2, `<div class="like" id="${sub}-l">${icon("thumbs-up", 110)}<span>Like</span></div><div class="sbtn" id="${sub}-s"><span class="a">Subscribe</span><span class="b">${icon("check", 50)}Subscribed</span></div><div class="bell" id="${sub}-b">${icon("bell-ring", 130, "#ffd166", 2)}</div><div class="ch" id="${sub}-c">AI with Kalyan</div>`, "", 16);
  const tl0 = ot("like this video"), ts0 = ot("subscribe"), tb = ot("hit the bell");
  fromTo(`#${sub}-l`, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, tl0 - 0.3);
  set(`#${sub}-l`, { className: "like on" }, tl0 + 0.2);
  fromTo(`#${sub}-s`, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, ts0 - 0.3);
  set(`#${sub}-s`, { className: "sbtn on" }, ts0 + 0.5);
  fromTo(`#${sub}-c`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, ot("ai with kalyan"));
  fromTo(`#${sub}-b`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, tb);
  to(`#${sub}-b`, { rotation: 18, duration: 0.09, yoyo: true, repeat: 9, ease: "sine.inOut", transformOrigin: "50% 10%" }, tb + 0.3);
  sfx(tl0 + 0.1, "pop", 0.22); sfx(ts0 + 0.4, "pop", 0.22); sfx(tb + 0.2, "tick", 0.2);
  leave(`#${sub}`, b2 - 0.3);
  // description + pinned comment
  const b3 = ot("thanks for watching") - 0.2;
  const ds = nid("desc");
  clipDiv(ds, "desc", b2, b3, `<div class="panel" id="${ds}-p"><div class="h">${icon("align-left", 34, "#888")}Description</div><div class="row" id="${ds}-r0">${icon("newspaper", 36, PINK)}All sources</div><div class="row" id="${ds}-r1">${icon("link", 36, PINK)}Links</div><div class="row" id="${ds}-r2">${icon("film", 36, PINK)}Official GTA VI media</div></div><div class="pin" id="${ds}-pin"><div class="ph">${icon("pin", 28, "#ffd166")}Pinned by AI with Kalyan</div><div class="pt">GTA 7 NPCs that remember you: EXCITING or CREEPY? 👇</div></div>`, "", 16);
  fromTo(`#${ds}-p`, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, b2 + 0.1);
  [ot("sources"), ot("links"), ot("description")].forEach((t, k) => fromTo(`#${ds}-r${k}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, t));
  fromTo(`#${ds}-pin`, { opacity: 0, x: 140 }, { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.6)" }, ot("pinned comment") - 0.2);
  sfx(ot("pinned comment"), "whoosh", 0.2);
  leave(`#${ds}`, b3 - 0.3);
  // end card
  const ec = nid("endc");
  clipDiv(ec, "endc", b3, oe, `<div class="t1">Thanks for watching</div><div class="t2">See you in the next video</div><div class="chn">AI WITH KALYAN</div>`, "", 16);
  fromTo(`#${ec} .t1`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ot("thanks for watching"));
  fromTo(`#${ec} .t2`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ot("see you in the next"));
  fromTo(`#${ec} .chn`, { opacity: 0 }, { opacity: 1, duration: 0.5 }, ot("see you in the next") + 0.6);
  noCaps.push([b3, oe + 1]);
  covered.push([o - 0.4, oe]);
}

// ── chapter tags: top-right on the wall, between chapters (hidden under full-screen cards) ──
{
  const ends = CHAPS.map((c, k) => (k + 1 < CHAPS.length ? CHAPS[k + 1].t0 - 2.0 : at("and this brings us")));
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
    let a = wnd.start - 0.2, b = wnd.end + 0.2;
    if (a > RC_LEN || coveredAt(a, b)) continue;
    for (const [c0, c1] of covered) { if (c0 <= a && c1 > a) a = c1; if (c0 < b && c1 >= b) b = c0; }
    if (b - a < 0.4) continue;
    const t0 = r3(a), t1 = r3(Math.max(b, a + 1.4));
    foot(pool[coverCount % pool.length], t0, t1, { kb: "in", dim: true, track: 9 });
    coverCount++;
  }
}

// ── captions (≤5 words), hidden under kinetic text / cards ──────────────────
{
  const capWords = words.map((w, i) => i).filter((i) => kept(i) && norm(words[i].text)).map((i) => ({ t: T(i), e: TE(i), text: words[i].text.replace(/^"|"$/g, "").replace(/^stimulating$/i, "simulating") }))
    .concat(OUTRO.filter((w) => norm(w.text)).map((w) => ({ t: r3(OUTRO_AT + w.start), e: r3(OUTRO_AT + w.end), text: w.text })));
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
  audio("m1", "m1.mp3", 0, c1 + 1.5, 0, env(c1 + 1.5, 0.3, 1.5, 0.055, [[tR - 0.3, tR + 1.2]]), 30);
  // m2 (330 s) covers c1 → c3; loop is not needed (c3 - c1 ≈ 301 s)
  audio("m2", "m2.mp3", c1 - 0.2, c3 - c1 + 1.7, 0, env(c3 - c1 + 1.7, 1.5, 1.5), 31);
  audio("m3", "m3.mp3", c3, Math.min(69, c4 - c3 + 1.2), 0, env(Math.min(69, c4 - c3 + 1.2), 1.0, 1.2), 32);
  const m4d = TOTAL - (c4 - 0.2);
  audio("m4", "m4.mp3", c4 - 0.2, Math.min(86, m4d), 0, env(Math.min(86, m4d), 0.8, 2.5, 0.09, [[tL - 0.6, tL + 0.4]]), 33);
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
  <div id="cam"><video id="cam-v" class="clip cam-v" src="media/cam.mp4" playsinline data-has-audio="true" data-start="0" data-duration="${RC_LEN}" data-media-start="0" data-track-index="1"></video></div>
${html.map((h) => "  " + h).join("\n")}
  <script src="vendor/gsap.min.js"></script>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true });
    ${emitJs().join("\n    ")}
    window.__timelines = window.__timelines || {};
    window.__timelines["gta6"] = tl;
  })();
  </script>
</div>
</body>
</html>
`;
writeFileSync(join(HERE, "index.html"), page);
writeFileSync(join(HERE, "meta.json"), J({ total: TOTAL, aroll: RC_LEN, outroAt: OUTRO_AT, chapters: CHAPS, covers: coverCount, sfx: sfxList.length, covered }, null, 1));
console.log(`index.html: ${TOTAL.toFixed(2)} s · ${html.length} nodes · ${js.length} tweens · ${sfxList.length} SFX · ${coverCount} look-away covers`);
