import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TopShowcase = ({ onNavigate, onSelectProduct }) => {
  const [hoveredStand, setHoveredStand] = useState(null);
  const { lang, t } = useLanguage();

  return (
    <section className="relative z-20 overflow-hidden bg-[#0A0A09] pt-20 pb-16 text-[#F3F1EC]">
      {/* 0. Плавный градиент перехода из Hero */}
      <div className="pointer-events-none absolute -top-24 left-0 right-0 h-28 bg-gradient-to-b from-[#0E0D0C] via-[#0E0D0C]/80 to-[#0A0A09]"></div>

      {/* Фоновая перфорация */}
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.06]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        {/* ── 1. ВЕРХ ВИТРИНЫ ── */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-7 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'ВИТРИНА ТОВАРОВ / СВЕЖИЙ ДОСТУП' : 'PRODUCT SHOWCASE / FRESH ACCESS'}
              </span>
            </div>

            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(38px, 4.2vw, 56px)',
                lineHeight: 0.95,
              }}
            >
              {lang === 'ru' ? <>ТОП ПРОДАЖ<br />СЕГОДНЯ</> : <>TOP PICKS<br />TODAY</>}
            </h2>
          </div>

          {/* Ссылка-команда «ВСЕ 1 057 ПОЗИЦИЙ →» */}
          <button
            onClick={() => onNavigate('catalog')}
            className="group mb-1 flex items-center gap-2 font-mono text-[13px] text-white/50 transition-colors duration-200 hover:text-white cursor-pointer select-none"
          >
            <span>{lang === 'ru' ? 'ВСЕ' : 'ALL'}</span>
            <span className="font-bold text-[#F3F1EC] transition-colors duration-200 group-hover:text-[#E8583A]">
              1 057
            </span>
            <span>{lang === 'ru' ? 'ПОЗИЦИЙ' : 'ITEMS'}</span>
            <span className="text-white/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#E8583A]">
              &rarr;
            </span>
          </button>
        </div>

        {/* ── 2. ГЛАВНАЯ СТЕНА АРСЕНАЛА ── */}
        <div className="relative overflow-hidden rounded-md border border-white/[0.09] bg-[#0E0D0C] shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-2.5 left-3.5 h-1.5 w-1.5 rounded-full bg-white/20 shadow-inner"></div>
          <div className="absolute top-2.5 right-3.5 h-1.5 w-1.5 rounded-full bg-white/20 shadow-inner"></div>

          <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.09]"></div>

          <div className="relative grid grid-cols-1 divide-y divide-white/[0.06] md:grid-cols-3 md:divide-x md:divide-y-0">

            {/* ═══ СТЕНД 1: PRIME NFA ═══ */}
            <div
              onMouseEnter={() => setHoveredStand('prime')}
              onMouseLeave={() => setHoveredStand(null)}
              onClick={() => {
                if (onSelectProduct) onSelectProduct({ id: '1776123877718' });
              }}
              className={`group relative flex flex-col justify-between p-7 lg:p-9 transition-all duration-300 cursor-pointer ${
                hoveredStand && hoveredStand !== 'prime' ? 'opacity-80' : 'opacity-100'
              }`}
              style={{ minHeight: '440px' }}
            >
              <div
                className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-[#E8793A]/15 blur-3xl transition-opacity duration-300 ${
                  hoveredStand === 'prime' ? 'opacity-100 scale-110' : 'opacity-65'
                }`}
              ></div>

              <div className="relative z-10 flex flex-col items-center pt-2 pb-4">
                <div className="mb-2 flex items-center gap-12">
                  <div className="h-2 w-2 rounded-full border border-black/80 bg-stone-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                  <div className="h-2 w-2 rounded-full border border-black/80 bg-stone-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                </div>

                <div
                  className={`relative flex h-28 w-28 items-center justify-center transition-transform duration-300 ${
                    hoveredStand === 'prime' ? '-translate-y-1' : 'translate-y-0'
                  }`}
                >
                  <div className="absolute -top-3 left-6 h-4 w-[1px] bg-white/25"></div>
                  <div className="absolute -top-3 right-6 h-4 w-[1px] bg-white/25"></div>

                  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
                    <polygon
                      points="50,4 92,26 92,74 50,96 8,74 8,26"
                      fill="#121110"
                      stroke="#4A453F"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points="50,11 85,29 85,71 50,89 15,71 15,29"
                      fill="#161514"
                      stroke="url(#primeHexGrad)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M50 28 L54 44 L70 48 L54 52 L50 68 L46 52 L30 48 L46 44 Z"
                      fill="none"
                      stroke="#E8793A"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      opacity="0.85"
                    />
                    <circle cx="50" cy="48" r="2.5" fill="#F3F1EC" />
                    <defs>
                      <linearGradient id="primeHexGrad" x1="0%" y1="0%" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8A7A68" />
                        <stop offset="50%" stopColor="#3A3530" />
                        <stop offset="100%" stopColor="#E8793A" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="relative z-10 space-y-2">
                <div className="font-sans text-[19px] font-extrabold uppercase tracking-tight text-[#F3F1EC] group-hover:text-white transition-colors">
                  PRIME NFA &middot; PREMIER 18.4K
                </div>

                <div className="flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-white/50">
                  <span>2 450 {lang === 'ru' ? 'Ч.' : 'HRS'}</span>
                  <span>&middot;</span>
                  <span>5 {lang === 'ru' ? 'МЕДАЛЕЙ' : 'MEDALS'}</span>
                  <span>&middot;</span>
                  <span className="font-semibold text-white/70">
                    {lang === 'ru' ? 'VAC ЧИСТО' : 'VAC CLEAN'}
                  </span>
                </div>

                <div className="my-3 h-[1px] w-full bg-white/[0.08]"></div>

                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-[22px] font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? '3 490 ₽' : '$38.50'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) onSelectProduct({ id: '1776123877718' });
                    }}
                    className="relative flex items-center gap-1.5 rounded border border-[#E8583A]/50 bg-[#141210] px-3.5 py-1.5 font-mono text-[12px] font-semibold text-[#F3F1EC] transition-all duration-200 hover:border-[#E8583A] hover:bg-[#1C1714] cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'ОТКРЫТЬ' : 'VIEW'}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1 text-[#E8583A]">&rarr;</span>
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#E8583A] opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  </button>
                </div>

                <div className="pt-2 text-left">
                  <span className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
                    HS-01 / PRIME SERIES
                  </span>
                </div>
              </div>
            </div>

            {/* ═══ СТЕНД 2: KARAMBIT DOPPLER ═══ */}
            <div
              onMouseEnter={() => setHoveredStand('karambit')}
              onMouseLeave={() => setHoveredStand(null)}
              onClick={() => {
                if (onSelectProduct) onSelectProduct({ id: '1775685165996' });
              }}
              className={`group relative flex flex-col justify-between p-7 lg:p-9 transition-all duration-300 cursor-pointer ${
                hoveredStand && hoveredStand !== 'karambit' ? 'opacity-80' : 'opacity-100'
              }`}
              style={{ minHeight: '440px' }}
            >
              <div
                className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-80 rounded-full bg-[#E8583A]/25 blur-3xl transition-opacity duration-300 ${
                  hoveredStand === 'karambit' ? 'opacity-100 scale-110' : 'opacity-70'
                }`}
              ></div>

              <div className="relative z-10 flex flex-col items-center pt-2 pb-2">
                <div className="mb-2 flex items-center gap-20">
                  <div className="h-3 w-1.5 rounded-b border border-black/80 bg-stone-600 shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>
                  <div className="h-3 w-1.5 rounded-b border border-black/80 bg-stone-600 shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>
                </div>

                <div
                  className={`relative flex h-32 w-full max-w-[260px] items-center justify-center transition-transform duration-300 ${
                    hoveredStand === 'karambit' ? '-translate-y-1' : 'translate-y-0'
                  }`}
                >
                  <img
                    src="/karambit-doppler.svg"
                    alt="Karambit Doppler"
                    className="max-h-full w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                    style={{ transform: 'rotate(-4deg)' }}
                  />
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 rounded border border-white/10 bg-[#161413]/90 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white/70 shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A] shadow-[0_0_6px_#E8583A]"></span>
                  <span>HS-02 / LEGENDARY</span>
                </div>
              </div>

              <div className="relative z-10 space-y-2">
                <div className="font-sans text-[19px] font-extrabold uppercase tracking-tight text-[#F3F1EC] group-hover:text-white transition-colors">
                  KARAMBIT <span className="text-[#A78BFA]/90">DOPPLER</span> / {lang === 'ru' ? '10 ЛЕТ ВЫСЛУГИ' : '10 YR VETERAN'}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-white/50">
                  <span>15.2K PTS</span>
                  <span>&middot;</span>
                  <span>1 890 {lang === 'ru' ? 'Ч.' : 'HRS'}</span>
                  <span>&middot;</span>
                  <span>7 {lang === 'ru' ? 'МЕДАЛЕЙ' : 'MEDALS'}</span>
                  <span>&middot;</span>
                  <span className="font-semibold text-white/70">
                    {lang === 'ru' ? 'VAC ЧИСТО' : 'VAC CLEAN'}
                  </span>
                </div>

                <div className="my-3 h-[1px] w-full bg-white/[0.08]"></div>

                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-[22px] font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? '2 890 ₽' : '$31.90'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) onSelectProduct({ id: '1775685165996' });
                    }}
                    className="relative flex items-center gap-1.5 rounded border border-[#E8583A]/70 bg-[#161210] px-3.5 py-1.5 font-mono text-[12px] font-semibold text-[#F3F1EC] transition-all duration-200 hover:border-[#E8583A] hover:bg-[#201712] cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'ОТКРЫТЬ' : 'VIEW'}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1 text-[#E8583A]">&rarr;</span>
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#E8583A] opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  </button>
                </div>

                <div className="pt-2 text-left">
                  <span className="font-mono text-[10px] tracking-widest text-[#E8583A]/60 uppercase">
                    • {lang === 'ru' ? 'РЕКОМЕНДУЕМЫЙ ТРОФЕЙ' : 'FEATURED TROPHY'}
                  </span>
                </div>
              </div>
            </div>

            {/* ═══ СТЕНД 3: FULL ACCESS ═══ */}
            <div
              onMouseEnter={() => setHoveredStand('fullaccess')}
              onMouseLeave={() => setHoveredStand(null)}
              onClick={() => {
                if (onSelectProduct) onSelectProduct({ id: '1773149507447' });
              }}
              className={`group relative flex flex-col justify-between p-7 lg:p-9 transition-all duration-300 cursor-pointer ${
                hoveredStand && hoveredStand !== 'fullaccess' ? 'opacity-80' : 'opacity-100'
              }`}
              style={{ minHeight: '440px' }}
            >
              <div
                className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-[#38BDF8]/15 blur-3xl transition-opacity duration-300 ${
                  hoveredStand === 'fullaccess' ? 'opacity-100 scale-110' : 'opacity-65'
                }`}
              ></div>

              <div className="relative z-10 flex flex-col items-center pt-2 pb-4">
                <div className="mb-2 flex items-center gap-12">
                  <div className="h-2 w-2 rounded-full border border-black/80 bg-stone-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                  <div className="h-2 w-2 rounded-full border border-black/80 bg-stone-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></div>
                </div>

                <div
                  className={`relative flex h-28 w-28 items-center justify-center transition-transform duration-300 ${
                    hoveredStand === 'fullaccess' ? '-translate-y-1' : 'translate-y-0'
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
                    <path
                      d="M50 8 L86 22 L86 52 C86 74 68 90 50 94 C32 90 14 74 14 52 L14 22 Z"
                      fill="#111518"
                      stroke="#2E4050"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M50 14 L80 26 L80 50 C80 69 66 84 50 88 C34 84 20 69 20 50 L20 26 Z"
                      fill="#141B22"
                      stroke="url(#shieldBlueGrad)"
                      strokeWidth="1.5"
                    />
                    <circle cx="50" cy="40" r="8" fill="none" stroke="#60A5FA" strokeWidth="2" />
                    <path d="M50 48 L50 64 M45 56 L50 56 M45 62 L50 62" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="72" cy="68" r="10" fill="#141B22" stroke="#38BDF8" strokeWidth="1.5" />
                    <path d="M68 68 L71 71 L76 65" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="shieldBlueGrad" x1="0%" y1="0%" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4A657A" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="relative z-10 space-y-2">
                <div className="font-sans text-[19px] font-extrabold uppercase tracking-tight text-[#F3F1EC] group-hover:text-white transition-colors">
                  FULL ACCESS &middot; FACEIT 8 LVL
                </div>

                <div className="flex flex-wrap items-center gap-x-2 font-mono text-[12px] text-white/50">
                  <span>{lang === 'ru' ? 'ПЕРЕПРИВЯЗКА' : 'FULL REBIND'}</span>
                  <span>&middot;</span>
                  <span>1 420 {lang === 'ru' ? 'Ч.' : 'HRS'}</span>
                  <span>&middot;</span>
                  <span>4 {lang === 'ru' ? 'МЕДАЛИ' : 'MEDALS'}</span>
                  <span>&middot;</span>
                  <span className="font-semibold text-white/70">
                    {lang === 'ru' ? 'VAC ЧИСТО' : 'VAC CLEAN'}
                  </span>
                </div>

                <div className="my-3 h-[1px] w-full bg-white/[0.08]"></div>

                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-[22px] font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? '1 990 ₽' : '$21.90'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) onSelectProduct({ id: '1773149507447' });
                    }}
                    className="relative flex items-center gap-1.5 rounded border border-white/20 bg-[#121417] px-3.5 py-1.5 font-mono text-[12px] font-semibold text-[#F3F1EC] transition-all duration-200 hover:border-white hover:bg-[#1A1E24] cursor-pointer"
                  >
                    <span>{lang === 'ru' ? 'ОТКРЫТЬ' : 'VIEW'}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1 text-white/80">&rarr;</span>
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  </button>
                </div>

                <div className="pt-2 text-left">
                  <span className="font-mono text-[10px] tracking-widest text-white/25 uppercase">
                    HS-03 / VERIFIED ACCESS
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── 3. НИЖНЯЯ МЕТАЛЛИЧЕСКАЯ ПОЛКА ── */}
          <div className="relative border-t border-white/[0.12] bg-gradient-to-r from-[#181615] via-[#141211] to-[#181615] p-6 lg:px-9 lg:py-5">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-sans text-[21px] font-extrabold uppercase tracking-tight text-[#F3F1EC] sm:text-[23px]">
                  {lang === 'ru' ? 'НУЖЕН КОНКРЕТНЫЙ РАНГ, НОЖ ИЛИ ДОСТУП?' : 'LOOKING FOR A SPECIFIC RANK, KNIFE OR ACCESS?'}
                </div>
                <div className="mt-0.5 font-sans text-xs text-white/55">
                  {lang === 'ru' ? (
                    <>В каталоге доступно <strong className="font-semibold text-white/90">1 057 проверенных позиций</strong> с мгновенной автовыдачей.</>
                  ) : (
                    <>Explore over <strong className="font-semibold text-white/90">1,057 verified items</strong> with 3-second instant delivery.</>
                  )}
                </div>
              </div>

              <button
                onClick={() => onNavigate('catalog')}
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-md border border-[#E8583A]/50 bg-[#12100E] px-7 py-3 font-sans text-sm font-bold tracking-wide text-[#F3F1EC] transition-all duration-300 hover:border-[#E8583A] hover:bg-[#1E1713] cursor-pointer shrink-0"
              >
                <div className="scanner-beam-line absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF6B4A] to-transparent opacity-70 transition-opacity group-hover:opacity-100"></div>

                <span className="relative z-10 uppercase">{t('hero_btn_catalog')}</span>
                <span className="relative z-10 font-mono text-[#E8583A] transition-transform duration-200 group-hover:translate-x-1.5">
                  &rarr;
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
