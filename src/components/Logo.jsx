import React, { useState } from 'react';

/**
 * SHARPBUY Clean Brand Logo Component
 * - Static, crisp S-Mark with clean fiery cut (Zero annoying white blinking)
 * - Pure typography with subtle, premium metallic glint on hover
 * - 100% Pixel-Masked, no background artifacts
 */
export const Logo = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size variations
  const sizeConfig = {
    sm: {
      icon: 'h-7 w-7',
      text: 'h-5',
      gap: 'gap-2.5',
      container: 'h-8',
      beamWidth: 'w-16',
    },
    md: {
      icon: 'h-9 w-9',
      text: 'h-6',
      gap: 'gap-3',
      container: 'h-10',
      beamWidth: 'w-24',
    },
    lg: {
      icon: 'h-12 w-12',
      text: 'h-8',
      gap: 'gap-4',
      container: 'h-14',
      beamWidth: 'w-32',
    },
  }[size] || {
    icon: 'h-9 w-9',
    text: 'h-6',
    gap: 'gap-3',
    container: 'h-10',
    beamWidth: 'w-24',
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center ${sizeConfig.gap} select-none group cursor-pointer ${sizeConfig.container} ${className}`}
    >
      {/* ── 1. ИКОНКА: ЧИСТЫЙ РАССЕЧЁННЫЙ ЗНАК «S» (БЕЗ МОРГАНИЙ) ── */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeConfig.icon} transition-transform duration-300 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}>
        
        {/* Мягкий стабильный неоновый ореол (без мерцания) */}
        <div
          className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#FF3B00] via-[#FF6B00] to-amber-400 blur-md transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-70' : 'opacity-25'
          }`}
        />

        {/* Чистый знак без белых мигающих точек */}
        <img
          src="/sharpbuy-mark.png"
          alt="SHARPBUY"
          className={`relative z-10 h-full w-full object-contain filter transition-all duration-300 ${
            isHovered
              ? 'drop-shadow-[0_0_12px_rgba(255,85,0,0.85)] brightness-105'
              : 'drop-shadow-[0_0_4px_rgba(255,85,0,0.35)]'
          }`}
        />
      </div>

      {/* ── 2. ТЕКСТ: SHARP BUY (ЧИСТЫЙ ПРЕМИАЛЬНЫЙ ШРИФТ) ── */}
      {showText && (
        <div className="relative flex items-center">
          {/* Базовый логотип */}
          <img
            src="/sharpbuy-logo.png"
            alt="SHARPBUY"
            className={`${sizeConfig.text} w-auto object-contain transition-all duration-300 ${
              isHovered
                ? 'filter drop-shadow-[0_0_14px_rgba(255,85,0,0.7)] brightness-110'
                : 'filter drop-shadow-[0_0_3px_rgba(255,85,0,0.2)]'
            }`}
          />

          {/* 
            ПИКСЕЛЬ-МАСКА ДЛЯ МЯГКОГО БЛИКА:
            Пробегает только при наведении мыши (Hover)
          */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              WebkitMaskImage: "url('/sharpbuy-logo.png')",
              maskImage: "url('/sharpbuy-logo.png')",
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'left center',
              maskPosition: 'left center',
            }}
          >
            {/* Скользящий алмазный луч при наведении */}
            <div
              className={`absolute inset-y-0 ${sizeConfig.beamWidth} bg-gradient-to-r from-transparent via-white/80 via-amber-100/90 to-transparent skew-x-[-30deg] transition-opacity duration-300 ${
                isHovered ? 'animate-text-blade-glint opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
