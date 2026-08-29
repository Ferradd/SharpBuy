import React from 'react';

export const AssetVisual = ({ type = 'medal', className = 'h-24 w-24', isHovered = false }) => {
  switch (type) {
    case 'medal':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(232,88,58,0.25)]">
            <circle cx="50" cy="50" r="44" fill="#141312" stroke="#4A423A" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="37" fill="#1A1816" stroke="url(#medalGrad)" strokeWidth="1.5" />
            {/* 8-конечная звезда службы */}
            <polygon
              points="50,18 57,36 76,36 61,48 67,66 50,55 33,66 39,48 24,36 43,36"
              fill="#221E1B"
              stroke="#E8893A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="10" fill="#121110" stroke="#F3F1EC" strokeWidth="1.5" />
            <polygon points="50,44 52,48 56,48 53,51 54,55 50,53 46,55 47,51 44,48 48,48" fill="#E8583A" />
            <defs>
              <linearGradient id="medalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C9A063" />
                <stop offset="50%" stopColor="#4A3F33" />
                <stop offset="100%" stopColor="#E8583A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'rank':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(232,88,58,0.25)]">
            {/* Воинский шеврон и ранг-щит */}
            <polygon points="50,10 86,28 86,60 50,90 14,60 14,28" fill="#141312" stroke="#3A3835" strokeWidth="2" />
            <polygon points="50,18 78,32 78,56 50,80 22,56 22,32" fill="#181615" stroke="url(#rankGrad)" strokeWidth="1.5" />
            {/* Шевроны */}
            <path d="M30 42 L50 56 L70 42" fill="none" stroke="#E8583A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M34 52 L50 64 L66 52" fill="none" stroke="#E8893A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            <defs>
              <linearGradient id="rankGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8A7A68" />
                <stop offset="100%" stopColor="#E8583A" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case 'hours':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(232,88,58,0.2)]">
            {/* Круговой счетчик часов */}
            <circle cx="50" cy="50" r="42" fill="#121110" stroke="#2E2C2A" strokeWidth="3" />
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="#E8583A"
              strokeWidth="4"
              strokeDasharray="213"
              strokeDashoffset="60"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            {/* Деления таймера */}
            <line x1="50" y1="18" x2="50" y2="24" stroke="#F3F1EC" strokeWidth="2" strokeLinecap="round" />
            <line x1="82" y1="50" x2="76" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="50" y1="82" x2="50" y2="76" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="18" y1="50" x2="24" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            {/* Стрелки */}
            <line x1="50" y1="50" x2="50" y2="30" stroke="#F3F1EC" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="50" x2="64" y2="50" stroke="#E8583A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="#E8583A" />
          </svg>
        </div>
      );

    case 'knife':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <img
            src="/karambit-doppler.svg"
            alt="Knife Slot"
            className="max-h-full w-auto object-contain drop-shadow-[0_10px_25px_rgba(232,88,58,0.3)]"
          />
        </div>
      );

    case 'rust':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(200,80,40,0.25)]">
            <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="#141110" stroke="#5A3A28" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="22" fill="#1A1512" stroke="#E8683A" strokeWidth="2" strokeDasharray="4 2" />
            <rect x="46" y="32" width="8" height="36" fill="#C8482A" rx="2" transform="rotate(45 50 50)" />
            <rect x="46" y="32" width="8" height="36" fill="#C8482A" rx="2" transform="rotate(-45 50 50)" />
            <circle cx="50" cy="50" r="7" fill="#F3F1EC" />
          </svg>
        </div>
      );

    case 'cfg':
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(56,189,248,0.25)]">
            <rect x="12" y="16" width="76" height="68" rx="6" fill="#0E1217" stroke="#253545" strokeWidth="2" />
            {/* Радарная сетка */}
            <circle cx="50" cy="50" r="24" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.4" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7" />
            <line x1="50" y1="20" x2="50" y2="80" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            {/* Прицел */}
            <circle cx="50" cy="50" r="2.5" fill="#E8583A" />
            <line x1="42" y1="50" x2="46" y2="50" stroke="#E8583A" strokeWidth="2" />
            <line x1="54" y1="50" x2="58" y2="50" stroke="#E8583A" strokeWidth="2" />
            <line x1="50" y1="42" x2="50" y2="46" stroke="#E8583A" strokeWidth="2" />
            <line x1="50" y1="54" x2="50" y2="58" stroke="#E8583A" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'steam':
    case 'vds':
    default:
      return (
        <div className={`relative flex items-center justify-center transition-transform duration-300 ${className} ${isHovered ? 'scale-105' : ''}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_20px_rgba(232,88,58,0.2)]">
            <polygon points="50,10 88,30 88,70 50,90 12,70 12,30" fill="#121418" stroke="#2A3542" strokeWidth="2" />
            <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="#161C24" stroke="url(#steamGrad)" strokeWidth="1.5" />
            <path d="M50 32 L64 46 L50 68 L36 46 Z" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="50" cy="46" r="4" fill="#E8583A" />
            <defs>
              <linearGradient id="steamGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4A657A" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
  }
};
