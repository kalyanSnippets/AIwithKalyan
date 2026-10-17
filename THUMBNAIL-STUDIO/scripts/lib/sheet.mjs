// Contact sheet (all candidates side by side with labels) and a mobile feed preview
// (every candidate at phone size on a YouTube-dark background).
import sharp from "sharp";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** items: [{png, label, sub}] → one sheet image. */
export async function contactSheet(items, out, { cols = 3, cellW = 640, title = "" } = {}) {
  const cellH = Math.round(cellW * 9 / 16), pad = 24, labelH = 64, head = title ? 70 : 0;
  const rows = Math.ceil(items.length / cols);
  const Wt = cols * cellW + (cols + 1) * pad, Ht = head + rows * (cellH + labelH) + (rows + 1) * pad;
  const comps = [];
  if (title) comps.push({ input: Buffer.from(`<svg width="${Wt}" height="${head}"><text x="${pad}" y="46" font-family="Inter" font-weight="800" font-size="30" fill="#fff">${esc(title)}</text></svg>`), left: 0, top: 0 });
  for (const [k, it] of items.entries()) {
    const c = k % cols, r = Math.floor(k / cols);
    const left = pad + c * (cellW + pad), top = head + pad + r * (cellH + labelH + pad);
    comps.push({ input: await sharp(it.png).resize(cellW, cellH).png().toBuffer(), left, top });
    comps.push({ input: Buffer.from(`<svg width="${cellW}" height="${labelH}"><text x="2" y="28" font-family="Inter" font-weight="800" font-size="24" fill="#fff">${esc(it.label)}</text><text x="2" y="54" font-family="Inter" font-size="18" fill="#a9a9b6">${esc(it.sub ?? "")}</text></svg>`), left, top: top + cellH + 4 });
  }
  await sharp({ create: { width: Wt, height: Ht, channels: 3, background: "#0f0f14" } }).composite(comps).png().toFile(out);
  return out;
}

/** Simulated phone feed: each thumbnail at 320x180 with a fake-free title line beneath. */
export async function mobileSheet(items, out) {
  const w = 320, h = 180, pad = 16, textH = 46;
  const Wt = items.length * (w + pad) + pad, Ht = h + textH + pad * 2;
  const comps = [];
  for (const [k, it] of items.entries()) {
    const left = pad + k * (w + pad);
    comps.push({ input: await sharp(it.png).resize(w, h).png().toBuffer(), left, top: pad });
    comps.push({ input: Buffer.from(`<svg width="${w}" height="${textH}"><text x="0" y="20" font-family="Inter" font-weight="700" font-size="14" fill="#f1f1f1">${esc(it.label)}</text><text x="0" y="38" font-family="Inter" font-size="12" fill="#aaa">${esc(it.sub ?? "")}</text></svg>`), left, top: pad + h + 6 });
  }
  await sharp({ create: { width: Wt, height: Ht, channels: 3, background: "#0f0f0f" } }).composite(comps).png().toFile(out);
  return out;
}
