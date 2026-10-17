// Transparent internal design rubric. Scores are a reviewer's 1–5 judgement per criterion,
// weighted to 0–100. They rank our own candidates against each other; they are NOT click-through
// rate predictions and must never be reported as such.
export const RUBRIC = [
  { key: "legibility", label: "Mobile legibility", weight: 20, ask: "Can the text and focal point be read at 320x180 in a feed?" },
  { key: "curiosity", label: "Curiosity & clarity", weight: 15, ask: "Is there a clear question or tension a viewer wants resolved, without confusion?" },
  { key: "hierarchy", label: "Focal hierarchy", weight: 15, ask: "Is there one immediately identifiable focal point, then text, then supporting detail?" },
  { key: "isolation", label: "Subject isolation", weight: 10, ask: "Does the subject separate cleanly from the background (edge, contrast, light)?" },
  { key: "uniqueness", label: "Visual uniqueness", weight: 10, ask: "Does it stand apart from the reference thumbnails instead of copying them?" },
  { key: "synergy", label: "Title/thumbnail synergy", weight: 10, ask: "Does the image add information the title does not repeat?" },
  { key: "authenticity", label: "Authenticity & accuracy", weight: 15, ask: "Is every claim, result and graphic true to the video? Real face, real evidence?" },
  { key: "brand", label: "Brand consistency", weight: 5, ask: "Does it feel like AI with Kalyan (coral accent, dark tech, clean type) without being a clone of the others?" },
];
export const DISCLAIMER = "Internal design rubric (1–5 per criterion, weighted to 100). Not a CTR prediction.";

export function scoreReview(review) {
  const missing = RUBRIC.filter((c) => typeof review?.scores?.[c.key] !== "number");
  if (missing.length) throw new Error(`review missing scores: ${missing.map((m) => m.key).join(", ")}`);
  for (const c of RUBRIC) { const v = review.scores[c.key]; if (v < 1 || v > 5) throw new Error(`score ${c.key}=${v} outside 1–5`); }
  const total = RUBRIC.reduce((s, c) => s + (review.scores[c.key] / 5) * c.weight, 0);
  return Math.round(total * 10) / 10;
}

/** Automated QA failures cap scores so a broken render cannot rank first. */
export function applyQaCaps(review, qa) {
  const r = structuredClone(review);
  const fail = (re, sev) => qa.checks.some((c) => !c.pass && re.test(c.name) && (!sev || c.severity === sev));
  if (fail(/^text size/, "error")) r.scores.legibility = Math.min(r.scores.legibility, 2); // headline too small
  else if (fail(/^text size/, "warn")) r.scores.legibility = Math.min(r.scores.legibility, 4); // secondary text small
  if (fail(/^contrast/)) r.scores.legibility = Math.min(r.scores.legibility, 3);
  if (fail(/^text off face/)) r.scores.hierarchy = Math.min(r.scores.hierarchy, 2);
  if (fail(/^not blank|^dimensions|^export exists/)) for (const c of RUBRIC) r.scores[c.key] = 1;
  return r;
}

export const NEEDS_REVISION_BELOW = 70;
export const MAX_REVISIONS = 2;
