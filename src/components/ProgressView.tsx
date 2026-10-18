import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Bookmark, Flame, Play, Heart } from 'lucide-react';
import type { UserProgress, Scene } from '../types/index.ts';

interface ProgressViewProps {
  progress: UserProgress;
  scenes: Scene[];
  onBack: () => void;
  onSelectScene: (scene: Scene, phraseId?: string) => void;
  onToggleFavorite?: (phraseId: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  scenes,
  onBack,
  onSelectScene,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'historique' | 'phrases' | 'stats'>('historique');
  const [phraseFilter, setPhraseFilter] = useState<'toutes' | 'favoris' | 'difficiles'>('favoris');

  // Find difficult phrases
  const difficultPhrases = scenes
    .flatMap((s) => s.subtitles.map((sub) => ({ ...sub, sceneTitle: s.title, sceneId: s.id })))
    .filter((sub) => (progress.difficultPhraseIds || []).includes(sub.id));

  // Find favorite phrases
  const favoritePhrases = scenes
    .flatMap((s) => s.subtitles.map((sub) => ({ ...sub, sceneTitle: s.title, sceneId: s.id })))
    .filter((sub) => (progress.favoritePhraseIds || []).includes(sub.id));

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
        <h1 className="text-base font-bold text-[#F5F5F7]">Mon progrès</h1>
        <div className="w-5" />
      </header>

      {/* Segmented Tabs: [Historique], [Phrases], [Statistiques] */}
      <div className="flex bg-[#1B1B20] p-1 rounded-xl mb-5 border border-[#272730]">
        {[
          { id: 'historique' as const, label: 'Historique' },
          { id: 'phrases' as const, label: 'Phrases' },
          { id: 'stats' as const, label: 'Statistiques' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF7A18] text-white shadow-sm'
                : 'text-[#A4A4AD] hover:text-[#F5F5F7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-[#18181D] border border-[#272730] rounded-2xl p-3 text-center">
          <p className="text-xl font-extrabold text-[#F5F5F7]">
            {progress.completedScenesCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-[#8E8E98] mt-1 leading-tight">
            Scènes terminées
          </p>
        </div>

        <div className="bg-[#18181D] border border-[#272730] rounded-2xl p-3 text-center">
          <p className="text-xl font-extrabold text-[#F5F5F7]">
            {progress.practiceTimeMinutes} <span className="text-xs font-medium">min</span>
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-[#8E8E98] mt-1 leading-tight">
            Temps de pratique
          </p>
        </div>

        <div className="bg-[#18181D] border border-[#272730] rounded-2xl p-3 text-center">
          <p className="text-xl font-extrabold text-[#F5F5F7]">
            {progress.workedPhrasesCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-[#8E8E98] mt-1 leading-tight">
            Phrases travaillées
          </p>
        </div>
      </div>

      {activeTab === 'historique' && (
        <div className="space-y-6">
          {/* Section: Dernières séances */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#8E8E98] uppercase tracking-wider">
                Dernières séances
              </h2>
              <button className="text-xs font-semibold text-[#FF7A18] hover:underline">
                Voir tout
              </button>
            </div>

            <div className="space-y-2.5">
              {progress.recentSessions.map((session, i) => {
                const targetScene = scenes.find((s) => s.id === session.sceneId);
                return (
                  <div
                    key={i}
                    onClick={() => targetScene && onSelectScene(targetScene)}
                    className="w-full bg-[#1B1B20] hover:bg-[#22222A] border border-[#272730] rounded-2xl p-3 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={session.thumbnailUrl}
                        alt={session.sceneTitle}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#F5F5F7] truncate">
                          {session.sceneTitle}
                        </h3>
                        <p className="text-[11px] text-[#8E8E98] mt-0.5">
                          {session.dateLabel} • {session.durationLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-12 h-1.5 bg-[#2A2A33] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF7A18] rounded-full"
                          style={{ width: `${session.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#8E8E98] w-8 text-right">
                        {session.progressPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Phrases favorites à réviser */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#8E8E98] uppercase tracking-wider">
                  Phrases favorites à réviser
                </h2>
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center justify-center">
                  {favoritePhrases.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('phrases');
                  setPhraseFilter('favoris');
                }}
                className="text-xs font-semibold text-[#FF7A18] hover:underline"
              >
                Voir tout
              </button>
            </div>

            {favoritePhrases.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#18181D] border border-[#272730] text-center text-xs text-[#8E8E98]">
                Aucune phrase favorite pour l&apos;instant. Cliquez sur le cœur lors de votre écoute pour en sauvegarder !
              </div>
            ) : (
              <div className="space-y-2.5">
                {favoritePhrases.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1B1B20] border border-[#272730] rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-medium text-[#F5F5F7] truncate">
                        {item.englishText}
                      </p>
                      <p className="text-[11px] text-[#8E8E98] truncate mt-0.5">
                        {item.frenchText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-400 transition-colors"
                          title="Retirer des favoris"
                        >
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const sc = scenes.find((s) => s.id === item.sceneId);
                          if (sc) onSelectScene(sc, item.id);
                        }}
                        className="p-2 rounded-full bg-[#24242C] text-[#FF7A18] hover:bg-[#FF7A18] hover:text-white transition-colors"
                        title="Pratiquer cette phrase"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Phrases difficiles */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#8E8E98] uppercase tracking-wider">
                  Phrases difficiles
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#FF7A18] text-white text-[10px] font-bold flex items-center justify-center">
                  {difficultPhrases.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('phrases');
                  setPhraseFilter('difficiles');
                }}
                className="text-xs font-semibold text-[#FF7A18] hover:underline"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-2.5">
              {difficultPhrases.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1B1B20] border border-[#272730] rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-medium text-[#F5F5F7] truncate">
                      {item.englishText}
                    </p>
                    <p className="text-[11px] text-[#8E8E98] truncate mt-0.5">
                      {item.frenchText}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const sc = scenes.find((s) => s.id === item.sceneId);
                      if (sc) onSelectScene(sc, item.id);
                    }}
                    className="p-2 rounded-full bg-[#24242C] text-[#FF7A18] hover:bg-[#FF7A18] hover:text-white transition-colors shrink-0"
                    title="Pratiquer cette phrase"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'phrases' && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-2">
            {[
              { id: 'favoris' as const, label: `Favoris (${favoritePhrases.length})` },
              { id: 'difficiles' as const, label: `Difficiles (${difficultPhrases.length})` },
              { id: 'toutes' as const, label: 'Toutes les phrases' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPhraseFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  phraseFilter === f.id
                    ? 'bg-[#FF7A18] text-white'
                    : 'bg-[#1C1C22] text-[#8E8E98] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtered phrase list */}
          {(() => {
            const list =
              phraseFilter === 'favoris'
                ? favoritePhrases
                : phraseFilter === 'difficiles'
                ? difficultPhrases
                : scenes.flatMap((s) =>
                    s.subtitles.map((sub) => ({ ...sub, sceneTitle: s.title, sceneId: s.id }))
                  );

            if (list.length === 0) {
              return (
                <div className="p-6 rounded-2xl bg-[#18181D] border border-[#272730] text-center text-xs text-[#8E8E98]">
                  Aucune phrase trouvée pour ce filtre.
                </div>
              );
            }

            return list.map((item) => {
              const isFav = (progress.favoritePhraseIds || []).includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-[#18181D] border border-[#26262F] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-[#F5F5F7] truncate">
                      {item.englishText}
                    </p>
                    <p className="text-[11px] text-[#8E8E98] truncate mt-0.5">
                      {item.frenchText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className="p-1 rounded-full text-[#8E8E98] hover:text-rose-500 transition-colors cursor-pointer"
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-[#6C6C76]'
                          }`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const sc = scenes.find((s) => s.id === item.sceneId);
                        if (sc) onSelectScene(sc, item.id);
                      }}
                      className="p-1.5 rounded-full bg-[#24242C] text-[#FF7A18] hover:bg-[#FF7A18] hover:text-white transition-colors cursor-pointer"
                      title="Pratiquer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-[#18181D] border border-[#26262F] rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-[#F5F5F7] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF7A18]" />
              Série de pratique : 5 jours consécutifs
            </h3>
            <p className="text-xs text-[#A4A4AD] leading-relaxed">
              La régularité est le secret du shadowing. Même 5 minutes par jour transforment votre accent et votre fluidité.
            </p>
          </div>

          <div className="bg-[#18181D] border border-[#26262F] rounded-2xl p-4">
            <h4 className="text-xs font-bold text-[#8E8E98] uppercase tracking-wider mb-3">
              Répartition par niveau
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#F5F5F7]">
                <span>Débutant</span>
                <span className="font-semibold text-[#FF7A18]">65%</span>
              </div>
              <div className="w-full h-1.5 bg-[#2A2A33] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF7A18] rounded-full" style={{ width: '65%' }} />
              </div>

              <div className="flex justify-between text-[#F5F5F7] pt-2">
                <span>Intermédiaire</span>
                <span className="font-semibold text-amber-400">35%</span>
              </div>
              <div className="w-full h-1.5 bg-[#2A2A33] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
