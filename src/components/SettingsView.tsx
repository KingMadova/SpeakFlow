import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Moon,
  Gauge,
  Sliders,
  Volume2,
  Trash2,
  Download,
  Info,
  Check,
} from 'lucide-react';
import type { UserSettings } from '../types/index.ts';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearData: () => void;
  onOpenPwaPrompt: () => void;
  onOpenOfflineModal?: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearData,
  onOpenPwaPrompt,
  onOpenOfflineModal,
  onBack,
}) => {
  const [speedModalOpen, setSpeedModalOpen] = useState(false);
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#101014] text-[#F5F5F7] pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#F5F5F7]">Paramètres</h1>
        <div className="w-5" />
      </header>

      <div className="space-y-6">
        {/* Group 1: Apparence et langue */}
        <section>
          <h2 className="text-xs font-semibold text-[#8E8E98] uppercase tracking-wider mb-2.5">
            Apparence et langue
          </h2>
          <div className="bg-[#18181D] border border-[#272730] rounded-2xl divide-y divide-[#24242D] overflow-hidden">
            {/* Langue de l'interface */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#A4A4AD]" />
                <span className="text-xs font-medium text-[#F5F5F7]">
                  Langue de l&apos;interface
                </span>
              </div>
              <span className="text-xs text-[#8E8E98] font-medium flex items-center gap-1">
                Français
              </span>
            </div>

            {/* Thème */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-[#A4A4AD]" />
                <span className="text-xs font-medium text-[#F5F5F7]">Thème</span>
              </div>
              <span className="text-xs text-[#8E8E98] font-medium">Sombre</span>
            </div>

            {/* Vitesse de lecture */}
            <button
              onClick={() => setSpeedModalOpen(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#202028] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4 text-[#A4A4AD]" />
                <span className="text-xs font-medium text-[#F5F5F7]">
                  Vitesse de lecture
                </span>
              </div>
              <span className="text-xs text-[#FF7A18] font-semibold flex items-center gap-1">
                {settings.playbackSpeed}x &gt;
              </span>
            </button>
          </div>
        </section>

        {/* Group 2: Lecture et sous-titres */}
        <section>
          <h2 className="text-xs font-semibold text-[#8E8E98] uppercase tracking-wider mb-2.5">
            Lecture et sous-titres
          </h2>
          <div className="bg-[#18181D] border border-[#272730] rounded-2xl divide-y divide-[#24242D] overflow-hidden">
            {/* Défilement automatique */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#F5F5F7]">
                Défilement automatique
              </span>
              <button
                onClick={() => onUpdateSettings({ autoScroll: !settings.autoScroll })}
                role="switch"
                aria-checked={settings.autoScroll}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.autoScroll ? 'bg-[#FF7A18]' : 'bg-[#2E2E38]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.autoScroll ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sous-titres anglais */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#F5F5F7]">
                Sous-titres anglais
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({ showEnglishSubtitles: !settings.showEnglishSubtitles })
                }
                role="switch"
                aria-checked={settings.showEnglishSubtitles}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.showEnglishSubtitles ? 'bg-[#FF7A18]' : 'bg-[#2E2E38]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.showEnglishSubtitles ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Traduction française */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#F5F5F7]">
                Traduction française
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({
                    showFrenchTranslation: !settings.showFrenchTranslation,
                  })
                }
                role="switch"
                aria-checked={settings.showFrenchTranslation}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.showFrenchTranslation ? 'bg-[#FF7A18]' : 'bg-[#2E2E38]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.showFrenchTranslation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Affichage mot par mot */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#F5F5F7]">
                Affichage mot par mot
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({
                    wordByWordHighlight: !settings.wordByWordHighlight,
                  })
                }
                role="switch"
                aria-checked={settings.wordByWordHighlight}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.wordByWordHighlight ? 'bg-[#FF7A18]' : 'bg-[#2E2E38]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.wordByWordHighlight ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Group 3: Audio */}
        <section>
          <h2 className="text-xs font-semibold text-[#8E8E98] uppercase tracking-wider mb-2.5">
            Audio
          </h2>
          <div className="bg-[#18181D] border border-[#272730] rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[#A4A4AD]" />
                <span className="text-xs font-medium text-[#F5F5F7]">
                  Volume par défaut
                </span>
              </div>
              <span className="text-xs font-bold text-[#FF7A18]">
                {settings.defaultVolume}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={settings.defaultVolume}
              onChange={(e) =>
                onUpdateSettings({ defaultVolume: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-[#2A2A33] rounded-full appearance-none accent-[#FF7A18] cursor-pointer"
            />
          </div>
        </section>

        {/* Group 4: Application & Données */}
        <section className="space-y-2.5">
          <button
            onClick={onOpenPwaPrompt}
            className="w-full py-3 px-4 rounded-2xl bg-[#1B1B20] hover:bg-[#22222A] border border-[#282832] text-xs font-semibold text-[#F5F5F7] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#FF7A18]" />
            <span>Installer l&apos;application sur l&apos;écran d&apos;accueil</span>
          </button>

          {onOpenOfflineModal && (
            <button
              onClick={onOpenOfflineModal}
              className="w-full py-3 px-4 rounded-2xl bg-[#1B1B20] hover:bg-[#22222A] border border-[#282832] text-xs font-semibold text-[#F5F5F7] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#FF7A18]" />
              <span>Statut du mode hors ligne</span>
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser votre progression locale ?')) {
                onClearData();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#1B1B20] hover:bg-rose-950/20 border border-[#282832] text-xs font-semibold text-[#A4A4AD] hover:text-rose-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Effacer les données locales</span>
          </button>
        </section>
      </div>

      {/* Speed Modal */}
      {speedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C22] border border-[#2D2D36] rounded-2xl p-4 w-full max-w-xs space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F5F7]">Vitesse de lecture</h3>
            <div className="space-y-1">
              {[0.75, 1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    onUpdateSettings({ playbackSpeed: spd });
                    setSpeedModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    settings.playbackSpeed === spd
                      ? 'bg-[#FF7A18]/20 text-[#FF7A18]'
                      : 'text-[#A4A4AD] hover:bg-[#25252E]'
                  }`}
                >
                  <span>{spd}x</span>
                  {settings.playbackSpeed === spd && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSpeedModalOpen(false)}
              className="w-full py-2 rounded-xl bg-[#25252E] text-xs font-medium text-[#A4A4AD] hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
