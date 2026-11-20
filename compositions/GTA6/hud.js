// GTA6 v2 — game-HUD overlays on official footage, driven by tracked boxes (scripts/track-objects.py).
// build.mjs writes window.__HUD = [{t0, t1, shot, rate, play, mode, o:{...}}]; times are film seconds.
const cv = document.getElementById("hud2d"); const g = cv.getContext("2d");
const HUD = window.__HUD || []; const TR = {};
const PINK = "#ff3d9a", TEAL = "#19e3d3", ORANGE = "#ff8a3d", INK = "rgba(13,8,24,0.78)";
const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
async function boot() {
  await document.fonts.load("800 22px Inter");
  const shots = [...new Set(HUD.map((h) => h.shot).filter(Boolean))];
  await Promise.all(shots.map(async (s) => { try { TR[s] = await (await fetch(`media/tracks/${s}.json`)).json(); } catch { TR[s] = { tracks: [] }; } }));
  render(window.__hfThreeTime || 0);
}
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["gta6-hud"] = boot();

function boxAt(tr, m) {
  const f = tr.frames; if (m < f[0][0] - 0.05 || m > f[f.length - 1][0] + 0.05) return null;
  let i = 0; while (i < f.length - 1 && f[i + 1][0] < m) i++;
  const a = f[i], b = f[Math.min(i + 1, f.length - 1)]; if (b[0] - a[0] > 0.35) return [a[1], a[2], a[3], a[4]];
  const k = b[0] > a[0] ? clamp((m - a[0]) / (b[0] - a[0])) : 0; return [1, 2, 3, 4].map((j) => a[j] + (b[j] - a[j]) * k);
}
function live(h, m, cls) {
  const t = TR[h.shot]; if (!t) return [];
  return t.tracks.filter((tr) => !cls || cls.includes(tr.cls)).map((tr) => { const b = boxAt(tr, m); return b && b[2] * b[3] > (h.o.minArea ?? 2500) ? { tr, x: b[0], y: b[1], w: b[2], h: b[3] } : null; }).filter(Boolean).sort((a, b) => b.w * b.h - a.w * a.h);
}
function bracket(x, y, w, h, col, L = 30, lw = 4) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { g.moveTo(cx + dx * L, cy); g.lineTo(cx, cy); g.lineTo(cx, cy + dy * L); } g.stroke(); }
function tag(x, y, text, bg, fg, size = 22) { g.font = `800 ${size}px Inter, sans-serif`; const w = g.measureText(text).width + 24; g.fillStyle = bg; g.beginPath(); g.roundRect(x, y - size - 14, w, size + 14, 8); g.fill(); g.fillStyle = fg; g.fillText(text, x + 12, y - 9); return w; }
function radar(u, items) {
  const R = 130, cx = 1730, cy = 880; g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "rgba(25,227,211,0.5)"; g.lineWidth = 2; for (const r of [R, R * 0.66, R * 0.33]) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
  const a = u * 2.4; const gr = g.createConicGradient(a, cx, cy); gr.addColorStop(0, "rgba(25,227,211,0.45)"); gr.addColorStop(0.12, "rgba(25,227,211,0)"); gr.addColorStop(1, "rgba(25,227,211,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a, a + 0.75); g.fill();
  items.forEach((it, k) => { const bx = cx + ((it.x + it.w / 2) / 1920 - 0.5) * R * 1.6, by = cy + (0.5 - (it.y + it.h) / 1080) * R * 1.2; g.fillStyle = k === 0 ? PINK : TEAL; g.beginPath(); g.arc(bx, by, 7, 0, Math.PI * 2); g.fill(); });
}
const pct = (id, u, hi) => Math.round(hi ? 70 + ((id * 37) % 28) * clamp(u) : 4 + ((id * 13) % 14));

const MODES = {
  track(h, u, m) {
    const L = live(h, m, h.o.cls); const lab = h.o.label ?? ((it) => (it.tr.cls === "person" ? "NPC" : "VEHICLE"));
    L.slice(0, h.o.max ?? 6).forEach((it, k) => { const app = clamp((m - it.tr.frames[0][0]) / 0.25); const pad = (1 - app) * 26; const lock = k === 0 && h.o.lock !== false; const col = lock ? PINK : TEAL;
      bracket(it.x - pad, it.y - pad, it.w + 2 * pad, it.h + 2 * pad, col, Math.min(34, it.w * 0.25));
      const txt = `${typeof lab === "string" ? lab : lab(it)} ${String(it.tr.id).padStart(2, "0")}${lock ? (h.o.lockText ?? " · LOCKED") : ""}`;
      tag(it.x - pad, it.y - pad - 6, txt, lock ? "rgba(255,61,154,0.92)" : INK, lock ? "#0d0818" : TEAL); });
    if (h.o.radar) radar(u, L);
  },
  aware(h, u, m) {
    const L = live(h, m, ["person"]); const flip = h.o.flip ?? 1e9; const hi = u > flip; const k = clamp((u - flip) / 0.6);
    L.slice(0, h.o.max ?? 6).forEach((it) => { const cx = it.x + it.w / 2, fy = it.y + it.h; const col = hi ? PINK : TEAL;
      g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, fy, it.w * 0.75, it.w * 0.22, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = hi ? "rgba(255,61,154,0.18)" : "rgba(25,227,211,0.12)"; g.fill();
      const p = hi ? pct(it.tr.id, k, true) : pct(it.tr.id, 0, false); const bw = Math.max(110, it.w);
      g.fillStyle = INK; g.fillRect(cx - bw / 2, it.y - 44, bw, 34); g.fillStyle = col; g.fillRect(cx - bw / 2 + 4, it.y - 40, (bw - 8) * p / 100, 6);
      g.font = "800 18px Inter, sans-serif"; g.fillStyle = "#fff"; g.fillText(`${hi ? "REACTS" : "IGNORES"} · ${p}%`, cx - bw / 2 + 8, it.y - 17); });
  },
  names(h, u, m) {
    const L = live(h, m, ["person"]).slice(0, 2).sort((a, b) => a.x - b.x); const N = h.o.names ?? ["JASON", "LUCIA"]; const C = [TEAL, PINK];
    L.forEach((it, k) => { bracket(it.x, it.y, it.w, it.h, C[k], 40, 5); tag(it.x, it.y - 6, N[k], C[k], "#0d0818", 30); });
    if (L.length === 2 && h.o.link) { const a = L[0], b = L[1]; const ax = a.x + a.w / 2, ay = a.y + a.h * 0.35, bx = b.x + b.w / 2, by = b.y + b.h * 0.35;
      const k = clamp((u - (h.o.linkAt ?? 0.6)) / 0.5); g.strokeStyle = "#ffd166"; g.lineWidth = 5; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k); g.stroke(); g.setLineDash([]);
      if (k >= 1) { const mx = (ax + bx) / 2; tag(mx - 120, Math.min(ay, by) - 50, h.o.link, "rgba(255,209,102,0.95)", "#0d0818", 24); } }
  },
  space(h, u, m) {
    const L = live(h, m, ["person"]).slice(0, h.o.max ?? 5);
    L.forEach((it, k) => { const cx = it.x + it.w / 2, fy = it.y + it.h; const r = it.w * (1.2 + 0.08 * Math.sin(u * 4 + k)); const near = L.some((o) => o !== it && Math.abs(o.x + o.w / 2 - cx) < r * 1.1);
      g.strokeStyle = near ? PINK : TEAL; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.ellipse(cx, fy, r, r * 0.3, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      if (k === 0) tag(cx - 90, fy + 52, near ? "PERSONAL SPACE!" : "PERSONAL SPACE", near ? "rgba(255,61,154,0.92)" : INK, near ? "#0d0818" : TEAL, 20); });
  },
  scan(h, u) {
    const s0 = h.o.scanAt ?? 0; if (u > s0 && u < s0 + 1.2) { const y = ((u - s0) / 1.2) * 1080; const gr = g.createLinearGradient(0, y - 60, 0, y); gr.addColorStop(0, "rgba(25,227,211,0)"); gr.addColorStop(1, "rgba(25,227,211,0.45)"); g.fillStyle = gr; g.fillRect(0, y - 60, 1920, 60); g.fillStyle = TEAL; g.fillRect(0, y, 1920, 3); }
    for (const b of h.o.boxes ?? []) { if (u < b.t) continue; const k = clamp((u - b.t) / 0.25); const pad = (1 - k) * 40; const col = b.col ?? PINK;
      bracket(b.x - pad, b.y - pad, b.w + 2 * pad, b.h + 2 * pad, col, 40, 5); g.fillStyle = col === PINK ? "rgba(255,61,154,0.08)" : "rgba(25,227,211,0.08)"; g.fillRect(b.x, b.y, b.w, b.h);
      tag(b.x - pad, b.y - pad - 8, b.label, col === PINK ? "rgba(255,61,154,0.95)" : "rgba(25,227,211,0.95)", "#0d0818", 30); if (b.sub) { g.font = "700 20px Inter, sans-serif"; g.fillStyle = "#fff"; g.fillText(b.sub, b.x, b.y + b.h + 30); } }
  },
  retargeted(h, u, m) {
    const L = live(h, m, ["person"]).slice(0, h.o.max ?? 8);
    L.forEach((it, k) => { const app = clamp((u - 0.3 - k * 0.18) / 0.3); if (app <= 0) return; bracket(it.x, it.y, it.w, it.h, TEAL, Math.min(26, it.w * 0.3), 3); tag(it.x, it.y - 4, "✓ RETARGETED", "rgba(25,227,211,0.92)", "#0d0818", 16); });
  },
  wanted(h, u) {
    // five wanted stars that flash, then drain away one by one at o.clear
    const c0 = h.o.clear ?? 1.0; const x0 = 1440, y0 = 120;
    for (let i = 0; i < 5; i++) { const off = clamp((u - c0 - (4 - i) * 0.18) / 0.25); const on = u < c0 ? (Math.floor(u * 4) % 2 ? 1 : 0.55) : 1 - off;
      if (on <= 0.01) continue; g.save(); g.globalAlpha *= on; g.translate(x0 + i * 92, y0); g.rotate(-Math.PI / 2); g.beginPath();
      for (let k = 0; k < 10; k++) { const r = k % 2 ? 18 : 40, a = (k * Math.PI) / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
      g.fillStyle = u < c0 ? "#ffd166" : "#ffffff"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#0d0818"; g.stroke(); g.restore(); }
    tag(1440, y0 + 90, u < c0 ? "WANTED" : "WANTED LEVEL CLEARED", u < c0 ? "rgba(255,61,154,0.92)" : "rgba(25,227,211,0.92)", "#0d0818", 24);
  },
  rain(h, u) {
    g.strokeStyle = "rgba(200,220,255,0.35)"; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 260; i++) { const x = (i * 97.13) % 1920, sp = 900 + (i % 7) * 120, y = ((i * 211.7 + u * sp) % 1180) - 100; g.moveTo(x, y); g.lineTo(x - 8, y + 34); } g.stroke();
    if (h.o.boxes) MODES.scan({ o: { boxes: h.o.boxes, scanAt: -9 } }, u);
  },
};

function render(t) {
  g.clearRect(0, 0, 1920, 1080);
  for (const h of HUD) { if (t < h.t0 || t >= h.t1) continue; const u = t - h.t0; const m = Math.min(u, h.play ?? u) * (h.rate ?? 1) + (h.ms ?? 0);
    g.save(); g.globalAlpha = Math.min(1, u / 0.2, (h.t1 - t) / 0.2); (MODES[h.mode] || MODES.track)(h, u, m); g.restore(); }
}
window.addEventListener("hf-seek", (e) => render(e.detail.time));
