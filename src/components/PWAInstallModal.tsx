import React from 'react';
import { Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onClose();
    } else if (isIOS) {
      alert("Sur iPhone / iPad : Appuyez sur le bouton Partager dans Safari, puis sélectionnez 'Sur l'écran d'accueil'.");
      onClose();
    } else {
      // If already installed or browser menu flow
      alert("Pour installer SpeakFlow, utilisez le menu de votre navigateur (3 points verticaux) puis sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
      onClose();
    }
  };

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

        {/* Smartphone Icon with orange soundwave */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#22222A] border border-[#32323D] flex items-center justify-center mb-5 relative shadow-inner">
          <Smartphone className="w-10 h-10 text-[#A4A4AD]" />
          <div className="absolute inset-0 flex items-center justify-center gap-0.5">
            <span className="w-1 h-3 bg-[#FF7A18] rounded-full" />
            <span className="w-1 h-5 bg-[#FF7A18] rounded-full" />
            <span className="w-1 h-7 bg-[#FF7A18] rounded-full" />
            <span className="w-1 h-4 bg-[#FF7A18] rounded-full" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#F5F5F7] mb-2">
          Installer SpeakFlow
        </h3>
        <p className="text-xs text-[#A4A4AD] leading-relaxed mb-6 px-2">
          Ajoutez l&apos;application sur votre écran d&apos;accueil pour un accès rapide et une meilleure expérience.
        </p>

        {/* Feature checkmarks */}
        <div className="space-y-2.5 text-left text-xs mb-6 px-4">
          <div className="flex items-center gap-2.5 text-[#F5F5F7]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Accès rapide</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#F5F5F7]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fonctionne hors ligne (partiellement)</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#F5F5F7]">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mises à jour automatiques</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-2.5">
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF7A18] hover:bg-[#FF8A2E] text-white font-semibold text-sm transition-all shadow-lg shadow-[#FF7A18]/25 cursor-pointer"
          >
            Installer
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-[#8E8E98] hover:text-[#F5F5F7] transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};
