import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const HologramInspectDeck = ({ onSelectProduct, onNavigate }) => {
  const { lang } = useLanguage();
  const [activeLot, setActiveLot] = useState('karambit');
  const [floatSim, setFloatSim] = useState(0.0071);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const lots = {
    karambit: {
      id: 'item-102',
      tier: 'TIER 1 · CONTRABAND SPEC',
      name: 'KARAMBIT | DOPPLER',
      phase: 'Phase 2 (Max Pink Galaxy)',
      seed: 'Pattern #412',
      defaultFloat: 0.0071,
      minFloat: 0.001,
      maxFloat: 0.08,
      price: lang === 'ru' ? '2 890 ₽' : '$31.90',
      oldPrice: lang === 'ru' ? '3 600 ₽' : '$39.50',
      image: '/karambit-doppler.svg',
      glowColor: 'rgba(236, 72, 153, 0.4)',
      accentColor: '#EC4899',
      premierElo: '18,450 PTS',
      faceitElo: 'Level 9 (1,890 ELO)',
      hours: '1,890 hrs',
      medals: lang === 'ru' ? '7 медалей (2018-2025)' : '7 service medals',
      inactivity: lang === 'ru' ? '412 дней отлёги' : '412 days inactive',
      trust: '100% Green Trust',
      desc: lang === 'ru'
        ? 'Топовый лот для соревновательного мейна. Идеальный угол лезвия, редкий 0.007 Float, чистый Premier 18.4K и полная отлёга более года.'
        : 'Top-tier main competitive account. Perfect corner wear, rare 0.007 Float, clean 18.4K Premier rating and 1+ year inactivity.',
    },
    butterfly: {
      id: 'item-101',
      tier: 'PRESTIGE · 10-YR VETERAN',
      name: 'BUTTERFLY KNIFE | FADE',
      phase: '99.6% Full Fade (Max Purple)',
      seed: 'Pattern #763',
      defaultFloat: 0.0102,
      minFloat: 0.005,
      maxFloat: 0.07,
      price: lang === 'ru' ? '3 490 ₽' : '$38.50',
      oldPrice: lang === 'ru' ? '4 200 ₽' : '$46.00',
      image: '/knife-final.png',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      accentColor: '#F59E0B',
      premierElo: '21,200 PTS (Top 1%)',
      faceitElo: 'Level 10 (2,150 ELO)',
      hours: '2,450 hrs',
      medals: lang === 'ru' ? '10 медалей (10-Yr Coin)' : '10 medals (10-Yr Coin)',
      inactivity: lang === 'ru' ? '560+ дней отлёги' : '560+ days inactive',
      trust: '100% Green Trust',
      desc: lang === 'ru'
        ? 'Редчайший аккаунт с монетой 10-летнего ветерана. 99.6% Full Fade, высокий Premier ранг 21.2k и полная перепривязка на вашу почту.'
        : 'Ultra-rare account holding 10-Yr Veteran Coin. 99.6% Full Fade, high 21.2k Premier rating and 100% native email rebind.',
    },
    faceit: {
      id: 'item-103',
      tier: 'PRO HUB · READY TO COMPETE',
      name: 'CS2 PRIME | FACEIT LEVEL 10',
      phase: '2,480 ELO · Verified Clean',
      seed: 'First Letter Included',
      defaultFloat: 0.015,
      minFloat: 0.001,
      maxFloat: 0.1,
      price: lang === 'ru' ? '1 990 ₽' : '$21.90',
      oldPrice: lang === 'ru' ? '2 500 ₽' : '$27.50',
      image: '/cat-fullaccess.jpg',
      glowColor: 'rgba(96, 165, 250, 0.4)',
      accentColor: '#60A5FA',
      premierElo: 'Premier 20.5K',
      faceitElo: '2,480 ELO (Level 10)',
      hours: '3,200 hrs',
      medals: lang === 'ru' ? '5 медалей службы' : '5 service coins',
      inactivity: lang === 'ru' ? '280 дней отлёги' : '280 days inactive',
      trust: '100% Green Trust',
      desc: lang === 'ru'
        ? 'Турнирный аккаунт с подтвержденным 10 уровнем Faceit. Первая почта с регистрационным письмом и чеками в комплекте.'
        : 'Turnkey competitive account with verified Faceit Level 10. Native first email with welcome letter and receipts included.',
    },
    rust: {
      id: 'rust',
      tier: 'SURVIVAL · CLAN LEADER',
      name: 'RUST | 5,140H SPECIALIST',
      phase: 'Sunburn + Instruments + Drops',
      seed: 'All Rustafied Clean',
      defaultFloat: 0.02,
      minFloat: 0.001,
      maxFloat: 0.1,
      price: lang === 'ru' ? '990 ₽' : '$10.90',
      oldPrice: lang === 'ru' ? '1 400 ₽' : '$15.00',
      image: '/cat-rust.jpg',
      glowColor: 'rgba(234, 88, 12, 0.4)',
      accentColor: '#EA580C',
      premierElo: '5,140 Hours',
      faceitElo: 'Clean Steam ID',
      hours: '5,140 hrs',
      medals: 'Twitch Drops Set',
      inactivity: lang === 'ru' ? '190 дней отлёги' : '190 days inactive',
      trust: '0 Bans / Clean',
      desc: lang === 'ru'
        ? 'Идеальный аккаунт для клановых баталий. Огромное количество часов, редкие Twitch Drops скины и чистая история на серверах.'
        : 'Maxed-out account for clan wars. Massive verified playtime, exclusive Twitch Drops inventory and zero server bans.',
    },
  };

  const cur = lots[activeLot] || lots.karambit;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-b border-white/[0.08]">
      {/* ── ФОНОВОЕ АМБИЕНТ-СВЕЧЕНИЕ НА ВСЮ ШИРИНУ ЭКРАНА ── */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-full max-w-[1400px] rounded-full blur-[140px] opacity-30 transition-all duration-700"
        style={{ backgroundColor: cur.accentColor }}
      ></div>
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.05]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* ── ШИРОКАЯ ШАПКА ХРАНИЛИЩА ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.08] pb-8">
          <div>
            <div className="mb-3 flex items-center gap-3 font-mono text-xs font-bold tracking-[0.3em] uppercase">
              <span className="flex h-2.5 w-2.5 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[#E8583A] shadow-[0_0_12px_#E8583A] animate-ping"></span>
              </span>
              <span className="text-[#E8583A]">{lang === 'ru' ? 'ОРУЖЕЙНАЯ ПАЛАТА · ЖИВОЙ ОСМОТР' : 'TACTICAL VAULT · LIVE 3D INSPECT'}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/50">{lang === 'ru' ? 'ВЫСОКОРАНГОВЫЕ ЭКСПОНАТЫ' : 'HIGH-TIER INVENTORY'}</span>
            </div>

            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 0.92 }}
            >
              {lang === 'ru' ? 'ИНСПЕКТОР ЭКСПОНАТОВ' : 'LIVE ASSET INSPECTION'}
            </h2>
          </div>

          {/* Переключатель экспонатов в стиле турнирного HUD */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.1] bg-[#100F0E] p-1.5 shadow-2xl backdrop-blur-xl">
            {[
              { id: 'karambit', label: 'KARAMBIT DOPPLER', tag: 'P2' },
              { id: 'butterfly', label: 'BUTTERFLY FADE', tag: '99.6%' },
              { id: 'faceit', label: 'FACEIT 10', tag: '2.5K ELO' },
              { id: 'rust', label: 'RUST 5,140H', tag: 'RAID' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveLot(tab.id);
                  setFloatSim(lots[tab.id].defaultFloat);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                  activeLot === tab.id
                    ? 'bg-[#E8583A] text-white shadow-[0_0_20px_rgba(232,88,58,0.5)] scale-[1.02]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeLot === tab.id ? 'bg-black/30 text-white' : 'bg-white/[0.08] text-white/40'}`}>
                  {tab.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── ГЛАВНЫЙ СТЕНД ОСМОТРА (ШИРОКИЙ СТИЛЬ) ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          
          {/* ЛЕВАЯ ЧАСТЬ (7/12): 3D ГОЛОГРАММА И ИНСПЕКЦИЯ FLOAT */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            style={{ perspective: '1200px' }}
            className="lg:col-span-7 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-[#141210] to-[#0A0908] p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
          >
            {/* Градиентное свечение */}
            <div
              className="pointer-events-none absolute -inset-20 rounded-full blur-[100px] opacity-40 transition-all duration-700"
              style={{ backgroundColor: cur.accentColor }}
            ></div>

            {/* Верхний статус-бар лота */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] font-black tracking-wider text-[#E8583A] uppercase backdrop-blur-md">
                  {cur.tier}
                </span>
                <span className="font-mono text-xs text-white/50">{cur.seed}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-1 font-mono text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                <span>{cur.trust}</span>
              </div>
            </div>

            {/* 3D Интерактивное оружие */}
            <div className="relative z-10 my-10 flex items-center justify-center min-h-[260px]">
              <div
                className="relative flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                  transform: `rotateX(${-mousePos.y * 18}deg) rotateY(${mousePos.x * 24}deg) scale3d(1.08, 1.08, 1.08)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Ореол оружия */}
                <div
                  className="absolute h-52 w-80 rounded-full blur-3xl opacity-60"
                  style={{ backgroundColor: cur.accentColor }}
                ></div>

                <img
                  src={cur.image}
                  alt={cur.name}
                  className="relative z-10 max-h-64 w-auto max-w-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* СИМУЛЯТОР FLOAT VALUE (ИНТЕРАКТИВНЫЙ ПОЛЗУНОК) */}
            <div className="relative z-10 rounded-xl border border-white/[0.08] bg-black/50 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="text-white/60 uppercase">{lang === 'ru' ? 'ИНСПЕКТОР ИЗНОСА (FLOAT VALUE):' : 'WEAR INSPECTOR (FLOAT):'}</span>
                <span className="font-bold text-[#E8583A]">{floatSim.toFixed(4)} (Factory New)</span>
              </div>

              {/* Шкала износа CS2 (Factory New ➔ Battle-Scarred) */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-amber-600 to-red-600">
                <div
                  className="absolute top-0 bottom-0 w-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] transition-all duration-150"
                  style={{ left: `calc(${Math.min(floatSim * 800, 95)}% - 5px)` }}
                ></div>
              </div>

              <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-white/35">
                <span>0.00 FN</span>
                <span>0.07 MW</span>
                <span>0.15 FT</span>
                <span>0.38 WW</span>
                <span>1.00 BS</span>
              </div>
            </div>

          </div>

          {/* ПРАВАЯ ЧАСТЬ (5/12): ХАРАКТЕРИСТИКИ, РАНГ И ПОКУПКА */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/[0.12] bg-[#121110] p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
            
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8583A] mb-1">
                {cur.phase}
              </div>

              <h3
                className="font-black uppercase tracking-tight text-[#F3F1EC]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(28px, 2.6vw, 40px)', lineHeight: 1 }}
              >
                {cur.name}
              </h3>

              <p className="mt-3 font-sans text-sm text-white/65 leading-relaxed">
                {cur.desc}
              </p>

              {/* Сетка игровых паспортов (CS2 HUD Specs) */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'ru' ? 'ПРЕМЬЕР РЕЙТИНГ' : 'PREMIER ELO'}</span>
                  <span className="font-mono text-sm font-black text-[#E8583A] mt-1 block">{cur.premierElo}</span>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'ru' ? 'FACEIT СТАТУС' : 'FACEIT STATUS'}</span>
                  <span className="font-mono text-sm font-black text-[#F3F1EC] mt-1 block">{cur.faceitElo}</span>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'ru' ? 'НАИГРАНО ЧАСОВ' : 'PLAYED HOURS'}</span>
                  <span className="font-mono text-sm font-bold text-[#F3F1EC] mt-1 block">{cur.hours}</span>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'ru' ? 'ОТЛЁГА БЕЗ ВХОДА' : 'INACTIVITY'}</span>
                  <span className="font-mono text-sm font-bold text-emerald-400 mt-1 block">{cur.inactivity}</span>
                </div>
              </div>

              {/* Медали и сертификат */}
              <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'ru' ? 'МЕДАЛИ И ЗНАЧКИ' : 'MEDALS & COINS'}</span>
                  <span className="font-mono text-xs font-bold text-white/90 mt-0.5 block">{cur.medals}</span>
                </div>
                <span className="rounded bg-[#E8583A]/10 border border-[#E8583A]/30 px-2 py-1 font-mono text-[10px] font-bold text-[#E8583A]">
                  {lang === 'ru' ? 'РОДНАЯ ПОЧТА' : 'NATIVE EMAIL'}
                </span>
              </div>
            </div>

            {/* Нижний блок оформления заказа */}
            <div className="mt-8 border-t border-white/[0.1] pt-6">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <span className="font-mono text-xs text-white/40 uppercase mr-2">{lang === 'ru' ? 'ЦЕНА СО СКИДКОЙ:' : 'SPECIAL PRICE:'}</span>
                  <span className="font-mono text-3xl font-black text-[#F3F1EC]">{cur.price}</span>
                </div>
                <span className="font-mono text-sm line-through text-white/30">{cur.oldPrice}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct({ id: cur.id });
                  }}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#E8583A] py-3.5 font-sans text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(232,88,58,0.5)] transition-all hover:bg-[#ff6545] hover:shadow-[0_0_35px_rgba(232,88,58,0.8)] cursor-pointer"
                >
                  <span>{lang === 'ru' ? 'КУПИТЬ ЗА 3 СЕК' : 'BUY IN 3 SEC'}</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </button>

                <button
                  onClick={() => onNavigate('catalog')}
                  className="flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-white/80 transition-all hover:border-white/50 hover:bg-white/[0.08] hover:text-white cursor-pointer"
                >
                  <span>{lang === 'ru' ? 'ВЕСЬ КАТАЛОГ' : 'VIEW CATALOG'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
