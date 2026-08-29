import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { WORDMARK_VIEWBOX, LETTERS } from '../data/sharpbuyLetters';

/**
 * SHARPBUY Pure Vector Anti-Aliased Intro
 * - 100% Infinite-Resolution Vector Curves (0 Raster Pixels / 0 Jagged Edges)
 * - 3-Pass Chaikin Sub-pixel Spline Smoothing
 * - Soft vector glow & metallic/flame fills
 * - Smooth transition into website
 */
export const IntroSplash = ({ onFinish }) => {
  const { lang } = useLanguage();
  const [isDrawn, setIsDrawn] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 1. Start smooth contour drawing
    const t1 = setTimeout(() => setIsDrawn(true), 80);
    // 2. Outlines complete -> smooth gradient fill
    const t2 = setTimeout(() => setIsFilled(true), 1300);
    // 3. Smooth fadeout to website
    const t3 = setTimeout(() => setIsDone(true), 2100);
    const t4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2700);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDone(true);
        if (onFinish) onFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFinish]);

  return (
    <div
      onClick={() => {
        setIsDone(true);
        if (onFinish) onFinish();
      }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#070605] overflow-hidden select-none cursor-pointer transition-all duration-600 ${
        isDone ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* ── ТЕМНЫЙ ФОН И СВЕЧЕНИЕ ── */}
      <div className="absolute inset-0 bg-[#070605] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ff4400_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* Мягкое фоновое неоновое свечение */}
      <div
        className={`absolute h-72 w-[650px] rounded-full bg-gradient-to-r from-[#FF2200] via-[#FF6600] to-amber-500 blur-3xl pointer-events-none transition-all duration-700 ${
          isFilled ? 'opacity-70 scale-130' : 'opacity-25 scale-90'
        }`}
      />

      {/* ── ЦЕНТРАЛЬНЫЙ ВЕКТОРНЫЙ БЛОК (PURE 100% VECTOR) ── */}
      <div className="relative flex items-center justify-center max-w-4xl px-8 w-full">
        
        <div className="relative w-full flex items-center justify-center py-10">
          <svg
            viewBox={WORDMARK_VIEWBOX}
            className="w-full max-w-3xl h-auto overflow-visible"
            style={{
              filter: isFilled ? 'drop-shadow(0 0 25px rgba(255,85,0,0.85))' : 'none',
              transition: 'filter 0.5s ease-out',
            }}
          >
            <defs>
              <filter id="ultra-smooth-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Хромированный градиент для букв SHARP */}
              <linearGradient id="sharp-smooth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Огненный неоновый градиент для букв BUY */}
              <linearGradient id="buy-smooth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF7700" />
                <stop offset="50%" stopColor="#FF4400" />
                <stop offset="100%" stopColor="#CC2200" />
              </linearGradient>
            </defs>

            {/* 
              ЧИСТЫЕ ВЕКТОРНЫЕ БУКВЫ БЕЗ РАСТРА И ПИКСЕЛЕЙ:
              S, H, A, R, P, B, U, Y
            */}
            {LETTERS.map((letter, index) => {
              const isBuy = letter.isBuy;
              const strokeColor = isBuy ? '#FF5500' : '#FFFFFF';
              const fillColor = isBuy ? 'url(#buy-smooth-fill)' : 'url(#sharp-smooth-fill)';
              const delay = index * 135; // Comfortable, visible drawing pacing

              return (
                <path
                  key={letter.char + index}
                  d={letter.d}
                  fillRule="evenodd"
                  fill={isFilled ? fillColor : 'transparent'}
                  stroke={strokeColor}
                  strokeWidth={isFilled ? '0.5' : '2'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#ultra-smooth-glow)"
                  style={{
                    strokeDasharray: 950,
                    strokeDashoffset: isDrawn ? 0 : 950,
                    transition: `stroke-dashoffset 0.95s cubic-bezier(0.2, 0.8, 0.25, 1) ${delay}ms, fill 0.5s ease-out 1.3s, stroke-width 0.4s ease-out 1.3s`,
                  }}
                />
              );
            })}
          </svg>

          {/* Алмазный луч после завершения отрисовки */}
          {isFilled && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{
                WebkitMaskImage: "url('/sharpbuy-logo.png')",
                maskImage: "url('/sharpbuy-logo.png')",
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center center',
                maskPosition: 'center center',
              }}
            >
              <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-30deg] animate-text-blade-glint" />
            </div>
          )}
        </div>

      </div>

      {/* ── ПОДСКАЗКА [ESC] ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-white/30 flex items-center gap-2 pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A] animate-pulse"></span>
        <span>{lang === 'en' ? '[ESC] TO SKIP' : '[ESC] ДЛЯ ПРОПУСКА'}</span>
      </div>
    </div>
  );
};

