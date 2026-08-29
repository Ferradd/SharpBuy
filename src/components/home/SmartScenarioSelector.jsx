import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SmartScenarioSelector = ({ onSelectProduct, onNavigate }) => {
  const { lang } = useLanguage();
  const [activeScenario, setActiveScenario] = useState('main');

  const scenarios = [
    {
      id: 'main',
      emoji: '🎯',
      label: lang === 'ru' ? 'ОСНОВНОЙ АККАУНТ (MAIN)' : 'MAIN COMPETITIVE ACCOUNT',
      tagline: lang === 'ru' ? 'Высокий Premier/Faceit ELO, медали ветерана, 100% зеленый Trust Factor и чистая история' : 'High Premier/Faceit ELO, service coins, 100% green trust factor & clean stats',
      products: [
        {
          id: 'item-101',
          name: 'CS2 PRIME · BUTTERFLY FADE',
          badge: 'TOP 1% ELO',
          rank: 'Premier 21,200 PTS',
          price: lang === 'ru' ? '3 490 ₽' : '$38.50',
          hours: '2,450 hrs',
          medals: '10 Coins (10-Yr Veteran)',
          trust: '100% Green Trust',
        },
        {
          id: 'item-102',
          name: 'CS2 PRIME · KARAMBIT DOPPLER',
          badge: 'PHASE 2',
          rank: 'Premier 18,450 PTS',
          price: lang === 'ru' ? '2 890 ₽' : '$31.90',
          hours: '1,890 hrs',
          medals: '7 Coins (2018-2025)',
          trust: '100% Green Trust',
        },
        {
          id: 'item-104',
          name: 'CS2 PRIME · 10-YR VETERAN COIN',
          badge: 'CLEAN MMR',
          rank: 'Premier 16,500 PTS',
          price: lang === 'ru' ? '2 190 ₽' : '$24.00',
          hours: '3,100 hrs',
          medals: '12 Coins & Badges',
          trust: '100% Green Trust',
        },
      ],
    },
    {
      id: 'rebind',
      emoji: '🛡️',
      label: lang === 'ru' ? 'ПОЛНЫЙ ДОСТУП (REBIND)' : '100% NATIVE REBIND',
      tagline: lang === 'ru' ? 'Первая почта + приветственное письмо от Steam + чеки пополнений. 0 шансов на возврат' : 'First registration email + Steam welcome letter + purchase receipts. Zero rollback risk',
      products: [
        {
          id: 'item-103',
          name: 'FULL ACCESS · FACEIT 10',
          badge: '2,480 ELO',
          rank: 'Faceit Level 10 Ready',
          price: lang === 'ru' ? '1 990 ₽' : '$21.90',
          hours: '3,200 hrs',
          medals: '5 Service Coins',
          trust: 'First Letter Included',
        },
        {
          id: 'item-105',
          name: 'FULL ACCESS · PREMIER 20K',
          badge: 'NATIVE EMAIL',
          rank: 'Premier 20,100 PTS',
          price: lang === 'ru' ? '2 490 ₽' : '$27.50',
          hours: '2,800 hrs',
          medals: '8 Service Coins',
          trust: 'First Letter Included',
        },
        {
          id: 'item-106',
          name: 'FULL ACCESS · CLEAN STARTER',
          badge: 'UNRANKED',
          rank: 'Placement Ready',
          price: lang === 'ru' ? '1 690 ₽' : '$18.50',
          hours: '1,200 hrs',
          medals: '3 Service Coins',
          trust: 'First Letter Included',
        },
      ],
    },
    {
      id: 'smurf',
      emoji: '⚡',
      label: lang === 'ru' ? 'БЮДЖЕТНЫЙ СМУРФ / ФАН' : 'BUDGET SMURF / CASUAL',
      tagline: lang === 'ru' ? 'Без прайма и переплат. Идеально для игры с друзьями, тренировки и разминки аима' : 'No-prime low-cost accounts. Ideal for playing with low-rank friends and warmups',
      products: [
        {
          id: 'item-107',
          name: 'CS2 NO-PRIME · 10 WINS READY',
          badge: 'CALIBRATION',
          rank: 'Placement Ready',
          price: lang === 'ru' ? '290 ₽' : '$3.20',
          hours: '450 hrs',
          medals: 'Clean History',
          trust: '0 VAC / Clean',
        },
        {
          id: 'item-108',
          name: 'CS2 NO-PRIME · FRESH STARTER',
          badge: 'FRESH MMR',
          rank: 'Clean Account',
          price: lang === 'ru' ? '190 ₽' : '$2.10',
          hours: '50 hrs',
          medals: 'Clean History',
          trust: '0 VAC / Clean',
        },
        {
          id: 'item-109',
          name: 'CS2 PRIME BUDGET · LOW ELO',
          badge: 'PRIME CHEAP',
          rank: 'Gold Nova / Silver',
          price: lang === 'ru' ? '890 ₽' : '$9.80',
          hours: '850 hrs',
          medals: '2 Coins',
          trust: '0 VAC / Clean',
        },
      ],
    },
    {
      id: 'rust',
      emoji: '🏕️',
      label: lang === 'ru' ? 'RUST РЕЙДЫ & ВЫЖИВАНИЕ' : 'RUST SURVIVAL & RAIDS',
      tagline: lang === 'ru' ? 'От 1,000 до 5,000 подтвержденных часов, DLC скины и доступ на все официальные сервера' : '1,000 to 5,000 verified hours, DLC item sets, clean access to Rustafied servers',
      products: [
        {
          id: 'item-110',
          name: 'RUST 5,000H · CLAN LEADER',
          badge: '5,140 HRS',
          rank: 'Official Servers Ready',
          price: lang === 'ru' ? '990 ₽' : '$10.90',
          hours: '5,140 hrs',
          medals: 'Sunburn DLC',
          trust: 'Rustafied Clean',
        },
        {
          id: 'item-111',
          name: 'RUST 2,500H · VETERAN',
          badge: '2,600 HRS',
          rank: 'PVP Specialist',
          price: lang === 'ru' ? '690 ₽' : '$7.60',
          hours: '2,600 hrs',
          medals: 'Twitch Drops',
          trust: 'Rustafied Clean',
        },
        {
          id: 'item-112',
          name: 'RUST 1,000H · STARTER',
          badge: '1,100 HRS',
          rank: 'Starter Base Ready',
          price: lang === 'ru' ? '490 ₽' : '$5.40',
          hours: '1,100 hrs',
          medals: 'Fresh Account',
          trust: 'Rustafied Clean',
        },
      ],
    },
  ];

  const current = scenarios.find((s) => s.id === activeScenario) || scenarios[0];

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-b border-white/[0.08]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* Заголовок */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.3em] text-[#E8583A] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
            <span>{lang === 'ru' ? 'ПОДБОРЩИК ПО СЦЕНАРИЮ' : 'SMART PLAYSTYLE MATCHER'}</span>
          </div>

          <h2
            className="font-black uppercase tracking-tight text-[#F3F1EC]"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 0.95 }}
          >
            {lang === 'ru' ? 'ВЫБЕРИ СВОЮ ИГРОВУЮ ЦЕЛЬ' : 'CHOOSE YOUR GAMING OBJECTIVE'}
          </h2>

          <p className="mt-3 text-sm text-white/60 font-sans leading-relaxed">
            {current.tagline}
          </p>
        </div>

        {/* Большие тактильные кнопки сценариев */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc.id)}
              className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 font-mono text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeScenario === sc.id
                  ? 'border-[#E8583A] bg-[#E8583A] text-white shadow-[0_0_25px_rgba(232,88,58,0.5)] scale-[1.02]'
                  : 'border-white/[0.1] bg-[#121110] text-white/70 hover:border-white/25 hover:text-white'
              }`}
            >
              <span className="text-base">{sc.emoji}</span>
              <span>{sc.label}</span>
            </button>
          ))}
        </div>

        {/* 3 Широкие карточки рекомендованных товаров под выбранный сценарий */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {current.products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                if (onSelectProduct) onSelectProduct({ id: prod.id });
              }}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#100F0E] p-7 transition-all duration-300 hover:border-[#E8583A]/70 hover:bg-[#151312] hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded bg-[#E8583A]/15 border border-[#E8583A]/30 px-2.5 py-1 font-mono text-[10px] font-black tracking-wider text-[#E8583A] uppercase">
                    {prod.badge}
                  </span>
                  <span className="font-mono text-xs text-white/50">
                    3s {lang === 'ru' ? 'выдача' : 'dispatch'}
                  </span>
                </div>

                <h4 className="font-sans text-lg font-black uppercase text-[#F3F1EC] group-hover:text-white transition-colors">
                  {prod.name}
                </h4>

                <div className="mt-4 space-y-1.5 font-mono text-xs text-white/55">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'РАНГ / СТАТУС:' : 'RANK / STATUS:'}</span>
                    <span className="font-bold text-[#F3F1EC]">{prod.rank}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'ЧАСЫ И МЕДАЛИ:' : 'HOURS & COINS:'}</span>
                    <span className="text-white/80">{prod.hours} · {prod.medals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'ГАРАНТИЯ:' : 'WARRANTY:'}</span>
                    <span className="text-[#E8583A] font-semibold">{prod.trust}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
                <span className="font-mono text-2xl font-black text-[#F3F1EC]">{prod.price}</span>
                <button className="flex items-center gap-2 rounded-lg bg-[#E8583A]/15 border border-[#E8583A]/40 px-3.5 py-1.5 font-mono text-xs font-bold text-[#E8583A] transition-all group-hover:bg-[#E8583A] group-hover:text-white">
                  <span>{lang === 'ru' ? 'КУПИТЬ' : 'BUY NOW'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Нижняя ссылка перехода */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'ru' ? 'Смотреть все доступные позиции в общем каталоге' : 'Browse all available positions in master catalog'}</span>
            <span className="text-[#E8583A]">&rarr;</span>
          </button>
        </div>

      </div>
    </section>
  );
};
