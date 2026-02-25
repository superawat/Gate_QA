# Known Limitations

This file documents intentional tradeoffs and known functional limits.

## Subtopic cap tradeoff (BUG-007 mitigation)

### Current behavior

- `QuestionService.MAX_SUBTOPICS_PER_QUESTION = 1`
- only the first matched canonical subtopic is retained per question

### Why this exists

GateOverflow scrape data can include section-level tag pollution where many subtopic tags are attached to every question in a section. Keeping only the first matched subtopic prevents cross-topic contamination in filters.

### User-visible impact

- Genuine multi-subtopic questions may appear under only one subtopic.
- Filtering by a second genuine subtopic can miss such questions (false negatives).

### Scope of impact

- subtopic-level filtering only
- subject-level and year/type/progress filters remain unaffected

### Related safeguards

- Filter engine uses a scoped subtopic predicate by parent subject (`subtopicToSubjectSlug`).
- Subject deselection removes orphan subtopics to avoid impossible filter states.

## Generated precompute dependency

- `QuestionService` imports `src/generated/subtopicLookup.json`.
- File is generated and ignored in git.
- Fresh environments must run `npm run precompute` (or `npm start` / `npm run build`) before relying on this artifact.

## Analytics hook not wired

- `useGoatCounterSPA` utility exists but is not mounted in `App.jsx`.
- It depends on React Router location context, which the current SPA does not use.
