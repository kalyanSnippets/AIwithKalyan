#!/usr/bin/env node
// Screenshot a page scrolled to a piece of evidence, and print where that text sits,
// so a highlight box can land exactly on it in a composition.
//
//   node scripts/proof-shot.mjs <url> "<text to find>" <out.png> [--dismiss "Accept all|Close"] [--block center|start]
//
// Viewport is 1600x900 CSS px at 1.5x (2400x1350 PNG). The printed box is in CSS px of that viewport.
// Log the page in media/broll/SOURCES.md with `npm run broll` as usual.
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const dismiss = opt("--dismiss") ?? "";
const block = opt("--block") ?? "center";
const [url, text, out] = args;
if (!url || !text || !out) { console.error("usage: node scripts/proof-shot.mjs <url> <text> <out.png> [--dismiss labels] [--block center|start]"); process.exit(1); }

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium", ...(proxy ? { proxy: { server: proxy } } : {}) });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: "load", timeout: 60_000 });
await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
await page.waitForTimeout(1500);
for (const label of dismiss.split("|").map((x) => x.trim()).filter(Boolean)) {
  const t = page.getByRole("button", { name: label }).or(page.getByLabel(label)).first();
  if (await t.isVisible().catch(() => false)) { await t.click().catch(() => {}); await page.waitForTimeout(600); }
}
const el = page.getByText(text, { exact: false }).first();
await el.evaluate((e, b) => e.scrollIntoView({ block: b }), block);
await page.waitForTimeout(700);
const box = await el.boundingBox();
await page.screenshot({ path: out });
console.log(JSON.stringify({ url, text, box: box && Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v)])) }));
await browser.close();
