import {Composition} from "remotion";
import {Intro, INTRO_SECONDS} from "./Intro";
import {Explain, EXPLAIN_SECONDS} from "./Explain";
import {Prompts, PROMPTS_SECONDS} from "./Prompts";
import {Samples, SAMPLES_SECONDS} from "./Samples";
import {Hook2, HOOK2_SECONDS} from "./Hook2";
import {NodeMap, NODEMAP_SECONDS, Blender, BLENDER_SECONDS} from "./Part1";
import {RunTerm, RUNTERM_SECONDS} from "./Part2";

export const Root = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={Math.round(INTRO_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Explain" component={Explain} durationInFrames={Math.round(EXPLAIN_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Prompts" component={Prompts} durationInFrames={Math.round(PROMPTS_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Samples" component={Samples} durationInFrames={Math.round(SAMPLES_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Hook2" component={Hook2} durationInFrames={Math.round(HOOK2_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Hook2Cut" component={Hook2} defaultProps={{src: "part1/hook2cut.mp4", label: false}} durationInFrames={Math.round(11.7 * 30)} fps={30} width={1920} height={1080} />
    <Composition id="NodeMap" component={NodeMap} durationInFrames={Math.round(NODEMAP_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Blender" component={Blender} durationInFrames={Math.round(BLENDER_SECONDS * 30)} fps={30} width={1920} height={1080} />
    <Composition id="RunTerm" component={RunTerm} durationInFrames={Math.round(RUNTERM_SECONDS * 30)} fps={30} width={1920} height={1080} />
  </>
);
