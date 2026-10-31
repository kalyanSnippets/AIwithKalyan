// REA v2 part 2 insert: section 7 "Claude works" (cut 259.95 – 289.1, file-by-file narration trimmed). Rendered muted; the A-roll carries the voice.
// Animated terminal ticks each step as Kalyan says it; real run (6x) in a corner; timer to 18m 17s.
import {AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import "@fontsource/inter/600.css"; import "@fontsource/inter/800.css";
import {ICONS} from "./icons";

const K = {ink: "#F6F1EC", mute: "rgba(246,241,236,.62)", coral: "#E8775F", steel: "#7F95AB", bg: "#0B0B0D", ok: "#5BD69A"};
const F = "'Inter',system-ui,sans-serif", M = "'DejaVu Sans Mono','Consolas',monospace";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const Ic: React.FC<{n: string; s: number; c?: string}> = ({n, s, c = K.ink}) =>
  <div style={{width: s, height: s, color: c}} dangerouslySetInnerHTML={{__html: ICONS[n]}} />;
const B = 259.95; // cut time of frame 0
const T = (cut: number) => cut - B;

type Line = {at: number; done?: number; txt: React.ReactNode; n?: number; hot?: boolean};
const LINES: Line[] = [
  {at: T(263.39), done: T(265.03), txt: <>Check the project folder <span style={{color: K.steel}}>→ empty</span></>},
  {at: T(265.73), done: T(268.57), txt: <>REA browser tools <span style={{color: K.steel}}>→ open the live board</span></>},
  {at: T(269.59), done: T(270.1), txt: <>Measure fonts, colours, spacing</>},
  {at: T(270.65), done: T(273.85), txt: <>Found Chrome <span style={{color: K.steel}}>· set up Playwright toolkit</span></>},
  {at: T(279.62), done: T(279.8), txt: <>Write <b>Avatar.jsx</b></>},
  {at: T(279.8), done: T(280.0), txt: <>Write <b>Minicard.jsx</b></>, n: 156},
  {at: T(279.98), done: T(280.2), txt: <>Write <b>List.jsx</b></>, n: 210},
  {at: T(280.16), done: T(280.4), txt: <>Write <b>useBoardDnd.js</b></>, n: 157},
  {at: T(281.16), done: T(281.6), txt: <>vite build <span style={{color: K.steel}}>· 43 modules transformed</span></>},
  {at: T(282.94), done: T(285.74), txt: <>Test with a real mouse <span style={{color: K.steel}}>in real Chrome</span></>},
  {at: T(288.2), txt: <>Sautéed for 18m 17s</>, hot: true},
];

export const RUNTERM_SECONDS = 29.15;
export const RunTerm: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const secs = Math.round(1097 * interpolate(t, [T(260.4), T(288.65)], [0, 1], {...clamp, easing: Easing.in(Easing.quad)}));
  const visible = LINES.filter((l) => t >= l.at);
  const scrollUp = Math.max(0, visible.length - 12) * 72;
  const robot = spring({frame: f - Math.round(T(275.1) * fps), fps, config: {damping: 9}});
  const robotOut = interpolate(t, [T(277.0), T(277.4)], [1, 0], clamp);
  const win = spring({frame: f, fps, config: {damping: 16}});
  return <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
    <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(120px)", background: "rgba(232,119,95,.26)", left: -250 + f * .6, top: -350}} />
    <div style={{position: "absolute", width: 800, height: 800, borderRadius: "50%", filter: "blur(120px)", background: "rgba(127,149,171,.2)", right: -250, bottom: -380}} />
    {/* real run, 6x */}
    <div style={{position: "absolute", left: 56, top: 70, width: 540, height: 290, borderRadius: 22, overflow: "hidden", border: "2px solid rgba(255,255,255,.16)", boxShadow: "0 24px 60px rgba(0,0,0,.5)", transform: `scale(${win})`}}>
      <OffthreadVideo src={staticFile("part2/run6x.mp4")} muted style={{width: 540, height: 290, objectFit: "cover"}} />
      <div style={{position: "absolute", left: 14, top: 14, padding: "6px 14px", borderRadius: 10, background: "rgba(14,14,18,.85)", fontFamily: F, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: K.coral}}>REAL RUN · 6× SPEED</div>
    </div>
    {/* timer */}
    <div style={{position: "absolute", left: 56, top: 390, width: 540, height: 290, borderRadius: 28, background: "rgba(255,255,255,.06)", border: "2px solid rgba(255,255,255,.13)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${win})`}}>
      <div style={{transform: `rotate(${t * 220}deg)`}}><Ic n="clock" s={70} c={K.coral} /></div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 110, letterSpacing: -4, color: K.ink}}>{Math.floor(secs / 60)}m {String(secs % 60).padStart(2, "0")}s</div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: K.mute}}>CLAUDE WORKING ON ITS OWN</div>
    </div>
    {/* animated terminal */}
    <div style={{position: "absolute", left: 640, top: 70, width: 1220, height: 930, borderRadius: 24, background: "#101114", border: "1.5px solid rgba(255,255,255,.14)", boxShadow: "0 40px 100px rgba(0,0,0,.6)", overflow: "hidden", transform: `translateY(${(1 - win) * 80}px)`, opacity: win}}>
      <div style={{height: 58, background: "#1A1C21", display: "flex", alignItems: "center", gap: 12, padding: "0 24px", fontFamily: F, fontWeight: 600, fontSize: 24, color: K.mute}}>
        {[0, 1, 2].map((i) => <span key={i} style={{width: 15, height: 15, borderRadius: "50%", background: "#3a3d44"}} />)}&nbsp; claude · kanban-rea-demo · auto mode on</div>
      <div style={{position: "absolute", left: 0, right: 0, top: 80, padding: "0 46px", transform: `translateY(${-scrollUp}px)`}}>
        {LINES.map((l, i) => {
          if (t < l.at) return null;
          const s = spring({frame: f - Math.round(l.at * fps), fps, config: {damping: 14}});
          const ok = l.done !== undefined && t >= l.done;
          const tick = l.done !== undefined ? spring({frame: f - Math.round(l.done * fps), fps, config: {damping: 9}}) : 0;
          const n = l.n ? Math.round(l.n * interpolate(t, [l.at, l.at + .35], [0, 1], clamp)) : 0;
          return <div key={i} style={{display: "flex", alignItems: "center", gap: 20, height: 72, fontFamily: M, fontSize: 36, color: l.hot ? K.coral : K.ink, fontWeight: l.hot ? 700 : 400, opacity: s, transform: `translateX(${(1 - s) * -40}px)`}}>
            <span style={{width: 40, display: "inline-flex", justifyContent: "center", color: l.hot ? K.coral : ok ? K.ok : K.steel, transform: `scale(${ok ? .6 + .4 * tick : 1})`}}>{l.hot ? "✻" : ok ? "✓" : "●"}</span>
            <span>{l.txt}{l.n ? <span style={{color: K.steel}}> · <b style={{color: K.coral}}>{n}</b> lines</span> : null}</span>
          </div>;
        })}
      </div>
    </div>
    {/* "like a robot that controls a browser" */}
    <div style={{position: "absolute", left: 1400, top: 620, padding: "26px 34px", borderRadius: 30, background: K.coral, display: "flex", alignItems: "center", gap: 18, transform: `scale(${robot * robotOut}) rotate(-4deg)`, boxShadow: "0 30px 70px rgba(0,0,0,.45)"}}>
      <Ic n="bot" s={70} c="#111" /><div style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: "#111", lineHeight: 1.15}}>A robot that<br />controls a browser</div></div>
    {/* PiP, same place as HyperFrames */}
    <div style={{position: "absolute", left: 56, top: 1080 - 56 - 302.4, width: 537.6, height: 302.4, borderRadius: 34, overflow: "hidden", border: `4.5px solid ${K.coral}`, boxShadow: "0 24px 60px rgba(0,0,0,.55)"}}>
      <OffthreadVideo src={staticFile("part2/s7cam.mp4")} muted style={{width: 537.6, height: 302.4}} />
    </div>
  </AbsoluteFill>;
};
