export type Difficulty = 'easy' | 'medium' | 'hard';

export type DiagramSize = 'inline' | 'section' | 'full';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  followUps?: string[];
  tags?: string[];
}

export interface TopicMeta {
  title: string;
  slug: string;
  track: string;
  subCategory: string;
  order: number;
  estimatedMinutes: number;
  prerequisites?: string[];
  keyTakeaways: string[];
  masteryCriteria: {
    minQuestionsCorrect: number;
    requireChallenge?: boolean;
  };
  difficulty: Difficulty;
  interviewQuestions: InterviewQuestion[];
  status?: 'published' | 'preview';
}
