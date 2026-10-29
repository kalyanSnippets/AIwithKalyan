import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: "src/index.ts", webpackOverride: (c) => c});
const opts = {browserExecutable: "/opt/pw-browsers/chromium", chromeMode: "chrome-for-testing", chromiumOptions: {gl: "angle"}};
const comp = await selectComposition({serveUrl, id: process.env.COMP || "Intro", ...opts});
for (const t of times) {
  await renderStill({composition: comp, serveUrl, frame: Math.round(t * 30), output: `/tmp/work/still_${String(t).replace(".", "_")}.png`, ...opts});
  console.log("still", t);
}
