import {Composition} from "remotion";
import {Intro, INTRO_SECONDS} from "./Intro";

export const Root = () => (
  <Composition id="Intro" component={Intro} durationInFrames={Math.round(INTRO_SECONDS * 30)} fps={30} width={1920} height={1080} />
);
