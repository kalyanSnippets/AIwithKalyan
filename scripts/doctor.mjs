#!/usr/bin/env node
// Verify every tool the editing pipeline depends on.  `npm run doctor`
// Pass --live to also make a (free) authenticated ElevenLabs API call.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, ROOT } from "./lib/common.mjs";

const { opts } = parseArgs();
let failed = 0;
const check = (label, ok, detail = "", hint = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label.padEnd(26)} ${detail}${!ok && hint ? `\n    → ${hint}` : ""}`);
  if (!ok) failed++;
};
const version = (cmd, args = ["-version"]) => {
  const r = spawnSync(cmd, args, { encoding: "utf-8" });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0].trim() : null;
};

const [major] = process.versions.node.split(".").map(Number);
check("Node.js >= 22", major >= 22, process.version, "install Node 22+");
const ff = version("ffmpeg");
check("FFmpeg", Boolean(ff), ff ?? "", "install ffmpeg (apt install ffmpeg / brew install ffmpeg)");
const fp = version("ffprobe");
check("FFprobe", Boolean(fp), fp ?? "", "ships with ffmpeg");
const hf = version("npx", ["--no-install", "hyperframes", "--version"]);
check("HyperFrames CLI", Boolean(hf), hf ? `v${hf}` : "", "npm install");
const chrome = spawnSync("npx", ["--no-install", "hyperframes", "browser", "path"], { encoding: "utf-8" });
check("Render browser (Chrome)", chrome.status === 0, chrome.stdout.trim().split("\n").pop(), "npx hyperframes browser ensure");

for (const pkg of ["@elevenlabs/elevenlabs-js", "playwright-core"]) {
  check(`npm: ${pkg}`, existsSync(join(ROOT, "node_modules", pkg, "package.json")), "", "npm install");
}
const py = spawnSync("python3", ["-c", "import elevenlabs; print(elevenlabs.__version__)"], { encoding: "utf-8" });
check("python: elevenlabs", py.status === 0, py.stdout.trim(), "pip install elevenlabs (used by HyperFrames media-use TTS)");

const skills = ["hyperframes", "hyperframes-core", "hyperframes-cli", "media-use", "talking-head-recut", "embedded-captions", "motion-graphics", "general-video"];
const missing = skills.filter((s) => !existsSync(join(ROOT, ".claude/skills", s, "SKILL.md")));
check("HyperFrames skills", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${skills.length} key skills present`, "npx hyperframes skills update");

check(".env present", existsSync(join(ROOT, ".env")), "", "cp .env.example .env");
const key = process.env.ELEVENLABS_API_KEY?.trim();
check("ELEVENLABS_API_KEY set", Boolean(key), key ? "set" : "empty", "paste your key from elevenlabs.io → Developers → API Keys into .env");

if (opts.live && key) {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } });
  const body = res.ok ? await res.json() : null;
  check("ElevenLabs API auth", res.ok, body ? `${body.tier} · ${body.character_count}/${body.character_limit} credits used` : `HTTP ${res.status}`);
}

console.log(failed ? `\n${failed} check(s) need attention.` : "\nAll checks passed.");
process.exitCode = failed ? 1 : 0;
