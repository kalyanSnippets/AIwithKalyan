// Project state: what stage each video is at, which options exist and what was approved.
// The state file is the resume point after an interruption.
import { join } from "node:path";
import { ensureProject, projectDir, readJson, writeJson } from "./paths.mjs";

const file = (id) => join(projectDir(id), "state.json");

export function loadState(id) {
  return readJson(file(id), null);
}

export function initState(id, { topic, title, notes = "" }) {
  ensureProject(id);
  const existing = loadState(id);
  if (existing) return existing;
  const s = { id, topic, workingTitle: title ?? topic, notes, createdAt: new Date().toISOString(), stage: "brief", options: {}, approved: null, history: [] };
  writeJson(file(id), s);
  return s;
}

export function updateState(id, fn, event) {
  const s = loadState(id);
  if (!s) throw new Error(`no state for ${id}; run "studio new" first`);
  fn(s);
  if (event) s.history.push({ at: new Date().toISOString(), event });
  writeJson(file(id), s);
  return s;
}

export const STAGES = ["brief", "research", "strategy", "draft", "review", "revision", "delivered", "approved"];
