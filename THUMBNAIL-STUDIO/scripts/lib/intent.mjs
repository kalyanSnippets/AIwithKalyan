// Turns a short /thumbnail instruction into an action. Pure function — unit tested.
//
//   "Claude Code edits my videos"   → { action: "new", topic }
//   "VIDEO-001"                      → { action: "resume", project }
//   "make 5 more options"            → { action: "more", count: 5 }
//   "revise option 3" / "revise C"   → { action: "revise", option: "C" }
//   "finalise option 2"              → { action: "finalise", option: "B" }
//   "status"                         → { action: "status" }
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const optionLetter = (tok) => {
  if (!tok) return null;
  const t = String(tok).trim().toUpperCase();
  if (/^[A-Z]$/.test(t)) return t;
  if (/^\d+$/.test(t) && +t >= 1 && +t <= 26) return LETTERS[+t - 1];
  return null;
};

export function parseInstruction(raw = "") {
  const s = raw.trim();
  const project = s.match(/\bVIDEO-\d{3,}\b/i)?.[0]?.toUpperCase() ?? null;
  const lower = s.toLowerCase();
  const opt = lower.match(/\b(?:option|opt|concept|candidate|#)\s*([a-z]|\d{1,2})\b/)?.[1] ?? lower.match(/\b(?:revise|finali[sz]e|approve|pick|select)\s+([a-e]|\d)\b/)?.[1];
  if (!s) return { action: "status", project };
  if (/^status\b/.test(lower)) return { action: "status", project };
  if (/\b(finali[sz]e|approve|pick|select)\b/.test(lower)) return { action: "finalise", project, option: optionLetter(opt) };
  if (/\b(revise|redo|fix|improve|change)\b/.test(lower) && opt) return { action: "revise", project, option: optionLetter(opt), note: s };
  const more = lower.match(/\b(?:make|create|generate|give me)?\s*(\d+|five|three|two|four|ten)\s+more\b/);
  if (more) {
    const words = { two: 2, three: 3, four: 4, five: 5, ten: 10 };
    return { action: "more", project, count: words[more[1]] ?? Number(more[1]) };
  }
  if (project && s.replace(/\bVIDEO-\d{3,}\b/i, "").trim() === "") return { action: "resume", project };
  const count = Number(lower.match(/\b(\d+)\s+thumbnails?\b/)?.[1] ?? 5);
  const topic = s.replace(/^(please\s+)?(create|make|generate|design)\s+(\d+\s+)?thumbnails?\s+(for\s+)?(my\s+)?/i, "").replace(/\bvideo\b\s*$/i, "").trim() || s;
  return { action: "new", project, topic, count };
}
