// GTA6 v2 — Three.js scene library. build.mjs writes window.__S3D = [{name, t0, t1, a:{anchor: seconds-from-t0}}].
// Each scene owns a THREE.Scene + camera and renders deterministically from HyperFrames time (hf-seek).
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const PINK = 0xff3d9a, ORANGE = 0xff8a3d, TEAL = 0x19e3d3, PURPLE = 0xb46cff, RED = 0xff4d5e, GOLD = 0xffd166;
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(1920, 1080, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping;
const ENTRIES = window.__S3D || [];
let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const back = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;
const at = (u, a, d = 0.5) => ease((u - a) / d);   // 0→1 starting at anchor a
let FONT = null;

// ── toolkit ──────────────────────────────────────────────────────────────
function baseScene({ night = false, fog = [18, 60] } = {}) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(night ? 0x07040f : 0x150b26);
  s.fog = new THREE.Fog(s.background, fog[0], fog[1]);
  s.add(new THREE.HemisphereLight(0xff9ad5, 0x1a1040, night ? 1.0 : 1.6));
  const sun = new THREE.DirectionalLight(0xffb37a, night ? 0.7 : 2.0); sun.position.set(-12, 18, 8); s.add(sun);
  return s;
}
function ground(s, size = 80, gridCol = PINK) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size * 2, size * 2), new THREE.MeshStandardMaterial({ color: 0x120a20, roughness: 0.85 }));
  g.rotation.x = -Math.PI / 2; s.add(g);
  const grid = new THREE.GridHelper(size * 2, size, gridCol, 0x2a1645); grid.material.opacity = 0.16; grid.material.transparent = true; grid.position.y = 0.01; s.add(grid);
}
function road(s, x, z, w, h, dashed = true) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0x08050f, roughness: 0.35, metalness: 0.25 }));
  r.rotation.x = -Math.PI / 2; r.position.set(x, 0.02, z); s.add(r);
  if (dashed) { const m = new THREE.MeshBasicMaterial({ color: TEAL }); const horiz = w > h; for (let i = -Math.max(w, h) / 2; i < Math.max(w, h) / 2; i += 3) { const d = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 1.2 : 0.12, horiz ? 0.12 : 1.2), m); d.rotation.x = -Math.PI / 2; d.position.set(horiz ? x + i : x, 0.03, horiz ? z : z + i); s.add(d); } }
}
function buildings(s, n, { spread = 50, avoid = () => false, night = false, maxH = 10 } = {}) {
  const eP = new THREE.LineBasicMaterial({ color: PINK }), eT = new THREE.LineBasicMaterial({ color: TEAL });
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = (rnd() - 0.5) * spread, z = (rnd() - 0.5) * spread; if (avoid(x, z)) continue;
    const w = 2 + rnd() * 4, d = 2 + rnd() * 4, h = 2 + rnd() * maxH;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x24143f, roughness: 0.7, emissive: 0x12081f }));
    b.position.set(x, h / 2, z); s.add(b); out.push(b);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), rnd() > 0.5 ? eP : eT); e.position.copy(b.position); s.add(e);
    if (night) for (let k = 0; k < 5; k++) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshBasicMaterial({ color: rnd() > 0.5 ? 0xffd38a : TEAL })); wn.position.set(x + (rnd() - 0.5) * w * 0.8, rnd() * h, z + d / 2 + 0.01); s.add(wn); }
  }
  return out;
}
function palm(s, x, z) {
  const p = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x7a4b2a })); t.position.y = 1.6; p.add(t);
  for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x1fbf7a, emissive: 0x06301c })); l.geometry.translate(0, 0.9, 0); l.position.y = 3.2; l.rotation.z = Math.PI / 2.6; l.rotation.y = (k / 6) * Math.PI * 2; p.add(l); }
  p.position.set(x, 0, z); s.add(p); return p;
}
function city(s, opts = {}) { ground(s); road(s, 0, 4, 160, 4); road(s, -6, 0, 4, 160); buildings(s, opts.n ?? 60, { avoid: (x, z) => Math.abs(z - 4) < 4 || Math.abs(x + 6) < 4 || (Math.abs(x) < (opts.clear ?? 7) && Math.abs(z) < (opts.clearZ ?? 4)), night: opts.night, maxH: opts.maxH ?? 10, spread: opts.spread ?? 60 }); for (const [x, z] of opts.palms ?? [[-14, -2.6], [-9, -2.6], [9, -2.6], [14, -2.6], [-16, 8.8], [16, 8.8]]) palm(s, x, z); }
function person(color, h = 1.7) {
  const g = new THREE.Group(); const k = h / 1.7;
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.15 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22 * k, 0.75 * k, 4, 10), mat); body.position.y = 0.62 * h; g.add(body);
  const head = new THREE.Group(); head.position.y = 1.08 * h;
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.19 * k, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf2c9a0 })));
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.22 * k, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x0d0818 })); eyes.position.set(0, 0.03, 0.17 * k); head.add(eyes);
  g.add(head); g.userData.head = head; g.userData.mat = mat;
  const legM = new THREE.MeshStandardMaterial({ color: 0x1b1430 });
  for (const sg of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08 * k, 0.5 * k, 3, 6), legM); leg.position.set(0.1 * sg * k, 0.32 * k, 0); g.add(leg); g.userData["leg" + sg] = leg; }
  return g;
}
function walk(p, u, speed = 9) { const s = Math.sin(u * speed) * 0.35; p.userData.leg1.rotation.x = s; p.userData["leg-1"].rotation.x = -s; }
function car(color = PINK, police = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.95), new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3, emissive: color, emissiveIntensity: 0.08 })); body.position.y = 0.45; g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.85), new THREE.MeshStandardMaterial({ color: 0x0d0818, metalness: 0.8, roughness: 0.2 })); top.position.set(-0.1, 0.9, 0); g.add(top);
  for (const [x, z] of [[0.65, 0.48], [-0.65, 0.48], [0.65, -0.48], [-0.65, -0.48]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0x050308 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z); g.add(w); }
  if (police) { const lb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.6), new THREE.MeshBasicMaterial({ color: 0x3b6bff })); lb.position.set(-0.1, 1.16, 0); g.add(lb); g.userData.bar = lb; }
  const hl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.7), new THREE.MeshBasicMaterial({ color: 0xfff2c4 })); hl.position.set(1.01, 0.5, 0); g.add(hl);
  return g;
}
function textCanvas(lines, { w = 1024, h = 256, size = 110, color = "#ffffff", bg = null, border = null, weight = 900, align = "center" } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
  if (bg) { x.fillStyle = bg; const r = 40; x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, r); x.fill(); if (border) { x.lineWidth = 8; x.strokeStyle = border; x.stroke(); } }
  const L = Array.isArray(lines) ? lines : [lines]; x.textAlign = align; x.textBaseline = "middle";
  L.forEach((ln, i) => { const o = typeof ln === "string" ? { t: ln } : ln; x.font = `${o.weight ?? weight} ${o.size ?? size}px Inter, sans-serif`; x.fillStyle = o.color ?? color; x.fillText(o.t, align === "center" ? w / 2 : 60, h / 2 + (i - (L.length - 1) / 2) * (o.size ?? size) * 1.1); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const LABEL_K = 1.5;
function label(lines, opts = {}, scale = 2.4) {
  scale *= LABEL_K; const tex = textCanvas(lines, opts); const asp = (opts.w ?? 1024) / (opts.h ?? 256);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: opts.depthTest ?? true, fog: false })); s.scale.set(scale, scale / asp, 1); s.userData.base = s.scale.clone(); return s;
}
function panel(lines, opts = {}, wid = 3) {
  const tex = textCanvas(lines, opts); const asp = (opts.w ?? 1024) / (opts.h ?? 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wid, wid / asp), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, fog: false })); return m;
}
function pop(obj, k) { const b = obj.userData.base ?? new THREE.Vector3(1, 1, 1); const v = back(k); obj.scale.set(b.x * v, b.y * v, b.z * v); obj.visible = k > 0.01; }
function ringMesh(r, w, color, opacity = 0.9) { const m = new THREE.Mesh(new THREE.RingGeometry(r - w, r, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; return m; }
function lineBetween(color, dashed = false) { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.2, gapSize: 0.12 }) : new THREE.LineBasicMaterial({ color }); const l = new THREE.Line(g, m); l.userData.dashed = dashed; return l; }
function setLine(l, a, b) { const p = l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; if (l.userData.dashed) l.computeLineDistances(); }
function particles(s, n, box, color = 0xff9ad5, size = 0.08) { const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (rnd() - 0.5) * box[0]; p[i * 3 + 1] = rnd() * box[1]; p[i * 3 + 2] = (rnd() - 0.5) * box[2]; } g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.85 })); s.add(pts); return pts; }
function extruded(text, size, colors = [PINK, ORANGE]) {
  const geo = new TextGeometry(text, { font: FONT, size, depth: size * 0.33, curveSegments: 6, bevelEnabled: true, bevelThickness: size * 0.03, bevelSize: size * 0.02, bevelSegments: 3 }); geo.center();
  const m = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ color: colors[0], emissive: colors[0], emissiveIntensity: 0.55, metalness: 0.3, roughness: 0.35 }), new THREE.MeshStandardMaterial({ color: colors[1], emissive: 0x5a1a00, metalness: 0.5, roughness: 0.4 })]);
  const g = new THREE.Group(); g.add(m); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }))); return g;
}
const cam = (fov = 40) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 400);
const orbit = (c, cx, cy, cz, r, ang, h, ty = 1) => { c.position.set(cx + Math.sin(ang) * r, h, cz + Math.cos(ang) * r); c.lookAt(cx, ty, cz); };

// ── scenes ───────────────────────────────────────────────────────────────
const SCENES = {};

// beat 4 — "no single prompt creating the whole game": a prompt beam tries to grow a city, which glitches apart
SCENES.prompt = () => {
  seed = 11; const s = baseScene(); ground(s, 40, TEAL); const c = cam(42);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x1b1030, emissive: PINK, emissiveIntensity: 0.25 })); slab.position.set(0, 0.1, 6); s.add(slab);
  const ptxt = panel([{ t: "> generate an entire open-world city", size: 54, weight: 700, color: "#ffffff" }], { w: 2048, h: 256, align: "left" }, 5.6); ptxt.rotation.x = -Math.PI / 2.2; ptxt.position.set(0, 0.25, 6); s.add(ptxt);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.6, 12, 16, 1, true), new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); beam.position.set(0, 6, 1); s.add(beam);
  const blocks = []; const wm = new THREE.LineBasicMaterial({ color: TEAL });
  for (let i = 0; i < 46; i++) { const w = 0.8 + rnd() * 1.6, h = 1 + rnd() * 7, d = 0.8 + rnd() * 1.6; const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), wm.clone()); e.position.set((rnd() - 0.5) * 18, h / 2, -4 + (rnd() - 0.5) * 14); e.userData = { h, d0: rnd() * 0.8, spin: (rnd() - 0.5) * 4, vx: (rnd() - 0.5) * 6, vy: 2 + rnd() * 5 }; s.add(e); blocks.push(e); }
  const x = label([{ t: "X", size: 230, color: "#ff4d5e" }], { w: 256, h: 256 }, 3.2); x.position.set(0, 5, 0); s.add(x);
  return { s, c, render(u, A) {
    const grow = (k) => ease(k);
    const fail = A.single ?? 2.5;
    blocks.forEach((b) => { const g = grow((u - 0.3 - b.userData.d0) / 1.2); const f = Math.max(0, u - fail); b.scale.y = Math.max(0.01, g); b.position.y = (b.userData.h / 2) * g - (f > 0 ? b.userData.vy * f * f * 0.6 : 0); b.position.x += 0; b.rotation.z = f * b.userData.spin * 0.4; b.material.color.setHex(f > 0 && Math.floor(f * 20) % 2 ? RED : TEAL); b.material.opacity = 1 - clamp(f / 1.6); b.material.transparent = true; });
    beam.material.opacity = 0.35 * (1 - clamp((u - fail) / 0.4)) + Math.sin(u * 30) * 0.05;
    pop(x, at(u, fail + 0.2, 0.35));
    orbit(c, 0, 0, 0, lerp(22, 17, ease(u / 4)), lerp(-0.3, 0.25, ease(u / 5)), lerp(9, 7, ease(u / 4)), 2.5);
  } };
};

// beat 6 — roadmap: six monoliths, the sixth locked
SCENES.roadmap = () => {
  seed = 21; const s = baseScene({ night: true }); ground(s, 60); const c = cam(40);
  const names = ["NPC behaviour", "Criminal profile", "Animation retargeting", "Character relationships", "RAGE engine & weather", "???"];
  const cols = [PINK, ORANGE, GOLD, TEAL, PURPLE, RED];
  const items = names.map((n, k) => {
    const g = new THREE.Group(); const x = (k - 2.5) * 3.3;
    const pil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x1d1033, emissive: cols[k], emissiveIntensity: k === 5 ? 0.25 : 0.12, metalness: 0.4, roughness: 0.4 })); pil.position.y = 2.3; g.add(pil);
    { const e = new THREE.LineSegments(new THREE.EdgesGeometry(pil.geometry), new THREE.LineBasicMaterial({ color: cols[k] })); e.position.copy(pil.position); g.add(e); }
    const num = extruded(k === 5 ? "?" : `0${k + 1}`, 0.8, [cols[k], 0xffffff]); num.position.set(0, 3.4, 0.45); g.add(num);
    const lb = panel(k === 5 ? [{ t: "THE LAST ONE", size: 84 }] : n.split(" ").length > 2 ? [{ t: n.split(" ").slice(0, 2).join(" "), size: 64 }, { t: n.split(" ").slice(2).join(" "), size: 64 }] : [{ t: n, size: 70 }], { w: 1024, h: 320 }, 2.35); lb.position.set(0, 1.5, 0.27); g.add(lb);
    g.position.set(x, 0, 0); s.add(g); g.userData.num = num; return g;
  });
  const lk = new THREE.PointLight(RED, 0, 12); lk.position.set(8.25, 4, 3); s.add(lk);
  particles(s, 400, [60, 18, 40]);
  return { s, c, render(u, A) {
    items.forEach((g, k) => { const t = k < 5 ? (A[`k${k}`] ?? 0.2 + k * 0.25) : (A.last ?? 3.5); const p = back((u - t) / 0.6); g.position.y = lerp(-6, 0, clamp(p)); g.visible = p > 0.01; g.userData.num.rotation.y = Math.sin(u * 1.5 + k) * 0.25; });
    lk.intensity = u > (A.last ?? 3.5) ? 30 + Math.sin(u * 8) * 15 : 0;
    const f = ease(u / 5); c.position.set(lerp(-5, 3, f), lerp(4.2, 3.2, f), lerp(19, 16.5, f)); c.lookAt(lerp(-1.5, 1.5, f), 1.2, 0);
  } };
};

// beat 7 — AI today: three holographic panels orbiting (chatbot, assistant, AI video)
SCENES.aipanels = () => {
  seed = 31; const s = baseScene({ night: true }); const c = cam(40);
  particles(s, 700, [40, 20, 40], 0x9ad5ff, 0.06);
  const mk = (title, sub, col) => { const g = new THREE.Group(); const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), new THREE.MeshBasicMaterial({ color: 0x150b26, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); g.add(frame); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(frame.geometry), new THREE.LineBasicMaterial({ color: col }))); const t = panel([{ t: title, size: 120 }, { t: sub, size: 58, weight: 600, color: "#cfc4e6" }], { w: 1024, h: 512 }, 3.2); t.position.z = 0.02; g.add(t); return g; };
  const P = [mk("ChatGPT", "chatbot", PINK), mk("Claude", "assistant", ORANGE), mk("AI video", "generated clips", TEAL)]; P.forEach((p) => s.add(p));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshStandardMaterial({ color: 0x241046, emissive: PINK, emissiveIntensity: 0.6, wireframe: true })); core.position.y = 2; s.add(core);
  return { s, c, render(u, A) {
    const ts = [A.chatgpt ?? 0.5, A.claude ?? 1.2, A.video ?? 2.0];
    P.forEach((p, k) => { const a = u * 0.35 + (k * Math.PI * 2) / 3; p.position.set(Math.sin(a) * 4.8, 2 + Math.sin(u * 1.3 + k) * 0.25, Math.cos(a) * 4.8); p.lookAt(c.position.x, 2, c.position.z); const v = back((u - ts[k]) / 0.5); p.scale.setScalar(Math.max(0.001, v)); p.visible = v > 0.01; });
    core.rotation.y = u * 0.6; core.rotation.x = u * 0.3;
    c.position.set(0, 3.2, 12); c.lookAt(0, 2, 0);
  } };
};

// beat 9 — traditional game AI: a police car with a decision tree hologram
SCENES.brain = () => {
  seed = 41; const s = baseScene(); city(s, { n: 40, clear: 9 }); const c = cam(40);
  const pc = car(0xe8e8f0, true); pc.position.set(-2, 0, 4); s.add(pc);
  const nodes = [["RULES", PINK, [-3, 5.6, 1]], ["DECISIONS", ORANGE, [0, 6.6, 1]], ["SIMULATION", TEAL, [3, 5.6, 1]]].map(([t, col, p]) => { const l = label([{ t, size: 96 }], { w: 1024, h: 220, bg: "rgba(21,11,38,0.9)", border: "#" + col.toString(16).padStart(6, "0") }, 3.0); l.position.set(...p); s.add(l); return l; });
  const lines = nodes.map(() => { const l = lineBetween(TEAL, true); s.add(l); return l; });
  const ped = person(ORANGE); ped.position.set(3, 0, 1.5); s.add(ped);
  return { s, c, render(u, A) {
    const ts = [A.rules ?? 1, A.decisions ?? 1.8, A.sim ?? 2.6];
    nodes.forEach((n, k) => { pop(n, at(u, ts[k], 0.45)); setLine(lines[k], new THREE.Vector3(pc.position.x, 1.3, pc.position.z), n.position); lines[k].visible = u > ts[k]; });
    pc.position.x = lerp(-6, -1, ease(u / 2.5)); if (pc.userData.bar) pc.userData.bar.material.color.setHex(Math.floor(u * 6) % 2 ? 0x3b6bff : 0xff3045);
    ped.rotation.y = -Math.PI / 2 + Math.sin(u) * 0.2;
    orbit(c, 0, 0, 2, 14, lerp(-0.5, 0.2, ease(u / 6)), 7.5, 3.2);
  } };
};

// beat 12 — NPCs notice you (approved test)
SCENES.notice = () => {
  seed = 7; const s = baseScene(); city(s, { n: 50, clear: 7, palms: [[-14, -2.6], [-9, -2.6], [9, -2.6], [14, -2.6], [-16, -5.5], [16, -5.5]] }); const c = cam(38);
  const A1 = person(ORANGE), B1 = person(PURPLE, 1.6), me = person(TEAL);
  A1.position.set(1.0, 0, 1.0); B1.position.set(2.1, 0, 1.0); A1.rotation.y = Math.PI / 2; B1.rotation.y = -Math.PI / 2; s.add(A1, B1, me);
  const ring = ringMesh(2.45, 0.15, TEAL); ring.position.set(1.55, 0.05, 1.0); s.add(ring);
  const al = [label([{ t: "!", size: 200, color: "#0d0818" }], { w: 256, h: 256, bg: "#ff3d9a" }, 0.7), label([{ t: "!", size: 200, color: "#0d0818" }], { w: 256, h: 256, bg: "#ff3d9a" }, 0.7)];
  al[0].position.set(1.0, 2.45, 1.0); al[1].position.set(2.1, 2.3, 1.0); s.add(...al);
  const dots = [0, 1, 2].map((k) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); d.position.set(1.4 + k * 0.15, 2.15, 1.0); s.add(d); return d; });
  const sight = lineBetween(PINK, true); s.add(sight);
  return { s, c, render(u, A) {
    const N = A.notice ?? 3.6;
    const w = ease(u / (N - 0.2)); me.position.set(lerp(-6.5, -0.45, w), 0, 1.6); me.rotation.y = Math.PI / 2; walk(me, u, w < 1 ? 9 : 0);
    const k = ease((u - N) / 0.5);
    dots.forEach((d, i) => { d.visible = k < 0.5; d.position.y = 2.15 + Math.max(0, Math.sin(u * 6 - i * 0.8)) * 0.08; });
    const inside = me.position.distanceTo(new THREE.Vector3(1.55, 0, 1.0)) < 2.5; ring.material.color.setHex(inside ? PINK : TEAL); const pl = 1 + Math.sin(u * 4) * 0.03; ring.scale.set(pl, pl, 1);
    const look = (n, base) => { const a = Math.atan2(me.position.x - n.position.x, me.position.z - n.position.z); n.userData.head.rotation.y = lerp(0, a - base, k); n.rotation.y = lerp(base, base + (a - base) * 0.45, ease((u - N - 0.4) / 0.6)); };
    look(A1, Math.PI / 2); look(B1, -Math.PI / 2);
    al.forEach((a, i) => pop(a, at(u, N + 0.15 + i * 0.12, 0.3)));
    setLine(sight, new THREE.Vector3(1.0, 1.85, 1.0), new THREE.Vector3(me.position.x, 1.85, me.position.z)); sight.visible = u > N + 0.8;
    const a = lerp(-0.9, -0.35, ease(u / 7)), r = lerp(14, 8.5, ease(u / 6)), y = lerp(9, 4.2, ease(u / 6));
    c.position.set(1.0 + Math.sin(a) * r, y, 1.0 + Math.cos(a) * r); c.lookAt(0.6, 1.0, 1.0);
  } };
};

// chapter transitions — camera flies down a neon avenue to an extruded number (colour per chapter)
const CH_COL = [[PINK, ORANGE], [ORANGE, PINK], [GOLD, ORANGE], [TEAL, PURPLE], [PURPLE, TEAL], [RED, PINK]];
for (let n = 1; n <= 6; n++) SCENES["chapter" + n] = () => {
  seed = 99 + n; const s = baseScene({ night: true, fog: [20, 80] }); ground(s, 80, CH_COL[n - 1][0]); road(s, 0, 0, 6, 160); buildings(s, 120, { night: true, maxH: 18, spread: 70, avoid: (x) => Math.abs(x) < 5 });
  for (let z = -60; z < 40; z += 8) { palm(s, -4, z); palm(s, 4, z + 4); }
  const c = cam(45); const g = extruded(`0${n}`, 4.2, CH_COL[n - 1]); g.position.set(0, 6.5, -8); s.add(g);
  const gl = new THREE.PointLight(CH_COL[n - 1][0], 60, 30); gl.position.set(0, 7, -3); s.add(gl);
  const pts = particles(s, 600, [60, 20, 80], 0xff9ad5);
  return { s, c, render(u) {
    const f = ease(u / 1.8); c.position.set(lerp(-3, 0, f), lerp(14, 6.8, f), lerp(40, 9, f)); c.lookAt(0, lerp(3, 6.4, f), -8);
    g.rotation.y = lerp(-Math.PI * 1.2, 0, ease(u / 1.6)) + Math.sin(u * 1.4) * 0.06; g.scale.setScalar(lerp(0.3, 1, ease(u / 1.3)));
    pts.position.y = -u * 0.4; gl.intensity = 40 + Math.sin(u * 6) * 8;
  } };
};

// beat 18 — criminal profile: a holographic police database builds the player's profile
SCENES.profile = (tex) => {
  seed = 51; const s = baseScene({ night: true }); const c = cam(38); particles(s, 500, [30, 16, 30], 0x9ad5ff, 0.05);
  const board = new THREE.Group(); s.add(board);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 5), new THREE.MeshBasicMaterial({ color: 0x150b26, transparent: true, opacity: 0.88 })); board.add(bg);
  board.add(new THREE.LineSegments(new THREE.EdgesGeometry(bg.geometry), new THREE.LineBasicMaterial({ color: PINK })));
  const head = panel([{ t: "CRIMINAL PROFILE", size: 120 }], { w: 2048, h: 256, bg: "rgba(255,61,154,0.85)" }, 8.2); head.position.set(0, 2.15, 0.02); board.add(head);
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.9), new THREE.MeshBasicMaterial({ map: tex.jason })); photo.position.set(-2.6, -0.4, 0.03); board.add(photo);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.08), new THREE.MeshBasicMaterial({ color: TEAL })); scan.position.set(-2.6, 0, 0.05); board.add(scan);
  const rows = [["VEHICLE", "SEEN"], ["OUTFIT", "FLAGGED"], ["FACE", "PARTIAL"], ["LAST SEEN", "VICE CITY"]].map(([k, v], i) => { const p = panel([{ t: k, size: 70, weight: 800, color: "#19e3d3" }, { t: v, size: 90 }], { w: 1024, h: 320, bg: i === 1 ? "rgba(255,61,154,0.3)" : "rgba(255,255,255,0.06)", border: i === 1 ? "#ff3d9a" : null }, 2.4); p.position.set(0.75 + (i % 2) * 2.55, 0.35 - Math.floor(i / 2) * 1.55, 0.03); p.userData.base = p.scale.clone(); board.add(p); return p; });
  const badges = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: i % 2 ? TEAL : PINK })); s.add(b); badges.push(b); }
  return { s, c, render(u, A) {
    const t0 = A.profile ?? 0.3; const k = back((u - t0) / 0.7); board.scale.setScalar(Math.max(0.001, k)); board.visible = k > 0.01; board.rotation.y = lerp(0.6, -0.12, ease((u - t0) / 1.2)) + Math.sin(u * 0.8) * 0.03;
    const rt = [A.r0 ?? 1.2, A.r1 ?? 1.8, A.r2 ?? 2.4, A.r3 ?? 3.0]; rows.forEach((r, i) => pop(r, at(u, rt[i], 0.4)));
    scan.position.y = -0.4 + Math.sin(u * 2.4) * 1.35;
    badges.forEach((b, i) => { const a = u * 0.5 + (i / 6) * Math.PI * 2; b.position.set(Math.sin(a) * 6.2, Math.sin(u + i) * 0.8, Math.cos(a) * 3 - 1); b.rotation.y = u * 2 + i; });
    c.position.set(0, 0.2, 10); c.lookAt(0, 0, 0);
  } };
};

// beat 19 — not just speed: the car escapes, but witnesses report what they saw
SCENES.witness = () => {
  seed = 61; const s = baseScene(); city(s, { n: 45, clear: 18, clearZ: 26 }); const c = cam(40);
  const pc = car(PINK); pc.position.set(-10, 0, 4); s.add(pc);
  const hq = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 6, 6), new THREE.MeshStandardMaterial({ color: 0x1d1033, emissive: 0x3b6bff, emissiveIntensity: 0.5 })); hq.position.set(6, 3, -6); s.add(hq);
  const hql = label([{ t: "POLICE", size: 110 }], { w: 1024, h: 220, bg: "rgba(59,107,255,0.9)" }, 2.6); hql.position.set(6, 7, -6); s.add(hql);
  const W = [[-4, 1.2], [-1, 7], [2, 1.2], [5, 7.4]].map(([x, z]) => { const p = person([ORANGE, PURPLE, GOLD, TEAL][Math.abs(x) % 4], 1.6); p.position.set(x, 0, z); s.add(p); const e = label([{ t: "SAW", size: 96, color: "#0d0818" }], { w: 256, h: 256, bg: "rgba(255,255,255,0.95)" }, 0.7); e.position.set(x, 2.4, z); s.add(e); const l = lineBetween(TEAL, true); s.add(l); return { p, e, l }; });
  const lbl = label([{ t: "WHAT PEOPLE SAW", size: 110 }], { w: 1400, h: 220, bg: "rgba(25,227,211,0.9)", color: "#0d0818" }, 4.2); lbl.position.set(-1, 6.5, 0); s.add(lbl);
  return { s, c, render(u, A) {
    pc.position.x = lerp(-10, 24, ease(u / 2.2) * 0.4 + clamp(u / 4.5) * 0.6);
    const sw = A.saw ?? 2.0;
    W.forEach((w, i) => { w.p.userData.head.rotation.y = Math.atan2(pc.position.x - w.p.position.x, pc.position.z - w.p.position.z) * 0.6; pop(w.e, at(u, 0.6 + i * 0.25, 0.3)); setLine(w.l, new THREE.Vector3(w.p.position.x, 2.4, w.p.position.z), new THREE.Vector3(6, 6, -6)); w.l.visible = u > sw + i * 0.15; });
    pop(lbl, at(u, sw, 0.4)); pop(hql, at(u, sw + 0.3, 0.4));
    orbit(c, 0, 0, 1, 14, lerp(-0.25, 0.25, ease(u / 6)), 9, 2);
  } };
};

// beats 22–23 — retargeting: one sitting animation on a tall and a short body, then retargeted to fit
SCENES.retarget = () => {
  seed = 71; const s = baseScene({ night: true }); ground(s, 30, TEAL); const c = cam(36);
  const rigs = [[-2.6, 2.1, "TALL"], [2.6, 1.35, "SHORT"]].map(([x, h, nm]) => {
    const g = new THREE.Group(); g.position.x = x; s.add(g);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 1.1), new THREE.MeshStandardMaterial({ color: 0x3a1f5c, emissive: PINK, emissiveIntensity: 0.15 })); seat.position.y = 0.7; g.add(seat);
    const back2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.4, 1.1), seat.material); back2.position.set(-0.5, 1.4, 0); g.add(back2);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 10, 30), new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.4 })); wheel.position.set(0.95, 1.55, 0); wheel.rotation.y = Math.PI / 2; wheel.rotation.z = 0.35; g.add(wheel);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.6), wheel.material); ped.position.set(1.15, 0.08, 0); g.add(ped);
    // body: hips at seat, torso, head, arm chain, leg chain (built from capsules so we can pose them)
    const k = h / 1.7, mat = new THREE.MeshStandardMaterial({ color: 0xe8e2f2, roughness: 0.45 });
    const limb = (len, r) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 8), mat); m.geometry.translate(0, len / 2, 0); return m; };
    const hip = new THREE.Group(); hip.position.set(-0.2, 0.88, 0); g.add(hip);
    const torso = limb(0.62 * k, 0.17 * k); torso.rotation.z = 0.12; hip.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17 * k, 16, 12), mat); head.position.set(-0.1 * k, 0.95 * k, 0); hip.add(head);
    const sh = new THREE.Group(); sh.position.set(-0.05 * k, 0.6 * k, 0.18); hip.add(sh); const up = limb(0.32 * k, 0.06 * k); sh.add(up); const el = new THREE.Group(); el.position.y = 0.32 * k; up.add(el); const lo = limb(0.3 * k, 0.055 * k); el.add(lo); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: RED })); hand.position.y = 0.3 * k + 0.05; lo.add(hand);
    const th = limb(0.45 * k, 0.08 * k); th.position.set(0, 0, 0.1); hip.add(th); const kn = new THREE.Group(); kn.position.y = 0.45 * k; th.add(kn); const sn = limb(0.45 * k, 0.07 * k); kn.add(sn); const foot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: RED })); foot.position.y = 0.45 * k + 0.05; sn.add(foot);
    const tag = label([{ t: nm, size: 120 }], { w: 768, h: 220, bg: "rgba(21,11,38,0.9)", border: "#19e3d3" }, 1.6); tag.position.set(0, 3.1, 0); g.add(tag);
    return { g, h, k, up, lo, th, sn, hand, foot, tag, wheel };
  });
  const verdict = label([{ t: "HANDS MISS · LEGS OFF", size: 100 }], { w: 1600, h: 220, bg: "rgba(255,77,94,0.92)" }, 5.0); verdict.position.set(0, 4.3, 0); s.add(verdict);
  const ok = label([{ t: "RETARGETED ✓ FITS EACH BODY", size: 96, color: "#0d0818" }], { w: 1800, h: 220, bg: "rgba(25,227,211,0.95)" }, 5.6); ok.position.set(0, 4.3, 0); s.add(ok);
  return { s, c, render(u, A) {
    const tall = A.tall ?? 0.6, short = A.short ?? 1.6, miss = A.miss ?? 3.0, fix = A.fix ?? 6.0;
    rigs.forEach((r, i) => { const v = back((u - (i ? short : tall)) / 0.5); r.g.scale.setScalar(Math.max(0.001, v)); r.g.visible = v > 0.01; pop(r.tag, at(u, (i ? short : tall) + 0.2, 0.3)); });
    // the same source pose on both; after "fix" each body solves its own arm/leg angles
    const fixK = ease((u - fix) / 0.8);
    rigs.forEach((r, i) => {
      const src = { sh: -2.1, el: 0.9, hip: 1.55, kn: -1.5 };              // authored for a mid-height body
      const tgt = i === 0 ? { sh: -1.75, el: 0.55, hip: 1.35, kn: -1.15 } : { sh: -2.45, el: 1.25, hip: 1.7, kn: -1.85 };
      const p = (key) => lerp(src[key], tgt[key], fixK);
      r.up.rotation.z = p("sh"); r.lo.rotation.z = p("el"); r.th.rotation.z = p("hip"); r.sn.rotation.z = p("kn");
      const bad = u > miss && fixK < 0.5; r.hand.material.color.setHex(bad ? RED : TEAL); r.foot.material.color.setHex(bad ? RED : TEAL);
      r.wheel.material.emissive.setHex(fixK > 0.5 ? TEAL : ORANGE);
    });
    pop(verdict, at(u, miss, 0.35) * (1 - at(u, fix - 0.2, 0.2))); pop(ok, at(u, fix + 0.3, 0.4));
    orbit(c, 0, 0, 0, 7.2, lerp(0.55, 0.15, ease(u / 8)) + Math.sin(u * 0.4) * 0.05, 3.0, 1.5);
  } };
};

// beat 23c — not just individuals: people link into a network of interactions
SCENES.network = () => {
  seed = 81; const s = baseScene(); ground(s, 40); const c = cam(40);
  const P = []; for (let i = 0; i < 22; i++) { const p = person([PINK, ORANGE, TEAL, PURPLE, GOLD][i % 5], 1.5 + rnd() * 0.4); p.position.set((rnd() - 0.5) * 16, 0, (rnd() - 0.5) * 10); p.rotation.y = rnd() * 6; s.add(p); P.push(p); }
  const pairs = []; for (let i = 0; i < P.length; i++) { const d = P.map((q, j) => [q.position.distanceTo(P[i].position), j]).sort((a, b) => a[0] - b[0]); for (const [, j] of d.slice(1, 3)) if (i < j) { const l = lineBetween(TEAL); s.add(l); pairs.push([i, j, l]); } }
  const L1 = label([{ t: "INDIVIDUALS", size: 110 }], { w: 1200, h: 220, bg: "rgba(21,11,38,0.9)", border: "#ff3d9a" }, 3.6); L1.position.set(0, 4.6, 0); s.add(L1);
  const L2 = label([{ t: "INTERACTIONS", size: 110, color: "#0d0818" }], { w: 1200, h: 220, bg: "rgba(25,227,211,0.95)" }, 3.6); L2.position.set(0, 4.6, 0); s.add(L2);
  return { s, c, render(u, A) {
    const link = A.link ?? 2.5;
    P.forEach((p, i) => { p.position.x += 0; p.userData.head.rotation.y = Math.sin(u * 0.8 + i) * 0.5; });
    pairs.forEach(([i, j, l], k) => { const v = at(u, link + k * 0.05, 0.3); const a = P[i].position.clone().setY(1.2), b = P[j].position.clone().setY(1.2); setLine(l, a, a.clone().lerp(b, v)); l.visible = v > 0.01; });
    pop(L1, at(u, 0.3, 0.4) * (1 - at(u, link - 0.2, 0.2))); pop(L2, at(u, link + 0.4, 0.4));
    orbit(c, 0, 0, 0, 17, u * 0.12, 9, 0.8);
  } };
};

// beat 26 — follow vs together
SCENES.follow = () => {
  seed = 91; const s = baseScene(); city(s, { n: 40, clear: 14, clearZ: 3.5 }); const c = cam(38);
  const J = person(TEAL), L = person(PINK, 1.62); s.add(J, L);
  const tether = lineBetween(RED, true); s.add(tether);
  const T1 = label([{ t: "JUST FOLLOWS", size: 100 }], { w: 1200, h: 220, bg: "rgba(255,77,94,0.9)" }, 3.4); T1.position.set(0, 3.3, 1.5); s.add(T1);
  const T2 = label([{ t: "MOVES TOGETHER", size: 100, color: "#0d0818" }], { w: 1300, h: 220, bg: "rgba(25,227,211,0.95)" }, 3.6); T2.position.set(0, 3.3, 1.5); s.add(T2);
  return { s, c, render(u, A) {
    const sw = A.together ?? 3.5;
    const x = lerp(-8, 8, (u % 7) / 7);
    J.position.set(x, 0, 1.4); J.rotation.y = Math.PI / 2; walk(J, u);
    if (u < sw) { const lag = Math.max(0, Math.floor(u * 2) / 2 - 0.8); L.position.set(lerp(-8, 8, (Math.max(0, u - 0.8) % 7) / 7) - 0.4, 0, 1.4); L.rotation.y = Math.PI / 2; walk(L, u * (Math.floor(u * 2) % 2 ? 1 : 0.2)); setLine(tether, J.position.clone().setY(1), L.position.clone().setY(1)); tether.visible = true; }
    else { L.position.set(x, 0, 2.2); L.rotation.y = Math.PI / 2; walk(L, u); tether.visible = false; L.userData.head.rotation.y = -0.4 * Math.sin(u * 2); J.userData.head.rotation.y = 0.4 * Math.sin(u * 2 + 1); }
    pop(T1, at(u, 0.3, 0.4) * (1 - at(u, sw - 0.2, 0.2))); pop(T2, at(u, sw + 0.2, 0.4));
    T1.position.x = x; T2.position.x = x;
    c.position.set(x - 2, 4.5, 11); c.lookAt(x, 1.2, 1.5);
  } };
};

// beat 27 — arriving together: wait, reposition, react
SCENES.arrive = () => {
  seed = 101; const s = baseScene(); city(s, { n: 40, clear: 10, clearZ: 6 }); const c = cam(36);
  const k = car(PURPLE); s.add(k);
  const J = person(TEAL), L = person(PINK, 1.62); s.add(J, L);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x3a1f5c, emissive: GOLD, emissiveIntensity: 0.3 })); door.position.set(3, 1.3, -1.2); s.add(door);
  const tags = ["WAIT", "REPOSITION", "REACT"].map((t, i) => { const l = label([{ t, size: 120, color: "#0d0818" }], { w: 1024, h: 220, bg: ["#ffd166", "#19e3d3", "#ff3d9a"][i] }, 2.6); s.add(l); return l; });
  const al = label([{ t: "!", size: 200, color: "#0d0818" }], { w: 256, h: 256, bg: "#ff3d9a" }, 0.6); s.add(al);
  return { s, c, render(u, A) {
    const tw = A.wait ?? 2, tr = A.repo ?? 3, tre = A.react ?? 4;
    k.position.set(lerp(-14, -1, ease(u / 1.4)), 0, 4);
    const out = ease((u - 1.4) / 0.6);
    J.position.set(lerp(-1, 1.6, ease((u - 1.6) / 1.0)), 0, lerp(4, 0.4, out)); J.rotation.y = Math.PI * 0.75; walk(J, u, u > 1.6 && u < 2.6 ? 9 : 0); J.visible = u > 1.45;
    const repo = ease((u - tr) / 0.7); L.position.set(lerp(-1.4, 2.6, repo), 0, lerp(4.8, lerp(1.2, 0.2, repo), out)); L.visible = u > 1.45; walk(L, u, (u > tr && u < tr + 0.7) ? 9 : 0);
    L.rotation.y = lerp(Math.PI * 0.75, Math.PI, repo); if (u > tre) { L.userData.head.rotation.y = Math.sin((u - tre) * 10) * 0.5 * (1 - ease((u - tre) / 0.8)); }
    tags[0].position.set(J.position.x, 3.2, J.position.z); tags[1].position.set(L.position.x, 3.6, L.position.z); tags[2].position.set(L.position.x + 1.6, 2.6, L.position.z);
    pop(tags[0], at(u, tw, 0.35)); pop(tags[1], at(u, tr, 0.35)); pop(tags[2], at(u, tre, 0.35)); al.position.set(L.position.x, 2.3, L.position.z); pop(al, at(u, tre, 0.3));
    c.position.set(lerp(-2, 2, ease(u / 6)), 11, 13); c.lookAt(0.5, 0.5, 1.5);
  } };
};

// beat 31 — RAGE: engine layers assemble around a city tile
SCENES.rage = () => {
  seed = 111; const s = baseScene({ night: true }); const c = cam(38); particles(s, 500, [30, 16, 30], 0xff9ad5, 0.05);
  const tile = new THREE.Group(); s.add(tile);
  const base = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x1d1033, emissive: PINK, emissiveIntensity: 0.1 })); tile.add(base);
  for (let i = 0; i < 16; i++) { const h = 0.5 + rnd() * 2.6; const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.9), new THREE.MeshStandardMaterial({ color: 0x2a1748, emissive: i % 3 ? 0x12081f : 0x3b1f6b })); b.position.set(-2.2 + (i % 4) * 1.45, h / 2 + 0.15, -2.2 + Math.floor(i / 4) * 1.45); tile.add(b); { const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: i % 2 ? TEAL : PINK })); e.position.copy(b.position); tile.add(e); } }
  const names = [["GRAPHICS", PINK], ["PHYSICS", ORANGE], ["ANIMATION", GOLD], ["WORLD SYSTEMS", TEAL]];
  const layers = names.map(([n, col], i) => { const g = new THREE.Group(); const pl = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 7.2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22 })); g.add(pl); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(pl.geometry), new THREE.LineBasicMaterial({ color: col }))); const l = label([{ t: n, size: 110, color: "#0d0818" }], { w: 1200, h: 200, bg: "#" + col.toString(16).padStart(6, "0") }, 3.0); l.position.set(5.6, 0, 0); g.add(l); s.add(g); return g; });
  const title = extruded("RAGE", 1.4, [PINK, ORANGE]); title.position.set(0, 7.4, 0); s.add(title);
  return { s, c, render(u, A) {
    tile.rotation.y = u * 0.35; pop(title, at(u, 0.2, 0.6)); title.rotation.y = Math.sin(u * 0.8) * 0.3;
    const ts = [A.l0 ?? 1, A.l1 ?? 1.6, A.l2 ?? 2.2, A.l3 ?? 2.8];
    layers.forEach((g, i) => { const v = ease((u - ts[i]) / 0.6); g.position.y = lerp(12, 1.0 + i * 1.25, v); g.visible = v > 0.01; g.rotation.y = u * 0.35; });
    orbit(c, 0, 0, 0, 15, 0.5, 7.5, 3.4);
  } };
};

// beat 33 — what makes it look real: code, physics and artists beam into one world
SCENES.makereal = () => {
  seed = 121; const s = baseScene({ night: true }); ground(s, 40); const c = cam(40);
  const city2 = new THREE.Group(); s.add(city2); const lit = [];
  for (let i = 0; i < 25; i++) { const h = 0.6 + rnd() * 3; const m = new THREE.MeshStandardMaterial({ color: 0x3a2266, emissive: 0x000000 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, h, 0.8), m); b.position.set(-2.4 + (i % 5) * 1.2, h / 2, -2.4 + Math.floor(i / 5) * 1.2); city2.add(b); { const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: 0x6a4aa0 })); e.position.copy(b.position); city2.add(e); } lit.push(m); }
  const src = [["CODE", PINK, -7], ["PHYSICS", ORANGE, 0], ["ARTISTS", TEAL, 7]].map(([t, col, x]) => { const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6 })); o.position.set(x, 5, -6); s.add(o); const l = label([{ t, size: 120, color: "#0d0818" }], { w: 1024, h: 220, bg: "#" + col.toString(16).padStart(6, "0") }, 2.6); l.position.set(x, 6.6, -6); s.add(l); const beam = lineBetween(col); s.add(beam); return { o, l, beam }; });
  const L = label([{ t: "A WORLD THAT FEELS BELIEVABLE", size: 92 }], { w: 2000, h: 200, bg: "rgba(21,11,38,0.9)", border: "#ff3d9a" }, 7.5); L.position.set(0, 5.2, 3); s.add(L);
  return { s, c, render(u, A) {
    const ts = [A.code ?? 0.6, A.physics ?? 1.4, A.art ?? 2.2];
    src.forEach((x, i) => { pop(x.o, at(u, ts[i], 0.4)); pop(x.l, at(u, ts[i], 0.4)); x.o.rotation.y = u * 2; setLine(x.beam, x.o.position, new THREE.Vector3(0, 1.5, 0)); x.beam.visible = u > ts[i] + 0.3; });
    const on = clamp((u - (A.believe ?? 3.4)) / 0.8); lit.forEach((m, i) => m.emissive.setHex(i / lit.length < on ? [PINK, TEAL, ORANGE][i % 3] : 0x000000)); lit.forEach((m) => (m.emissiveIntensity = 0.5));
    pop(L, at(u, A.believe ?? 3.4, 0.5));
    orbit(c, 0, 0, 0, 16, lerp(-0.3, 0.3, ease(u / 6)), 8, 2.5);
  } };
};

// beat 37 — missions that adapt: the road forks into two outcomes
SCENES.branch = () => {
  seed = 131; const s = baseScene({ night: true }); ground(s, 60); const c = cam(40);
  road(s, -6, 0, 12, 3, false); const mkRoad = (rot, col) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(14, 3), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 })); r.rotation.x = -Math.PI / 2; r.rotation.z = rot; r.position.set(6, 0.03, -rot * 9); s.add(r); return r; };
  const ra = mkRoad(0.5, TEAL), rb = mkRoad(-0.5, PINK);
  const k = car(GOLD); s.add(k);
  const A1 = label([{ t: "MISSION A", size: 120, color: "#0d0818" }], { w: 1024, h: 220, bg: "#19e3d3" }, 2.8); A1.position.set(11, 2.5, -6); s.add(A1);
  const B1 = label([{ t: "MISSION B", size: 120 }], { w: 1024, h: 220, bg: "#ff3d9a" }, 2.8); B1.position.set(11, 2.5, 6); s.add(B1);
  const Y = label([{ t: "YOUR CHOICE", size: 110 }], { w: 1100, h: 220, bg: "rgba(21,11,38,0.9)", border: "#ffd166" }, 3.0); Y.position.set(0, 3.2, 0); s.add(Y);
  buildings(s, 50, { spread: 70, avoid: (x, z) => Math.abs(z) < 12 && x > -14 && x < 20, night: true, maxH: 12 });
  return { s, c, render(u, A) {
    const d = A.decide ?? 2.0;
    k.position.set(lerp(-12, 0, ease(u / d)), 0, 0); k.rotation.y = 0;
    pop(Y, at(u, d - 0.6, 0.4)); const g = at(u, d, 0.5); ra.material.opacity = 0.25 + g * 0.5 * (0.5 + 0.5 * Math.sin(u * 6)); rb.material.opacity = 0.25 + g * 0.5 * (0.5 + 0.5 * Math.sin(u * 6 + 3));
    pop(A1, at(u, d + 0.2, 0.4)); pop(B1, at(u, d + 0.45, 0.4));
    orbit(c, 4, 0, 0, 15, -0.75 + u * 0.05, 9, 0.5);
  } };
};

// beat 39 — who controls the story: chaotic speech bubbles get pulled onto a story rail
SCENES.story = () => {
  seed = 141; const s = baseScene(); ground(s, 40); const c = cam(40);
  const N = [-4, 0, 4].map((x, i) => { const p = person([ORANGE, PURPLE, GOLD][i]); p.position.set(x, 0, 0); s.add(p); return p; });
  const words = ["anything!", "random…", "???", "off-script", "spoilers", "nonsense", "lol", "wait what"];
  const B = []; for (let i = 0; i < 18; i++) { const l = label([{ t: words[i % words.length], size: 90 }], { w: 900, h: 220, bg: "rgba(255,255,255,0.95)", color: "#0d0818" }, 1.9); s.add(l); l.userData.o = [rnd() * 6, (rnd() - 0.5) * 10, rnd() * 4 + 2.5, (rnd() - 0.5) * 6, i % 3]; B.push(l); }
  const rail = new THREE.Mesh(new THREE.TorusGeometry(6, 0.08, 8, 80, Math.PI), new THREE.MeshBasicMaterial({ color: TEAL })); rail.rotation.x = Math.PI / 2; rail.position.set(0, 3.6, 0); s.add(rail);
  const checks = ["CONSISTENT", "FUN", "SAFE"].map((t, i) => { const l = label([{ t: t + " ✓", size: 100, color: "#0d0818" }], { w: 1024, h: 220, bg: ["#19e3d3", "#ff8a3d", "#ff3d9a"][i] }, 2.7); l.position.set(-4.5 + i * 4.5, 6.2, 0); s.add(l); return l; });
  return { s, c, render(u, A) {
    const ctl = A.control ?? 2.0; const tidy = ease((u - ctl) / 1.2);
    B.forEach((b, i) => { const [ph, x, y, z, who] = b.userData.o; const cx = N[who].position.x + Math.sin(u * 1.7 + ph) * 1.5 + x * 0.2, cy = y + Math.sin(u * 2.3 + ph) * 0.4; const ang = Math.PI * (i / B.length); const rx = Math.cos(ang) * 6, rz = -Math.sin(ang) * 6; b.position.set(lerp(cx, rx, tidy), lerp(cy, 3.6, tidy), lerp(z * 0.3, rz, tidy)); pop(b, at(u, 0.2 + i * 0.06, 0.3) * (1 - 0.4 * tidy)); });
    rail.visible = tidy > 0.05; rail.scale.setScalar(Math.max(0.001, tidy));
    const ts = [A.consistent ?? 3, A.fun ?? 3.5, A.safe ?? 4]; checks.forEach((l, i) => pop(l, at(u, ts[i], 0.35)));
    orbit(c, 0, 0, 0, 16, lerp(-0.2, 0.2, ease(u / 6)), 7, 2.8);
  } };
};

// beat 41 — human creativity + technology → a world that feels alive
SCENES.merge = () => {
  seed = 151; const s = baseScene({ night: true }); ground(s, 40); const c = cam(40);
  const mkStream = (col, sx) => { const n = 260; const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 0.16, transparent: true, opacity: 0.95 })); s.add(pts); pts.userData = { n, sx, ph: Array.from({ length: n }, () => rnd()) }; return pts; };
  const S1 = mkStream(PINK, -9), S2 = mkStream(TEAL, 9);
  const cityG = new THREE.Group(); s.add(cityG); const mats = [];
  for (let i = 0; i < 30; i++) { const h = 0.6 + rnd() * 3.4; const m = new THREE.MeshStandardMaterial({ color: 0x24143f, emissive: 0x000000, emissiveIntensity: 0.6 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, h, 0.7), m); const a = rnd() * Math.PI * 2, r = rnd() * 3; b.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); cityG.add(b); mats.push(m); }
  const L1 = label([{ t: "HUMAN CREATIVITY", size: 100 }], { w: 1300, h: 220, bg: "#ff3d9a" }, 3.6); L1.position.set(-7.5, 5, 0); s.add(L1);
  const L2 = label([{ t: "TECHNOLOGY", size: 100, color: "#0d0818" }], { w: 1100, h: 220, bg: "#19e3d3" }, 3.2); L2.position.set(7.5, 5, 0); s.add(L2);
  const L3 = label([{ t: "A WORLD THAT FEELS ALIVE", size: 100 }], { w: 1800, h: 220, bg: "rgba(21,11,38,0.92)", border: "#ffd166" }, 6.6); L3.position.set(0, 6.4, 1); s.add(L3);
  return { s, c, render(u, A) {
    const t1 = A.human ?? 0.5, t2 = A.tech ?? 1.6, t3 = A.alive ?? 3.6;
    for (const [S, t] of [[S1, t1], [S2, t2]]) { const p = S.geometry.attributes.position; const { n, sx, ph } = S.userData; for (let i = 0; i < n; i++) { const f = ((u - t) * 0.5 + ph[i]) % 1; const vis = u > t; const x = lerp(sx, 0, f), y = 4 + Math.sin(f * Math.PI) * 2 - f * 3, z = Math.sin(ph[i] * 40) * 1.2 * (1 - f); p.setXYZ(i, vis ? x : 999, y, z); } p.needsUpdate = true; }
    pop(L1, at(u, t1, 0.4)); pop(L2, at(u, t2, 0.4));
    const on = clamp((u - t3) / 1.0); mats.forEach((m, i) => m.emissive.setHex(i / mats.length < on ? [PINK, TEAL, ORANGE, GOLD][i % 4] : 0x000000));
    pop(L3, at(u, t3, 0.5)); cityG.rotation.y = u * 0.2;
    orbit(c, 0, 0, 0, 17, Math.sin(u * 0.2) * 0.2, 7, 3);
  } };
};

// end screen background — slow night flythrough
SCENES.endscreen = () => {
  seed = 161; const s = baseScene({ night: true, fog: [20, 90] }); ground(s, 90); road(s, 0, 0, 6, 200); buildings(s, 160, { night: true, maxH: 20, spread: 90, avoid: (x) => Math.abs(x) < 5 });
  for (let z = -90; z < 60; z += 8) { palm(s, -4, z); palm(s, 4, z + 4); }
  particles(s, 800, [80, 25, 150]); const c = cam(50);
  return { s, c, render(u) { c.position.set(Math.sin(u * 0.2) * 1.2, 5 + Math.sin(u * 0.3) * 0.5, 40 - u * 5); c.lookAt(0, 3, c.position.z - 30); } };
};

// ── runtime ──────────────────────────────────────────────────────────────
const tex = {};
const loader = new THREE.TextureLoader();
const built = [];
async function boot() {
  await document.fonts.load("900 64px Inter"); await document.fonts.load("700 64px Inter");
  FONT = new FontLoader().parse(await (await fetch("fonts/helvetiker_bold.typeface.json")).json());
  tex.jason = await loader.loadAsync("media/jason.jpg"); tex.jason.colorSpace = THREE.SRGBColorSpace;
  const cache = {};
  for (const e of ENTRIES) { const f = SCENES[e.name]; if (!f) { console.error("no 3D scene " + e.name); continue; } try { built.push({ e, sc: f(tex) }); } catch (err) { console.error("3D scene failed", e.name, err); } }
  renderAt(window.__hfThreeTime || 0);
}
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["gta6-3d"] = boot();
const FADE = 0.3;
function renderAt(t) {
  const cur = built.find(({ e }) => t >= e.t0 && t < e.t1);
  if (!cur) { canvas.style.opacity = "0"; return; }
  const { e, sc } = cur; const u = t - e.t0;
  canvas.style.opacity = String(Math.min(1, u / FADE, (e.t1 - t) / FADE));
  sc.render(u, e.a || {}, e.t1 - e.t0); renderer.render(sc.s, sc.c);
}
window.addEventListener("hf-seek", (ev) => renderAt(ev.detail.time));
