import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {FONT, FPS, Grain, Glass, P, S, Tag, Words, clamp01, ease, lerp, pop, popB, rand, seg, useT} from "./kit";
import {SceneFlow, SceneQuestion, SceneStars} from "./scenes1";
import {SceneDX, SceneHonest, SceneNotion, SceneStudy, SceneWeb} from "./scenes2";
import captions from "../public/media/captions_intro.json";
import tmap from "../public/media/intro_map.json";

const KEEP = tmap.keep as [number, number, number][];   // [old start, old end, new start] seconds: the tightened timeline
export const INTRO_SECONDS = tmap.new_len;
export const oldOf = (n: number) => { for (const [a, b, nw] of KEEP) if (n >= nw && n < nw + (b - a)) return a + (n - nw); return KEEP[KEEP.length - 1][1]; };

/* A-roll punch-ins (10 to 15 %) */
const PUNCH: [number, number, number, number][] = [
  [0.3, 4.3, 1.0, 1.09], [8.9, 11.8, 1.12, 1.15], [11.8, 15.4, 1.0, 1.06], [27.8, 30.2, 1.12, 1.15], [30.2, 34.8, 1.0, 1.08], [47.2, 49.9, 1.13, 1.15],
  [69.0, 71.0, 1.0, 1.08], [88.0, 93.0, 1.1, 1.14], [98.6, 102.5, 1.0, 1.08], [107.0, 113.0, 1.12, 1.14], [113.0, 119.4, 1.0, 1.1],
];
const scaleAt = (t: number) => { for (const [a, b, s0, s1] of PUNCH) if (t >= a && t < b) return s0 + (s1 - s0) * clamp01((t - a) / (b - a)); return 1; };
const ARoll: React.FC = () => {
  const t = oldOf(useCurrentFrame() / FPS);
  return <AbsoluteFill style={{background: "#000", overflow: "hidden"}}><OffthreadVideo src={staticFile("media/aroll_intro_tight.mp4")} muted style={{width: 1920, height: 1080, transform: `scale(${scaleAt(t)})`, transformOrigin: "50% 42%"}} /></AbsoluteFill>;
};
/* a very light grade so the A-roll sits in the same world as the graphics */
const Grade: React.FC = () => <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(8,8,10,0.45) 100%)", pointerEvents: "none"}} />;

const Seq: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={S(a)} durationInFrames={S(b - a)} layout="none">{children}</Sequence>;

/* HyperFrames-rendered scenes dropped in as clips, face card on top */
const HF: React.FC<{src: string; a: number; b: number}> = ({src, a, b}) => (
  <Seq a={a} b={b}><AbsoluteFill><OffthreadVideo src={staticFile(src)} muted style={{width: 1920, height: 1080}} /></AbsoluteFill></Seq>
);

const Overlays: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const lt = pop(t, 9.3, 0.5) * (1 - clamp01((t - 13.4) / 0.4));
  const tags = ["AI", "Developers"].map((s, i) => ({s, p: popB(t, 12.85 + i * 0.35, 0.5) * (1 - clamp01((t - 14.9) / 0.4))}));
  const chips: [string, number, boolean][] = [["FREE", 30.5, true], ["OPEN SOURCE", 31.6, false]];
  const name = pop(t, 109.7, 0.5) * (1 - clamp01((t - 112.7) / 0.4));
  const sub = popB(t, 115.9, 0.5) * (1 - clamp01((t - 119.0) / 0.3)), click = clamp01((t - 116.3) / 0.5);
  const letsgo = clamp01((t - 118.1) / 0.1);
  const flash = clamp01(1 - Math.abs(t - 118.95) / 0.12);
  return (
    <AbsoluteFill style={{fontFamily: FONT, pointerEvents: "none"}}>
      {/* lower third */}
      <div style={{position: "absolute", left: 70, bottom: 170, opacity: lt, transform: `translateX(${(1 - lt) * -80}px)`}}>
        <Glass style={{padding: "18px 32px", borderRadius: 24, display: "flex", alignItems: "center", gap: 18}}><div style={{width: 8, height: 56, borderRadius: 4, background: P.coral}} /><div><div style={{fontSize: 40, fontWeight: 800}}>Kalyan</div><div style={{fontSize: 24, color: P.mute}}>AI with Kalyan</div></div></Glass>
      </div>
      {/* floating tags while he says "AI and developer world" */}
      {tags.map((g, i) => <div key={i} style={{position: "absolute", right: 120 + i * 40, top: 150 + i * 120 + Math.sin(t * 2 + i) * 8, opacity: clamp01(g.p * 1.5), transform: `scale(${0.7 + 0.3 * g.p}) rotate(${(1 - g.p) * 12}deg)`}}><Tag hot={i === 0} style={{fontSize: 34, padding: "12px 28px"}}>{g.s}</Tag></div>)}
      {/* chips: stamped */}
      <div style={{position: "absolute", right: 110, top: 120, display: "flex", gap: 18}}>
        {chips.map(([c, at, hot]) => { const p = popB(t, at, 0.3) * (1 - clamp01((t - 33.1) / 0.4)); return <div key={c} style={{opacity: clamp01(p * 2), transform: `scale(${2.2 - 1.2 * p}) rotate(${(1 - p) * -14 + (hot ? -3 : 3)}deg)`}}><Tag hot={hot} style={{fontSize: 38, padding: "14px 32px", borderRadius: 16}}>{c}</Tag></div>; })}
      </div>
      {/* kinetic questions over the A-roll (top-left, away from the face) */}
      {t >= 69.2 && t < 71.0 && <div style={{position: "absolute", left: 90, top: 90}}><Words t={t} at={69.3} words={["Why", "the"]} size={116} /><Words t={t} at={69.6} words={["hype?"]} size={150} hotFrom={0} style={{marginTop: -8}} /></div>}
      {t >= 88.4 && t < 93.0 && <div style={{position: "absolute", left: 90, top: 90, opacity: 1 - clamp01((t - 92.6) / 0.4)}}><Words t={t} at={88.5} words={["Is", "it", "really"]} size={104} /><Words t={t} at={89.3} words={["that", "good?"]} size={120} hotFrom={0} style={{marginTop: -6}} /></div>}
      {t >= 99.2 && t < 102.5 && <div style={{position: "absolute", left: 90, top: 90, opacity: 1 - clamp01((t - 102.1) / 0.4)}}><Words t={t} at={99.3} words={["Stay", "till"]} size={116} /><Words t={t} at={99.65} words={["the", "end"]} size={116} hotFrom={0} style={{marginTop: -6}} /><div style={{marginTop: 26, width: 520, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.14)"}}><div style={{width: `${seg(t, 99.4, 102.3, 0, 100)}%`, height: "100%", borderRadius: 5, background: P.coral}} /></div></div>}
      {/* channel name card */}
      <div style={{position: "absolute", left: 70, bottom: 150, opacity: name, transform: `translateY(${(1 - name) * 40}px)`}}><Glass style={{padding: "20px 34px", borderRadius: 26}}><div style={{fontSize: 56, fontWeight: 800}}>AI with <span style={{color: P.coral}}>Kalyan</span></div><div style={{fontSize: 26, color: P.mute, marginTop: 4}}>simple, practical AI you can try today</div></Glass></div>
      {/* subscribe */}
      <div style={{position: "absolute", right: 90, bottom: 150, opacity: clamp01(sub * 1.6), transform: `scale(${0.7 + 0.3 * sub}) translateY(${(1 - sub) * 40}px)`}}>
        <div style={{display: "flex", alignItems: "center", gap: 16, background: click > 0.1 ? P.panel : P.coral, border: `1px solid ${P.line}`, borderRadius: 22, padding: "18px 34px", fontSize: 44, fontWeight: 800, color: click > 0.1 ? P.ink : "#0B0B0D"}}>
          <svg width="46" height="46" viewBox="0 0 46 46" style={{transform: `rotate(${click > 0.1 ? Math.sin((t - 116.4) * 28) * 22 * (1 - click) : 0}deg)`, transformOrigin: "50% 10%"}}><path d="M23 6a11 11 0 0 0-11 11v8l-4 6h30l-4-6v-8A11 11 0 0 0 23 6zM18 36a5 5 0 0 0 10 0" fill="none" stroke={click > 0.1 ? P.coral : "#0B0B0D"} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {click > 0.1 ? "Subscribed" : "Subscribe"}</div>
      </div>
      {/* "let's go" hit */}
      {t >= 118.1 && <div style={{position: "absolute", right: 90, top: 170, textAlign: "right", opacity: letsgo}}><Words t={t} at={118.15} words={["LET'S"]} size={170} /><Words t={t} at={118.6} words={["GO"]} size={230} hotFrom={0} style={{marginTop: -20}} /></div>}
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 50%, #fff, rgba(232,119,95,0.8) 40%, transparent 75%)", opacity: flash * 0.85, mixBlendMode: "screen"}} />
    </AbsoluteFill>
  );
};

/* short phrases bottom centre, only on the A-roll */
const NOCAP: [number, number][] = [[4.3, 9.0], [15.4, 22.5], [22.4, 27.9], [34.8, 47.3], [49.9, 69.1], [69.2, 71.1], [71.0, 88.1], [88.5, 91.0], [93.0, 98.7], [99.2, 102.6], [102.5, 107.1], [118.1, 119.5]];
const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  if (NOCAP.some(([a, b]) => t >= a && t < b)) return null;
  const ph = (captions as any[]).find((p) => t >= p.t0 - 0.05 && t < p.t1 + 0.3);
  if (!ph) return null;
  return (
    <div style={{position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", fontFamily: FONT}}>
      <div style={{padding: "12px 30px", borderRadius: 22, background: "rgba(11,11,13,0.6)", backdropFilter: "blur(8px)", fontSize: 54, fontWeight: 800, color: P.ink, textShadow: "0 2px 14px rgba(0,0,0,0.6)"}}>
        {ph.words.map((w: any, i: number) => <span key={i} style={{color: t >= w.t0 && t < w.t1 + 0.05 ? P.coral : P.ink}}>{w.w}{i < ph.words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

const Content: React.FC = () => (
  <>
    <Grade />
    <Overlays />
    <Seq a={4.3} b={8.9}><SceneQuestion /></Seq>
    <HF src="media/hf_title.mp4" a={15.4} b={22.4} />
    <Seq a={22.4} b={27.8}><SceneStars /></Seq>
    <Seq a={34.8} b={47.2}><SceneFlow /></Seq>
    <Seq a={49.9} b={56.6}><SceneNotion /></Seq>
    <Seq a={56.6} b={61.8}><SceneDX /></Seq>
    <Seq a={61.8} b={69.0}><SceneWeb /></Seq>
    <HF src="media/hf_reasons.mp4" a={71.0} b={88.0} />
    <Seq a={93.0} b={98.6}><SceneStudy /></Seq>
    <Seq a={102.5} b={107.0}><SceneHonest /></Seq>
    <Captions />
  </>
);

/* the graphics are authored on the original timeline; every kept range plays that timeline from its own start, so pauses are cut from picture, voice and graphics alike */
export const Intro: React.FC = () => (
  <AbsoluteFill style={{background: P.bg}}>
    <ARoll />
    {KEEP.map(([a, b, n], i) => (
      <Sequence key={i} from={Math.round(n * FPS)} durationInFrames={Math.round((b - a) * FPS)} layout="none">
        <Sequence from={-Math.round(a * FPS)} layout="none"><Content /></Sequence>
      </Sequence>
    ))}
    <Grain o={0.06} />
  </AbsoluteFill>
);
