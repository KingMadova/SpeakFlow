import type { UserProgress, UserSettings } from '../types/index.ts';

const SETTINGS_KEY = 'speakflow_settings_v1';
const PROGRESS_KEY = 'speakflow_progress_v1';
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
  completedScenesCount: 12,
  practiceTimeMinutes: 48,
  workedPhrasesCount: 15,
  difficultPhraseIds: ['ec-1', 'ec-2', 'ec-5'],
  favoritePhraseIds: ['ec-3', 'ec-7'],
  recentSessions: [
    {
      sceneId: 'everyday-conversation',
      sceneTitle: 'Everyday Conversation',
      dateLabel: "Aujourd'hui",
      durationLabel: '12 min',
      progressPercent: 45,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      sceneId: 'at-the-cafe',
      sceneTitle: 'At the Café',
      dateLabel: 'Hier',
      durationLabel: '8 min',
      progressPercent: 20,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    },
    {
      sceneId: 'job-interview',
      sceneTitle: 'Job Interview',
      dateLabel: '12 avr. 2025',
      durationLabel: '10 min',
      progressPercent: 0,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
    },
  ],
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
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      favoritePhraseIds: Array.isArray(parsed.favoritePhraseIds)
        ? parsed.favoritePhraseIds
        : DEFAULT_PROGRESS.favoritePhraseIds,
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
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {}
}
