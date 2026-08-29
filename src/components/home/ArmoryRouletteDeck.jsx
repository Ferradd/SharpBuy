import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const ArmoryRouletteDeck = ({ onSelectProduct, onNavigate }) => {
  const { lang } = useLanguage();
  const [selectedTier, setSelectedTier] = useState('gold');

  const tiers = {
    gold: {
      id: 'item-102',
      tierName: 'SPECIAL RARE · GOLD TIER',
      tierBadge: '★ KNIFE GUARANTEED',
      badgeColor: '#FFD700',
      title: lang === 'ru' ? 'PRIME + ГАРАНТИРОВАННЫЙ НОЖ' : 'PRIME + GUARANTEED KNIFE',
      knifeName: 'Karambit / Butterfly / M9 Bayonet',
      subtitle: lang === 'ru'
        ? 'Аккаунт с гарантированным ножом в инвентаре, выслугой лет и чистым зеленым Trust Factor.'
        : 'Guaranteed knife skin in inventory, veteran tenure and 100% green trust factor.',
      price: lang === 'ru' ? '2 890 ₽' : '$31.90',
      oldPrice: lang === 'ru' ? '3 600 ₽' : '$39.50',
      image: '/karambit-doppler.svg',
      glow: 'rgba(255, 215, 0, 0.25)',
      accentColor: '#FFD700',
      inStock: 14,
      perks: [
        { label: lang === 'ru' ? 'ИНВЕНТАРЬ' : 'INVENTORY', val: lang === 'ru' ? 'Нож + скины' : 'Knife + Skins' },
        { label: lang === 'ru' ? 'ВЫСЛУГА' : 'TENURE', val: lang === 'ru' ? '5–10 лет Steam' : '5–10 Yrs Steam' },
        { label: lang === 'ru' ? 'ОТЛЁГА' : 'INACTIVITY', val: lang === 'ru' ? 'от 180 дней' : '180+ days' },
        { label: lang === 'ru' ? 'РЕЙТИНГ' : 'PREMIER ELO', val: '15,000–22,000' },
      ],
    },
    covert: {
      id: 'item-101',
      tierName: 'COVERT · RED TIER',
      tierBadge: 'TOP PREMIER ELO',
      badgeColor: '#EB001B',
      title: lang === 'ru' ? 'CS2 PRIME HIGH ELO (18K–24K)' : 'CS2 PRIME HIGH ELO (18K–24K)',
      knifeName: 'Butterfly Fade / Doppler / High MMR',
      subtitle: lang === 'ru'
        ? 'Для тех, кому нужен высокий соревновательный ранг, медали ветерана и калиброванные матчи.'
        : 'High competitive Premier rank, veteran operation badges and placement-ready MMR.',
      price: lang === 'ru' ? '2 490 ₽' : '$27.50',
      oldPrice: lang === 'ru' ? '3 100 ₽' : '$34.00',
      image: '/knife-final.png',
      glow: 'rgba(235, 0, 27, 0.25)',
      accentColor: '#EB001B',
      inStock: 28,
      perks: [
        { label: lang === 'ru' ? 'ПРЕМЬЕР' : 'PREMIER', val: '18.4K–24.0K PTS' },
        { label: lang === 'ru' ? 'МЕДАЛИ' : 'MEDALS', val: lang === 'ru' ? '5–10 медалей' : '5–10 coins' },
        { label: lang === 'ru' ? 'ЧАСЫ' : 'PLAYTIME', val: '2,000–4,000 hrs' },
        { label: lang === 'ru' ? 'ТРАСТ' : 'TRUST FACTOR', val: '100% Green' },
      ],
    },
    classified: {
      id: 'item-103',
      tierName: 'CLASSIFIED · PURPLE TIER',
      tierBadge: '100% FULL REBIND',
      badgeColor: '#A855F7',
      title: lang === 'ru' ? 'FULL ACCESS + РОДНАЯ ПОЧТА' : 'FULL ACCESS + NATIVE EMAIL',
      knifeName: 'Faceit 8-10 Level / Rebind Ready',
      subtitle: lang === 'ru'
        ? 'Полная перепривязка на вашу личную почту. В комплекте родная первая почта и чеки Steam.'
        : '100% native transfer to your personal email with first welcome letter and receipts.',
      price: lang === 'ru' ? '1 990 ₽' : '$21.90',
      oldPrice: lang === 'ru' ? '2 500 ₽' : '$27.50',
      image: '/cat-fullaccess.jpg',
      glow: 'rgba(168, 85, 247, 0.25)',
      accentColor: '#A855F7',
      inStock: 42,
      perks: [
        { label: lang === 'ru' ? 'ПОЧТА' : 'EMAIL ACCESS', val: lang === 'ru' ? 'Родная с письмом' : 'Native + First Letter' },
        { label: lang === 'ru' ? 'FACEIT' : 'FACEIT ELO', val: 'Level 8–10 Ready' },
        { label: lang === 'ru' ? 'ЧЕКИ' : 'RECEIPTS', val: lang === 'ru' ? 'В комплекте' : 'Included' },
        { label: lang === 'ru' ? 'ГАРАНТИЯ' : 'WARRANTY', val: lang === 'ru' ? 'Пожизненно' : 'Lifetime' },
      ],
    },
    milspec: {
      id: 'item-107',
      tierName: 'MIL-SPEC · BLUE TIER',
      tierBadge: 'SMURF & UNRANKED',
      badgeColor: '#3B82F6',
      title: lang === 'ru' ? 'CS2 БЮДЖЕТНЫЙ СМУРФ' : 'CS2 BUDGET SMURF / NO-PRIME',
      knifeName: 'Clean MMR / Placement Ready',
      subtitle: lang === 'ru'
        ? 'Чистый аккаунт для разминки, калибровки, игры с друзьями и тренировок без риска.'
        : 'Clean unranked accounts for casual warmup games with friends and aim practice.',
      price: lang === 'ru' ? '290 ₽' : '$3.20',
      oldPrice: lang === 'ru' ? '450 ₽' : '$5.00',
      image: '/cat-unprime.jpg',
      glow: 'rgba(59, 130, 246, 0.25)',
      accentColor: '#3B82F6',
      inStock: 185,
      perks: [
        { label: lang === 'ru' ? 'СТАТУС' : 'STATUS', val: lang === 'ru' ? 'Чистый 0 VAC' : 'Clean 0 VAC' },
        { label: lang === 'ru' ? 'РЕЖИМ' : 'MODE', val: lang === 'ru' ? 'Калибровка' : 'Placement Ready' },
        { label: lang === 'ru' ? 'ПРИВЯЗКА' : 'BINDINGS', val: lang === 'ru' ? 'Свободна' : 'Instant Change' },
        { label: lang === 'ru' ? 'ВЫДАЧА' : 'DISPATCH', val: '3 sec' },
      ],
    },
  };

  const cur = tiers[selectedTier] || tiers.gold;

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-b border-white/[0.08]">
      {/* Мягкое фоновое неоновое свечение на всю ширину */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-full max-w-[1400px] rounded-full blur-[150px] opacity-25 transition-all duration-700"
        style={{ backgroundColor: cur.accentColor }}
      ></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* ── ШАПКА РАЗДЕЛА: ТУРНИРНЫЙ ОРУЖЕЙНЫЙ КЕЙС ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3 font-mono text-xs font-bold tracking-[0.3em] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#E8583A] shadow-[0_0_10px_#E8583A] animate-pulse"></span>
              <span className="text-[#E8583A]">{lang === 'ru' ? 'ОРУЖЕЙНЫЙ СТОК · УРОВНИ РЕДКОСТИ' : 'LIVE ARMORY · RARITY TIERS'}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/50">{lang === 'ru' ? 'ГАРАНТИЯ ВЫДАЧИ' : 'VERIFIED INVENTORY'}</span>
            </div>

            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(36px, 4.5vw, 60px)', lineHeight: 0.95 }}
            >
              {lang === 'ru' ? 'ВЫБЕРИТЕ УРОВЕНЬ АККАУНТА' : 'SELECT YOUR ACCOUNT TIER'}
            </h2>
          </div>

          {/* Переключатель уровней редкости CS2 */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.1] bg-[#121110] p-1.5 shadow-2xl backdrop-blur-xl">
            {[
              { id: 'gold', label: '★ GOLD (НОЖИ)', color: '#FFD700' },
              { id: 'covert', label: 'COVERT (HIGH ELO)', color: '#EB001B' },
              { id: 'classified', label: 'CLASSIFIED (REBIND)', color: '#A855F7' },
              { id: 'milspec', label: 'MIL-SPEC (SMURF)', color: '#3B82F6' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTier(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                  selectedTier === tab.id
                    ? 'text-black shadow-lg scale-[1.02]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
                style={{
                  backgroundColor: selectedTier === tab.id ? tab.color : 'transparent',
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedTier === tab.id ? '#000' : tab.color }}></span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── БОЛЬШОЙ ТАКТИЧЕСКИЙ СТЕНД ЭКСПОНАТА ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          
          {/* ЛЕВАЯ КОЛОНКА (7/12): ВИЗУАЛЬНЫЙ ТАКТИЧЕСКИЙ ПОДИУМ */}
          <div className="lg:col-span-7 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-[#141210] to-[#0A0908] p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
            
            {/* Верхний статус-бар */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="rounded-md px-3 py-1 font-mono text-[11px] font-black tracking-wider text-black uppercase"
                  style={{ backgroundColor: cur.accentColor }}
                >
                  {cur.tierBadge}
                </span>
                <span className="font-mono text-xs text-white/50">{cur.tierName}</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-1 font-mono text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                <span>{cur.inStock} {lang === 'ru' ? 'шт в наличии' : 'in stock'}</span>
              </div>
            </div>

            {/* Изображение трофея */}
            <div className="relative z-10 my-10 flex items-center justify-center min-h-[260px]">
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute h-48 w-80 rounded-full blur-3xl opacity-50"
                  style={{ backgroundColor: cur.accentColor }}
                ></div>

                <img
                  src={cur.image}
                  alt={cur.title}
                  className="relative z-10 max-h-64 w-auto max-w-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* Нижний тег подлинности */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-xs text-white/40">
              <span>✦ {lang === 'ru' ? 'АВТОМАТИЧЕСКАЯ ПРОВЕРКА 0 VAC ПЕРЕД ВЫДАЧЕЙ' : '100% AUTOMATED 0 VAC PRE-CHECK'}</span>
              <span className="text-emerald-400 font-bold">● 100% READY</span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (5/12): СПЕЦИФИКАЦИЯ И МГНОВЕННЫЙ ЗАКАЗ */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/[0.12] bg-[#121110] p-8 lg:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
            
            <div>
              <div
                className="font-mono text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: cur.accentColor }}
              >
                {cur.tierName}
              </div>

              <h3
                className="font-black uppercase tracking-tight text-[#F3F1EC]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(28px, 2.6vw, 38px)', lineHeight: 1.05 }}
              >
                {cur.title}
              </h3>

              <p className="mt-3 font-sans text-sm text-white/65 leading-relaxed">
                {cur.subtitle}
              </p>

              {/* Сетка характеристик */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {cur.perks.map((p, idx) => (
                  <div key={idx} className="rounded-lg border border-white/[0.06] bg-[#0E0D0C] p-3">
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block">{p.label}</span>
                    <span className="font-mono text-sm font-black text-[#F3F1EC] mt-1 block">{p.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Блок цены и оформления */}
            <div className="mt-8 border-t border-white/[0.1] pt-6">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <span className="font-mono text-xs text-white/40 uppercase mr-2">{lang === 'ru' ? 'СТОИМОСТЬ:' : 'PRICE:'}</span>
                  <span className="font-mono text-3xl font-black text-[#F3F1EC]">{cur.price}</span>
                </div>
                <span className="font-mono text-sm line-through text-white/30">{cur.oldPrice}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct({ id: cur.id });
                  }}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#E8583A] py-3.5 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(232,88,58,0.5)] transition-all hover:bg-[#ff6545] cursor-pointer"
                >
                  <span>{lang === 'ru' ? 'КУПИТЬ В 1 КЛИК' : '1-CLICK BUY'}</span>
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
