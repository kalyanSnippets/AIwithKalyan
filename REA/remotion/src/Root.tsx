import {Composition} from "remotion";
import {Preview, PREVIEW_SECONDS} from "./Preview";

export const Root = () => (
  <Composition id="Preview" component={Preview} durationInFrames={Math.round(PREVIEW_SECONDS * 30)} fps={30} width={1920} height={1080} />
);
