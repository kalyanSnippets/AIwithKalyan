// REA v2 part 3 insert: the loop + "AI isn't only guessing, it shows proof" (cut 518.95 – 531.0). Rendered muted.
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import "@fontsource/inter/600.css"; import "@fontsource/inter/800.css";
import {ICONS} from "./icons";

const K = {ink: "#F6F1EC", mute: "rgba(246,241,236,.62)", coral: "#E8775F", steel: "#7F95AB", bg: "#0B0B0D", ok: "#5BD69A", red: "#FF5A5A"};
const F = "'Inter',system-ui,sans-serif";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const Ic: React.FC<{n: string; s: number; c?: string}> = ({n, s, c = K.ink}) =>
  <div style={{width: s, height: s, color: c}} dangerouslySetInnerHTML={{__html: ICONS[n]}} />;
const B = 518.95, T = (c: number) => c - B;

export const LOOP_SECONDS = 12.05;
export const Loop: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const pop = (at: number, d = 10) => spring({frame: f - Math.round(T(at) * fps), fps, config: {damping: d, stiffness: 170}});
  const CX = 1240, CY = 590, R = 250;
  const nodes = [{n: "eye", l: "Look at the app", at: 520.41, a: -90}, {n: "circle-check-big", l: "Understand it with proof", at: 521.47, a: 30}, {n: "hammer", l: "Rebuild your own version", at: 523.01, a: 150}];
  const loopOut = interpolate(t, [T(525.6), T(526.0)], [1, 0], clamp);
  const shift = pop(526.0, 14);
  const cross = interpolate(t, [T(528.6), T(528.9)], [0, 1], clamp);
  const proof = pop(529.85, 9);
  const arc = interpolate(t, [T(520.6), T(523.6)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const spin = interpolate(t, [T(523.6), T(525.6)], [0, 120], clamp);
  return <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
    <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(120px)", background: "rgba(232,119,95,.28)", left: -250 + f * .6, top: -350}} />
    <div style={{position: "absolute", width: 800, height: 800, borderRadius: "50%", filter: "blur(120px)", background: "rgba(127,149,171,.2)", right: -250, bottom: -380}} />
    {/* the loop */}
    <div style={{position: "absolute", inset: 0, opacity: loopOut, transform: `scale(${.9 + .1 * loopOut})`}}>
      <div style={{position: "absolute", left: 660, top: 60, fontFamily: F, fontWeight: 800, fontSize: 70, letterSpacing: -2, color: K.ink, opacity: pop(519.2, 14)}}>Remember <span style={{color: K.coral}}>the loop</span></div>
      <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, transform: `rotate(${spin}deg)`, transformOrigin: `${CX}px ${CY}px`}}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={14} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={K.coral} strokeWidth={14} strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - arc)} transform={`rotate(-90 ${CX} ${CY})`} />
      </svg>
      {nodes.map((nd) => { const s = pop(nd.at, 9); const x = CX + R * Math.cos(nd.a * Math.PI / 180), y = CY + R * Math.sin(nd.a * Math.PI / 180);
        const lit = t >= T(nd.at);
        return <div key={nd.l} style={{position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: "50%", background: lit ? K.coral : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, boxShadow: lit ? "0 0 50px rgba(232,119,95,.55)" : "none"}}>
          <Ic n={nd.n} s={86} c={lit ? "#111" : K.ink} />
          <div style={{position: "absolute", top: nd.a === -90 ? -62 : 196, left: nd.a === -90 ? -170 : nd.a === 30 ? -40 : -300, width: 520, textAlign: nd.a === -90 ? "center" : nd.a === 30 ? "left" : "right", fontFamily: F, fontWeight: 800, fontSize: 38, color: K.ink, whiteSpace: "nowrap"}}>{nd.l}</div>
        </div>; })}
      <div style={{position: "absolute", left: CX - 220, top: CY - 40, width: 440, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 52, color: K.coral, opacity: pop(524.63, 12)}}>That's the idea</div>
    </div>
    {/* the big shift: guessing → proof */}
    <div style={{position: "absolute", left: 660, top: 180, opacity: shift, transform: `translateY(${(1 - shift) * 60}px)`}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 44, letterSpacing: 8, color: K.mute}}>THE BIG SHIFT</div>
      <div style={{position: "relative", marginTop: 30, fontFamily: F, fontWeight: 800, fontSize: 140, letterSpacing: -5, color: K.mute, display: "inline-block"}}>
        AI guessing<div style={{position: "absolute", left: -10, right: -10, top: "52%", height: 16, borderRadius: 8, background: K.red, transform: `scaleX(${cross})`, transformOrigin: "left"}} /></div>
      <div style={{marginTop: 20, display: "flex", alignItems: "center", gap: 30, transform: `scale(${proof})`, transformOrigin: "left center"}}>
        <div style={{width: 170, height: 170, borderRadius: "50%", background: K.ok, display: "flex", alignItems: "center", justifyContent: "center"}}><Ic n="circle-check-big" s={110} c="#0b0b0d" /></div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 130, letterSpacing: -5, color: K.ink}}>AI shows <span style={{color: K.coral}}>proof</span></div>
      </div>
    </div>
    <div style={{position: "absolute", left: 56, top: 1080 - 56 - 302.4, width: 537.6, height: 302.4, borderRadius: 34, overflow: "hidden", border: `4.5px solid ${K.coral}`, boxShadow: "0 24px 60px rgba(0,0,0,.55)"}}>
      <OffthreadVideo src={staticFile("part3/loopcam.mp4")} muted style={{width: 537.6, height: 302.4}} />
    </div>
  </AbsoluteFill>;
};
