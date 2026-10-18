export interface WordTiming {
  text: string;
  startTime: number;
  endTime: number;
}

export interface SubtitleItem {
  id: string;
  startTime: number;
  endTime: number;
  englishText: string;
  frenchText: string;
  speaker?: string;
  words?: WordTiming[];
  isDifficult?: boolean;
}

export interface Scene {
  id: string;
  title: string;
  subtitleFr: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  durationMinutes: number;
  category: string;
  progressPercent: number;
  thumbnailUrl: string;
  videoUrl: string;
  subtitles: SubtitleItem[];
  description: string;
}

export interface UserProgress {
  completedScenesCount: number;
  practiceTimeMinutes: number;
  workedPhrasesCount: number;
  difficultPhraseIds: string[];
  favoritePhraseIds: string[];
  recentSessions: {
    sceneId: string;
    sceneTitle: string;
    dateLabel: string;
    durationLabel: string;
    progressPercent: number;
    thumbnailUrl: string;
  }[];
}

export interface UserSettings {
  interfaceLanguage: string;
  theme: 'Sombre' | 'Clair';
  playbackSpeed: number;
  autoScroll: boolean;
  showEnglishSubtitles: boolean;
  showFrenchTranslation: boolean;
  wordByWordHighlight: boolean;
  defaultVolume: number;
}

export interface AudioRecordingState {
  isRecording: boolean;
  recordingTimeSeconds: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}
