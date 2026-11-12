// Small seek-safe helpers shared by every scene (all tweens live on the one paused timeline).
window.FX = {
  pop(tl, sel, t, o = {}) {
    tl.fromTo(sel, { scale: o.from ?? 0.55, opacity: 0, y: o.y ?? 0 }, { scale: 1, opacity: 1, y: 0, duration: o.d ?? 0.45, ease: "back.out(1.8)" }, t);
  },
  rise(tl, sel, t, o = {}) {
    tl.fromTo(sel, { y: o.y ?? 70, opacity: 0 }, { y: 0, opacity: 1, duration: o.d ?? 0.5, ease: "power3.out" }, t);
  },
  slide(tl, sel, t, o = {}) {
    tl.fromTo(sel, { x: o.x ?? -220, opacity: 0 }, { x: 0, opacity: 1, duration: o.d ?? 0.5, ease: "power3.out" }, t);
  },
  out(tl, sel, t, o = {}) {
    tl.to(sel, { opacity: 0, scale: o.scale ?? 0.9, y: o.y ?? 0, duration: o.d ?? 0.3, ease: "power2.in" }, t);
  },
  count(tl, el, from, to, t, d, fmt) {
    const o = { v: from }; const node = document.querySelector(el);
    tl.fromTo(o, { v: from }, { v: to, duration: d, ease: "power2.out", onUpdate: () => { node.textContent = fmt(o.v); } }, t);
  },
  type(tl, el, text, t, cps = 24) {
    const o = { n: 0 }; const node = document.querySelector(el);
    tl.fromTo(o, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none",
      onUpdate: () => { node.textContent = text.slice(0, Math.round(o.n)); } }, t);
  },
  pulse(tl, sel, t, n = 2) {
    tl.to(sel, { scale: 1.08, duration: 0.18, yoyo: true, repeat: n * 2 - 1, ease: "sine.inOut" }, t);
  },
  shake(tl, sel, t) {
    tl.fromTo(sel, { x: 0 }, { keyframes: [{ x: -16 }, { x: 14 }, { x: -10 }, { x: 8 }, { x: 0 }], duration: 0.45, ease: "none" }, t);
  },
};
