// Shared helpers for the three Shorts builders (scripts/shorts/build-0N.mjs).
// Time axes: cam time (renders/CLD_1279-cam.timeline.json "out") → cam.mp4 time (media/shorts/<id>/cam.map.json)
// → short time (cam.mp4 plus the sample-clip inserts listed in scripts/shorts/edl.json).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const W = 1080, H = 1920, FPS = 25;
export const r3 = (n) => Math.round(n * 1000) / 1000;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");

export function loadShort(id) {
  const edl = JSON.parse(readFileSync(join(ROOT, "scripts/shorts/edl.json"), "utf-8"))[id];
  const map = JSON.parse(readFileSync(join(ROOT, `media/shorts/${id}/cam.map.json`), "utf-8"));
  const pieces = JSON.parse(readFileSync(join(ROOT, "renders/CLD_1279-cam.timeline.json"), "utf-8"));
  const raw = JSON.parse(readFileSync(join(ROOT, "transcripts/CLD_1279/words.json"), "utf-8"));
  const camOf = (src) => { for (const p of pieces) if (src >= p.src - 0.02 && src <= p.src + p.dur + 0.02) return p.out + Math.min(Math.max(src - p.src, 0), p.dur); return null; };
  // Build the short's timeline: cam clips and inserts in order.
  const clips = []; let t = 0, ci = 0;
  for (const it of edl) {
    if (it.cam) { const seg = map.segments[ci++]; clips.push({ kind: "cam", start: r3(t), dur: seg.dur, mediaStart: seg.at, cam: seg.cam }); t += seg.dur; }
    else { const d = r3(it.media[1] - it.media[0]); clips.push({ kind: "insert", src: it.insert, start: r3(t), dur: d, mediaStart: it.media[0] }); t += d; }
  }
  const S = (cam) => { for (const c of clips) if (c.kind === "cam" && cam >= c.cam[0] - 1e-6 && cam <= c.cam[1] + 1e-6) return r3(c.start + cam - c.cam[0]); return null; };
  const words = [];
  for (const w of raw) {
    const cs = camOf(w.start), ce = camOf(w.end);
    if (cs == null || ce == null) continue; // the word's end was cut in the reviewed edit (stutter remnant)
    const s = S(cs); if (s == null) continue;
    const e = ce != null && S(ce) != null ? S(ce) : r3(s + 0.25);
    if (words.length && Math.abs(words.at(-1).t - s) < 0.03) continue; // stutter remnants share a start
    let text = w.text;
    if (!words.length || /[.?!]$/.test(words.at(-1).text)) text = text.charAt(0).toUpperCase() + text.slice(1);
    words.push({ t: s, e: Math.max(e, s + 0.06), text, src: w.start });
  }
  const find = (phrase, from = 0) => {
    const p = phrase.split(/\s+/).map(norm);
    for (let i = from; i <= words.length - p.length; i++) if (p.every((x, k) => norm(words[i + k].text) === x)) return i;
    throw new Error(`${id}: phrase not found: "${phrase}"`);
  };
  const at = (phrase, from) => words[find(phrase, from)].t;
  const end = (phrase, from) => { const i = find(phrase, from); return words[i + phrase.split(/\s+/).length - 1].e; };
  return { id, clips, words, at, end, find, camDur: map.duration, speechEnd: r3(t) };
}

/** Caption phrases: ≤ maxWords, break on punctuation or pauses. */
export function phrases(words, { maxWords = 4, gap = 0.35 } = {}) {
  const out = []; let cur = [];
  const flush = () => { if (cur.length) out.push({ start: cur[0].t, end: cur.at(-1).e, words: cur }); cur = []; };
  for (const w of words) {
    if (cur.length && (w.t - cur.at(-1).e > gap || cur.length >= maxWords)) flush();
    cur.push(w);
    if (/[.?!]$/.test(w.text) || (/[,:;]$/.test(w.text) && cur.length >= 2)) flush();
  }
  flush();
  // hold each phrase until the next starts (max +0.4 s) so captions don't flicker
  out.forEach((p, i) => { const nx = out[i + 1]?.start ?? p.end + 0.4; p.end = r3(Math.min(nx, p.end + 0.4)); });
  return out;
}

export function copyMedia(compDir, files) {
  mkdirSync(join(compDir, "media"), { recursive: true });
  for (const [src, name] of files) { const dst = join(compDir, "media", name ?? basename(src)); if (!existsSync(dst) || readFileSync(src).length !== readFileSync(dst).length) copyFileSync(src, dst); }
  mkdirSync(join(compDir, "vendor"), { recursive: true });
  copyFileSync(join(ROOT, "node_modules/gsap/dist/gsap.min.js"), join(compDir, "vendor/gsap.min.js"));
  mkdirSync(join(compDir, "fonts"), { recursive: true });
}

export function fontFaces(compDir, list) {
  // list: [[family, file, weight, style]]
  return list.map(([fam, file, wt = 400, st = "normal"]) => {
    copyFileSync(join(ROOT, "compositions/shorts-fonts", file), join(compDir, "fonts", file));
    return `@font-face { font-family: "${fam}"; src: url("fonts/${file}") format("woff2"); font-weight: ${wt}; font-style: ${st}; font-display: block; }`;
  }).join("\n");
}

/** Minimal standalone composition document. */
export function page({ id, duration, css, body, script }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<!-- GENERATED by scripts/shorts/build-*.mjs — edit the builder, not this file. -->
<style>
* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
#stage { position: relative; width: 100%; height: 100%; overflow: hidden; }
${css}
</style>
</head>
<body>
<div id="stage" data-composition-id="${id}" data-start="0" data-duration="${duration}" data-fps="${FPS}" data-width="${W}" data-height="${H}">
${body}
<script src="vendor/gsap.min.js"></script>
<script>
(function () {
  const tl = gsap.timeline({ paused: true });
${script}
  window.__timelines["${id}"] = tl;
})();
</script>
</div>
</body>
</html>
`;
}

export function writeComp(compDir, html, meta) {
  mkdirSync(compDir, { recursive: true });
  writeFileSync(join(compDir, "index.html"), html);
  writeFileSync(join(compDir, "meta.json"), JSON.stringify(meta));
}

/** Simple sequencer for GSAP tween lines. */
export class Seq {
  constructor() { this.lines = []; this.sfx = []; }
  add(code) { this.lines.push("  " + code); return this; }
  from(sel, vars, t, fromVars) { return this.add(`tl.fromTo(${JSON.stringify(sel)}, ${JSON.stringify(fromVars)}, ${JSON.stringify(vars)}, ${r3(t)});`); }
  to(sel, vars, t) { return this.add(`tl.to(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r3(t)});`); }
  set(sel, vars, t) { return this.add(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r3(t)});`); }
  hit(t, name, vol = 0.5) { this.sfx.push([r3(t), name, vol]); return this; }
  code() { return this.lines.join("\n"); }
}

/** Sparse SFX (≥ 0.9 s apart) as <audio> clips. */
export function sfxTags(list, durOf) {
  const keep = [];
  for (const s of list.sort((a, b) => a[0] - b[0])) if (!keep.length || s[0] - keep.at(-1)[0] >= 0.9) keep.push(s);
  return keep.map(([t, name, vol], i) => `<audio id="sfx-${i}" class="clip" src="media/${name}" data-start="${t}" data-duration="${durOf(name)}" data-volume="${vol}" data-track-index="${20 + (i % 3)}"></audio>`).join("\n");
}
