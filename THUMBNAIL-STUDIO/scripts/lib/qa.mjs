// Automated QA for rendered thumbnails: dimensions, file existence, text size at mobile scale,
// text/background contrast, word count, text vs face overlap, YouTube timestamp safe zone and
// blank/placeholder detection. These are measurable facts, not CTR predictions.
import { existsSync, statSync } from "node:fs";
import sharp from "sharp";
import { W, H } from "./render.mjs";

export const MOBILE_W = 320; // ≈ thumbnail width in a phone feed / search row
export const MIN_HEADLINE_PX = 64; // at 1280 wide → 16 px at 320 wide
export const MIN_TEXT_PX = 40; // any text: 10 px at 320 wide
export const MIN_CONTRAST = 4.5;
export const TIMESTAMP_ZONE = { x: W - 190, y: H - 80, w: 190, h: 80 }; // YouTube duration badge

const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export const parseRgb = (s) => {
  const h = String(s ?? "").trim().match(/^#([0-9a-f]{6})$/i);
  if (h) return [0, 2, 4].map((i) => parseInt(h[1].slice(i, i + 2), 16));
  return (String(s ?? "").match(/\d+(\.\d+)?/g) ?? [255, 255, 255]).slice(0, 3).map(Number);
};
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

export async function imageInfo(path) {
  if (!existsSync(path)) return { exists: false };
  const m = await sharp(path).metadata();
  const st = await sharp(path).stats();
  return { exists: true, width: m.width, height: m.height, format: m.format, bytes: statSync(path).size, stdev: st.channels.slice(0, 3).reduce((s, c) => s + c.stdev, 0) / 3 };
}

/** Median colour of the background behind a box (taken from the text-free render). */
async function bgColor(noTextPng, b) {
  const x = Math.max(0, Math.min(W - 2, b.x)), y = Math.max(0, Math.min(H - 2, b.y));
  const w = Math.max(1, Math.min(W - x, b.w)), h = Math.max(1, Math.min(H - y, b.h));
  const { channels } = await sharp(noTextPng).extract({ left: x, top: y, width: w, height: h }).stats();
  return channels.slice(0, 3).map((c) => c.mean);
}

/**
 * @returns {{pass:boolean, checks:Array<{name:string, pass:boolean, detail:string, severity:"error"|"warn"}>, metrics:object}}
 */
export async function qaRender({ png, noText, layout, spec }) {
  const checks = [];
  const add = (name, pass, detail, severity = "error") => checks.push({ name, pass, detail, severity });
  const info = await imageInfo(png);
  add("export exists", info.exists, info.exists ? `${info.bytes} bytes` : `missing ${png}`);
  if (!info.exists) return { pass: false, checks, metrics: {} };
  add("dimensions 1280x720", info.width === W && info.height === H, `${info.width}x${info.height}`);
  add("format png", info.format === "png", info.format);
  add("not blank", info.stdev > 12, `pixel stdev ${info.stdev.toFixed(1)} (blank/placeholder images are near 0)`);

  const texts = layout.filter((l) => l.type === "text" && l.text?.trim());
  const words = String(spec.headline ?? "").trim().split(/\s+/).filter(Boolean).length;
  add("headline 0–4 words", words <= 4, `${words} words: "${spec.headline}"`, "warn");
  const textWords = texts.reduce((s, t) => s + t.text.trim().split(/\s+/).length, 0);
  add("total text ≤ 8 words", textWords <= 8, `${textWords} words across ${texts.length} text layers`, "warn");

  const metrics = { texts: [] };
  for (const t of texts) {
    const isHeadline = t.role === "headline";
    const min = isHeadline ? MIN_HEADLINE_PX : MIN_TEXT_PX;
    const mobilePx = +(t.fontSize * MOBILE_W / W).toFixed(1);
    add(`text size "${t.text.trim().slice(0, 24)}"`, t.fontSize >= min, `${t.fontSize}px → ${mobilePx}px on a ${MOBILE_W}px-wide mobile thumbnail (min ${min}px)`, isHeadline ? "error" : "warn");
    // a text layer with its own pill/background is measured against that pill, not the image
    const own = (spec.layers ?? []).find((l) => (l.id ?? "") === t.id)?.bg?.color;
    const bg = own && !/rgba\([^)]*,\s*0?\.[0-6]\d*\)/.test(own) ? parseRgb(own) : await bgColor(noText, t.box);
    const c = contrast(parseRgb(t.color), bg);
    add(`contrast "${t.text.trim().slice(0, 24)}"`, c >= MIN_CONTRAST, `${c.toFixed(2)}:1 vs background rgb(${bg.map(Math.round).join(",")}) (min ${MIN_CONTRAST}:1; strokes/shadows not counted)`, "warn");
    add(`inside frame "${t.text.trim().slice(0, 24)}"`, t.box.x >= 8 && t.box.y >= 8 && t.box.x + t.box.w <= W - 8 && t.box.y + t.box.h <= H - 8, `box ${JSON.stringify(t.box)}`);
    add(`clear of timestamp "${t.text.trim().slice(0, 24)}"`, overlap(t.box, TIMESTAMP_ZONE) === 0, "bottom-right duration badge area", "warn");
    metrics.texts.push({ text: t.text.trim(), fontSize: t.fontSize, mobilePx, contrast: +c.toFixed(2) });
  }
  // a face layer declares where the face sits on the canvas (faceBox); the cutout's full box
  // includes shoulders and empty margins, which text may legitimately overlap
  const faces = (spec.layers ?? []).filter((l) => l.faceBox).map((l) => ({ box: l.faceBox }));
  for (const f of faces) for (const t of texts) {
    const o = overlap(f.box, t.box) / Math.max(1, t.box.w * t.box.h);
    add(`text off face "${t.text.trim().slice(0, 16)}"`, o < 0.15, `${(o * 100).toFixed(0)}% of the text box overlaps the face box`);
  }
  const focal = layout.filter((l) => l.role === "focal" || l.role === "face");
  add("one focal point", focal.length >= 1 && focal.length <= 2, `${focal.length} layers marked focal/face`, "warn");
  const errors = checks.filter((c) => !c.pass && c.severity === "error");
  return { pass: errors.length === 0, checks, metrics };
}
