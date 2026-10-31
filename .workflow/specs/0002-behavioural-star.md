# Spec 0002: Behavioural + STAR questions and CV/project deep-dives (gap 6)

Status: spec approved by builder, content built to it. Judge review and
Pilot still owed. No commits, no pushes.

## Problem

The platform has zero behavioural content. Phase 0 audit: zero hits for
STAR, behavioural, or behavioral across `src/` and `content/`. No
track, no topic, no prompt template exists. Behavioural rounds decide
junior offers, hit career switchers hardest, and punish generic answers
in senior rounds, so this is the non-coding round the platform omits
entirely.

## Scope

MDX content only, plus track registration files (track.json and
category.json). No TypeScript, no component, no UI change. No company
tags, no frequency fields: gap 4's field names are not frozen yet, so
this slice invents none. No playground tab: behavioural topics have no
code to run.

## Track structure

New track, registered by content files only (the sidebar lists tracks
from velite data; a track with published topics appears automatically):

- `content/tracks/behavioural/track.json`: title "Behavioural
  Interviews", slug `behavioural`, order 11 (orders 1-10 are taken),
  icon `MessagesSquare`. Note: the sidebar icon map does not contain
  `MessagesSquare`, so it falls back to `BookOpen` by design
  (`main-sidebar.tsx` line 102). Adding the icon to the map is a
  one-line UI change for a later UI batch, not this slice.
- Six categories, each with a `category.json` (title, slug, order):
  foundations (1), teamwork (2), ownership (3), growth (4), leadership
  (5), cv-projects (6).

## Question list (fixed, 15 questions + 2 templates = 17 topics)

One topic per question. Each topic carries exactly one interview
question in frontmatter, so mastery and progress stay per question.

Foundations:

1. `tell-me-about-yourself` — "Tell me about yourself" (easy, 12 min)
2. `why-this-role` — "Why do you want this role?" (easy, 12 min)
3. `greatest-weakness` — "What is your greatest weakness?" (medium,
   12 min)

Teamwork:

4. `team-project` — "Tell me about a time you worked effectively as
   part of a team" (easy, 12 min)
5. `helped-teammate` — "Tell me about a time you helped a teammate
   who was struggling" (medium, 12 min)
6. `disagreement` — "Tell me about a time you disagreed with a
   colleague" (medium, 15 min)

Ownership:

7. `took-ownership` — "Tell me about a time you took ownership of a
   problem nobody asked you to fix" (medium, 12 min)
8. `tight-deadline` — "Tell me about a time you delivered under a
   tight deadline" (medium, 12 min)
9. `production-mistake` — "Tell me about a time something you shipped
   went wrong" (hard, 15 min)

Growth:

10. `difficult-feedback` — "Tell me about a time you received
    difficult feedback" (medium, 12 min)
11. `failure` — "Tell me about a time you failed" (hard, 15 min)
12. `learned-quickly` — "Tell me about a time you had to learn
    something quickly" (easy, 12 min)

Leadership:

13. `influence-without-authority` — "Tell me about a time you
    influenced a decision without having authority" (hard, 15 min)
14. `mentored-someone` — "Tell me about a time you mentored or
    coached someone" (medium, 12 min)
15. `improved-process` — "Tell me about a time you improved a process
    or codebase for your team" (medium, 12 min)

CV and project prompt templates:

16. `walk-through-cv` — "Walk me through your CV" (medium, 15 min).
    Template: one story per role, transitions explained, gaps owned,
    and the drill-down questions interviewers ask about each line.
17. `proud-project` — "Tell me about a project you are proud of"
    (medium, 15 min). Template: problem, constraints, decisions,
    trade-offs, what you would change, plus drill-down questions
    (why this tech, what broke, how you measured it).

## Per-question template (every topic follows it exactly)

Frontmatter (velite `Topic` schema, all required fields present):

- title, slug, track `behavioural`, subCategory, order within the
  category (1, 2, 3), estimatedMinutes, difficulty.
- keyTakeaways: 3 to 4 bullets, each one claim a learner could repeat
  in an interview.
- masteryCriteria: minQuestionsCorrect 1, requireChallenge false.
- No prerequisites (the field is optional; dangling references are
  worse than none).
- No status field (default is published, matching existing topics).
- interviewQuestions: exactly one entry. id `beh-<slug>-1`. question:
  the exact question text above. answer: the strong spoken answer in
  first person, 3 to 5 sentences, interview voice per the
  interview-definition-writing skill (direct answer first, concrete
  before abstract, one idea per sentence). difficulty: matches the
  topic difficulty. followUps: 2 to 3 likely follow-up questions.

Body tabs (no playground tab):

- overview: `TopicDefinition` (2 to 4 short paragraphs: what the
  question really tests, why interviewers ask it, the trap), then
  `TopicQuickStats`, then `KeyTakeaways`.
- examples: one full worked STAR answer, told as a story with S, T, A,
  R labelled, concrete numbers and a frontend-flavoured scenario.
  Every example opens by stating it is illustrative: the learner swaps
  in their own facts using the skeleton. No example claims to be the
  learner's own story.
- indepth: the STAR skeleton (fill-in prompts for each letter, tuned
  to this question), a strong vs weak contrast (a weak answer snippet
  with why it fails, a strong answer snippet with why it works), the
  traps for this question, and one-line prep notes for each follow-up.
- questions: `FlashcardDeck` with the single id, then
  `InterviewQuestionBlock` for the same id.

## Writing rules (acceptance bar)

- Every question has a STAR skeleton and a strong/weak contrast. A
  topic missing either fails review.
- No generic advice without a concrete example. "Be specific" alone
  is not content; show the specific version.
- Spoken interview voice throughout (interview-definition-writing
  skill). No dictionary openings, no passive stacks, no walls of bold
  terms.
- Public-copy rule: no em dashes, no en dashes, no AI slop phrasing.
  Plain concrete sentences only.
- Worked examples are illustrative scenarios, clearly labelled as
  such. They never present invented facts as the learner's history.

## Client checks (from the plan)

- Junior developer job-seeking (leads): behavioural rounds decide
  junior offers, so every topic states what interviewers score, not
  just what to say.
- Career switcher (replaces bootcamp student): switchers need a story
  bank, not syntax drills, so the skeleton is reusable across
  questions and the two template topics teach story selection.
- Senior developer prepping: seniors punish generic answers, so the
  strong/weak contrast and traps exist to kill vagueness, blame, and
  result-free stories.

## Gates and Pilot

- Gates, in repo build order: velite clean, tsc --noEmit exit 0, full
  vitest suite green. Content-only change, so no new tests are
  expected; the suite must stay green.
- Reviewer pass per file: every STAR skeleton, every strong/weak
  contrast, every follow-up checked for substance.
- Pilot (Manager): a full behavioural topic page on the live surface
  (all four tabs render, Q&A block shows the answer and follow-ups,
  Got it marking works signed in). Signed-out rendering is covered by
  the same page.
- Merge order: standalone. No dependency on gap 4 (no invented tag
  fields), no schema change, no shared files with other gap branches.
  The spec filename 0002 collides in number only with gap 5's
  0002-readiness-analytics.md in its own branch; filenames differ, so
  no file conflict at merge.
