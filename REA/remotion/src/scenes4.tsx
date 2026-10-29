import React from "react";
import {AbsoluteFill} from "remotion";
import {Backdrop, Cam, FONT, Glass, P, Scene, Tag, Words, clamp01, ease, lerp, pop, popB, rand, seg, useT} from "./kit";
import {Ic} from "./scenes1";

const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, ui-monospace, monospace";
const Recreated: React.FC<{style?: React.CSSProperties; text?: string}> = ({style, text = "RECREATED FOR THIS VIDEO"}) => <div style={{position: "absolute", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: P.mute, ...style}}>{text}</div>;

type Seg = {s: string; hot?: number};   // hot = time (old-time seconds) at which this phrase lights up
const Prompt: React.FC<{t: number; start: number; dur: number; lines: Seg[][]; x: number; y: number; w: number; h: number; size?: number; title: string}> = ({t, start, dur, lines, x, y, w, h, size = 34, title}) => {
  const total = lines.reduce((a, l) => a + l.reduce((b, s) => b + s.s.length, 0), 0);
  let left = Math.floor(total * ease(clamp01((t - start) / dur)));
  return (
    <Glass style={{position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: 26, background: "rgba(12,12,16,0.94)"}}>
      <div style={{height: 64, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, padding: "0 24px", fontSize: 26, color: P.mute, fontFamily: FONT}}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}<span style={{marginLeft: 14}}>{title}</span></div>
      <div style={{padding: "26px 36px", fontFamily: MONO, fontSize: size, lineHeight: 1.5, color: "#DAD5CF"}}>
        {lines.map((l, i) => <div key={i} style={{whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: size * 0.9}}>{l.map((sg, j) => {
          const n = Math.max(0, Math.min(sg.s.length, left)); left -= sg.s.length;
          const lit = sg.hot !== undefined ? ease(clamp01((t - sg.hot) / 0.35)) : 0;
          return <span key={j} style={{color: lit > 0.05 ? P.coral : undefined, fontWeight: lit > 0.05 ? 800 : 500, background: lit > 0.05 ? `rgba(232,119,95,${0.18 * lit})` : undefined, borderRadius: 6, boxShadow: lit > 0.05 ? `0 0 ${24 * lit}px rgba(232,119,95,${0.35 * lit})` : undefined}}>{sg.s.slice(0, n)}</span>;
        })}</div>)}
        {Math.floor(t * 2.2) % 2 === 0 && <span style={{background: P.ink, color: P.ink}}>_</span>}
      </div>
    </Glass>
  );
};

const P1: Seg[][] = [
  [{s: "Use the REA skill to analyse this website: "}, {s: "https://boards.wekan.team/b/D2SzJKZDS4Z48yeQH/wekan-r-open-source-kanban-board-with-mit-license"}],
  [{s: "It is a web app, so "}, {s: "use only the website analysis tools.", hot: 324.3}, {s: " "}, {s: "Do not touch desktop app tools.", hot: 331.4}, {s: " "}, {s: "Do not build anything yet.", hot: 334.6}],
  [{s: "Report short bullet points in simple English on:"}],
  [{s: "1. How boards, lists and cards are structured"}], [{s: "2. How drag and drop works"}], [{s: "3. What a card holds (labels, dates, checklists, members, cover)"}], [{s: "4. Where the data is saved and how it syncs"}], [{s: "5. Which framework and libraries it uses"}],
  [{s: "Label every point as "}, {s: "observed, inferred, or \"not sure\".", hot: 341.0}],
];
const P2: Seg[][] = [
  [{s: "Using only what you learned about how it "}, {s: "BEHAVES", hot: 393.1}, {s: ", build my own Kanban board in this folder. Name: REA Board. Use React 19 + Vite, no UI library, native HTML5 drag and drop, and save everything in localStorage."}],
  [{s: "Features: add, rename and delete columns; add, edit and delete cards; drag cards between and within columns; colour labels; due dates with a red \"Overdue\" badge; card IDs (RB-1, RB-2...); checklists with progress bars; a side panel for editing a card. "}, {s: "Use my own sample content and artwork, and don't copy the original's logo, text or images.", hot: 396.9}],
  [{s: "Then open the original demo next to my app, measure its colours, list width, card radius and label palette, and restyle mine to match closely."}],
  [{s: "Finally, start the dev server and test every feature in a real browser, including a real mouse drag. Tick a feature only if you saw it work. Back up localStorage before testing and restore it after."}],
];

/* 322.7 - 349.0 : Prompt 1 typed on screen, with the three evidence labels */
export const SceneP1: React.FC = () => {
  const a = 322.7, b = 349.0, t = useT(a);
  const tags = [{n: "OBSERVED", at: 346.3, hot: true}, {n: "INFERRED", at: 346.9}, {n: "NOT SURE", at: 347.5}];
  return (
    <Scene a={a} b={b} enter="push" bg={<Backdrop seed={51} tint="both" particles={40} speed={1.0} />}>
      <Cam a={a} b={b} s={[1.0, 1.05]}>
        <div style={{position: "absolute", left: 90, top: 60, display: "flex", alignItems: "center", gap: 24, opacity: pop(t, 322.8)}}>
          <div style={{width: 92, height: 92, borderRadius: 26, background: P.coral, color: "#0B0B0D", fontSize: 56, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"}}>P1</div>
          <div><div style={{fontSize: 24, fontWeight: 800, letterSpacing: 6, color: P.coral}}>PROMPT 1</div><div style={{fontSize: 52, fontWeight: 800, letterSpacing: -1}}>Study the original app</div></div></div>
        <Prompt t={t} start={323.0} dur={3.2} lines={P1} x={90} y={210} w={1740} h={700} size={33} title="Claude Code · Prompt 1" />
        {tags.map((g, i) => { const p = popB(t, g.at, 0.45); return <div key={i} style={{position: "absolute", left: 360 + i * 440, top: 940, opacity: clamp01(p * 1.6), transform: `scale(${0.6 + 0.4 * p})`}}><Tag hot={g.hot} style={{fontSize: 38, padding: "14px 36px", borderColor: P.coral}}>{g.n}</Tag></div>; })}
        <Recreated style={{right: 90, bottom: 30, opacity: pop(t, 324)}} text="PROMPT TEXT FROM THE SCRIPT" />
      </Cam>
    </Scene>
  );
};

/* 357.6 - 371.3 : which app would you rebuild */
export const SceneApps: React.FC = () => {
  const a = 357.6, b = 371.3, t = useT(a);
  const apps = [{n: "To-do", at: 357.7, k: "check"}, {n: "Habit tracker", at: 360.6, k: "evidence"}, {n: "Notes", at: 363.3, k: "window"}];
  const cm = popB(t, 365.6, 0.6), typed = Math.floor(clamp01((t - 366.4) / 2.4) * 30);
  return (
    <Scene a={a} b={b} enter="iris" bg={<Backdrop seed={52} tint="coral" particles={60} speed={1.4} />}>
      <Cam a={a} b={b} s={[1.06, 1.0]}>
        <div style={{position: "absolute", left: 120, top: 70, opacity: pop(t, 357.7)}}><Words t={t} at={357.8} words={["Which", "app", "would", "you"]} size={92} /><Words t={t} at={358.3} words={["rebuild?"]} size={150} hotFrom={0} style={{marginTop: -6}} /></div>
        {apps.map((p, i) => { const q = popB(t, p.at, 0.55), fl = Math.sin(t * 1.8 + i * 2) * 10; return <div key={i} style={{position: "absolute", left: 140 + i * 330, top: 520 + fl, opacity: clamp01(q * 1.6), transform: `scale(${0.5 + 0.5 * q}) rotate(${(1 - q) * -10}deg)`, textAlign: "center"}}>
          <div style={{width: 230, height: 230, borderRadius: 56, background: "linear-gradient(145deg, #2A2A30, #17171B)", border: `1px solid ${P.line}`, boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 60px rgba(232,119,95,0.2)", display: "flex", alignItems: "center", justifyContent: "center"}}><Ic k={p.k} s={120} /></div>
          <div style={{fontSize: 34, fontWeight: 800, marginTop: 18}}>{p.n}</div></div>; })}
        <Glass style={{position: "absolute", left: 1130, top: 330, width: 700, height: 430, opacity: clamp01(cm * 1.5), transform: `translateY(${(1 - cm) * 60}px) scale(${0.9 + 0.1 * cm})`, padding: 34, boxSizing: "border-box"}}>
          <div style={{fontSize: 26, color: P.mute, fontWeight: 700, letterSpacing: 3}}>COMMENTS</div>
          <div style={{marginTop: 24, display: "flex", gap: 18, alignItems: "center"}}><div style={{width: 64, height: 64, borderRadius: 32, background: P.coral}} /><div style={{flex: 1, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 30, color: P.ink}}>{"My favourite app is...".slice(0, typed)}</div></div>
          <div style={{marginTop: 34, fontSize: 40, fontWeight: 800, lineHeight: 1.15, opacity: pop(t, 368.4)}}>Best ideas become<br /><span style={{color: P.coral}}>my next video</span></div>
        </Glass>
      </Cam>
    </Scene>
  );
};

/* 372.4 - 388.4 : the evidence report, every point labelled */
export const SceneReport: React.FC = () => {
  const a = 372.4, b = 388.4, t = useT(a);
  const rows = [{n: "Boards, lists and cards", tag: 0}, {n: "How drag and drop works", tag: 0}, {n: "What a card holds", tag: 1}, {n: "Where the data is saved", tag: 0}, {n: "Framework and libraries", tag: 2}];
  const TAG = [{n: "OBSERVED", hot: true}, {n: "INFERRED", hot: false}, {n: "NOT SURE", hot: false}];
  const hours = popB(t, 385.0, 0.5);
  return (
    <Scene a={a} b={b} enter="wipe" bg={<Backdrop seed={53} tint="steel" particles={40} speed={1.0} />}>
      <Cam a={a} b={b} s={[1.0, 1.05]}>
        <div style={{position: "absolute", left: 120, top: 70, opacity: pop(t, 372.5)}}><div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral}}>THE REPORT</div><div style={{fontSize: 70, fontWeight: 800, letterSpacing: -2}}>Every point carries its evidence</div></div>
        <Glass style={{position: "absolute", left: 120, top: 260, width: 1180, height: 640, padding: "30px 40px", boxSizing: "border-box"}}>
          {rows.map((r, i) => { const p = popB(t, 373.0 + i * 1.5, 0.5), tg = TAG[r.tag]; return <div key={i} style={{display: "flex", alignItems: "center", justifyContent: "space-between", height: 118, borderBottom: i < 4 ? `1px solid ${P.line}` : "none", opacity: clamp01(p * 1.6), transform: `translateX(${(1 - p) * -60}px)`}}>
            <div style={{display: "flex", alignItems: "center", gap: 24}}><Ic k="check" s={52} /><div style={{fontSize: 42, fontWeight: 700}}>{r.n}</div></div>
            <div style={{opacity: pop(t, 373.6 + i * 1.5, 0.3), transform: `scale(${0.6 + 0.4 * popB(t, 373.6 + i * 1.5, 0.4)})`}}><Tag hot={tg.hot} style={{fontSize: 28}}>{tg.n}</Tag></div></div>; })}
        </Glass>
        <div style={{position: "absolute", left: 1380, top: 300, width: 440, opacity: clamp01(hours * 1.6), transform: `scale(${0.6 + 0.4 * hours})`, textAlign: "center"}}>
          <svg width="260" height="260" viewBox="0 0 84 84" style={{display: "block", margin: "0 auto"}}><circle cx="42" cy="42" r="32" stroke={P.coral} strokeWidth="5" fill="none" /><path d={`M42 42 L42 18`} stroke={P.coral} strokeWidth="5" strokeLinecap="round" transform={`rotate(${(t - 385) * 540} 42 42)`} /><path d="M42 42 L56 48" stroke={P.coral} strokeWidth="5" strokeLinecap="round" /></svg>
          <div style={{fontSize: 44, fontWeight: 800, lineHeight: 1.1, marginTop: 14}}>Normally takes <span style={{color: P.coral}}>hours</span></div></div>
        <Recreated style={{left: 120, bottom: 40, opacity: pop(t, 373)}} text="ILLUSTRATION · LABELS SHOWN FOR EXAMPLE" />
      </Cam>
    </Scene>
  );
};

/* 388.5 - 404.3 : Prompt 2 */
export const SceneP2: React.FC = () => {
  const a = 388.5, b = 404.3, t = useT(a);
  const chip = popB(t, 396.9, 0.5);
  return (
    <Scene a={a} b={b} enter="glitch" bg={<Backdrop seed={54} tint="coral" particles={50} speed={1.2} />}>
      <Cam a={a} b={b} s={[1.0, 1.05]}>
        <div style={{position: "absolute", left: 90, top: 60, display: "flex", alignItems: "center", gap: 24, opacity: pop(t, 388.6)}}>
          <div style={{width: 92, height: 92, borderRadius: 26, background: P.coral, color: "#0B0B0D", fontSize: 56, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"}}>P2</div>
          <div><div style={{fontSize: 24, fontWeight: 800, letterSpacing: 6, color: P.coral}}>PROMPT 2</div><div style={{fontSize: 52, fontWeight: 800, letterSpacing: -1}}>Build it, match the look, test it</div></div></div>
        <Prompt t={t} start={389.0} dur={3.0} lines={P2} x={90} y={210} w={1740} h={700} size={31} title="Claude Code · Prompt 2" />
        <div style={{position: "absolute", right: 110, bottom: 60, opacity: clamp01(chip * 1.6), transform: `scale(${1.8 - 0.8 * chip}) rotate(${(1 - chip) * 8 - 3}deg)`}}>
          <div style={{border: `5px solid ${P.coral}`, borderRadius: 18, padding: "10px 30px", fontSize: 46, fontWeight: 800, color: P.coral, letterSpacing: 3, background: "rgba(11,11,13,0.85)"}}>ONLY HOW IT BEHAVES</div></div>
        <Recreated style={{left: 90, bottom: 30, opacity: pop(t, 390)}} text="PROMPT TEXT FROM THE SCRIPT" />
      </Cam>
    </Scene>
  );
};

/* 404.3 - 413.5 : the build, sped up */
export const SceneBuild: React.FC = () => {
  const a = 404.3, b = 413.5, t = useT(a);
  const files = ["package.json", "vite.config.js", "index.html", "src/main.jsx", "src/App.jsx", "src/styles.css"];
  const prog = ease(clamp01((t - 404.6) / 7.5));
  const stay = popB(t, 407.6, 0.5), down = popB(t, 410.9, 0.5);
  return (
    <Scene a={a} b={b} enter="zoom" bg={<Backdrop seed={55} tint="both" particles={90} speed={3.0} />}>
      <Cam a={a} b={b} s={[1.0, 1.08]}>
        <div style={{position: "absolute", left: 120, top: 80, display: "flex", alignItems: "center", gap: 26, opacity: pop(t, 404.4)}}>
          <div style={{fontSize: 150, fontWeight: 800, color: P.coral, letterSpacing: -6}}>8×</div>
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 6, color: P.mute}}>SPED UP</div>
          <svg width="120" height="60" viewBox="0 0 120 60">{[0, 1, 2].map((i) => <path key={i} d="M10 8l24 22-24 22z" fill={P.coral} opacity={0.35 + 0.65 * ((Math.floor(t * 6) + i) % 3 === 0 ? 1 : 0.2)} transform={`translate(${i * 34} 0)`} />)}</svg></div>
        <Glass style={{position: "absolute", left: 120, top: 310, width: 640, height: 590, padding: 36, boxSizing: "border-box"}}>
          <div style={{fontSize: 24, color: P.mute, letterSpacing: 3, fontWeight: 700, marginBottom: 20}}>REA-BOARD/</div>
          {files.map((f, i) => { const p = popB(t, 405.0 + i * 1.05, 0.4); return <div key={i} style={{display: "flex", alignItems: "center", gap: 16, height: 74, opacity: clamp01(p * 1.6), transform: `translateX(${(1 - p) * 40}px)`, fontFamily: MONO, fontSize: 34}}><Ic k="check" s={40} />{f}</div>; })}
        </Glass>
        <Glass style={{position: "absolute", left: 820, top: 310, width: 980, height: 590, padding: 34, boxSizing: "border-box", overflow: "hidden", fontFamily: MONO, fontSize: 26, color: "#9A958F"}}>
          {Array.from({length: 18}).map((_, i) => { const idx = Math.floor(t * 9) + i; return <div key={i} style={{whiteSpace: "pre", opacity: 0.35 + 0.65 * (i / 18), display: "flex", gap: 14, height: 30}}>{[0, 1, 2].map((j) => <span key={j} style={{width: 40 + rand(idx * 3 + j) * (j === 0 ? 150 : 210), height: 14, marginTop: 8, borderRadius: 7, background: j === 1 ? "rgba(232,119,95,0.55)" : "rgba(255,255,255,0.2)"}} />)}</div>; })}
        </Glass>
        <div style={{position: "absolute", left: 120, right: 120, bottom: 70, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.1)"}}><div style={{height: "100%", width: `${prog * 100}%`, borderRadius: 9, background: P.coral, boxShadow: "0 0 30px rgba(232,119,95,0.6)"}} /></div>
        <div style={{position: "absolute", right: 120, top: 100, textAlign: "right"}}>
          <div style={{opacity: clamp01(stay * 1.6), transform: `translateY(${(1 - stay) * 30}px)`}}><Tag hot style={{fontSize: 40, padding: "14px 34px"}}>Stay till the end</Tag></div>
          <div style={{marginTop: 22, opacity: clamp01(down * 1.6), transform: `translateY(${(1 - down) * 30}px)`}}><Tag style={{fontSize: 34, padding: "12px 30px"}}>the honest downsides</Tag></div></div>
        <Recreated style={{left: 120, bottom: 30, opacity: pop(t, 405)}} text="ILLUSTRATION OF THE BUILD · FILE NAMES ARE THE REAL REA BOARD APP" />
      </Cam>
    </Scene>
  );
};
