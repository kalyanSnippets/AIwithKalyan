// Thumbnail Studio tests: instruction parsing, spec validation, rendering + QA, rubric maths,
// contact sheets, project isolation, approval guard, connector fallbacks and the VIDEO-001
// deliverables. Projects created here go to a temp dir (THUMBNAIL_STUDIO_PROJECTS).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const STUDIO = new URL("..", import.meta.url).pathname;
const TMP = mkdtempSync(join(tmpdir(), "ts-test-"));
process.env.THUMBNAIL_STUDIO_PROJECTS = TMP;
const cli = (...args) => spawnSync("node", [join(STUDIO, "scripts/studio.mjs"), ...args], { encoding: "utf-8", env: { ...process.env, THUMBNAIL_STUDIO_PROJECTS: TMP } });

const { parseInstruction, optionLetter } = await import("../scripts/lib/intent.mjs");
const { validateSpec, renderSpec } = await import("../scripts/lib/render.mjs");
const { qaRender, contrast, parseRgb } = await import("../scripts/lib/qa.mjs");
const { RUBRIC, scoreReview, applyQaCaps } = await import("../scripts/lib/rubric.mjs");
const { contactSheet, mobileSheet } = await import("../scripts/lib/sheet.mjs");
const { ensureProject, nextProjectId, projectDir } = await import("../scripts/lib/paths.mjs");

test("instruction parsing covers the five /thumbnail forms", () => {
  assert.deepEqual(parseInstruction("Claude Code edits my videos"), { action: "new", project: null, topic: "Claude Code edits my videos", count: 5 });
  assert.deepEqual(parseInstruction("VIDEO-001"), { action: "resume", project: "VIDEO-001" });
  assert.equal(parseInstruction("make 5 more options").action, "more");
  assert.equal(parseInstruction("make five more options").count, 5);
  assert.deepEqual(parseInstruction("revise option 3"), { action: "revise", project: null, option: "C", note: "revise option 3" });
  assert.deepEqual(parseInstruction("finalise option 2"), { action: "finalise", project: null, option: "B" });
  assert.equal(parseInstruction("finalize option B for VIDEO-002").project, "VIDEO-002");
  assert.equal(parseInstruction("").action, "status");
  assert.equal(optionLetter("4"), "D");
  assert.equal(optionLetter("e"), "E");
});

test("spec validation rejects malformed specs and missing assets", () => {
  ensureProject("VIDEO-901");
  const errs = validateSpec({ option: "A", archetype: "x", headline: "one two three four five six seven", layers: [{ type: "image", x: 0, y: 0, w: 10, h: 10, src: "assets/nope.png" }, { type: "blob" }] }, "VIDEO-901");
  assert.ok(errs.some((e) => e.includes("missing asset")));
  assert.ok(errs.some((e) => e.includes('unknown type "blob"')));
  assert.ok(errs.some((e) => e.includes("7 words")));
  assert.deepEqual(validateSpec({ option: "A", archetype: "x", headline: "OK", layers: [{ type: "fill", background: "#000" }] }, "VIDEO-901"), []);
});

test("render produces a 1280x720 PNG and QA measures text, contrast and blanks", async () => {
  const id = "VIDEO-902"; ensureProject(id);
  const spec = { option: "A", archetype: "test", headline: "HELLO", layers: [
    { type: "fill", background: "linear-gradient(90deg,#101018,#3a1f2a)" },
    { type: "shape", x: 800, y: 200, w: 300, h: 300, radius: 150, background: "#E8775F", role: "focal" },
    { type: "text", role: "headline", text: "HELLO", x: 60, y: 260, size: 120, color: "#FFFFFF" },
    { type: "text", text: "tiny", x: 60, y: 450, size: 20, color: "#333333" },
  ] };
  const out = join(projectDir(id), "exports", "A.png");
  const r = await renderSpec(id, spec, out);
  const m = await sharp(out).metadata();
  assert.equal(m.width, 1280); assert.equal(m.height, 720);
  const qa = await qaRender({ ...r, spec });
  const get = (re) => qa.checks.filter((c) => re.test(c.name));
  assert.ok(get(/^dimensions/)[0].pass);
  assert.ok(get(/^not blank/)[0].pass);
  assert.ok(get(/^text size "HELLO"/)[0].pass);
  assert.equal(get(/^text size "tiny"/)[0].pass, false, "20px text must fail the mobile size check");
  assert.equal(get(/^contrast "tiny"/)[0].pass, false, "dark grey on dark must fail contrast");
  assert.ok(qa.pass, "only warnings, so the render passes overall");
  // blank render detection
  const blank = { option: "B", archetype: "t", headline: "", layers: [{ type: "fill", background: "#000" }] };
  const rb = await renderSpec(id, blank, join(projectDir(id), "exports", "B.png"));
  const qb = await qaRender({ ...rb, spec: blank });
  assert.equal(qb.checks.find((c) => c.name === "not blank").pass, false);
  assert.equal(qb.pass, false);
});

test("text outside the frame or on the face fails QA", async () => {
  const id = "VIDEO-903"; ensureProject(id);
  const spec = { option: "A", archetype: "t", headline: "OVER", layers: [
    { type: "fill", background: "#202030" },
    { type: "shape", x: 600, y: 100, w: 300, h: 300, background: "#a07060", faceBox: { x: 600, y: 100, w: 300, h: 300 } },
    { type: "text", role: "headline", text: "OVER THE FACE", x: 700, y: 180, size: 90, color: "#FFFFFF" },
  ] };
  const r = await renderSpec(id, spec, join(projectDir(id), "exports", "A.png"));
  const qa = await qaRender({ ...r, spec });
  assert.equal(qa.checks.find((c) => c.name.startsWith("text off face")).pass, false);
  assert.equal(qa.checks.find((c) => c.name.startsWith("inside frame")).pass, false);
  assert.equal(qa.pass, false);
});

test("contrast and colour parsing", () => {
  assert.deepEqual(parseRgb("#E8775F"), [232, 119, 95]);
  assert.deepEqual(parseRgb("rgb(1, 2, 3)"), [1, 2, 3]);
  assert.ok(Math.abs(contrast([255, 255, 255], [0, 0, 0]) - 21) < 0.01);
  assert.ok(contrast([11, 11, 18], [232, 119, 95]) > 4.5, "ink on coral passes");
  assert.ok(contrast([255, 255, 255], [232, 119, 95]) < 4.5, "white on coral fails");
});

test("rubric weights sum to 100 and QA caps apply by severity", () => {
  assert.equal(RUBRIC.reduce((s, c) => s + c.weight, 0), 100);
  const all5 = { scores: Object.fromEntries(RUBRIC.map((c) => [c.key, 5])) };
  assert.equal(scoreReview(all5), 100);
  const warnQa = { checks: [{ name: 'text size "x"', pass: false, severity: "warn" }] };
  assert.equal(applyQaCaps(all5, warnQa).scores.legibility, 4);
  const errQa = { checks: [{ name: 'text size "x"', pass: false, severity: "error" }] };
  assert.equal(applyQaCaps(all5, errQa).scores.legibility, 2);
  const blankQa = { checks: [{ name: "not blank", pass: false, severity: "error" }] };
  assert.equal(scoreReview(applyQaCaps(all5, blankQa)), 20);
  assert.throws(() => scoreReview({ scores: { legibility: 9 } }));
});

test("contact sheet and mobile sheet render", async () => {
  const id = "VIDEO-902";
  const png = join(projectDir(id), "exports", "A.png");
  const cs = await contactSheet([{ png, label: "A", sub: "x" }, { png, label: "B" }], join(TMP, "cs.png"), { title: "t" });
  const ms = await mobileSheet([{ png, label: "A" }], join(TMP, "ms.png"));
  assert.ok((await sharp(cs).metadata()).width > 1000);
  assert.equal((await sharp(ms).metadata()).height, 180 + 46 + 32);
});

test("CLI: new projects get sequential ids and never overwrite; isolation is enforced", () => {
  const a = cli("new", "First topic"); assert.equal(a.status, 0, a.stderr);
  const id = a.stdout.match(/VIDEO-\d+/)[0];
  assert.equal(cli("new", "Clash", "--id", id).status, 1, "existing project must not be overwritten");
  for (const d of ["brief", "research", "concepts", "assets", "canva", "exports", "reviews"]) assert.ok(existsSync(join(TMP, id, d)), `${d} dir`);
  assert.match(nextProjectId(), /^VIDEO-\d{3}$/);
  // a concept that points at another project's asset is reported by validate
  mkdirSync(join(TMP, id, "concepts"), { recursive: true });
  writeFileSync(join(TMP, id, "concepts", "A.json"), JSON.stringify({ option: "A", archetype: "x", headline: "X", layers: [{ type: "fill", background: "#000" }, { type: "image", src: "../VIDEO-001/assets/x.png", x: 0, y: 0, w: 1, h: 1 }] }));
  const v = cli("validate", id);
  assert.equal(v.status, 1);
  assert.match(v.stdout, /another project's asset|missing asset/);
  assert.match(v.stdout, /missing research\/report.md/);
});

test("CLI: finalise refuses without approval and protects an approved option", () => {
  const id = "VIDEO-950";
  assert.equal(cli("new", "Approval test", "--id", id).status, 0);
  for (const o of ["A", "B"]) {
    writeFileSync(join(TMP, id, "concepts", `${o}.json`), JSON.stringify({ option: o, archetype: "x", headline: o, layers: [{ type: "fill", background: "#123" }] }));
    copyFileSync(join(TMP, "VIDEO-902", "exports", "A.png"), join(TMP, id, "exports", `${o}.png`));
  }
  const noApproval = cli("finalise", id, "A");
  assert.equal(noApproval.status, 1); assert.match(noApproval.stderr, /approval/);
  assert.equal(cli("finalise", id, "A", "--approved").status, 0);
  assert.ok(existsSync(join(TMP, id, "exports", "FINAL.png")));
  const replace = cli("finalise", id, "B", "--approved");
  assert.equal(replace.status, 1, "replacing an approved option needs --force");
  assert.match(replace.stderr, /already approved/);
});

test("connector config documents every connector with a fallback-safe shape", () => {
  const c = JSON.parse(readFileSync(join(STUDIO, "config/connectors.json"), "utf-8"));
  for (const k of ["vidiq", "canva", "imageGeneration", "local", "youtube"]) assert.ok(c[k], `connector ${k}`);
  for (const [tool, cost] of Object.entries(c.vidiq.tools)) assert.match(cost, /credit/, `${tool} cost documented`);
  assert.ok(c.canva.status && c.canva.status.uploads, "canva upload status recorded");
});

test("doctor reports the local toolchain", () => {
  const d = cli("doctor");
  assert.match(d.stdout, /chromium/);
  assert.match(d.stdout, /cutout model/);
});

test("VIDEO-001 end-to-end deliverables are present and valid", { skip: !existsSync(join(STUDIO, "projects/VIDEO-001/state.json")) && "VIDEO-001 not built" }, () => {
  const r = spawnSync("node", [join(STUDIO, "scripts/studio.mjs"), "validate", "VIDEO-001"], { encoding: "utf-8", env: { ...process.env, THUMBNAIL_STUDIO_PROJECTS: join(STUDIO, "projects") } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
