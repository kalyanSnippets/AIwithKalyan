import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {FONT, FPS, Grain, Glass, P, S, Tag, Words, clamp01, pop, popB} from "./kit";
import {SceneBehave, SceneBoard, SceneChrome, SceneGoals, SceneKanban, ScenePublic, SceneReq, SceneSmall, SceneStep1, SceneStep2, SceneStep3, SceneStep4, SceneStep5} from "./scenes3";
import captions from "../public/media/captions_explain.json";
import tmap from "../public/media/explain_map.json";

const KEEP = tmap.keep as [number, number, number][];
export const EXPLAIN_SECONDS = tmap.new_len;
const oldOf = (n: number) => { for (const [a, b, nw] of KEEP) if (n >= nw && n < nw + (b - a)) return a + (n - nw); return KEEP[KEEP.length - 1][1]; };

const PUNCH: [number, number, number, number][] = [[119.4, 124.6, 1.0, 1.08], [124.6, 131.0, 1.11, 1.14], [164.9, 170.0, 1.0, 1.09], [203.6, 209.4, 1.12, 1.15], [209.4, 219.5, 1.0, 1.05]];
const scaleAt = (t: number) => { for (const [a, b, s0, s1] of PUNCH) if (t >= a && t < b) return s0 + (s1 - s0) * clamp01((t - a) / (b - a)); return 1; };
const ARoll: React.FC = () => {
  const t = oldOf(useCurrentFrame() / FPS);
  return <AbsoluteFill style={{background: "#000", overflow: "hidden"}}><OffthreadVideo src={staticFile("media/aroll_explain.mp4")} muted style={{width: 1920, height: 1080, transform: `scale(${scaleAt(t)})`, transformOrigin: "50% 38%"}} /></AbsoluteFill>;
};
const Grade: React.FC = () => <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(8,8,10,0.45) 100%)", pointerEvents: "none"}} />;
const Seq: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={S(a)} durationInFrames={S(b - a)} layout="none">{children}</Sequence>;

/* overlays on the A-roll, kept top-left or bottom-left, never on the face */
const Overlays: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const need = pop(t, 124.7, 0.5) * (1 - clamp01((t - 126.6) / 0.3));
  const lt = pop(t, 126.9, 0.5) * (1 - clamp01((t - 130.6) / 0.4));
  const setup = t >= 203.7 && t < 207.4;
  return (
    <AbsoluteFill style={{fontFamily: FONT, pointerEvents: "none"}}>
      {need > 0.01 && <div style={{position: "absolute", left: 90, top: 90, opacity: need}}><Words t={t} at={124.8} words={["Need", "a", "real", "app"]} size={96} hotFrom={3} /></div>}
      <div style={{position: "absolute", left: 70, bottom: 170, opacity: lt, transform: `translateX(${(1 - lt) * -80}px)`}}>
        <Glass style={{padding: "18px 32px", borderRadius: 24, display: "flex", alignItems: "center", gap: 18}}><div style={{width: 8, height: 56, borderRadius: 4, background: P.coral}} /><div><div style={{fontSize: 42, fontWeight: 800}}>Wekan</div><div style={{fontSize: 26, color: P.mute}}>Open-source Kanban · MIT licence</div></div></Glass>
      </div>
      {t >= 165.1 && t < 169.9 && <div style={{position: "absolute", left: 90, top: 90, opacity: 1 - clamp01((t - 169.5) / 0.4)}}><Words t={t} at={165.2} words={["What", "are", "we"]} size={100} /><Words t={t} at={165.7} words={["building?"]} size={140} hotFrom={0} style={{marginTop: -6}} /></div>}
      {setup && <div style={{position: "absolute", left: 90, top: 90, opacity: 1 - clamp01((t - 207.0) / 0.4)}}><Words t={t} at={203.8} words={["Okay,", "now"]} size={100} /><Words t={t} at={204.2} words={["the", "setup"]} size={150} hotFrom={0} style={{marginTop: -6}} /></div>}
    </AbsoluteFill>
  );
};

const NOCAP: [number, number][] = [[124.7, 126.7], [131.0, 164.9], [165.1, 169.9], [170.0, 203.6], [203.7, 207.4], [209.4, 219.5], [219.5, 322.5]];
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
    <Seq a={131.0} b={144.5}><SceneKanban /></Seq>
    <Seq a={144.5} b={154.0}><ScenePublic /></Seq>
    <Seq a={154.0} b={164.9}><SceneBehave /></Seq>
    <Seq a={170.0} b={179.4}><SceneSmall /></Seq>
    <Seq a={179.4} b={189.3}><SceneBoard /></Seq>
    <Seq a={189.3} b={203.6}><SceneGoals /></Seq>
    <Seq a={209.4} b={219.4}><SceneReq /></Seq>
    <Seq a={219.5} b={243.8}><SceneStep1 /></Seq>
    <Seq a={243.8} b={262.8}><SceneStep2 /></Seq>
    <Seq a={262.8} b={286.0}><SceneStep3 /></Seq>
    <Seq a={286.0} b={300.5}><SceneStep4 /></Seq>
    <Seq a={300.5} b={312.6}><SceneChrome /></Seq>
    <Seq a={312.6} b={322.0}><SceneStep5 /></Seq>
    <Captions />
  </>
);

export const Explain: React.FC = () => (
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
