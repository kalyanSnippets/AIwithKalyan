#!/usr/bin/env node
// Short 3 — "Did Claude Code really edit it?" — style: NEO-BRUTALIST POP.
// Archivo Black + Space Grotesk, lemon / black / white, one colour per tool (Claude = coral),
// thick outlines, hard shadows, stamps, stickers and card slams.
//   node scripts/shorts/build-03.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, W, H, r3, esc, loadShort, phrases, copyMedia, fontFaces, page, writeComp, Seq, sfxTags } from "./lib.mjs";

const ID = "short-03";
const COMP = join(ROOT, "compositions", ID);
const s = loadShort(ID);
const { at } = s;
const END_CARD = 2.0;
const DUR = r3(s.speechEnd + END_CARD);
const icon = (name, color = "#111", size = 56, stroke = 2.6) =>
  readFileSync(join(ROOT, "THUMBNAIL-STUDIO/node_modules/lucide-static/icons", `${name}.svg`), "utf-8")
    .replace(/<!--[\s\S]*?-->/g, "").replace(/\swidth="[^"]*"/, ` width="${size}"`).replace(/\sheight="[^"]*"/, ` height="${size}"`)
    .replace(/\sstroke-width="[^"]*"/, ` stroke-width="${stroke}"`).replace("<svg", `<svg style="color:${color};display:block"`);

copyMedia(COMP, [
  [join(ROOT, "media/shorts/short-03/cam.mp4"), "cam.mp4"],
  [join(ROOT, "media/shorts/audio/s3-music.mp3"), "music.mp3"],
  ...["thud", "bpop", "swipe"].map((n) => [join(ROOT, `media/shorts/audio/sfx-${n}.mp3`), `sfx-${n}.mp3`]),
]);
const fonts = fontFaces(COMP, [["Archivo Black", "ArchivoBlack-400.woff2", 400], ["Space Grotesk", "SpaceGrotesk-500.woff2", 500], ["Space Grotesk", "SpaceGrotesk-700.woff2", 700]]);

const T = {
  hookOut: 1.95, did: at("so did Claude"), cc: at("Claude Code edit"), entire: at("the entire video?"),
  inAWay: at("In a way,"), yes: at("yes."),
  pip1: at("But Claude itself") - 0.15, replace: at("didn't replace"), every: at("every tool."),
  coordinator: at("coordinator."), coordWas: at("Claude Code was"),
  el: at("ElevenLabs understood"), ff: at("FFmpeg processed"), de: at("Descript changed"), hf: at("Hyperframes created"),
  managed: at("And Claude managed"), together: at("worked together."),
  full2: at("I still made") - 0.2, me: at("I still made"), creative: at("creative decisions,"), repetitive: at("repetitive editing"), system: at("system."),
  pip2: at("And now, because") - 0.15, saved: at("saved my"), prefs: at("preferences,"), next: at("the next video"), easier: at("easier,"),
  full3: at("and that's where") - 0.2, really: at("really interesting."), interesting: at("interesting."),
  endCard: s.speechEnd,
};

const PS = 0.29;
const FULL = { x: 0, y: 0, scale: 1, borderWidth: 0, borderRadius: 0 };
const PIP = { x: 56, y: 1000, scale: PS, borderWidth: r3(8 / PS), borderRadius: r3(22 / PS) };
const modes = [[0, "full"], [T.pip1, "pip"], [T.full2, "full"], [T.pip2, "pip"], [T.full3, "full"]];
const modeAt = (t) => { let m = "full"; for (const [a, k] of modes) if (t >= a - 1e-6) m = k; return m; };
const seq = new Seq();
modes.forEach(([t, m], i) => i === 0 ? seq.set("#camwrap", FULL, 0) : seq.to("#camwrap", { ...(m === "pip" ? PIP : FULL), duration: 0.42, ease: "back.inOut(1.2)" }, t));
modes.slice(1).forEach(([t]) => seq.hit(t, "sfx-swipe.mp3", 0.3));
// hard shadow card that follows the PiP (sits behind the camera)
seq.set("#pipshadow", { opacity: 0 }, 0);
modes.slice(1).forEach(([t, m]) => seq.to("#pipshadow", { opacity: m === "pip" ? 1 : 0, duration: 0.2 }, t + (m === "pip" ? 0.35 : 0)));

const html = [];
html.push(`<div id="bg"></div><div id="pipshadow"></div>`);
html.push(`<div id="camwrap">${s.clips.map((c, i) => `<video id="cam-${i}" class="clip camv" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${c.start}" data-duration="${c.dur}" data-media-start="${r3(c.mediaStart)}" data-track-index="1"></video>`).join("")}</div>`);

// ── HOOK + the question ──────────────────────────────────────────────────────
html.push(`<div id="hook" class="clip band" data-start="0" data-duration="${T.hookOut + 0.25}" data-track-index="10">
  <div class="stk pink" id="hk1">THE HONEST ANSWER</div><div class="stk blk" id="hk2">${icon("arrow-down", "#FFE14D", 60, 3.4)}</div></div>`);
seq.from("#hk1", { opacity: 1, scale: 1, rotation: -4, duration: 0.3, ease: "back.out(2.6)" }, 0.05, { opacity: 0, scale: 0.3, rotation: -4 });
seq.from("#hk2", { opacity: 1, scale: 1, rotation: 6, duration: 0.3, ease: "back.out(2.6)" }, 0.3, { opacity: 0, scale: 0.3, rotation: 6 });
seq.to("#hk2", { y: 16, duration: 0.25, ease: "power1.inOut", yoyo: true, repeat: 3 }, 0.65);
seq.to("#hook", { opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, T.hookOut);
seq.hit(0.05, "sfx-bpop.mp3", 0.4);

html.push(`<div id="q" class="clip band" data-start="${r3(T.did - 0.05)}" data-duration="${r3(T.inAWay - T.did + 0.1)}" data-track-index="10">
  <div class="blk-row"><span class="blk w" id="q1">DID</span><span class="blk coral" id="q2">CLAUDE CODE</span></div>
  <div class="blk-row"><span class="blk w" id="q3">EDIT THE ENTIRE</span><span class="blk y" id="q4">VIDEO?</span></div></div>`);
[["#q1", T.did], ["#q2", T.cc], ["#q3", T.entire - 0.35], ["#q4", T.entire + 0.25]].forEach(([sel, t], i) => seq.from(sel, { opacity: 1, scale: 1, rotation: i % 2 ? 2 : -2, duration: 0.24, ease: "back.out(2.8)" }, t, { opacity: 0, scale: 1.6, rotation: i % 2 ? 2 : -2 }));
seq.hit(T.cc, "sfx-bpop.mp3", 0.35);

html.push(`<div id="verdict" class="clip band" data-start="${r3(T.inAWay - 0.05)}" data-duration="${r3(T.pip1 - T.inAWay + 0.3)}" data-track-index="10">
  <div class="stamp" id="vd"><span class="sm">IN A WAY…</span><span class="lg">YES</span></div></div>`);
seq.from("#vd", { opacity: 1, scale: 1, rotation: -6, duration: 0.22, ease: "back.out(3)" }, T.inAWay, { opacity: 0, scale: 0.5, rotation: -6 });
seq.from("#vd .lg", { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" }, T.yes - 0.1, { opacity: 0, scale: 2.4 });
seq.add(`tl.to("#camwrap", { x: 14, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, ${r3(T.yes - 0.02)}); tl.set("#camwrap", { x: 0 }, ${r3(T.yes + 0.3)});`);
seq.hit(T.yes - 0.1, "sfx-thud.mp3", 0.5);

// ── HUB: Claude Code coordinates the tools ───────────────────────────────────
const tools = [
  ["ElevenLabs", "audio-waveform", "#3D7BFF", "UNDERSTOOD THE FOOTAGE + SOUND", T.el, { x: 60, y: 250 }],
  ["FFmpeg", "scissors", "#2BD47D", "PROCESSED THE VIDEO", T.ff, { x: 600, y: 250 }],
  ["Descript", "mic", "#FF5FA2", "CLEANED UP THE AUDIO", T.de, { x: 60, y: 760 }],
  ["HyperFrames", "layers", "#B892FF", "THE VISUAL LAYER", T.hf, { x: 600, y: 760 }],
];
const hub = { x: 320, y: 500, w: 440, h: 190 };
const hubC = { x: hub.x + hub.w / 2, y: hub.y + hub.h / 2 };
html.push(`<div id="hubScene" class="clip scene" data-start="${r3(T.pip1)}" data-duration="${r3(T.full2 - T.pip1 + 0.3)}" data-track-index="4">
  <svg class="wires" width="1080" height="1920" viewBox="0 0 1080 1920">${tools.map(([, , , , , p], i) => `<line id="wire-${i}" x1="${hubC.x}" y1="${hubC.y}" x2="${p.x + 210}" y2="${p.y + 95}" stroke="#111" stroke-width="12" stroke-linecap="round" stroke-dasharray="700" stroke-dashoffset="700"/>`).join("")}</svg>
  <div class="replace" id="rep"><span>REPLACE EVERY TOOL?</span><b class="nope" id="nope">NOPE</b></div>
  ${tools.map(([name, ic, col, does, , p], i) => `<div class="tool" id="tool-${i}" style="left:${p.x}px;top:${p.y}px;background:${col}"><div class="tn">${icon(ic, "#111", 50, 2.8)}<span>${name}</span></div><div class="td">${does}</div></div>`).join("")}
  <div class="hub" id="hub" style="left:${hub.x}px;top:${hub.y}px;width:${hub.w}px;height:${hub.h}px"><span class="spark">${icon("sparkle", "#111", 46, 2.6)}</span><span>CLAUDE CODE</span><b class="stk2" id="coord">COORDINATOR</b></div>
  <div class="stk y" id="together" style="position:absolute;left:300px;top:1000px">ALL WORKING TOGETHER</div></div>`);
seq.from("#rep", { opacity: 1, scale: 1, rotation: -2, duration: 0.3, ease: "back.out(2.4)" }, T.pip1 + 0.15, { opacity: 0, scale: 0.6, rotation: -2 });
seq.from("#nope", { opacity: 1, scale: 1, rotation: 10, duration: 0.2, ease: "back.out(3)" }, T.replace, { opacity: 0, scale: 2.2, rotation: 10 });
seq.hit(T.replace, "sfx-thud.mp3", 0.45);
seq.to("#rep", { opacity: 0, scale: 0.7, duration: 0.22, ease: "power2.in" }, T.coordWas - 0.25);
seq.from("#hub", { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2.4)" }, T.coordWas - 0.05, { opacity: 0, scale: 0.4, rotation: -6 });
seq.from("#coord", { opacity: 1, scale: 1, rotation: -8, duration: 0.2, ease: "back.out(3)" }, T.coordinator, { opacity: 0, scale: 2, rotation: -8 });
seq.hit(T.coordinator, "sfx-thud.mp3", 0.4);
tools.forEach(([, , , , t], i) => {
  seq.from(`#tool-${i}`, { opacity: 1, scale: 1, rotation: i % 2 ? 2 : -2, duration: 0.26, ease: "back.out(2.6)" }, t - 0.05, { opacity: 0, scale: 0.3, rotation: i % 2 ? 12 : -12 });
  seq.from(`#wire-${i}`, { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out" }, t + 0.1, { attr: { "stroke-dashoffset": 700 } });
  seq.hit(t - 0.05, "sfx-bpop.mp3", 0.35);
});
seq.to("#hub", { scale: 1.08, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 3 }, T.managed + 0.2);
seq.to(".wires line", { attr: { stroke: "#E8775F" }, duration: 0.2, stagger: 0.08 }, T.managed + 0.2);
seq.from("#together", { opacity: 1, scale: 1, rotation: -3, duration: 0.25, ease: "back.out(2.6)" }, T.together - 0.2, { opacity: 0, scale: 0.4, rotation: -3 });

// ── FULL: scoreboard — me vs the system ─────────────────────────────────────
html.push(`<div id="score" class="clip band" data-start="${r3(T.me - 0.1)}" data-duration="${r3(T.pip2 - T.me + 0.25)}" data-track-index="10">
  <div class="sb" id="sb1" style="background:#FF5FA2"><span class="who">ME</span><span class="what">CREATIVE DECISIONS</span></div>
  <div class="sb" id="sb2" style="background:#3D7BFF"><span class="who">THE SYSTEM</span><span class="what">REPETITIVE EDITING WORK</span></div></div>`);
seq.from("#sb1", { opacity: 1, x: 0, rotation: -2, duration: 0.3, ease: "back.out(2)" }, T.me, { opacity: 0, x: -400, rotation: -2 });
seq.from("#sb2", { opacity: 1, x: 0, rotation: 2, duration: 0.3, ease: "back.out(2)" }, T.repetitive - 0.2, { opacity: 0, x: 400, rotation: 2 });
seq.hit(T.me, "sfx-bpop.mp3", 0.35); seq.hit(T.repetitive - 0.2, "sfx-bpop.mp3", 0.35);

// ── AGENTS.md: saved preferences → next video easier ────────────────────────
const rules = ["Never cover my face", "Keep the music subtle", "Keep natural pauses", "Every sentence gets a visual"];
html.push(`<div id="agents" class="clip scene" data-start="${r3(T.pip2)}" data-duration="${r3(T.full3 - T.pip2 + 0.3)}" data-track-index="4">
  <div class="file" id="file"><div class="fh">${icon("file-text", "#111", 46, 2.6)}<span>AGENTS.md</span><b>SAVED</b></div>
    ${rules.map((r, i) => `<div class="rule" id="rule-${i}"><span class="ck">${icon("check", "#111", 34, 3.4)}</span>${r}</div>`).join("")}</div>
  <div class="stk y big" id="easier"><span>NEXT VIDEO</span>${icon("arrow-right", "#111", 64, 3.4)}<span class="pk">EASIER</span></div></div>`);
seq.from("#file", { opacity: 1, y: 0, rotation: -1.5, duration: 0.32, ease: "back.out(2)" }, T.pip2 + 0.1, { opacity: 0, y: 120, rotation: -1.5 });
seq.from("#file .fh b", { opacity: 1, scale: 1, rotation: 6, duration: 0.2, ease: "back.out(3)" }, T.saved, { opacity: 0, scale: 2, rotation: 6 });
rules.forEach((_, i) => seq.from(`#rule-${i}`, { opacity: 1, x: 0, duration: 0.24, ease: "back.out(2)" }, T.prefs - 0.3 + i * 0.32, { opacity: 0, x: 60 }));
seq.hit(T.saved, "sfx-thud.mp3", 0.35);
seq.from("#easier", { opacity: 1, scale: 1, rotation: -3, duration: 0.28, ease: "back.out(2.6)" }, T.easier - 0.25, { opacity: 0, scale: 0.4, rotation: -3 });
seq.hit(T.easier - 0.25, "sfx-bpop.mp3", 0.35);

// ── FULL: really interesting ─────────────────────────────────────────────────
html.push(`<div id="intr" class="clip band" data-start="${r3(T.really - 0.1)}" data-duration="${r3(T.endCard - T.really + 0.15)}" data-track-index="10">
  <div class="blk-row"><span class="blk w" id="i1">REALLY</span><span class="blk y" id="i2">INTERESTING</span></div></div>`);
seq.from("#i1", { opacity: 1, scale: 1, rotation: -3, duration: 0.24, ease: "back.out(2.8)" }, T.really - 0.05, { opacity: 0, scale: 1.6, rotation: -3 });
seq.from("#i2", { opacity: 1, scale: 1, rotation: 2, duration: 0.24, ease: "back.out(2.8)" }, T.interesting - 0.05, { opacity: 0, scale: 1.6, rotation: 2 });
seq.to("#i2", { rotation: -2, duration: 0.12, yoyo: true, repeat: 5, ease: "sine.inOut" }, T.interesting + 0.25);

// ── END CARD ─────────────────────────────────────────────────────────────────
html.push(`<div id="endc" class="clip scene endc" data-start="${T.endCard}" data-duration="${END_CARD}" data-track-index="13">
  <div class="blk w huge" id="ec1">FULL VIDEO ON</div><div class="blk blkc huge" id="ec2"><span class="dot"></span>AI WITH KALYAN</div>
  <div class="stk pink" id="ec3">${icon("play", "#111", 40, 3)} WATCH IT</div></div>`);
seq.from("#ec1", { opacity: 1, scale: 1, rotation: -2, duration: 0.26, ease: "back.out(2.6)" }, T.endCard + 0.05, { opacity: 0, scale: 1.6, rotation: -2 });
seq.from("#ec2", { opacity: 1, scale: 1, rotation: 2, duration: 0.26, ease: "back.out(2.6)" }, T.endCard + 0.25, { opacity: 0, scale: 1.6, rotation: 2 });
seq.from("#ec3", { opacity: 1, scale: 1, rotation: 6, duration: 0.24, ease: "back.out(3)" }, T.endCard + 0.55, { opacity: 0, scale: 0.3, rotation: 6 });
seq.hit(T.endCard + 0.05, "sfx-thud.mp3", 0.4);

// ── captions: bold blocks ────────────────────────────────────────────────────
const hide = [[0, T.hookOut + 0.1], [T.did - 0.1, T.pip1], [T.me - 0.1, T.pip2], [T.really - 0.1, T.endCard]];
const KEY = /^(claude|code|coordinator|elevenlabs|ffmpeg|descript|hyperframes|sound|video|audio|together|tool|layer|preferences|easier|system)$/i;
const caps = phrases(s.words).filter((p) => !hide.some(([a, b]) => p.start >= a && p.start < b));
for (const p of caps) for (const [a] of hide) if (a > p.start && a < p.end) p.end = r3(a);
caps.forEach((p, i) => {
  const m = modeAt(p.start + 0.01);
  const pos = m === "pip" ? `left:430px;top:1240px;width:620px;justify-content:flex-start` : `left:50px;top:1290px;width:980px;justify-content:center`;
  html.push(`<div id="cap-${i}" class="clip cap" data-start="${p.start}" data-duration="${r3(p.end - p.start)}" data-track-index="14" style="${pos}"><span class="cs">${p.words.map((w, k) => `<span id="cw-${i}-${k}" class="${KEY.test(w.text.replace(/[^a-z]/gi, "")) ? "k" : ""}">${esc(w.text.toUpperCase())}</span>`).join(" ")}</span></div>`);
  seq.from(`#cap-${i} .cs`, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2.6)" }, p.start, { opacity: 0, scale: 0.7 });
  p.words.forEach((w, k) => seq.from(`#cw-${i}-${k}`, { opacity: 1, duration: 0.06 }, w.t, { opacity: 0.4 }));
});

html.push(`<div id="brand"><span class="dot"></span>AI WITH KALYAN</div>`);
seq.to("#brand", { opacity: 0, duration: 0.2 }, T.endCard - 0.2);

const mus = [[0, T.endCard, 0.1], [T.endCard, END_CARD, 0.2]];
const audio = mus.map(([a, d, v], i) => `<audio id="mus-${i}" class="clip" src="media/music.mp3" data-start="${r3(a)}" data-duration="${r3(d)}" data-media-start="${r3(a)}" data-volume="${v}" data-track-index="${15 + i}"></audio>`).join("\n");
const sfxDur = { "sfx-thud.mp3": 0.62, "sfx-bpop.mp3": 0.48, "sfx-swipe.mp3": 0.74 };

const css = `${fonts}
:root { --y: #FFE14D; --k: #111; --w: #fff; --pink: #FF5FA2; --blue: #3D7BFF; --coral: #E8775F; }
#stage { background: var(--y); color: var(--k); font-family: "Space Grotesk", sans-serif; }
#bg { position: absolute; inset: 0; background: radial-gradient(circle, rgba(17,17,17,.16) 3px, transparent 3.5px) 0 0 / 44px 44px, var(--y); }
#camwrap { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; overflow: hidden; z-index: 5; border: 0 solid var(--k); background: #000; }
#pipshadow { position: absolute; left: 70px; top: 1014px; width: 313px; height: 557px; border-radius: 22px; background: var(--k); z-index: 4; }
.camv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 32%; }
.scene { position: absolute; inset: 0; z-index: 3; }
.band { position: absolute; left: 0; right: 0; top: 1160px; z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 18px; }
.stk { display: inline-flex; align-items: center; gap: 14px; font: 400 54px "Archivo Black"; padding: 14px 28px; border: 6px solid var(--k); box-shadow: 10px 10px 0 var(--k); border-radius: 16px; background: var(--w); }
.stk.pink { background: var(--pink); } .stk.y { background: var(--y); } .stk.blk { background: var(--k); padding: 10px 22px; }
.stk.big { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; top: 850px; font-size: 56px; }
.stk .pk { background: var(--pink); padding: 0 10px; border: 4px solid var(--k); }
.blk-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; max-width: 1000px; }
.blk { display: inline-block; font: 400 88px "Archivo Black"; line-height: 1; padding: 16px 26px 20px; border: 7px solid var(--k); box-shadow: 12px 12px 0 var(--k); border-radius: 14px; letter-spacing: -0.01em; }
.blk.w { background: var(--w); } .blk.y { background: var(--y); } .blk.coral { background: var(--coral); } .blk.blkc { background: var(--k); color: var(--y); }
.blk.huge { font-size: 100px; position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; }
#ec1 { top: 620px; } #ec2 { top: 800px; } #ec3 { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; top: 1010px; }
.stamp { display: flex; flex-direction: column; align-items: center; padding: 18px 56px 26px; border: 12px solid var(--k); background: var(--y); box-shadow: 16px 16px 0 var(--k); border-radius: 22px; }
.stamp .sm { font: 400 60px "Archivo Black"; } .stamp .lg { font: 400 220px "Archivo Black"; line-height: .9; }
.wires { position: absolute; left: 0; top: 0; }
.replace { position: absolute; left: 70px; top: 470px; width: 940px; padding: 44px 30px; text-align: center; font: 400 60px "Archivo Black"; background: var(--w); border: 8px solid var(--k); box-shadow: 14px 14px 0 var(--k); border-radius: 20px; }
.nope { position: absolute; right: -16px; top: -70px; font: 400 80px "Archivo Black"; background: var(--pink); border: 7px solid var(--k); padding: 6px 24px; border-radius: 14px; box-shadow: 8px 8px 0 var(--k); }
.tool { position: absolute; width: 420px; height: 190px; border: 7px solid var(--k); box-shadow: 12px 12px 0 var(--k); border-radius: 18px; padding: 20px 22px; display: flex; flex-direction: column; justify-content: space-between; }
.tool .tn { display: flex; align-items: center; gap: 14px; font: 400 48px "Archivo Black"; }
.tool .td { font: 700 26px "Space Grotesk"; letter-spacing: .02em; background: var(--w); border: 4px solid var(--k); padding: 6px 12px; border-radius: 10px; align-self: flex-start; }
.hub { position: absolute; display: flex; align-items: center; justify-content: center; gap: 14px; font: 400 54px "Archivo Black"; background: var(--coral); border: 8px solid var(--k); box-shadow: 14px 14px 0 var(--k); border-radius: 24px; }
.stk2 { position: absolute; left: 50%; bottom: -46px; margin-left: -190px; width: 380px; text-align: center; font: 400 40px "Archivo Black"; background: var(--y); border: 6px solid var(--k); padding: 6px 0; border-radius: 12px; box-shadow: 6px 6px 0 var(--k); }
.sb { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; width: 920px; padding: 22px 30px; border: 7px solid var(--k); box-shadow: 12px 12px 0 var(--k); border-radius: 18px; }
.sb .who { font: 400 40px "Archivo Black"; background: var(--w); border: 4px solid var(--k); padding: 2px 14px; border-radius: 8px; }
.sb .what { font: 400 66px "Archivo Black"; line-height: 1; }
.file { position: absolute; left: 60px; right: 60px; top: 250px; background: var(--w); border: 8px solid var(--k); box-shadow: 14px 14px 0 var(--k); border-radius: 22px; padding: 26px 34px 30px; }
.fh { display: flex; align-items: center; gap: 16px; font: 400 60px "Archivo Black"; border-bottom: 6px solid var(--k); padding-bottom: 18px; margin-bottom: 14px; }
.fh b { margin-left: auto; font: 400 36px "Archivo Black"; background: var(--blue); color: var(--w); border: 5px solid var(--k); padding: 6px 16px; border-radius: 10px; }
.rule { display: flex; align-items: center; gap: 20px; font: 700 50px "Space Grotesk"; padding: 14px 0; }
.ck { width: 58px; height: 58px; flex: none; display: flex; align-items: center; justify-content: center; background: #2BD47D; border: 5px solid var(--k); border-radius: 12px; }
.endc { z-index: 13; background: radial-gradient(circle, rgba(17,17,17,.16) 3px, transparent 3.5px) 0 0 / 44px 44px, var(--y); }
.dot { display: inline-block; width: .32em; height: .32em; border-radius: 50%; background: var(--coral); margin-right: .25em; vertical-align: .1em; border: 3px solid var(--k); }
.cap { position: absolute; z-index: 14; display: flex; }
.cap .cs { display: inline-block; font: 400 62px "Archivo Black"; line-height: 1.1; background: var(--y); color: var(--k); border: 6px solid var(--k); box-shadow: 9px 9px 0 var(--k); padding: 10px 22px 14px; border-radius: 14px; max-width: 100%; }
.cap .k { background: var(--pink); padding: 0 8px; border-radius: 6px; }
#brand { position: absolute; right: 56px; top: 212px; z-index: 15; font: 400 24px "Archivo Black"; color: var(--y); background: var(--k); padding: 10px 16px; border-radius: 10px; }
`;

const body = html.join("\n") + "\n" + audio + "\n" + sfxTags(seq.sfx, (n) => sfxDur[n] ?? 0.6);
writeComp(COMP, page({ id: ID, duration: DUR, css, body, script: seq.code() }), { id: ID, name: "Short 3 — neo-brutalist pop" });
console.log(`${ID}: ${DUR}s, ${caps.length} captions, ${seq.sfx.length} sfx requested`);
