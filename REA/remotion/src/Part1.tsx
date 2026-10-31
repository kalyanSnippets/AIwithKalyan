// REA v2 part 1 inserts (rendered muted, placed on the HyperFrames timeline; the A-roll carries the voice).
// Times are seconds from each insert's start, taken from REA/edits/REA-v2.cut-words.json.
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import "@fontsource/inter/600.css"; import "@fontsource/inter/800.css";
import {ICONS} from "./icons";

const K = {ink: "#F6F1EC", mute: "rgba(246,241,236,.65)", coral: "#E8775F", steel: "#7F95AB", bg: "#0B0B0D", ok: "#5BD69A"};
const F = "'Inter',system-ui,sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const Ic: React.FC<{n: string; s: number; c?: string}> = ({n, s, c = K.ink}) =>
  <div style={{width: s, height: s, color: c}} dangerouslySetInnerHTML={{__html: ICONS[n]}} />;
const glass: React.CSSProperties = {background: "rgba(255,255,255,.06)", border: "2px solid rgba(255,255,255,.13)", boxShadow: "0 30px 80px rgba(0,0,0,.45)"};

// background + PiP card in the same place as the HyperFrames PiP (x 56, bottom 56, 28% scale)
const Stage: React.FC<{src: string; children: React.ReactNode}> = ({src, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
    <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(120px)", background: "rgba(232,119,95,.28)", left: -250 + f * .8, top: -350}} />
    <div style={{position: "absolute", width: 800, height: 800, borderRadius: "50%", filter: "blur(120px)", background: "rgba(127,149,171,.2)", right: -250, bottom: -380 + f * .5}} />
    <AbsoluteFill style={{backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px)", backgroundSize: "120px 120px", transform: `translateX(${-f * .6}px)`}} />
    {children}
    <div style={{position: "absolute", left: 56, top: 1080 - 56 - 302.4, width: 537.6, height: 302.4, borderRadius: 34, overflow: "hidden", border: `4.5px solid ${K.coral}`, boxShadow: "0 24px 60px rgba(0,0,0,.55)"}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: 537.6, height: 302.4}} />
    </div>
  </AbsoluteFill>;
};

const pop = (f: number, fps: number, at: number, damping = 11) => spring({frame: f - Math.round(at * fps), fps, config: {damping, stiffness: 170}});

// "REA connects your AI agent, like Claude Code or Codex, to the real reverse engineering tools that experts use."
export const NODEMAP_SECONDS = 8.3;
export const NodeMap: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const hub = pop(f, fps, .98, 9);
  const agents = [{n: "terminal", l: "Claude Code", at: 3.22, y: 330}, {n: "code", l: "Codex", at: 4.16, y: 560}];
  const tools = [{l: "Ghidra", at: 5.57}, {l: "IDA Pro", at: 5.8}, {l: "Hopper", at: 6.03}, {l: "JADX", at: 6.26}];
  const HX = 960, HY = 470, AX = 470, TX = 1480;
  const ty = (i: number) => 250 + i * 150;
  const line = (x1: number, y1: number, x2: number, y2: number, at: number, k: string) => {
    const p = interpolate(t, [at, at + .35], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    const packet = ((t - at - .35) * .9) % 1;
    return <g key={k}>
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke="rgba(232,119,95,.55)" strokeWidth={5} strokeDasharray="3 14" strokeLinecap="round" />
      {p >= 1 && <circle cx={x1 + (x2 - x1) * packet} cy={y1 + (y2 - y1) * packet} r={10} fill={K.coral} />}
    </g>;
  };
  return <Stage src="part1/nodemap.mp4">
    <div style={{position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 64, letterSpacing: -2, color: K.ink, opacity: interpolate(t, [0, .3], [0, 1], clamp)}}>How <span style={{color: K.coral}}>REA</span> works</div>
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
      {agents.map((a, i) => line(AX + 210, a.y + 60, HX - 150, HY + 60, a.at + .1, "a" + i))}
      {tools.map((x, i) => line(HX + 150, HY + 60, TX - 10, ty(i) + 55, x.at + .05, "t" + i))}
    </svg>
    <div style={{position: "absolute", left: AX - 210, top: 220, width: 420, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: K.mute, opacity: interpolate(t, [2.2, 2.5], [0, 1], clamp)}}>YOUR AI AGENT</div>
    {agents.map((a) => { const s = pop(f, fps, a.at); return <div key={a.l} style={{position: "absolute", left: AX - 210, top: a.y, width: 420, height: 120, borderRadius: 28, ...glass, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", boxSizing: "border-box", transform: `scale(${s}) translateX(${(1 - s) * -80}px)`}}>
      <Ic n={a.n} s={56} c={K.coral} /><div style={{fontFamily: F, fontWeight: 800, fontSize: 40, color: K.ink}}>{a.l}</div></div>; })}
    <div style={{position: "absolute", left: HX - 150, top: HY - 90, width: 300, height: 300, borderRadius: "50%", background: K.coral, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${hub})`, boxShadow: `0 0 ${60 + 30 * Math.sin(t * 5)}px rgba(232,119,95,.65)`}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 110, letterSpacing: -4, color: "#111", lineHeight: 1}}>REA</div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: "#111", marginTop: 8}}>CONNECTS</div>
    </div>
    {[0, 1].map((i) => { const r = ((t - 1 + i * .6) % 1.2) / 1.2; return t > 1 && <div key={i} style={{position: "absolute", left: HX - 150, top: HY - 90, width: 300, height: 300, borderRadius: "50%", border: `5px solid ${K.coral}`, transform: `scale(${1 + r * .7})`, opacity: 1 - r}} />; })}
    <div style={{position: "absolute", left: TX, top: 160, width: 380, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: interpolate(t, [7.2, 7.4], [0, 1], clamp) > .5 ? K.coral : K.mute, opacity: interpolate(t, [5.4, 5.7], [0, 1], clamp)}}>{t > 7.2 ? "WHAT EXPERTS USE" : "REAL RE TOOLS"}</div>
    {tools.map((x, i) => { const s = pop(f, fps, x.at); return <div key={x.l} style={{position: "absolute", left: TX, top: ty(i), width: 380, height: 110, borderRadius: 26, ...glass, display: "flex", alignItems: "center", gap: 20, padding: "0 28px", boxSizing: "border-box", transform: `scale(${s}) translateX(${(1 - s) * 80}px)`}}>
      <Ic n={["scan-search", "cpu", "binary", "package"][i]} s={50} c={K.coral} /><div style={{fontFamily: F, fontWeight: 800, fontSize: 40, color: K.ink}}>{x.l}</div></div>; })}
  </Stage>;
};

// "Somebody pointed it at Blender… over three hundred thousand functions in about seventy minutes."
export const BLENDER_SECONDS = 7.8;
export const Blender: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const card = pop(f, fps, .2, 13);
  const bar = interpolate(t, [4.1, 6.3], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const n = Math.round(301393 * interpolate(t, [4.9, 6.3], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}));
  const clock = pop(f, fps, 6.85, 9);
  const src = interpolate(t, [.5, .8], [0, 1], clamp);
  return <Stage src="part1/blender.mp4">
    <div style={{position: "absolute", left: 660, top: 120, width: 1160, height: 760, borderRadius: 40, ...glass, transform: `scale(${card}) rotate(${(1 - card) * 6}deg)`, padding: 56, boxSizing: "border-box"}}>
      <div style={{display: "flex", alignItems: "center", gap: 28}}>
        <div style={{width: 120, height: 120, borderRadius: 30, background: "rgba(232,119,95,.16)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t * 2) * 6}deg)`}}><Ic n="box" s={72} c={K.coral} /></div>
        <div><div style={{fontFamily: F, fontWeight: 800, fontSize: 76, letterSpacing: -2, color: K.ink}}>Blender</div>
          <div style={{fontFamily: F, fontWeight: 600, fontSize: 30, color: K.mute, opacity: src}}>The famous 3D software · 5.2.2 binary</div></div>
      </div>
      <div style={{marginTop: 56, fontFamily: F, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: K.mute}}>REA + GHIDRA PASS</div>
      <div style={{marginTop: 18, height: 34, borderRadius: 17, background: "rgba(255,255,255,.08)", overflow: "hidden"}}>
        <div style={{width: `${bar * 100}%`, height: "100%", borderRadius: 17, background: `linear-gradient(90deg, ${K.coral}, #FF9E88)`}} /></div>
      <div style={{display: "flex", alignItems: "flex-end", gap: 60, marginTop: 50}}>
        <div><div style={{fontFamily: F, fontWeight: 800, fontSize: 150, letterSpacing: -6, lineHeight: 1, color: K.ink}}>{n.toLocaleString("en-US")}</div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: K.coral, marginTop: 12, opacity: interpolate(t, [5.9, 6.1], [0, 1], clamp)}}>FUNCTIONS MAPPED</div></div>
        <div style={{display: "flex", alignItems: "center", gap: 18, padding: "20px 34px", borderRadius: 999, background: K.coral, transform: `scale(${clock})`, marginBottom: 20}}>
          <div style={{transform: `rotate(${(t - 6.85) * 240}deg)`}}><Ic n="clock" s={56} c="#111" /></div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 56, color: "#111"}}>~70 min</div></div>
      </div>
    </div>
    <div style={{position: "absolute", right: 100, bottom: 70, display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 12, background: "rgba(14,14,18,.86)", border: "1.5px solid rgba(255,255,255,.16)", fontFamily: F, fontWeight: 600, fontSize: 22, color: K.mute, opacity: src}}>
      <Ic n="link" s={22} c={K.coral} />Source: <b style={{color: K.ink}}>github.com/yazzang-homelab/blender-agent-sdk</b></div>
  </Stage>;
};
