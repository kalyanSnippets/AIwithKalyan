// Bakes the soft glow backgrounds into PNGs (CSS radial gradients count as heavy overlays and
// can make HyperFrames capture black frames). Run from this directory: node make-bg.mjs
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
const exe = execSync("npx hyperframes browser path 2>/dev/null || true").toString().trim().split("\n").pop();
const b = await chromium.launch(exe && exe.startsWith("/") ? { executablePath: exe } : {});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const bgs = {
  "bg-scene": "radial-gradient(1100px 700px at 70% 25%, rgba(232,119,95,0.32), transparent 70%), radial-gradient(900px 800px at 15% 90%, rgba(110,120,255,0.30), transparent 70%), #0a0a11",
  "bg-backdrop": "radial-gradient(900px 600px at 78% 20%, rgba(232,119,95,0.30), transparent 70%), radial-gradient(800px 700px at 20% 85%, rgba(110,120,255,0.26), transparent 70%), #0b0b12",
  "bg-solid": "radial-gradient(900px 600px at 50% 40%, rgba(232,119,95,0.35), transparent 70%), #0b0b12",
  "bg-ann": "radial-gradient(1000px 700px at 50% 45%, rgba(232,119,95,0.45), transparent 70%), #07070c",
};
for (const [n, css] of Object.entries(bgs)) {
  await p.setContent(`<body style="margin:0"><div style="width:1920px;height:1080px;background:${css}"></div></body>`);
  await p.screenshot({ path: `media/${n}.png` });
}
await b.close();
