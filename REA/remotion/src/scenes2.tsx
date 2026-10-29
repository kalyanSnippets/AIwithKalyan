import React from "react";
import {AbsoluteFill} from "remotion";
import {Backdrop, Cam, Glass, P, Scene, Tag, Words, clamp01, ease, easeIO, lerp, pop, popB, rand, seg, useT} from "./kit";
import {Ic} from "./scenes1";

const Bar: React.FC<{w: number | string; h?: number; c?: string; style?: React.CSSProperties}> = ({w, h = 16, c = "rgba(255,255,255,0.12)", style}) => <div style={{height: h, width: w, borderRadius: h / 2, background: c, ...style}} />;

/* =========== 49.9 - 56.6 : Notion copy & paste trace, a packet travels the pipeline =========== */
export const SceneNotion: React.FC = () => {
  const a = 49.9, b = 56.6, t = useT(a);
  const nodes = [{n: "Screen", s: "you press copy", k: "window", at: 51.9}, {n: "Renderer", s: "clipboard API", k: "gear", at: 52.9}, {n: "Preload", s: "the bridge", k: "term", at: 53.8}, {n: "IPC", s: "message to main", k: "gear", at: 54.6}, {n: "Main process", s: "where it lands", k: "evidence", at: 55.4}];
  const X = (i: number) => 120 + i * 350, Y = 330;
  const px = seg(t, 51.9, 55.5, X(0) + 150, X(4) + 150, easeIO), py = Y + 90 + Math.sin(t * 9) * 14;
  const camS = seg(t, 54.8, 56.4, 1, 1.18, easeIO);
  return (
    <Scene a={a} b={b} enter="glitch" bg={<Backdrop seed={14} tint="steel" particles={50} speed={1.4} />}>
      <Cam a={a} b={b} s={[1, 1.04]}>
        {/* faint streaming data rows */}
        {Array.from({length: 9}).map((_, r) => <div key={r} style={{position: "absolute", left: 0, top: 130 + r * 100, width: 1920, overflow: "hidden", opacity: 0.12}}>
          <div style={{display: "flex", gap: 24, transform: `translateX(${-((t * (140 + r * 20)) % 600) - 200}px)`}}>{Array.from({length: 12}).map((_, i) => <Bar key={i} w={80 + rand(r * 20 + i) * 260} h={18} />)}</div></div>)}
        <div style={{position: "absolute", left: 120, top: 90, opacity: pop(t, 50.0)}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 7, color: P.coral}}>PEOPLE USE REA TO</div>
          <div style={{fontSize: 92, fontWeight: 800, letterSpacing: -3, marginTop: 8, lineHeight: 1.05}}>Trace how Notion handles <span style={{color: P.coral}}>copy &amp; paste</span></div>
        </div>
        <AbsoluteFill style={{transform: `scale(${camS})`, transformOrigin: "88% 55%"}}>
          <svg width="1920" height="1080" style={{position: "absolute", left: 0, top: 0}}>
            <path d={`M${X(0) + 150} ${Y + 90} H${X(4) + 150}`} stroke="rgba(255,255,255,0.16)" strokeWidth="6" strokeDasharray="4 14" strokeLinecap="round" />
            <path d={`M${X(0) + 150} ${Y + 90} H${px}`} stroke={P.coral} strokeWidth="8" strokeLinecap="round" />
          </svg>
          {nodes.map((n, i) => {
            const p = popB(t, n.at - 0.5, 0.5), lit = clamp01((t - n.at + 0.35) / 0.25) * (1 - clamp01((t - n.at - 0.8) / 0.4));
            return <Glass key={i} style={{position: "absolute", left: X(i), top: Y, width: 300, height: 190, padding: 26, boxSizing: "border-box", opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${1 + lit * 0.08})`, borderColor: lit > 0.1 || i === 4 && t > n.at ? "rgba(232,119,95,0.7)" : P.line, boxShadow: lit > 0.1 ? "0 0 70px rgba(232,119,95,0.4)" : undefined}}>
              <Ic k={n.k} s={64} /><div style={{fontSize: 34, fontWeight: 800, marginTop: 8}}>{n.n}</div><div style={{fontSize: 23, color: P.mute, marginTop: 4}}>{n.s}</div></Glass>;
          })}
          {t > 51.8 && t < 55.8 && <div style={{position: "absolute", left: px - 26, top: py - 26, width: 52, height: 52, borderRadius: "50%", background: P.ink, boxShadow: `0 0 50px 12px rgba(232,119,95,0.7)`}} />}
          {Array.from({length: 10}).map((_, i) => t > 51.8 && t < 55.8 && <div key={i} style={{position: "absolute", left: px - 40 - i * 30, top: Y + 90 + Math.sin((t - i * 0.03) * 9) * 14 - 8 + (i - 5) * 0, width: 16 - i, height: 16 - i, borderRadius: "50%", background: P.coral, opacity: 0.6 - i * 0.055}} />)}
        </AbsoluteFill>
        <div style={{position: "absolute", right: 60, bottom: 60, fontSize: 24, color: P.mute, opacity: pop(t, 52)}}>Source: REA README showcase</div>
      </Cam>
    </Scene>
  );
};

/* =========== 56.6 - 61.8 : DX-Ball sound panning, stereo scope + counter =========== */
export const SceneDX: React.FC = () => {
  const a = 56.6, b = 61.8, t = useT(a);
  const pan = Math.sin(t * 2.4) , cnt = Math.round(3205 * ease(clamp01((t - 58.6) / 1.7))), done = t > 60.4;
  const wave = (lane: number, amp: number) => { let d = ""; for (let i = 0; i <= 120; i++) { const x = 560 + i * 9.5, y = lane + Math.sin(i * 0.28 + t * 9) * amp * (0.5 + 0.5 * Math.sin(i * 0.07 + t * 2)); d += (i ? "L" : "M") + x + " " + y; } return d; };
  const ang = -70 + (pan + 1) * 70;
  return (
    <Scene a={a} b={b} enter="iris" bg={<Backdrop seed={21} tint="coral" particles={40} speed={1.3} />}>
      <Cam a={a} b={b} s={[1.03, 1]}>
        <div style={{position: "absolute", left: 120, top: 90, opacity: pop(t, 56.8)}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 7, color: P.coral}}>OR REBUILD</div>
          <Words t={t} at={57.1} words={["The", "sound", "panning", "of", "DX-Ball"]} size={86} hotFrom={4} />
        </div>
        <Glass style={{position: "absolute", left: 540, top: 330, width: 1260, height: 330, opacity: pop(t, 57.2, 0.6)}}>
          <svg width="1260" height="330" viewBox="540 330 1260 330" style={{position: "absolute", left: 0, top: 0}}>
            <text x="570" y="392" fill={P.mute} fontSize="26" fontWeight="800">L</text><text x="570" y="552" fill={P.mute} fontSize="26" fontWeight="800">R</text>
            <path d={wave(430, 46 * (1 - pan) * 0.7 + 8)} stroke={P.coral} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d={wave(590, 46 * (1 + pan) * 0.7 + 8)} stroke={P.steel} strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>
        </Glass>
        <svg width="360" height="220" viewBox="0 0 360 220" style={{position: "absolute", left: 560, top: 700, opacity: pop(t, 57.6)}}>
          <path d="M30 200A150 150 0 0 1 330 200" stroke="rgba(255,255,255,0.2)" strokeWidth="10" fill="none" strokeLinecap="round" />
          <g transform={`rotate(${ang} 180 200)`}><path d="M180 200L180 66" stroke={P.coral} strokeWidth="9" strokeLinecap="round" /></g><circle cx="180" cy="200" r="14" fill={P.ink} />
          <text x="30" y="216" fill={P.mute} fontSize="26" fontWeight="800">L</text><text x="316" y="216" fill={P.mute} fontSize="26" fontWeight="800">R</text>
        </svg>
        <div style={{position: "absolute", left: 1000, top: 700, opacity: pop(t, 58.5)}}>
          <div style={{fontSize: 170, fontWeight: 800, letterSpacing: -6, lineHeight: 1, color: done ? P.coral : P.ink}}>{cnt.toLocaleString("en-US")}</div>
          <div style={{fontSize: 40, fontWeight: 600, color: P.mute, marginTop: 6}}>original x86 cases pass</div>
        </div>
        {done && <div style={{position: "absolute", left: 1620, top: 720, transform: `scale(${popB(t, 60.4, 0.5)})`}}><Ic k="check" s={150} c={P.lime} /></div>}
        <div style={{position: "absolute", right: 60, bottom: 60, fontSize: 24, color: P.mute, opacity: pop(t, 58)}}>Source: REA README showcase</div>
      </Cam>
    </Scene>
  );
};

/* =========== 61.8 - 69.0 : record a web app session > tools > environment for agents =========== */
export const SceneWeb: React.FC = () => {
  const a = 61.8, b = 69.0, t = useT(a);
  const rows = 9, scroll = (t - 62.6) * 150;
  const rec = Math.floor(t * 2) % 2 === 0;
  const toTools = clamp01((t - 64.4) / 0.9), toEnv = clamp01((t - 66.2) / 0.9);
  return (
    <Scene a={a} b={b} enter="wipe" bg={<Backdrop seed={31} tint="both" particles={55} speed={1.2} />}>
      <Cam a={a} b={b} s={[1, 1.05]} x={[0, -30]}>
        <div style={{position: "absolute", left: 110, top: 80}}>
          <Words t={t} at={62.0} words={["Record", "a", "web", "app", "session"]} size={84} hotFrom={2} />
          <div style={{fontSize: 44, fontWeight: 600, color: P.mute, marginTop: 14, opacity: pop(t, 65.0)}}>…and turn it into a practice environment for AI agents</div>
        </div>
        {/* 1: session */}
        <Glass style={{position: "absolute", left: 560, top: 320, width: 480, height: 560, overflow: "hidden", opacity: pop(t, 62.4, 0.5)}}>
          <div style={{padding: 26}}><div style={{display: "flex", alignItems: "center", gap: 10}}><div style={{width: 20, height: 20, borderRadius: 10, background: rec ? "#FF5A4D" : "rgba(255,90,77,0.35)"}} /><span style={{fontSize: 26, fontWeight: 800, letterSpacing: 3}}>REC</span></div>
            <div style={{marginTop: 18, height: 380, overflow: "hidden", position: "relative"}}>
              {Array.from({length: rows * 2}).map((_, i) => { const y = ((i * 64 - scroll) % (rows * 64) + rows * 64) % (rows * 64); return <div key={i} style={{position: "absolute", top: y, left: 0, right: 0, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14, padding: "0 16px"}}><Tag hot={i % 3 === 0} style={{padding: "3px 12px", fontSize: 20}}>{i % 3 === 0 ? "POST" : "GET"}</Tag><Bar w={`${40 + rand(i) * 40}%`} /></div>; })}
            </div></div>
          <div style={{position: "absolute", left: 26, bottom: 22, fontSize: 24, color: P.mute, fontWeight: 600}}>API calls recorded</div>
        </Glass>
        {/* 2: tools */}
        <div style={{position: "absolute", left: 1120, top: 320, width: 320}}>
          {[0, 1, 2].map((i) => <Glass key={i} style={{height: 150, marginBottom: 30, padding: "0 28px", display: "flex", alignItems: "center", gap: 20, opacity: clamp01(toTools * 2 - i * 0.4), transform: `translateX(${(1 - clamp01(toTools * 2 - i * 0.4)) * -160}px)`}}><Ic k="gear" s={56} /><div style={{fontSize: 32, fontWeight: 800}}>Tool</div></Glass>)}
        </div>
        {/* 3: environment */}
        <Glass style={{position: "absolute", left: 1520, top: 320, width: 330, height: 560, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: toEnv, transform: `scale(${0.85 + 0.15 * toEnv})`, borderColor: toEnv > 0.9 ? "rgba(232,119,95,0.7)" : P.line, boxShadow: toEnv > 0.9 ? "0 0 80px rgba(232,119,95,0.3)" : undefined}}>
          <Ic k="term" s={100} /><div style={{fontSize: 38, fontWeight: 800, textAlign: "center"}}>Environment<br />for agents</div>
        </Glass>
        <svg width="1920" height="1080" style={{position: "absolute", left: 0, top: 0}}>
          <path d="M1048 600H1112" stroke={P.coral} strokeWidth="6" strokeDasharray="10 12" opacity={toTools} /><path d="M1448 600H1512" stroke={P.coral} strokeWidth="6" strokeDasharray="10 12" opacity={toEnv} />
        </svg>
      </Cam>
    </Scene>
  );
};

/* =========== 93.0 - 98.6 : study a real app, rebuild my own version =========== */
export const SceneStudy: React.FC = () => {
  const a = 93.0, b = 98.6, t = useT(a);
  const scan = seg(t, 93.6, 95.0, 0, 1, easeIO);
  return (
    <Scene a={a} b={b} enter="zoom" bg={<Backdrop seed={41} tint="coral" particles={50} speed={1.2} />}>
      <Cam a={a} b={b} s={[1.04, 1]}>
        <div style={{position: "absolute", left: 110, top: 90, fontSize: 30, fontWeight: 800, letterSpacing: 7, color: P.coral, opacity: pop(t, 93.1)}}>TODAY'S TEST</div>
        <Glass style={{position: "absolute", left: 560, top: 190, width: 560, height: 560, overflow: "hidden", opacity: pop(t, 93.3, 0.6)}}>
          <div style={{padding: 26}}>{[0.7, 0.5, 0.64].map((w, i) => <Bar key={i} w={`${w * 100}%`} style={{marginTop: i ? 22 : 36}} />)}<div style={{height: 220, borderRadius: 24, background: "rgba(255,255,255,0.07)", marginTop: 34}} /><Bar w="45%" style={{marginTop: 26}} /></div>
          <div style={{position: "absolute", left: 0, right: 0, top: scan * 520, height: 6, background: P.coral, boxShadow: "0 0 40px 10px rgba(232,119,95,0.6)"}} />
          <div style={{position: "absolute", left: 60 + scan * 360, top: 120 + scan * 280}}><Ic k="mag" s={120} /></div>
        </Glass>
        <div style={{position: "absolute", left: 560, top: 780}}><Words t={t} at={93.7} words={["STUDY", "a", "real", "app"]} size={64} hotFrom={0} /></div>
        <svg width="260" height="80" style={{position: "absolute", left: 1150, top: 440, opacity: pop(t, 95.2)}}><path d={`M10 40H${10 + 220 * clamp01((t - 95.2) / 0.5)}`} stroke={P.coral} strokeWidth="8" strokeLinecap="round" /><path d="M200 12L240 40L200 68" stroke={P.coral} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={clamp01((t - 95.5) / 0.2)} /></svg>
        <Glass style={{position: "absolute", left: 1330, top: 190, width: 520, height: 560, opacity: pop(t, 95.6, 0.5), borderColor: "rgba(232,119,95,0.55)"}}>
          {[[26, 70, 230, 130], [270, 70, 224, 130], [26, 226, 468, 100], [26, 350, 230, 120], [270, 350, 224, 120]].map(([x, y, w, h], i) => { const k = popB(t, 95.8 + i * 0.18, 0.45); return <div key={i} style={{position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, background: i === 0 ? "rgba(232,119,95,0.4)" : "rgba(255,255,255,0.1)", opacity: clamp01(k * 1.4), transform: `translateY(${(1 - k) * -120}px) rotate(${(1 - k) * 14}deg)`}} />; })}
        </Glass>
        <div style={{position: "absolute", left: 1330, top: 780}}><Words t={t} at={96.0} words={["REBUILD", "my", "own", "version"]} size={64} hotFrom={0} /></div>
      </Cam>
    </Scene>
  );
};

/* =========== 102.5 - 107.0 : what worked / what did not / the downsides =========== */
export const SceneHonest: React.FC = () => {
  const a = 102.5, b = 107.0, t = useT(a);
  const cards = [{t: "What worked", k: "check", c: P.lime, at: 103.5}, {t: "What did not", k: "cross", c: P.coral, at: 104.15}, {t: "The downsides", k: "warn", c: P.coralHi, at: 105.0}];
  return (
    <Scene a={a} b={b} enter="push" bg={<Backdrop seed={51} tint="both" particles={36} speed={1} />}>
      <div style={{position: "absolute", left: 110, top: 100}}><Words t={t} at={102.7} words={["An", "honest", "look"]} size={100} hotFrom={2} /></div>
      <div style={{position: "absolute", left: 560, top: 330, display: "flex", gap: 40}}>
        {cards.map((c, i) => { const p = popB(t, c.at, 0.45); return (
          <Glass key={i} style={{width: 380, height: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 120}px) scale(${0.8 + 0.2 * p}) rotate(${(i - 1) * (1 - p) * 10}deg)`, borderColor: p > 0.9 ? c.c : P.line, boxShadow: p > 0.9 ? `0 0 70px ${c.c}40` : undefined}}>
            <Ic k={c.k} s={130} c={c.c} /><div style={{fontSize: 46, fontWeight: 800, textAlign: "center", lineHeight: 1.1}}>{c.t}</div></Glass>); })}
      </div>
    </Scene>
  );
};
