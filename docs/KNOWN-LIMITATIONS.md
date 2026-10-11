# Known Limitations

This file documents intentional tradeoffs and known functional limits.

## Subtopic cap tradeoff & Multi-Level Taxonomy Resolution (BUG-007 & DEC-162)

### Legacy Behavior (BUG-007 Mitigation)

- `QuestionService.MAX_SUBTOPICS_PER_QUESTION = 1`
- Only the first matched canonical subtopic is retained per uncurated question row.
- **Why this exists**: GateOverflow scrape data can include section-level tag pollution where many subtopic tags are attached indiscriminately. Keeping only the first matched subtopic prevents cross-topic contamination in legacy filters.

### Curated Multi-Taxonomy Resolution (DEC-162 / FEAT-035)

- Genuine cross-disciplinary questions (e.g. `go:333214`, GATE CSE 2020 Q17 bridging *Engineering Mathematics / Probability* and *Discrete Mathematics / Relations*) are now explicitly curated in `data/taxonomy/curated-question-taxonomy-v1.json`.
- Supports one canonical `primary` path and one or more curated `secondary` learning paths with versioned exam syllabus citations.
- The 1-subtopic cap is scoped *per taxonomy path*, permitting multiple genuine subtopics across approved paths while strictly defending against raw tag contamination.
- The runtime discovery engine enforces the **same-path rule**: simultaneous subject and subtopic selections must be satisfied within the same path on the question.
- Primary `subjectSlug` remains canonical for Preparation Tracker metrics, mock scoring, and Custom Builder uniform sampling.

## Generated precompute dependency

- `QuestionService` imports `src/generated/subtopicLookup.json`.
- File is generated and ignored in git.
- Fresh environments must run `npm run precompute` (or `npm start` / `npm run build`) before relying on this artifact.
