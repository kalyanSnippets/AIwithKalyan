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
// Ambient life for a whole scene: every card/pill floats on its own phase (yPercent, so it never fights the
// entrance tweens on y/scale) and soft glowing particles drift up the background. Deterministic (seeded).
window.FX.ambient = function (tl, dur, root) {
  root = root || document.querySelector('.clip');
  const els = Array.from(root.querySelectorAll('.card,.pill,.dcard'));
  const dust = document.createElement('div'); dust.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0';
  root.insertBefore(dust, root.children[1] || null);
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const dots = [];
  for (let i = 0; i < 38; i++) {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;width:6px;height:6px;border-radius:50%;background:#ff8a75;box-shadow:0 0 12px #ff5a45';
    dust.appendChild(d); dots.push({ el: d, x: rnd() * 1920, y: rnd() * 1080, p: rnd() * 6.28, v: 10 + rnd() * 26, s: 0.4 + rnd() });
  }
  const ph = els.map((_, i) => i * 1.7);
  const o = { t: 0 };
  tl.fromTo(o, { t: 0 }, { t: dur, duration: dur, ease: 'none', onUpdate: () => {
    els.forEach((el, i) => gsap.set(el, { yPercent: Math.sin(o.t * 1.6 + ph[i]) * (el.classList.contains('pill') ? 6 : 2.2),
                                          rotation: el.classList.contains('card') ? Math.sin(o.t * 0.9 + ph[i]) * 0.8 : 0 }));
    dots.forEach(d => gsap.set(d.el, { x: d.x + Math.sin(o.t * 0.5 + d.p) * 30, y: ((d.y - o.t * d.v) % 1080 + 1080) % 1080,
                                       scale: d.s, opacity: 0.2 + 0.45 * Math.abs(Math.sin(o.t + d.p)) }));
  } }, 0);
};
