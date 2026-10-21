/** Minimal topic fixtures for mastery unit tests. */
export const topics = [
  {
    title: 'Hoisting',
    slug: 'hoisting',
    track: 'javascript',
    subCategory: 'foundation',
    order: 1,
    estimatedMinutes: 25,
    status: 'published' as const,
    prerequisites: [],
    keyTakeaways: ['var hoists'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: false },
    difficulty: 'medium' as const,
    interviewQuestions: [
      { id: 'hoisting-1', question: 'What is hoisting?', answer: 'Declarations move up.', difficulty: 'easy' as const },
      { id: 'hoisting-2', question: 'var vs let?', answer: 'TDZ.', difficulty: 'medium' as const },
    ],
    content: '<p>compiled mdx for hoisting</p>',
    path: 'javascript/foundation/hoisting',
    permalink: '/learn/javascript/foundation/hoisting',
  },
  {
    title: 'Closures',
    slug: 'closures',
    track: 'javascript',
    subCategory: 'foundation',
    order: 2,
    estimatedMinutes: 35,
    status: 'published' as const,
    prerequisites: ['hoisting'],
    keyTakeaways: ['closure retains scope'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: true },
    difficulty: 'hard' as const,
    interviewQuestions: [
      { id: 'closures-1', question: 'What is a closure?', answer: 'Function plus scope.', difficulty: 'easy' as const },
    ],
    content: '<p>compiled mdx for closures</p>',
    path: 'javascript/foundation/closures',
    permalink: '/learn/javascript/foundation/closures',
  },
  {
    title: 'Components & JSX',
    slug: 'components-and-jsx',
    track: 'react',
    subCategory: 'core',
    order: 1,
    estimatedMinutes: 40,
    status: 'published' as const,
    prerequisites: ['closures'],
    keyTakeaways: ['JSX compiles to createElement'],
    masteryCriteria: { minQuestionsCorrect: 2, requireChallenge: false },
    difficulty: 'medium' as const,
    interviewQuestions: [
      { id: 'components-1', question: 'What is JSX?', answer: 'Syntax sugar.', difficulty: 'easy' as const },
    ],
    content: '<p>compiled mdx for components</p>',
    path: 'react/core/components-and-jsx',
    permalink: '/learn/react/core/components-and-jsx',
  },
];

export const tracks = [];
export const categories = [];
