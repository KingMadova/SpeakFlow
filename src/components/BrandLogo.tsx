import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const barHeights = {
    sm: [8, 14, 20, 12, 6],
    md: [12, 20, 30, 18, 10],
    lg: [18, 30, 46, 28, 16],
  }[size];

  const barWidth = {
    sm: 3,
    md: 4,
    lg: 5,
  }[size];

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Orange vertical soundwave bars */}
      <div className="flex items-center gap-1 h-9">
        {barHeights.map((h, i) => (
          <span
            key={i}
            className="bg-[#FF7A18] rounded-full inline-block transition-all duration-300"
            style={{
              width: `${barWidth}px`,
              height: `${h}px`,
            }}
          />
        ))}
      </div>

      {showText && (
        <span className={`font-bold tracking-tight text-[#F5F5F7] ${textSize}`}>
          Speak<span className="text-[#FF7A18]">Flow</span>
        </span>
      )}
    </div>
  );
};
