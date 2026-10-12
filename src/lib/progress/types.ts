export interface TopicProgressEntry {
  visitedAt: string;
  qaResults?: Record<string, 'know' | 'review'>;
  challengePassed?: boolean;
  masteredAt?: string;
  timeSpentSeconds?: number;
}

export type TopicProgressMap = Record<string, TopicProgressEntry>;

export const LOCAL_PROGRESS_STORAGE_KEY = 'elite-learn-progress';

export const PROGRESS_CHANGE_EVENT = 'elite-learn-progress-change';
