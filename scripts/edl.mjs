#!/usr/bin/env node
// Turn a word-based edit decision list into exact cut times, and optionally
// render the rough cut with FFmpeg.
//
//   npm run edl -- edits/CLD_1279.edl.json                    print stats, kept/removed text
//   npm run edl -- edits/CLD_1279.edl.json --json out.json    write the computed source ranges
//   npm run edl -- edits/CLD_1279.edl.json --render renders/CLD_1279-roughcut.mp4 [--height 1080]
//
// EDL format: spans of inclusive word indices (from transcripts/<name>/words.json, timeline of the
// joined camera segments). Inside a span, gaps longer than rules.maxGap are tightened to
// rules.tightGap unless listed in `preserve` ({wordIndex: pauseSeconds}, pause after that word).
// `segments` is the path prefix of the camera files (sorted = timeline order).
// `hold` keeps N seconds of real footage after the span, `tailPause` sets the pause before the next
// span, `startAt` overrides the span's first cut-in time (for cutting inside a stumble).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { die, ffmpeg, parseArgs, probeDuration, ROOT } from "./lib/common.mjs";

const { opts, positional } = parseArgs();
if (!positional[0]) die("usage: npm run edl -- <edits/name.edl.json> [--json out] [--render out.mp4]");
const edl = JSON.parse(readFileSync(positional[0], "utf-8"));
const words = JSON.parse(readFileSync(resolve(ROOT, edl.transcript), "utf-8"));
const { maxGap, tightGap, lead, tail } = edl.rules;
const r3 = (n) => Math.round(n * 1000) / 1000;

// ── Compute source ranges ──────────────────────────────────────────────────
const ranges = []; // {start, end, span}
edl.spans.forEach((span, si) => {
  const [a, b] = span.words;
  const prevWordEnd = a > 0 ? words[a - 1].end : 0;
  const nextWordStart = b + 1 < words.length ? words[b + 1].start : Infinity;
  const preserve = span.preserve ?? {};
  let start = span.startAt ?? Math.max(words[a].start - lead, prevWordEnd + 0.02, 0);
  for (let i = a; i < b; i++) {
    const gap = words[i + 1].start - words[i].end;
    const keep = preserve[i] ?? tightGap;
    if (gap > Math.max(maxGap, keep)) {
      const before = Math.min(tail, keep / 2 + 0.03);
      ranges.push({ start, end: words[i].end + before, span: si });
      start = words[i + 1].start - (keep - before);
    }
  }
  const tailLen = span.hold ?? (span.tailPause ? span.tailPause - lead : tail);
  ranges.push({ start, end: Math.min(words[b].end + tailLen, nextWordStart - 0.02), span: si });
});
for (const r of ranges) Object.assign(r, { start: r3(r.start), end: r3(r.end) });

const total = ranges.reduce((s, r) => s + r.end - r.start, 0);
const sourceLen = words.at(-1).end;
const kept = new Set(edl.spans.flatMap((s) => Array.from({ length: s.words[1] - s.words[0] + 1 }, (_, k) => s.words[0] + k)));
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;

console.log(`spans: ${edl.spans.length}  cut segments: ${ranges.length}`);
console.log(`words kept: ${kept.size}/${words.length}  removed: ${words.length - kept.size}`);
console.log(`rough cut length: ${fmt(total)}  (source ${fmt(1006.83)})`);

if (opts.removed) {
  let run = [];
  const flush = () => {
    if (run.length) console.log(`- ${fmt(words[run[0]].start)}–${fmt(words[run.at(-1)].end)}  ${run.map((i) => words[i].text).join(" ")}`);
    run = [];
  };
  words.forEach((_, i) => (kept.has(i) ? flush() : run.push(i)));
  flush();
}
if (opts.json) writeFileSync(opts.json, JSON.stringify(ranges, null, 1));

// ── Render ─────────────────────────────────────────────────────────────────
if (opts.render) {
  // Camera segments in timeline order; their durations give each one's offset on the joined timeline.
  const dir = resolve(ROOT, dirname(edl.segments));
  const prefix = edl.segments.split("/").pop();
  const segs = readdirSync(dir).filter((f) => f.startsWith(prefix)).sort().map((f) => join(dir, f));
  const durs = segs.map(probeDuration);
  const segMap = { segs, durs, starts: durs.map((_, i) => durs.slice(0, i).reduce((s, d) => s + d, 0)) };
  const height = Number(opts.height ?? 1080);
  const work = join(ROOT, "media/proxies", `.edl-${process.pid}`);
  mkdirSync(work, { recursive: true });
  // Split ranges that straddle a camera-segment boundary.
  const pieces = [];
  for (const r of ranges) {
    for (let i = 0; i < segMap.segs.length; i++) {
      const s0 = segMap.starts[i], s1 = s0 + segMap.durs[i];
      const a = Math.max(r.start, s0), b = Math.min(r.end, s1);
      if (b - a > 0.02) pieces.push({ file: segMap.segs[i], ss: a - s0, t: b - a });
    }
  }
  // --audio-concat <wav>: replacement audio laid out as every piece's source audio back to back
  // (e.g. a Studio Sound pass over an earlier render's audio); piece k starts at the sum of the
  // exact lengths of pieces 0..k-1.
  let audioOffset = 0;
  const list = [];
  const timeline = [];
  let outT = 0;
  pieces.forEach((p, k) => {
    const out = join(work, `${String(k).padStart(4, "0")}.mov`);
    // Snap every piece to whole frames and force its audio to exactly that length; otherwise the
    // sub-frame differences accumulate across pieces and the sound drifts ahead of the picture.
    const frames = Math.max(1, Math.round(p.t * 25));
    const d = frames / 25;
    const fade = Math.min(0.012, d / 4);
    const audioIn = opts["audio-concat"] ? ["-ss", audioOffset.toFixed(6), "-t", d.toFixed(6), "-i", opts["audio-concat"]] : [];
    process.stdout.write(`\rpiece ${k + 1}/${pieces.length}`);
    ffmpeg([
      "-ss", p.ss.toFixed(3), "-t", (d + 0.2).toFixed(3), "-i", p.file, ...audioIn,
      "-map", "0:v:0", "-map", opts["audio-concat"] ? "1:a:0" : "0:a:0",
      "-vf", `scale=-2:${height}:flags=lanczos,format=yuv420p`, "-r", "25", "-frames:v", String(frames),
      "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "50",
      "-af", `aresample=48000,afade=t=in:d=${fade},apad,atrim=end=${d.toFixed(6)},afade=t=out:st=${(d - fade).toFixed(6)}:d=${fade}`,
      "-ac", "2", "-c:a", "pcm_s24le", "-loglevel", "error", "-nostats", out,
    ]);
    list.push(`file '${out}'`);
    timeline.push({ out: Math.round(outT * 1000) / 1000, src: Math.round((segMap.starts[segMap.segs.indexOf(p.file)] + p.ss) * 1000) / 1000, dur: d });
    outT += d;
    audioOffset += p.t;
  });
  console.log();
  writeFileSync(join(work, "list.txt"), list.join("\n"));
  mkdirSync(dirname(resolve(opts.render)), { recursive: true });
  ffmpeg(["-f", "concat", "-safe", "0", "-i", join(work, "list.txt"), "-c:v", "copy",
    "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", resolve(opts.render)]);
  rmSync(work, { recursive: true, force: true });
  // Source→output map for placing graphics on the rendered timeline.
  writeFileSync(resolve(opts.render).replace(/\.\w+$/, ".timeline.json"), JSON.stringify(timeline, null, 1));
  console.log(`rendered ${opts.render} (${probeDuration(resolve(opts.render)).toFixed(2)} s)`);
}
