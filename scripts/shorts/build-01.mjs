#!/usr/bin/env node
// Short 1 — "I gave Claude Code my raw footage" — style: CINEMATIC FILM LAB.
// Instrument Serif italic + JetBrains Mono, film black / cream / tungsten, grain, viewfinder,
// clapperboard slates, film-burn into the edited clip, credits-roll for the tool stack.
//   node scripts/shorts/build-01.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, W, H, r3, esc, loadShort, phrases, copyMedia, fontFaces, page, writeComp, Seq, sfxTags } from "./lib.mjs";

const ID = "short-01";
const COMP = join(ROOT, "compositions", ID);
const s = loadShort(ID);
const { at, end } = s;
const END_CARD = 2.0;
const DUR = r3(s.speechEnd + END_CARD);
const icon = (name, color = "#F3EBDD", size = 56, stroke = 1.6) =>
  readFileSync(join(ROOT, "THUMBNAIL-STUDIO/node_modules/lucide-static/icons", `${name}.svg`), "utf-8")
    .replace(/<!--[\s\S]*?-->/g, "").replace(/\swidth="[^"]*"/, ` width="${size}"`).replace(/\sheight="[^"]*"/, ` height="${size}"`)
    .replace(/\sstroke-width="[^"]*"/, ` stroke-width="${stroke}"`).replace("<svg", `<svg style="color:${color};display:block"`);

copyMedia(COMP, [
  [join(ROOT, "media/shorts/short-01/cam.mp4"), "cam.mp4"],
  [join(ROOT, "compositions/CLD_1279/media/sample-raw.mp4"), "sample-raw.mp4"],
  [join(ROOT, "compositions/CLD_1279/media/sample-edited.mp4"), "sample-edited.mp4"],
  [join(ROOT, "media/shorts/audio/s1-music.mp3"), "music.mp3"],
  [join(ROOT, "media/shorts/audio/sfx-clapper.mp3"), "sfx-clapper.mp3"],
  [join(ROOT, "media/shorts/audio/sfx-projector.mp3"), "sfx-projector.mp3"],
  [join(ROOT, "media/shorts/audio/sfx-shutter.mp3"), "sfx-shutter.mp3"],
  [join(ROOT, "media/sfx/whoosh.mp3"), "sfx-whoosh.mp3"],
  [join(ROOT, "media/shorts/s1/grain.png"), "grain.png"],
  ...[6, 15, 24, 33].map((t) => [join(ROOT, `media/shorts/s1/raw-${t}.jpg`), `raw-${t}.jpg`]),
]);
const fonts = fontFaces(COMP, [
  ["Instrument Serif", "InstrumentSerif-400.woff2", 400, "normal"],
  ["Instrument Serif", "InstrumentSerif-400i.woff2", 400, "italic"],
  ["JetBrains Mono", "JetBrainsMono-500.woff2", 500],
  ["JetBrains Mono", "JetBrainsMono-700.woff2", 700],
]);

// ── timeline anchors ──────────────────────────────────────────────────────────
const C = s.clips; // cam A, raw insert, cam B, edit insert, cam C
const RAW = C[1], EDIT = C[3];
const T = {
  hookOut: 2.25,
  pip1: at("the mistakes") - 0.15,
  mistakes: at("mistakes,"), retakes: at("retakes,"), pauses: at("awkward pauses,"), audio: at("bad audio,"), everything: at("everything. And"),
  slate1: at("And this is what") , clap1: RAW.start - 0.22,
  noCuts: at("No cuts,"), noGfx: at("no graphics,"), noCap: at("no captions,"), noMusic: at("no music,"), nothing: at("nothing."),
  compare: at("And now compare"), clap2: EDIT.start - 0.2,
  final: at("This is the final"),
  removed: at("removed,"), tightened: at("tightened,"), cleaned: at("cleaned,"), gfx: at("graphics were added,"), captions: at("captions, music,"), music: at("music, sound"), sfx: at("sound effects,"), every2: at("everything. And the"),
  full2: at("And the interesting") - 0.2,
  didnt: at("didn't manually"), manually: at("manually build"), build: at("build this"), thisEdit: at("this entire edit"), trad: at("inside a traditional"),
  pip3: at("Claude Code managed") - 0.25, cc: at("Claude Code managed"), magic: at("not with one"), magicX: at("magical AI tool,") + 0.35,
  coord: at("but by coordinating"), tools: at("tools for different"), jobs: at("jobs."),
  endCard: s.speechEnd,
};

// ── camera modes: FULL ↔ PIP (rounded film card, bottom-left) ─────────────────
// The camera wrapper stays 1080x1920 and moves with transforms only (seek-safe, sub-pixel smooth).
const PS = 0.29; // PiP card ≈ 313x557 at bottom-left
const FULL = { x: 0, y: 0, scale: 1, borderRadius: 0, borderWidth: 0 };
const PIP = { x: 56, y: 1000, scale: PS, borderRadius: r3(30 / PS), borderWidth: r3(5 / PS) };
const modes = [[0, "full"], [T.pip1, "pip"], [T.full2, "full"], [T.pip3, "pip"]];
const modeAt = (t) => { let m = "full"; for (const [a, k] of modes) if (t >= a - 1e-6) m = k; return m; };
const seq = new Seq();
modes.forEach(([t, m], i) => i === 0 ? seq.set("#camwrap", FULL, 0) : seq.to("#camwrap", { ...(m === "pip" ? PIP : FULL), duration: 0.5, ease: "power3.inOut" }, t));
modes.slice(1).forEach(([t]) => seq.hit(t, "sfx-whoosh.mp3", 0.25));
modes.slice(1).forEach(([t, m]) => seq.to(".camlbl", { opacity: m === "pip" ? 1 : 0, duration: 0.3 }, t + 0.2));

const html = [];
// background + scenes
html.push(`<div id="bg"></div>`);
// camera clips (cam.mp4 contains only the talking-head ranges)
const camClips = C.filter((c) => c.kind === "cam");
const camOffsets = []; { let m = 0; for (const c of camClips) { camOffsets.push(m); m += c.dur; } }
html.push(`<div id="camwrap">${camClips.map((c, i) => `<video id="cam-${i}" class="clip camv" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${c.start}" data-duration="${c.dur}" data-media-start="${r3(camOffsets[i])}" data-track-index="1"></video>`).join("")}<div class="camlbl">CAM A</div></div>`);

// inserts with their own sound + muted continuations behind PiP scenes
html.push(`<video id="raw-ins" class="clip ins" src="media/sample-raw.mp4" playsinline data-has-audio="true" data-start="${RAW.start}" data-duration="${RAW.dur}" data-media-start="${RAW.mediaStart}" data-track-index="2"></video>`);
html.push(`<video id="edit-ins" class="clip ins" src="media/sample-edited.mp4" playsinline data-has-audio="true" data-start="${EDIT.start}" data-duration="${EDIT.dur}" data-media-start="${EDIT.mediaStart}" data-track-index="2"></video>`);
const rawC = { start: C[2].start, dur: C[2].dur };
const editC = { start: C[4].start, dur: r3(T.full2 + 0.5 - C[4].start) };
html.push(`<video id="raw-bg" class="clip bgv" src="media/sample-raw.mp4" muted playsinline data-start="${rawC.start}" data-duration="${rawC.dur}" data-media-start="${r3(RAW.mediaStart + RAW.dur)}" data-track-index="3"></video>`);
html.push(`<video id="edit-bg" class="clip bgv dark" src="media/sample-edited.mp4" muted playsinline data-start="${editC.start}" data-duration="${editC.dur}" data-media-start="6" data-track-index="3"></video>`);

// ── HOOK (over the first line) ────────────────────────────────────────────────
html.push(`<div id="hook" class="clip band" data-start="0" data-duration="${T.hookOut + 0.3}" data-track-index="10">
  <div class="slug" id="hk-slug">SCENE 01 — TAKE 1</div>
  <div class="serif xl" id="hk-1"><span class="ul">Claude Code<i class="u"></i></span> got</div>
  <div class="serif xl" id="hk-2">my raw footage.</div></div>`);
seq.from("#hk-slug", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.05, { opacity: 0, y: 20 });
seq.from("#hk-1", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.15, { opacity: 0, y: 60 });
seq.from("#hk-2", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.32, { opacity: 0, y: 60 });
seq.from("#hook .ul .u", { scaleX: 1, duration: 0.5, ease: "power3.out" }, 0.6, { scaleX: 0 });
seq.to("#hook", { opacity: 0, y: -30, duration: 0.3, ease: "power2.in" }, T.hookOut);
seq.hit(0.02, "sfx-projector.mp3", 0.3);

// ── viewfinder overlay (full-frame camera + raw clip) ─────────────────────────
const vfWin = [[0, T.pip1 + 0.4], [RAW.start, RAW.dur], [T.full2, T.pip3 + 0.4 - T.full2]];
vfWin.forEach(([a, d], i) => {
  html.push(`<div id="vf-${i}" class="clip vf" data-start="${r3(a)}" data-duration="${r3(i === 0 ? d - a : d)}" data-track-index="11">
  <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
  <div class="rec"><b></b>${i === 1 ? "RAW · AS SHOT" : "REC"}</div><div class="tc" id="tc-${i}">00:00:00:00</div>
  <div class="meta">4K · 25P · ISO 800</div></div>`);
  const len = i === 0 ? d - a : d;
  seq.add(`{ const o = { f: 0 }; const el = document.getElementById("tc-${i}"); const base = ${i === 1 ? 34 * 25 : 0}; tl.to(o, { f: ${Math.round(len * 25)}, duration: ${r3(len)}, ease: "none", onUpdate: () => { const n = Math.round(o.f) + base; const p = (x) => String(x).padStart(2, "0"); el.textContent = "00:" + p(Math.floor(n / 1500)) + ":" + p(Math.floor(n / 25) % 60) + ":" + p(n % 25); } }, ${r3(a)}); }`);
});
seq.from("#vf-0 .rec b", { opacity: 0.2, duration: 0.5, ease: "steps(1)", repeat: 9, yoyo: true }, 0, { opacity: 1 });

// ── SCENE A: four takes stamped (mistakes / retakes / pauses / bad audio) ─────
const sceneA0 = T.pip1, sceneA1 = T.slate1;
html.push(`<div id="scA" class="clip scene" data-start="${r3(sceneA0)}" data-duration="${r3(sceneA1 - sceneA0 + 0.4)}" data-track-index="4">
  <div class="sprockets l"></div><div class="sprockets r"></div>
  <div class="slug top">CONTACT SHEET — RAW TAKES</div>
  ${[["raw-6.jpg", "Mistakes"], ["raw-15.jpg", "Retakes"], ["raw-24.jpg", "Awkward pauses"], ["raw-33.jpg", "Bad audio"]].map(([img, lbl], i) => `
  <div class="cell" id="cell-${i}" style="left:${i % 2 ? 556 : 96}px;top:${i < 2 ? 330 : 700}px"><img src="media/${img}"/><div class="fno">TAKE 0${i + 1}</div>
    <div class="stampw"><div class="stamp" id="stamp-${i}">✕ ${lbl}</div></div></div>`).join("")}
  <div class="serif lg ctr" id="everything" style="top:1080px;left:470px;width:560px;text-align:left">…everything.</div></div>`);
seq.from("#scA .cell", { opacity: 1, y: 0, rotate: 0, duration: 0.45, ease: "back.out(1.6)", stagger: 0.08 }, sceneA0 + 0.1, { opacity: 0, y: 80, rotate: -4 });
[T.mistakes, T.retakes, T.pauses, T.audio].forEach((t, i) => {
  seq.from(`#stamp-${i}`, { opacity: 1, scale: 1, rotate: -8, duration: 0.22, ease: "back.out(2.4)" }, t, { opacity: 0, scale: 1.8, rotate: -8 });
  seq.to(`#cell-${i} img`, { filter: "grayscale(1) brightness(0.55)", duration: 0.25 }, t);
  seq.hit(t, "sfx-shutter.mp3", 0.35);
});
seq.from("#everything", { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, T.everything, { opacity: 0, x: 40 });
seq.to("#scA .cell", { opacity: 0, y: -40, duration: 0.3, ease: "power2.in", stagger: 0.04 }, sceneA1 - 0.1);
seq.to("#everything", { opacity: 0, duration: 0.25 }, sceneA1 - 0.1);

// ── clapperboard slate helper ─────────────────────────────────────────────────
function slate(id, t0, clapT, rows, durAfter = 0.35) {
  html.push(`<div id="${id}" class="clip scene slate-scene" data-start="${r3(t0)}" data-duration="${r3(clapT - t0 + durAfter)}" data-track-index="5">
  <div class="slate" id="${id}-s"><div class="arm" id="${id}-arm"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="bar"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="grid">${rows.map(([k, v, big]) => `<div class="f${big ? " big" : ""}"><span>${k}</span><b>${esc(v)}</b></div>`).join("")}</div></div></div>`);
  seq.from(`#${id}-s`, { opacity: 1, y: 0, rotate: -2, duration: 0.5, ease: "back.out(1.4)" }, t0 + 0.05, { opacity: 0, y: 120, rotate: 6 });
  seq.from(`#${id}-arm`, { rotate: -24, duration: 0.35, ease: "power2.out" }, t0 + 0.3, { rotate: 0 });
  seq.to(`#${id}-arm`, { rotate: 0, duration: 0.09, ease: "power4.in" }, clapT - 0.09);
  seq.hit(clapT, "sfx-clapper.mp3", 0.55);
}
slate("slate1", T.slate1, T.clap1, [["PROD.", "AI with Kalyan"], ["SCENE", "RAW FOOTAGE", true], ["TAKE", "1"], ["EDIT", "NONE"]]);

// ── SCENE B: raw clip keeps playing (muted) — "no cuts, no graphics…" ─────────
const sceneB0 = rawC.start, sceneB1 = T.compare + 0.2;
html.push(`<div id="scB" class="clip scene lab" data-start="${r3(sceneB0)}" data-duration="${r3(sceneB1 - sceneB0 + 0.3)}" data-track-index="6">
  <div class="slug top">LAB REPORT — RAW TAKE</div>
  ${[["NO CUTS", "scissors"], ["NO GRAPHICS", "shapes"], ["NO CAPTIONS", "captions"], ["NO MUSIC", "music"]].map(([l, ic], i) => `<div class="rep" id="rep-${i}" style="top:${330 + i * 130}px">${icon(ic, "#F3EBDD", 54)}<span>${l}</span><em>✕</em></div>`).join("")}
  <div class="serif lg" id="nothing" style="left:96px;top:880px">nothing.</div></div>`);
[T.noCuts, T.noGfx, T.noCap, T.noMusic].forEach((t, i) => seq.from(`#rep-${i}`, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, t - 0.05, { opacity: 0, x: -60 }));
seq.from("#nothing", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, T.nothing, { opacity: 0, y: 30 });
seq.hit(T.noCuts, "sfx-shutter.mp3", 0.25);
seq.to("#scB .rep, #nothing", { opacity: 0, duration: 0.3 }, sceneB1 - 0.1);

slate("slate2", T.compare + 0.15, T.clap2, [["PROD.", "AI with Kalyan"], ["SCENE", "CLAUDE-EDITED", true], ["TAKE", "2"], ["EDIT", "Claude Code"]], 0.25);
// film burn into the edited clip
html.push(`<div id="burn" class="clip burn" data-start="${r3(EDIT.start - 0.15)}" data-duration="0.75" data-track-index="12"></div>`);
seq.from("#burn", { opacity: 1, scale: 1.4, duration: 0.18, ease: "power2.out" }, EDIT.start - 0.15, { opacity: 0, scale: 0.6 });
seq.to("#burn", { opacity: 0, duration: 0.45, ease: "power2.in" }, EDIT.start + 0.1);
html.push(`<div id="edit-lbl" class="clip tag-lbl" data-start="${EDIT.start}" data-duration="${EDIT.dur}" data-track-index="12"><b></b>TAKE 2 · CLAUDE-EDITED</div>`);

// ── SCENE C: edit decision list (edited clip muted behind) ────────────────────
const sceneC0 = C[4].start, sceneC1 = T.full2;
const edl = [["01", "CUT", "Mistakes removed", "scissors", T.removed], ["02", "TRIM", "Pauses tightened", "timer", T.tightened], ["03", "AUDIO", "Audio cleaned", "mic", T.cleaned],
  ["04", "GFX", "Graphics added", "layers", T.gfx], ["05", "SUBS", "Captions", "captions", T.captions], ["06", "MUSIC", "Music", "music", T.music], ["07", "SFX", "Sound effects", "volume-2", T.sfx]];
html.push(`<div id="scC" class="clip scene lab" data-start="${r3(sceneC0)}" data-duration="${r3(sceneC1 - sceneC0 + 0.4)}" data-track-index="6">
  <div class="slug top">EDIT DECISION LIST — FINAL VERSION</div>
  ${edl.map(([n, code, txt, ic], i) => `<div class="edl" id="edl-${i}" style="top:${320 + i * 96}px"><span class="n">${n}</span>${icon(ic, "#FF9A3C", 44)}<span class="code">${code}</span><span class="txt">${txt}</span><em id="tick-${i}">✓</em></div>`).join("")}
  <div class="serif lg" id="every2" style="left:96px;top:1000px;font-size:96px">…everything.</div></div>`);
seq.from("#scC .slug", { opacity: 1, duration: 0.3 }, sceneC0 + 0.1, { opacity: 0 });
edl.forEach(([, , , , t], i) => {
  seq.from(`#edl-${i}`, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t - 0.35, { opacity: 0, x: 50 });
  seq.from(`#tick-${i}`, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" }, t, { opacity: 0, scale: 0.2 });
});
seq.hit(T.removed, "sfx-shutter.mp3", 0.25);
seq.from("#every2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, T.every2, { opacity: 0, y: 30 });
seq.to("#scC .edl, #every2", { opacity: 0, duration: 0.3 }, sceneC1 - 0.1);

// ── FULL: "I didn't manually build this edit" ─────────────────────────────────
html.push(`<div id="kinD" class="clip band" data-start="${r3(T.didnt - 0.1)}" data-duration="${r3(T.pip3 - T.didnt + 0.3)}" data-track-index="10">
  <div class="serif xl"><span id="kd1">I didn’t</span> <span id="kd2" class="tung ul">manually<i class="u t"></i></span></div>
  <div class="serif xl"><span id="kd3">build this edit</span></div>
  <div class="trad" id="kd4">${icon("film", "#F3EBDD", 46)}<span>in a traditional video editor</span><i></i></div></div>`);
seq.from("#kd1", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, T.didnt - 0.05, { opacity: 0, y: 40 });
seq.from("#kd2", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, T.manually - 0.05, { opacity: 0, y: 40 });
seq.from("#kinD .ul .u", { scaleX: 1, duration: 0.45, ease: "power3.out" }, T.manually + 0.2, { scaleX: 0 });
seq.from("#kd3", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, T.build - 0.05, { opacity: 0, y: 40 });
seq.from("#kd4", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, T.trad, { opacity: 0, y: 30 });
seq.from("#kd4 i", { scaleX: 1, duration: 0.35, ease: "power3.out" }, T.trad + 0.6, { scaleX: 0 });
seq.to("#kinD", { opacity: 0, duration: 0.25 }, T.pip3 - 0.05);

// ── SCENE D: credits — coordinated by Claude Code ────────────────────────────
const sceneD0 = T.pip3, sceneD1 = T.endCard;
const credits = [["TRANSCRIPTION", "ElevenLabs", T.coord + 0.2], ["CUTS & RENDER", "FFmpeg", T.coord + 0.75], ["VOICE CLEAN-UP", "Descript", T.tools - 0.1], ["MOTION GRAPHICS", "HyperFrames", T.tools + 0.45]];
html.push(`<div id="scD" class="clip scene" data-start="${r3(sceneD0)}" data-duration="${r3(sceneD1 - sceneD0 + 0.2)}" data-track-index="4">
  <div class="vign"></div>
  <div class="slug ctr" id="cr-k" style="top:280px">THE WORKFLOW WAS</div>
  <div class="serif lg ctr" id="cr-a" style="top:330px">coordinated by</div>
  <div class="serif xxl ctr" id="cr-b" style="top:420px;font-size:132px"><span class="ul">Claude Code<i class="u"></i></span></div>
  <div class="magic" id="magic">${icon("wand-sparkles", "#F3EBDD", 52)}<span>one magical AI tool</span><i></i></div>
  ${credits.map(([role, name], i) => `<div class="credit" id="cr-${i}" style="top:${612 + i * 108}px"><span>${role}</span><b>${name}</b></div>`).join("")}</div>`);
seq.from("#cr-k", { opacity: 1, duration: 0.3 }, sceneD0 + 0.2, { opacity: 0 });
seq.from("#cr-a", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, T.cc - 0.05, { opacity: 0, y: 30 });
seq.from("#cr-b", { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, T.cc + 0.2, { opacity: 0, y: 40, scale: 0.92 });
seq.from("#cr-b .ul .u", { scaleX: 1, duration: 0.5, ease: "power3.out" }, T.cc + 0.6, { scaleX: 0 });
seq.from("#magic", { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, T.magic, { opacity: 0, y: 30 });
seq.from("#magic i", { scaleX: 1, duration: 0.3, ease: "power3.out" }, T.magicX, { scaleX: 0 });
seq.to("#magic", { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }, T.coord - 0.15);
credits.forEach(([, , t], i) => seq.from(`#cr-${i}`, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t, { opacity: 0, y: 40 }));

// ── END CARD (shared text across the three Shorts) ────────────────────────────
html.push(`<div id="endc" class="clip scene endc" data-start="${T.endCard}" data-duration="${END_CARD}" data-track-index="13">
  <div class="leader" id="leader"><i class="ring"></i><i class="h"></i><i class="v"></i><b id="ld-n">2</b></div>
  <div class="serif xl ctr" id="ec1" style="top:1040px">Full video on</div>
  <div class="serif xl ctr" id="ec2" style="top:1150px"><span class="dot"></span>AI with Kalyan</div></div>`);
seq.from("#leader", { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, T.endCard, { opacity: 0, scale: 0.8 });
seq.set("#ld-n", { textContent: "1" }, T.endCard + 0.7);
seq.from("#leader .h", { rotate: 360, duration: 1.4, ease: "none" }, T.endCard, { rotate: 0 });
seq.from("#ec1", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, T.endCard + 0.2, { opacity: 0, y: 40 });
seq.from("#ec2", { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, T.endCard + 0.35, { opacity: 0, y: 40 });
seq.hit(T.endCard, "sfx-projector.mp3", 0.3);

// ── captions (≤ 4 words, hidden where kinetic text already shows the words) ───
const hide = [[0, T.hookOut + 0.15], [T.mistakes - 0.3, T.slate1 - 0.05], [T.noCuts - 0.1, T.nothing + 0.6], [T.removed - 0.4, T.full2], [T.didnt - 0.1, T.pip3]];
const KEY = /^(raw|claude|code|editor|footage|everything|final|camera|original|compare|workflow|magical|coordinating|tools|jobs|recording|version)$/i;
const caps = phrases(s.words).filter((p) => !hide.some(([a, b]) => p.start >= a && p.start < b));
for (const p of caps) for (const [a] of hide) if (a > p.start && a < p.end) p.end = r3(a); // never overlap kinetic text
caps.forEach((p, i) => {
  const m = modeAt(p.start + 0.01);
  const pos = m === "pip" ? `left:470px;top:1210px;width:560px;text-align:left` : `left:90px;top:1270px;width:900px;text-align:center`;
  html.push(`<div id="cap-${i}" class="clip cap" data-start="${p.start}" data-duration="${r3(p.end - p.start)}" data-track-index="14" style="${pos}">${p.words.map((w, k) => `<span id="cw-${i}-${k}" class="${KEY.test(w.text.replace(/[^a-z]/gi, "")) ? "k" : ""}">${esc(w.text)}</span>`).join(" ")}</div>`);
  seq.from(`#cap-${i}`, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, p.start, { opacity: 0, y: 14 });
  p.words.forEach((w, k) => seq.from(`#cw-${i}-${k}`, { opacity: 1, duration: 0.08 }, w.t, { opacity: 0.45 }));
});

// ── brand thread + grain ──────────────────────────────────────────────────────
html.push(`<div id="brand"><span class="dot"></span>AI with Kalyan</div>`);
html.push(`<div id="grain"></div><div id="vig"></div>`);
seq.from("#grain", { backgroundPosition: `${Math.round(DUR * 25) * 97}px ${Math.round(DUR * 25) * 61}px`, duration: DUR, ease: `steps(${Math.round(DUR * 25)})` }, 0, { backgroundPosition: "0px 0px" });
seq.to("#brand", { opacity: 0, duration: 0.2 }, T.endCard - 0.2);

// ── audio: music bed (dipped under the clips' own sound) + sparse SFX ─────────
const mus = [[0, RAW.start, 0.11], [RAW.start, RAW.dur, 0.03], [C[2].start, C[2].dur, 0.11], [EDIT.start, EDIT.dur, 0.03], [C[4].start, C[4].dur, 0.11], [T.endCard, END_CARD, 0.2]];
const audio = mus.map(([a, d, v], i) => `<audio id="mus-${i}" class="clip" src="media/music.mp3" data-start="${r3(a)}" data-duration="${r3(d)}" data-media-start="${r3(a)}" data-volume="${v}" data-track-index="${15 + (i % 2)}"></audio>`).join("\n");
const sfxDur = { "sfx-clapper.mp3": 0.8, "sfx-projector.mp3": 1.2, "sfx-shutter.mp3": 0.5, "sfx-whoosh.mp3": 0.8 };

const css = `${fonts}
:root { --black: #0d0b09; --cream: #F3EBDD; --tung: #FF9A3C; --coral: #E8775F; }
#stage { background: var(--black); font-family: "JetBrains Mono", monospace; color: var(--cream); }
#bg { position: absolute; inset: 0; background: radial-gradient(900px 1200px at 50% 40%, #241a12, #0d0b09 70%); }
#camwrap { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; overflow: hidden; z-index: 5; border: 0 solid var(--cream); box-shadow: 0 30px 80px rgba(0,0,0,.6); }
.camv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 32%; }
.camlbl { position: absolute; left: 48px; top: 40px; font: 700 62px "JetBrains Mono"; letter-spacing: .12em; color: var(--cream); background: rgba(13,11,9,.6); padding: 12px 30px; border-radius: 24px; opacity: 0; }
.ins { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 8; }
.bgv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; filter: brightness(.42) saturate(.85) blur(2px); }
.bgv.dark { filter: brightness(.22) saturate(.6) blur(7px); }
.scene { position: absolute; inset: 0; z-index: 3; }
#scD, #scA { background: radial-gradient(900px 1100px at 50% 35%, #2a1d12, #0d0b09 70%); }
.band { position: absolute; left: 0; right: 0; top: 1180px; z-index: 10; text-align: center; }
.serif { font-family: "Instrument Serif", serif; font-style: italic; color: var(--cream); line-height: 1.02; text-shadow: 0 4px 30px rgba(0,0,0,.7); }
.serif.xl { font-size: 104px; } .serif.xxl { font-size: 150px; } .serif.lg { font-size: 84px; position: absolute; }
.serif.ctr, .slug.ctr { position: absolute; left: 0; right: 0; text-align: center; }
.slug { font: 700 26px "JetBrains Mono"; letter-spacing: .22em; color: var(--tung); margin-bottom: 14px; }
.slug.top { position: absolute; left: 96px; top: 240px; }
.ul { position: relative; display: inline-block; }
.ul .u { position: absolute; left: 0; right: 0; bottom: 6px; height: 8px; background: var(--coral); border-radius: 4px; transform-origin: left; }
.ul .u.t { background: var(--tung); height: 6px; }
.tung { color: var(--tung); }
.vf { position: absolute; inset: 0; z-index: 11; pointer-events: none; }
.vf .c { position: absolute; width: 90px; height: 90px; border: 0 solid rgba(243,235,221,.85); }
.vf .tl { left: 48px; top: 190px; border-left-width: 4px; border-top-width: 4px; } .vf .tr { right: 48px; top: 190px; border-right-width: 4px; border-top-width: 4px; }
.vf .bl { left: 48px; bottom: 330px; border-left-width: 4px; border-bottom-width: 4px; } .vf .br { right: 48px; bottom: 330px; border-right-width: 4px; border-bottom-width: 4px; }
.vf .rec { position: absolute; left: 80px; top: 214px; font: 700 26px "JetBrains Mono"; letter-spacing: .14em; display: flex; align-items: center; gap: 12px; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
.vf .rec b { width: 20px; height: 20px; border-radius: 50%; background: #ff3b30; display: block; }
.vf .tc { position: absolute; left: 80px; top: 256px; font: 500 24px "JetBrains Mono"; letter-spacing: .08em; opacity: .9; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
.vf .meta { position: absolute; left: 80px; bottom: 350px; font: 500 22px "JetBrains Mono"; letter-spacing: .12em; opacity: .75; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
.sprockets { position: absolute; top: 0; bottom: 0; width: 44px; background: repeating-linear-gradient(to bottom, transparent 0 26px, rgba(243,235,221,.16) 26px 52px); }
.sprockets.l { left: 18px; } .sprockets.r { right: 18px; }
.cell { position: absolute; width: 428px; height: 340px; background: #000; border: 3px solid rgba(243,235,221,.85); border-radius: 10px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,.6); }
.cell img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.cell .fno { position: absolute; left: 12px; top: 10px; font: 700 20px "JetBrains Mono"; letter-spacing: .14em; background: rgba(13,11,9,.75); padding: 4px 10px; border-radius: 6px; }
.stampw { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.stamp { opacity: 0; white-space: nowrap; font: italic 400 64px "Instrument Serif"; color: var(--tung); border: 4px solid var(--tung); padding: 2px 18px; border-radius: 10px; background: rgba(13,11,9,.55); }
.slate-scene { background: radial-gradient(900px 1100px at 50% 35%, #2a1d12, #0d0b09 70%); }
.slate { position: absolute; left: 110px; top: 300px; width: 860px; transform-origin: 50% 100%; }
.slate .arm, .slate .bar { height: 78px; background: #121212; border: 4px solid var(--cream); display: flex; overflow: hidden; }
.slate .arm { border-radius: 10px 10px 0 0; transform-origin: 0% 100%; }
.slate .arm i, .slate .bar i { flex: 1; background: var(--cream); transform: skewX(-30deg); margin: 0 26px; }
.slate .grid { background: #121212; border: 4px solid var(--cream); border-top: 0; border-radius: 0 0 14px 14px; display: grid; grid-template-columns: 1fr 1fr; }
.slate .f { padding: 18px 24px; border-top: 2px solid rgba(243,235,221,.4); border-right: 2px solid rgba(243,235,221,.4); }
.slate .f.big { grid-column: span 2; order: -1; border-right: 0; }
.slate .f span { display: block; font: 700 20px "JetBrains Mono"; letter-spacing: .2em; color: var(--tung); }
.slate .f b { display: block; font: italic 400 64px "Instrument Serif"; color: var(--cream); margin-top: 6px; }
.slate .f.big b { font-size: 104px; }
.rep { position: absolute; left: 96px; display: flex; align-items: center; gap: 26px; font: 700 52px "JetBrains Mono"; letter-spacing: .06em; text-shadow: 0 3px 20px rgba(0,0,0,.8); }
.rep em { font-style: normal; color: var(--tung); margin-left: 8px; }
.burn { position: absolute; inset: -200px; z-index: 12; background: radial-gradient(circle at 60% 45%, #fff6e0 0%, #ffb25c 30%, rgba(255,90,20,.6) 55%, transparent 75%); mix-blend-mode: screen; }
.tag-lbl { position: absolute; left: 56px; top: 1590px; z-index: 12; font: 700 22px "JetBrains Mono"; letter-spacing: .14em; color: var(--cream); background: rgba(13,11,9,.72); padding: 8px 14px; border-radius: 8px; display: flex; gap: 10px; align-items: center; }
.tag-lbl b { width: 14px; height: 14px; border-radius: 50%; background: var(--tung); display: block; }
.edl { position: absolute; left: 96px; right: 80px; display: flex; align-items: center; gap: 22px; height: 80px; border-bottom: 2px solid rgba(243,235,221,.18); }
.edl .n { font: 500 24px "JetBrains Mono"; opacity: .6; width: 40px; }
.edl .code { font: 700 24px "JetBrains Mono"; letter-spacing: .14em; color: var(--tung); width: 110px; }
.edl .txt { font: italic 400 58px "Instrument Serif"; flex: 1; }
.edl em { font-style: normal; font: 700 44px "JetBrains Mono"; color: var(--tung); }
.trad { display: inline-flex; align-items: center; gap: 16px; margin-top: 18px; font: 500 30px "JetBrains Mono"; letter-spacing: .04em; position: relative; padding: 8px 18px; background: rgba(13,11,9,.55); border-radius: 10px; }
.trad i, .magic i { position: absolute; left: -10px; right: -10px; top: 50%; height: 5px; background: var(--tung); transform-origin: left; }
.magic { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; top: 680px; display: flex; align-items: center; gap: 18px; font: italic 400 68px "Instrument Serif"; color: rgba(243,235,221,.85); padding: 10px 26px; }
.credit { position: absolute; left: 0; right: 0; text-align: center; }
.credit span { display: block; font: 700 22px "JetBrains Mono"; letter-spacing: .26em; color: var(--tung); }
.credit b { display: block; font: italic 400 64px "Instrument Serif"; font-weight: 400; color: var(--cream); margin-top: 2px; }
.vign { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,.6)); }
.endc { z-index: 13; background: radial-gradient(900px 1100px at 50% 40%, #2a1d12, #0d0b09 70%); }
.leader { position: absolute; left: 340px; top: 380px; width: 400px; height: 400px; }
.leader .ring { position: absolute; inset: 0; border: 6px solid rgba(243,235,221,.8); border-radius: 50%; }
.leader .h, .leader .v { position: absolute; background: rgba(243,235,221,.5); }
.leader .h { left: 50%; top: 0; width: 4px; height: 50%; margin-left: -2px; transform-origin: 50% 100%; }
.leader .v { left: 0; right: 0; top: 50%; height: 3px; }
.leader b { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font: italic 400 220px "Instrument Serif"; color: var(--cream); }
.dot { display: inline-block; width: .28em; height: .28em; border-radius: 50%; background: var(--coral); margin-right: .25em; vertical-align: .12em; }
.cap { position: absolute; z-index: 14; font: italic 400 72px "Instrument Serif"; line-height: 1.04; color: var(--cream); text-shadow: 0 2px 4px rgba(0,0,0,.6), 0 6px 30px rgba(0,0,0,.8); }
.cap .k { color: var(--tung); }
#brand { position: absolute; right: 56px; top: 212px; z-index: 15; font: 700 22px "JetBrains Mono"; letter-spacing: .1em; color: var(--cream); background: rgba(13,11,9,.6); padding: 8px 14px; border-radius: 8px; }
#brand .dot { margin-right: 10px; }
#grain { position: absolute; inset: 0; z-index: 18; background: url(media/grain.png); background-size: 256px 256px; opacity: .55; mix-blend-mode: overlay; pointer-events: none; }
#vig { position: absolute; inset: 0; z-index: 17; background: radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(0,0,0,.45)); pointer-events: none; }
`;

const body = html.join("\n") + "\n" + audio + "\n" + sfxTags(seq.sfx, (n) => sfxDur[n] ?? 0.8);
writeComp(COMP, page({ id: ID, duration: DUR, css, body, script: seq.code() }), { id: ID, name: "Short 1 — film lab" });
console.log(`${ID}: ${DUR}s, ${caps.length} captions, ${seq.sfx.length} sfx requested`);
