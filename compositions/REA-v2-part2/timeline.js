// ===== content timeline, authored in CUT time (REA/edits/REA-v2.cut-words.json), shifted by -B =====
const B = 147.567; // part 2 starts here in the cut (after the 31 Oct review fixes)
tl = gsap.timeline(); main.add(tl, 0); const C = tl;
function typeIn(sel, at, d = .6) { // typed command
  const el = $(sel), txt = el.dataset.t, k = { n: 0 };
  tl.to(k, { n: txt.length, duration: d, ease: "none", onUpdate: () => { el.textContent = txt.slice(0, Math.round(k.n)); } }, at);
}
function win(id, a, b) {
  tl.set(id, { visibility: "visible" }, a);
  tl.fromTo(id, { y: 80, opacity: 0, scale: .95 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: p3, immediateRender: false }, a);
  tl.to(id, { opacity: 0, y: -40, duration: .25 }, b - .25);
  tl.set(id, { visibility: "hidden" }, b);
}
function chap(id, a, b) { tl.set(id, { visibility: "visible", opacity: 1 }, a); tl.to(id, { opacity: 0, duration: .25 }, b - .25); tl.set(id, { visibility: "hidden" }, b); }
function step(n, a, d = .95) {
  const id = "#st" + n;
  chap(id, a, a + d);
  tl.fromTo(id + " .snum", { scale: 1.6, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .45, ease: "expo.out", immediateRender: false }, a);
  tl.fromTo(id + " .sic", { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: .45, ease: bo, immediateRender: false }, a + .08);
  tl.fromTo(id + " .stt", { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: p3, immediateRender: false }, a + .12);
  if (n === 3) tl.fromTo(id + " .sbadge", { scale: 0 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, a + .3);
  const dots = document.querySelectorAll("#stDots span");
  tl.set(dots[n - 1], { className: "on" }, a);
  tl.fromTo(dots[n - 1], { scale: 1 }, { scale: 1.3, duration: .2, yoyo: true, repeat: 1, immediateRender: false }, a);
}

// ---------- S4 · subscribe (145.65 – 156.3) ----------
stk("#sReq", 146.75, 149.9, { y: -40, opacity: 0, scale: .8, rotate: 0, x: 0 });
stk("#subCard", 150.2, 155.2);
tl.fromTo("#subCur", { x: 260, y: 160, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .45, ease: "power2.out", immediateRender: false }, 150.3);
tl.to("#subCur", { scale: .8, duration: .08, yoyo: true, repeat: 1 }, 150.78);
tl.to("#subB", { scale: .92, duration: .08, yoyo: true, repeat: 1 }, 150.78);
tl.set("#subB", { background: "#3a3d44", color: "#F6F1EC" }, 150.86); tl.set("#subT1", { display: "none" }, 150.86); tl.set("#subT2", { display: "inline" }, 150.86);
tl.to("#bellI", { rotate: 18, duration: .08, yoyo: true, repeat: 7, ease: "none", transformOrigin: "50% 10%" }, 151.05);
tl.to("#subCur", { x: -275, y: 0, duration: .35, ease: "power2.inOut" }, 151.5);
tl.to("#likeB", { background: "#E8775F", scale: 1.15, duration: .2, ease: bo }, 151.9); tl.to("#likeB", { scale: 1, duration: .2 }, 152.15);
tl.to("#subCur", { opacity: 0, duration: .2 }, 152.6);
tl.to("#growR", { opacity: 1, duration: .3 }, 153.55); tl.fromTo("#growR", { y: 20 }, { y: 0, duration: .35, ease: bo, immediateRender: false }, 153.55);
whip(155.95);

// ---------- S5 · setup (156.3 – 208.4) ----------
stk("#sWin", 156.6, 158.35);
pipIn(158.3);
tl.set("#stDots", { visibility: "visible" }, 158.4); tl.fromTo("#stDots", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: .35, immediateRender: false }, 158.4);
step(1, 158.45);
win("#w1", 159.35, 161.6); typeIn("#w1 .ty", 160.65);
step(2, 161.62);
win("#w2", 162.5, 167.05); typeIn("#w2 div:nth-child(1) .ty", 164.74, .7); typeIn("#w2 div:nth-child(2) .ty", 166.1, .55);
step(3, 167.07);
win("#w3", 168.05, 171.55); typeIn("#w3 .ty", 170.08, .5);
tl.to("#w3", { scale: 1.04, duration: .15, yoyo: true, repeat: 1 }, 170.6);
// real: "Install the guided REA skill?" → Yes → "REA is ready"
showB("#fSkill", 171.5, 179.35);
hl("#hlSk1", 172.33, 175.6);
shiftL("#fSkill", 174.5); stk("#sYes", 174.7, 176.6);
hl("#hlSk2", 175.83);
stk("#sEasy", 178.6, 179.35, { scale: 0, rotate: -20, opacity: 0, x: 0 });
step(4, 179.4);
win("#w4", 180.4, 191.25);
typeIn("#w4 div:nth-child(2) .ty", 185.3, 1.0); typeIn("#w4 div:nth-child(3) .ty", 188.26, .5);
tl.to("#w4ok", { opacity: 1, duration: .2 }, 189.8);
stk("#sBoom", 189.8, 191.2, { scale: 0, rotate: -15, opacity: 0, x: 0 });
step(5, 191.3, .75);
win("#w5", 192.0, 192.85); typeIn("#w5 .ty", 192.1, .25);
tl.to("#stDots", { opacity: 0, duration: .25 }, 192.6); tl.set("#stDots", { visibility: "hidden" }, 192.9);
showB("#fTheme", 192.8, 196.05);
zoomTo("#fTheme .zoom", 193.4, 1.6, 300, 450, .8, 1600, 830);
hl("#hlTh", 195.15);
showB("#fAuth", 196.0, 198.9);
hl("#hlAu", 196.6);
showB("#fAuto", 198.85, 202.2);
hl("#hlOp", 199.4); hl("#hlAm", 201.0, null, false);
tl.set("#sOpus, #sAuto", { visibility: "visible" }, 199.4);
tl.fromTo("#sOpus", { scale: 0, rotate: -10 }, { scale: 1, rotate: 0, duration: .4, ease: bo, immediateRender: false }, 199.45);
tl.fromTo("#sAuto", { scale: 0, rotate: 10 }, { scale: 1, rotate: 0, duration: .4, ease: bo, immediateRender: false }, 201.03);
tl.to("#sOpus, #sAuto", { opacity: 0, duration: .2 }, 202.0); tl.set("#sOpus, #sAuto", { visibility: "hidden" }, 202.2);
// auto mode: permissions approve themselves
chap("#perm", 202.2, 208.4);
tl.fromTo("#permT", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .35, immediateRender: false }, 202.25);
[["#pq1", 202.7], ["#pq2", 203.35], ["#pq3", 203.9], ["#pq4", 204.5]].forEach(([q, at]) => {
  tl.fromTo(q, { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: .35, ease: p3, immediateRender: false }, at - .25);
  tl.fromTo(q + " .pk", { scale: 0 }, { scale: 1, duration: .3, ease: bo, immediateRender: false }, at + .15);
});
tl.to("#noClick", { opacity: 1, duration: .2 }, 205.75); tl.fromTo("#noClick", { scale: .5 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 205.75);
tl.to("#sNice", { opacity: 1, duration: .2 }, 207.95); tl.fromTo("#sNice", { scale: 0, rotate: -15 }, { scale: 1, rotate: -3, duration: .35, ease: bo, immediateRender: false }, 207.95);

// ---------- S6 · prompt (208.4 – 260.3) ----------
chap("#chP", 208.45, 211.45);
tl.fromTo("#chPa", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .3, immediateRender: false }, 209.1);
tl.fromTo("#chPb", { opacity: 0, scale: 1.8, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .35, ease: "expo.out", immediateRender: false }, 210.45);
tl.fromTo("#chPc", { opacity: 0, scale: 2.4, filter: "blur(30px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .4, ease: "expo.out", immediateRender: false }, 210.65);
chap("#chS", 211.5, 213.75);
tl.fromTo("#chSi", { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, duration: .5, ease: bo, immediateRender: false }, 211.55);
tl.fromTo("#chSa", { opacity: 0, x: 200 }, { opacity: 1, x: 0, duration: .3, ease: "expo.out", immediateRender: false }, 212.7);
tl.fromTo("#chSb", { opacity: 0, scale: 2, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .35, ease: "expo.out", immediateRender: false }, 213.0);
showB("#fPrompt", 213.75, 220.05);
tl.fromTo("#fPrompt .zoom", { y: 0 }, { y: -40, duration: 2.4, ease: "none", immediateRender: false }, 213.9);
shiftL("#fPrompt", 216.2); stk("#sDesc", 216.4, 220.0);
tl.to("#sDescA", { y: 18, duration: .3, yoyo: true, repeat: 7, ease: "sine.inOut" }, 217.0);
chap("#why", 220.05, 223.45);
tl.fromTo("#why .k1", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .4, ease: p3, stagger: .25, immediateRender: false }, 220.1);
tl.fromTo(".wd", { scale: 0 }, { scale: 1, duration: .3, ease: bo, stagger: .12, immediateRender: false }, 222.2);
function rsn(id, a, b) { tl.set(id, { visibility: "visible", opacity: 1 }, a); tl.fromTo(id, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: bo, immediateRender: false }, a); tl.to(id, { opacity: 0, duration: .2 }, b - .2); tl.set(id, { visibility: "hidden" }, b); }
// (four reasons: rebuilt with the real prompt side panel in prompt-reasons.js)
// AI loves to say "done" → prove it
chap("#prove", 252.75, 257.65);
tl.fromTo("#bub", { scale: 0, rotate: -6 }, { scale: 1, rotate: 0, duration: .45, ease: bo, immediateRender: false }, 254.9);
tl.to("#bubQ", { opacity: 1, duration: .2 }, 255.4);
tl.fromTo("#stamp", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: .25, ease: "power4.in", immediateRender: false }, 256.8);
tl.to("#prove", { x: 10, duration: .04, yoyo: true, repeat: 5 }, 257.05);
// press Enter, now we wait
chap("#enter", 257.65, 260.35);
tl.fromTo("#key", { y: 0 }, { y: 22, boxShadow: "0 4px 0 #0e0f12,0 20px 40px rgba(0,0,0,.6)", duration: .1, yoyo: true, repeat: 1, immediateRender: false }, 258.24);
tl.to("#wait", { opacity: 1, duration: .3 }, 259.3); tl.to("#waitI", { rotate: 180, duration: .6, ease: "power2.inOut" }, 259.5);

// ---------- S7 · Remotion insert (260.3 – 300.35), PiP drawn inside ----------
// ---------- S8 · all 50 checks → guess (300.35 – 317.25) ----------
showB("#fDone", 300.35, 304.1);
tl.set("#fDone", { x: 0, scale: 1 }, 300.34); tl.set("#fDone .zoom", { scale: 1, x: 0, y: 0 }, 300.34); tl.set("#hlMeas", { opacity: 0 }, 300.34);
zoomTo("#fDone .zoom", 300.8, 1.7, 300, 60, .8, 1600, 830);
hl("#hlAll", 302.3);
shiftL("#fDone", 302.4); stk("#s50", 302.6, 304.05);
const c50 = { v: 0 }, n50 = $("#n50"), r50 = $("#ring50");
tl.to(c50, { v: 50, duration: .8, ease: "power3.out", onUpdate: () => { n50.textContent = Math.round(c50.v) + "/50"; r50.setAttribute("stroke-dashoffset", 528 * (1 - c50.v / 50)); } }, 302.68);
pipOut(304.05);
stk("#sWait", 304.15, 306.45);
pipIn(306.5);
chap("#poll", 306.55, 315.9);
tl.fromTo("#pollT", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: .4, ease: bo, immediateRender: false }, 307.15);
const pbs = document.querySelectorAll(".pb"); [310.32, 311.34, 312.24].forEach((at, i) => tl.fromTo(pbs[i], { scale: 0, rotate: -8 }, { scale: 1, rotate: 0, duration: .45, ease: bo, immediateRender: false }, at));
tl.to(".pb", { y: -18, duration: .3, yoyo: true, repeat: 1, ease: "sine.inOut", stagger: .12 }, 313.0);
tl.to("#pollC", { opacity: 1, duration: .25 }, 312.9); tl.fromTo("#pollC", { y: 60 }, { y: 0, duration: .4, ease: bo, immediateRender: false }, 312.9);
tl.to("#pollH", { opacity: 1, duration: .3 }, 314.5);
pipOut(315.85);
whip(316.85);

// time map from the previous cut (v3) to this one: [old time, offset] change points
const WARP = [[0.0, 0.0], [80.66, 0.4], [88.406, 0.965], [96.121, 1.517], [99.881, 1.917], [159.775, 1.697], [216.235, 1.045], [226.602, -0.294], [260.469, -0.321], [279.929, -0.246], [292.069, -11.273]];
const W = (t) => { let o = 0; for (const [a, off] of WARP) { if (t >= a) o = off; else break; } return t + o; };
C.getChildren(false, true, true).forEach((c) => c.startTime(W(c.startTime())));
C.shiftChildren(-B);
tl = main;
// ---------- captions (local time = cut − B), hidden while graphics carry the words ----------
const HIDE = [[146.75, 149.9], [150.2, 155.2], [158.3, 304.05], [306.5, 315.9]].map(([a, b]) => [W(a) - B, W(b) - B]);
const HOT = new Set(["subscribe", "like", "grow.", "start.", "windows", "powershell.", "rea.", "secret.", "prompt,", "guess,", "wait,", "fifty", "eighty", "ninety?", "comments", "see.", "ready?"]);
