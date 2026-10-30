import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence} from "remotion";
import "@fontsource/inter/400.css"; import "@fontsource/inter/600.css"; import "@fontsource/inter/800.css";

const K = {bg: "#0B0B0D", ink: "#F6F1EC", mute: "rgba(246,241,236,.62)", coral: "#E8775F", steel: "#7F95AB", line: "rgba(255,255,255,.12)"};
export const SAMPLES_SECONDS = 12;
const F = "'Inter',system-ui,sans-serif";

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: K.bg, overflow: "hidden"}}>
    <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", filter: "blur(120px)", background: "rgba(232,119,95,.26)", left: -250 + f * 1.5, top: -350 + f * .6}} />
    <div style={{position: "absolute", width: 800, height: 800, borderRadius: "50%", filter: "blur(120px)", background: "rgba(127,149,171,.18)", right: -250 + f, bottom: -380}} />
  </AbsoluteFill>;
};
const Tag: React.FC<{n: string; t: string}> = ({n, t}) =>
  <div style={{position: "absolute", left: 60, top: 44, fontFamily: F, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: K.steel, textTransform: "uppercase"}}>Remotion <b style={{color: K.coral}}>{n}</b> · {t}</div>;

// R1: 3D flip from the original to the clone, with spring physics
const Flip: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const inS = spring({frame: f, fps, config: {damping: 14}});
  const flip = spring({frame: f - 40, fps, config: {damping: 12, mass: .9}});
  const rot = flip * 180;
  const face = (src: string, label: string, back: boolean) =>
    <div style={{position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined, borderRadius: 30, overflow: "hidden", border: `3px solid ${back ? K.coral : K.line}`, boxShadow: "0 40px 100px rgba(0,0,0,.6)"}}>
      <Img src={staticFile(src)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      <div style={{position: "absolute", left: 24, top: 24, padding: "10px 26px", borderRadius: 999, fontFamily: F, fontWeight: 800, fontSize: 32, letterSpacing: 3, background: back ? K.coral : "rgba(20,20,24,.85)", color: back ? "#111" : K.ink}}>{label}</div>
    </div>;
  return <AbsoluteFill style={{perspective: 2200}}>
    <Bg /><Tag n="R1" t="3D flip: original → clone" />
    <div style={{position: "absolute", left: 260, top: 170, width: 1400, height: 713, transformStyle: "preserve-3d", transform: `scale(${.6 + .4 * inS}) rotateY(${rot}deg) rotateX(${interpolate(flip, [0, .5, 1], [0, 8, 0])}deg)`}}>
      {face("samples/wekan.jpg", "ORIGINAL", false)}{face("samples/reaboard.jpg", "REA BOARD", true)}
    </div>
  </AbsoluteFill>;
};

// R2: word-timed kinetic captions (driven by ElevenLabs word timings in the real edit)
const words = [["It", 0], ["measures,", .25], ["it", .8], ["does", .95], ["NOT", 1.15], ["guess.", 1.45], ["That's", 2.1], ["the", 2.3], ["big", 2.45], ["difference.", 2.65]] as const;
const Kinetic: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const line = t < 2.05 ? words.slice(0, 6) : words.slice(6);
  return <AbsoluteFill>
    <Bg /><Tag n="R2" t="Word-timed kinetic text" />
    <div style={{position: "absolute", left: 120, right: 120, top: 330, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 40px", fontFamily: F, fontWeight: 800, fontSize: 170, letterSpacing: -5}}>
      {line.map(([w, at]) => {
        const s = spring({frame: f - Math.round(at * fps), fps, config: {damping: 11, stiffness: 160}});
        const hot = w === "NOT" || w === "difference.";
        return <span key={w + at} style={{display: "inline-block", opacity: s > 0.01 ? 1 : 0, transform: `translateY(${(1 - s) * 90}px) scale(${.7 + .3 * s})`, color: hot ? K.coral : K.ink}}>{w}</span>;
      })}
    </div>
  </AbsoluteFill>;
};

// R3: animated bar chart for the "match %" reveal
const bars = [["Layout", 96], ["Colours", 94], ["Fonts", 98], ["Behaviour", 90], ["Details", 78]] as const;
const Chart: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Bg /><Tag n="R3" t="Data-driven bar chart" />
    <div style={{position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 100, color: K.ink, letterSpacing: -3}}>How close is the <span style={{color: K.coral}}>copy?</span></div>
    <div style={{position: "absolute", left: 260, right: 260, top: 330, display: "flex", flexDirection: "column", gap: 34}}>
      {bars.map(([l, v], i) => {
        const s = spring({frame: f - 8 - i * 6, fps, config: {damping: 18}});
        return <div key={l} style={{display: "flex", alignItems: "center", gap: 30, fontFamily: F}}>
          <div style={{width: 300, fontWeight: 600, fontSize: 44, color: K.mute, textAlign: "right"}}>{l}</div>
          <div style={{flex: 1, height: 74, borderRadius: 18, background: "rgba(255,255,255,.06)", overflow: "hidden"}}>
            <div style={{width: `${v * s}%`, height: "100%", borderRadius: 18, background: v < 85 ? K.steel : K.coral}} /></div>
          <div style={{width: 150, fontWeight: 800, fontSize: 56, color: K.ink}}>{Math.round(v * s)}%</div>
        </div>;
      })}
    </div>
    <div style={{position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 28, color: K.steel}}>Sample numbers only</div>
  </AbsoluteFill>;
};

export const Samples: React.FC = () => <AbsoluteFill style={{background: K.bg}}>
  <Sequence durationInFrames={120}><Flip /></Sequence>
  <Sequence from={120} durationInFrames={120}><Kinetic /></Sequence>
  <Sequence from={240} durationInFrames={120}><Chart /></Sequence>
</AbsoluteFill>;
