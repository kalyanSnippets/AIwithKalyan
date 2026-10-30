// REA v2 sample: hook lines 2 ("It lets AI open any app… it built THIS"), real footage + viral captions + animated icons.
import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import "@fontsource/inter/600.css"; import "@fontsource/inter/800.css";
import {ICONS} from "./icons";

export const HOOK2_SECONDS = 9.3;
const K = {ink: "#F6F1EC", mute: "rgba(246,241,236,.65)", coral: "#E8775F", steel: "#7F95AB", bg: "#0B0B0D"};
const F = "'Inter',system-ui,sans-serif";
const Ic: React.FC<{n: string; s: number; c?: string}> = ({n, s, c = K.ink}) =>
  <div style={{width: s, height: s, color: c}} dangerouslySetInnerHTML={{__html: ICONS[n]}} />;

// word timings (s) from ElevenLabs, relative to clip start (source 57.0 s)
type W = [string, number, boolean?];
const PHRASES: {a: number; b: number; w: W[]}[] = [
  {a: .12, b: .98, w: [["It", .12], ["let", .28], ["AI", .64, true]]},
  {a: 1.0, b: 2.08, w: [["open", 1.0], ["any", 1.38], ["app", 1.66, true]]},
  {a: 2.12, b: 2.72, w: [["measure", 2.12, true], ["it", 2.46]]},
  {a: 2.76, b: 3.82, w: [["and", 2.76], ["rebuild", 2.96, true], ["it", 3.4]]},
  {a: 3.86, b: 4.5, w: [["And", 3.86], ["today,", 4.04]]},
  {a: 4.54, b: 5.84, w: [["I", 4.54], ["gave", 4.7], ["it", 4.88], ["ONE", 5.06, true], ["link", 5.34, true]]},
  {a: 5.88, b: 7.2, w: [["twenty", 6.16, true], ["minutes", 6.46], ["later,", 6.78]]},
  {a: 7.26, b: 7.95, w: [["it", 7.26], ["built", 7.46], ["THIS", 7.74, true]]},
];

const Captions: React.FC<{t: number; f: number; fps: number}> = ({t, f, fps}) => {
  const p = PHRASES.find((x) => t >= x.a && t < x.b);
  if (!p) return null;
  return <div style={{position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", gap: 34}}>
    {p.w.map(([w, at, hot]) => {
      const s = spring({frame: f - Math.round(at * fps), fps, config: {damping: 12, stiffness: 220}});
      if (t < at) return null;
      return <span key={w + at} style={{display: "inline-block", fontFamily: F, fontWeight: 800, fontSize: 92, textTransform: "uppercase", color: hot ? K.coral : "#fff",
        WebkitTextStroke: "3px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.55), 0 14px 30px rgba(0,0,0,.5)",
        transform: `translateY(${(1 - s) * 40}px) scale(${.3 + .7 * s}) rotate(${(1 - s) * -8}deg)`}}>{w}</span>;
    })}
  </div>;
};

const glass: React.CSSProperties = {background: "rgba(14,14,18,.74)", border: "2px solid rgba(255,255,255,.14)", boxShadow: "0 30px 80px rgba(0,0,0,.5)", backdropFilter: "blur(18px)"};

// open → measure → rebuild: three icon nodes on the right-hand wall, joined by a drawn line with a travelling dot
const Flow: React.FC<{t: number; f: number; fps: number}> = ({t, f, fps}) => {
  if (t < .95 || t > 3.95) return null;
  const nodes = [{n: "app-window", at: 1.0, x: 1290, l: "OPEN"}, {n: "ruler", at: 2.12, x: 1520, l: "MEASURE"}, {n: "hammer", at: 2.96, x: 1750, l: "REBUILD"}];
  const out = interpolate(t, [3.6, 3.95], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic)});
  const seg = (a: number, d: number) => interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)});
  const l1 = seg(1.9, .35), l2 = seg(2.75, .35);
  return <AbsoluteFill style={{transform: `translateX(${out * 700}px) rotate(${out * 8}deg)`, opacity: 1 - out}}>
    <div style={{position: "absolute", left: 1190, top: 150, width: 690, height: 420, borderRadius: 40, ...glass, transform: `scale(${spring({frame: f - Math.round(.95 * fps), fps, config: {damping: 13}})}) rotate(-3deg)`}} />
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
      <line x1={1290} y1={330} x2={1290 + 230 * l1} y2={330} stroke={K.coral} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 18" />
      <line x1={1520} y1={330} x2={1520 + 230 * l2} y2={330} stroke={K.coral} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 18" />
      {l1 > 0 && l1 < 1 && <circle cx={1290 + 230 * l1} cy={330} r={14} fill={K.coral} />}
      {l2 > 0 && l2 < 1 && <circle cx={1520 + 230 * l2} cy={330} r={14} fill={K.coral} />}
    </svg>
    {nodes.map(({n, at, x, l}, i) => {
      const s = spring({frame: f - Math.round(at * fps), fps, config: {damping: 8, stiffness: 180}});
      const active = t >= at && (i === 2 || t < nodes[i + 1].at);
      const swing = n === "hammer" ? Math.sin(Math.max(0, t - at) * 18) * 30 * Math.exp(-Math.max(0, t - at) * 3) : 0;
      const tick = n === "ruler" ? interpolate(t, [at, at + .5], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 0;
      return <div key={n} style={{position: "absolute", left: x - 85, top: 245, width: 170, alignItems: "center", display: "flex", flexDirection: "column", gap: 22, transform: `scale(${s})`}}>
        <div style={{width: 170, height: 170, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: active ? K.coral : "rgba(255,255,255,.08)", boxShadow: active ? "0 0 60px rgba(232,119,95,.6)" : "none", transform: `rotate(${swing}deg)`}}>
          <Ic n={n} s={90} c={active ? "#111" : K.ink} />
        </div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: active ? K.coral : K.mute}}>{l}</div>
        {n === "ruler" && tick > 0 && tick < 1 && <div style={{position: "absolute", top: -40, left: 85 - 120 * tick, width: 240 * tick, height: 6, background: K.coral, borderRadius: 3}} />}
      </div>;
    })}
  </AbsoluteFill>;
};

// "ONE link" card, then "twenty minutes later" spinning clock
const Card: React.FC<{t: number; f: number; fps: number; a: number; b: number; icon: string; big: string; small: string; spin?: boolean}> = ({t, f, fps, a, b, icon, big, small, spin}) => {
  if (t < a || t > b) return null;
  const s = spring({frame: f - Math.round(a * fps), fps, config: {damping: 10, stiffness: 160}});
  const o = interpolate(t, [b - .2, b], [1, 0], {extrapolateLeft: "clamp"});
  const rot = spin ? (t - a) * 900 : interpolate(s, [0, 1], [-120, 0]);
  return <div style={{position: "absolute", left: 1280, top: 150, width: 540, height: 430, borderRadius: 40, ...glass, opacity: o, transform: `scale(${s}) rotate(${(1 - s) * 20 - 3}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14}}>
    <div style={{transform: `rotate(${rot}deg)`}}><Ic n={icon} s={150} c={K.coral} /></div>
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 104, letterSpacing: -3, color: K.ink}}>{big}</div>
    <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.coral}}>{small}</div>
  </div>;
};

// "it built THIS": whip push into the camera, flash, then the two boards slam in
const Reveal: React.FC<{t: number; f: number; fps: number}> = ({t, f, fps}) => {
  if (t < 7.85) return null;
  const s1 = spring({frame: f - Math.round(7.9 * fps), fps, config: {damping: 14}});
  const s2 = spring({frame: f - Math.round(8.05 * fps), fps, config: {damping: 14}});
  const h = spring({frame: f - Math.round(8.3 * fps), fps, config: {damping: 9, stiffness: 200}});
  const flash = interpolate(t, [7.85, 7.9, 8.05], [0, .8, 0], {extrapolateRight: "clamp"});
  const panel = (src: string, x: number, s: number, dir: number, label: string, col: string) =>
    <div style={{position: "absolute", left: x, top: 330, width: 860, height: 438, borderRadius: 26, overflow: "hidden", border: "3px solid rgba(255,255,255,.14)", boxShadow: "0 40px 100px rgba(0,0,0,.6)", transform: `translateX(${(1 - s) * dir * 1100}px) rotate(${(1 - s) * dir * 6}deg)`}}>
      <Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      <div style={{position: "absolute", left: "50%", bottom: 22, transform: `translateX(-50%) scale(${h})`, padding: "12px 34px", borderRadius: 999, background: col, color: "#111", fontFamily: F, fontWeight: 800, fontSize: 40}}>{label}</div>
    </div>;
  return <AbsoluteFill>
    <AbsoluteFill style={{background: K.bg}}>
      <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(120px)", background: "rgba(232,119,95,.28)", left: -250, top: -350}} />
      <div style={{position: "absolute", width: 800, height: 800, borderRadius: "50%", filter: "blur(120px)", background: "rgba(127,149,171,.2)", right: -250, bottom: -380}} />
    </AbsoluteFill>
    <div style={{position: "absolute", left: 0, right: 0, top: 100, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 130, letterSpacing: -4, color: K.ink, transform: `scale(${h})`}}>Which one is <span style={{color: K.coral}}>real?</span></div>
    {panel("samples/wekan.jpg", 80, s1, -1, "A ?", K.ink)}
    {panel("samples/reaboard.jpg", 980, s2, 1, "B ?", K.coral)}
    <AbsoluteFill style={{background: "#fff", opacity: flash}} />
  </AbsoluteFill>;
};

export const Hook2: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  // camera: punch on "ONE link", drift on "twenty minutes", whip push on "THIS"
  const punch = interpolate(t, [5.0, 5.2, 5.8, 6.0], [1, 1.14, 1.14, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const whip = interpolate(t, [7.5, 7.9], [1, 1.9], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic)});
  const blur = interpolate(t, [7.6, 7.9], [0, 18], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
    <AbsoluteFill style={{transform: `scale(${punch * whip})`, transformOrigin: "50% 36%", filter: `blur(${blur}px)`}}>
      <OffthreadVideo src={staticFile("samples/hook2.mp4")} style={{width: 1920, height: 1080}} />
    </AbsoluteFill>
    <Flow t={t} f={f} fps={fps} />
    <Card t={t} f={f} fps={fps} a={4.6} b={5.86} icon="link" big="1 link" small="THAT'S ALL I GAVE IT" />
    <Card t={t} f={f} fps={fps} a={5.9} b={7.3} icon="clock" big="≈ 20 min" small="LATER…" spin />
    <Captions t={t} f={f} fps={fps} />
    <Reveal t={t} f={f} fps={fps} />
    <div style={{position: "absolute", left: 60, top: 44, fontFamily: F, fontWeight: 600, fontSize: 22, letterSpacing: 5, color: "rgba(246,241,236,.75)", textTransform: "uppercase", textShadow: "0 2px 8px rgba(0,0,0,.6)"}}>Sample · Remotion · real hook, 0:10–0:19</div>
  </AbsoluteFill>;
};
