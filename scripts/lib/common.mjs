// Shared helpers for the video-editing scripts: .env loading, ElevenLabs
// client, ffmpeg/ffprobe wrappers and tiny CLI-arg parsing.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const envPath = resolve(ROOT, ".env");
if (existsSync(envPath)) process.loadEnvFile(envPath);

export function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export async function elevenlabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) die("ELEVENLABS_API_KEY is empty — add it to .env (see .env.example)");
  const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
  return new ElevenLabsClient({ apiKey });
}

/** Parse `--flag value` / `--flag` / positionals. */
export function parseArgs(argv = process.argv.slice(2)) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const [key, inline] = a.slice(2).split("=", 2);
    if (inline !== undefined) opts[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) opts[key] = argv[++i];
    else opts[key] = true;
  }
  return { opts, positional };
}

export function run(cmd, args, { quiet = false } = {}) {
  const r = spawnSync(cmd, args, { stdio: quiet ? "pipe" : "inherit", encoding: "utf-8" });
  if (r.error) die(`${cmd} failed to start: ${r.error.message}`);
  if (r.status !== 0) die(`${cmd} exited with ${r.status}${quiet ? `\n${r.stderr}` : ""}`);
  return r.stdout;
}

export function ffmpeg(args) {
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-stats", "-y", ...args]);
}

export function probeDuration(file) {
  const out = run(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { quiet: true },
  );
  return Number(out.trim());
}

export function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
  return file;
}

export async function writeStream(stream, file) {
  const { createWriteStream } = await import("node:fs");
  const { Readable } = await import("node:stream");
  const { pipeline } = await import("node:stream/promises");
  const src = stream instanceof ReadableStream ? Readable.fromWeb(stream) : stream;
  await pipeline(src, createWriteStream(ensureDir(file)));
}
