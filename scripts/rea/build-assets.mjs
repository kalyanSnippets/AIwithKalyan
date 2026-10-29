// Builds the REA "create locally" graphics (A03, A05, A08, A10, A15) as HyperFrames projects.
// Usage: node scripts/rea/build-assets.mjs   then render each with
//   npx hyperframes render compositions/rea-<id> -o REA/renders/assets/<id>.mp4
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FONT = path.join(ROOT, "compositions/CLD_1279-intro/fonts");
const GSAP = path.join(ROOT, "node_modules/gsap/dist/gsap.min.js");

const C = { bg: "#14171a", panel: "#1d2226", line: "#2c353b", text: "#eef3f2", dim: "#93a3a1", teal: "#2dd4bf", lime: "#a3e635", amber: "#fbbf24", red: "#f87171" };

const icon = {
  eye: `<svg viewBox="0 0 64 64"><path d="M4 32C12 18 22 12 32 12s20 6 28 20C52 46 42 52 32 52S12 46 4 32Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="32" r="9" fill="currentColor"/></svg>`,
  doc: `<svg viewBox="0 0 64 64"><path d="M14 6h26l12 12v40H14Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M40 6v12h12M22 30h22M22 40h22M22 50h14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  build: `<svg viewBox="0 0 64 64"><rect x="6" y="10" width="14" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><rect x="25" y="10" width="14" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><rect x="44" y="10" width="14" height="38" rx="3" fill="none" stroke="currentColor" stroke-width="4"/></svg>`,
  cols: `<svg viewBox="0 0 64 64"><rect x="6" y="10" width="14" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><rect x="25" y="10" width="14" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><rect x="44" y="10" width="14" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="4"/></svg>`,
  card: `<svg viewBox="0 0 64 64"><rect x="8" y="14" width="48" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M16 26h32M16 36h20" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  drag: `<svg viewBox="0 0 64 64"><path d="M22 8l0 38 9-8 7 16 8-4-7-15 12-1Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
  tag: `<svg viewBox="0 0 64 64"><path d="M8 8h24l24 24-24 24L8 32Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="21" cy="21" r="5" fill="currentColor"/></svg>`,
  cal: `<svg viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M8 26h48M20 6v12M44 6v12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 64 64"><path d="M10 18l7 7 12-14M10 40l7 7 12-14M38 22h18M38 44h18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  disk: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="16" rx="22" ry="8" fill="none" stroke="currentColor" stroke-width="4"/><path d="M10 16v32c0 5 10 8 22 8s22-3 22-8V16M10 32c0 5 10 8 22 8s22-3 22-8" fill="none" stroke="currentColor" stroke-width="4"/></svg>`,
  term: `<svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M16 26l10 8-10 8M32 44h16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  wrench: `<svg viewBox="0 0 64 64"><path d="M44 8a14 14 0 0 0-12 20L8 52l4 4 24-24a14 14 0 0 0 20-12l-9 9-7-2-2-7Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
  box: `<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="6" fill="#000" fill-opacity=".9" stroke="currentColor" stroke-width="4"/><path d="M22 32h20M32 22v20" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  test: `<svg viewBox="0 0 64 64"><path d="M24 6h16M28 6v18L10 54a4 4 0 0 0 4 6h36a4 4 0 0 0 4-6L36 24V6" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
  fast: `<svg viewBox="0 0 64 64"><path d="M36 4L12 36h18l-4 24 26-34H34Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
};

const BASE_CSS = `
@font-face{font-family:"Inter";src:url("fonts/Inter-400-latin.woff2") format("woff2");font-weight:400;font-display:block}
@font-face{font-family:"Inter";src:url("fonts/Inter-700-latin.woff2") format("woff2");font-weight:700;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}
#stage{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:"Inter",sans-serif;color:${C.text}}
.bg{position:absolute;inset:0;background:radial-gradient(1400px 900px at 50% 35%,#1f2a2d,${C.bg} 70%)}
svg{display:block;width:100%;height:100%}
.abs{position:absolute}
`;

function write(id, { dur, body, css = "", js, transparent = false }) {
  const dir = path.join(ROOT, `compositions/rea-${id}`);
  fs.mkdirSync(path.join(dir, "fonts"), { recursive: true });
  fs.mkdirSync(path.join(dir, "vendor"), { recursive: true });
  for (const f of ["Inter-400-latin.woff2", "Inter-700-latin.woff2"]) fs.copyFileSync(path.join(FONT, f), path.join(dir, "fonts", f));
  fs.copyFileSync(GSAP, path.join(dir, "vendor/gsap.min.js"));
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ id: `rea-${id}`, name: `REA ${id}` }, null, 2));
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<!-- GENERATED by scripts/rea/build-assets.mjs — edit the builder, not this file. -->
<style>${BASE_CSS}${transparent ? "" : ""}${css}</style></head>
<body>
<div id="stage" data-composition-id="rea-${id}" data-start="0" data-duration="${dur}" data-fps="30" data-width="1920" data-height="1080">
${transparent ? "" : '<div class="bg"></div>'}
${body}
<script src="vendor/gsap.min.js"></script>
<script>
(function(){
  const tl = gsap.timeline({ paused: true });
  const IN = (s, at, v = {}) => tl.fromTo(s, { opacity: 0, y: 40, ...v }, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" }, at);
  ${js}
  window.__timelines = window.__timelines || {};
  window.__timelines["rea-${id}"] = tl;
})();
</script>
</div></body></html>`);
}

/* A03 — 3-step explainer, 15 s */
write("A03", {
  dur: 15,
  css: `.title{left:0;right:0;top:90px;text-align:center;font:700 60px Inter;letter-spacing:.02em}
.step{top:270px;width:480px;height:560px;border-radius:36px;background:${C.panel};border:2px solid ${C.line};text-align:center;padding-top:56px}
.step .ic{width:150px;height:150px;margin:0 auto 34px}
.step h3{margin:0;font:700 54px Inter}.step p{margin:18px 40px 0;font:400 30px/1.35 Inter;color:${C.dim}}
.step .n{position:absolute;left:28px;top:22px;font:700 28px Inter;color:${C.dim}}
.arrow{top:520px;width:96px;height:60px;color:${C.lime}}
#s1{left:130px;color:${C.teal}}#s2{left:720px;color:${C.lime}}#s3{left:1310px;color:${C.teal}}
.step h3,.step p{color:inherit}.step p{color:${C.dim}}
.foot{left:0;right:0;bottom:90px;text-align:center;font:400 34px Inter;color:${C.dim}}`,
  body: `<div class="abs title" id="t">How REA works</div>
<div class="abs step" id="s1"><div class="n">1</div><div class="ic">${icon.eye}</div><h3>Observe</h3><p>Look at how the app really behaves</p></div>
<div class="abs arrow" id="a1"><svg viewBox="0 0 140 60"><path d="M6 30h118M96 8l28 22-28 22" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div>
<div class="abs step" id="s2"><div class="n">2</div><div class="ic">${icon.doc}</div><h3>Evidence</h3><p>Every finding comes with proof</p></div>
<div class="abs arrow" id="a2" style="left:1202px"><svg viewBox="0 0 140 60"><path d="M6 30h118M96 8l28 22-28 22" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div>
<div class="abs step" id="s3"><div class="n">3</div><div class="ic">${icon.build}</div><h3>Build your own</h3><p>An independent version, your design</p></div>
<div class="abs foot" id="f">Study first. Build later.</div>`,
  js: `
tl.set("#a1", { left: 612 });
IN("#t", 0.2); IN("#s1", 1.0, { x: -60 });
tl.to("#a1 path", { strokeDashoffset: 0, duration: 0.6, ease: "power3.out" }, 2.4);
IN("#s2", 3.4, { x: -60 });
tl.to("#a2 path", { strokeDashoffset: 0, duration: 0.6, ease: "power3.out" }, 4.8);
IN("#s3", 5.8, { x: -60 });
IN("#f", 8.5);
tl.to("#s1,#s2,#s3", { y: -10, duration: 0.5, ease: "sine.inOut", stagger: 0.3, yoyo: true, repeat: 1 }, 10);
tl.to("#stage > *", { opacity: 0, duration: 0.5, ease: "power2.in" }, 14.4);`,
});

/* A05 — transparent lower-third chips, 8 s */
write("A05", {
  dur: 8,
  transparent: true,
  css: `.lt{left:120px;bottom:120px;display:flex;gap:28px}
.chip{display:flex;align-items:center;gap:22px;padding:26px 44px 26px 30px;border-radius:24px;background:rgba(20,23,26,.92);border:3px solid currentColor;font:700 52px Inter;letter-spacing:.06em}
.chip i{width:34px;height:34px;border-radius:50%;background:currentColor;display:block}
.chip small{display:block;font:400 24px Inter;letter-spacing:0;color:${C.dim};margin-top:4px}
.chip div{line-height:1.05}
#c1{color:${C.teal}}#c2{color:${C.amber}}#c3{color:${C.red}}`,
  body: `<div class="abs lt">
<div class="chip" id="c1"><i></i><div>OBSERVED<small>seen in the evidence</small></div></div>
<div class="chip" id="c2"><i></i><div>INFERRED<small>reasoned from it</small></div></div>
<div class="chip" id="c3"><i></i><div>NOT SURE<small>not enough proof</small></div></div></div>`,
  js: `
IN("#c1", 0.4, { x: -80 }); IN("#c2", 1.4, { x: -80 }); IN("#c3", 2.4, { x: -80 });
tl.to("#c1 i,#c2 i,#c3 i", { scale: 1.5, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.12, ease: "sine.inOut" }, 3.8);
tl.to(".lt", { opacity: 0, y: 30, duration: 0.5, ease: "power2.in" }, 7.3);`,
});

/* A08 — feature checklist, 27 s (anim ~12 s then holds) */
const feats = [
  ["cols", "Columns"], ["card", "Cards"], ["drag", "Drag and drop"], ["tag", "Labels"],
  ["cal", "Due dates"], ["check", "Checklists"], ["disk", "Saves in your browser"],
];
write("A08", {
  dur: 12,
  css: `.title{left:0;right:0;top:70px;text-align:center;font:700 58px Inter}.title span{color:${C.teal}}
.g{position:absolute;left:150px;right:150px;top:210px;display:grid;grid-template-columns:repeat(4,1fr);gap:40px 34px}
.f{height:380px;border-radius:32px;background:${C.panel};border:2px solid ${C.line};text-align:center;padding-top:40px;position:relative;color:${C.teal}}
.f .ic{width:150px;height:150px;margin:20px auto 30px}.f h4{margin:0;font:700 44px Inter;color:${C.text}}
.f .tk{position:absolute;right:20px;top:20px;width:52px;height:52px;color:${C.lime};opacity:0}
.f.wide{grid-column:span 1}`,
  body: `<div class="abs title" id="t">What REA Board <span>will do</span></div>
<div class="g">${feats.map(([i, n], k) => `<div class="f" id="f${k}"><div class="ic">${icon[i]}</div><h4>${n}</h4><div class="tk" id="k${k}"><svg viewBox="0 0 52 52"><path d="M8 27l12 12 24-26" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></div></div>`).join("")}
<div class="f" id="f7" style="color:${C.dim}"><h4 style="margin-top:110px;color:${C.dim}">Small, honest scope</h4></div></div>`,
  js: `
IN("#t", 0.2);
for (let k = 0; k < 7; k++) {
  IN("#f" + k, 0.8 + k * 0.45);
  tl.set("#k" + k, { opacity: 1 }, 1.5 + k * 0.45);
  tl.to("#k" + k + " path", { strokeDashoffset: 0, duration: 0.35, ease: "power3.out" }, 1.5 + k * 0.45);
}
IN("#f7", 4.6);
tl.to("#stage > *", { opacity: 0, duration: 0.5, ease: "power2.in" }, 11.4);`,
});

/* A10 — Windows setup card, 12 s */
write("A10", {
  dur: 12,
  css: `.t{left:0;right:0;top:110px;text-align:center;font:700 72px Inter}.t span{color:${C.teal}}
.row{top:300px;left:200px;right:200px;display:flex;gap:60px;align-items:stretch}
.opt{flex:1;height:340px;border-radius:36px;background:${C.panel};border:2px solid ${C.line};text-align:center;padding-top:44px;color:${C.teal}}
.opt .ic{width:130px;height:130px;margin:0 auto 24px}.opt h3{margin:0;font:700 56px Inter;color:${C.text}}.opt p{margin:12px 0 0;font:400 30px Inter;color:${C.dim}}
.or{align-self:center;font:700 44px Inter;color:${C.dim}}
.doc{left:200px;right:200px;top:700px;height:150px;border-radius:28px;background:#0e1113;border:2px solid ${C.line};display:flex;align-items:center;padding:0 44px;gap:30px}
.doc b{font:700 26px Inter;letter-spacing:.14em;color:${C.lime}}.doc code{font:400 34px "Courier New",monospace;color:${C.text}}
.note{left:0;right:0;top:900px;text-align:center;font:400 32px Inter;color:${C.dim}}`,
  body: `<div class="abs t" id="t">Windows? <span>Use Git Bash or WSL</span></div>
<div class="abs row"><div class="opt" id="o1"><div class="ic">${icon.term}</div><h3>Git Bash</h3><p>Comes with Git for Windows</p></div><div class="or" id="or">or</div><div class="opt" id="o2" style="color:${C.lime}"><div class="ic">${icon.wrench}</div><h3>WSL</h3><p>Windows Subsystem for Linux</p></div></div>
<div class="abs doc" id="d"><b>OFFICIAL GUIDE</b><code>docs.anthropic.com/en/docs/claude-code/getting-started</code></div>
<div class="abs note" id="n">Follow Anthropic's current Windows guide — steps change.</div>`,
  js: `
IN("#t", 0.2); IN("#o1", 1.0, { x: -80 }); IN("#or", 1.6); IN("#o2", 2.0, { x: 80 }); IN("#d", 3.4); IN("#n", 4.6);
tl.to("#stage > *", { opacity: 0, duration: 0.5, ease: "power2.in" }, 11.4);`,
});

/* A15 — four verdict cards, 28 s */
const cards = [
  ["term", "Setup effort", "Terminal, Node and an agent to install first"],
  ["box", "Black-box limits", "REA sees behaviour, not the hidden server code"],
  ["test", "Prompts and testing", "Output is only as good as your prompt and your checks"],
  ["fast", "Fast-moving tools", "Versions and steps change often — re-check"],
];
write("A15", {
  dur: 28,
  css: `.g{position:absolute;inset:0}
.card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.card .num{font:700 420px/1 Inter;color:${C.teal};opacity:.16;position:absolute;top:60px}
.card .ic{width:200px;height:200px;color:${C.lime};margin-bottom:36px;position:relative}
.card h2{margin:0;font:700 120px Inter;position:relative}.card p{margin:28px 260px 0;font:400 46px/1.3 Inter;color:${C.dim};position:relative}
.dots{left:0;right:0;bottom:70px;display:flex;justify-content:center;gap:20px}.dots i{width:18px;height:18px;border-radius:50%;background:${C.line};display:block}
.dots i.on{background:${C.teal}}
.hd{left:0;right:0;top:70px;text-align:center;font:700 34px Inter;letter-spacing:.2em;color:${C.dim}}`,
  body: `<div class="abs hd">THE HONEST VERDICT</div>${cards.map(([i, h, p], k) => `<div class="card" id="c${k}"><div class="num">${k + 1}</div><div class="ic">${icon[i]}</div><h2>${h}</h2><p>${p}</p></div>`).join("")}
<div class="abs dots">${cards.map((_, k) => `<i id="d${k}"></i>`).join("")}</div>`,
  js: `
const T = 6.5;
for (let k = 0; k < 4; k++) {
  const s = 0.3 + k * T;
  tl.set("#d" + k, { backgroundColor: "${C.teal}" }, s);
  tl.fromTo("#c" + k, { opacity: 0, x: 140 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, s);
  tl.fromTo("#c" + k + " .ic", { scale: 0.4, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.8)" }, s + 0.15);
  tl.fromTo("#c" + k + " .num", { scale: 1.3 }, { scale: 1, duration: 0.9, ease: "power3.out" }, s);
  if (k < 3) tl.to("#c" + k, { opacity: 0, x: -140, duration: 0.5, ease: "power2.in" }, s + T - 0.55);
}
tl.to("#stage > *", { opacity: 0, duration: 0.5, ease: "power2.in" }, 27.4);`,
});
console.log("built A03 A05 A08 A10 A15");
