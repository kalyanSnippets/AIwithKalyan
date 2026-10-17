// Studio paths and per-video project layout. Every video lives in its own projects/<ID>/ folder so
// projects never share state.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const STUDIO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const PROJECTS = process.env.THUMBNAIL_STUDIO_PROJECTS ? resolve(process.env.THUMBNAIL_STUDIO_PROJECTS) : join(STUDIO, "projects");
export const SUBDIRS = ["brief", "research", "concepts", "assets", "canva", "exports", "reviews"];
export const OPTION_IDS = ["A", "B", "C", "D", "E"];

export const projectDir = (id) => join(PROJECTS, id);
export const isProjectId = (s) => /^VIDEO-\d{3,}$/.test(s ?? "");

export function listProjects() {
  if (!existsSync(PROJECTS)) return [];
  return readdirSync(PROJECTS).filter(isProjectId).sort();
}

export function nextProjectId() {
  const n = listProjects().map((p) => Number(p.split("-")[1])).reduce((a, b) => Math.max(a, b), 0) + 1;
  return `VIDEO-${String(n).padStart(3, "0")}`;
}

export function ensureProject(id) {
  if (!isProjectId(id)) throw new Error(`invalid project id "${id}" (expected VIDEO-001 style)`);
  for (const d of SUBDIRS) mkdirSync(join(projectDir(id), d), { recursive: true });
  return projectDir(id);
}

export const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf-8")) : fallback);
export const writeJson = (p, data) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, JSON.stringify(data, null, 2) + "\n"); };

/** Resolve an asset path in a layer: absolute, studio-relative ("@studio/…") or project-relative. */
export function resolveAsset(projectId, src) {
  if (/^(https?:|data:)/.test(src)) return src;
  if (src.startsWith("/")) return src;
  if (src.startsWith("@studio/")) return join(STUDIO, src.slice(8));
  return join(projectDir(projectId), src);
}
