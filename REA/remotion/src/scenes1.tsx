import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";
import {Backdrop, Cam, Glass, P, Scene, Tag, Words, back, clamp01, ease, easeIO, lerp, pop, popB, rand, seg, useT} from "./kit";

/* small icons */
export const Ic: React.FC<{k: string; s?: number; c?: string}> = ({k, s = 84, c = P.coral}) => {
  const p = {stroke: c, strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
  const v = "0 0 84 84";
  if (k === "window") return <svg width={s} height={s} viewBox={v}><rect x="8" y="14" width="68" height="56" rx="10" {...p} /><path d="M8 30h68" {...p} /></svg>;
  if (k === "term") return <svg width={s} height={s} viewBox={v}><rect x="8" y="14" width="68" height="56" rx="10" {...p} /><path d="M24 34l14 10-14 10M44 56h16" {...p} /></svg>;
  if (k === "evidence") return <svg width={s} height={s} viewBox={v}><circle cx="36" cy="36" r="20" {...p} /><path d="M52 52l18 18M28 36l6 6 10-12" {...p} /></svg>;
  if (k === "build") return <svg width={s} height={s} viewBox={v}><rect x="10" y="44" width="26" height="26" rx="6" {...p} /><rect x="42" y="44" width="26" height="26" rx="6" {...p} /><rect x="26" y="12" width="26" height="26" rx="6" {...p} /></svg>;
  if (k === "gear") return <svg width={s} height={s} viewBox={v}><circle cx="42" cy="42" r="12" {...p} /><path d="M42 8v14M42 62v14M8 42h14M62 42h14M18 18l10 10M56 56l10 10M66 18L56 28M28 56L18 66" {...p} /></svg>;
  if (k === "mag") return <svg width={s} height={s} viewBox={v}><circle cx="34" cy="34" r="22" {...p} /><path d="M50 50l22 22" {...p} /></svg>;
  if (k === "check") return <svg width={s} height={s} viewBox={v}><circle cx="42" cy="42" r="32" {...p} /><path d="M26 43l11 11 21-24" {...p} /></svg>;
  if (k === "cross") return <svg width={s} height={s} viewBox={v}><circle cx="42" cy="42" r="32" {...p} /><path d="M29 29l26 26M55 29L29 55" {...p} /></svg>;
  if (k === "warn") return <svg width={s} height={s} viewBox={v}><path d="M42 10L76 70H8z" {...p} /><path d="M42 33v16M42 59v1" {...p} /></svg>;
  if (k === "cursor") return <svg width={s} height={s} viewBox="0 0 40 40"><path d="M6 4l26 12-11 3-4 11z" fill={P.ink} stroke="#0B0B0D" strokeWidth="2" strokeLinejoin="round" /></svg>;
  return null;
};
const Window: React.FC<{w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; title?: string}> = ({w, h, style, children, title}) => (
  <Glass style={{width: w, height: h, borderRadius: 30, padding: 26, boxSizing: "border-box", ...style}}>
    <div style={{display: "flex", gap: 9, alignItems: "center"}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 15, height: 15, borderRadius: 8, background: i === 0 ? P.coral : "rgba(255,255,255,0.2)"}} />)}{title && <div style={{marginLeft: 14, fontSize: 22, color: P.mute, fontWeight: 600}}>{title}</div>}</div>
    {children}
  </Glass>
);
const Bar: React.FC<{w: number | string; o?: number; h?: number; c?: string; style?: React.CSSProperties}> = ({w, o = 1, h = 18, c = "rgba(255,255,255,0.11)", style}) => <div style={{height: h, width: w, borderRadius: h / 2, background: c, opacity: o, ...style}} />;

/* =========== 4.3 - 8.9 : "I want this in my own project... no idea how it is built" =========== */
export const SceneQuestion: React.FC = () => {
  const a = 4.3, b = 8.9, t = useT(a);
  const float = Math.sin(t * 1.7) * 10, hit = t >= 7.33;
  const q = popB(t, 7.33, 0.45), cur = seg(t, 5.2, 5.9, 0, 1), ripple = clamp01((t - 5.95) / 0.7);
  return (
    <Scene a={a} b={b} enter="wipe">
      <Cam a={a} b={b} s={[1, 1.07]} x={[0, -24]}>
        <div style={{position: "absolute", left: 110, top: 110}}>
          <div style={{fontSize: 30, fontWeight: 800, color: P.coral, letterSpacing: 8, opacity: pop(t, 4.5)}}>SOUND FAMILIAR?</div>
          <Words t={t} at={4.6} words={["“I", "want", "this", "in"]} size={104} style={{marginTop: 24}} />
          <Words t={t} at={5.2} words={["my", "own", "project.”"]} size={104} hotFrom={0} style={{marginTop: -6}} />
          <div style={{fontSize: 48, fontWeight: 600, color: P.mute, marginTop: 34, opacity: pop(t, 6.55), transform: `translateY(${(1 - pop(t, 6.55)) * 26}px)`, whiteSpace: "nowrap"}}>…but you have no idea how it is built.</div>
        </div>
        <div style={{position: "absolute", right: 110, top: 120, perspective: 1900}}>
          <div style={{transform: `rotateY(-17deg) rotateX(6deg) translateY(${float}px)`, transformStyle: "preserve-3d", opacity: pop(t, 4.5, 0.7)}}>
            <Window w={680} h={600} title="some cool app">
              {[0.72, 0.5, 0.62].map((w, i) => <Bar key={i} w={`${w * 100}%`} style={{marginTop: i === 0 ? 40 : 20}} />)}
              <div style={{marginTop: 38, height: 260, borderRadius: 26, border: `3px ${hit ? "solid" : "dashed"} ${P.coral}`, background: "rgba(232,119,95,0.14)", position: "relative", overflow: "hidden", boxShadow: hit ? "0 0 70px rgba(232,119,95,0.35)" : undefined}}>
                <div style={{position: "absolute", left: 26, top: 20, fontSize: 28, fontWeight: 800, color: P.coral, letterSpacing: 4}}>COOL FEATURE</div>
                <div style={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 170, fontWeight: 800, opacity: q, transform: `scale(${0.4 + 0.6 * q}) rotate(${(1 - q) * 20}deg)`}}>?</div>
                {hit && Array.from({length: 7}).map((_, i) => {
                  const k = clamp01((t - 7.35 - i * 0.05) / 1.1);
                  return <div key={i} style={{position: "absolute", left: 40 + rand(i) * 520, top: 220 - k * (120 + rand(i + 3) * 120), fontSize: 36 + rand(i + 1) * 40, fontWeight: 800, color: P.coralHi, opacity: (1 - k) * 0.8}}>?</div>;
                })}
              </div>
              {[0.4, 0.56].map((w, i) => <Bar key={i} w={`${w * 100}%`} style={{marginTop: 24}} />)}
            </Window>
            <div style={{position: "absolute", left: lerp(520, 330, cur), top: lerp(560, 330, cur), opacity: pop(t, 5.1, 0.3), transform: "translateZ(60px)"}}><Ic k="cursor" s={74} /></div>
            <div style={{position: "absolute", left: 340, top: 350, width: 150 * ripple, height: 150 * ripple, marginLeft: -75 * ripple, marginTop: -75 * ripple, borderRadius: "50%", border: `5px solid ${P.coral}`, opacity: (1 - ripple) * (ripple > 0 ? 1 : 0)}} />
            <div style={{position: "absolute", left: lerp(900, 430, ease(clamp01((t - 7.6) / 0.6))), top: 250, opacity: pop(t, 7.55, 0.3) * (1 - pop(t, 8.5, 0.3)), transform: "translateZ(80px)"}}><Ic k="mag" s={150} /></div>
          </div>
        </div>
      </Cam>
    </Scene>
  );
};

/* =========== 22.4 - 27.8 : real GitHub recording + 399K =========== */
export const SceneStars: React.FC = () => {
  const a = 22.4, b = 27.8, t = useT(a);
  const card = popB(t, 22.6, 0.7), zoom = 1 + 0.95 * easeIO(clamp01((t - 24.5) / 1.3));
  const kc = ease(clamp01((t - 24.2) / 2.0)), count = Math.round(399 * kc), done = t >= 26.3, burst = clamp01((t - 26.3) / 1.1);
  const W = 1220, vw = W, vh = vw * (552 / 1024), cropTop = 150 * (vw / 1024), H = 480;
  return (
    <Scene a={a} b={b} enter="zoom" bg={<Backdrop seed={3} tint="coral" particles={60} speed={1.6} />}>
      <AbsoluteFill style={{background: `conic-gradient(from ${t * 18}deg at 66% 40%, rgba(232,119,95,0.0), rgba(232,119,95,0.16), rgba(232,119,95,0.0) 30%, rgba(232,119,95,0.12) 55%, rgba(232,119,95,0) 80%)`, mixBlendMode: "screen"}} />
      <div style={{position: "absolute", left: 540, top: 80, perspective: 2000, opacity: clamp01(card * 1.5)}}>
        <div style={{transform: `rotateY(${-14 + 14 * ease(clamp01((t - 24.3) / 1.2))}deg) rotateX(${5 - 5 * ease(clamp01((t - 24.3) / 1.2))}deg) translateY(${(1 - card) * 120}px) scale(${0.9 + 0.1 * card})`, transformStyle: "preserve-3d"}}>
          <Glass style={{width: W, height: H, overflow: "hidden", borderColor: "rgba(232,119,95,0.5)", position: "relative", padding: 0}}>
            <div style={{position: "absolute", left: 0, top: -cropTop, width: vw, height: vh, transformOrigin: `${925 / 1024 * 100}% ${293 / 552 * 100}%`, transform: `scale(${zoom})`}}>
              <OffthreadVideo src={staticFile("media/github_399k.mp4")} muted startFrom={96} style={{width: vw, height: vh}} />
            </div>
          </Glass>
        </div>
      </div>
      <div style={{position: "absolute", left: 640, top: 600, display: "flex", alignItems: "baseline", gap: 26}}>
        <div style={{fontSize: 270, fontWeight: 800, letterSpacing: -9, lineHeight: 1, color: P.ink, transform: `scale(${1 + (done ? 0.05 * (1 - burst) : 0)})`}}>{count}K</div>
        <div style={{fontSize: 140, color: P.coral, transform: `rotate(${kc * 360}deg) scale(${0.6 + 0.4 * kc})`}}>★</div>
      </div>
      <div style={{position: "absolute", left: 646, top: 905, display: "flex", gap: 14, opacity: pop(t, 26.4, 0.4)}}><Tag hot>GitHub stars</Tag><Tag>morluto/rea</Tag><Tag>from my screen recording</Tag></div>
      {done && Array.from({length: 40}).map((_, i) => {
        const ang = (i / 40) * Math.PI * 2, r = 140 + burst * (260 + rand(i) * 300);
        return <div key={i} style={{position: "absolute", left: 1330 + Math.cos(ang) * r, top: 740 + Math.sin(ang) * r * 0.7, width: 10 + rand(i + 5) * 12, height: 10 + rand(i + 5) * 12, background: i % 3 ? P.coral : P.ink, opacity: (1 - burst) * 0.9, transform: `rotate(${burst * 200 * rand(i)}deg)`}} />;
      })}
    </Scene>
  );
};

/* =========== 34.8 - 47.2 : the 4-station flow, one continuous camera move =========== */
const camX = (t: number) => {
  const k = [[34.8, 0], [37.0, 0], [37.9, 1920], [41.8, 1920], [42.7, 3840], [44.6, 3840], [45.5, 5760], [47.2, 5760]];
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t < k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], easeIO(clamp01((t - k[i][0]) / (k[i + 1][0] - k[i][0]))));
  return 5760;
};
export const SceneFlow: React.FC = () => {
  const a = 34.8, b = 47.2, t = useT(a), cx = camX(t);
  const L = (x: number, y: number, c: React.ReactNode, st?: React.CSSProperties) => <div style={{position: "absolute", left: x, top: y, ...st}}>{c}</div>;
  const typed = (s: string, at: number, cps = 26) => s.slice(0, Math.max(0, Math.floor((t - at) * cps)));
  const stations = ["A feature you like", "Your AI agent", "The evidence", "Your own version"];
  const active = t < 37.4 ? 0 : t < 42.2 ? 1 : t < 45.0 ? 2 : 3;
  return (
    <Scene a={a} b={b} enter="push" bg={<Backdrop seed={9} camX={cx} tint="both" particles={70} />}>
      {/* top rail */}
      <div style={{position: "absolute", left: 540, right: 140, top: 66, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)"}}><div style={{width: `${(active + clamp01((t - [34.8, 37.6, 42.4, 45.2][active]) / 1.5)) / 4 * 100}%`, height: "100%", background: P.coral, borderRadius: 4, maxWidth: "100%"}} /></div>
      {stations.map((s, i) => <div key={i} style={{position: "absolute", left: 520 + i * 360, top: 92, whiteSpace: "nowrap", fontSize: 21, fontWeight: 800, letterSpacing: 2, color: i === active ? P.ink : P.mute, opacity: i === active ? 1 : 0.55}}>{String(i + 1).padStart(2, "0")} {s.toUpperCase()}</div>)}
      <AbsoluteFill style={{transform: `translateX(${-cx}px)`}}>
        {/* station 1 */}
        {L(110, 180, <Words t={t} at={34.95} words={["A", "feature", "you", "like"]} size={104} hotFrom={2} />)}
        {L(116, 470, <div style={{fontSize: 44, fontWeight: 600, color: P.mute, opacity: pop(t, 36.2), whiteSpace: "nowrap"}}>in any app</div>)}
        {L(1050, 210, <div style={{perspective: 1800}}><div style={{transform: `rotateY(-12deg) rotateX(4deg) translateY(${Math.sin(t * 2) * 8}px)`, opacity: pop(t, 35.1, 0.6)}}>
          <Window w={760} h={560} title="any app">
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 34}}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 170, borderRadius: 22, border: `${i === 1 ? 3 : 1}px solid ${i === 1 ? P.coral : P.line}`, background: i === 1 ? "rgba(232,119,95,0.16)" : "rgba(255,255,255,0.05)", boxShadow: i === 1 && t > 36.2 ? "0 0 60px rgba(232,119,95,0.4)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, color: i === 1 ? P.coral : P.mute, transform: `scale(${i === 1 && t > 36.2 ? 1.05 : 1})`}}>{i === 1 ? "I like this" : ""}</div>)}
            </div>
          </Window>
          <div style={{position: "absolute", left: lerp(600, 520, seg(t, 35.4, 36.1, 0, 1)), top: lerp(500, 250, seg(t, 35.4, 36.1, 0, 1)), transform: "translateZ(70px)"}}><Ic k="cursor" s={70} /></div>
          <div style={{position: "absolute", left: 540, top: 290, width: 170 * clamp01((t - 36.15) / 0.8), height: 170 * clamp01((t - 36.15) / 0.8), marginLeft: -85 * clamp01((t - 36.15) / 0.8), marginTop: -85 * clamp01((t - 36.15) / 0.8), borderRadius: "50%", border: `5px solid ${P.coral}`, opacity: 1 - clamp01((t - 36.15) / 0.8)}} />
        </div></div>)}
        {/* station 2 */}
        {L(1920 + 110, 180, <Words t={t} at={37.7} words={["Your", "AI", "agent"]} size={118} hotFrom={1} />)}
        {L(1920 + 116, 470, <div style={{display: "flex", gap: 14, opacity: pop(t, 38.6)}}><Tag>Claude Code</Tag><Tag hot>+ REA</Tag></div>)}
        {L(1920 + 900, 190, <Window w={860} h={560} title="agent" style={{opacity: pop(t, 37.8, 0.6), transform: `translateY(${(1 - pop(t, 37.8, 0.6)) * 60}px)`}}>
          <div style={{marginTop: 30, fontFamily: "monospace", fontSize: 32, lineHeight: 1.7, color: P.ink}}>
            <div style={{color: P.mute}}>{typed("$ claude", 38.2)}</div>
            <div>{typed("> inspect this app with REA", 38.9)}</div>
            <div style={{color: P.coralHi}}>{typed("REA: reading how it works…", 40.0)}</div>
            <div style={{color: P.lime, opacity: t > 41.4 ? 1 : 0}}>✓ findings ready</div>
          </div>
          <div style={{position: "absolute", left: 30, right: 30, bottom: 44, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.1)"}}><div style={{height: "100%", borderRadius: 7, background: P.coral, width: `${seg(t, 39.8, 41.6, 0, 100)}%`}} /></div>
          <svg width="150" height="150" style={{position: "absolute", right: 36, top: 70}} viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" /><circle cx="75" cy="75" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" /><g transform={`rotate(${t * 240} 75 75)`}><path d="M75 75L75 13A62 62 0 0 1 130 48z" fill="rgba(232,119,95,0.4)" /></g></svg>
        </Window>)}
        {/* station 3 */}
        {L(3840 + 110, 180, <Words t={t} at={42.45} words={["The", "evidence"]} size={118} hotFrom={1} />)}
        {L(3840 + 116, 400, <div style={{fontSize: 46, fontWeight: 600, color: P.mute, lineHeight: 1.3, opacity: pop(t, 43.6), maxWidth: 700}}>how it works, explained and shown</div>)}
        {[0, 1, 2].map((i) => L(3840 + 980, 190 + i * 190, <Glass style={{width: 760, height: 160, padding: "0 36px", display: "flex", alignItems: "center", gap: 26, opacity: pop(t, 42.6 + i * 0.35, 0.5), transform: `translateX(${(1 - pop(t, 42.6 + i * 0.35, 0.5)) * 160}px)`}}><Ic k="check" s={64} c={P.lime} /><div style={{flex: 1}}><Bar w="80%" /><Bar w="52%" style={{marginTop: 14}} /></div><Tag>{["observed", "inferred", "evidence"][i]}</Tag></Glass>))}
        {L(3840 + 1200 + (t > 43.6 ? seg(t, 43.6, 44.9, 0, 260) : 0), 160 + (t > 43.6 ? seg(t, 43.6, 44.9, 0, 360) : 0), <div style={{opacity: pop(t, 43.5, 0.3) * (1 - pop(t, 44.9, 0.3))}}><Ic k="mag" s={130} /></div>)}
        {/* station 4 */}
        {L(5760 + 110, 180, <Words t={t} at={45.3} words={["Your", "own", "version"]} size={104} hotFrom={1} />)}
        {L(5760 + 116, 470, <div style={{fontSize: 44, fontWeight: 600, color: P.mute, opacity: pop(t, 46.1), whiteSpace: "nowrap"}}>built with your agent's help</div>)}
        {L(5760 + 1000, 250, <Window w={780} h={540} title="my app" style={{opacity: pop(t, 45.4, 0.5)}}>
          {[[0, 0, 340, 150], [370, 0, 340, 150], [0, 180, 710, 110], [0, 320, 340, 110], [370, 320, 340, 110]].map(([x, y, w, h], i) => {
            const k = popB(t, 45.6 + i * 0.22, 0.5);
            return <div key={i} style={{position: "absolute", left: 36 + x, top: 90 + y, width: w, height: h, borderRadius: 20, background: i === 0 ? "rgba(232,119,95,0.35)" : "rgba(255,255,255,0.09)", border: `1px solid ${P.line}`, opacity: clamp01(k * 1.4), transform: `translate(${(1 - k) * (i % 2 ? 300 : -300)}px, ${(1 - k) * -180}px) rotate(${(1 - k) * 18}deg)`}} />;
          })}
        </Window>)}
      </AbsoluteFill>
    </Scene>
  );
};
