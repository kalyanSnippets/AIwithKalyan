
// ===== S6 four reasons with the real prompt in a side panel — authored in NEW cut times (no warp) =====
tl = gsap.timeline(); main.add(tl, 0); const N = tl;
const ppIn = $("#ppIn");
function ppTo(sel, at, d = .6) { const y = -Math.max(0, $(sel).offsetTop - 30); tl.to("#ppIn", { y, duration: d, ease: "power3.inOut" }, at); }
function phl(sel, at, d = .5) { document.querySelectorAll(sel).forEach((el, i) => { tl.to(el, { backgroundSize: "100% 100%", duration: d, ease: "power2.out" }, at + i * .25); tl.set(el, { attr: { class: "phl lit" } }, at + i * .25); }); }
function rh(id, a, b) { tl.set(id, { visibility: "visible", opacity: 1 }, a); tl.fromTo(id, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: bo, immediateRender: false }, a); tl.to(id, { opacity: 0, duration: .2 }, b - .2); tl.set(id, { visibility: "hidden" }, b); }
function lv(id, a, b) { tl.set(id, { visibility: "visible", opacity: 1 }, a); tl.to(id, { opacity: 0, duration: .2 }, b - .2); tl.set(id, { visibility: "hidden" }, b); }
chap("#pps", 224.45, 252.45);
tl.fromTo("#pp", { x: 700, opacity: 0 }, { x: 0, opacity: 1, duration: .55, ease: "expo.out", immediateRender: false }, 224.5);
// 1 · measure first, don't guess
rh("#rn1", 224.57, 232.4); lv("#r1v", 224.57, 232.4);
ppTo("#psMeasure", 224.7);
phl("#psMeasure .phl", 225.2);
tl.to("#r1w", { opacity: 1, duration: .3 }, 226.3); tl.fromTo("#r1w", { y: 60 }, { y: 0, duration: .45, ease: bo, immediateRender: false }, 226.3);
tl.to("#r1hl", { opacity: 1, duration: .2 }, 228.55);
tl.to("#swBlue", { opacity: 1, duration: .2 }, 229.55); tl.fromTo("#swBlue", { scale: 0 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 229.55);
tl.to("#swHex", { opacity: 1, duration: .2 }, 231.05); tl.fromTo("#swHex", { scale: 0 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 231.05);
// 2 · the stack is fixed
rh("#rn2", 232.45, 238.7); lv("#r2v", 232.45, 238.7);
ppTo("#psStack", 232.5);
phl("#psStack .phl", 233.5);
[["#sk1", 235.19], ["#sk2", 235.77], ["#sk3", 236.33]].forEach(([s, at]) => { tl.to(s, { opacity: 1, duration: .2 }, at); tl.fromTo(s, { x: -80 }, { x: 0, duration: .4, ease: bo, immediateRender: false }, at); });
tl.to("#sk4", { opacity: 1, duration: .25 }, 237.35); tl.fromTo("#sk4", { scale: .6 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 237.35);
// 3 · every part of the screen
rh("#rn3", 238.77, 245.45); lv("#r3v", 238.77, 245.45);
ppTo("#psBoard", 238.85);
document.querySelectorAll(".wl2").forEach((el, i) => tl.to(el, { opacity: 1, duration: .25 }, 242.07 + i * .1));
const wbs = document.querySelectorAll(".wb");
[242.07, 242.63, 243.53, 244.43].forEach((at, i) => tl.set(wbs[i], { attr: { class: "wb on" } }, at));
phl("#psBoard .phl", 242.07, .4);
ppTo("#psPanel", 243.35, .45); phl("#psPanel .phl", 243.53, .5);
tl.fromTo("#wp2", { x: 140 }, { x: 0, duration: .35, ease: p3, immediateRender: false }, 243.53);
phl("#psInter .phl", 244.43, .4);
tl.to("#wd2", { opacity: 1, duration: .1 }, 244.43); tl.to("#wd2", { x: 118, y: 20, rotate: 3, duration: .6, ease: "power2.inOut" }, 244.5);
// 4 · testing
rh("#rn4", 245.53, 252.45); lv("#r4v", 245.53, 252.45);
tl.fromTo("#rn4h", { scale: 0 }, { scale: 1.3, duration: .3, ease: bo, yoyo: true, repeat: 1, immediateRender: false }, 246.85);
ppTo("#psTest", 245.6);
phl("#psTest .phl", 247.93, .5);
document.querySelectorAll(".t4").forEach((el, i) => tl.to(el, { opacity: 1, duration: .25 }, 248.6 + i * .15));
document.querySelectorAll(".tk4").forEach((k, i) => tl.fromTo(k, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .3, ease: bo, immediateRender: false }, 249.99 + i * .5));
tl.to("#t4saw", { opacity: 1, duration: .3 }, 251.47);
N.shiftChildren(-B);
tl = main;
