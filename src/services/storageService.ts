import type { UserProgress, UserSettings } from '../types/index.ts';

const SETTINGS_KEY = 'speakflow_settings_v1';
const PROGRESS_KEY = 'speakflow_progress_v2';
const LEGACY_PROGRESS_KEY = 'speakflow_progress_v1';
const ONBOARDING_KEY = 'speakflow_has_seen_onboarding_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  interfaceLanguage: 'Français',
  theme: 'Sombre',
  playbackSpeed: 1,
  autoScroll: true,
  showEnglishSubtitles: true,
  showFrenchTranslation: true,
  wordByWordHighlight: true,
  defaultVolume: 70,
};

export const DEFAULT_PROGRESS: UserProgress = {
  // Start with honest, empty progress. Never present sample activity as user data.
  completedScenesCount: 0,
  practiceTimeMinutes: 0,
  workedPhrasesCount: 0,
  difficultPhraseIds: [],
  favoritePhraseIds: [],
  recentSessions: [],
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      favoritePhraseIds: Array.isArray(parsed.favoritePhraseIds)
        ? parsed.favoritePhraseIds
        : [],
      difficultPhraseIds: Array.isArray(parsed.difficultPhraseIds)
        ? parsed.difficultPhraseIds
        : [],
      recentSessions: Array.isArray(parsed.recentSessions)
        ? parsed.recentSessions
        : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress to localStorage', e);
  }
}

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHasSeenOnboarding(val: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, val ? 'true' : 'false');
  } catch {}
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {}
}
