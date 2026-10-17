// Layered thumbnail spec → HTML → 1280x720 PNG.
//
// A concept spec (projects/<ID>/concepts/<OPT>.json) keeps every element as a separate, editable
// layer: fills, images, shapes, icons and text. The same layers drive the PNG render, the QA
// measurements and the Canva build plan.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { launch } from "./browser.mjs";
import { STUDIO, resolveAsset } from "./paths.mjs";

export const W = 1280, H = 720;
const LAYER_TYPES = ["fill", "image", "shape", "text", "icon", "html"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Returns a list of problems; empty means the spec can be rendered. */
export function validateSpec(spec, projectId) {
  const errs = [];
  if (!spec || typeof spec !== "object") return ["spec is not an object"];
  for (const k of ["option", "archetype", "headline", "layers"]) if (spec[k] === undefined) errs.push(`missing "${k}"`);
  if (!Array.isArray(spec.layers) || !spec.layers.length) errs.push("layers must be a non-empty array");
  (spec.layers ?? []).forEach((l, i) => {
    const at = `layer ${i}${l?.id ? ` (${l.id})` : ""}`;
    if (!LAYER_TYPES.includes(l?.type)) errs.push(`${at}: unknown type "${l?.type}"`);
    if (["image", "shape", "icon", "html"].includes(l?.type) && [l.x, l.y, l.w, l.h].some((v) => typeof v !== "number")) errs.push(`${at}: needs numeric x, y, w, h`);
    if (l?.type === "text" && (typeof l.text !== "string" || typeof l.x !== "number" || typeof l.y !== "number" || typeof l.size !== "number")) errs.push(`${at}: text needs text, x, y, size`);
    if (l?.type === "image") {
      if (!l.src) errs.push(`${at}: image needs src`);
      else if (projectId && !/^(https?:|data:)/.test(l.src) && !existsSync(resolveAsset(projectId, l.src))) errs.push(`${at}: missing asset ${l.src}`);
    }
    if (l?.type === "icon" && !existsSync(iconPath(l.name ?? ""))) errs.push(`${at}: unknown icon "${l.name}"`);
  });
  const words = String(spec.headline ?? "").trim().split(/\s+/).filter(Boolean).length;
  if (words > 6) errs.push(`headline has ${words} words (max 6; 0–4 preferred)`);
  return errs;
}

const iconPath = (name) => join(STUDIO, "node_modules/lucide-static/icons", `${name}.svg`);
function iconSvg(name, color, stroke) {
  return readFileSync(iconPath(name), "utf-8").replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<svg[^>]*?>/, (m) => m.replace(/\swidth="[^"]*"/, ' width="100%"').replace(/\sheight="[^"]*"/, ' height="100%"').replace(/\sstroke-width="[^"]*"/, ` stroke-width="${stroke}"`).replace("<svg", `<svg style="color:${color}"`));
}

function box(l) {
  const t = [];
  if (l.rotate) t.push(`rotate(${l.rotate}deg)`);
  if (l.flip) t.push("scaleX(-1)");
  return `left:${l.x}px;top:${l.y}px;${l.w !== undefined ? `width:${l.w}px;` : ""}${l.h !== undefined ? `height:${l.h}px;` : ""}${t.length ? `transform:${t.join(" ")};` : ""}${l.opacity !== undefined ? `opacity:${l.opacity};` : ""}${l.z !== undefined ? `z-index:${l.z};` : ""}`;
}

function layerHtml(projectId, l, i) {
  const id = l.id ?? `l${i}`;
  const data = `data-id="${esc(id)}" data-type="${l.type}" data-role="${esc(l.role ?? "")}"`;
  switch (l.type) {
    case "fill":
      return `<div class="L" ${data} style="inset:0;background:${l.background};"></div>`;
    case "image": {
      const src = /^(https?:|data:)/.test(l.src) ? l.src : pathToFileURL(resolveAsset(projectId, l.src)).href;
      return `<div class="L" ${data} style="${box(l)}border-radius:${l.radius ?? 0}px;overflow:${l.overflow ?? "hidden"};${l.border ? `border:${l.border};` : ""}${l.shadow ? `box-shadow:${l.shadow};` : ""}${l.css ?? ""}"><img src="${src}" style="width:100%;height:100%;object-fit:${l.fit ?? "cover"};object-position:${l.position ?? "center"};${l.filter ? `filter:${l.filter};` : ""}${l.imgCss ?? ""}"/></div>`;
    }
    case "shape":
      return `<div class="L" ${data} style="${box(l)}background:${l.background ?? "transparent"};border-radius:${l.radius ?? 0}px;${l.border ? `border:${l.border};` : ""}${l.shadow ? `box-shadow:${l.shadow};` : ""}${l.css ?? ""}">${l.inner ?? ""}</div>`;
    case "icon":
      return `<div class="L" ${data} style="${box(l)}${l.css ?? ""}">${iconSvg(l.name, l.color ?? "#fff", l.stroke ?? 2)}</div>`;
    case "html":
      return `<div class="L" ${data} style="${box(l)}${l.css ?? ""}">${l.html}</div>`;
    case "text": {
      const font = { display: "'TS Display'", heavy: "'TS Heavy'", bold: "'TS Bold'", sans: "'TS Sans'" }[l.font ?? "display"];
      let inner = esc(l.text);
      for (const h of l.highlight ?? []) inner = inner.replace(esc(h.word), `<span style="color:${h.color};${h.bg ? `background:${h.bg};padding:0 .12em;border-radius:.12em;` : ""}">${esc(h.word)}</span>`);
      inner = inner.replace(/\n/g, "<br/>");
      const stroke = l.stroke ? `-webkit-text-stroke:${l.stroke.width}px ${l.stroke.color};paint-order:stroke fill;` : "";
      const bg = l.bg ? `background:${l.bg.color};padding:${l.bg.padY ?? 6}px ${l.bg.padX ?? 18}px;border-radius:${l.bg.radius ?? 12}px;` : "";
      return `<div class="L T" ${data} style="${box(l)}font-family:${font};font-size:${l.size}px;line-height:${l.lineHeight ?? 0.95};letter-spacing:${l.letterSpacing ?? "-0.02em"};color:${l.color ?? "#fff"};text-align:${l.align ?? "left"};${l.uppercase ? "text-transform:uppercase;" : ""}${l.shadow ? `text-shadow:${l.shadow};` : ""}${stroke}${l.css ?? ""}"><span class="tx" style="${bg}display:inline-block;">${inner}</span></div>`;
    }
  }
  return "";
}

export function specToHtml(projectId, spec, { hideText = false } = {}) {
  const f = (n) => pathToFileURL(join(STUDIO, "brand/fonts", n)).href;
  const layers = spec.layers.map((l, i) => (hideText && l.type === "text" ? "" : layerHtml(projectId, l, i))).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'TS Display';src:url('${f("InterDisplay-Black.otf")}');}
@font-face{font-family:'TS Heavy';src:url('${f("InterDisplay-ExtraBold.otf")}');}
@font-face{font-family:'TS Bold';src:url('${f("InterDisplay-Bold.otf")}');}
@font-face{font-family:'TS Sans';src:url('${f("Inter-SemiBold.otf")}');}
html,body{margin:0;background:#000;}
#stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#0b0b12;}
.L{position:absolute;box-sizing:border-box;}
.T{white-space:pre;}
</style></head><body><div id="stage">${layers}</div></body></html>`;
}

/**
 * Render a spec. Writes <out>.png (1280x720) and returns layout metrics for every layer
 * (bounding boxes, font sizes) plus a text-free render used for contrast checks.
 */
export async function renderSpec(projectId, spec, outPng, { browser } = {}) {
  const errs = validateSpec(spec, projectId);
  if (errs.length) throw new Error(`spec ${spec?.option ?? "?"} invalid:\n- ${errs.join("\n- ")}`);
  mkdirSync(dirname(outPng), { recursive: true });
  const own = !browser;
  browser ??= await launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const htmlPath = outPng.replace(/\.png$/, ".html");
    writeFileSync(htmlPath, specToHtml(projectId, spec));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
    if (broken.length) throw new Error(`images failed to load: ${broken.join(", ")}`);
    const layout = await page.evaluate(() => [...document.querySelectorAll(".L")].map((el) => {
      const r = (el.querySelector(".tx") ?? el).getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { id: el.dataset.id, type: el.dataset.type, role: el.dataset.role, box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, fontSize: el.dataset.type === "text" ? parseFloat(cs.fontSize) : undefined, color: el.dataset.type === "text" ? cs.color : undefined, text: el.dataset.type === "text" ? el.textContent : undefined };
    }));
    await page.locator("#stage").screenshot({ path: outPng });
    const noText = outPng.replace(/\.png$/, ".notext.png");
    writeFileSync(htmlPath, specToHtml(projectId, spec, { hideText: true }));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.locator("#stage").screenshot({ path: noText });
    writeFileSync(htmlPath, specToHtml(projectId, spec)); // keep the full HTML as an editable source
    await page.close();
    return { png: outPng, noText, html: htmlPath, layout };
  } finally {
    if (own) await browser.close();
  }
}
