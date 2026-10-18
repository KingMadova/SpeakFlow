import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  List,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Mic,
  Gauge,
  Sliders,
  Check,
  Heart,
  X,
} from 'lucide-react';
import type { Scene, SubtitleItem, UserSettings } from '../types/index.ts';
import {
  formatTimestamp,
  findActiveSubtitleIndex,
  findActiveWord,
} from '../utils/subtitleSync.ts';

interface ShadowingViewProps {
  scene: Scene;
  settings: UserSettings;
  favoritePhraseIds: string[];
  initialSubtitleId?: string;
  onToggleFavorite: (phraseId: string) => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onBack: () => void;
  onOpenRecording: (activeSubtitle: SubtitleItem | null) => void;
  onRecordProgress: (sceneId: string, phraseId: string) => void;
}

export const ShadowingView: React.FC<ShadowingViewProps> = ({
  scene,
  settings,
  favoritePhraseIds = [],
  initialSubtitleId,
  onToggleFavorite,
  onUpdateSettings,
  onBack,
  onOpenRecording,
  onRecordProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const subtitleListRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const initialIdx = initialSubtitleId
    ? Math.max(0, scene.subtitles.findIndex((s) => s.id === initialSubtitleId))
    : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    if (initialSubtitleId) {
      const target = scene.subtitles.find((s) => s.id === initialSubtitleId);
      return target ? target.startTime : 0;
    }
    return 0;
  });
  // Fallback scene duration from subtitles
  const sceneMaxDuration = scene.subtitles[scene.subtitles.length - 1]?.endTime || 185;
  const [duration, setDuration] = useState(sceneMaxDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(initialIdx !== -1 ? initialIdx : 0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'phrase' | 'group'>('phrase');
  const [showFullList, setShowFullList] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const activeSubtitle = scene.subtitles[activeSubtitleIndex] || scene.subtitles[0] || null;
  const activeWord = findActiveWord(activeSubtitle, currentTime);

  // Synchronize playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  // Synchronize video volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = settings.defaultVolume / 100;
    }
  }, [settings.defaultVolume]);

  // Original scene audio is the only automatic playback source.
  // Pronunciation assistance can be added as an explicit, separately labeled action.

  // Jump to specific time
  const seekTo = useCallback(
    (time: number) => {
      const clamped = Math.max(0, Math.min(time, duration));
      setCurrentTime(clamped);
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = clamped;
        } catch {}
      }
    },
    [duration]
  );

  // Jump to a specific subtitle
  const jumpToSubtitle = useCallback(
    (index: number) => {
      const target = scene.subtitles[index];
      if (!target) return;
      setActiveSubtitleIndex(index);
      seekTo(target.startTime + 0.05);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    },
    [scene.subtitles, seekTo]
  );

  // Next / Previous phrase navigation
  const handleNextPhrase = useCallback(() => {
    if (activeSubtitleIndex < scene.subtitles.length - 1) {
      jumpToSubtitle(activeSubtitleIndex + 1);
    }
  }, [activeSubtitleIndex, scene.subtitles.length, jumpToSubtitle]);

  const handlePrevPhrase = useCallback(() => {
    if (activeSubtitleIndex > 0) {
      jumpToSubtitle(activeSubtitleIndex - 1);
    } else if (scene.subtitles[0]) {
      jumpToSubtitle(0);
    }
  }, [activeSubtitleIndex, scene.subtitles, jumpToSubtitle]);

  // Repeat current phrase
  const handleRepeatPhrase = useCallback(() => {
    if (activeSubtitle) {
      seekTo(activeSubtitle.startTime);
      setIsPlaying(true);
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [activeSubtitle, seekTo]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // If video cannot play, our fallback clock and speech engine runs seamlessly
        });
      }
    }
  }, [isPlaying, activeSubtitle]);

  // Clock loop when isPlaying is true (coordinates time, word highlighting, repeat & advance)
  // The media element is the single source of truth for playback time.
  // If the video cannot play, do not simulate progress with a fallback clock.
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!videoRef.current || videoError) {
      setIsPlaying(false);
      return;
    }

    let animationFrame = 0;
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) return;
      animationFrame = requestAnimationFrame(syncPlayback);
    };
    animationFrame = requestAnimationFrame(syncPlayback);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, videoError]);

  // Cycle playback speed
  const handleCycleSpeed = useCallback(() => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(settings.playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    onUpdateSettings({ playbackSpeed: nextSpeed });
  }, [settings.playbackSpeed, onUpdateSettings]);

  // Cycle repeat mode
  const handleToggleRepeatMode = useCallback(() => {
    const modes: ('off' | 'phrase' | 'group')[] = ['off', 'phrase', 'group'];
    const curIdx = modes.indexOf(repeatMode);
    setRepeatMode(modes[(curIdx + 1) % modes.length]);
  }, [repeatMode]);

  // Handle timeupdate from video element
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Check repeat mode at end of phrase
    if (repeatMode === 'phrase' && activeSubtitle) {
      if (time >= activeSubtitle.endTime) {
        videoRef.current.currentTime = activeSubtitle.startTime;
        return;
      }
    }

    // Determine current active subtitle
    const newIdx = findActiveSubtitleIndex(scene.subtitles, time);
    if (newIdx !== activeSubtitleIndex && newIdx >= 0) {
      setActiveSubtitleIndex(newIdx);
    }
  };

  // Auto-scroll active subtitle row into view
  useEffect(() => {
    if (settings.autoScroll && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSubtitleIndex, settings.autoScroll]);

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto flex flex-col justify-between overflow-hidden relative select-none bg-[#101014] text-[#F5F5F7]">
      {/* 1. Compact Top Bar */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#101014] border-b border-[#23232A] z-20">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full text-[#A4A4AD] hover:text-[#F5F5F7] hover:bg-[#1F1F24] transition-colors"
          aria-label="Retour à la bibliothèque"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-semibold text-[#F5F5F7] truncate max-w-[200px]">
          {scene.title}
        </h1>

        <div className="flex items-center gap-2">
          {/* Step indicator e.g. "3/12" */}
          <span className="text-xs font-semibold text-[#FF7A18] bg-[#FF7A18]/15 px-2 py-0.5 rounded-full border border-[#FF7A18]/30">
            {activeSubtitleIndex + 1}/{scene.subtitles.length}
          </span>

          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1.5 rounded-full text-[#A4A4AD] hover:text-[#F5F5F7] hover:bg-[#1F1F24] transition-colors"
            aria-label="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Options Dropdown Menu */}
      {showOptionsMenu && (
        <div className="absolute top-12 right-4 z-40 bg-[#1C1C22] border border-[#2F2F38] rounded-xl shadow-2xl p-2 w-48 text-xs space-y-1">
          <div className="px-2 py-1.5 font-bold text-[#8E8E98] uppercase tracking-wider text-[10px]">
            Mode de répétition
          </div>
          <button
            onClick={() => {
              setRepeatMode('phrase');
              setShowOptionsMenu(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
              repeatMode === 'phrase'
                ? 'bg-[#FF7A18]/20 text-[#FF7A18]'
                : 'text-[#A4A4AD] hover:bg-[#25252D]'
            }`}
          >
            <span>Répéter la phrase</span>
            {repeatMode === 'phrase' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              setRepeatMode('off');
              setShowOptionsMenu(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
              repeatMode === 'off'
                ? 'bg-[#FF7A18]/20 text-[#FF7A18]'
                : 'text-[#A4A4AD] hover:bg-[#25252D]'
            }`}
          >
            <span>Lecture normale</span>
            {repeatMode === 'off' && <Check className="w-3.5 h-3.5" />}
          </button>
          <div className="h-px bg-[#2F2F38] my-1" />
          <button
            onClick={() => {
              onUpdateSettings({ autoScroll: !settings.autoScroll });
              setShowOptionsMenu(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#A4A4AD] hover:bg-[#25252D]"
          >
            <span>Défilement auto</span>
            <span>{settings.autoScroll ? 'Oui' : 'Non'}</span>
          </button>
        </div>
      )}

      {/* 2. Video Player Section */}
      <section className="relative px-3 pt-2">
        <div
          id="video-container"
          className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-xl border border-[#25252D] group"
        >
          {/* HTML5 Video element */}
          <video
            ref={videoRef}
            src={scene.videoUrl}
            poster={scene.thumbnailUrl}
            playsInline
            preload="auto"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || 185);
              }
            }}
            onError={() => {
              console.warn('Video failed to load; playback is unavailable for this scene.');
              setVideoError(true);
              setIsPlaying(false);
            }}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Interactive animated fallback if video network is restricted */}
          {videoError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-gradient-to-tr from-[#141419] to-[#282030] flex flex-col items-center justify-center p-4 text-center cursor-pointer"
            >
              <img
                src={scene.thumbnailUrl}
                alt={scene.title}
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/10 max-w-xs">
                <p className="text-xs font-semibold text-[#FF7A18] mb-1">
                  Scène d&apos;écoute & shadowing
                </p>
                <p className="text-[11px] text-[#C5C5CE]">
                  Cliquez pour {isPlaying ? 'mettre en pause' : 'lancer la scène'}
                </p>
              </div>
            </div>
          )}

          {/* Play/Pause overlay icon when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
              aria-label="Lire la vidéo"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>
          )}

          {/* Bottom video overlay controls */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-6 pb-2 flex flex-col gap-1.5 transition-opacity">
            {/* Progress bar */}
            <div className="relative flex items-center w-full group/bar cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none accent-[#FF7A18] cursor-pointer"
                aria-label="Progression de la vidéo"
              />
            </div>

            {/* Bottom time & utility controls */}
            <div className="flex items-center justify-between text-[11px] text-[#A4A4AD] font-medium">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRepeatPhrase}
                  className="hover:text-white transition-colors"
                  title="Rejouer la phrase"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span>
                  {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition-colors"
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleToggleFullscreen}
                  className="hover:text-white transition-colors"
                  aria-label="Plein écran"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subtitles Area */}
      <section className="flex-1 flex flex-col justify-start px-3 py-2 space-y-2 overflow-hidden">
        {/* Prominent Active Subtitle Card */}
        {activeSubtitle && (
          <div className="bg-[#18181D] border border-[#2B2B33] rounded-2xl p-4 shadow-md text-center transition-all relative">
            {/* Quick Favorite Button on Active Card */}
            <button
              onClick={() => onToggleFavorite(activeSubtitle.id)}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-[#8E8E98] hover:text-rose-500 hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={
                favoritePhraseIds.includes(activeSubtitle.id)
                  ? 'Retirer des favoris'
                  : 'Ajouter aux favoris'
              }
              title={
                favoritePhraseIds.includes(activeSubtitle.id)
                  ? 'Retirer des favoris'
                  : 'Ajouter aux favoris'
              }
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 active:scale-125 ${
                  favoritePhraseIds.includes(activeSubtitle.id)
                    ? 'fill-rose-500 text-rose-500 scale-105'
                    : 'hover:scale-110'
                }`}
              />
            </button>

            {/* English phrase with word highlight and smooth CSS transition */}
            {settings.showEnglishSubtitles && (
              <p className="text-lg sm:text-xl font-medium tracking-tight text-[#F5F5F7] mb-1.5 leading-snug px-6">
                {activeSubtitle.words && settings.wordByWordHighlight ? (
                  activeSubtitle.words.map((w, idx) => {
                    const isWordActive =
                      activeWord === w ||
                      (activeWord?.startTime === w.startTime &&
                        activeWord?.endTime === w.endTime);
                    return (
                      <span
                        key={idx}
                        style={{
                          transition: 'color 0.2s, background-color 0.2s',
                        }}
                        className={`inline-block mr-1.5 px-1.5 py-0.5 rounded-md ${
                          isWordActive
                            ? 'text-[#FF7A18] bg-[#FF7A18]/20 font-bold scale-[1.03]'
                            : 'text-[#F5F5F7] bg-transparent'
                        }`}
                      >
                        {w.text}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ transition: 'color 0.2s, background-color 0.2s' }}>
                    {activeSubtitle.englishText}
                  </span>
                )}
              </p>
            )}

            {/* French translation */}
            {settings.showFrenchTranslation && (
              <p className="text-xs sm:text-sm font-normal text-[#A4A4AD] leading-relaxed">
                {activeSubtitle.frenchText}
              </p>
            )}
          </div>
        )}

        {/* Subtitle / Dialogue List below */}
        <div
          ref={subtitleListRef}
          className="flex-1 overflow-y-auto max-h-48 sm:max-h-56 space-y-2 pr-1 no-scrollbar rounded-xl"
        >
          {scene.subtitles.map((item, idx) => {
            const isActive = idx === activeSubtitleIndex;
            const isRowFavorite = favoritePhraseIds.includes(item.id);
            return (
              <div
                key={item.id}
                ref={isActive ? activeItemRef : null}
                onClick={() => jumpToSubtitle(idx)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                  isActive
                    ? 'bg-[#22222A] border-l-4 border-l-[#FF7A18] border-t-[#33333F] border-r-[#33333F] border-b-[#33333F]'
                    : 'bg-[#15151A] border-[#222228] opacity-75 hover:opacity-100 hover:bg-[#1B1B22]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p
                    style={{ transition: 'color 0.2s, background-color 0.2s' }}
                    className={`text-xs sm:text-sm font-medium truncate ${
                      isActive ? 'text-[#FF7A18] font-semibold' : 'text-[#DCDCE2]'
                    }`}
                  >
                    {item.englishText}
                  </p>
                  <p className="text-[11px] text-[#8E8E98] truncate mt-0.5">
                    {item.frenchText}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Favorite Heart Button on each subtitle row */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="p-1 rounded-full text-[#8E8E98] hover:text-rose-500 hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label={
                      isRowFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
                    }
                    title={
                      isRowFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
                    }
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
                        isRowFavorite
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-[#6C6C76] hover:text-rose-400'
                      }`}
                    />
                  </button>

                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? 'text-[#FF7A18]' : 'text-[#73737C]'
                    }`}
                  >
                    {formatTimestamp(item.startTime)}
                  </span>
                  {isActive && <Play className="w-3 h-3 fill-[#FF7A18] text-[#FF7A18]" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Controls Area */}
      <footer className="bg-[#18181D] border-t border-[#26262F] px-4 pt-3 pb-4 space-y-3 rounded-t-3xl shadow-2xl">
        {/* Main Controls Row: Liste | Previous | Play/Pause | Next | Répéter */}
        <div className="flex items-center justify-between px-2">
          {/* Liste Button */}
          <button
            onClick={() => setShowFullList(!showFullList)}
            className="flex flex-col items-center gap-1 text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors p-1"
            aria-label="Afficher la liste"
          >
            <List className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-medium">Liste</span>
          </button>

          {/* Center Playback Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Previous */}
            <button
              onClick={handlePrevPhrase}
              className="p-2.5 rounded-full text-[#F5F5F7] hover:bg-[#262630] active:scale-95 transition-all cursor-pointer"
              aria-label="Phrase précédente"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-13 h-13 rounded-full bg-white text-black hover:bg-[#F0F0F2] active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-white/10 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNextPhrase}
              className="p-2.5 rounded-full text-[#F5F5F7] hover:bg-[#262630] active:scale-95 transition-all cursor-pointer"
              aria-label="Phrase suivante"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Répéter Button */}
          <button
            onClick={handleToggleRepeatMode}
            className={`flex flex-col items-center gap-1 transition-colors p-1 ${
              repeatMode !== 'off'
                ? 'text-[#FF7A18]'
                : 'text-[#A4A4AD] hover:text-[#F5F5F7]'
            }`}
            aria-label="Mode répétition"
          >
            <Repeat className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-medium">
              {repeatMode === 'phrase' ? 'Répéter' : repeatMode === 'group' ? 'Groupe' : 'Normal'}
            </span>
          </button>
        </div>

        {/* Sub-bar: Shadow (Mic) | 1x Vitesse | Auto scroll toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-[#23232B] text-xs font-medium text-[#A4A4AD]">
          {/* Shadow Mic Button */}
          <button
            onClick={() => onOpenRecording(activeSubtitle)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#24242C] hover:bg-[#2D2D38] text-[#F5F5F7] transition-all border border-[#343440] active:scale-95 cursor-pointer shadow-sm"
          >
            <Mic className="w-4 h-4 text-[#FF7A18]" />
            <span className="font-semibold text-xs">Shadow</span>
          </button>

          {/* Speed Selector */}
          <button
            onClick={handleCycleSpeed}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-[#22222A] hover:text-[#F5F5F7] transition-colors"
          >
            <span className="font-bold text-[#F5F5F7]">{settings.playbackSpeed}x</span>
            <span className="text-[11px] text-[#8E8E98]">Vitesse</span>
          </button>

          {/* Auto Scroll Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8E8E98]">Auto scroll</span>
            <button
              onClick={() => onUpdateSettings({ autoScroll: !settings.autoScroll })}
              role="switch"
              aria-checked={settings.autoScroll}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                settings.autoScroll ? 'bg-[#FF7A18]' : 'bg-[#2E2E38]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoScroll ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </footer>

      {/* Full Subtitle List Modal / Drawer */}
      {showFullList && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#18181D] border-t border-[#2F2F38] rounded-t-3xl max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#26262F]">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-[#FF7A18]" />
                <h3 className="text-sm font-bold text-[#F5F5F7]">
                  Toutes les phrases ({scene.subtitles.length})
                </h3>
              </div>
              <button
                onClick={() => setShowFullList(false)}
                className="p-1 rounded-full text-[#A4A4AD] hover:text-[#F5F5F7] hover:bg-[#25252D] transition-colors cursor-pointer"
                aria-label="Fermer la liste"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
              {scene.subtitles.map((item, idx) => {
                const isActive = idx === activeSubtitleIndex;
                const isFav = favoritePhraseIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      jumpToSubtitle(idx);
                      setShowFullList(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-[#22222A] border-[#FF7A18] shadow-md'
                        : 'bg-[#141418] border-[#25252E] hover:bg-[#1E1E26]'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p
                        style={{ transition: 'color 0.2s, background-color 0.2s' }}
                        className={`text-sm font-medium ${
                          isActive ? 'text-[#FF7A18] font-bold' : 'text-[#F5F5F7]'
                        }`}
                      >
                        {item.englishText}
                      </p>
                      <p className="text-xs text-[#8E8E98] mt-1">
                        {item.frenchText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="p-2 rounded-full text-[#8E8E98] hover:text-rose-500 hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-[#6C6C76] hover:text-rose-400'
                          }`}
                        />
                      </button>
                      <span className="text-[11px] font-medium text-[#73737C]">
                        {formatTimestamp(item.startTime)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
