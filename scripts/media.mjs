#!/usr/bin/env node
// FFmpeg helpers for raw footage.
//
//   npm run media -- probe <file...>                 duration / resolution / codec / fps
//   npm run media -- join <out.mov> <seg01> <seg02>… lossless concat of camera segments (same codec)
//   npm run media -- proxy <in> [out.mp4]           1080p H.264 editing proxy (CRF 20, AAC 192k)
//   npm run media -- audio <in> [out.wav]            48 kHz stereo WAV for mixing
//   npm run media -- frames <in> <outDir> [every=10] contact frames, one per N seconds, for reviewing footage
import { writeFileSync, rmSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { die, ensureDir, ffmpeg, parseArgs, run, ROOT } from "./lib/common.mjs";

const { positional } = parseArgs();
const [cmd, ...args] = positional;
const stem = (f) => basename(f, extname(f));

switch (cmd) {
  case "probe":
    for (const f of args) {
      const info = JSON.parse(
        run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", f], { quiet: true }),
      );
      const v = info.streams.find((s) => s.codec_type === "video");
      const a = info.streams.find((s) => s.codec_type === "audio");
      console.log(
        `${basename(f)}: ${Number(info.format.duration).toFixed(2)}s` +
          (v ? ` | ${v.codec_name} ${v.width}x${v.height} @ ${v.r_frame_rate}` : "") +
          (a ? ` | ${a.codec_name} ${a.sample_rate}Hz ${a.channels}ch` : "") +
          ` | ${(info.format.bit_rate / 1e6).toFixed(1)} Mbps`,
      );
    }
    break;
  case "join": {
    const [out, ...inputs] = args;
    if (!out || inputs.length < 2) die("join needs <out> and at least two inputs");
    const list = join(tmpdir(), `concat-${process.pid}.txt`);
    writeFileSync(list, inputs.map((f) => `file '${resolve(f).replace(/'/g, "'\\''")}'`).join("\n"));
    ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", ensureDir(out)]);
    rmSync(list);
    break;
  }
  case "proxy": {
    const [inp, out = join(ROOT, "media/proxies", `${stem(inp)}.mp4`)] = args;
    ffmpeg(["-i", inp, "-vf", "scale=-2:'min(1080,ih)'", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", ensureDir(out)]);
    break;
  }
  case "audio": {
    const [inp, out = join(ROOT, "media/audio", `${stem(inp)}.wav`)] = args;
    ffmpeg(["-i", inp, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", ensureDir(out)]);
    break;
  }
  case "frames": {
    const [inp, outDir, every = "10"] = args;
    if (!outDir) die("frames needs <in> <outDir>");
    ffmpeg(["-i", inp, "-vf", `fps=1/${every},scale=640:-2`, ensureDir(join(outDir, `${stem(inp)}-%04d.jpg`))]);
    break;
  }
  default:
    die("usage: npm run media -- probe|join|proxy|audio|frames …");
}
