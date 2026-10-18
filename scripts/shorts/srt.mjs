#!/usr/bin/env node
// Prints an .srt for a Short (every spoken phrase, ≤ 4 words, on the Short's own timeline).
//   node scripts/shorts/srt.mjs short-01 > renders/shorts/short-01.srt
import { loadShort, phrases } from "./lib.mjs";
const s = loadShort(process.argv[2]);
const f = (t) => { const ms = Math.round(t * 1000); const p = (n, w = 2) => String(n).padStart(w, "0"); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
console.log(phrases(s.words).map((p, i) => `${i + 1}\n${f(p.start)} --> ${f(p.end)}\n${p.words.map((w) => w.text).join(" ")}\n`).join("\n"));
