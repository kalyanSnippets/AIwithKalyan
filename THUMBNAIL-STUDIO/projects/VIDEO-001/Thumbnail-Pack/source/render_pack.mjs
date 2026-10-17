// Renders the Thumbnail-Pack specs with the studio renderer, runs QA, and builds the comparison sheet.
// Run from the studio root:  node projects/VIDEO-001/Thumbnail-Pack/source/render_pack.mjs [file-stem…]
import { readFileSync, readdirSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderSpec } from "../../../../scripts/lib/render.mjs";
import { qaRender } from "../../../../scripts/lib/qa.mjs";
import { contactSheet, mobileSheet } from "../../../../scripts/lib/sheet.mjs";
import { launch } from "../../../../scripts/lib/browser.mjs";

const PACK = new URL("..", import.meta.url).pathname;
const SPECS = join(PACK, "source/specs"), RENDER = join(PACK, "source/render");
mkdirSync(RENDER, { recursive: true });
const only = process.argv.slice(2);
const files = readdirSync(SPECS).filter((f) => f.endsWith(".json")).sort();
const browser = await launch();
const items = [];
try {
  for (const f of files) {
    const spec = JSON.parse(readFileSync(join(SPECS, f), "utf-8"));
    const stem = f.replace(/\.json$/, "");
    const png = join(RENDER, stem + ".png");
    if (!only.length || only.includes(stem)) {
      const r = await renderSpec("VIDEO-001", spec, png, { browser });
      const qa = await qaRender({ ...r, spec });
      writeFileSync(join(RENDER, stem + ".qa.json"), JSON.stringify(qa, null, 1));
      copyFileSync(png, join(PACK, stem + ".png"));
      const bad = qa.checks.filter((c) => !c.pass);
      console.log(`${stem}: ${qa.pass ? "PASS" : "FAIL"}${bad.length ? "\n  " + bad.map((c) => `[${c.severity}] ${c.name}: ${c.detail ?? ""}`).join("\n  ") : ""}`);
    }
    items.push({ png: join(PACK, stem + ".png"), label: `${spec.option} · ${spec.archetype}`, sub: spec.headline });
  }
} finally { await browser.close(); }
await contactSheet(items, join(PACK, "thumbnail-comparison.png"), { cols: 3, cellW: 640, title: "VIDEO-001 Thumbnail Pack: five concepts, 1280×720" });
await mobileSheet(items.map((i) => ({ ...i, label: i.label.split(" · ")[0] })), join(PACK, "source/mobile-feed.png"));
console.log("sheets written");
