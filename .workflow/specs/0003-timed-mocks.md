# 0003 — Timed mock interviews with feedback (gap 1, Wave 2)

## What this is

Solo Q and A does not reproduce time pressure, follow-up probing, or
talking while coding. This slice adds a timed mock mode: the learner
starts a mock from a question pack, answers coding tasks and spoken
interview questions against a countdown, self-scores each answer on a
five-dimension rubric, and reviews a saved session history. Spoken
answers can be recorded (consent-gated) and played back during review.

This is practice, not a proctored exam. Scores are self-assessment.
Nothing here certifies ability to anyone else.

## Scope discipline

- NO peer matching. Solo mocks only. No scheduling, no other humans,
  no live interviewer.
- NO server-side re-execution of code. Coding tasks run in the
  learner's browser (Sandpack). The server stores the learner's
  reported test results; it never re-runs code. A future slice could
  add a runner service; this one does not pretend to have it.
- "Hidden tests" means hidden from the editor UI, not hidden from the
  browser. The test file is not shown in the editor (Sandpack
  `visibleFiles`), but a learner opening devtools could find it. The
  spec does not claim proctoring, and the UI never claims it either.
- Audio is session-local in this slice. Recording uses the browser
  MediaRecorder; playback works during the session and its review.
  No audio bytes are uploaded to the server and no audio storage or
  retention policy is introduced. The session stores only recording
  metadata (duration, timestamps, consent time). Server-side audio
  storage is a follow-up with its own privacy decision.
- Business logic lives in `src/lib/mocks/mock-session.ts` (pure
  functions) and `src/lib/mocks/mock-service.ts` (thin DB wrapper).
  Routes are thin wrappers. Components are presentational or
  browser-interaction shells; they never compute scores.
- Every query is scoped to the session user's id (AGENTS.md rule 6).
  A session id from another user resolves to 404, never to data.
- Question packs are small typed modules, not MDX. MDX challenges
  render their tests visibly in the editor, so they cannot supply
  hidden tests; and pack questions are session config, not learning
  content. Packs are original tasks, not copies of topic exercises.
- One new table only: `mock_sessions`. No changes to existing
  tables. Schema applies at merge via `drizzle-kit push` (the
  project's mechanism) or the idempotent SQL in
  `src/db/migrations/mock-sessions.sql`, which mirrors the drizzle
  table exactly. Until the table exists, mock routes fail; the UI
  must not be reached before the merge-time step.

## Session model

A session belongs to one user and one pack.

- Fields: id, userId, packId, durationMinutes (15, 30, or 45),
  status, startedAt, deadlineAt, submittedAt (null until finished),
  answers (one entry per question id).
- Status: `in_progress`, `submitted`, `timed_out`. Terminal states
  never reopen.
- Timing: deadlineAt = startedAt + durationMinutes. The client shows
  a countdown from deadlineAt and auto-submits at zero. The server
  is authoritative: any answer save or submit arriving after
  deadlineAt marks the session `timed_out` and rejects the write.
  Client clocks are never trusted for the outcome.
- Resume: an `in_progress` session reloads with its saved answers.
  The countdown continues from the server deadline, not from a
  restarted timer. Reloading never extends the deadline.
- Timeout mid-answer: an answer being typed when time expires is
  lost unless it was saved first. The UI saves per question on
  demand ("Save answer") and warns that unsaved work is lost on
  timeout. Auto-save on every keystroke is out of scope.
- Answers: per question id, at most one entry:
  - coding: `code` (the learner's solution file text).
  - spoken: `text` (typed answer) and/or `recording` metadata.
  - either: `rubric` (per-dimension 0, 1, or 2) and an optional
    `note`.
  - coding results: `tests` (per-test pass/fail as reported by the
    runner) and `testsRunAt`.
- A question with no saved answer is unanswered, not zero-scored.
  Unanswered questions appear as "not answered" in review.

## Question model

Two kinds, both with follow-ups. Follow-ups are probes the
interviewer would ask next; the learner addresses them inside the
same answer. Follow-ups are not separately scored.

- Coding task: title, prompt, starter code, hidden tests, follow-ups.
  Starter code is module-style: it must `export` the functions the
  tests import (for example `export function flattenWithDepth...`).
  The prompt states this. Hidden tests import from `./solution.js`
  and log one line per test in the shared format:
  `✓ Test N: label` on pass, `✗ Test N: label — message` on fail.
  The runner file is never the visible editor file.
- Spoken question: question, follow-ups, rubric guidance (what a
  strong answer covers). The learner answers by typing, by
  recording, or both.

Packs in this slice (2):

- `javascript-foundations`: coding "flatten with depth", coding
  "memoize with TTL", spoken "closures and a bug they caused",
  spoken "debugging a slow page".
- `react-essentials`: coding "tiny store with subscribe", coding
  "event emitter with once", spoken "how React decides what to
  re-render", spoken "controlled vs uncontrolled components".

Pack integrity rules (pinned by tests): every pack has a unique id
and title; every coding task has a non-empty prompt, starter, at
least one hidden test, and at least one follow-up; every hidden
test's code references `solution.`; every spoken question has at
least one follow-up; question ids are unique within a pack.

## Rubric

Five dimensions, each scored 0 (miss), 1 (partial), or 2 (strong)
by the learner after answering:

- correctness: the answer works / is factually right.
- completeness: edge cases and the whole question are covered.
- depth: mechanism and reasoning, not just the surface answer.
- trade-offs: alternatives and their costs are named.
- communication: structured, clear, easy to follow.

Scoring (pure function over saved answers):

- Per-dimension total: sum of that dimension's scores over
  rubric-scored questions. Questions without rubric scores do not
  count toward that dimension's maximum.
- Overall: total scored points over total possible points across
  scored questions only. Unanswered and unscored questions lower
  nothing; they are listed, not punished.
- Band from the average per scored dimension: below 0.8
  "Needs work", 0.8 to below 1.5 "Solid", 1.5 and above "Strong".
  No rubric scores at all: "Not scored".
- Honesty rule: every score display is labeled self-assessment.
  The UI never calls a mock result a grade, a pass, or a hiring
  signal.

Worked example: a 4-question mock where 3 questions carry full
rubric scores of (2,2,1,1,2), (1,1,1,0,1), (2,2,2,2,2). Totals:
correctness 5/6, completeness 5/6, depth 4/6, trade-offs 3/6,
communication 5/6. Overall 22/30, average 1.47 per dimension,
band "Solid". The fourth question, unanswered, appears as
"not answered" and changes no number.

## Exam-mode UX

Calm under pressure, no clutter (DESIGN-ETHICS.md). The session
page shows: the countdown (prominent, turns warning-colored under
5 minutes), question navigation (answered / current / unanswered),
one question at a time, Save answer per question, Submit mock,
and a timeout path that submits whatever is saved and marks the
session timed out. Results view: per-question answers, reported
test results, rubric scores, totals, band, and a link back to
history. The history page lists past sessions (pack, date, status,
band) and links each to its review.

Timer work: remaining = deadlineAt − now, floored at 0; expired
means remaining is 0. Countdown text is MM:SS, zero-padded.

## Spoken-recording consent and storage rules

- Nothing records without explicit consent. The recorder shows a
  consent checkbox; the record button stays disabled until it is
  checked. Consent is per recording, not a blanket grant.
- The UI shows a visible recording indicator while recording, and
  Stop ends it. Playback is offered immediately with duration.
- Attaching is explicit: the learner reviews the clip and attaches
  it to the answer. Discarding removes the blob.
- Stored per answer: durationSeconds, recordedAt, consentAt. The
  audio blob itself lives only in the browser session (object URL).
  Refreshing the page loses the clip but keeps the metadata and
  any typed text. This limitation is stated in the UI, not hidden.
- Microphone denial is a normal error state ("Microphone
  unavailable"), never a crash, and typing remains available.

## API surface (all require a session; all scoped to that user)

- POST /api/mocks { packId, durationMinutes } → 201 session.
- GET /api/mocks → session history, newest first, 20 max.
- GET /api/mocks/[id] → one session or 404.
- POST /api/mocks/[id]/answer { questionId, answer } → saved
  answer, or 409 when the session is finished or timed out. After
  the deadline the session flips to `timed_out` and the write is
  rejected.
- POST /api/mocks/[id]/submit { answers? } → `submitted`, or
  `timed_out` when past the deadline. Returns the session plus
  the computed rubric summary.

## What the Pilot must prove (not covered by unit tests)

A real timed mock on the live surface, signed in: start a mock,
countdown runs, coding task runs hidden tests without showing
them in the editor, spoken recording works with consent and plays
back, timeout auto-submits and the server marks it timed out,
resume reloads saved answers with the original deadline, history
lists the session, and review shows rubric totals and band.
