import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';

interface OnboardingViewProps {
  onStart: () => void;
  onLater: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStart,
  onLater,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-center px-6 py-12 overflow-hidden bg-[#101014]">
      {/* Background Image with warm gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#101014]/90 via-[#101014]/50 to-[#101014] pointer-events-none" />

      {/* Top Brand */}
      <div className="relative z-10 pt-6">
        <BrandLogo size="lg" />
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 max-w-sm my-auto py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F7] mb-3 leading-tight">
          Parle anglais avec confiance
        </h1>
        <p className="text-sm sm:text-base font-medium text-[#A4A4AD] tracking-wide">
          Regarde • Écoute • Répète • Progrès
        </p>
      </div>

      {/* Bottom Action Buttons */}
      <div className="relative z-10 w-full max-w-xs space-y-3 pb-6">
        <button
          onClick={onStart}
          className="w-full py-4 px-6 rounded-2xl bg-[#FF7A18] hover:bg-[#FF8A2E] active:scale-[0.98] transition-all font-semibold text-white text-base shadow-lg shadow-[#FF7A18]/25 cursor-pointer"
        >
          Commencer
        </button>

        <button
          onClick={onLater}
          className="w-full py-2.5 text-sm font-medium text-[#A4A4AD] hover:text-[#F5F5F7] transition-colors cursor-pointer"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
};
