import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";
import {Backdrop, Cam, FONT, Glass, P, Scene, Tag, Words, clamp01, ease, easeIO, lerp, pop, popB, rand, seg, useT} from "./kit";
import {Ic} from "./scenes1";

const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, ui-monospace, monospace";
const Recreated: React.FC<{style?: React.CSSProperties}> = ({style}) => <div style={{position: "absolute", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: P.mute, ...style}}>RECREATED FOR THIS VIDEO</div>;

/* =============== Explanation (v3 old-time seconds) =============== */

/* 131.0 - 144.5 : what a Kanban board is, cards travel To do > Doing > Done */
export const SceneKanban: React.FC = () => {
  const a = 131.0, b = 144.5, t = useT(a);
  const cols = [{n: "To do", x: 150}, {n: "Doing", x: 700}, {n: "Done", x: 1250}];
  const cards = [{c: "Design the logo", col: 0, y: 0, hue: P.coral}, {c: "Write the docs", col: 0, y: 1, hue: "#7FB2FF"}, {c: "Set up the repo", col: 1, y: 0, hue: "#8BD98B"}, {c: "Pick a name", col: 2, y: 0, hue: "#F0C060"}];
  const move = easeIO(clamp01((t - 140.7) / 1.1));          // "drag a card to the next column"
  return (
    <Scene a={a} b={b} enter="wipe" bg={<Backdrop seed={31} tint="both" particles={40} speed={1.1} />}>
      <Cam a={a} b={b} s={[1.0, 1.05]}>
        <div style={{position: "absolute", left: 150, top: 80, opacity: pop(t, 131.1)}}>
          <div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral}}>KANBAN BOARD</div>
          <Words t={t} at={131.3} words={["Columns.", "Cards.", "Drag."]} size={96} hotFrom={2} />
        </div>
        {cols.map((c, i) => {
          const p = popB(t, 131.4 + i * 0.5, 0.6);
          return <Glass key={i} style={{position: "absolute", left: c.x, top: 330, width: 500, height: 560, opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 70}px)`, padding: 28, boxSizing: "border-box"}}>
            <div style={{fontSize: 40, fontWeight: 800}}>{c.n}</div><div style={{height: 4, width: 90, background: P.coral, borderRadius: 2, margin: "10px 0 22px"}} /></Glass>;
        })}
        {cards.map((k, i) => {
          const appear = popB(t, 136.3 + i * 0.5, 0.5), mv = i === 1 ? move : 0;
          const x = lerp(cols[k.col].x + 28, cols[k.col + 1 > 2 ? 2 : k.col + 1].x + 28, mv), y = 440 + k.y * 150 - (i === 1 ? 0 : 0) - Math.sin(mv * Math.PI) * 90;
          return <div key={i} style={{position: "absolute", left: x, top: y, width: 444, height: 120, borderRadius: 22, background: "#1C1C21", border: `1px solid ${P.line}`, boxShadow: mv > 0 && mv < 1 ? "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(232,119,95,0.4)" : "0 14px 30px rgba(0,0,0,0.4)", opacity: clamp01(appear * 1.5), transform: `scale(${0.8 + 0.2 * appear}) rotate(${mv > 0 && mv < 1 ? 4 : 0}deg)`, padding: "22px 26px", boxSizing: "border-box"}}>
            <div style={{width: 70, height: 10, borderRadius: 5, background: k.hue}} /><div style={{fontSize: 34, fontWeight: 700, marginTop: 14}}>{k.c}</div></div>;
        })}
        {t > 140.5 && t < 143 && <div style={{position: "absolute", left: lerp(760, 1310, move) + 220, top: 520 - Math.sin(move * Math.PI) * 90, transform: "scale(1.6)"}}><Ic k="cursor" s={46} /></div>}
        <Recreated style={{left: 150, bottom: 50, opacity: pop(t, 132)}} />
      </Cam>
    </Scene>
  );
};

/* 144.5 - 154.0 : public demo anyone can open, MIT licence, nothing private */
export const ScenePublic: React.FC = () => {
  const a = 144.5, b = 154.0, t = useT(a);
  const win = popB(t, 144.7, 0.7), mit = popB(t, 148.0, 0.4), shield = pop(t, 151.7, 0.6);
  return (
    <Scene a={a} b={b} enter="zoom" bg={<Backdrop seed={32} tint="steel" particles={50} speed={1.3} />}>
      <Cam a={a} b={b} s={[1.0, 1.06]}>
        <Glass style={{position: "absolute", left: 130, top: 150, width: 1100, height: 760, opacity: clamp01(win * 1.5), transform: `scale(${0.85 + 0.15 * win}) rotate(${(1 - win) * -3}deg)`, overflow: "hidden"}}>
          <div style={{height: 76, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14, padding: "0 26px"}}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
            <div style={{marginLeft: 20, flex: 1, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.4)", fontSize: 26, color: P.mute, display: "flex", alignItems: "center", padding: "0 24px"}}>boards.wekan.team</div></div>
          <div style={{display: "flex", gap: 22, padding: 30}}>
            {[0, 1, 2].map((c) => <div key={c} style={{flex: 1}}>
              <div style={{height: 26, width: 120, borderRadius: 13, background: "rgba(255,255,255,0.2)", marginBottom: 18}} />
              {[0, 1, 2].map((r) => <div key={r} style={{height: 90 + rand(c * 5 + r) * 60, borderRadius: 16, background: "#1C1C21", border: `1px solid ${P.line}`, marginBottom: 16, opacity: clamp01((t - 145.3 - c * 0.3 - r * 0.2) * 3)}} />)}</div>)}
          </div>
        </Glass>
        <div style={{position: "absolute", left: 1290, top: 190}}>
          <Words t={t} at={145.4} words={["A", "public", "demo."]} size={84} hotFrom={1} />
          <Words t={t} at={146.2} words={["Anyone", "can", "open", "it."]} size={52} weight={600} style={{color: P.mute, marginTop: 10}} />
        </div>
        <div style={{position: "absolute", left: 1290, top: 520, opacity: clamp01(mit * 1.5), transform: `scale(${2 - mit}) rotate(${(1 - mit) * 14 - 5}deg)`}}>
          <div style={{display: "inline-block", border: `6px solid ${P.coral}`, borderRadius: 18, padding: "14px 34px", fontSize: 76, fontWeight: 800, color: P.coral, letterSpacing: 5}}>MIT LICENSE</div></div>
        <div style={{position: "absolute", left: 1290, top: 700, opacity: shield, transform: `translateY(${(1 - shield) * 40}px)`, display: "flex", gap: 22, alignItems: "center"}}>
          <svg width="96" height="96" viewBox="0 0 84 84"><path d="M42 8l28 10v22c0 18-12 30-28 36C26 70 14 58 14 40V18z" stroke={P.coral} strokeWidth="5" fill="none" strokeLinejoin="round" /><path d="M28 42l10 10 18-20" stroke={P.coral} strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
          <div style={{fontSize: 46, fontWeight: 800, lineHeight: 1.1}}>Nothing private<br /><span style={{color: P.mute, fontWeight: 600}}>is touched</span></div></div>
        <Recreated style={{left: 130, bottom: 44, opacity: pop(t, 146)}} />
      </Cam>
    </Scene>
  );
};

/* 154.0 - 164.9 : the behaviours that make it a good test */
export const SceneBehave: React.FC = () => {
  const a = 154.0, b = 164.9, t = useT(a);
  const items = [{n: "Drag & drop", k: "build", at: 159.2}, {n: "Labels", k: "tag", at: 160.0}, {n: "Due dates", k: "cal", at: 160.8}, {n: "Checklists", k: "check", at: 161.5}, {n: "Saving data", k: "save", at: 162.3}];
  const test = popB(t, 163.2, 0.5), core = popB(t, 154.4, 0.7);
  const glyph = (k: string, c: string) => k === "tag" ? <svg width="80" height="80" viewBox="0 0 84 84"><path d="M10 12h30l34 34-26 26L10 38z" stroke={c} strokeWidth="5" fill="none" strokeLinejoin="round" /><circle cx="26" cy="28" r="5" fill={c} /></svg>
    : k === "cal" ? <svg width="80" height="80" viewBox="0 0 84 84"><rect x="10" y="16" width="64" height="58" rx="10" stroke={c} strokeWidth="5" fill="none" /><path d="M10 34h64M28 8v14M56 8v14" stroke={c} strokeWidth="5" strokeLinecap="round" /></svg>
    : k === "save" ? <svg width="80" height="80" viewBox="0 0 84 84"><path d="M12 12h46l14 14v46H12z" stroke={c} strokeWidth="5" fill="none" strokeLinejoin="round" /><path d="M26 12v22h30V12M26 72V50h32v22" stroke={c} strokeWidth="5" fill="none" /></svg> : <Ic k={k} s={80} c={c} />;
  return (
    <Scene a={a} b={b} enter="iris" bg={<Backdrop seed={33} tint="coral" particles={60} speed={1.4} />}>
      <Cam a={a} b={b} s={[1.12, 1.0]}>
        <div style={{position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", opacity: pop(t, 154.2)}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 8, color: P.coral}}>LOTS OF BEHAVIOUR TO COPY</div></div>
        <div style={{position: "absolute", left: 960 - 170, top: 540 - 170, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,119,95,0.35), rgba(232,119,95,0.05) 70%)", border: `2px solid rgba(232,119,95,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + 0.6 * core + test * 0.12})`, opacity: clamp01(core * 2), boxShadow: `0 0 ${60 + test * 80}px rgba(232,119,95,0.5)`}}>
          <div style={{fontSize: 130, fontWeight: 800, letterSpacing: -5}}>REA</div></div>
        <svg width="1920" height="1080" style={{position: "absolute", left: 0, top: 0}}>
          {items.map((it, i) => { const ang = -Math.PI / 2 + i * (2 * Math.PI / 5) + t * 0.12, R = 410, x = 960 + Math.cos(ang) * R * 1.35, y = 560 + Math.sin(ang) * R * 0.78, p = pop(t, it.at, 0.4);
            return <line key={i} x1={960} y1={540} x2={lerp(960, x, p)} y2={lerp(540, y, p)} stroke={P.coral} strokeOpacity={0.5} strokeWidth="3" strokeDasharray="6 12" />; })}
        </svg>
        {items.map((it, i) => {
          const ang = -Math.PI / 2 + i * (2 * Math.PI / 5) + t * 0.12, R = 410, x = 960 + Math.cos(ang) * R * 1.35, y = 560 + Math.sin(ang) * R * 0.78, p = popB(t, it.at, 0.5);
          return <Glass key={i} style={{position: "absolute", left: x - 150, top: y - 80, width: 300, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: clamp01(p * 1.6), transform: `scale(${0.6 + 0.4 * p})`, borderColor: test > 0.2 ? "rgba(232,119,95,0.7)" : P.line}}>
            {glyph(it.k, P.coral)}<div style={{fontSize: 32, fontWeight: 800}}>{it.n}</div></Glass>;
        })}
        <div style={{position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", opacity: clamp01(test * 1.5), transform: `translateY(${(1 - test) * 40}px)`}}>
          <Tag hot style={{fontSize: 44, padding: "16px 40px"}}>A great test for REA</Tag></div>
      </Cam>
    </Scene>
  );
};

/* 170.0 - 179.4 : not the whole product, a small working version */
export const SceneSmall: React.FC = () => {
  const a = 170.0, b = 179.4, t = useT(a);
  const crowd = 1 - clamp01((t - 173.6) / 0.5), small = popB(t, 173.9, 0.6), name = popB(t, 176.1, 0.6);
  return (
    <Scene a={a} b={b} enter="glitch" bg={<Backdrop seed={34} tint="both" particles={40} speed={1.0} />}>
      <Cam a={a} b={b} s={[1.0, 1.07]}>
        <div style={{position: "absolute", left: 120, top: 90}}><Words t={t} at={170.2} words={["Would", "take", "a"]} size={74} /><Words t={t} at={170.6} words={["big", "team."]} size={120} hotFrom={0} style={{marginTop: -6}} /></div>
        {Array.from({length: 24}).map((_, i) => { const p = popB(t, 170.5 + i * 0.07, 0.4); return <div key={i} style={{position: "absolute", left: 1000 + (i % 8) * 108, top: 190 + Math.floor(i / 8) * 150, opacity: clamp01(p * 1.5) * crowd, transform: `scale(${0.4 + 0.6 * p})`}}>
          <svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="26" r="14" fill="rgba(246,241,236,0.55)" /><path d="M14 76c2-18 12-26 28-26s26 8 28 26z" fill="rgba(246,241,236,0.35)" /></svg></div>; })}
        <div style={{position: "absolute", left: 120, top: 640, opacity: clamp01(small * 1.5), transform: `translateY(${(1 - small) * 60}px)`}}>
          <div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral}}>INSTEAD</div>
          <Words t={t} at={173.9} words={["A", "small", "working", "version"]} size={68} hotFrom={1} /></div>
        <div style={{position: "absolute", left: 1000, top: 520, width: 800, height: 330, opacity: clamp01(name * 1.6), transform: `scale(${0.6 + 0.4 * name}) rotate(${(1 - name) * 4}deg)`}}>
          <Glass style={{width: "100%", height: "100%", borderColor: "rgba(232,119,95,0.7)", boxShadow: "0 0 90px rgba(232,119,95,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10}}>
            <div style={{display: "flex", alignItems: "center", gap: 22}}><div style={{width: 40, height: 40, borderRadius: 20, background: P.coral}} /><div style={{fontSize: 120, fontWeight: 800, letterSpacing: -4}}>REA Board</div></div>
            <div style={{fontSize: 34, color: P.mute}}>built by Claude Code</div></Glass></div>
      </Cam>
    </Scene>
  );
};

/* 179.4 - 189.3 : the real REA Board run, with the feature list */
export const SceneBoard: React.FC = () => {
  const a = 179.4, b = 189.3, t = useT(a);
  const win = popB(t, 179.6, 0.7);
  const feats = ["Add columns & cards", "Drag between columns", "Labels & due dates", "Checklists", "Saves in your browser"];
  return (
    <Scene a={a} b={b} enter="push" bg={<Backdrop seed={35} tint="steel" particles={30} speed={1.0} />}>
      <Cam a={a} b={b} s={[1.0, 1.04]}>
        <Glass style={{position: "absolute", left: 80, top: 110, width: 1180, height: 830, overflow: "hidden", opacity: clamp01(win * 1.5), transform: `scale(${0.88 + 0.12 * win})`}}>
          <OffthreadVideo src={staticFile("media/board_demo.mp4")} muted startFrom={30 * 4} playbackRate={1.6} style={{width: 1760, height: 990, marginTop: 84}} />
          <div style={{position: "absolute", left: 0, top: 0, right: 0, height: 84, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14, padding: "0 26px"}}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
            <div style={{marginLeft: 20, fontSize: 28, color: P.mute}}>REA Board · real run</div></div>
        </Glass>
        <div style={{position: "absolute", left: 1330, top: 130}}>
          <div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral, opacity: pop(t, 179.6)}}>WHAT IT DOES</div>
          {feats.map((f, i) => { const p = popB(t, 180.4 + i * 1.2, 0.5); return <div key={i} style={{display: "flex", alignItems: "center", gap: 18, marginTop: 34, opacity: clamp01(p * 1.5), transform: `translateX(${(1 - p) * 70}px)`}}><Ic k="check" s={50} /><div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, width: 480}}>{f}</div></div>; })}
        </div>
      </Cam>
    </Scene>
  );
};

/* 189.3 - 203.6 : what is deliberately left out */
export const SceneGoals: React.FC = () => {
  const a = 189.3, b = 203.6, t = useT(a);
  const out = [{n: "Login", at: 189.5}, {n: "Real-time sync", at: 191.2}, {n: "A server", at: 193.0}];
  const stamp = popB(t, 202.1, 0.4);
  return (
    <Scene a={a} b={b} enter="wipe" bg={<Backdrop seed={36} tint="coral" particles={50} speed={1.2} />}>
      <Cam a={a} b={b} s={[1.05, 1.0]}>
        <div style={{position: "absolute", left: 130, top: 80, opacity: pop(t, 189.4)}}><div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral}}>NOT IN THIS VERSION</div></div>
        {out.map((o, i) => { const p = popB(t, o.at, 0.5), x = clamp01((t - o.at - 0.9) / 0.35);
          return <div key={i} style={{position: "absolute", left: 130, top: 170 + i * 150, opacity: clamp01(p * 1.6), transform: `translateX(${(1 - p) * -120}px)`, display: "flex", alignItems: "center", gap: 30}}>
            <Ic k="cross" s={84} /><div style={{position: "relative", fontSize: 96, fontWeight: 800, letterSpacing: -3, color: lerp(1, 0.45, x) < 1 ? P.mute : P.ink}}>{o.n}<div style={{position: "absolute", left: -10, top: "56%", height: 9, width: `${x * 110}%`, background: P.coral, borderRadius: 5}} /></div></div>; })}
        <div style={{position: "absolute", left: 1010, top: 170, width: 780}}>
          <div style={{fontSize: 28, fontWeight: 800, letterSpacing: 7, color: P.coral, opacity: pop(t, 195.0)}}>WHAT YOU GET</div>
          {["A working copy of how the board behaves", "Its own name", "Its own design"].map((s, i) => { const p = popB(t, 195.4 + i * 0.7, 0.5); return <Glass key={i} style={{marginTop: 28, padding: "26px 32px", display: "flex", alignItems: "center", gap: 24, opacity: clamp01(p * 1.6), transform: `translateY(${(1 - p) * 50}px)`, borderColor: "rgba(232,119,95,0.45)"}}><Ic k="check" s={58} /><div style={{fontSize: 40, fontWeight: 800, lineHeight: 1.15}}>{s}</div></Glass>; })}
        </div>
        <div style={{position: "absolute", left: 130, bottom: 90, opacity: clamp01(stamp * 2), transform: `scale(${2.3 - 1.3 * stamp}) rotate(${(1 - stamp) * -12 - 3}deg)`, transformOrigin: "0 100%"}}>
          <div style={{display: "inline-block", border: `6px solid ${P.coral}`, borderRadius: 18, padding: "12px 34px", fontSize: 64, fontWeight: 800, color: P.coral, letterSpacing: 4}}>NOT THE FULL PRODUCT</div></div>
      </Cam>
    </Scene>
  );
};

/* 209.4 - 219.4 : what you need */
export const SceneReq: React.FC = () => {
  const a = 209.4, b = 219.4, t = useT(a);
  const cards = [{n: "Windows 10", s: "or newer", k: "window", at: 209.6}, {n: "Internet", s: "a normal connection", k: "wifi", at: 213.2}, {n: "Claude account", s: "to sign in", k: "user", at: 214.7}];
  const glyph = (k: string) => k === "wifi" ? <svg width="110" height="110" viewBox="0 0 84 84"><path d="M8 34c18-16 50-16 68 0M20 46c12-10 32-10 44 0M33 58c5-4 13-4 18 0" stroke={P.coral} strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="42" cy="68" r="4" fill={P.coral} /></svg>
    : k === "user" ? <svg width="110" height="110" viewBox="0 0 84 84"><circle cx="42" cy="28" r="15" stroke={P.coral} strokeWidth="5" fill="none" /><path d="M12 74c2-18 14-26 30-26s28 8 30 26" stroke={P.coral} strokeWidth="5" fill="none" strokeLinecap="round" /></svg> : <Ic k={k} s={110} />;
  return (
    <Scene a={a} b={b} enter="zoom" bg={<Backdrop seed={37} tint="steel" particles={40} speed={1.2} />}>
      <Cam a={a} b={b} s={[1.0, 1.05]}>
        <div style={{position: "absolute", left: 0, right: 0, top: 90, textAlign: "center"}}><div style={{fontSize: 30, fontWeight: 800, letterSpacing: 9, color: P.coral, opacity: pop(t, 209.5)}}>WHAT YOU NEED</div></div>
        {cards.map((c, i) => { const p = popB(t, c.at, 0.6), lit = clamp01((t - c.at) / 0.4); return <Glass key={i} style={{position: "absolute", left: 130 + i * 540, top: 260, width: 500, height: 560, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 90}px) scale(${0.85 + 0.15 * p})`, borderColor: lit > 0.5 ? "rgba(232,119,95,0.7)" : P.line, boxShadow: `0 30px 70px rgba(0,0,0,0.5), 0 0 ${lit * 60}px rgba(232,119,95,0.3)`}}>
          {glyph(c.k)}<div style={{fontSize: 54, fontWeight: 800, letterSpacing: -1}}>{c.n}</div><div style={{fontSize: 32, color: P.mute}}>{c.s}</div>
          <div style={{position: "absolute", right: 26, top: 26, transform: `scale(${popB(t, c.at + 0.6, 0.4)})`}}><Ic k="check" s={56} /></div></Glass>; })}
      </Cam>
    </Scene>
  );
};

/* =============== Setup: terminal steps =============== */
export type L = {at: number; s: string; k?: "cmd" | "out" | "ok" | "hot" | "dim" | "err" | "ask"; cps?: number; hide?: number};
const COLOR: Record<string, string> = {cmd: P.ink, out: "#C9C4BE", ok: "#8BD98B", hot: P.coral, dim: P.mute, err: "#FF7A7A", ask: "#F0C060"};
export const Term: React.FC<{t: number; lines: L[]; x: number; y: number; w: number; h: number; title?: string; size?: number}> = ({t, lines, x, y, w, h, title = "Windows PowerShell", size = 32}) => {
  const vis = lines.filter((l) => t >= l.at && !(l.hide && t >= l.hide));
  return (
    <Glass style={{position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: 26, background: "rgba(12,12,16,0.92)"}}>
      <div style={{height: 64, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12, padding: "0 24px", fontSize: 26, color: P.mute, fontFamily: FONT}}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}<span style={{marginLeft: 14}}>{title}</span></div>
      <div style={{padding: "26px 34px", fontFamily: MONO, fontSize: size, lineHeight: 1.45}}>
        {vis.map((l, i) => {
          const k = l.k ?? "out", n = k === "cmd" ? Math.floor((t - l.at) * (l.cps ?? 20)) : l.s.length, last = i === vis.length - 1;
          const txt = l.s.slice(0, n);
          return <div key={i} style={{color: COLOR[k], whiteSpace: "pre", fontWeight: k === "hot" ? 800 : 500}}>{k === "cmd" && <span style={{color: P.coral}}>{"PS C:\\Users\\you> "}</span>}{txt}{last && (k === "cmd" || true) && Math.floor(t * 2.2) % 2 === 0 && <span style={{background: P.ink, color: P.ink}}>_</span>}</div>;
        })}
      </div>
    </Glass>
  );
};

export const StepScene: React.FC<{a: number; b: number; n: number; title: string; icon: string; lines: L[]; enter: any; seed: number; children?: (t: number) => React.ReactNode; termW?: number}> = ({a, b, n, title, icon, lines, enter, seed, children, termW = 1200}) => {
  const t = useT(a), card = 1 - clamp01((t - (a + 2.0)) / 0.5), p = popB(t, a + 0.1, 0.6);
  return (
    <Scene a={a} b={b} enter={enter} bg={<Backdrop seed={seed} tint="coral" particles={50} speed={1.3} />}>
      <Cam a={a} b={b} s={[1.0, 1.04]}>
        <div style={{position: "absolute", left: 90, top: 70, display: "flex", alignItems: "center", gap: 24, opacity: pop(t, a + 2.3)}}>
          <div style={{width: 92, height: 92, borderRadius: 26, background: P.coral, color: "#0B0B0D", fontSize: 64, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"}}>{n}</div>
          <div><div style={{fontSize: 24, fontWeight: 800, letterSpacing: 6, color: P.coral}}>STEP {n}</div><div style={{fontSize: 52, fontWeight: 800, letterSpacing: -1}}>{title}</div></div></div>
        <Term t={t} lines={lines} x={90} y={230} w={termW} h={740} />
        <Recreated style={{left: 90, bottom: 40, opacity: pop(t, a + 2.5)}} />
        {children?.(t)}
      </Cam>
      {card > 0.001 && <AbsoluteFill style={{background: `radial-gradient(circle at 30% 50%, #1b0f0c, ${P.bg})`, opacity: card, clipPath: `inset(0 0 ${(1 - card) * 100}% 0)`}}>
        <div style={{position: "absolute", left: 160, top: 250, fontSize: 620, fontWeight: 800, color: P.coral, letterSpacing: -30, lineHeight: 1, opacity: clamp01(p * 1.4), transform: `translateX(${(1 - p) * -300}px)`}}>{n}</div>
        <div style={{position: "absolute", left: 760, top: 340, opacity: clamp01(p * 1.4), transform: `translateX(${(1 - p) * 200}px)`}}>
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 10, color: P.coral}}>STEP {n} OF 5</div>
          <div style={{fontSize: 108, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02, marginTop: 14, width: 1050}}>{title}</div>
          <div style={{marginTop: 30}}><Ic k={icon} s={110} /></div></div>
        <div style={{position: "absolute", left: 160, right: 160, bottom: 90, display: "flex", gap: 14}}>{[1, 2, 3, 4, 5].map((i) => <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: i <= n ? P.coral : "rgba(255,255,255,0.14)"}} />)}</div>
      </AbsoluteFill>}
    </Scene>
  );
};

const side = (t: number, at: number, children: React.ReactNode, top = 250) => <div style={{position: "absolute", left: 1330, top, width: 520, opacity: pop(t, at), transform: `translateX(${(1 - pop(t, at)) * 60}px)`}}>{children}</div>;
const Stack: React.FC<{t: number; items: {at: number; n: React.ReactNode}[]}> = ({t, items}) => (
  <div style={{position: "absolute", left: 1330, top: 250, width: 520}}>{items.map((it, i) => { const p = pop(t, it.at); return <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>{it.n}</div>; })}</div>
);
const Callout: React.FC<{hot?: boolean; title: string; sub?: string; icon?: string}> = ({hot, title, sub, icon = "check"}) => (
  <Glass style={{padding: "26px 30px", borderColor: hot ? "rgba(232,119,95,0.8)" : P.line, boxShadow: hot ? "0 0 70px rgba(232,119,95,0.35)" : undefined, display: "flex", gap: 22, alignItems: "center", marginBottom: 24}}>
    <Ic k={icon} s={64} /><div><div style={{fontSize: 38, fontWeight: 800, lineHeight: 1.1, color: hot ? P.coral : P.ink}}>{title}</div>{sub && <div style={{fontSize: 26, color: P.mute, marginTop: 6}}>{sub}</div>}</div></Glass>
);

export const SceneStep1: React.FC = () => (
  <StepScene a={219.5} b={243.8} n={1} title="Install Claude Code" icon="term" enter="wipe" seed={41}
    lines={[
      {at: 222.4, s: "irm https://claude.ai/install.ps1 | iex", k: "cmd", cps: 22},
      {at: 225.0, s: "Installing Claude Code ...  done", k: "ok"},
      {at: 226.0, s: "", k: "dim", hide: 226.01},
      {at: 228.7, s: "claude --version", k: "cmd", cps: 16},
      {at: 231.0, s: "2.1.312 (Claude Code)", k: "ok"},
      {at: 236.8, s: "claude", k: "cmd", cps: 10},
      {at: 238.2, s: "Opening your browser to sign in ...", k: "out"},
    ]}>
    {(t) => <>
      <Stack t={t} items={[{at: 222.8, n: <Callout title="Open PowerShell" sub="Type this one command" icon="term" />}, {at: 226.2, n: <Callout title="Close it. Open it again." sub="so Windows finds claude" icon="window" />}, {at: 232.4, n: <Callout hot title="A version number?" sub="Then it is installed" />}, {at: 236.8, n: <Callout title="First run: sign in" sub="your browser opens" icon="evidence" />}]} />
      
      
      
      
    </>}
  </StepScene>
);

export const SceneStep2: React.FC = () => (
  <StepScene a={243.8} b={262.8} n={2} title="Check Node.js" icon="gear" enter="push" seed={42}
    lines={[
      {at: 244.6, s: "node --version", k: "cmd", cps: 16},
      {at: 246.2, s: "v22.22.0", k: "ok"},
      {at: 255.6, s: "v16.20.2", k: "err"},
      {at: 256.4, s: "Too old. Install the latest from nodejs.org", k: "hot"},
      {at: 261.9, s: "node --version", k: "cmd", cps: 16},
      {at: 262.4, s: "", k: "dim"},
    ]}>
    {(t) => <>
      <Stack t={t} items={[{at: 245.9, n: <Callout title="Claude Code" sub="does not need Node.js" icon="check" />}, {at: 246.6, n: <Callout hot title="REA needs Node 22, 24 or newer" icon="gear" />}, {at: 255.5, n: <Callout title="Older or an error?" sub="Install the latest from nodejs.org" icon="warn" />}]} />
      
      
      
    </>}
  </StepScene>
);

export const SceneStep3: React.FC = () => {
  const x = (t: number) => <>
    <Stack t={t} items={[{at: 264.0, n: <Callout title="It may ask: OK to proceed?" sub="type  y" icon="check" />}, {at: 270.9, n: <Callout title="Which agent?" sub="choose Claude Code" icon="term" />}, {at: 272.4, n: <Callout title="A list of changes" sub="read it, then say yes" icon="evidence" />}, {at: 276.9, n: <Callout hot title="VERY IMPORTANT" sub="Hopper? Say NO. We only work with websites." icon="warn" />}]} />
  </>;
  return (
    <StepScene a={262.8} b={286.0} n={3} title="Set up REA" icon="gear" enter="glitch" seed={43}
      lines={[
        {at: 264.0, s: "npx rea-agents setup", k: "cmd", cps: 18},
        {at: 266.4, s: "Ok to proceed? (y)", k: "ask"},
        {at: 268.0, s: "y", k: "cmd", cps: 5},
        {at: 270.0, s: "Which agent do you use?", k: "ask"},
        {at: 270.9, s: "  > Claude Code", k: "hot"},
        {at: 272.4, s: "The following changes will be made:", k: "out"},
        {at: 273.1, s: "  ...", k: "dim"},
        {at: 274.8, s: "Apply these changes? (y)  y", k: "ask"},
        {at: 278.4, s: "Install Hopper? (y/N)", k: "ask"},
        {at: 280.6, s: "N", k: "hot"},
        {at: 281.8, s: "REA is ready.", k: "ok"},
      ]}>{x}</StepScene>
  );
};

export const SceneStep4: React.FC = () => (
  <StepScene a={286.0} b={300.5} n={4} title="Check the connection" icon="mag" enter="wipe" seed={44}
    lines={[
      {at: 289.9, s: "(Claude Code still open? Close it.)", k: "dim", hide: 293.4},
      {at: 293.7, s: "claude mcp list", k: "cmd", cps: 16},
      {at: 295.9, s: "rea   Connected", k: "ok"},
    ]}>
    {(t) => <>
      <Stack t={t} items={[{at: 286.2, n: <Callout title="Restart Claude Code" sub="then check REA" icon="gear" />}, {at: 289.8, n: <Callout title="Already open?" sub="Close it first" icon="window" />}, {at: 296.0, n: <Callout hot title="REA is in the list" sub="That means it is connected" />}]} />
      
      
      
    </>}
  </StepScene>
);

/* 300.5 - 312.6 : the Chrome extension */
export const SceneChrome: React.FC = () => {
  const a = 300.5, b = 312.6, t = useT(a);
  const store = popB(t, 300.7, 0.7), real = pop(t, 305.6), link = popB(t, 308.2, 0.5);
  return (
    <Scene a={a} b={b} enter="iris" bg={<Backdrop seed={45} tint="steel" particles={50} speed={1.2} />}>
      <Cam a={a} b={b} s={[1.0, 1.06]}>
        <div style={{position: "absolute", left: 90, top: 70, display: "flex", alignItems: "center", gap: 24, opacity: pop(t, a + 0.1)}}>
          <div style={{width: 92, height: 92, borderRadius: 26, background: P.coral, color: "#0B0B0D", fontSize: 64, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"}}>4</div>
          <div><div style={{fontSize: 24, fontWeight: 800, letterSpacing: 6, color: P.coral}}>STEP 4 · ONE MORE THING</div><div style={{fontSize: 52, fontWeight: 800}}>Add the Chrome extension</div></div></div>
        <Glass style={{position: "absolute", left: 120, top: 260, width: 980, height: 600, opacity: clamp01(store * 1.5), transform: `scale(${0.85 + 0.15 * store})`, padding: 44, boxSizing: "border-box"}}>
          <div style={{fontSize: 26, color: P.mute, letterSpacing: 3, fontWeight: 700}}>CHROME WEB STORE</div>
          <div style={{display: "flex", gap: 36, alignItems: "center", marginTop: 40}}>
            <div style={{width: 170, height: 170, borderRadius: 40, background: `linear-gradient(135deg, ${P.coral}, #B24A35)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 70px rgba(232,119,95,0.4)"}}><svg width="100" height="100" viewBox="0 0 84 84"><circle cx="42" cy="42" r="14" fill="#0B0B0D" /><path d="M42 10v16M42 58v16M10 42h16M58 42h16M20 20l11 11M53 53l11 11M64 20L53 31M31 53L20 64" stroke="#0B0B0D" strokeWidth="6" strokeLinecap="round" /></svg></div>
            <div><div style={{fontSize: 62, fontWeight: 800, letterSpacing: -2}}>Claude in Chrome</div><div style={{fontSize: 32, color: P.mute, marginTop: 8}}>Extension</div></div></div>
          <div style={{marginTop: 56, display: "inline-block", background: P.coral, color: "#0B0B0D", fontSize: 40, fontWeight: 800, borderRadius: 18, padding: "18px 50px", transform: `scale(${1 + 0.06 * Math.sin(t * 5)})`}}>Add to Chrome</div>
        </Glass>
        <div style={{position: "absolute", left: 1190, top: 270, width: 640}}>
          <div style={{opacity: pop(t, 305.6), transform: `translateX(${(1 - real) * 60}px)`}}>
            <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 6, color: P.coral}}>WHY</div>
            <Words t={t} at={305.7} words={["Claude", "tests", "the", "app"]} size={78} hotFrom={0} />
            <Words t={t} at={306.4} words={["in", "a", "real", "browser"]} size={78} /></div>
          <div style={{marginTop: 56, opacity: clamp01(link * 1.6), transform: `scale(${0.7 + 0.3 * link})`}}><Tag hot style={{fontSize: 40, padding: "18px 38px"}}>Link in the description</Tag></div>
        </div>
      </Cam>
    </Scene>
  );
};

export const SceneStep5: React.FC = () => {
  const go = (t: number) => <>
    <Stack t={t} items={[{at: 316.9, n: <Callout title="Make a project folder" sub="then start Claude Code" icon="window" />}]} />
    {t > 319.6 && <div style={{position: "absolute", left: 1330, top: 520, width: 540}}><Words t={t} at={319.7} words={["And", "that", "is", "it."]} size={76} /></div>}
    {t > 320.7 && <div style={{position: "absolute", left: 1330, top: 700, width: 560}}><Words t={t} at={320.8} words={["Now", "the", "real"]} size={74} hotFrom={9} /><Words t={t} at={321.1} words={["fun", "begins."]} size={100} hotFrom={0} style={{marginTop: -4}} /></div>}
  </>;
  return (
    <StepScene a={312.6} b={322.0} n={5} title="Start your project" icon="build" enter="push" seed={46}
      lines={[
        {at: 316.4, s: "mkdir rea-board", k: "cmd", cps: 20},
        {at: 317.4, s: "cd rea-board", k: "cmd", cps: 20},
        {at: 318.6, s: "claude", k: "cmd", cps: 10},
        {at: 319.4, s: "Claude Code is ready.", k: "ok"},
      ]}>{go}</StepScene>
  );
};
