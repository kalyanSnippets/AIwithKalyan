import {Composition, AbsoluteFill} from "remotion";

const Smoke = () => (
  <AbsoluteFill style={{background: "#0b0b0f", color: "#E8775F", fontSize: 120, justifyContent: "center", alignItems: "center", fontFamily: "Inter, sans-serif"}}>
    REA
  </AbsoluteFill>
);

export const Root = () => <Composition id="Smoke" component={Smoke} durationInFrames={30} fps={30} width={1920} height={1080} />;
