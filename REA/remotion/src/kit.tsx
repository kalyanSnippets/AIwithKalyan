import React from "react";
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from "remotion";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-800.css";

export const FPS = 30;
export const S = (t: number) => Math.round(t * FPS);
export const FONT = "'Inter', system-ui, sans-serif";
export const P = {
  bg: "#0B0B0D", ink: "#F6F1EC", mute: "rgba(246,241,236,0.62)", coral: "#E8775F", coralHi: "#FF9E88", coralLo: "#A8402B",
  lime: "#B9E56A", steel: "#7F95AB", panel: "rgba(255,255,255,0.055)", line: "rgba(255,255,255,0.12)",
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.16, 1, 0.3, 1);          // expo-out feel
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);      // overshoot
export const rand = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** global seconds inside a Sequence that starts at `a` */
export const useT = (a: number) => a + useCurrentFrame() / FPS;
export const pop = (t: number, at: number, d = 0.5) => ease(clamp01((t - at) / d));
export const popB = (t: number, at: number, d = 0.55) => back(clamp01((t - at) / d));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const seg = (t: number, a: number, b: number, from: number, to: number, e = easeIO) => lerp(from, to, e(clamp01((t - a) / (b - a))));

/* ---------- animated backdrop: drifting colour blobs, parallax grid, depth particles ---------- */
export const Backdrop: React.FC<{seed?: number; tint?: "coral" | "steel" | "both"; particles?: number; speed?: number; grid?: boolean; camX?: number}> = ({seed = 1, tint = "both", particles = 46, speed = 1, grid = true, camX = 0}) => {
  const t = (useCurrentFrame() / FPS) * speed;
  const c1 = tint === "steel" ? "rgba(127,149,171,0.22)" : "rgba(232,119,95,0.30)";
  const c2 = tint === "coral" ? "rgba(232,119,95,0.14)" : "rgba(127,149,171,0.20)";
  return (
    <AbsoluteFill style={{background: P.bg, overflow: "hidden"}}>
      <div style={{position: "absolute", width: 1000, height: 1000, borderRadius: "50%", filter: "blur(140px)", background: c1, left: -250 + Math.sin(t * 0.35 + seed) * 220, top: -330 + Math.cos(t * 0.27 + seed) * 150}} />
      <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(140px)", background: c2, right: -300 + Math.cos(t * 0.3 + seed) * 200, bottom: -380 + Math.sin(t * 0.22 + seed) * 140}} />
      {grid && <div style={{position: "absolute", inset: -140, backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)", backgroundSize: "120px 120px", transform: `translate(${-(t * 26 + camX * 0.35) % 120}px, ${(t * 12) % 120}px)`}} />}
      <svg width="1920" height="1080" style={{position: "absolute", left: 0, top: 0}}>
        {Array.from({length: particles}).map((_, i) => {
          const d = 0.25 + rand(i * 5 + seed) * 0.75;
          const x = (((rand(i * 2 + seed) * 1920 + t * 28 * d - camX * d * 0.5) % 1920) + 1920) % 1920;
          const y = (((rand(i * 3 + seed * 7) * 1080 - t * 18 * d) % 1080) + 1080) % 1080;
          const o = (0.12 + 0.5 * d) * (0.55 + 0.45 * Math.sin(t * 1.4 + i));
          return <circle key={i} cx={x} cy={y} r={1.2 + 3.2 * d} fill={i % 5 === 0 ? P.coral : P.ink} opacity={o} />;
        })}
      </svg>
      <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.62) 100%)"}} />
    </AbsoluteFill>
  );
};
export const Grain: React.FC<{o?: number}> = ({o = 0.07}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{backgroundImage: `url(${staticFile("media/grain.png")})`, backgroundSize: "256px 256px", backgroundPosition: `${(f * 53) % 256}px ${(f * 97) % 256}px`, mixBlendMode: "overlay", opacity: o, pointerEvents: "none"}} />;
};

/* ---------- camera move for a whole scene ---------- */
export const Cam: React.FC<{a: number; b: number; s?: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; children: React.ReactNode; origin?: string}> = ({a, b, s = [1, 1], x = [0, 0], y = [0, 0], r = [0, 0], children, origin = "50% 50%"}) => {
  const t = useT(a), k = easeIO(clamp01((t - a) / (b - a)));
  return <AbsoluteFill style={{transform: `translate(${lerp(x[0], x[1], k)}px, ${lerp(y[0], y[1], k)}px) scale(${lerp(s[0], s[1], k)}) rotate(${lerp(r[0], r[1], k)}deg)`, transformOrigin: origin}}>{children}</AbsoluteFill>;
};

/* ---------- glass card ---------- */
export const Glass: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: P.panel, border: `1px solid ${P.line}`, borderRadius: 30, backdropFilter: "blur(14px)", boxShadow: "0 30px 70px rgba(0,0,0,0.5)", ...style}}>{children}</div>
);
export const Tag: React.FC<{children: React.ReactNode; hot?: boolean; style?: React.CSSProperties}> = ({children, hot, style}) => (
  <span style={{display: "inline-block", whiteSpace: "nowrap", padding: "9px 20px", borderRadius: 999, fontSize: 26, fontWeight: 800, letterSpacing: 1.5, color: hot ? "#0B0B0D" : P.ink, background: hot ? P.coral : "rgba(255,255,255,0.08)", border: hot ? "none" : `1px solid ${P.line}`, ...style}}>{children}</span>
);

/* ---------- kinetic words: each word springs up out of a mask ---------- */
export const Words: React.FC<{t: number; at: number; words: string[]; size: number; stagger?: number; hotFrom?: number; style?: React.CSSProperties; lh?: number; weight?: number}> = ({t, at, words, size, stagger = 0.09, hotFrom = 999, style, lh = 1.05, weight = 800}) => (
  <div style={{fontSize: size, fontWeight: weight, lineHeight: lh, letterSpacing: -size * 0.03, whiteSpace: "nowrap", ...style}}>
    {words.map((w, i) => {
      const p = back(clamp01((t - at - i * stagger) / 0.55));
      return (
        <span key={i} style={{display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: size * 0.12, marginBottom: -size * 0.12, marginRight: size * 0.22}}>
          <span style={{display: "inline-block", transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 5}deg)`, opacity: clamp01(p * 2), color: i >= hotFrom ? P.coral : P.ink}}>{w}</span>
        </span>
      );
    })}
  </div>
);

/* ---------- face card (picture-in-picture) ---------- */
export const PiP: React.FC<{a: number; src?: string}> = ({a, src = "media/aroll_intro.mp4"}) => {
  const t = useT(a), k = 430 / 760, p = popB(t, a + 0.1, 0.6);
  return (
    <div style={{position: "absolute", left: 64, bottom: 64, width: 430, height: 430, borderRadius: 44, overflow: "hidden", border: `2px solid ${P.line}`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,119,95,0.22)`, transform: `scale(${0.82 + 0.18 * p}) rotate(${(1 - p) * -4}deg)`, opacity: clamp01(p * 1.6), background: "#000"}}>
      <OffthreadVideo src={staticFile(src)} muted style={{position: "absolute", width: 1920, height: 1080, left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${-(966 - 380) * k}px, ${-(450 - 380) * k}px) scale(${k})`}} />
    </div>
  );
};

/* ---------- scene shell with five different entrances ---------- */
export type Enter = "wipe" | "iris" | "zoom" | "glitch" | "push";
export const Scene: React.FC<{a: number; b: number; enter: Enter; children: React.ReactNode; pip?: boolean; bg?: React.ReactNode; exit?: boolean}> = ({a, b, enter, children, pip = true, bg, exit = true}) => {
  const f = useCurrentFrame(), t = a + f / FPS, k = clamp01((t - a) / 0.42), e = ease(k), dur = b - a;
  const outK = exit ? clamp01((t - (b - 0.22)) / 0.22) : 0;
  let style: React.CSSProperties = {};
  let edge: React.ReactNode = null;
  if (enter === "wipe") {
    const X = lerp(-14, 114, e);
    style = {clipPath: `polygon(0 0, ${X}% 0, ${X - 14}% 100%, 0 100%)`};
    edge = <div style={{position: "absolute", top: -50, bottom: -50, left: `${X - 7}%`, width: 190, transform: "skewX(-9deg)", background: `linear-gradient(90deg, transparent, ${P.coral} 40%, ${P.coralHi} 60%, transparent)`, opacity: k < 1 ? 1 : 0, filter: "blur(2px)"}} />;
  } else if (enter === "iris") {
    style = {clipPath: `circle(${lerp(0, 1900, e)}px at 22% 78%)`};
    edge = <div style={{position: "absolute", left: "22%", top: "78%", width: lerp(0, 3800, e), height: lerp(0, 3800, e), marginLeft: lerp(0, -1900, e), marginTop: lerp(0, -1900, e), borderRadius: "50%", border: `8px solid ${P.coral}`, opacity: k < 1 ? 1 - k * 0.6 : 0}} />;
  } else if (enter === "zoom") {
    style = {transform: `scale(${lerp(1.35, 1, e)})`, opacity: clamp01(k * 2.2), filter: `blur(${(1 - e) * 18}px)`};
  } else if (enter === "glitch") {
    const j = k < 1 ? (rand(f * 3.3) - 0.5) * 70 * (1 - k) : 0;
    style = {transform: `translateX(${j}px)`, opacity: k < 0.2 ? (rand(f) > 0.5 ? 1 : 0.2) : 1};
    edge = k < 1 ? <>
      <div style={{position: "absolute", inset: 0, background: P.coral, mixBlendMode: "screen", opacity: 0.35 * (1 - k), transform: `translateX(${-26 * (1 - k)}px)`}} />
      <div style={{position: "absolute", inset: 0, background: P.steel, mixBlendMode: "screen", opacity: 0.30 * (1 - k), transform: `translateX(${26 * (1 - k)}px)`}} />
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: "absolute", left: 0, right: 0, top: `${rand(i * 9 + Math.floor(f / 2)) * 100}%`, height: 26 + rand(i) * 60, background: "rgba(246,241,236,0.18)", transform: `translateX(${(rand(i + f) - 0.5) * 300 * (1 - k)}px)`}} />)}
    </> : null;
  } else {
    style = {transform: `translateX(${lerp(1920, 0, e)}px)`, filter: `blur(${(1 - e) * 14}px)`};
  }
  return (
    <>
      <AbsoluteFill style={{...style, opacity: (style.opacity as number ?? 1) * (1 - outK), fontFamily: FONT, color: P.ink, overflow: "hidden"}}>
        {bg ?? <Backdrop seed={a} />}
        {children}
        
      </AbsoluteFill>
      {edge && <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>{edge}</AbsoluteFill>}
    </>
  );
};
