#!/usr/bin/env node
// Generate background music with ElevenLabs Music (instrumental by default).
//
//   npm run music -- "calm lo-fi tech tutorial bed, 90 bpm" [--seconds 60] [--vocals] [--out media/music/bed.mp3]
import { join } from "node:path";
import { die, elevenlabs, parseArgs, ROOT, writeStream } from "./lib/common.mjs";

const { opts, positional } = parseArgs();
const prompt = positional.join(" ");
if (!prompt) die('usage: npm run music -- "<prompt>" [--seconds 60] [--out file.mp3]');

const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "");
const out = opts.out ?? join(ROOT, "media/music", `${slug}.mp3`);
const seconds = Number(opts.seconds ?? 60);
if (seconds < 3 || seconds > 600) die("--seconds must be between 3 and 600");

const client = await elevenlabs();
console.log(`composing ${seconds}s of music…`);
const audio = await client.music.compose(
  { prompt, musicLengthMs: seconds * 1000, forceInstrumental: !opts.vocals },
  { timeoutInSeconds: 600 },
);
await writeStream(audio, out);
console.log(`saved ${out}`);
