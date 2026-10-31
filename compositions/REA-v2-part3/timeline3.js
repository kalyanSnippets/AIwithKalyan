// ===== content timeline in CUT time (REA/edits/REA-v2.cut-words.json), shifted by -B =====
const B = 317.25;
tl = gsap.timeline(); main.add(tl, 0); const C = tl;
function typeIn(sel, at, d = .6) { const el = $(sel), txt = el.dataset.t, k = { n: 0 }; tl.to(k, { n: txt.length, duration: d, ease: "none", onUpdate: () => { el.textContent = txt.slice(0, Math.round(k.n)); } }, at); }
function chap(id, a, b) { tl.set(id, { visibility: "visible", opacity: 1 }, a); tl.to(id, { opacity: 0, duration: .25 }, b - .25); tl.set(id, { visibility: "hidden" }, b); }
function circ(id, at, b) { tl.to(id, { opacity: 1, duration: .01 }, at); tl.fromTo(id, { scale: 1.6, transformOrigin: "50% 50%" }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, at); if (b) tl.to(id, { opacity: 0, duration: .2 }, b); }
const pillsEl = $("#pills");
function pill(txt, a, b, cls = "c") { const d = document.createElement("div"); d.className = "stk " + cls; d.style.cssText = "position:relative;flex-direction:row;padding:14px 26px;gap:12px;border-radius:999px;font-weight:800;font-size:38px;white-space:nowrap"; d.textContent = txt; pillsEl.appendChild(d);
  tl.set(d, { visibility: "visible" }, a); tl.fromTo(d, { scale: 0, rotate: -8 }, { scale: 1, rotate: 0, duration: .35, ease: bo, immediateRender: false }, a); tl.to(d, { opacity: 0, duration: .2 }, b - .2); tl.set(d, { visibility: "hidden", display: "none" }, b); }

// ---------- S9 · the reveal (317.25 – 356.9) ----------
pipIn(317.25, .01);
chap("#split", 317.3, 338.95);
tl.fromTo("#pL", { x: -1000, rotateY: 40, opacity: 0 }, { x: 0, rotateY: 0, opacity: 1, duration: .6, ease: "expo.out", transformPerspective: 2200, immediateRender: false }, 317.45);
tl.fromTo("#lblL", { scale: 0 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 318.3);
tl.fromTo("#pR", { rotateY: -180, scale: .6, opacity: 0 }, { rotateY: 0, scale: 1, opacity: 1, duration: .8, ease: "back.out(1.4)", transformPerspective: 2200, immediateRender: false }, 319.5);
tl.fromTo("#flash", { opacity: 0 }, { opacity: .5, duration: .05, yoyo: true, repeat: 1, ease: "none", immediateRender: false }, 320.2);
tl.fromTo("#lblR", { scale: 0 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 320.6);
tl.to("#pL, #pR", { y: -10, duration: .3, yoyo: true, repeat: 1, ease: "sine.inOut", stagger: .1 }, 321.55);
circ("#cTop", 323.5, 324.3); circ("#cMenu", 324.3, 326.2); tl.to("#cMenu", { scale: 1.15, duration: .2, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, 325.4);
circ("#cAv", 326.2, 327.4); circ("#cStripL", 328.15, 329.7); circ("#cStripR", 328.2, 329.7);
circ("#cWipL", 329.75); circ("#cWipR", 329.85);
tl.to("#cWipL, #cWipR", { scale: 1.2, duration: .25, yoyo: true, repeat: 3, transformOrigin: "50% 50%" }, 330.3);
stk("#sWip", 332.5, 337.2, { y: 60, opacity: 0, scale: .8, rotate: 0, x: 0 });
stk("#sCopied", 337.2, 338.9, { scale: 0, opacity: 0, rotate: -10, x: 0 });
tl.to("#cWipL, #cWipR", { opacity: 0, duration: .2 }, 338.6);
// REA Board full screen: IDs, labels, dates, overdue, CSS covers
showB("#fRb", 338.9, 352.1);
const ZR = "#fRb .zoom";
zoomTo(ZR, 339.6, 1.9, 120, 450, .7, 1600, 750);
hl("#hlId", 339.9, 342.0, false); hl("#hlLab", 342.1, 343.1, false); hl("#hlDate", 343.15, 344.2, false);
zoomTo(ZR, 344.25, 2.0, 590, 356, .6, 1600, 750);
hl("#hlOver", 344.8, 347.6);
zoomTo(ZR, 347.6, 1.0, 800, 375, .6, 1600, 750);
hl("#hlCov1", 347.9, null, false); hl("#hlCov2", 348.2, null, false);
shiftL("#fRb", 348.7); stk("#sCss", 348.84, 352.1);
pipOut(352.0);
stk("#sWork", 354.6, 356.85);
// ---------- S9 · live test (356.9 – 408.7) ----------
pipIn(356.75);
showB("#fLive", 356.85, 403.5);
pill("Add list ✓", 361.4, 362.2); pill("Add card ✓", 364.3, 365.1);
pill("Detail panel opens", 366.6, 367.8, "");
hl("#hlPL", 368.1, 368.7, false); hl("#hlPM", 368.74, 369.5, false); hl("#hlPD", 369.54, 370.5, false); hl("#hlPC", 370.56, 371.5, false); hl("#hlPX", 371.6, 372.9, false);
pill("Platform + Demo", 373.6, 375.4, ""); pill("Milo Chen", 375.5, 377.5, ""); pill("Sunset cover", 377.8, 379.6, "");
pill("Everything on the card ✓", 379.7, 382.1);
pill("THE BIG TEST · drag & drop", 382.2, 384.3, "");
pill("Review → Done ✓", 386.6, 387.7); pill("Into my new list ✓", 389.7, 390.6); pill("Whole list moved ✓", 391.9, 393.1);
hl("#hlDel", 395.1, 398.6);
pill("“Keep it” button · nice touch", 396.9, 398.8, "");
pill("Only APPENDS · my work stays ✓", 400.8, 403.4);
tl.set("#sSnip", { visibility: "visible" }, 403.4); tl.fromTo("#sSnip", { y: 100, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: bo, immediateRender: false }, 403.4);
tl.to("#sSnip", { opacity: 0, duration: .25 }, 405.2); tl.set("#sSnip", { visibility: "hidden" }, 405.45);
pipOut(405.4);
stk("#s1p", 408.4, 409.25, { scale: 0, rotate: -15, opacity: 0, x: 0 });
punch(406.7, 408.6, 1.1);

// ---------- S10 · honest opinion (409.28 – 534.2) ----------
pipIn(409.2, .3);
chap("#chH", 409.25, 411.65);
tl.fromTo("#chHi", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: .45, ease: bo, immediateRender: false }, 409.3);
tl.to("#chHi", { rotate: 12, duration: .25, yoyo: true, repeat: 3, ease: "sine.inOut" }, 409.8);
tl.fromTo("#chHa", { opacity: 0, x: 200 }, { opacity: 1, x: 0, duration: .3, ease: "expo.out", immediateRender: false }, 410.6);
tl.fromTo("#chHb", { opacity: 0, scale: 2.2, filter: "blur(24px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .35, ease: "expo.out", immediateRender: false }, 410.95);
pipOut(411.6);
stk("#sYes", 414.85, 416.6);
pipIn(416.6);
chap("#rs3", 416.65, 437.95 + .05);
tl.fromTo("#rs3 .k1", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: .35, immediateRender: false }, 416.8);
[["#v1", 418.24, 421.62], ["#v2", 422.36, 425.74], ["#v3", 429.56, 431.56]].forEach(([v, at, ok]) => {
  tl.fromTo(v, { y: 120, opacity: 0, scale: .8 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: bo, immediateRender: false }, at);
  tl.fromTo(v + " .ok2", { scale: 0 }, { scale: 1, duration: .3, ease: bo, immediateRender: false }, ok);
});
document.querySelectorAll("#v2 .mini span").forEach((m, i) => tl.fromTo(m, { scale: 0 }, { scale: 1, duration: .25, ease: bo, immediateRender: false }, [426.32, 427.26, 428.0][i]));
document.querySelectorAll("#v3 .mini span").forEach((m, i) => tl.fromTo(m, { scale: 0 }, { scale: 1, duration: .25, ease: bo, immediateRender: false }, [432.08, 433.22][i]));
tl.to("#v1, #v2, #v3", { y: -60, scale: .8, opacity: .45, duration: .4, ease: p3 }, 434.3);
tl.fromTo("#vBut", { x: 800, rotate: 20, opacity: 0 }, { x: 0, rotate: -5, opacity: 1, duration: .5, ease: bo, immediateRender: false }, 434.34);
tl.to("#noMagic", { opacity: 1, duration: .2 }, 437.15); tl.fromTo("#noMagic", { scale: .5 }, { scale: 1, duration: .35, ease: bo, immediateRender: false }, 437.15);
chap("#lazy", 438.0, 451.9);
tl.to("#lz1", { opacity: 1, duration: .3 }, 438.8); tl.fromTo("#lz1", { x: -80 }, { x: 0, duration: .4, ease: bo, immediateRender: false }, 438.8);
tl.to("#lz2", { opacity: 1, duration: .3 }, 443.2); tl.fromTo("#lz2", { x: -80 }, { x: 0, duration: .4, ease: bo, immediateRender: false }, 443.2);
tl.to("#lz3", { opacity: 1, duration: .3 }, 445.6); tl.fromTo("#lz3", { x: -80 }, { x: 0, duration: .4, ease: bo, immediateRender: false }, 445.6);
tl.to("#oneScr", { opacity: 1, duration: .3 }, 448.0);
tl.fromTo("#oneScr .scr.on", { scale: 1 }, { scale: 1.15, duration: .25, yoyo: true, repeat: 3, immediateRender: false }, 448.9);
showB("#fGt", 451.85, 458.6);
zoomTo("#fGt .zoom", 452.4, 1.5, 590, 450, .8);
hl("#hlGt", 454.5);
chap("#race", 458.6, 461.4);
tl.to("#rbH", { scaleX: .95, duration: .9, ease: "power3.out" }, 459.3); tl.to("#rbP", { scaleX: .45, duration: .9, ease: "power3.out" }, 459.6);
pipOut(461.4);
stk("#sOne", 461.45, 462.95);
pipIn(462.9);
chap("#rules", 462.95, 476.85);
[["#ru1", 463.29], ["#ru2", 466.85], ["#ru3", 471.0]].forEach(([r, at]) => { tl.to(r, { opacity: 1, duration: .25 }, at); tl.fromTo(r, { x: -80 }, { x: 0, duration: .4, ease: bo, immediateRender: false }, at); });
tl.fromTo("#ipStamp", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: .25, ease: "power4.in", immediateRender: false }, 474.77);
chap("#quote", 476.85, 482.6);
tl.fromTo("#qCard", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: p3, immediateRender: false }, 476.9);
tl.to("#qHl", { backgroundSize: "100% 100%", duration: .9, ease: "power2.out" }, 479.5);
chap("#learn", 482.6, 487.9);
[["#le1", 483.45], ["#le2", 484.8], ["#le3", 487.0]].forEach(([s, at]) => tl.fromTo(s, { scale: 0, y: 80 }, { scale: 1, y: 0, duration: .4, ease: bo, immediateRender: false }, at));
chap("#why2", 487.95, 494.3);
tl.fromTo("#wW", { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: p3, immediateRender: false }, 489.2);
tl.fromTo("#wWl", { scale: 0 }, { scale: 1, duration: .3, ease: bo, immediateRender: false }, 489.9);
tl.fromTo("#wAr", { scale: 0 }, { scale: 1, duration: .3, ease: bo, immediateRender: false }, 491.3);
tl.fromTo("#wR", { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: p3, immediateRender: false }, 491.4);
tl.fromTo("#wRl", { scale: 0 }, { scale: 1, duration: .3, ease: bo, immediateRender: false }, 492.6);
chap("#bonus", 494.3, 495.85);
tl.fromTo("#bnI", { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: .4, ease: bo, immediateRender: false }, 494.35);
tl.fromTo("#bnT", { opacity: 0, scale: 2, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .35, ease: "expo.out", immediateRender: false }, 494.9);
stk("#sNot", 496.8, 504.6, { y: -40, opacity: 0, scale: .8, rotate: 0, x: 0 });
tl.set("#wAsk", { visibility: "visible" }, 499.6); tl.fromTo("#wAsk", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: p3, immediateRender: false }, 499.6);
typeIn("#wAsk div:nth-child(1) .ty", 501.72, .55); typeIn("#wAsk div:nth-child(2) .ty", 502.9, 1.1);
tl.to("#wAsk", { opacity: 0, duration: .25 }, 504.45); tl.set("#wAsk", { visibility: "hidden" }, 504.7);
chap("#depth", 504.7, 508.75);
tl.to("#dp1", { opacity: 1, duration: .3 }, 504.8); tl.fromTo("#dp1 .dbar i", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", duration: .6, immediateRender: false }, 505.0);
tl.to("#dp2", { opacity: 1, duration: .3 }, 507.6); tl.fromTo("#dp2 .dbar i", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", duration: .7, ease: "power3.out", immediateRender: false }, 507.7);
pipOut(508.75);
pipIn(510.85);
chap("#ai", 510.9, 518.95);
tl.fromTo("#ai1", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: bo, immediateRender: false }, 511.5);
tl.fromTo("#ai2", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: bo, immediateRender: false }, 513.1);
tl.to("#val", { opacity: 1, duration: .3 }, 515.2);
tl.to("#valC", { opacity: .25, scale: .8, duration: .4 }, 516.66);
// 518.95 – 531.0 Remotion loop + "AI shows proof" (PiP inside)
chap("#verdict", 531.0, 534.45);
tl.fromTo("#vdA", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .3, immediateRender: false }, 531.2);
tl.fromTo("#vdB", { opacity: 0, scale: 2.6, filter: "blur(30px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .4, ease: "expo.out", immediateRender: false }, 532.3);
tl.fromTo("#vdC", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .4, ease: p3, immediateRender: false }, 533.25);
tl.fromTo("#flash", { opacity: 0 }, { opacity: .4, duration: .05, yoyo: true, repeat: 1, ease: "none", immediateRender: false }, 532.3);
pipOut(534.4);

// ---------- S11 · outro + end screen (534.57 – 578) ----------
stk("#subCard", 536.5, 540.1);
tl.to("#subB", { scale: .92, duration: .08, yoyo: true, repeat: 1 }, 538.33);
tl.set("#subB", { background: "#3a3d44", color: "#F6F1EC" }, 538.42); tl.set("#subT1", { display: "none" }, 538.42); tl.set("#subT2", { display: "inline" }, 538.42);
tl.to("#bellI", { rotate: 18, duration: .08, yoyo: true, repeat: 7, ease: "none", transformOrigin: "50% 10%" }, 538.7);
tl.to("#likeB", { background: "#E8775F", scale: 1.15, duration: .2, ease: bo }, 537.0); tl.to("#likeB", { scale: 1, duration: .2 }, 537.25);
stk("#sMore", 540.7, 544.1);
tl.set(".na", { visibility: "visible" }, 546.9);
[547.03, 547.97, 548.69].forEach((at, i) => tl.fromTo(document.querySelectorAll(".na")[i], { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: .4, ease: bo, immediateRender: false }, at));
tl.set("#naC", { visibility: "visible" }, 549.6); tl.fromTo("#naC", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: bo, immediateRender: false }, 549.6);
tl.to("#nextApp .stk", { opacity: 0, duration: .25 }, 550.9); tl.set("#nextApp .stk", { visibility: "hidden" }, 551.2);
tl.set(".gp", { visibility: "visible" }, 552.4);
tl.fromTo(".gp", { scale: 0 }, { scale: 1, duration: .35, ease: bo, stagger: .15, immediateRender: false }, 552.45);
tl.to(".gp", { opacity: 0, duration: .25 }, 554.1); tl.set(".gp", { visibility: "hidden" }, 554.4);
// end screen: previous video card ("right there"), subscribe slot, thanks
pipIn(557.9);
chap("#end", 557.95, 578.0 + .3);
tl.fromTo("#endV", { x: 600, opacity: 0, rotate: 4 }, { x: 0, opacity: 1, rotate: 0, duration: .55, ease: "expo.out", immediateRender: false }, 558.0);
tl.fromTo("#endT", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: .35, immediateRender: false }, 558.3);
tl.fromTo("#endL", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35, immediateRender: false }, 558.6);
tl.to("#endV", { scale: 1.03, duration: .25, yoyo: true, repeat: 3, ease: "sine.inOut" }, 559.4);
tl.to("#camwrap", { opacity: 0, duration: .4 }, 562.3);
tl.fromTo("#endS", { scale: 0 }, { scale: 1, duration: .45, ease: bo, immediateRender: false }, 562.6);
tl.fromTo("#endThx", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .45, ease: p3, immediateRender: false }, 562.7);
tl.to("#endS", { scale: 1.06, duration: .5, yoyo: true, repeat: 13, ease: "sine.inOut" }, 563.6);

C.shiftChildren(-B);
tl = main;
const HIDE = [[317.25, 352.0], [354.6, 356.85], [356.75, 405.4], [408.4, 409.25], [409.2, 411.6], [414.85, 416.6], [416.6, 461.4], [461.45, 462.95], [462.9, 508.75], [510.85, 534.4], [536.5, 540.1], [540.7, 544.1], [546.9, 554.4], [557.9, 580]].map(([a, b]) => [a - B, b - B]);
const HOT = new Set(["original", "rea", "work?", "yes.", "honest.", "fair.", "magic.", "subscribe", "comments", "clone", "next?", "spotify?", "guess."]);
