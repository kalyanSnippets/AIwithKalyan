// Word-span EDL → source time ranges (shared by scripts/edl.mjs and composition builds).
// Inside a span, gaps longer than rules.maxGap are tightened to rules.tightGap unless listed in
// `preserve` ({wordIndex: pauseSeconds}). `hold` keeps real footage after the span, `tailPause`
// sets the pause before the next span, `startAt` overrides the cut-in time.
const r3 = (n) => Math.round(n * 1000) / 1000;

export function computeRanges(edl, words) {
  const { maxGap, tightGap, lead, tail } = edl.rules;
  const ranges = [];
  edl.spans.forEach((span, si) => {
    const [a, b] = span.words;
    const prevWordEnd = a > 0 ? words[a - 1].end : 0;
    const nextWordStart = b + 1 < words.length ? words[b + 1].start : Infinity;
    const preserve = span.preserve ?? {};
    let start = span.startAt ?? Math.max(words[a].start - lead, prevWordEnd + 0.02, 0);
    for (let i = a; i < b; i++) {
      const gap = words[i + 1].start - words[i].end;
      const keep = preserve[i] ?? tightGap;
      if (gap > Math.max(maxGap, keep)) {
        const before = Math.min(tail, keep / 2 + 0.03);
        ranges.push({ start, end: words[i].end + before, span: si });
        start = words[i + 1].start - (keep - before);
      }
    }
    const tailLen = span.hold ?? (span.tailPause ? span.tailPause - lead : tail);
    ranges.push({ start, end: Math.min(words[b].end + tailLen, nextWordStart - 0.02), span: si });
  });
  return ranges.map((r) => ({ ...r, start: r3(r.start), end: r3(r.end) }));
}
