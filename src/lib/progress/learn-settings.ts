export const LEARN_SETTINGS_KEY = 'elite-learn-settings';

export interface LearnSettings {
  hardLock: boolean;
}

export function getLearnSettings(): LearnSettings {
  if (typeof window === 'undefined') return { hardLock: false };
  try {
    const raw = localStorage.getItem(LEARN_SETTINGS_KEY);
    return raw ? ({ hardLock: false, ...JSON.parse(raw) } as LearnSettings) : { hardLock: false };
  } catch {
    return { hardLock: false };
  }
}

export function setLearnSettings(settings: Partial<LearnSettings>) {
  const next = { ...getLearnSettings(), ...settings };
  localStorage.setItem(LEARN_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('elite-learn-settings-change'));
}
