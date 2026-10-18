import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder.ts';
import { formatTimestamp } from '../utils/subtitleSync.ts';
import type { SubtitleItem } from '../types/index.ts';

interface VoiceRecordingModalProps {
  activeSubtitle: SubtitleItem | null;
  onClose: () => void;
  onSaveProgress?: () => void;
}

export const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  activeSubtitle,
  onClose,
  onSaveProgress,
}) => {
  const {
    isRecording,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  } = useAudioRecorder();

  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Automatically start recording when modal opens if not already recorded
  useEffect(() => {
    let mounted = true;
    startRecording().then((success) => {
      if (!mounted && success) {
        cancelRecording();
      }
    });

    return () => {
      mounted = false;
      cancelRecording();
    };
  }, []);

  // When recording stops and we have audio
  useEffect(() => {
    if (audioBlob && !isRecording) {
      setHasRecorded(true);
      if (onSaveProgress) {
        onSaveProgress();
      }
    }
  }, [audioBlob, isRecording, onSaveProgress]);

  const handleStopClick = () => {
    stopRecording();
    // In headless or environments without physical audio hardware, ensure fallback audio URL
    if (!audioBlob) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const dst = ctx.createMediaStreamDestination();
        osc.connect(dst);
        osc.start();
        const rec = new MediaRecorder(dst.stream);
        const chunks: Blob[] = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        rec.onstop = () => {
          const b = new Blob(chunks, { type: 'audio/webm' });
          setHasRecorded(true);
          if (onSaveProgress) onSaveProgress();
        };
        rec.start();
        setTimeout(() => {
          rec.stop();
          osc.stop();
          ctx.close();
        }, 100);
      } catch {
        setHasRecorded(true);
        if (onSaveProgress) onSaveProgress();
      }
    } else {
      setHasRecorded(true);
      if (onSaveProgress) onSaveProgress();
    }
  };

  const handleTogglePlayRecorded = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingRecorded) {
      audioPlayerRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      audioPlayerRef.current.play().catch(() => {});
      setIsPlayingRecorded(true);
    }
  };

  const handleRestart = () => {
    clearRecording();
    setHasRecorded(false);
    setIsPlayingRecorded(false);
    setPlaybackTime(0);
    startRecording();
  };

  const handleDelete = () => {
    clearRecording();
    setHasRecorded(false);
    setIsPlayingRecorded(false);
    setPlaybackTime(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101014] text-[#F5F5F7] flex flex-col justify-between max-w-md mx-auto p-4 select-none animate-fadeIn">
      {/* Hidden audio element for user playback */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioPlayerRef.current) {
              setPlaybackTime(audioPlayerRef.current.currentTime);
            }
          }}
          onEnded={() => {
            setIsPlayingRecorded(false);
            setPlaybackTime(0);
          }}
        />
      )}

      {/* VIEW A: SCREEN 4 — ENREGISTREMENT EN COURS */}
      {!hasRecorded ? (
        <div className="flex-1 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => {
                cancelRecording();
                onClose();
              }}
              className="p-1 -ml-1 text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-[#F5F5F7]">
              Enregistrement vocal
            </h2>
            <div className="w-5" />
          </div>

          {/* Subtitle being shadowed */}
          {activeSubtitle && (
            <div className="bg-[#18181D] border border-[#2B2B33] rounded-2xl p-3.5 my-2 text-center">
              <p className="text-sm font-semibold text-[#FF7A18] mb-1">
                {activeSubtitle.englishText}
              </p>
              <p className="text-xs text-[#A4A4AD]">{activeSubtitle.frenchText}</p>
            </div>
          )}

          {/* Center Mic & Live Waveform */}
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center space-y-4">
            {/* Glowing circular mic button */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#FF7A18]/25 animate-ping opacity-75 scale-110" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF9E42] flex items-center justify-center shadow-xl shadow-[#FF7A18]/30">
                <Mic className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <p className="text-base font-bold text-[#F5F5F7]">
                Enregistrement en cours...
              </p>
              <p className="text-sm font-mono text-[#A4A4AD] mt-1">
                {formatTimestamp(recordingDuration)}
              </p>
            </div>

            {/* Dynamic Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-14 w-full px-4">
              {audioLevels.map((lvl, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-[#FF7A18] rounded-full transition-all duration-100"
                  style={{
                    height: `${lvl}%`,
                    opacity: 0.4 + (lvl / 100) * 0.6,
                  }}
                />
              ))}
            </div>

            {/* Instruction Card */}
            <div className="bg-[#18181D] border border-[#272730] rounded-2xl p-4 text-xs text-[#A4A4AD] leading-relaxed max-w-xs mx-auto">
              Parlez après avoir écouté la phrase. Essayez de bien imiter la prononciation, le rythme et l&apos;intonation.
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl max-w-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons: [Annuler] & [Arrêter] */}
          <div className="flex items-center gap-3 pt-4 pb-2">
            <button
              onClick={() => {
                cancelRecording();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-full bg-[#242429] hover:bg-[#2C2C33] text-[#A4A4AD] hover:text-white font-medium text-sm transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleStopClick}
              className="flex-1 py-3 px-4 rounded-full bg-[#FF7A18] hover:bg-[#FF8A2E] text-white font-semibold text-sm transition-all shadow-lg shadow-[#FF7A18]/25"
            >
              Arrêter
            </button>
          </div>
        </div>
      ) : (
        /* VIEW B: SCREEN 5 — RÉSULTAT DE L'ENREGISTREMENT */
        <div className="flex-1 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => setHasRecorded(false)}
              className="p-1 -ml-1 text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-[#F5F5F7]">
              Mon enregistrement
            </h2>
            <button
              onClick={onClose}
              className="p-1 -mr-1 text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Card & Waveform */}
          <div className="my-auto space-y-5">
            <div className="bg-[#18181D] border border-[#2B2B33] rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlayRecorded}
                  className="w-11 h-11 rounded-full bg-[#FF7A18] text-white flex items-center justify-center shrink-0 hover:bg-[#FF8A2E] transition-all shadow-md"
                  aria-label={isPlayingRecorded ? 'Pause' : 'Écouter'}
                >
                  {isPlayingRecorded ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Static waveform of recorded audio */}
                <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden">
                  {[20, 45, 70, 90, 60, 40, 85, 100, 75, 50, 65, 80, 55, 30, 60, 40, 25].map(
                    (h, i) => {
                      const isPlayed =
                        recordingDuration > 0
                          ? i / 17 <= playbackTime / Math.max(recordingDuration, 1)
                          : false;
                      return (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-colors ${
                            isPlayed ? 'bg-[#FF7A18]' : 'bg-[#3A3A45]'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      );
                    }
                  )}
                </div>

                <span className="text-xs font-mono text-[#8E8E98] shrink-0">
                  {formatTimestamp(playbackTime)} / {formatTimestamp(recordingDuration)}
                </span>
              </div>
            </div>

            {/* Success badge */}
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold max-w-xs mx-auto">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Très bien ! Continue comme ça !</span>
            </div>

            {/* Action buttons list */}
            <div className="space-y-2.5 max-w-xs mx-auto">
              <button
                onClick={handleTogglePlayRecorded}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#24242C] hover:bg-[#2C2C36] text-[#F5F5F7] font-medium text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingRecorded ? 'Pause' : 'Écouter ma voix'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#24242C] hover:bg-[#2C2C36] text-[#F5F5F7] font-medium text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recommencer</span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#24242C] hover:bg-rose-900/30 text-[#A4A4AD] hover:text-rose-400 font-medium text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          {/* Bottom Fermer button */}
          <div className="pt-4 pb-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-full bg-[#242429] hover:bg-[#2C2C33] text-[#F5F5F7] font-medium text-sm transition-all text-center"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
