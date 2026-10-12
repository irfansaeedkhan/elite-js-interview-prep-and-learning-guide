import {
  LOCAL_PROGRESS_STORAGE_KEY,
  PROGRESS_CHANGE_EVENT,
  type TopicProgressEntry,
  type TopicProgressMap,
} from '@/lib/progress/types';

export function readLocalProgress(): TopicProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TopicProgressMap) : {};
  } catch {
    return {};
  }
}

export function clearLocalProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_PROGRESS_STORAGE_KEY);
  window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
}

export function hasLocalProgress(): boolean {
  return Object.keys(readLocalProgress()).length > 0;
}

export type { TopicProgressEntry, TopicProgressMap };
