// Records a REAL run of REA Board in headless Chromium (real mouse events, real HTML5 drag and drop).
// usage: node record-board-demo.mjs <url> <outDir>
import { chromium } from "playwright-core";
import fs from "node:fs";
const [url = "http://127.0.0.1:4173", outDir = "/tmp/work/board-video"] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: outDir, size: { width: 1920, height: 1080 } }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
// a visible cursor + click ripple (the recording has no OS cursor)
await page.addInitScript(() => {
  const mk = () => {
    const c = document.createElement("div");
    c.style.cssText = "position:fixed;left:0;top:0;width:26px;height:26px;margin:-4px 0 0 -4px;z-index:99999;pointer-events:none;transition:transform .02s";
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 40 40"><path d="M6 4l26 12-11 3-4 11z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, true);
    addEventListener("mousedown", (e) => {
      const r = document.createElement("div");
      r.style.cssText = `position:fixed;left:${e.clientX - 20}px;top:${e.clientY - 20}px;width:40px;height:40px;border-radius:50%;border:3px solid #E8775F;z-index:99998;pointer-events:none;transition:all .5s ease-out;opacity:.9`;
      document.body.appendChild(r); requestAnimationFrame(() => { r.style.transform = "scale(2.2)"; r.style.opacity = "0"; }); setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.body) mk(); else addEventListener("DOMContentLoaded", mk);
});
const sleep = (ms) => page.waitForTimeout(ms);
const center = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
const move = async (x, y, steps = 28) => page.mouse.move(x, y, { steps });
const click = async (loc, pause = 500) => { const p = await center(loc); await move(p.x, p.y); await sleep(150); await page.mouse.down(); await sleep(70); await page.mouse.up(); await sleep(pause); };
const drag = async (from, toX, toY) => {
  const p = await center(from); await move(p.x, p.y); await sleep(250);
  await page.mouse.down(); await sleep(150); await move(p.x + 14, p.y + 10, 6); await move(toX, toY, 40); await sleep(350); await page.mouse.up(); await sleep(700);
};
await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await sleep(2200);
const col = (name) => page.locator(".col", { has: page.locator("h2", { hasText: name }) });
// 1. columns: add, rename, delete
await click(page.locator(".addcol"), 900);
const fresh = page.locator(".col").last();
await click(fresh.locator("button[title='Rename column']"), 400);
await page.keyboard.type("Review", { delay: 90 }); await page.keyboard.press("Enter"); await sleep(1000);
await click(page.locator(".col", { has: page.locator("h2", { hasText: "Review" }) }).locator("button[title='Delete column']"), 1200);
// 2. cards: add, edit, delete
await click(col("To Do").locator(".addcard"), 400);
await page.keyboard.type("Record the intro", { delay: 70 }); await page.keyboard.press("Enter"); await sleep(1000);
const newCard = col("To Do").locator("article", { hasText: "Record the intro" });
await click(newCard, 700);
await click(page.locator(".panel .ptitle"), 200); await page.keyboard.press("End"); await page.keyboard.type(" video", { delay: 80 }); await sleep(600);
// 3. labels + overdue due date + checklist in the side panel
await click(page.locator("button[aria-label='label coral']"), 500); await click(page.locator("button[aria-label='label blue']"), 700);
await page.locator(".panel input[type=date]").fill(new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10)); await sleep(1500);
await click(page.locator("input[placeholder='Add checklist item']"), 200);
for (const t of ["Write the script", "Record", "Edit"]) { await page.keyboard.type(t, { delay: 60 }); await page.keyboard.press("Enter"); await sleep(500); }
await click(page.locator(".panel .ck input[type=checkbox]").first(), 600); await click(page.locator(".panel .ck input[type=checkbox]").nth(1), 1500);
await click(page.locator(".panel button[aria-label='Close']"), 900);
// delete a card
await click(col("Done").locator("article", { hasText: "Pick a name" }), 700);
await click(page.locator(".panel .del"), 1000);
// 4. real mouse drag: To Do -> Doing, then reorder inside Doing
const doing = await col("Doing").boundingBox();
await drag(col("To Do").locator("article", { hasText: "Plan the launch" }), doing.x + 150, doing.y + 130);
const doing2 = await col("Doing").boundingBox();
await drag(col("Doing").locator("article").last(), doing2.x + 150, doing2.y + 70);
await sleep(1200);
// 5. refresh keeps everything
await move(960, 900, 20); await sleep(800);
await page.reload(); await sleep(3200);
await ctx.close(); await browser.close();
console.log("video in", outDir, fs.readdirSync(outDir));
