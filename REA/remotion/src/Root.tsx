import {Composition} from "remotion";
import {Intro, INTRO_SECONDS} from "./Intro";
import {Explain, EXPLAIN_SECONDS} from "./Explain";
import {Prompts, PROMPTS_SECONDS} from "./Prompts";
import {Samples, SAMPLES_SECONDS} from "./Samples";
import {Hook2, HOOK2_SECONDS} from "./Hook2";

export const Root = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={Math.round(INTRO_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Explain" component={Explain} durationInFrames={Math.round(EXPLAIN_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Prompts" component={Prompts} durationInFrames={Math.round(PROMPTS_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Samples" component={Samples} durationInFrames={Math.round(SAMPLES_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Hook2" component={Hook2} durationInFrames={Math.round(HOOK2_SECONDS * 30)} fps={30} width={1920} height={1080} />
  </>
);
