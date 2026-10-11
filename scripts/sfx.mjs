#!/usr/bin/env node
// Generate a sound effect with ElevenLabs.
//
//   npm run sfx -- "soft whoosh transition" [--duration 1.5] [--influence 0.5] [--loop] [--out media/sfx/whoosh.mp3]
import { join } from "node:path";
import { die, elevenlabs, parseArgs, ROOT, writeStream } from "./lib/common.mjs";

const { opts, positional } = parseArgs();
const text = positional.join(" ");
if (!text) die('usage: npm run sfx -- "<description>" [--duration s] [--out file.mp3]');

const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "");
const out = opts.out ?? join(ROOT, "media/sfx", `${slug}.mp3`);

const client = await elevenlabs();
const audio = await client.textToSoundEffects.convert({
  text,
  durationSeconds: opts.duration ? Number(opts.duration) : undefined,
  promptInfluence: opts.influence ? Number(opts.influence) : undefined,
  loop: Boolean(opts.loop),
});
await writeStream(audio, out);
console.log(`saved ${out}`);
