// Canva build plan for a concept. The Canva MCP edit tools take pixel positions, text and
// formatting; this turns a spec into: one baked background PNG (fills, shapes, decorative images
// and icons), separately uploaded image layers (e.g. the face cutout) and native Canva text
// elements, so the design stays editable in Canva.
import { join } from "node:path";
import { W, H, renderSpec } from "./render.mjs";
import { projectDir, writeJson } from "./paths.mjs";

const hex = (c) => (/^#[0-9a-f]{6}$/i.test(c ?? "") ? c.toUpperCase() : "#FFFFFF");

export async function buildCanvaPlan(projectId, spec, { browser } = {}) {
  const dir = join(projectDir(projectId), "canva");
  const separate = spec.layers.filter((l) => l.type === "image" && l.canva === "separate");
  // base = everything except text and separately uploaded layers
  const baseSpec = { ...spec, layers: spec.layers.filter((l) => l.type !== "text" && !separate.includes(l)) };
  const base = await renderSpec(projectId, baseSpec, join(dir, `${spec.option}-base.png`), { browser });
  const uploads = [{ name: `${spec.option}-base.png`, file: base.png, place: { left: 0, top: 0, width: W, height: H } }];
  for (const l of separate) uploads.push({ name: l.src.split("/").pop(), file: join(projectDir(projectId), l.src), place: { left: l.x, top: l.y, width: l.w, height: l.h }, note: "upload, then insert_fill at place" });
  const texts = spec.layers.filter((l) => l.type === "text").map((l) => ({
    text: l.uppercase ? l.text.toUpperCase() : l.text,
    left: l.x, top: l.y, width: l.w ?? undefined,
    formatting: { font_size: Math.round(l.size), font_weight: "bold", color: hex(l.color), text_align: { left: "start", center: "center", right: "end" }[l.align ?? "left"] },
    note: l.stroke || l.shadow ? "stroke/shadow are not settable through the Canva MCP; add an outline effect in the Canva editor if needed" : undefined,
  }));
  const plan = {
    option: spec.option, title: `AI with Kalyan — ${projectId} — Option ${spec.option} (${spec.archetype})`,
    size: { width: W, height: H },
    steps: [
      "create-design (brief: blank 1280x720 YouTube thumbnail) → design_id; or reuse canva/<OPT>.json design_id",
      "create-upload-url + POST bytes for each upload → media ids",
      "read-design open_transaction → page id + existing element ids; delete generated elements",
      "edit-design insert_fill base at 0,0 1280x720; insert_fill separate layers at their place",
      "edit-design add_text + format_text for each text layer",
      "show the preview; commit only after the user approves; export-design png 1280x720",
    ],
    uploads, texts,
  };
  writeJson(join(dir, `${spec.option}.plan.json`), plan);
  return plan;
}
