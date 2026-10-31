# Spec 0003: Frontend system design track (gap 3)

## Status

P1 spec. Question list fixed below. No company or frequency tags anywhere
in this content: gap 4's field names are not frozen yet, so this track
is written forward-compatible with no tag fields at all.

## Track registration (backend, light)

- Track slug: `system-design`. Title: "Frontend System Design".
  Description: "Design feeds, search, realtime apps, and the components
  they are built from, the way senior frontend rounds actually ask it."
  Order: 11. Icon: `Braces` (free in the sidebar icon map).
- Files only: `content/tracks/system-design/track.json` plus one
  `category.json` per category below. No code changes: the learn shell
  already lists any track with at least one published topic.
- Navigation check: a track appears only with a published topic, so all
  10 topics ship with `status: published`.

## Categories and the fixed 10 questions

Learning order is the `order` field (1-10). Sidebar groups by category;
Previous/Next follows the track order.

| Order | Slug | Category | Title | Difficulty | Minutes |
| --- | --- | --- | --- | --- | --- |
| 1 | news-feed | feeds | Design a social news feed | medium | 40 |
| 2 | autocomplete | search | Design typeahead autocomplete | medium | 40 |
| 3 | search-experience | search | Design a search results experience | medium | 45 |
| 4 | component-library | surfaces | Design a component library | hard | 45 |
| 5 | chat | realtime | Design a real-time chat app | hard | 45 |
| 6 | collaborative-editor | realtime | Design a collaborative document editor | hard | 50 |
| 7 | notifications | feeds | Design a notification center | medium | 40 |
| 8 | dashboard | surfaces | Design a real-time analytics dashboard | medium | 45 |
| 9 | media-gallery | surfaces | Design a photo gallery with upload | medium | 40 |
| 10 | checkout | surfaces | Design a checkout flow | hard | 45 |

The four plan-required questions (news feed, autocomplete, component
library, search) are orders 1-4 in the learning path. The other six were
selected because they are the senior frontend rounds that recur across
public interview guides and each tests a different frontend muscle:
realtime delivery (chat), shared mutable state (collaborative editor),
delivery and read-state (notifications), streaming data and charts
(dashboard), media and uploads (gallery), and stateful multi-step
flows with money on the line (checkout).

## Prerequisites (same-track only, genuine dependencies only)

The platform resolves prerequisites inside the same track, and the
content test requires every prerequisite to resolve to a real topic.
Only real dependencies are listed; most design questions stand alone.

- search-experience: [autocomplete]
- collaborative-editor: [chat]
- notifications: [news-feed]
- media-gallery: [news-feed]
- All others: no prerequisites.

## Per-question template (every file follows it, no exceptions)

Frontmatter: title, slug, track `system-design`, subCategory, order,
estimatedMinutes, prerequisites (when listed above), keyTakeaways
(4-6, one repeatable claim each), masteryCriteria
`{ minQuestionsCorrect: 4, requireChallenge: false }`, difficulty,
status `published`, and exactly 5 interviewQuestions (id, question,
answer, difficulty, followUps). Question ids use a per-topic prefix
(`nf-`, `ac-`, `se-`, `cl-`, `ch-`, `ce-`, `nt-`, `db-`, `mg-`, `co-`)
so ids are unique within and across topics.

Tabs (derived from MDX children, in this order):

1. **Overview**: `TopicDefinition` in spoken-interview voice (10-second
   answer, why interviewers care, one senior nuance), `TopicQuickStats`,
   `KeyTakeaways`.
2. **Examples**: one worked walkthrough of how a strong candidate
   opens the question, plus a `MermaidDiagram` architecture sketch and
   a small plain-JavaScript `CodeExample` where code clarifies a
   mechanism (debounce, windowing, optimistic update, chunked upload).
   No JSX in examples: every snippet must pass `node --check`.
3. **In-Depth**: the fixed sections, in order: Requirements
   (functional, then non-functional, with every scale number stated
   explicitly as an interview assumption, never as a fact about a real
   product); API surface (the endpoints and shapes the frontend
   consumes, not a backend design); Component tree; Data flow (with a
   second `MermaidDiagram` where a sequence clarifies it); Trade-offs
   (each row: decision, option A, option B, when to pick each, and the
   pick this track recommends with its reason); Failure and edge
   cases; "If they push deeper" (one paragraph naming the next level
   without pretending to cover it).
4. **Interview Q&A**: `FlashcardDeck` with the topic's 5 ids, then one
   `InterviewQuestionBlock` per id, plus a `Callout type="interview"`
   trap note naming the trap interviewers actually use for this
   question.
5. **Playground**: bare `TopicPlayground` (placeholder). Design
   exercises are a later gap's work; the placeholder is honest, and it
   matches the 22 existing JS placeholder tabs.

## Difficulty bar (the client check)

"Would this pass a senior round" is the bar, not "learnable from
zero". Every question must have: (a) scale assumptions stated up
front; (b) at least one genuinely contested trade-off with a
justified pick, not a both-sides shrug; (c) failure and edge handling
(offline, slow network, races, duplicates); (d) a diagram whose boxes
and arrows match the text exactly; (e) a trap note. A question missing
any of these fails review. Difficulty in frontmatter is within-track:
medium means a strong mid-level candidate can follow it with the
prerequisites stated; hard means it assumes the earlier track topics
and senior-level trade-off reasoning.

## Honesty rules

- No company names, no "asked at X", no frequency claims: gap 4 owns
  that, and its fields are not frozen.
- No real-product facts (no "X has Y users", no "X uses Z"): every
  number is framed as "for this interview, assume...".
- No unverified API claims: endpoint shapes are illustrative frontend
  contracts, labeled as such in the text.
- Spoken voice per the interview-definition-writing skill: direct
  answer first, one idea per sentence, concrete before abstract.
- No em dashes in any copy, per the standing public-copy rule.

## Diagram rules (mermaid renders client-side; no jsdom on this VM)

Mermaid syntax cannot be parse-checked in Node here (jsdom is not
installed and installs are out of bounds), so diagrams follow a strict
shape a linter can check: `flowchart TD` or `flowchart LR` only, every
label double-quoted, only `-->` edges (edge labels only as `-->|text|`
with plain text), alphanumeric node ids, no subgraphs, no HTML, no
`<`, `>`, `&`, or `;` inside labels. The Pilot must render every
diagram in a real browser; a diagram that fails to render there is a
build defect, not a Pilot nit.

## Acceptance

- Spec approved, question list fixed (this document).
- 10 MDX files, every one following the template, every diagram
  lint-clean, every code snippet `node --check` clean, no tag fields.
- Gates in repo order: velite clean, `tsc --noEmit` exit 0, full
  vitest suite green (content test included: prerequisites resolve,
  question ids unique, paths unique).
- Reviewer pass per file: every example read, every trade-off claim
  checked, every diagram shape-checked.
- Judge APPROVE, then Pilot on the live surface: a full system-design
  topic page signed out and signed in, every diagram rendering.
