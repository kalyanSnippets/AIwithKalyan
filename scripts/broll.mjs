#!/usr/bin/env node
// Capture source-based B-roll from a web page: a viewport screenshot plus a
// smooth eased-scroll MP4 (rendered by FFmpeg from a full-page capture), and
// append the source to media/broll/SOURCES.md so every clip can be attributed.
//
//   npm run broll -- <url> [--name anthropic-news] [--seconds 6] [--width 1920] [--height 1080] [--still-only]
//                         [--dismiss "Accept all|Close"]   click pop-up buttons (cookie banners, promos) before capturing
import { appendFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { die, ensureDir, ffmpeg, parseArgs, run, ROOT } from "./lib/common.mjs";

const { opts, positional } = parseArgs();
const url = positional[0];
if (!url || !/^https?:\/\//.test(url)) die("usage: npm run broll -- <https://url> [--name slug] [--seconds 6]");

const width = Number(opts.width ?? 1920);
const height = Number(opts.height ?? 1080);
const seconds = Number(opts.seconds ?? 6);
const name = opts.name ?? new URL(url).hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-");
const dir = join(ROOT, "media/broll");
const still = ensureDir(join(dir, `${name}.png`));
const tall = join(dir, `.${name}-full.png`);
const clip = join(dir, `${name}.mp4`);

// Reuse HyperFrames' render browser so no separate Playwright browser install is needed.
const executablePath =
  process.env.CHROME_PATH ||
  run("npx", ["--no-install", "hyperframes", "browser", "path"], { quiet: true }).trim().split("\n").pop();
const { chromium } = await import("playwright-core");
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({ executablePath, ...(proxy ? { proxy: { server: proxy } } : {}) });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const res = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
if (!res?.ok()) die(`could not load ${url} (HTTP ${res?.status() ?? "no response"})`);
await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {}); // busy pages never idle
await page.waitForTimeout(1500);
// Close pop-ups that cover the page: each "|"-separated label is clicked if a visible button or link has it.
for (const label of String(opts.dismiss ?? "").split("|").map((x) => x.trim()).filter(Boolean)) {
  const target = page.getByRole("button", { name: label }).or(page.getByRole("link", { name: label })).or(page.getByLabel(label)).first();
  if (await target.isVisible().catch(() => false)) { await target.click().catch(() => {}); await page.waitForTimeout(600); }
}
const title = await page.title();
await page.screenshot({ path: still });

let scroll = 0;
if (!opts["still-only"]) {
  // Scroll through once so lazy-loaded content renders, then capture up to three viewports.
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const captureHeight = Math.min(pageHeight, height * 3);
  for (let y = 0; y < captureHeight; y += height / 2) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: tall, clip: { x: 0, y: 0, width, height: captureHeight }, fullPage: true });
  scroll = captureHeight - height;
}
await browser.close();

if (!opts["still-only"]) {
  // Eased (cosine) scroll from top to the bottom of the capture; static pan if the page fits.
  const y = scroll > 0 ? `${scroll}*(0.5-cos(PI*min(t/${seconds},1))/2)` : "0";
  ffmpeg(["-loop", "1", "-framerate", "30", "-i", tall, "-t", String(seconds),
    "-vf", `crop=${width}:${height}:0:'${y}',format=yuv420p`, "-c:v", "libx264", "-crf", "18", "-r", "30", clip]);
  rmSync(tall, { force: true });
}

const sources = join(dir, "SOURCES.md");
if (!existsSync(sources)) appendFileSync(sources, "# B-roll sources\n\n| File | Title | URL | Captured |\n|---|---|---|---|\n");
appendFileSync(sources, `| ${name} | ${title.replace(/\|/g, "\\|")} | ${url} | ${new Date().toISOString()} |\n`);
console.log(`saved ${still}${opts["still-only"] ? "" : ` and ${clip}`}`);
