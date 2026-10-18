import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, Download, WifiOff } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';
import type { Scene } from '../types/index.ts';

interface LibraryViewProps {
  scenes: Scene[];
  onSelectScene: (scene: Scene) => void;
  onOpenNotifications?: () => void;
  onOpenPwaPrompt?: () => void;
  isOnline: boolean;
  onOpenOfflineModal?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  scenes,
  onSelectScene,
  onOpenNotifications,
  onOpenPwaPrompt,
  isOnline,
  onOpenOfflineModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Tous' | 'Débutant' | 'Intermédiaire' | 'Avancé'>('Tous');

  const filteredScenes = useMemo(() => {
    return scenes.filter((scene) => {
      const matchesFilter =
        selectedFilter === 'Tous' || scene.level === selectedFilter;
      const matchesQuery =
        scene.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scene.subtitleFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scene.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [scenes, selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#101014] text-[#F5F5F7] pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-4">
        <BrandLogo size="md" />

        <div className="flex items-center gap-2">
          {!isOnline && (
            <button
              onClick={onOpenOfflineModal}
              className="p-2 rounded-full bg-[#1F1F24] text-amber-500 hover:bg-[#2A2A32] transition-colors"
              title="Mode hors ligne actif"
              aria-label="Mode hors ligne"
            >
              <WifiOff className="w-4 h-4" />
            </button>
          )}

          {onOpenPwaPrompt && (
            <button
              onClick={onOpenPwaPrompt}
              className="p-2 rounded-full bg-[#1F1F24] text-[#A4A4AD] hover:text-[#FF7A18] hover:bg-[#2A2A32] transition-colors"
              title="Installer l'application"
              aria-label="Installer l'application"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#1F1F24] text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors"
            aria-label="Notifications"
          >
            <MessageSquare className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7A18] border-2 border-[#101014]" />
          </button>
        </div>
      </header>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E98]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une scène..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1B1B20] border border-[#2B2B33] text-sm text-[#F5F5F7] placeholder-[#8E8E98] focus:outline-none focus:border-[#FF7A18] transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {(['Tous', 'Débutant', 'Intermédiaire', 'Avancé'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#FF7A18] text-white shadow-sm'
                  : 'bg-[#1B1B20] text-[#A4A4AD] hover:bg-[#25252C] hover:text-[#F5F5F7]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Recommended Scenes Section */}
      <section>
        <h2 className="text-sm font-semibold text-[#8E8E98] uppercase tracking-wider mb-3">
          Scènes recommandées
        </h2>

        {filteredScenes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#18181D] border border-[#2B2B33]">
            <p className="text-[#A4A4AD] text-sm">Aucune scène trouvée pour cette recherche.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('Tous');
              }}
              className="mt-3 text-xs text-[#FF7A18] font-semibold hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScenes.map((scene) => (
              <div
                key={scene.id}
                onClick={() => onSelectScene(scene)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectScene(scene);
                  }
                }}
                className="w-full text-left bg-[#1B1B20] hover:bg-[#22222A] active:scale-[0.99] border border-[#282830] rounded-2xl p-3 flex gap-3.5 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-[#25252D]">
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-medium text-white">
                    {scene.durationMinutes} min
                  </span>
                </div>

                {/* Content info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F7] truncate group-hover:text-[#FF7A18] transition-colors">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-[#A4A4AD] truncate mt-0.5">
                      {scene.subtitleFr}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#8E8E98] mb-1.5 truncate">
                      {scene.level} • {scene.durationMinutes} min • {scene.category}
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#2A2A33] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF7A18] rounded-full transition-all duration-500"
                          style={{ width: `${scene.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[#8E8E98] shrink-0">
                        {scene.progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
