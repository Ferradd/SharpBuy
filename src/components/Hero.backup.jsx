import React from 'react';

export const HeroBackup = () => {
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
          <span>PREMIUM MARKETPLACE &middot; STEAM &amp; CS2</span>
        </div>

        {/* ── ГЛАВНЫЙ ЗАГОЛОВОК ── */}
        <div className="flex flex-col items-start" style={{ paddingTop: 'clamp(36px, 3.6vw, 64px)' }}>

          {/* ВЕРХНИЙ ЯРУС */}
          <div className="flex items-start">
            {/* АККАУНТЫ — scaleY ТОЛЬКО на это слово */}
            <span
              className="block origin-bottom scale-y-[1.7] font-black leading-none tracking-tighter uppercase text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(54px, 7vw, 120px)', fontWeight: 700 }}
            >
              АККАУНТЫ
            </span>

            {/* Правая пристройка — прибита к ВЕРХУ АККАУНТЫ через items-start на родителе */}
            <div className="ml-5 flex flex-col items-start">
              {/* Тире — крупное, на уровне верхушки АККАУНТЫ */}
              <span
                className="font-black leading-none text-[#F3F1EC] block"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(32px, 4vw, 70px)', fontWeight: 700 }}
              >
                &mdash;
              </span>
              {/* КОТОРЫМ — маленькое (~40% от АККАУНТЫ), служебная связка */}
              <span
                className="font-bold leading-none uppercase text-[#F3F1EC] block"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(18px, 2.2vw, 38px)', fontWeight: 600, marginTop: '0.15em' }}
              >
                КОТОРЫМ
              </span>
            </div>
          </div>

          {/* НИЖНИЙ ЯРУС — комфортный зазор под строкой «АККАУНТЫ» */}
          <div
            className="mt-2 flex items-baseline leading-none"
            style={{ gap: 'clamp(10px, 1.2vw, 20px)' }}
          >
            <span
              className="font-black leading-none tracking-tighter uppercase text-[#F3F1EC] block"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(54px, 7vw, 120px)', fontWeight: 700 }}
            >
              МОЖНО
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
              ВЕРИТЬ.
            </span>
          </div>

        </div>

        {/* Описание — mt-12 */}
        <p className="hero-subtitle mt-12">
          Проверенные Steam и CS2 аккаунты с автовыдачей,
          честной гарантией и открытой историей каждой сделки.
        </p>

        {/* Преимущества — mt-8 */}
        <div className="hero-features mt-8">
          <span>Автовыдача &middot; <strong className="feature-highlight">3 сек</strong></span>
          <span className="feature-sep">|</span>
          <span>Гарантия &middot; <strong className="feature-highlight">до 30 дней</strong></span>
          <span className="feature-sep">|</span>
          <span className="feature-highlight">0 VAC / без банов</span>
        </div>

        {/* Кнопки — mt-12 */}
        <div className="hero-cta-group mt-12">
          <a href="#catalog" className="cta-btn-primary">
            Смотреть каталог &rarr;
          </a>
          <a href="#how-it-works" className="cta-btn-secondary">
            Как это работает
          </a>
        </div>

      </div>

      {/* 2. Яркое свечение клинка (z-index: 3) */}
      <div className="hero-blade-glow"></div>

      {/* 3. Стеклянная панель статистики (z-index: 5 — позади ножа) */}
      <div className="hero-stats-panel">
        <div className="stat-odometer">48,392</div>
        <div className="stat-status">
          <span className="live-dot-green"></span>
          <span>ВСЕГО УСПЕШНЫХ ВЫДАЧ</span>
        </div>
        <hr className="stat-hr" />
        <div className="stat-meta-line">
          &#9733; 4.96 / 5.0 &middot; 2 410+ отзывов &middot; ответ ~45 сек
        </div>
      </div>

      {/* 4. Нож-бабочка (z-index: 20 — поверх панели статистики) */}
      <div className="hero-knife-container">
        <img
          src="/knife-final.png"
          alt="Нож-бабочка Marble Fade"
          className="hero-knife-img"
        />
      </div>

      {/* 5. Подпись предмета (z-index: 22) */}
      <div className="hero-item-caption">
        Нож-бабочка &middot; Marble Fade &mdash; от 890 &#8381;
      </div>

      {/* 6. Радар CS2 и таймер (z-index: 35 — правый нижний угол) */}
      <div className="hero-radar-corner">
        <div className="radar-timer-label">
          <span className="live-dot-orange"></span>
          <span>13:11</span>
        </div>
        <div className="radar-box">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <rect width="160" height="160" fill="#0c1815" />
            <path d="M0 0h160v160H0z" fill="url(#radarGrid)" />
            <path
              d="M20 25 h35 v30 h-20 v40 h-15 z M65 20 h75 v35 h-35 v25 h40 v55 h-50 v-30 h-30 z M45 105 h40 v40 h-40 z"
              fill="none"
              stroke="#2f574d"
              strokeWidth="4"
              strokeLinejoin="round"
              opacity="0.85"
            />
            <path
              d="M70 60 h25 v25 h-25 z"
              fill="#183d34"
              stroke="#437d6e"
              strokeWidth="2"
            />
            <text x="75" y="77" fill="#4ade80" fontSize="11" fontWeight="bold" fontFamily="sans-serif">A</text>
            <text x="35" y="130" fill="#4ade80" fontSize="11" fontWeight="bold" fontFamily="sans-serif">B</text>
            <circle cx="78" cy="42" r="3.5" fill="#facc15" />
            <circle cx="88" cy="48" r="3.5" fill="#facc15" />
            <circle cx="120" cy="95" r="3.5" fill="#fb923c" />
            <circle cx="128" cy="102" r="3.5" fill="#fb923c" />
            <circle cx="45" cy="50" r="3.5" fill="#38bdf8" />
            <circle cx="55" cy="120" r="3.5" fill="#38bdf8" />
            <polygon points="78,42 84,36 80,48" fill="#ffffff" opacity="0.9" />
            <defs>
              <pattern id="radarGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#163830" strokeWidth="0.8" opacity="0.4" />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>

      {/* 7. Нижний бар платёжных систем (z-index: 30) */}
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
