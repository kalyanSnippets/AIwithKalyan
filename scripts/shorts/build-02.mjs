#!/usr/bin/env node
// Short 2 — "Editing video like editing a document" — style: PAPER EDITORIAL (light mode).
// Newsreader serif + IBM Plex Mono + Inter Tight, paper white / ink / highlighter yellow / red pen.
// The transcript excerpt on screen is real: words.json of the raw CLD_1279 take (a false start,
// a stutter and a retake that the reviewed edit cut), with its real timestamps.
//   node scripts/shorts/build-02.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, W, H, r3, esc, loadShort, phrases, copyMedia, fontFaces, page, writeComp, Seq, sfxTags } from "./lib.mjs";

const ID = "short-02";
const COMP = join(ROOT, "compositions", ID);
const s = loadShort(ID);
const { at } = s;
const END_CARD = 2.0;
const DUR = r3(s.speechEnd + END_CARD);
const icon = (name, color = "#16130F", size = 56, stroke = 2) =>
  readFileSync(join(ROOT, "THUMBNAIL-STUDIO/node_modules/lucide-static/icons", `${name}.svg`), "utf-8")
    .replace(/<!--[\s\S]*?-->/g, "").replace(/\swidth="[^"]*"/, ` width="${size}"`).replace(/\sheight="[^"]*"/, ` height="${size}"`)
    .replace(/\sstroke-width="[^"]*"/, ` stroke-width="${stroke}"`).replace("<svg", `<svg style="color:${color};display:block"`);
const ts = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toFixed(2).padStart(5, "0")}`;

copyMedia(COMP, [
  [join(ROOT, "media/shorts/short-02/cam.mp4"), "cam.mp4"],
  [join(ROOT, "media/shorts/audio/s2-music.mp3"), "music.mp3"],
  ...["typing", "pen", "page", "marker", "scissors", "thud"].map((n) => [join(ROOT, `media/shorts/audio/sfx-${n}.mp3`), `sfx-${n}.mp3`]),
  [join(ROOT, "media/shorts/s2/paper.png"), "paper.png"],
]);
const fonts = fontFaces(COMP, [
  ["Newsreader", "Newsreader-500.woff2", 500], ["Newsreader", "Newsreader-700.woff2", 700], ["Newsreader", "Newsreader-500i.woff2", 500, "italic"],
  ["IBM Plex Mono", "IBMPlexMono-500.woff2", 500], ["Inter Tight", "InterTight-800.woff2", 800], ["Inter Tight", "InterTight-600.woff2", 600],
]);

const T = {
  hookOut: 1.9, pip1: at("So next,") - 0.1, scribe: at("ElevenLabs to"), next: at("So next,"),
  page2: at("Now Claude can see") - 0.15, word: at("every word,"), pause: at("every pause,"), mistake: at("every mistake,"), retake: at("every retake"),
  example: at("For example,"), messed: at("messed up"), properly: at("properly."), sameLine: at("said the same"),
  identify: at("Claude could identify"), both: at("both versions,"),
  full1: at("so suddenly editing") - 0.2, edVid: at("editing the video"), doc: at("editing a document."), docWord: at("document."),
  pip2: at("Before making any cuts,") - 0.2, plan: at("create an edit plan."),
  rule: at("one important rule"), dont: at("don't remove every pause"),
  full2: at("because fast editing") - 0.2, fast: at("fast editing"), robot: at("robot."),
  pip3: at("Keep the pauses") - 0.2, natural: at("natural or"), emotional: at("emotional."),
  orig: at("The original clip"), fifty: at("fifty seconds."), after: at("After the plan cuts,"), fortyOne: at("forty-one seconds."),
  approved: at("approved the plan,"), ffmpeg: at("FFmpeg"), rough: at("rough cut."),
  endCard: s.speechEnd,
};

// camera: FULL ↔ PiP polaroid (transforms only)
const PS = 0.29;
const FULL = { x: 0, y: 0, scale: 1, rotation: 0, borderWidth: 0, borderRadius: 0 };
const PIP = { x: 62, y: 1000, scale: PS, rotation: -2.5, borderWidth: r3(16 / PS), borderRadius: r3(6 / PS) };
const modes = [[0, "full"], [T.pip1, "pip"], [T.full1, "full"], [T.pip2, "pip"], [T.full2, "full"], [T.pip3, "pip"]];
const modeAt = (t) => { let m = "full"; for (const [a, k] of modes) if (t >= a - 1e-6) m = k; return m; };
const seq = new Seq();
modes.forEach(([t, m], i) => i === 0 ? seq.set("#camwrap", FULL, 0) : seq.to("#camwrap", { ...(m === "pip" ? PIP : FULL), duration: 0.5, ease: "power3.inOut" }, t));
modes.slice(1).forEach(([t]) => seq.hit(t, "sfx-page.mp3", 0.3));

const html = [];
html.push(`<div id="paper"></div>`);
const camClips = s.clips;
html.push(`<div id="camwrap">${camClips.map((c, i) => `<video id="cam-${i}" class="clip camv" src="media/cam.mp4" playsinline data-has-audio="true" data-start="${c.start}" data-duration="${c.dur}" data-media-start="${r3(c.mediaStart)}" data-track-index="1"></video>`).join("")}<div class="tape"></div></div>`);

// ── HOOK: index card ─────────────────────────────────────────────────────────
html.push(`<div id="hook" class="clip band" data-start="0" data-duration="${T.hookOut + 0.3}" data-track-index="10">
  <div class="card" id="hk-card"><div class="mono sm">NOTE TO SELF</div><div class="nr xl">Editing video</div><div class="nr xl">like a <span class="hl" id="hk-hl">doc?</span></div></div></div>`);
seq.from("#hk-card", { opacity: 1, y: 0, rotation: -2, duration: 0.45, ease: "back.out(1.6)" }, 0.05, { opacity: 0, y: 80, rotation: 4 });
seq.from("#hk-hl", { backgroundSize: "100% 100%", duration: 0.4, ease: "power2.out" }, 0.55, { backgroundSize: "0% 100%" });
seq.hit(0.55, "sfx-marker.mp3", 0.35);
seq.to("#hk-card", { opacity: 0, y: -40, duration: 0.3, ease: "power2.in" }, T.hookOut);

// ── PAGE 1: ElevenLabs transcript with word-level timestamps (typed as spoken) ──
const p1w = s.words.filter((w) => w.t >= T.next - 0.01 && w.t < T.page2 - 0.2);
html.push(`<div id="pg1" class="clip scene" data-start="${r3(T.pip1)}" data-duration="${r3(T.page2 - T.pip1 + 0.4)}" data-track-index="4">
  <div class="doc" id="doc1"><div class="dochead"><span class="file">${icon("file-text", "#16130F", 34)} transcript.txt</span><span class="tab">ElevenLabs Scribe</span></div>
  <div class="mono lbl">word-level timestamps · raw take</div>
  <div class="flow">${p1w.map((w, i) => `<span class="wd" id="p1-${i}"><i>${ts(w.src)}</i>${esc(w.text)}</span>`).join(" ")}</div></div></div>`);
seq.from("#doc1", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, T.pip1 + 0.05, { opacity: 0, y: 60 });
seq.from("#doc1 .tab", { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, T.scribe, { opacity: 0, x: 40 });
p1w.forEach((w, i) => seq.from(`#p1-${i}`, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, w.t, { opacity: 0, y: 10 }));
seq.hit(T.next, "sfx-typing.mp3", 0.3);

// ── PAGE 2: real raw-take excerpt — words, pauses, mistakes, retakes ──────────
const L = [
  { t0: 535.31, words: ["Show", "me", "what", "you", "want", "to", "keep,", { w: "remove…", mis: true }], pause: "1.46 s" },
  { t0: 539.71, words: ["Show", "me", "what", "you", "want,", "what", "to", "keep,", "what", "to", "remove", "or", "shorten."], pause: "2.48 s" },
  { t0: 546.17, words: [{ w: "Claude", mis: true, id: "st" }, { w: "found,", mis: true }, "Claude", "found", "the", "dead", "air."], pause: "6.54 s", take: "A" },
  { t0: 555.71, words: ["Claude", "found", "the", "dead", "air", "at", "the", "beginning."], take: "B" },
];
html.push(`<div id="pg2" class="clip scene" data-start="${r3(T.page2)}" data-duration="${r3(T.full1 - T.page2 + 0.4)}" data-track-index="4">
  <div class="doc" id="doc2"><div class="dochead"><span class="file">${icon("file-text", "#16130F", 34)} transcript.txt</span><span class="tab on">raw take · 8:55–9:18</span></div>
  ${L.map((l, i) => `<div class="ln" id="ln-${i}"><span class="tsl">${ts(l.t0)}</span><span class="tx">${l.words.map((w, k) => { const o = typeof w === "string" ? { w } : w; return `<span class="wd2${o.mis ? " mis" : ""}" id="l${i}w${k}">${esc(o.w)}</span>`; }).join(" ")}</span>
    ${l.pause ? `<span class="pz" id="pz-${i}">⟨ pause ${l.pause} ⟩</span>` : ""}<span class="strike" id="sk-${i}"></span>${l.take ? `<span class="verdict ${l.take === "A" ? "no" : "ok"}" id="vd-${i}">${l.take === "A" ? "✕ take A" : "✓ take B — keep"}</span>` : ""}</div>`).join("")}
  <div class="bracket" id="brk"><span>retake</span></div>
  </div></div>`);
seq.from("#doc2", { opacity: 1, rotationX: 0, duration: 0.5, ease: "power3.out" }, T.page2, { opacity: 0, rotationX: -25 });
L.forEach((_, i) => seq.from(`#ln-${i}`, { opacity: 1, duration: 0.2 }, T.page2 + 0.15 + i * 0.12, { opacity: 0 }));
// every word: a highlighter sweep runs across line 1, word by word
L[0].words.forEach((_, k) => seq.from(`#l0w${k}`, { backgroundColor: "rgba(255,228,92,.85)", duration: 0.05 }, T.word + k * 0.07, { backgroundColor: "rgba(255,228,92,0)" }));
L[0].words.forEach((_, k) => seq.to(`#l0w${k}`, { backgroundColor: "rgba(255,228,92,0)", duration: 0.25 }, T.word + 0.7 + k * 0.03));
seq.hit(T.word, "sfx-marker.mp3", 0.3);
// every pause / every mistake / every retake
seq.from(".pz", { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.08 }, T.pause, { opacity: 0, scale: 0.6 });
seq.from(".mis", { "--ring": 1, color: "#D7362B", duration: 0.3, ease: "power2.out", stagger: 0.1 }, T.mistake, { "--ring": 0, color: "#16130F" });
seq.from("#brk", { opacity: 1, scaleY: 1, duration: 0.35, ease: "power3.out" }, T.retake, { opacity: 0, scaleY: 0 });
seq.hit(T.mistake, "sfx-pen.mp3", 0.3);
// the example: take A struck in red pen, take B kept
seq.from("#sk-2", { scaleX: 1, duration: 0.35, ease: "power2.out" }, T.messed, { scaleX: 0 });
seq.from("#vd-2", { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, T.messed + 0.3, { opacity: 0, x: 30 });
seq.from("#vd-3", { opacity: 1, x: 0, duration: 0.3, ease: "back.out(2)" }, T.properly, { opacity: 0, x: 30 });
seq.to("#ln-0, #ln-1", { opacity: 0.35, duration: 0.3 }, T.example);
seq.hit(T.messed, "sfx-pen.mp3", 0.35);
seq.from("#ln-2, #ln-3", { backgroundColor: "rgba(45,91,215,.10)", duration: 0.3 }, T.both, { backgroundColor: "rgba(45,91,215,0)" });

// ── FULL: "editing a document" (kinetic on a paper strip) ─────────────────────
html.push(`<div id="kinDoc" class="clip band" data-start="${r3(T.edVid - 0.1)}" data-duration="${r3(T.pip2 - T.edVid + 0.3)}" data-track-index="10">
  <div class="strip" id="kd-s"><span class="nr lg">editing video</span><span class="eq" id="kd-eq">=</span><span class="nr lg" id="kd-r"><span class="hl" id="kd-hl">editing a document</span></span></div></div>`);
seq.from("#kd-s", { opacity: 1, y: 0, rotation: -1.5, duration: 0.45, ease: "back.out(1.6)" }, T.edVid - 0.05, { opacity: 0, y: 50, rotation: 3 });
seq.from("#kd-eq, #kd-r", { opacity: 1, duration: 0.3 }, T.doc - 0.1, { opacity: 0 });
seq.from("#kd-hl", { backgroundSize: "100% 100%", duration: 0.45, ease: "power2.out" }, T.docWord - 0.1, { backgroundSize: "0% 100%" });
seq.hit(T.docWord - 0.1, "sfx-marker.mp3", 0.35);
seq.to("#kd-s", { opacity: 0, duration: 0.25 }, T.pip2 - 0.05);

// ── PLAN DOC + sticky rule + approval stamp ──────────────────────────────────
const plan = [["Dead air at the beginning", "CUT", "cut"], ["Long pauses between lines", "SHORTEN", "short"], ["Repeated bad takes", "CUT", "cut"], ["Natural, emotional pauses", "KEEP", "keep"]];
const planEnd = T.full2;
html.push(`<div id="pgPlan" class="clip scene" data-start="${r3(T.pip2)}" data-duration="${r3(planEnd - T.pip2 + 0.4)}" data-track-index="4">
  <div class="doc" id="doc3"><div class="dochead"><span class="file">${icon("clipboard-list", "#16130F", 34)} edit-plan.md</span><span class="tab">before any cut</span></div>
  <div class="nr h2">Edit plan</div>
  ${plan.map(([item, act, cls], i) => `<div class="prow" id="pr-${i}"><span class="box">${icon("check", "#16130F", 30, 3)}</span><span class="nr it">${item}</span><span class="act ${cls}">${act}</span></div>`).join("")}</div>
  <div class="sticky" id="sticky"><div class="mono sm">RULE #1</div><div class="nr st">Don’t remove<br/>every pause.</div></div></div>`);
seq.from("#doc3", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, T.pip2 + 0.05, { opacity: 0, y: 60 });
plan.forEach((_, i) => {
  seq.from(`#pr-${i}`, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, T.plan - 0.6 + i * 0.35, { opacity: 0, x: 40 });
  seq.from(`#pr-${i} .box svg`, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" }, T.plan - 0.4 + i * 0.35, { opacity: 0, scale: 0.3 });
});
seq.hit(T.plan - 0.4, "sfx-pen.mp3", 0.25);
seq.from("#sticky", { opacity: 1, scale: 1, rotation: 4, duration: 0.35, ease: "back.out(2)" }, T.rule, { opacity: 0, scale: 1.4, rotation: 12 });
seq.to("#doc3", { opacity: 0.45, duration: 0.3 }, T.rule);
seq.hit(T.rule, "sfx-thud.mp3", 0.3);

// ── FULL: fast editing ≠ robot ───────────────────────────────────────────────
html.push(`<div id="kinRobot" class="clip band" data-start="${r3(T.fast - 0.1)}" data-duration="${r3(T.pip3 - T.fast + 0.3)}" data-track-index="10">
  <div class="strip" id="kr-s"><span class="nr lg">fast editing</span><span class="eq">≠</span><span class="robot" id="kr-r">${icon("bot", "#16130F", 70, 2)}<span class="nr lg">a robot</span><i id="kr-x"></i></span></div></div>`);
seq.from("#kr-s", { opacity: 1, y: 0, rotation: 1.5, duration: 0.45, ease: "back.out(1.6)" }, T.fast - 0.05, { opacity: 0, y: 50, rotation: -3 });
seq.from("#kr-r", { opacity: 1, duration: 0.3 }, T.robot - 0.35, { opacity: 0 });
seq.from("#kr-x", { scaleX: 1, duration: 0.3, ease: "power2.out" }, T.robot + 0.15, { scaleX: 0 });
seq.hit(T.robot + 0.15, "sfx-pen.mp3", 0.35);
seq.to("#kr-s", { opacity: 0, duration: 0.25 }, T.pip3 - 0.05);

// ── WAVEFORM: cut the dead air, keep the natural pause ───────────────────────
const bars = Array.from({ length: 64 }, (_, i) => { const gapA = i >= 18 && i < 30, gapB = i >= 44 && i < 47; const h = gapA || gapB ? 6 : 20 + Math.round(70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))); return { h, gapA, gapB }; });
html.push(`<div id="pgWave" class="clip scene" data-start="${r3(T.pip3)}" data-duration="${r3(T.approved - T.pip3 + 0.3)}" data-track-index="4">
  <div class="doc wave" id="doc4"><div class="dochead"><span class="file">${icon("audio-lines", "#16130F", 34)} raw.mp4 · audio</span><span class="tab">pauses</span></div>
    <div class="wv">${bars.map((b, i) => `<i class="${b.gapA ? "ga" : b.gapB ? "gb" : ""}" style="height:${b.h * 2}px"></i>`).join("")}<div class="cutbox" id="cutA"><span>${icon("scissors", "#D7362B", 40, 2.4)}dead air</span></div><div class="keepnote" id="keepB">keep —<br/>natural</div></div>
    <div class="nr h2 small" id="counter"><span id="c50">50 s</span><span class="arrow">→</span><span id="c41">41 s</span></div>
    <div class="bar"><i id="barfill"></i></div></div></div>`);
seq.from("#doc4", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, T.pip3 + 0.05, { opacity: 0, y: 60 });
seq.from("#cutA", { opacity: 1, duration: 0.25 }, T.pip3 + 0.6, { opacity: 0 });
seq.to("#doc4 .wv .ga", { scaleY: 0, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.01 }, T.pip3 + 1.2);
seq.hit(T.pip3 + 1.2, "sfx-scissors.mp3", 0.35);
seq.from("#keepB", { opacity: 1, scale: 1, rotation: -4, duration: 0.3, ease: "back.out(2)" }, T.natural, { opacity: 0, scale: 0.6, rotation: -4 });
seq.from("#counter", { opacity: 1, duration: 0.3 }, T.orig, { opacity: 0 });
seq.from("#c50", { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, T.fifty - 0.2, { opacity: 0, y: 20 });
seq.from("#doc4 .bar", { opacity: 1, duration: 0.3 }, T.fifty, { opacity: 0 });
seq.from("#c50", { "--s": 1, duration: 0.3, ease: "power2.out" }, T.after + 0.4, { "--s": 0 });
seq.from("#barfill", { scaleX: 0.82, duration: 1.2, ease: "power2.inOut" }, T.after, { scaleX: 1 });
seq.from("#c41", { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }, T.fortyOne, { opacity: 0, y: 20, scale: 1.3 });
seq.hit(T.after + 0.4, "sfx-pen.mp3", 0.3);

// ── APPROVED → FFmpeg rough cut ──────────────────────────────────────────────
html.push(`<div id="pgApp" class="clip scene" data-start="${r3(T.approved - 0.2)}" data-duration="${r3(T.endCard - T.approved + 0.3)}" data-track-index="5">
  <div class="doc" id="doc5"><div class="dochead"><span class="file">${icon("clipboard-list", "#16130F", 34)} edit-plan.md</span></div>
  <div class="nr h2">Edit plan</div>${plan.map(([item, act, cls]) => `<div class="prow"><span class="box">${icon("check", "#16130F", 30, 3)}</span><span class="nr it">${item}</span><span class="act ${cls}">${act}</span></div>`).join("")}
  <div class="stamp" id="stampA">APPROVED</div></div>
  <div class="reel" id="reel">${icon("film", "#16130F", 46)}<span class="mono">rough_cut.mp4</span><span class="nr">clean rough cut · ~41 s</span><span class="ff">FFmpeg</span></div></div>`);
seq.from("#doc5", { opacity: 1, duration: 0.3 }, T.approved - 0.15, { opacity: 0 });
seq.from("#stampA", { opacity: 1, scale: 1, rotation: -10, duration: 0.25, ease: "back.out(2.6)" }, T.approved + 0.3, { opacity: 0, scale: 2, rotation: -10 });
seq.hit(T.approved + 0.3, "sfx-thud.mp3", 0.4);
seq.to("#doc5", { y: -40, opacity: 0.5, duration: 0.45, ease: "power3.inOut" }, T.ffmpeg - 0.2);
seq.from("#reel", { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, T.ffmpeg - 0.1, { opacity: 0, y: 80 });
seq.from("#reel .ff", { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, T.ffmpeg + 0.2, { opacity: 0, scale: 0.5 });
seq.hit(T.rough, "sfx-scissors.mp3", 0.3);

// ── END CARD ─────────────────────────────────────────────────────────────────
html.push(`<div id="endc" class="clip scene endc" data-start="${T.endCard}" data-duration="${END_CARD}" data-track-index="13">
  <div class="card big" id="ec"><div class="mono sm">CONTINUED IN</div><div class="nr xl">Full video on</div><div class="nr xl"><span class="dot"></span><span class="hl" id="ec-hl">AI with Kalyan</span></div></div></div>`);
seq.from("#ec", { opacity: 1, y: 0, rotation: -1.5, duration: 0.45, ease: "back.out(1.6)" }, T.endCard + 0.05, { opacity: 0, y: 80, rotation: 3 });
seq.from("#ec-hl", { backgroundSize: "100% 100%", duration: 0.45, ease: "power2.out" }, T.endCard + 0.5, { backgroundSize: "0% 100%" });
seq.hit(T.endCard, "sfx-page.mp3", 0.35);

// ── captions: black serif on paper strips ────────────────────────────────────
const hide = [[0, T.hookOut + 0.1], [T.next - 0.1, T.page2 - 0.1], [T.edVid - 0.1, T.pip2], [T.dont - 0.1, T.full2], [T.fast - 0.1, T.pip3], [T.fifty - 0.3, T.approved - 0.1]];
const KEY = /^(claude|elevenlabs|word-level|timestamps|word|pause|mistake|retake|text|sentence|properly|versions|document|plan|rule|pause|robot|natural|emotional|fifty|forty-one|approved|ffmpeg|rough)$/i;
const caps = phrases(s.words).filter((p) => !hide.some(([a, b]) => p.start >= a && p.start < b));
for (const p of caps) for (const [a] of hide) if (a > p.start && a < p.end) p.end = r3(a); // never overlap kinetic text
caps.forEach((p, i) => {
  const m = modeAt(p.start + 0.01);
  const pos = m === "pip" ? `left:440px;top:1230px;width:600px;justify-content:flex-start` : `left:60px;top:1290px;width:960px;justify-content:center`;
  html.push(`<div id="cap-${i}" class="clip cap" data-start="${p.start}" data-duration="${r3(p.end - p.start)}" data-track-index="14" style="${pos}"><span class="cs">${p.words.map((w, k) => `<span id="cw-${i}-${k}" class="${KEY.test(w.text.replace(/[^a-z-]/gi, "")) ? "k" : ""}">${esc(w.text)}</span>`).join(" ")}</span></div>`);
  seq.from(`#cap-${i} .cs`, { opacity: 1, y: 0, rotation: 0, duration: 0.16, ease: "power2.out" }, p.start, { opacity: 0, y: 12, rotation: -1 });
  p.words.forEach((w, k) => seq.from(`#cw-${i}-${k}`, { opacity: 1, duration: 0.08 }, w.t, { opacity: 0.35 }));
});

html.push(`<div id="brand"><span class="dot"></span>AI with Kalyan</div>`);
seq.to("#brand", { opacity: 0, duration: 0.2 }, T.endCard - 0.2);

const mus = [[0, T.endCard, 0.11], [T.endCard, END_CARD, 0.2]];
const audio = mus.map(([a, d, v], i) => `<audio id="mus-${i}" class="clip" src="media/music.mp3" data-start="${r3(a)}" data-duration="${r3(d)}" data-media-start="${r3(a)}" data-volume="${v}" data-track-index="${15 + i}"></audio>`).join("\n");
const sfxDur = { "sfx-typing.mp3": 1.0, "sfx-pen.mp3": 0.74, "sfx-page.mp3": 0.74, "sfx-marker.mp3": 0.62, "sfx-scissors.mp3": 0.62, "sfx-thud.mp3": 0.62 };

const css = `${fonts}
:root { --paper: #F7F4EC; --ink: #16130F; --hl: #FFE45C; --red: #D7362B; --blue: #2D5BD7; --coral: #E8775F; --rule: rgba(45,91,215,.16); }
#stage { background: var(--paper); color: var(--ink); font-family: "Newsreader", serif; }
#paper { position: absolute; inset: 0; background: url(media/paper.png), repeating-linear-gradient(to bottom, transparent 0 71px, var(--rule) 71px 72px), var(--paper); }
#camwrap { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; overflow: hidden; z-index: 5; border: 0 solid #fff; box-shadow: 0 30px 90px rgba(40,30,10,.35); background: #fff; }
.camv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 32%; }
.tape { position: absolute; left: 50%; top: -30px; width: 360px; height: 110px; margin-left: -180px; background: rgba(255,240,170,.75); opacity: 0; }
.scene { position: absolute; inset: 0; z-index: 3; perspective: 1600px; }
.band { position: absolute; left: 0; right: 0; top: 1170px; z-index: 10; display: flex; justify-content: center; }
.nr { font-family: "Newsreader", serif; font-weight: 700; letter-spacing: -0.015em; line-height: 1.04; }
.nr.xl { font-size: 104px; } .nr.lg { font-size: 70px; } .nr.h2 { font-size: 88px; margin: 6px 0 22px; }
.mono { font-family: "IBM Plex Mono", monospace; font-weight: 500; } .mono.sm { font-size: 24px; letter-spacing: .16em; color: rgba(22,19,15,.6); margin-bottom: 8px; }
.hl { background: linear-gradient(transparent 12%, var(--hl) 12%, var(--hl) 88%, transparent 88%) no-repeat 0 0 / 100% 100%; padding: 0 .08em; }
.card { background: #fffdf7; padding: 36px 54px 44px; border-radius: 6px; box-shadow: 0 24px 60px rgba(40,30,10,.35); border-top: 10px solid var(--red); }
.card.big { position: absolute; left: 90px; right: 90px; top: 640px; text-align: center; }
.doc { position: absolute; left: 60px; right: 60px; top: 230px; min-height: 700px; background: #fffdf7; border-radius: 8px; box-shadow: 0 30px 80px rgba(40,30,10,.25), 0 0 0 1px rgba(22,19,15,.06); padding: 34px 44px 40px; }
.dochead { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgba(22,19,15,.12); padding-bottom: 18px; margin-bottom: 20px; }
.dochead .file { display: flex; align-items: center; gap: 12px; font: 600 32px "Inter Tight"; }
.dochead .tab { font: 600 24px "Inter Tight"; background: var(--ink); color: #fff; padding: 8px 16px; border-radius: 30px; }
.dochead .tab.on { background: var(--blue); }
.lbl { font-size: 24px; color: var(--blue); margin-bottom: 24px; letter-spacing: .04em; }
.flow { display: flex; flex-wrap: wrap; gap: 26px 20px; }
.wd { display: inline-flex; flex-direction: column; font: 500 60px "Newsreader"; line-height: 1; }
.wd i { font: 500 20px "IBM Plex Mono"; font-style: normal; color: var(--blue); margin-bottom: 6px; }
.ln { position: relative; padding: 16px 0 16px 150px; border-bottom: 1px dashed rgba(22,19,15,.15); border-radius: 6px; }
.tsl { position: absolute; left: 18px; top: 24px; font: 500 24px "IBM Plex Mono"; color: var(--blue); }
.tx { font: 500 48px "Newsreader"; line-height: 1.25; }
.wd2 { position: relative; border-radius: 6px; padding: 0 2px; --ring: 0; }
.wd2.mis::after { content: ""; position: absolute; inset: -6px -10px; border: 4px solid var(--red); border-radius: 50%; opacity: var(--ring); transform: rotate(-3deg); }
.pz { display: inline-block; margin-top: 8px; font: 500 24px "IBM Plex Mono"; color: #fff; background: rgba(22,19,15,.55); padding: 4px 14px; border-radius: 20px; }
.strike { position: absolute; left: 140px; right: 40px; top: 52px; height: 7px; background: var(--red); border-radius: 4px; transform: scaleX(0); transform-origin: left; }
.verdict { position: absolute; right: 0; bottom: 14px; font: 600 26px "Inter Tight"; padding: 6px 14px; border-radius: 6px; }
.verdict.no { color: var(--red); border: 3px solid var(--red); } .verdict.ok { color: #fff; background: #1f8a4c; }
.bracket { position: absolute; left: 4px; top: 520px; height: 300px; width: 30px; border: 5px solid var(--blue); border-right: 0; border-radius: 12px 0 0 12px; transform-origin: 50% 0; }
.bracket span { position: absolute; left: -12px; top: 120px; transform: rotate(-90deg); transform-origin: left top; font: 600 22px "Inter Tight"; color: var(--blue); }
.margin { position: absolute; right: 30px; top: 470px; font: italic 500 34px "Newsreader"; color: var(--blue); text-align: right; }
.strip { display: inline-flex; align-items: center; gap: 22px; background: #fffdf7; padding: 22px 36px; border-radius: 6px; box-shadow: 0 20px 50px rgba(0,0,0,.35); max-width: 980px; flex-wrap: wrap; justify-content: center; }
.eq { font: 800 80px "Inter Tight"; color: var(--red); }
.robot { position: relative; display: inline-flex; align-items: center; gap: 12px; }
.robot i { position: absolute; left: -10px; right: -10px; top: 50%; height: 8px; background: var(--red); transform-origin: left; border-radius: 4px; }
.prow { display: flex; align-items: center; gap: 22px; padding: 18px 0; border-bottom: 1px dashed rgba(22,19,15,.18); }
.box { width: 52px; height: 52px; border: 3px solid var(--ink); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex: none; }
.it { font-size: 50px; flex: 1; font-weight: 500; }
.act { font: 800 26px "Inter Tight"; letter-spacing: .08em; padding: 8px 14px; border-radius: 6px; }
.act.cut { background: var(--red); color: #fff; } .act.short { background: var(--hl); color: var(--ink); } .act.keep { background: #1f8a4c; color: #fff; }
.sticky { position: absolute; left: 470px; top: 1080px; width: 520px; padding: 30px 34px; background: var(--hl); box-shadow: 0 18px 40px rgba(40,30,10,.35); }
.nr.st { font-size: 68px; }
.wave { min-height: 740px; }
.wv { position: relative; height: 240px; display: flex; align-items: center; gap: 6px; margin: 30px 0 20px; }
.wv i { flex: 1; background: var(--ink); border-radius: 4px; transform-origin: 50% 50%; }
.wv i.ga, .wv i.gb { background: rgba(22,19,15,.25); }
.cutbox { position: absolute; left: 27%; width: 19%; top: -10px; bottom: -10px; border: 4px dashed var(--red); border-radius: 10px; display: flex; align-items: flex-end; justify-content: center; }
.cutbox span { display: flex; align-items: center; gap: 6px; font: 600 24px "Inter Tight"; color: var(--red); background: #fffdf7; padding: 4px 10px; transform: translateY(40px); }
.keepnote { position: absolute; left: 56%; top: -70px; background: var(--hl); padding: 10px 16px; font: italic 500 30px "Newsreader"; box-shadow: 0 8px 20px rgba(40,30,10,.3); }
#counter { display: flex; align-items: baseline; gap: 30px; font-size: 150px; margin-top: 70px; }
#c50 { position: relative; --s: 0; } #c50::after { content: ""; position: absolute; left: -10px; right: -10px; top: 52%; height: 12px; background: var(--red); transform: scaleX(var(--s)); transform-origin: left; border-radius: 6px; }
#c41 { color: var(--blue); } .arrow { font-size: 90px; color: rgba(22,19,15,.5); }
.bar { position: relative; height: 34px; background: rgba(22,19,15,.08); border-radius: 18px; margin-top: 30px; overflow: hidden; }
.bar i { position: absolute; inset: 0; background: var(--ink); border-radius: 18px; transform-origin: left; }
.bar b { position: absolute; right: 16px; top: 3px; color: #fff; mix-blend-mode: difference; }
.stamp { position: absolute; right: 50px; top: 220px; font: 800 70px "Inter Tight"; letter-spacing: .1em; color: var(--blue); border: 8px solid var(--blue); padding: 6px 24px; border-radius: 12px; opacity: .9; }
.reel { position: absolute; left: 60px; right: 60px; top: 760px; background: #fffdf7; border-radius: 10px; box-shadow: 0 24px 60px rgba(40,30,10,.3); padding: 30px 40px; display: grid; grid-template-columns: auto 1fr auto; grid-template-rows: auto auto; column-gap: 24px; align-items: center; border-left: 14px solid var(--ink); }
.reel svg { grid-row: span 2; } .reel .mono { font-size: 34px; } .reel .nr { font-size: 46px; font-weight: 500; grid-column: 2; }
.reel .ff { grid-row: 1 / span 2; grid-column: 3; font: 800 30px "Inter Tight"; background: var(--ink); color: #fff; padding: 10px 18px; border-radius: 8px; }
.endc { z-index: 13; background: url(media/paper.png), var(--paper); }
.dot { display: inline-block; width: .3em; height: .3em; border-radius: 50%; background: var(--coral); margin-right: .25em; vertical-align: .12em; }
.cap { position: absolute; z-index: 14; display: flex; }
.cap .cs { display: inline-block; background: #fffdf7; color: var(--ink); font: 700 60px "Newsreader"; line-height: 1.12; padding: 10px 24px 14px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,.28); max-width: 100%; }
.cap .k { background: linear-gradient(transparent 14%, var(--hl) 14%, var(--hl) 90%, transparent 90%); }
#brand { position: absolute; right: 56px; top: 212px; z-index: 15; font: 600 24px "Inter Tight"; color: var(--ink); background: #fffdf7; padding: 8px 16px; border-radius: 6px; box-shadow: 0 6px 18px rgba(0,0,0,.2); }
`;

const body = html.join("\n") + "\n" + audio + "\n" + sfxTags(seq.sfx, (n) => sfxDur[n] ?? 0.7);
writeComp(COMP, page({ id: ID, duration: DUR, css, body, script: seq.code() }), { id: ID, name: "Short 2 — paper editorial" });
console.log(`${ID}: ${DUR}s, ${caps.length} captions, ${seq.sfx.length} sfx requested`);
