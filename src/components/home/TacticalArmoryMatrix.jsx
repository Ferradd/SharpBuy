import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const TacticalArmoryMatrix = ({ onSelectCategory, onNavigate }) => {
  const { lang } = useLanguage();

  const tiers = [
    {
      id: 'cs2nfa',
      code: 'LOCKER // 01',
      title: 'PRIME PREMIER & HIGH ELO',
      badge: 'TOP COMPETITIVE',
      badgeColor: '#E8583A',
      desc: lang === 'ru' ? 'Аккаунты с рангами 15,000–23,000 ELO в CS2 Premier, медалями ветерана и отлёгой от 1 года.' : 'Competitive Premier 15k-23k rating accounts, veteran service coins and 1+ year inactivity.',
      stats: [
        { label: lang === 'ru' ? 'В СТОКЕ' : 'IN STOCK', val: '247 шт' },
        { label: lang === 'ru' ? 'ОТЛЕГА' : 'INACTIVITY', val: '60–600 дн' },
        { label: lang === 'ru' ? 'ЦЕНА' : 'PRICE', val: lang === 'ru' ? 'от 890 ₽' : 'from $9.80' },
      ],
      tags: ['Premier 20k+', '10-Yr Coin', 'Green Trust'],
      accentColor: '#E8583A',
      image: '/cat-prime.jpg',
    },
    {
      id: 'cs2full',
      code: 'LOCKER // 02',
      title: 'FULL ACCESS 100% REBIND',
      badge: 'LIFETIME SHIELD',
      badgeColor: '#60A5FA',
      desc: lang === 'ru' ? 'Полная перепривязка на вашу личную почту. В комплекте родная первая почта и чек первой покупки.' : '100% full transfer to your personal email. Native registration email and first receipt record included.',
      stats: [
        { label: lang === 'ru' ? 'В СТОКЕ' : 'IN STOCK', val: '89 шт' },
        { label: lang === 'ru' ? 'ГАРАНТИЯ' : 'WARRANTY', val: lang === 'ru' ? '100% Пожизненно' : 'Lifetime' },
        { label: lang === 'ru' ? 'ЦЕНА' : 'PRICE', val: lang === 'ru' ? 'от 1 690 ₽' : 'from $18.50' },
      ],
      tags: ['First Letter', 'Receipts', '0 Reversals'],
      accentColor: '#60A5FA',
      image: '/cat-fullaccess.jpg',
    },
    {
      id: 'cs2noprime',
      code: 'LOCKER // 03',
      title: 'CS2 SMURF & UNRANKED',
      badge: 'BUDGET ENTRY',
      badgeColor: '#94A3B8',
      desc: lang === 'ru' ? 'Чистые аккаунты без привязок для комфортной игры с друзьями, калибровки и фана.' : 'Clean accounts without bindings for casual games with friends, aim calibration, and smurfing.',
      stats: [
        { label: lang === 'ru' ? 'В СТОКЕ' : 'IN STOCK', val: '310 шт' },
        { label: lang === 'ru' ? 'БАНЫ' : 'VAC BANS', val: '0 (CLEAN)' },
        { label: lang === 'ru' ? 'ЦЕНА' : 'PRICE', val: lang === 'ru' ? 'от 190 ₽' : 'from $2.10' },
      ],
      tags: ['Fresh MMR', 'No Bans', 'Fast 3s'],
      accentColor: '#94A3B8',
      image: '/cat-unprime.jpg',
    },
    {
      id: 'rust',
      code: 'LOCKER // 04',
      title: 'RUST 5,000H & CLAN RAID',
      badge: 'RAID READY',
      badgeColor: '#EA580C',
      desc: lang === 'ru' ? 'Прокачанные профили с 1,000–5,000 часами, DLC скинами и доступом на любые официальные сервера.' : 'Maxed out profiles with 1,000–5,000 hours, DLC items, and full access to official Rustafied servers.',
      stats: [
        { label: lang === 'ru' ? 'В СТОКЕ' : 'IN STOCK', val: '74 шт' },
        { label: lang === 'ru' ? 'ЧАСЫ' : 'HOURS', val: '1k–5k hrs' },
        { label: lang === 'ru' ? 'ЦЕНА' : 'PRICE', val: lang === 'ru' ? 'от 990 ₽' : 'from $10.90' },
      ],
      tags: ['Sunburn DLC', 'Rustafied Clean', 'Twitch Drops'],
      accentColor: '#EA580C',
      image: '/cat-rust.jpg',
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#0A0A09] py-20 text-[#F3F1EC]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* Заголовок */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="mb-2 flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.25em] text-[#E8583A] uppercase">
              <span className="h-1.5 w-6 bg-[#E8583A]"></span>
              <span>{lang === 'ru' ? 'ТАКТИЧЕСКАЯ МАТРИЦА ХРАНИЛИЩА' : 'TACTICAL ARMORY MATRIX'}</span>
            </div>
            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 0.95 }}
            >
              {lang === 'ru' ? 'ОРУЖЕЙНЫЕ ЛОКЕРЫ СТОКА' : 'VAULT INVENTORY LOCKERS'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-bold text-white/80 transition-all hover:border-[#E8583A] hover:text-white cursor-pointer"
          >
            <span>{lang === 'ru' ? 'ОТКРЫТЬ ВСЕ 1 057 ПОЗИЦИЙ' : 'BROWSE ALL 1,057 ITEMS'}</span>
            <span className="text-[#E8583A]">&rarr;</span>
          </button>
        </div>

        {/* Сетка из 4 широких оружейных ячеек */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectCategory(t.id)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.1] bg-[#121110] p-7 transition-all duration-300 hover:border-white/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer"
            >
              {/* Атмосферный фон */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-40"
                style={{ backgroundImage: `url('${t.image}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/85 to-transparent"></div>

              {/* Верхняя маркировка */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] font-bold text-white/40 tracking-widest uppercase">
                  {t.code}
                </span>
                <span
                  className="rounded px-2.5 py-0.5 font-mono text-[10px] font-black text-black uppercase"
                  style={{ backgroundColor: t.badgeColor }}
                >
                  {t.badge}
                </span>
              </div>

              {/* Название */}
              <div className="relative z-10 mb-6">
                <h3 className="font-sans text-xl font-black uppercase text-[#F3F1EC] group-hover:text-white transition-colors">
                  {t.title}
                </h3>
                <p className="mt-2.5 font-sans text-xs text-white/65 leading-relaxed">
                  {t.desc}
                </p>

                {/* Теги */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.tags.map((tg, i) => (
                    <span key={i} className="rounded bg-black/50 border border-white/[0.08] px-2 py-0.5 font-mono text-[10px] text-white/70">
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Нижняя аналитика */}
              <div className="relative z-10 border-t border-white/[0.08] pt-5">
                <div className="grid grid-cols-3 gap-2 font-mono text-center mb-4">
                  {t.stats.map((st, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[9px] text-white/40 uppercase">{st.label}</span>
                      <span className="text-xs font-black text-[#F3F1EC] mt-0.5">{st.val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#E8583A] group-hover:text-white transition-colors">
                  <span>{lang === 'ru' ? 'ПЕРЕЙТИ К ЛОТАМ' : 'VIEW INVENTORY'}</span>
                  <span className="transition-transform group-hover:translate-x-1.5">&rarr;</span>
                </div>
              </div>

              {/* Неоновый индикатор внизу */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: t.accentColor }}
              ></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
