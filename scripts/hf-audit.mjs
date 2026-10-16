// Flags timed clips whose content never becomes visible (e.g. a missing reveal tween).
// Run from a composition directory: node ../../scripts/hf-audit.mjs
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
const exe = execSync("npx hyperframes browser path 2>/dev/null || true").toString().trim().split("\n").pop();
const b = await chromium.launch(exe.startsWith("/") ? { executablePath: exe } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.addInitScript(() => { window.__timelines = {}; });
await p.goto("file://" + process.cwd() + "/index.html");
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const tl = window.__timelines.cld1279, out = [];
  const clips = [...document.querySelectorAll("div.clip[data-start]")].filter((e) => !e.id.startsWith("cap"));
  for (const e of clips) {
    const s = +e.dataset.start, d = +e.dataset.duration;
    // visible "ink" = max opacity product over descendants with content, sampled at 3 points
    let best = 0;
    for (const f of [0.35, 0.55, 0.75]) {
      tl.seek(s + d * f);
      const els = [e, ...e.querySelectorAll("*")];
      for (const x of els) {
        if (x.children.length && x !== e) continue; // leaves only
        let o = 1, n = x; while (n && n !== document.body) { o *= +getComputedStyle(n).opacity; n = n.parentElement; }
        const rc = x.getBoundingClientRect();
        if (rc.width > 2 && rc.height > 2) best = Math.max(best, o);
      }
    }
    if (best < 0.2) out.push(`${e.id} ${e.className} @${s} d=${d} maxOpacity=${best.toFixed(2)}`);
  }
  return out.join("\n") || "all clips show content";
});
console.log(r);
await b.close();
