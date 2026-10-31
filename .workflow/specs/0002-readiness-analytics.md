# 0002 — Readiness analytics (gap 5, Wave 1)

## What this is

Weak-area and readiness analytics on top of the existing progress
tracking. The platform already tracks progress (visits, Q&A know/review
marks, challenge passes, mastery). This slice turns that data into
advice: which topics are weakest, how ready the learner's coverage
looks, and what to study next. It is not a new tracking system.

## Scope discipline

- READ-ONLY over existing mastery data. No new write paths to progress
  tables. No schema change: everything here computes from the existing
  `topic_progress` rows (via the existing snapshot) plus the published
  topic index.
- The analytics, not the tracking. Mastery primitives (`isTopicMastered`,
  `getTopicProgressPercent`, `getTrackMasteryPercent`, `canAccessTopic`)
  are reused, never reimplemented.
- Business logic lives in `src/lib/progress/readiness.ts` (pure
  functions over index + progress map, same pattern as
  `mastery-rules.ts`). The API route is a thin wrapper. The component
  is presentational and computes from the snapshot it already has.

## Model

Inputs: published topic index entries (`TopicIndexEntry[]`, status
`published` only) and a `TopicProgressMap`. Topics in the progress map
that are not in the index are ignored (stale paths).

Per-topic row: path, permalink, slug, track, title, order, percent,
mastered (existing `isTopicMastered`), attempted (a progress entry
exists), knowCount, reviewCount (counts from `qaResults`), canAccess
(existing `canAccessTopic`). Percent is the existing
`getTopicProgressPercent` when attempted, else 0: the shared primitive
scores an untouched no-challenge topic at 50% (the challenge half is
free), and the analytics surface must not credit work never done. The
shared primitive itself is untouched; the gate lives in this module
only.

### Weakest 3

Candidates: published AND attempted AND NOT mastered AND canAccess.
Sort: percent ascending, reviewCount descending, order ascending, path
ascending (deterministic tiebreak). Take at most 3. Never pad with
unvisited topics: 0% unvisited means "not started", not "weak". An
empty list is a valid result (nothing attempted yet, or everything
mastered).

### Readiness (estimate, never a guarantee)

- Per-track readiness: rounded mean of topic percents over published
  topics in the track; 0 when the track has no published topics.
- Overall readiness: rounded mean of topic percents over ALL published
  topics across tracks.
- Band: below 40 "Early coverage", 40-69 "Growing coverage", 70-89
  "Strong coverage", 90-100 "Near-complete coverage".
- Honesty rule: the UI labels the number an estimate and states it is
  based on topic progress, not a guarantee of interview performance.
  Bands describe coverage, not predicted outcomes.

### Study next (the gap 9 contract)

Candidates: published AND NOT mastered AND canAccess.
Rank: attempted group first (percent ascending, reviewCount
descending, order ascending, path ascending), then unvisited group
(track ascending, order ascending, path ascending).
`studyNext` is the first candidate, or null when every published topic
is mastered or locked.
Reason strings (factual, no promises):
- Attempted: "Lowest mastery at {percent}%", plus
  " · {reviewCount} marked for review" when reviewCount > 0.
- Unvisited: "Not started yet — prerequisites met".
Study-next changes when data changes: improving a topic's percent,
marking answers, or mastering a topic re-ranks or removes it.

## Worked example

Topics: A (order 1, no prerequisites), B (order 2, prerequisite A),
C (order 3, prerequisite B). A requires 2 correct answers, no
challenge. B requires 2 correct answers plus a challenge pass.
Progress: A has 2 know marks; B has 1 know and 1 review mark and no
challenge pass; C is unvisited.

- Percents: A 100 (mastered), B 25 (qa ratio 0.5, challenge ratio 0),
  C 0 (locked: B not mastered).
- Weakest: [B] only. A is mastered, C is unvisited and locked.
- Readiness: mean(100, 25, 0) = 42 → "Growing coverage".
- Study next: B — "Lowest mastery at 25% · 1 marked for review".
- After B is mastered: weakest [], readiness mean(100, 100, 0) = 67,
  study next C — "Not started yet — prerequisites met".

## Surfaces

- `GET /api/progress/readiness`: session-required, read-only. Returns
  `{ readiness, readinessBand, perTrack, weakest, studyNext }` where
  perTrack rows are `{ track, readiness, mastered, total }`. This is
  the stable shape gap 9 (study plans) consumes.
- `ReadinessDashboard` sidebar section in the learn shell, below track
  progress: readiness percent + band + estimate caption, per-track
  rows, weakest 3 links, one study-next card. Null when progress is
  disabled (signed out) and in rail mode. One glance, one next action.

## Gates

velite + tsc + vitest green. Every new test gets a break-it check: a
deliberately wrong implementation (flipped sort, unvisited in weakest,
locked topics included, padded weakest list) must fail. Live-browser
verification is the Manager's Pilot gate, not this slice's.
