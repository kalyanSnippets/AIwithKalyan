import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from "remotion";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-800.css";
import {C, FONT, FPS, S} from "./theme";
import captions from "../public/media/captions.json";

export const PREVIEW_SECONDS = 56.6;

/* ---------- time helpers ---------- */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const useT = (a: number) => a + useCurrentFrame() / FPS; // global seconds inside a Sequence
const pop = (t: number, at: number, d = 0.45) => ease(clamp01((t - at) / d));

/* ---------- A-roll with digital punch-ins (10 to 15 %) ---------- */
// [start, end, scaleFrom, scaleTo]  seconds in the A-roll timeline
const PUNCH: [number, number, number, number][] = [
  [1.6, 3.9, 1.0, 1.1], [9.0, 11.8, 1.12, 1.15], [11.8, 15.3, 1.0, 1.06], [27.8, 30.2, 1.12, 1.15],
  [30.2, 34.8, 1.0, 1.08], [47.2, 49.9, 1.13, 1.15],
];
const scaleAt = (t: number) => {
  for (const [a, b, s0, s1] of PUNCH) if (t >= a && t < b) return s0 + (s1 - s0) * clamp01((t - a) / (b - a));
  return 1;
};
const ARollFull: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: "#000", overflow: "hidden"}}>
      <OffthreadVideo src={staticFile("media/aroll_preview.mp4")} muted style={{width: 1920, height: 1080, transform: `scale(${scaleAt(t)})`, transformOrigin: "50% 42%"}} />
    </AbsoluteFill>
  );
};
// face card, bottom-left, used while a full-screen graphic carries the information
const PiP: React.FC<{a: number}> = ({a}) => {
  const t = useT(a); const k = 430 / 760;
  const p = pop(t, a + 0.05, 0.5);
  return (
    <div style={{position: "absolute", left: 64, bottom: 64, width: 430, height: 430, borderRadius: 44, overflow: "hidden", border: `2px solid ${C.line}`,
      boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(182,255,46,0.18)`, transform: `scale(${0.9 + 0.1 * p})`, opacity: p, background: "#000"}}>
      <OffthreadVideo src={staticFile("media/aroll_preview.mp4")} muted style={{position: "absolute", width: 1920, height: 1080, left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${-(966 - 380) * k}px, ${-(450 - 380) * k}px) scale(${k})`}} />
    </div>
  );
};

/* ---------- graphic scene shell ---------- */
const Scene: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => (
  <Sequence from={S(a)} durationInFrames={S(b - a)}>
    <AbsoluteFill style={{background: `radial-gradient(1300px 700px at 88% 6%, rgba(182,255,46,0.10), transparent 60%), ${C.bg}`, fontFamily: FONT, color: C.text, overflow: "hidden"}}>
      <AbsoluteFill style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "96px 96px"}} />
      {children}
      <PiP a={a} />
    </AbsoluteFill>
  </Sequence>
);

/* ---------- small pieces ---------- */
const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: C.card, border: `1px solid ${C.line}`, borderRadius: 32, boxShadow: "0 24px 60px rgba(0,0,0,0.45)", ...style}}>{children}</div>
);
const Tag: React.FC<{children: React.ReactNode; hot?: boolean}> = ({children, hot}) => (
  <span style={{display: "inline-block", padding: "8px 18px", borderRadius: 999, fontSize: 26, fontWeight: 600, letterSpacing: 0.5,
    color: hot ? "#0A0B0D" : C.text, background: hot ? C.lime : "rgba(255,255,255,0.08)", border: hot ? "none" : `1px solid ${C.line}`}}>{children}</span>
);
const icon = (kind: string) => {
  const p = {stroke: C.lime, strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
  if (kind === "window") return <svg width="84" height="84" viewBox="0 0 84 84"><rect x="8" y="14" width="68" height="56" rx="10" {...p} /><path d="M8 30h68" {...p} /><circle cx="18" cy="22" r="1" {...p} /></svg>;
  if (kind === "term") return <svg width="84" height="84" viewBox="0 0 84 84"><rect x="8" y="14" width="68" height="56" rx="10" {...p} /><path d="M24 34l14 10-14 10M44 56h16" {...p} /></svg>;
  if (kind === "evidence") return <svg width="84" height="84" viewBox="0 0 84 84"><circle cx="36" cy="36" r="20" {...p} /><path d="M52 52l18 18M28 36l6 6 10-12" {...p} /></svg>;
  if (kind === "build") return <svg width="84" height="84" viewBox="0 0 84 84"><rect x="10" y="44" width="26" height="26" rx="6" {...p} /><rect x="42" y="44" width="26" height="26" rx="6" {...p} /><rect x="26" y="12" width="26" height="26" rx="6" {...p} /></svg>;
  if (kind === "gear") return <svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="12" {...p} /><path d="M42 8v14M42 62v14M8 42h14M62 42h14M18 18l10 10M56 56l10 10M66 18L56 28M28 56L18 66" {...p} /></svg>;
  return null;
};
const Arrow: React.FC<{x1: number; x2: number; y: number; t: number; at: number}> = ({x1, x2, y, t, at}) => {
  const p = pop(t, at, 0.5);
  return <svg style={{position: "absolute", left: 0, top: 0}} width="1920" height="1080"><path d={`M${x1} ${y}H${x1 + (x2 - x1) * p}`} stroke={C.lime} strokeWidth={5} strokeLinecap="round" fill="none" />{p > 0.95 && <path d={`M${x2 - 16} ${y - 14}L${x2} ${y}L${x2 - 16} ${y + 14}`} stroke={C.lime} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />}</svg>;
};
const Node: React.FC<{x: number; y: number; w: number; h: number; at: number; t: number; kind: string; title: string; sub: string; hot?: boolean}> = ({x, y, w, h, at, t, kind, title, sub, hot}) => {
  const p = pop(t, at);
  return (
    <Card style={{position: "absolute", left: x, top: y, width: w, height: h, padding: 28, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + 0.04 * p})`, borderColor: hot ? "rgba(182,255,46,0.55)" : C.line, boxShadow: hot ? "0 0 60px rgba(182,255,46,0.18), 0 24px 60px rgba(0,0,0,0.45)" : undefined}}>
      {icon(kind)}
      <div style={{fontSize: 38, fontWeight: 800, marginTop: 14, lineHeight: 1.1}}>{title}</div>
      <div style={{fontSize: 26, color: C.mute, marginTop: 10, lineHeight: 1.25}}>{sub}</div>
    </Card>
  );
};

/* ---------- scenes (seconds on the A-roll timeline) ---------- */
// 4.3 - 8.9  "I want this in my own project... no idea how it is built"
const SceneQuestion: React.FC = () => {
  const a = 4.3, t = useT(a);
  const l1 = pop(t, 4.59), l2 = pop(t, 6.57), box = pop(t, 4.4, 0.7), q = pop(t, 7.33, 0.4);
  return (
    <Scene a={a} b={8.9}>
      <div style={{position: "absolute", left: 120, top: 110, width: 1040}}>
        <div style={{fontSize: 30, fontWeight: 600, color: C.lime, letterSpacing: 4, opacity: l1}}>SOUND FAMILIAR?</div>
        <div style={{fontSize: 92, fontWeight: 800, lineHeight: 1.04, marginTop: 20, opacity: l1, transform: `translateY(${(1 - l1) * 40}px)`}}>
          “I want this in <span style={{color: C.lime}}>my own project.</span>”
        </div>
        <div style={{fontSize: 46, fontWeight: 600, color: C.mute, marginTop: 30, whiteSpace: "nowrap", opacity: l2, transform: `translateY(${(1 - l2) * 30}px)`}}>…but you have no idea how it is built.</div>
      </div>
      <Card style={{position: "absolute", right: 110, top: 150, width: 560, height: 560, padding: 36, opacity: box, transform: `scale(${0.94 + 0.06 * box})`}}>
        <div style={{display: "flex", gap: 10}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.18)"}} />)}</div>
        {[0.7, 0.45, 0.58].map((w, i) => <div key={i} style={{height: 22, width: `${w * 100}%`, borderRadius: 11, background: "rgba(255,255,255,0.08)", marginTop: i === 0 ? 40 : 22}} />)}
        <div style={{marginTop: 40, height: 230, borderRadius: 24, border: `3px dashed ${C.lime}`, background: C.limeDim, display: "flex", alignItems: "center", justifyContent: "center", position: "relative"}}>
          <div style={{fontSize: 30, fontWeight: 800, color: C.lime, letterSpacing: 3, position: "absolute", top: 20, left: 26}}>COOL FEATURE</div>
          <div style={{fontSize: 150, fontWeight: 800, color: C.text, opacity: q, transform: `scale(${0.6 + 0.4 * q})`}}>?</div>
        </div>
      </Card>
    </Scene>
  );
};

// 15.4 - 22.4  kinetic title, collapses to REA
const SceneTitle: React.FC = () => {
  const a = 15.4, t = useT(a);
  const words: [string, number][] = [["REVERSE", 16.44], ["ENGINEER", 17.14], ["ANYTHING", 17.6]];
  const collapse = ease(clamp01((t - 20.2) / 0.5)), rea = pop(t, 20.5, 0.5), sh = pop(t, 21.16, 0.4);
  return (
    <Scene a={a} b={22.4}>
      <div style={{position: "absolute", left: 0, right: 0, top: 70, textAlign: "center"}}>
        {words.map(([w, at], i) => { const p = pop(t, at, 0.5); return (
          <div key={w} style={{fontSize: 150, fontWeight: 800, letterSpacing: -2, lineHeight: 1.0, opacity: p * (1 - collapse), transform: `translateY(${(1 - p) * 60 - collapse * 40}px)`, color: i === 2 ? C.lime : C.text}}>{w}</div>
        ); })}
      </div>
      <div style={{position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", opacity: rea}}>
        <div style={{fontSize: 400, fontWeight: 800, color: C.lime, letterSpacing: -10, lineHeight: 1, transform: `scale(${0.7 + 0.3 * rea})`, textShadow: "0 0 120px rgba(182,255,46,0.35)"}}>REA</div>
        <div style={{fontSize: 52, fontWeight: 600, color: C.mute, opacity: sh, marginTop: -10}}>Reverse Engineer Anything, for short</div>
      </div>
    </Scene>
  );
};

// 22.5 - 27.8  the real GitHub recording + star count
const SceneStars: React.FC = () => {
  const a = 22.5, t = useT(a);
  const card = pop(t, 22.6, 0.6);
  const zoom = 1 + 0.9 * ease(clamp01((t - 24.6) / 1.3));
  const count = Math.round(399 * ease(clamp01((t - 24.2) / 2.0)));
  const done = pop(t, 26.5, 0.4);
  const W = 1280, H = 502, vw = W, vh = vw * (552 / 1024), cropTop = 150 * (vw / 1024);
  return (
    <Scene a={a} b={27.8}>
      <Card style={{position: "absolute", left: 560, top: 110, width: W, height: H, overflow: "hidden", opacity: card, transform: `translateY(${(1 - card) * 50}px)`, borderColor: "rgba(182,255,46,0.4)"}}>
        <div style={{position: "absolute", left: 0, top: -cropTop, width: vw, height: vh, transformOrigin: `${925 / 1024 * 100}% ${293 / 552 * 100}%`, transform: `scale(${zoom})`}}>
          <OffthreadVideo src={staticFile("media/github_399k.mp4")} muted startFrom={S(3.2)} style={{width: vw, height: vh}} />
        </div>
      </Card>
      <div style={{position: "absolute", left: 560, top: 660, width: W, display: "flex", alignItems: "baseline", gap: 28}}>
        <div style={{fontSize: 250, fontWeight: 800, color: C.lime, letterSpacing: -6, lineHeight: 1}}>{count}K</div>
        <div style={{fontSize: 150, color: C.lime}}>★</div>
      </div>
      <div style={{position: "absolute", left: 566, top: 920, display: "flex", gap: 14, alignItems: "center", opacity: done}}>
        <Tag hot>GitHub stars</Tag><Tag>morluto/rea</Tag><Tag>from my screen recording</Tag>
      </div>
    </Scene>
  );
};

// 28.0-34.8 chips over the talking head are drawn in <Overlays/>

// 34.8 - 47.2  what it is: 4-step flow
const SceneFlow: React.FC = () => {
  const a = 34.8, t = useT(a);
  const nodes = [
    {at: 34.92, kind: "window", title: "A feature you like", sub: "in any app"},
    {at: 37.64, kind: "term", title: "Your AI agent", sub: "Claude Code + REA inspects the app", hot: true},
    {at: 42.38, kind: "evidence", title: "The evidence", sub: "how it works, explained and shown"},
    {at: 45.2, kind: "build", title: "Your own version", sub: "built with your agent's help"},
  ];
  const X = [60, 520, 980, 1440], W = 420;
  return (
    <Scene a={a} b={47.2}>
      <div style={{position: "absolute", left: 60, top: 90, fontSize: 34, fontWeight: 600, color: C.lime, letterSpacing: 5}}>HOW REA WORKS</div>
      {nodes.map((n, i) => <Node key={i} x={X[i]} y={190} w={W} h={330} t={t} {...n} />)}
      {[0, 1, 2].map((i) => <Arrow key={i} x1={X[i] + W + 8} x2={X[i + 1] - 12} y={355} t={t} at={nodes[i + 1].at - 0.35} />)}
      <div style={{position: "absolute", right: 70, top: 600, width: 1250, fontSize: 46, fontWeight: 600, color: C.mute, lineHeight: 1.3, opacity: pop(t, 43.9, 0.6)}}>
        Every finding comes with its <span style={{color: C.lime}}>evidence</span>, so nothing is guessed.
      </div>
    </Scene>
  );
};

// 49.9 - 56.6  Notion copy & paste trace (facts from the REA README showcase)
const SceneNotion: React.FC = () => {
  const a = 49.9, t = useT(a);
  const steps = [
    {at: 51.9, kind: "window", title: "Screen", sub: "you press copy"},
    {at: 52.9, kind: "gear", title: "Renderer", sub: "clipboard API"},
    {at: 53.8, kind: "term", title: "Preload", sub: "the bridge"},
    {at: 54.6, kind: "gear", title: "IPC", sub: "message to main"},
    {at: 55.4, kind: "evidence", title: "Main process", sub: "where it lands", hot: true},
  ];
  const X = [50, 420, 790, 1160, 1530], W = 330;
  return (
    <Scene a={a} b={56.6}>
      <div style={{position: "absolute", left: 60, top: 80, opacity: pop(t, 50.1)}}>
        <div style={{fontSize: 34, fontWeight: 600, color: C.lime, letterSpacing: 5}}>PEOPLE ARE USING REA TO</div>
        <div style={{fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 10}}>Trace how Notion handles <span style={{color: C.lime}}>copy &amp; paste</span></div>
      </div>
      {steps.map((n, i) => <Node key={i} x={X[i]} y={300} w={W} h={250} t={t} {...n} />)}
      {[0, 1, 2, 3].map((i) => <Arrow key={i} x1={X[i] + W + 6} x2={X[i + 1] - 8} y={425} t={t} at={steps[i + 1].at - 0.3} />)}
      <div style={{position: "absolute", right: 60, bottom: 70, fontSize: 24, color: C.mute, opacity: pop(t, 52.0)}}>Source: REA README showcase</div>
    </Scene>
  );
};

/* ---------- overlays on the talking head ---------- */
const Overlays: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const lt = pop(t, 9.3, 0.5) * (1 - clamp01((t - 13.4) / 0.4));
  const chips: [string, number, boolean][] = [["FREE", 30.5, true], ["OPEN SOURCE", 31.6, false]];
  const st = pop(t, 27.9, 0.4) * (1 - clamp01((t - 30.4) / 0.4));
  return (
    <AbsoluteFill style={{fontFamily: FONT, pointerEvents: "none"}}>
      <div style={{position: "absolute", left: 70, bottom: 150, opacity: lt, transform: `translateX(${(1 - lt) * -60}px)`}}>
        <Card style={{padding: "18px 30px", borderRadius: 24, display: "flex", alignItems: "center", gap: 18}}>
          <div style={{width: 10, height: 52, borderRadius: 5, background: C.lime}} />
          <div><div style={{fontSize: 38, fontWeight: 800}}>Kalyan</div><div style={{fontSize: 24, color: C.mute}}>AI with Kalyan</div></div>
        </Card>
      </div>
      <div style={{position: "absolute", right: 90, top: 110, opacity: st, transform: `translateY(${(1 - st) * 30}px)`}}><Tag hot>A crazy number for a developer tool</Tag></div>
      <div style={{position: "absolute", right: 90, top: 110, display: "flex", gap: 14}}>
        {chips.map(([c, at, hot]) => { const p = pop(t, at, 0.35) * (1 - clamp01((t - 33.0) / 0.4)); return <div key={c} style={{opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}><Tag hot={hot}>{c}</Tag></div>; })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- captions: short phrases, bottom centre ---------- */
const HIDE: [number, number][] = [[4.3, 8.9], [15.5, 22.4], [22.5, 27.8], [49.9, 56.6]]; // kinetic text already shows these words
const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  if (HIDE.some(([a, b]) => t >= a && t < b)) return null;
  const ph = (captions as any[]).find((p) => t >= p.t0 - 0.05 && t < p.t1 + 0.35);
  if (!ph) return null;
  const inPiP = [[4.3, 8.9], [22.5, 27.8], [34.8, 47.2]].some(([a, b]) => t >= a && t < b);
  return (
    <div style={{position: "absolute", left: inPiP ? 540 : 0, right: 0, bottom: inPiP ? 90 : 70, display: "flex", justifyContent: "center", fontFamily: FONT}}>
      <div style={{padding: "12px 30px", borderRadius: 22, background: "rgba(10,11,13,0.62)", backdropFilter: "blur(6px)", fontSize: 54, fontWeight: 800, color: C.text, textShadow: "0 2px 14px rgba(0,0,0,0.6)"}}>
        {ph.words.map((w: any, i: number) => <span key={i} style={{color: t >= w.t0 && t < w.t1 + 0.05 ? C.lime : C.text}}>{w.w}{i < ph.words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

/* ---------- main ---------- */
export const Preview: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <ARollFull />
    <Overlays />
    <SceneQuestion />
    <SceneTitle />
    <SceneStars />
    <SceneFlow />
    <SceneNotion />
    <Captions />
  </AbsoluteFill>
);
