import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import {FONT, FPS, Grain, Glass, P, S, Tag, Words, clamp01, pop, popB} from "./kit";
import {SceneApps, SceneBuild, SceneP1, SceneP2, SceneReport} from "./scenes4";
import captions from "../public/media/captions_prompts.json";
import tmap from "../public/media/prompts_map.json";

const KEEP = tmap.keep as [number, number, number][];
export const PROMPTS_SECONDS = tmap.new_len;
const oldOf = (n: number) => { for (const [a, b, nw] of KEEP) if (n >= nw && n < nw + (b - a)) return a + (n - nw); return KEEP[KEEP.length - 1][1]; };

const PUNCH: [number, number, number, number][] = [[322.0, 322.7, 1.0, 1.04], [349.0, 357.6, 1.1, 1.14], [371.3, 372.4, 1.12, 1.14], [388.4, 388.5, 1.0, 1.0]];
const scaleAt = (t: number) => { for (const [a, b, s0, s1] of PUNCH) if (t >= a && t < b) return s0 + (s1 - s0) * clamp01((t - a) / (b - a)); return 1; };
const ARoll: React.FC = () => {
  const t = oldOf(useCurrentFrame() / FPS);
  return <AbsoluteFill style={{background: "#000", overflow: "hidden"}}><OffthreadVideo src={staticFile("media/aroll_prompts.mp4")} muted style={{width: 1920, height: 1080, transform: `scale(${scaleAt(t)})`, transformOrigin: "50% 38%"}} /></AbsoluteFill>;
};
const Grade: React.FC = () => <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(8,8,10,0.45) 100%)", pointerEvents: "none"}} />;
const Seq: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={S(a)} durationInFrames={S(b - a)} layout="none">{children}</Sequence>;

/* overlays on the A-roll, kept top-left or bottom-left, never on the face */
const Overlays: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{fontFamily: FONT, pointerEvents: "none"}}>
      {t >= 351.5 && t < 357.5 && <div style={{position: "absolute", left: 90, top: 90, opacity: 1 - clamp01((t - 357.1) / 0.4)}}><Words t={t} at={351.6} words={["Claude", "is"]} size={100} /><Words t={t} at={352.0} words={["working..."]} size={140} hotFrom={0} style={{marginTop: -6}} /></div>}
    </AbsoluteFill>
  );
};

const NOCAP: [number, number][] = [[322.7, 349.0], [351.5, 357.5], [357.6, 371.3], [372.4, 413.6]];
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
    <Seq a={322.7} b={349.0}><SceneP1 /></Seq>
    <Seq a={357.6} b={371.3}><SceneApps /></Seq>
    <Seq a={372.4} b={388.4}><SceneReport /></Seq>
    <Seq a={388.5} b={404.3}><SceneP2 /></Seq>
    <Seq a={404.3} b={413.5}><SceneBuild /></Seq>
    <Captions />
  </>
);

export const Prompts: React.FC = () => (
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
