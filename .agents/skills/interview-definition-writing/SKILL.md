---
name: interview-definition-writing
description: Write topic definitions and interview answers in plain spoken English — how you would answer an interviewer, not textbook prose. Use when authoring or editing MDX curriculum, TopicDefinition blocks, InterviewQuestion answers, or key takeaways for the interview prep platform.
---

# Interview definition writing

Write like a strong candidate **in the room**, not like a documentation page.

## Voice

- **First person optional** — "I'd explain it as…" or direct statement ("A string is how JavaScript stores text.")
- **One idea per sentence** — short beats clever.
- **Concrete before abstract** — example or analogy before jargon.
- **Interview-shaped** — answer the question they actually ask, then one line of depth if it matters.

## Avoid

- Dictionary openings: "X is defined as…", "In computer science…"
- Passive voice stacks: "It can be observed that…"
- Unmotivated jargon without a plain-English line first
- Walls of bold terms with no connective tissue

## TopicDefinition template (MDX)

Structure every overview definition in **2–4 short paragraphs**:

1. **The 10-second answer** — what it is in one breath.
2. **Why interviewers care** — the hook or trap (immutability, coercion, single thread, etc.).
3. **Optional depth** — one senior-level nuance only if it prevents a common mistake.

### Example — Strings (good)

> If someone asks what a string is in JavaScript, I'd say it's how the language stores text — names, messages, URLs, anything readable. You write them with quotes or backticks.
>
> What usually comes next in an interview is **immutability**: you don't edit a string in place. When you call `trim()` or `replace()`, you get a **new** string back. That's why `s[0] = 'H'` doesn't work.
>
> Senior rounds sometimes mention **UTF-16** — JavaScript counts some emoji as two code units, so `"👋".length` can surprise people. Worth knowing, not worth leading with.

### Example — Strings (bad)

> A string is a primitive data type representing an immutable sequence of UTF-16 code units used to encode textual data in the JavaScript programming language.

## Interview Q&A answers

Same rules, tighter:

- Lead with the direct answer in the first sentence.
- Use "Sync first, then microtasks, then macrotasks" not "The event loop prioritizes…"
- For output-order questions, state the order, then one line of why.

## Key takeaways

- Bullet = one claim someone could repeat in an interview.
- Start with a verb or noun phrase, not "It is important to note…"

## When editing existing topics

1. Read the definition aloud — if it sounds like a blog post, rewrite.
2. Keep technical terms that interviewers expect (`microtask`, `closure`, `prototype chain`).
3. Do not remove accuracy for casual tone — simplify **wording**, not **facts**.

## Related marketplace skills (optional)

For general marketing copy tone (landing pages, not curriculum):

- `coreyhaines31/marketingskills@copywriting` — 140K+ installs; use for Phase 6 landing, not topic definitions.

For long-form technical articles:

- `mindrally/skills@technical-writing` — documentation style; too formal for spoken interview answers unless adapted with this skill's voice rules.

**Default:** follow this skill for all `content/tracks/**/*.mdx` body copy.
