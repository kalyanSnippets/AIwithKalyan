#!/usr/bin/env node
// AI with Kalyan — Thumbnail Studio CLI.
//
//   node scripts/studio.mjs doctor [--fix]
//   node scripts/studio.mjs parse "<instruction>"            how /thumbnail reads an instruction
//   node scripts/studio.mjs new "<topic>" [--title "…"] [--id VIDEO-002]
//   node scripts/studio.mjs status [VIDEO-001]
//   node scripts/studio.mjs frames VIDEO-001 <video> --at 12.5,40,61   face frames from own footage
//   node scripts/studio.mjs cutout VIDEO-001 <image> <name> [--erase x,y,w,h]  transparent subject PNG + face box
//   node scripts/studio.mjs render VIDEO-001 [A B …]                  spec → 1280x720 PNG + QA
//   node scripts/studio.mjs review VIDEO-001                          rubric scores + comparison table
//   node scripts/studio.mjs sheet VIDEO-001                           contact sheet + mobile feed sheet
//   node scripts/studio.mjs research-report VIDEO-001                 research/report.md from research data
//   node scripts/studio.mjs canva-plan VIDEO-001 <OPT>                Canva layer plan + base PNG
//   node scripts/studio.mjs strategy VIDEO-001                        concepts/strategy.md from the specs
//   node scripts/studio.mjs deliver VIDEO-001                         delivery.md (ranking, files, Canva, next step)
//   node scripts/studio.mjs validate VIDEO-001                        all deliverables present and valid
//   node scripts/studio.mjs finalise VIDEO-001 <OPT> --approved [--force]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { launch, findChrome } from "./lib/browser.mjs";
import { renderSpec, validateSpec, W, H } from "./lib/render.mjs";
import { qaRender, imageInfo } from "./lib/qa.mjs";
import { RUBRIC, DISCLAIMER, scoreReview, applyQaCaps, NEEDS_REVISION_BELOW, MAX_REVISIONS } from "./lib/rubric.mjs";
import { contactSheet, mobileSheet } from "./lib/sheet.mjs";
import { buildCanvaPlan } from "./lib/canva.mjs";
import { parseInstruction } from "./lib/intent.mjs";
import { STUDIO, PROJECTS, ensureProject, isProjectId, listProjects, nextProjectId, projectDir, readJson, writeJson } from "./lib/paths.mjs";
import { initState, loadState, updateState } from "./lib/state.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a, i, arr) => {
  const k = a.slice(2); const idx = rest.indexOf(a); const v = rest[idx + 1];
  return [k, v && !v.startsWith("--") ? v : true];
}));
const pos = rest.filter((a, i) => !a.startsWith("--") && !(i > 0 && rest[i - 1].startsWith("--") && flags[rest[i - 1].slice(2)] === a));
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const need = (id) => { if (!isProjectId(id)) die(`expected a project id like VIDEO-001, got "${id ?? ""}"`); if (!loadState(id)) die(`${id} does not exist (run: studio new "<topic>")`); return id; };
const P = (id, ...p) => join(projectDir(id), ...p);
const optionsOf = (id) => existsSync(P(id, "concepts")) ? readdirSync(P(id, "concepts")).filter((f) => /^[A-Z]\.json$/.test(f)).map((f) => f[0]).sort() : [];
const cfg = readJson(join(STUDIO, "config/studio.json"), {});

async function doctor() {
  const rows = [];
  const add = (name, ok, detail, fix) => rows.push({ name, ok, detail, fix });
  const major = Number(process.versions.node.split(".")[0]);
  add("node ≥ 22", major >= 22, process.versions.node);
  let sharpOk = false; try { await import("sharp"); sharpOk = true; } catch {}
  add("sharp", sharpOk, sharpOk ? "loaded" : "missing", "npm install");
  const chrome = findChrome();
  add("chromium", !!chrome, chrome ?? "not found", "set CHROME_PATH or install Chrome/Chromium");
  const has = (bin, a = ["-version"]) => { try { execFileSync(bin, a, { stdio: "pipe" }); return true; } catch { return false; } };
  add("ffmpeg", has("ffmpeg"), "frame extraction", "install ffmpeg");
  add("imagemagick", has("convert") || has("magick"), "optional", "optional");
  const py = spawnSync("python3", ["-c", "import mediapipe, PIL, numpy; print(mediapipe.__version__)"], { encoding: "utf-8" });
  add("python mediapipe + pillow", py.status === 0, py.status === 0 ? `mediapipe ${py.stdout.trim()}` : "missing", "pip install mediapipe pillow numpy");
  const model = join(STUDIO, "models/selfie_multiclass.tflite");
  if (!existsSync(model) && flags.fix) {
    mkdirSync(join(STUDIO, "models"), { recursive: true });
    spawnSync("curl", ["-sSfL", "-o", model, cfg.cutoutModelUrl], { stdio: "inherit" });
  }
  add("cutout model", existsSync(model), existsSync(model) ? "models/selfie_multiclass.tflite" : "missing", "studio doctor --fix");
  for (const f of ["InterDisplay-Black.otf", "InterDisplay-ExtraBold.otf", "InterDisplay-Bold.otf", "Inter-SemiBold.otf"]) add(`font ${f}`, existsSync(join(STUDIO, "brand/fonts", f)), "brand/fonts");
  add("lucide icons", existsSync(join(STUDIO, "node_modules/lucide-static/icons/sparkles.svg")), "node_modules/lucide-static", "npm install");
  let conn = null; try { conn = JSON.parse(readFileSync(join(STUDIO, "config/connectors.json"), "utf-8")); } catch {}
  add("connector config", !!conn, conn ? Object.keys(conn).filter((k) => !k.startsWith("_")).join(", ") : "invalid JSON");
  add("projects dir", existsSync(PROJECTS), `${PROJECTS} (${listProjects().length} projects)`);
  for (const r of rows) console.log(`${r.ok ? "✓" : "✗"} ${r.name.padEnd(28)} ${r.detail}${!r.ok && r.fix ? `  → ${r.fix}` : ""}`);
  console.log("\nMCP connectors (vidIQ, Canva, image generation) are checked by Claude at the start of /thumbnail; see config/connectors.json.");
  const required = rows.filter((r) => !["imagemagick"].includes(r.name));
  return required.every((r) => r.ok);
}

function newProject(topic) {
  if (!topic) die('usage: studio new "<topic>"');
  const id = flags.id ?? nextProjectId();
  if (loadState(id)) die(`${id} already exists; projects are never overwritten`);
  ensureProject(id);
  const s = initState(id, { topic, title: flags.title });
  writeFileSync(P(id, "brief", "brief.md"), `# ${id} — brief\n\n- **Topic:** ${topic}\n- **Working title:** ${s.workingTitle}\n- **Channel:** AI with Kalyan\n- **Audience:** global English-speaking tech enthusiasts, creators, professionals, beginners\n- **Emotional hook:** _to fill_\n- **Promise (what the viewer gets):** _to fill_\n- **Real evidence available (footage, screens, results):** _to fill_\n- **Must not claim:** _to fill_\n`);
  console.log(`✓ created ${id} at ${projectDir(id)}`);
  return id;
}

function status(id) {
  const ids = id ? [need(id)] : listProjects();
  if (!ids.length) return console.log("no projects yet");
  for (const p of ids) {
    const s = loadState(p);
    const opts = optionsOf(p).map((o) => `${o}${existsSync(P(p, "exports", `${o}.png`)) ? "✓" : "·"}`).join(" ");
    console.log(`${p}  stage=${s.stage}  approved=${s.approved ?? "—"}  options: ${opts || "none"}  — ${s.topic}`);
  }
}

async function render(id, opts) {
  need(id);
  opts = opts.length ? opts : optionsOf(id);
  if (!opts.length) die(`${id} has no concepts/*.json yet`);
  const browser = await launch();
  const results = [];
  try {
    for (const o of opts) {
      const spec = readJson(P(id, "concepts", `${o}.json`));
      if (!spec) die(`missing concepts/${o}.json`);
      const out = P(id, "exports", `${o}.png`);
      if (existsSync(out)) { // keep every earlier revision
        mkdirSync(P(id, "exports", "history"), { recursive: true });
        const n = readdirSync(P(id, "exports", "history")).filter((f) => f.startsWith(`${o}.r`)).length + 1;
        copyFileSync(out, P(id, "exports", "history", `${o}.r${n}.png`));
      }
      const r = await renderSpec(id, spec, out, { browser });
      const qa = await qaRender({ ...r, spec });
      writeJson(P(id, "reviews", `${o}.qa.json`), { option: o, revision: spec.revision ?? 0, renderedAt: new Date().toISOString(), ...qa, layout: r.layout });
      const fails = qa.checks.filter((c) => !c.pass);
      console.log(`${qa.pass ? "✓" : "✗"} ${o} rev ${spec.revision ?? 0} → exports/${o}.png  ${fails.length ? fails.map((f) => `[${f.severity}] ${f.name}: ${f.detail}`).join("\n      ") : "all QA checks pass"}`);
      results.push({ option: o, pass: qa.pass });
    }
  } finally { await browser.close(); }
  updateState(id, (s) => { s.stage = s.stage === "approved" ? s.stage : "review"; for (const r of results) s.options[r.option] = { ...(s.options[r.option] ?? {}), rendered: true, qaPass: r.pass }; }, `rendered ${opts.join(",")}`);
  return results;
}

function review(id) {
  need(id);
  const rows = [];
  for (const o of optionsOf(id)) {
    const rv = readJson(P(id, "reviews", `${o}.review.json`));
    const qa = readJson(P(id, "reviews", `${o}.qa.json`));
    const spec = readJson(P(id, "concepts", `${o}.json`));
    if (!rv || !qa) { rows.push({ option: o, missing: !rv ? "review" : "qa" }); continue; }
    const capped = applyQaCaps(rv, qa);
    const score = scoreReview(capped);
    rows.push({ option: o, archetype: spec.archetype, headline: spec.headline, revision: spec.revision ?? 0, scores: capped.scores, score, qaPass: qa.pass, verdict: rv.verdict ?? "", revise: score < NEEDS_REVISION_BELOW && (spec.revision ?? 0) < MAX_REVISIONS });
  }
  const scored = rows.filter((r) => r.score !== undefined).sort((a, b) => b.score - a.score);
  scored.forEach((r, k) => (r.rank = k + 1));
  writeJson(P(id, "reviews", "scores.json"), { disclaimer: DISCLAIMER, rubric: RUBRIC, rows });
  const head = `| Rank | Option | Archetype | Text | ${RUBRIC.map((c) => `${c.label} (${c.weight})`).join(" | ")} | Score /100 | QA |`;
  const sep = `|${"---|".repeat(6 + RUBRIC.length)}`;
  const body = scored.map((r) => `| ${r.rank} | ${r.option} | ${r.archetype} | "${r.headline}" | ${RUBRIC.map((c) => r.scores[c.key]).join(" | ")} | **${r.score}** | ${r.qaPass ? "pass" : "fail"} |`).join("\n");
  const md = `# ${id} — comparison\n\n_${DISCLAIMER}_\n\n${head}\n${sep}\n${body}\n\n## Rubric\n\n${RUBRIC.map((c) => `- **${c.label}** (weight ${c.weight}): ${c.ask}`).join("\n")}\n\nAutomated QA caps: a headline below the mobile size minimum caps legibility at 2, small secondary text at 4, a contrast warning at 3, text over the face caps hierarchy at 2, and a missing or blank export scores 1 everywhere.\n${rows.filter((r) => r.missing).map((r) => `\n- Option ${r.option}: no ${r.missing} yet`).join("")}\n`;
  writeFileSync(P(id, "reviews", "comparison.md"), md);
  console.log(md);
  return scored;
}

async function sheet(id) {
  need(id);
  const scores = readJson(P(id, "reviews", "scores.json"), { rows: [] }).rows;
  const items = optionsOf(id).filter((o) => existsSync(P(id, "exports", `${o}.png`))).map((o) => {
    const spec = readJson(P(id, "concepts", `${o}.json`)); const sc = scores.find((r) => r.option === o);
    return { png: P(id, "exports", `${o}.png`), label: `${o} · ${spec.archetype}`, sub: sc?.score !== undefined ? `rubric ${sc.score}/100 · rank ${sc.rank}` : spec.headline };
  });
  if (!items.length) die("no exports to put on a sheet");
  const s = loadState(id);
  await contactSheet(items, P(id, "exports", "contact-sheet.png"), { title: `AI with Kalyan — ${id}: ${s.workingTitle}` });
  await mobileSheet(items.map((i) => ({ ...i, sub: "AI with Kalyan" })), P(id, "exports", "mobile-feed.png"));
  console.log(`✓ exports/contact-sheet.png, exports/mobile-feed.png (${items.length} candidates)`);
}

function researchReport(id) {
  need(id);
  const vids = readJson(P(id, "research", "videos.json"));
  if (!vids?.videos?.length) die("research/videos.json has no videos yet");
  const fmt = (v) => (v === null || v === undefined || v === "" ? "not provided" : typeof v === "number" ? v.toLocaleString("en-US") : v);
  const refs = vids.videos.filter((v) => v.reference);
  const md = [`# ${id} — research report`, "", `Observed ${vids.observedAt} via ${vids.sources.join(", ")}. Metrics are copied from tool output; "not provided" means the tool did not return it. Views and outlier scores describe video performance, **not** thumbnail CTR (YouTube does not expose CTR for other channels).`, "",
    `## Videos reviewed (${vids.videos.length})`, "", "| # | Video | Channel | Published | Views | Outlier / breakout | VPH | Ref |", "|---|---|---|---|---|---|---|---|",
    ...vids.videos.map((v, k) => `| ${k + 1} | [${v.title.replace(/\|/g, "/")}](https://www.youtube.com/watch?v=${v.id}) | ${fmt(v.channel)} | ${fmt(v.published)} | ${fmt(v.views)} | ${fmt(v.outlier)} | ${fmt(v.vph)} | ${v.reference ? "★" : ""} |`),
    "", `## Reference thumbnails (${refs.length})`, "", ...refs.map((v) => `- **[${v.title}](https://www.youtube.com/watch?v=${v.id})** — ${v.thumbnailNotes ?? "no visual notes"} _(evidence: ${v.evidence ?? "tool metadata"})_`),
    "", readFileSync(P(id, "research", "analysis.md"), "utf-8")].join("\n");
  writeFileSync(P(id, "research", "report.md"), md);
  console.log(`✓ research/report.md (${vids.videos.length} videos, ${refs.length} references)`);
}

function strategy(id) {
  need(id);
  const s = loadState(id);
  const L = (a) => (a?.length ? a.map((x) => `  - ${x}`).join("\n") : "  - none");
  const parts = optionsOf(id).map((o) => {
    const c = readJson(P(id, "concepts", `${o}.json`));
    const texts = c.layers.filter((l) => l.type === "text").map((l) => `"${l.text.replace(/\n/g, " ")}" (${l.size}px)`).join(", ");
    return `## Option ${o} — ${c.archetype} (revision ${c.revision ?? 0})\n\n- **Story:** ${c.story}\n- **Curiosity trigger:** ${c.curiosity}\n- **Composition and subject positions:** ${c.composition}\n- **Main image / genuine evidence:** ${c.evidence}\n- **Background:** ${c.background}\n- **Typography:** ${c.typography} Layers: ${texts}\n- **Colours, contrast, lighting:** ${c.colors}\n- **Canva instructions:** ${c.canva} (plan: \`studio canva-plan ${id} ${o}\`)\n- **Image-generation prompts:**\n${L(c.image_prompts)}\n- **Why it could work:**\n${L(c.why)}\n- **Risks and weaknesses:**\n${L(c.risks)}\n`;
  });
  const md = `# ${id} — thumbnail strategy\n\n**Video:** ${s.topic}\n**Working title:** ${s.workingTitle}\n\nFive distinct archetypes adapted to the research (see research/report.md). Shared rules: 1280x720, one focal point, at most 4 headline words, readable at 320 px, real evidence only, Kalyan's real face only, no Claude logo (no officially sourced file), bottom-right kept clear for the duration badge.\n\n${parts.join("\n")}`;
  writeFileSync(P(id, "concepts", "strategy.md"), md);
  console.log(`✓ concepts/strategy.md (${parts.length} concepts)`);
}

function deliver(id) {
  need(id);
  const sc = readJson(P(id, "reviews", "scores.json"));
  if (!sc) die("run review first");
  const rows = sc.rows.filter((r) => r.score !== undefined).sort((a, b) => a.rank - b.rank);
  const rec = existsSync(P(id, "reviews", "recommendation.md")) ? readFileSync(P(id, "reviews", "recommendation.md"), "utf-8") : "_No recommendation written yet._";
  const canva = optionsOf(id).map((o) => readJson(P(id, "canva", `${o}.json`))).filter(Boolean);
  const s = loadState(id);
  const md = [`# ${id} — delivery`, "", `**${s.workingTitle}** — ${s.topic}`, "", "## Ranked candidates", "", `_${sc.disclaimer}_`, "", "| Rank | Option | Archetype | Text | Score | File |", "|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.rank} | ${r.option} | ${r.archetype} | "${r.headline}" | ${r.score} | exports/${r.option}.png |`), "", rec, "",
    "## Files", "", "- Research report: research/report.md (sources linked)", "- Strategy: concepts/strategy.md", "- Editable sources: concepts/<OPT>.json (layered spec) → exports/<OPT>.png", "- Contact sheet: exports/contact-sheet.png · mobile feed: exports/mobile-feed.png", "- Comparison: reviews/comparison.md · QA: reviews/<OPT>.qa.json", "",
    "## Canva", "", ...(canva.length ? canva.map((c) => `- Option ${c.option}: design ${c.design_id} — ${c.edit_url} — ${c.state}`) : ["- none yet"]), "",
    "## Approval", "", s.approved ? `Approved: option ${s.approved} → exports/FINAL.png` : `Nothing is final until Kalyan picks one: \`/thumbnail finalise option <n>\` (runs \`studio finalise ${id} <OPT> --approved\`).`].join("\n");
  writeFileSync(P(id, "delivery.md"), md + "\n");
  updateState(id, (st) => { if (st.stage !== "approved") st.stage = "delivered"; }, "delivered");
  console.log(`✓ delivery.md (${rows.length} ranked)`);
}

function validate(id) {
  need(id);
  const problems = [];
  const req = ["brief/brief.md", "research/videos.json", "research/report.md", "concepts/strategy.md", "reviews/comparison.md", "reviews/scores.json", "exports/contact-sheet.png", "exports/mobile-feed.png", "delivery.md"];
  for (const f of req) if (!existsSync(P(id, f))) problems.push(`missing ${f}`);
  const opts = optionsOf(id);
  if (opts.length < 5) problems.push(`only ${opts.length} concepts (need 5)`);
  for (const o of opts) {
    const spec = readJson(P(id, "concepts", `${o}.json`));
    const errs = validateSpec(spec, id);
    if (errs.length) problems.push(`concept ${o}: ${errs.join("; ")}`);
    const png = P(id, "exports", `${o}.png`);
    if (!existsSync(png)) problems.push(`missing exports/${o}.png`);
    if (!existsSync(P(id, "reviews", `${o}.review.json`))) problems.push(`missing reviews/${o}.review.json`);
  }
  // project isolation: specs may only reference their own project or shared studio assets
  for (const o of opts) for (const l of readJson(P(id, "concepts", `${o}.json`)).layers) {
    if (l.src && /projects\/VIDEO-\d+/.test(l.src) && !l.src.includes(id)) problems.push(`concept ${o} references another project's asset: ${l.src}`);
    if (l.src && l.src.startsWith("/")) problems.push(`concept ${o} uses an absolute path (not portable): ${l.src}`);
  }
  return problems;
}

async function validateCmd(id) {
  const problems = validate(id);
  for (const o of optionsOf(id)) {
    const i = await imageInfo(P(id, "exports", `${o}.png`));
    if (i.exists && (i.width !== W || i.height !== H)) problems.push(`exports/${o}.png is ${i.width}x${i.height}`);
  }
  if (problems.length) { console.log(problems.map((p) => `✗ ${p}`).join("\n")); process.exitCode = 1; } else console.log(`✓ ${id}: all deliverables present and valid`);
}

function finalise(id, opt) {
  need(id);
  if (!opt || !optionsOf(id).includes(opt)) die(`unknown option "${opt}"`);
  if (!flags.approved) die("finalising needs Kalyan's approval: re-run with --approved once he has chosen");
  const dest = P(id, "exports", "FINAL.png");
  const s = loadState(id);
  if (existsSync(dest) && s.approved && !flags.force) die(`option ${s.approved} is already approved; pass --force to replace it (only with his say-so)`);
  copyFileSync(P(id, "exports", `${opt}.png`), dest);
  updateState(id, (st) => { st.approved = opt; st.stage = "approved"; }, `approved option ${opt}`);
  console.log(`✓ ${id}: option ${opt} → exports/FINAL.png`);
}

switch (cmd) {
  case "doctor": process.exitCode = (await doctor()) ? 0 : 1; break;
  case "parse": console.log(JSON.stringify(parseInstruction(pos.join(" ")))); break;
  case "new": newProject(pos.join(" ")); break;
  case "status": status(pos[0]); break;
  case "frames": {
    const [id, video] = pos; need(id);
    const times = String(flags.at ?? "").split(",").filter(Boolean);
    if (!video || !times.length) die("usage: studio frames VIDEO-001 <video> --at 1.5,20,42");
    mkdirSync(P(id, "assets", "frames"), { recursive: true });
    for (const t of times) { const out = P(id, "assets", "frames", `f${String(t).replace(".", "_")}.png`); execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t, "-i", video, "-frames:v", "1", out]); console.log(out); }
    break;
  }
  case "cutout": {
    const [id, img, name] = pos; need(id);
    if (!img || !name) die("usage: studio cutout VIDEO-001 <image> <name>");
    mkdirSync(P(id, "assets", "cutouts"), { recursive: true });
    const out = P(id, "assets", "cutouts", `${name}.png`);
    const erase = rest.flatMap((x, i) => (x === "--erase" ? ["--erase", rest[i + 1]] : []));
    const r = spawnSync("python3", [join(STUDIO, "scripts/cutout.py"), img, out, "--model", join(STUDIO, "models/selfie_multiclass.tflite"), ...erase], { encoding: "utf-8" });
    // MediaPipe prints a harmless traceback on interpreter shutdown; report the real error line
    if (r.status !== 0) die(r.stderr.split("Exception ignored")[0].split("\n").filter((l) => !/^[WI]0000|^\s*$|^(WARNING|INFO):/.test(l)).slice(-3).join("\n"));
    const meta = JSON.parse(r.stdout.trim().split("\n").pop());
    writeJson(P(id, "assets", "cutouts", `${name}.json`), { source: basename(img), ...meta, out: `assets/cutouts/${name}.png` });
    console.log(JSON.stringify(meta));
    break;
  }
  case "render": await render(pos[0], pos.slice(1)); break;
  case "review": review(pos[0]); break;
  case "sheet": await sheet(pos[0]); break;
  case "research-report": researchReport(pos[0]); break;
  case "canva-plan": { const [id, o] = pos; need(id); const b = await launch(); try { console.log(JSON.stringify(await buildCanvaPlan(id, readJson(P(id, "concepts", `${o}.json`)), { browser: b }), null, 1)); } finally { await b.close(); } break; }
  case "strategy": strategy(pos[0]); break;
  case "deliver": deliver(pos[0]); break;
  case "validate": await validateCmd(pos[0]); break;
  case "finalise": case "finalize": finalise(pos[0], pos[1]); break;
  default: console.log(readFileSync(new URL(import.meta.url), "utf-8").split("\n").slice(1, 18).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
}
