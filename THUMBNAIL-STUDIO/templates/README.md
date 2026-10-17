# Templates

- `concept.template.json`: the layered spec format. Layer types: `fill`, `image`, `shape`, `text`,
  `icon` (any lucide-static name), `html`. Useful keys:
  - `role` (`headline`, `face`, `focal`, `evidence`, …)
  - `faceBox` (for the face/text overlap check)
  - `canva` (`bake` | `separate`)
  - `highlight`, `stroke`, `shadow`, `bg` (pill), `filter`, `css`
- `review.template.json`: rubric scores 1–5 per criterion (see scripts/lib/rubric.mjs).
- Projects may keep a `concepts/make_concepts.py` (see VIDEO-001) that computes face placement
  from the cutout's face box. That's the easiest way to keep faces positioned exactly.
