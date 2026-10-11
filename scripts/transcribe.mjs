#!/usr/bin/env node
// Transcribe audio/video with ElevenLabs Scribe — the project's default ASR.
//
//   npm run transcribe -- <file> [--language en] [--speakers 1] [--keyterms "Claude,HyperFrames"]
//                               [--offset 91.711] [--model scribe_v2] [--no-diarize] [--out transcripts/<name>]
//
// Writes into transcripts/<name>/:
//   elevenlabs.json  raw Scribe response (words, spacing, audio events, speakers)
//   words.json       HyperFrames word array [{id,text,start,end,speaker}] — import with
//                    `npx hyperframes transcribe transcripts/<name>/words.json`
//   transcript.txt   plain text, one paragraph per speaker turn
//   captions.srt     sentence-ish caption cues
import { readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { die, elevenlabs, ensureDir, ffmpeg, parseArgs, ROOT } from "./lib/common.mjs";

const { opts, positional } = parseArgs();
const input = positional[0];
if (!input) die("usage: npm run transcribe -- <audio-or-video-file> [options]");
statSync(input); // throws a clear ENOENT if missing

const name = basename(input, extname(input));
const outDir = resolve(opts.out ?? join(ROOT, "transcripts", name));
const offset = Number(opts.offset ?? 0);

const client = await elevenlabs(); // fail fast on a missing key, before extracting audio

// Camera files are multi-GB; send ElevenLabs a lossless mono 16 kHz FLAC of the audio only.
const audio = join(tmpdir(), `${name}-${process.pid}.flac`);
console.log(`extracting audio → ${audio}`);
ffmpeg(["-i", input, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "flac", audio]);

console.log("transcribing with ElevenLabs Scribe…");
let res;
try {
  res = await client.speechToText.convert(
    {
      file: new Blob([readFileSync(audio)], { type: "audio/flac" }),
      modelId: opts.model ?? "scribe_v2",
      languageCode: opts.language,
      diarize: !opts["no-diarize"],
      numSpeakers: opts.speakers ? Number(opts.speakers) : undefined,
      tagAudioEvents: true,
      timestampsGranularity: "word",
      keyterms: opts.keyterms ? String(opts.keyterms).split(",").map((s) => s.trim()) : undefined,
    },
    { timeoutInSeconds: 1800 },
  );
} finally {
  rmSync(audio, { force: true });
}

const round3 = (n) => Math.round(n * 1000) / 1000;
const words = (res.words ?? [])
  .filter((w) => w.type === "word")
  .map((w, i) => ({
    id: `w${i}`,
    text: w.text.trim(),
    start: round3(w.start + offset),
    end: round3(w.end + offset),
    ...(w.speakerId ? { speaker: w.speakerId } : {}),
  }));

writeFileSync(ensureDir(join(outDir, "elevenlabs.json")), JSON.stringify(res, null, 2));
writeFileSync(join(outDir, "words.json"), JSON.stringify(words, null, 2));
writeFileSync(join(outDir, "transcript.txt"), toParagraphs(words));
writeFileSync(join(outDir, "captions.srt"), toSrt(words));

console.log(
  `done: ${words.length} words, language=${res.languageCode ?? "?"} → ${outDir}`,
);

function toParagraphs(ws) {
  const out = [];
  let cur = null;
  for (const w of ws) {
    if (!cur || cur.speaker !== w.speaker) out.push((cur = { speaker: w.speaker, text: [] }));
    cur.text.push(w.text);
  }
  return out
    .map((p) => `${p.speaker ? `[${p.speaker}] ` : ""}${p.text.join(" ")}`)
    .join("\n\n") + "\n";
}

function toSrt(ws, maxChars = 42, maxDur = 3.5, maxGap = 0.6) {
  const cues = [];
  let cue = null;
  for (const w of ws) {
    const text = cue ? `${cue.text} ${w.text}` : w.text;
    const breakHere =
      !cue ||
      text.length > maxChars ||
      w.end - cue.start > maxDur ||
      w.start - cue.end > maxGap ||
      /[.!?]$/.test(cue.text);
    if (breakHere) cues.push((cue = { start: w.start, end: w.end, text: w.text }));
    else Object.assign(cue, { end: w.end, text });
  }
  const ts = (s) => {
    const ms = Math.round(s * 1000);
    const p = (n, l = 2) => String(n).padStart(l, "0");
    return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
  };
  return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
}
