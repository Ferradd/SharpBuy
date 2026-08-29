import React from 'react';
import { KNIFE_VIEWBOX, KNIFE_CONTOUR_PATH } from '../data/knifePath';
import { useLanguage } from '../context/LanguageContext';

export const Hero = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  return (
    <section className="hero-viewport">
      {/* 0. Фоновая сцена CS2 с затемнением слева */}
      <div className="hero-bg"></div>
      <div className="hero-vignette-left"></div>
      <div className="hero-grain"></div>

      {/* 1. Мастер-контейнер левой колонки (z-index: 25) */}
      <div className="hero-left-col flex flex-col items-start justify-center">

        {/* Сабтайтл */}
        <div className="eyebrow-badge mb-20">
          <span className="eyebrow-dash"></span>
          <span>{lang === 'ru' ? 'PREMIUM MARKETPLACE · STEAM & CS2' : 'PREMIUM ESPORTS MARKETPLACE · STEAM & CS2'}</span>
        </div>

        {/* ── ГЛАВНЫЙ ЗАГОЛОВОК ── */}
        <div className="flex flex-col items-start" style={{ paddingTop: 'clamp(36px, 3.6vw, 64px)' }}>

          {/* ВЕРХНИЙ ЯРУС */}
          <div className="flex items-start">
            {/* АККАУНТЫ / ACCOUNTS */}
            <span
              className="block origin-bottom scale-y-[1.7] font-black leading-none tracking-tighter uppercase text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(54px, 7vw, 120px)', fontWeight: 700 }}
            >
              {lang === 'ru' ? 'АККАУНТЫ' : 'ACCOUNTS'}
            </span>

            {/* Правая пристройка */}
            <div className="ml-5 flex flex-col items-start">
              <span
                className="font-black leading-none text-[#F3F1EC] block"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(32px, 4vw, 70px)', fontWeight: 700 }}
              >
                &mdash;
              </span>
              <span
                className="font-bold leading-none uppercase text-[#F3F1EC] block"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(18px, 2.2vw, 38px)', fontWeight: 600, marginTop: '0.15em' }}
              >
                {lang === 'ru' ? 'КОТОРЫМ' : 'YOU CAN'}
              </span>
            </div>
          </div>

          {/* НИЖНИЙ ЯРУС */}
          <div
            className="mt-2 flex items-baseline leading-none"
            style={{ gap: 'clamp(10px, 1.2vw, 20px)' }}
          >
            <span
              className="font-black leading-none tracking-tighter uppercase text-[#F3F1EC] block"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(54px, 7vw, 120px)', fontWeight: 700 }}
            >
              {lang === 'ru' ? 'МОЖНО' : 'ALWAYS'}
            </span>
            <span
              className="font-black leading-none tracking-tighter uppercase block"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(54px, 7vw, 120px)',
                fontWeight: 700,
                background: 'linear-gradient(180deg, #BF2D18 0%, #E05030 40%, #FF7E2A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {lang === 'ru' ? 'ВЕРИТЬ.' : 'TRUST.'}
            </span>
          </div>

        </div>

        {/* Описание */}
        <p className="hero-subtitle mt-12">
          {lang === 'ru'
            ? 'Проверенные Steam и CS2 аккаунты с автовыдачей, честной гарантией и открытой историей каждой сделки.'
            : 'Verified Steam & CS2 accounts with 3-second instant delivery, solid replacement warranty, and transparent match history.'}
        </p>

        {/* Преимущества */}
        <div className="hero-features mt-8">
          <span>{lang === 'ru' ? 'Автовыдача' : 'Instant delivery'} &middot; <strong className="feature-highlight">{lang === 'ru' ? '3 сек' : '3 sec'}</strong></span>
          <span className="feature-sep">|</span>
          <span>{lang === 'ru' ? 'Гарантия' : 'Warranty'} &middot; <strong className="feature-highlight">{lang === 'ru' ? 'до 30 дней' : 'up to 30 days'}</strong></span>
          <span className="feature-sep">|</span>
          <span className="feature-highlight">{lang === 'ru' ? '0 VAC / без банов' : '0 VAC / Zero Bans'}</span>
        </div>

        {/* ── КНОПКИ ДЕЙСТВИЙ ── */}
        <div className="hero-cta-group mt-10">
          <button
            onClick={() => onNavigate && onNavigate('catalog')}
            className="cta-rarity-primary cursor-pointer"
          >
            <span>{t('hero_btn_catalog')}</span>
            <span className="cta-arrow">&rarr;</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('guarantees')}
            className="cta-rarity-secondary cursor-pointer"
          >
            <span className="cta-dot"></span>
            <span>{lang === 'ru' ? 'Как это работает' : 'How It Works'}</span>
          </button>
        </div>

      </div>

      {/* 2. Яркое свечение клинка (z-index: 3) */}
      <div className="hero-blade-glow"></div>

      {/* 3. Стеклянная панель статистики */}
      <div className="hero-stats-panel">
        <div className="stat-odometer">48,392</div>
        <div className="stat-status">
          <span className="live-dot-green"></span>
          <span>{lang === 'ru' ? 'ВСЕГО УСПЕШНЫХ ВЫДАЧ' : 'TOTAL SUCCESSFUL DELIVERIES'}</span>
        </div>
        <hr className="stat-hr" />
        <div className="stat-meta-line">
          &#9733; 4.96 / 5.0 &middot; {lang === 'ru' ? '2 410+ отзывов · ответ ~45 сек' : '2,410+ reviews · ~45s response'}
        </div>
      </div>

      {/* 4. Нож-бабочка */}
      <div className="hero-knife-container">
        <div className="hero-knife-floating-wrapper">
          <img
            src="/knife-final.png"
            alt="Butterfly Knife Marble Fade"
            className="hero-knife-img"
          />

          {/* SVG Glow Outline */}
          <svg
            viewBox={KNIFE_VIEWBOX}
            className="hero-knife-contour-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="knifeLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="25%" stopColor="#FFE072" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FF7E2A" stopOpacity="0.7" />
                <stop offset="85%" stopColor="#E8583A" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#E8583A" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={KNIFE_CONTOUR_PATH}
              pathLength="100"
              className="hero-knife-contour-laser"
            />
          </svg>
        </div>
      </div>

      {/* 7. Нижний бар платёжных систем */}
      <div className="hero-payments-dock">
        <div className="payment-icon-item visa-text">
          VISA
        </div>
        <div className="payment-icon-item flex items-center">
          <div className="w-5 h-5 rounded-full bg-[#EB001B]/90 -mr-2"></div>
          <div className="w-5 h-5 rounded-full bg-[#F79E1B]/90 mix-blend-screen"></div>
        </div>
        <div className="payment-icon-item flex items-center opacity-80">
          <div className="w-5 h-5 rounded-full bg-[#EB001B]/70 -mr-2"></div>
          <div className="w-5 h-5 rounded-full bg-[#00A2E8]/70 mix-blend-screen"></div>
        </div>
        <div className="payment-icon-item flex items-center gap-1.5 font-bold italic tracking-tight text-base">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.808 1.615 1.155 1.008 1.637 2.451 1.433 4.29-.447 4.02-3.14 6.273-7.03 6.273h-2.31l-1.393 8.847a.64.64 0 0 1-.633.541l-2.257-.229z" />
          </svg>
          <span>PayPal</span>
        </div>
        <div className="payment-icon-item">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.808 1.615 1.155 1.008 1.637 2.451 1.433 4.29-.447 4.02-3.14 6.273-7.03 6.273h-2.31l-1.393 8.847a.64.64 0 0 1-.633.541l-2.257-.229z" />
          </svg>
        </div>
        <div className="payment-icon-item flex items-center gap-1.5 lowercase font-medium text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <circle cx="12" cy="11" r="2.5" fill="currentColor" />
          </svg>
          <span>crypto</span>
        </div>
      </div>
    </section>
  );
};
