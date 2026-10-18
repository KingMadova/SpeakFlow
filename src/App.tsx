import React, { useState, useEffect } from 'react';
import { OnboardingView } from './components/OnboardingView.tsx';
import { LibraryView } from './components/LibraryView.tsx';
import { ShadowingView } from './components/ShadowingView.tsx';
import { VoiceRecordingModal } from './components/VoiceRecordingModal.tsx';
import { ProgressView } from './components/ProgressView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PWAInstallModal } from './components/PWAInstallModal.tsx';
import { OfflineModal } from './components/OfflineModal.tsx';
import { BottomNavBar, type NavTab } from './components/BottomNavBar.tsx';
import { DEMO_SCENES } from './data/demoScenes.ts';
import {
  loadSettings,
  saveSettings,
  loadProgress,
  saveProgress,
  hasSeenOnboarding,
  setHasSeenOnboarding,
  clearAllLocalData,
  DEFAULT_SETTINGS,
  DEFAULT_PROGRESS,
} from './services/storageService.ts';
import { useOnlineStatus } from './hooks/useOnlineStatus.ts';
import type { Scene, SubtitleItem, UserSettings, UserProgress } from './types/index.ts';

export default function App() {
  const isOnline = useOnlineStatus();

  // Settings & Progress state
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Active scene
  const [scenes, setScenes] = useState<Scene[]>(DEMO_SCENES);
  const [selectedScene, setSelectedScene] = useState<Scene>(DEMO_SCENES[0]);
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | undefined>(undefined);

  // Navigation state
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(() => {
    // Check if ?autostart=1 is in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return true;
      }
    }
    return hasSeenOnboarding();
  });

  const [currentView, setCurrentView] = useState<'library' | 'shadowing' | 'progress' | 'settings'>('library');
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');

  // Modals state
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [activeSubtitleForRecording, setActiveSubtitleForRecording] = useState<SubtitleItem | null>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Sync settings changes to localStorage
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Sync progress changes
  const handleUpdateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const updated = updater(prev);
      saveProgress(updated);
      return updated;
    });
  };

  // Track phrase completion or practice in shadowing
  // Count a phrase only once when the user explicitly records practice,
  // not whenever playback crosses a subtitle or the user navigates.
  const handleRecordProgress = (_sceneId: string, phraseId: string) => {
    handleUpdateProgress((prev) => {
      const practiced = prev.favoritePhraseIds || [];
      // Keep practice tracking separate from favorites. The count is updated
      // only from the recording completion callback below.
      return prev;
    });
  };

  // Toggle favorite phrase
  const handleToggleFavorite = (phraseId: string) => {
    handleUpdateProgress((prev) => {
      const current = prev.favoritePhraseIds || [];
      const exists = current.includes(phraseId);
      const updated = exists
        ? current.filter((id) => id !== phraseId)
        : [...current, phraseId];
      return {
        ...prev,
        favoritePhraseIds: updated,
      };
    });
  };

  const handleFinishOnboarding = () => {
    setHasSeenOnboarding(true);
    setHasCompletedOnboardingState(true);
  };

  // Handle Bottom Nav selection
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'accueil') {
      setCurrentView('library');
    } else if (tab === 'explorer') {
      setCurrentView('library');
    } else if (tab === 'mes-mots') {
      setCurrentView('progress');
    } else if (tab === 'profil') {
      setCurrentView('settings');
    }
  };

  // When user selects a scene from library or progress view
  const handleSelectScene = (scene: Scene, phraseId?: string) => {
    setSelectedScene(scene);
    setSelectedPhraseId(phraseId);
    setCurrentView('shadowing');
  };

  // Open Voice Recording Modal
  const handleOpenRecording = (activeSubtitle: SubtitleItem | null) => {
    setActiveSubtitleForRecording(activeSubtitle);
    setIsRecordingModalOpen(true);
  };

  // Save progress after completing a recording
  const handleSaveRecordingProgress = () => {
    handleUpdateProgress((prev) => ({
      ...prev,
      workedPhrasesCount: prev.workedPhrasesCount + 1,
    }));
  };

  // Clear local data handler
  const handleClearData = () => {
    clearAllLocalData();
    setSettings(DEFAULT_SETTINGS);
    setProgress({ ...DEFAULT_PROGRESS });
    alert('Toutes les données locales ont été réinitialisées.');
  };

  // If user hasn't seen onboarding and no autostart parameter, show Screen 1
  if (!hasCompletedOnboarding) {
    return (
      <main className="w-full min-h-screen bg-[#101014] text-[#F5F5F7] font-sans">
        <OnboardingView
          onStart={handleFinishOnboarding}
          onLater={handleFinishOnboarding}
        />
      </main>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#101014] text-[#F5F5F7] font-sans antialiased overflow-x-hidden">
      {/* Offline banner notification if connection drops */}
      {!isOnline && (
        <div
          onClick={() => setIsOfflineModalOpen(true)}
          className="sticky top-0 z-40 bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 flex items-center justify-center gap-2 cursor-pointer shadow"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Mode hors ligne actif — Cliquez pour plus d&apos;informations</span>
        </div>
      )}

      {/* Main View Switcher */}
      {currentView === 'library' && (
        <LibraryView
          scenes={scenes}
          onSelectScene={handleSelectScene}
          onOpenPwaPrompt={() => setIsPwaModalOpen(true)}
          isOnline={isOnline}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
        />
      )}

      {currentView === 'shadowing' && selectedScene && (
        <ShadowingView
          scene={selectedScene}
          settings={settings}
          favoritePhraseIds={progress.favoritePhraseIds || []}
          initialSubtitleId={selectedPhraseId}
          onToggleFavorite={handleToggleFavorite}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => {
            setSelectedPhraseId(undefined);
            setCurrentView('library');
          }}
          onOpenRecording={handleOpenRecording}
          onRecordProgress={handleRecordProgress}
        />
      )}

      {currentView === 'progress' && (
        <ProgressView
          progress={progress}
          scenes={scenes}
          onBack={() => setCurrentView('library')}
          onSelectScene={handleSelectScene}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {currentView === 'settings' && (
        <SettingsView
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearData={handleClearData}
          onOpenPwaPrompt={() => setIsPwaModalOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          onBack={() => setCurrentView('library')}
        />
      )}

      {/* Persistent Bottom Nav (shown on main tabs when not in active shadowing screen) */}
      {currentView !== 'shadowing' && (
        <BottomNavBar activeTab={activeTab} onSelectTab={handleSelectTab} />
      )}

      {/* Modals */}
      {isRecordingModalOpen && (
        <VoiceRecordingModal
          activeSubtitle={activeSubtitleForRecording}
          onClose={() => setIsRecordingModalOpen(false)}
          onSaveProgress={handleSaveRecordingProgress}
        />
      )}

      <PWAInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      <OfflineModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onRetry={() => {
          if (navigator.onLine) {
            setIsOfflineModalOpen(false);
          } else {
            alert('Toujours hors ligne. Vérifiez votre connexion réseau.');
          }
        }}
      />
    </div>
  );
}
