import React from 'react';
import { CloudOff, Play, Download, RefreshCw, X } from 'lucide-react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#18181D] border border-[#2B2B33] rounded-3xl p-6 w-full max-w-sm text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E8E98] hover:text-[#F5F5F7] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cloud with slash icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#24242C] flex items-center justify-center mb-4 text-[#A4A4AD]">
          <CloudOff className="w-8 h-8 text-[#A4A4AD]" />
        </div>

        <h3 className="text-xl font-bold text-[#F5F5F7] mb-1.5">
          Mode hors ligne
        </h3>
        <p className="text-xs text-[#A4A4AD] leading-relaxed mb-5">
          Vous êtes actuellement hors ligne.
        </p>

        {/* Unavailable features list */}
        <div className="bg-[#131317] border border-[#23232A] rounded-2xl p-4 text-left text-xs mb-6 space-y-3">
          <p className="font-semibold text-[#8E8E98] text-[11px] uppercase tracking-wider">
            Certaines fonctionnalités ne sont pas disponibles :
          </p>

          <div className="flex items-center gap-3 text-[#D6D6DC]">
            <Play className="w-3.5 h-3.5 text-[#8E8E98] shrink-0" />
            <span>Lecture des vidéos distantes</span>
          </div>

          <div className="flex items-center gap-3 text-[#D6D6DC]">
            <Download className="w-3.5 h-3.5 text-[#8E8E98] shrink-0" />
            <span>Téléchargement de nouvelles scènes</span>
          </div>

          <div className="flex items-center gap-3 text-[#D6D6DC]">
            <RefreshCw className="w-3.5 h-3.5 text-[#8E8E98] shrink-0" />
            <span>Synchronisation des progrès en ligne</span>
          </div>
        </div>

        {/* Buttons: [Comprendre] & [Réessayer] */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#242429] hover:bg-[#2C2C33] text-[#A4A4AD] hover:text-white font-medium text-xs transition-colors"
          >
            Comprendre
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FF7A18] hover:bg-[#FF8A2E] text-white font-semibold text-xs transition-colors shadow-md shadow-[#FF7A18]/25"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
};
