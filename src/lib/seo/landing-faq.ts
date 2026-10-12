export interface LandingFaqItem {
  question: string;
  answer: string;
}

/** Question-shaped headings for SEO / AEO (Answer Engine Optimization). */
export const LANDING_FAQ: LandingFaqItem[] = [
  {
    question: 'What makes Elite Interview Prep different from LeetCode?',
    answer:
      'LeetCode focuses on algorithm puzzles. We focus on concept mastery — closures, the event loop, React hooks, and the follow-up questions senior interviewers ask. Each topic includes definitions, runnable examples, deep dives, and Q&A with mastery gates.',
  },
  {
    question: 'How does topic mastery work?',
    answer:
      'Every topic has interview Q&A. Mark answers as "Got it" until you hit the mastery threshold. Some topics add coding challenges. Progress rings and optional hard locks encourage finishing one topic before rushing to the next.',
  },
  {
    question: 'Is the content free to read without an account?',
    answer:
      'Yes. All topic pages are public — read definitions, examples, and interview questions without signing in. Create a free account to sync progress, earn points, and keep streaks across devices.',
  },
  {
    question: 'Which interview prep tracks are available today?',
    answer:
      'JavaScript (40 topics) and React (17 topics) are fully published. Additional tracks — Next.js, Node.js, Express, Hono, NestJS, and more — are on the roadmap with the same structure.',
  },
  {
    question: 'How should I prepare for JavaScript interview questions?',
    answer:
      'Start with foundation topics (hoisting, closures, this, prototypes), then execution (event loop, promises, async/await), then patterns and browser APIs. Use the playground to run code and the Q&A tab to self-test before moving on.',
  },
  {
    question: 'Does this platform include React hooks interview questions?',
    answer:
      'Yes. The React track covers components, JSX, hooks (useState, useEffect, useContext, useReducer, custom hooks), patterns, and performance topics — each with flashcards, structured Q&A, and JSX Sandpack playgrounds.',
  },
];
