#!/usr/bin/env node
// Cut every shot in shots.json into a small muted 1080p clip (media/shots/<id>.mp4) plus a first/mid/last
// still (media/shots/<id>-{a,m,z}.jpg) for freeze frames. Also stages music, SFX, outro voice and stills.
//   node compositions/GTA6/prep.mjs [--force]
import { existsSync, mkdirSync, readFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const force = process.argv.includes("--force");
const shots = JSON.parse(readFileSync(join(HERE, "shots.json"), "utf-8"));
const out = join(HERE, "media/shots");
mkdirSync(out, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
for (const [id, s] of Object.entries(shots)) {
  if (id.startsWith("_")) continue;
  const src = join(ROOT, "GTA6/media/proxies/broll", `${s.src}.mp4`);
  const dst = join(out, `${id}.mp4`);
  // letterbox bars vary per shot: detect the active picture on this shot and crop to it
  let cd = null;
  try { cd = execFileSync("sh", ["-c", `ffmpeg -hide_banner -ss ${s.t0} -i "${src}" -t ${Math.min(1.5, s.t1 - s.t0)} -vf cropdetect=24:2:0 -f null - 2>&1 | grep -oE 'crop=[0-9:]+' | sort | uniq -c | sort -rn | head -1 | grep -oE 'crop=[0-9:]+'`]).toString().trim(); } catch {}
  const bars = cd && cd !== "crop=1920:1080:0:0" ? `${cd},` : "";
  const crop = bars + (s.crop ? `crop=iw/${s.crop}:ih/${s.crop},` : "");
  const vf = `${crop}scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30000/1001,format=yuv420p`;
  if (force || !existsSync(dst)) ff(["-ss", String(s.t0), "-i", src, "-t", String(s.t1 - s.t0), "-an", "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-g", "15", dst]);
  const d = s.t1 - s.t0;
  for (const [k, t] of [["a", 0.03], ["m", d / 2], ["z", Math.max(0, d - 0.08)]]) {
    const j = join(out, `${id}-${k}.jpg`);
    if (force || !existsSync(j)) ff(["-ss", String(t), "-i", dst, "-frames:v", "1", "-q:v", "3", j]);
  }
  console.log("shot", id, d.toFixed(2));
}
// audio + stills
const stage = [
  ["GTA6/media/voiceover/outro_v1.mp3", "outro-voice.mp3"],
  ["GTA6/media/music/m1_hook.mp3", "m1.mp3"], ["GTA6/media/music/m2_explain.mp3", "m2.mp3"],
  ["GTA6/media/music/m3_future.mp3", "m3.mp3"], ["GTA6/media/music/m4_resolve.mp3", "m4.mp3"],
  ["GTA6/media/sfx/whoosh.mp3", "sfx-whoosh.mp3"], ["GTA6/media/sfx/pop.mp3", "sfx-pop.mp3"], ["GTA6/media/sfx/tick.mp3", "sfx-tick.mp3"],
  ["GTA6/media/broll/web/gamesradar_zero_genai_headline.png", "gamesradar.png"],
  ["GTA6/media/broll/rockstar_stills/GTAVI_Screenshots/People/Jason Duval", null],
];
for (const [a, b] of stage) if (b) copyFileSync(join(ROOT, a), join(HERE, "media", b));
// Jason / Lucia portraits (first image of each official screenshot folder), scaled to 1080p
for (const [who, dir] of [["jason", "Jason Duval"], ["lucia", "Lucia Caminos"]]) {
  const d = join(ROOT, "GTA6/media/broll/rockstar_stills/GTAVI_Screenshots/People", dir);
  const f = execFileSync("ls", [d]).toString().split("\n").filter((x) => /\.(jpg|png)$/i.test(x))[0];
  ff(["-i", join(d, f), "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080", "-q:v", "3", join(HERE, "media", `${who}.jpg`)]);
  console.log("still", who, f);
}
