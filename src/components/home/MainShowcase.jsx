import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PRODUCTS } from '../../data/mockData';

export const MainShowcase = ({ onSelectProduct, onNavigate, onSelectCategory }) => {
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const isEn = lang === 'en';
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleSync = () => setTick((t) => t + 1);
    window.addEventListener('sharpbuy-stock-synced', handleSync);
    return () => window.removeEventListener('sharpbuy-stock-synced', handleSync);
  }, []);

  const getPrice = (id, fallback) => {
    const found = PRODUCTS.find((p) => p.id === id);
    return found ? found.price : fallback;
  };

  const getOldPrice = (id, fallback) => {
    const found = PRODUCTS.find((p) => p.id === id);
    return found ? found.oldPrice : fallback;
  };

  const products = [
    {
      id: '1776000000001',
      tag: 'CS2 PRIME',
      category: 'PRIME',
      name: isEn ? 'CS2 PRIME · PREMIER UNLOCKED' : 'CS2 PRIME (PREMIER КАЛИБРОВКА)',
      subtitle: isEn ? 'Prime enabled · 18+ days inactive · Clean trust' : 'Prime активен · Отлёжка 18+ дней · Чистый траст',
      priceRub: 50,
      oldPriceRub: 120,
      image: '/products/cs2_prime_unranked_cover.jpeg',
      badge: 'TOP PREMIER',
      badgeBg: '#E8583A',
      specs: [
        { label: isEn ? 'RANK' : 'РАНГ', val: isEn ? 'Unranked' : 'Калибровка' },
        { label: isEn ? 'INACTIVE' : 'ОТЛЁЖКА', val: isEn ? '18+ days' : '18+ дн.' },
        { label: isEn ? 'HOURS' : 'ЧАСЫ', val: isEn ? '24 hrs' : '24 ч.' },
        { label: isEn ? 'PRIME' : 'ПРАЙМ', val: '100% Active' },
      ],
    },
    {
      id: '1776000000002',
      tag: 'CS2 PRIME',
      category: 'PRIME',
      name: isEn ? 'CS2 PREMIER READY · COMPETITIVE' : 'CS2 PREMIER READY (ОТКРЫТ ПРЕМЬЕР)',
      subtitle: isEn ? 'Ready for Premier matchmaking · Jump straight in' : 'Готов для Premier матчей сразу после входа',
      priceRub: 89,
      oldPriceRub: 180,
      image: '/products/cs2_nfa_premier_calib.jpeg',
      badge: 'PREMIER READY',
      badgeBg: '#34D399',
      specs: [
        { label: isEn ? 'MODE' : 'РЕЖИМ', val: 'Premier Ready' },
        { label: isEn ? 'INACTIVE' : 'ОТЛЁЖКА', val: isEn ? '25+ days' : '25+ дн.' },
        { label: isEn ? 'HOURS' : 'ЧАСЫ', val: isEn ? '150 hrs' : '150 ч.' },
        { label: isEn ? 'BANS' : 'БАНЫ', val: isEn ? '0 (Clean)' : '0 (Чисто)' },
      ],
    },
    {
      id: '1776000000003',
      tag: 'MEDALS',
      category: 'MEDALS',
      name: isEn ? 'CS2 5+ MEDALS · PREMIER UNLOCKED' : 'CS2 PRIME (5+ МЕДАЛЕЙ + ПРЕМЬЕР)',
      subtitle: isEn ? '5+ service medals & coins · Premier unlocked' : '5+ медалей за службу · Открыт Премьер',
      priceRub: 119,
      oldPriceRub: 240,
      image: '/products/cs2_nfa_medals_4plus.jpeg',
      badge: '5+ MEDALS',
      badgeBg: '#F59E0B',
      specs: [
        { label: isEn ? 'MEDALS' : 'МЕДАЛИ', val: isEn ? '5+ Medals' : '5+ медалей' },
        { label: isEn ? 'INACTIVE' : 'ОТЛЁЖКА', val: isEn ? '40+ days' : '40+ дн.' },
        { label: isEn ? 'HOURS' : 'ЧАСЫ', val: isEn ? '850 hrs' : '850 ч.' },
        { label: isEn ? 'PREMIER' : 'ПРЕМЬЕР', val: isEn ? 'Unlocked' : 'Открыт' },
      ],
    },
    {
      id: '1776000000009',
      tag: 'KNIFE & SKINS',
      category: 'KNIFE & SKINS',
      name: isEn ? 'CS2 KNIFE / GLOVE GUARANTEED' : 'CS2 АККАУНТ С НОЖОМ / ПЕРЧАТКАМИ',
      subtitle: isEn ? 'Guaranteed knife or gloves in CS2 inventory' : 'Гарантированный нож или перчатки в инвентаре',
      priceRub: 349,
      oldPriceRub: 690,
      image: '/products/cs2_nfa_knife_gloves_bundle.jpeg',
      badge: 'KNIFE / GLOVE',
      badgeBg: '#EC4899',
      specs: [
        { label: isEn ? 'ITEM' : 'ПРЕДМЕТ', val: isEn ? 'Knife / Glove' : 'Нож / Перчатки' },
        { label: isEn ? 'INACTIVE' : 'ОТЛЁЖКА', val: isEn ? '50+ days' : '50+ дн.' },
        { label: isEn ? 'HOURS' : 'ЧАСЫ', val: isEn ? '2,200 hrs' : '2 200 ч.' },
        { label: isEn ? 'INVENTORY' : 'ИНВЕНТАРЬ', val: '$50–$350+' },
      ],
    },
  ];

  const filtered = activeFilter === 'ALL'
    ? products
    : products.filter((p) => p.category === activeFilter);

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#0A0A09] pt-16 pb-20 text-[#F3F1EC]">
      {/* Мягкий плавный переход сверху из Hero */}
      <div className="pointer-events-none absolute -top-24 left-0 right-0 h-28 bg-gradient-to-b from-[#0E0D0C] via-[#0E0D0C]/80 to-[#0A0A09]"></div>
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.05]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* ── ШАПКА ВИТРИНЫ ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3 font-mono text-xs font-bold tracking-[0.25em] text-[#E8583A] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#E8583A] shadow-[0_0_10px_#E8583A]"></span>
              <span>{isEn ? 'TOP ARSENAL · 3-SECOND DISPATCH' : 'ВИТРИНА ТОВАРОВ · МГНОВЕННАЯ АВТОВЫДАЧА'}</span>
            </div>

            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(38px, 4.5vw, 60px)', lineHeight: 0.95 }}
            >
              {isEn ? 'FEATURED SHOWCASE' : 'ТОП ПРОДАЖ АРСЕНАЛА'}
            </h2>
          </div>

          {/* Фильтры категорий */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: isEn ? 'ALL (1,057)' : 'ВСЕ (1 057)' },
              { id: 'PRIME', label: 'CS2 PRIME' },
              { id: 'MEDALS', label: isEn ? 'MEDALS' : 'МЕДАЛИ' },
              { id: 'KNIFE & SKINS', label: isEn ? 'KNIFE & SKINS' : 'НОЖИ И СКИНЫ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-lg px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                  activeFilter === tab.id
                    ? 'bg-[#E8583A] text-white shadow-[0_0_15px_rgba(232,88,58,0.4)]'
                    : 'bg-[#141211] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── СЕТКА 4 БОЛЬШИХ ФЛАГМАНСКИХ КАРТОЧЕК ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectProduct) onSelectProduct(item.id);
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.1] bg-[#121110] p-6 transition-all duration-300 hover:border-[#E8583A]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer"
            >
              <div>
                {/* Верхний бейдж */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="rounded px-2.5 py-0.5 font-mono text-[10px] font-black text-black uppercase"
                    style={{ backgroundColor: item.badgeBg }}
                  >
                    {item.badge}
                  </span>
                  <span className="font-mono text-xs text-white/50">{isEn ? 'Instant ~3s Delivery' : 'Автовыдача ~3 сек'}</span>
                </div>

                {/* Центр: Изображение трофея 4:3 */}
                <div className="relative my-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/[0.06]">
                  <div
                    className="absolute h-32 w-48 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70"
                    style={{ backgroundColor: item.badgeBg }}
                  ></div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="relative z-10 h-full w-full object-cover filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Заголовок и подзаголовок */}
                <h3 className="font-sans text-base font-black uppercase text-[#F3F1EC] group-hover:text-white transition-colors">
                  {item.name}
                </h3>
                <p className="mt-1 font-sans text-xs text-white/55 leading-snug">
                  {item.subtitle}
                </p>

                {/* Сетка характеристик */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 font-mono text-xs">
                  {item.specs.map((sp, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-[9px] text-white/40 uppercase">{sp.label}</span>
                      <span className="text-[11px] font-bold text-[#F3F1EC] mt-0.5">{sp.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Нижняя строка цены и покупки */}
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
                <div>
                  <span className="font-mono text-xl font-black text-[#F3F1EC]">
                    {formatPrice(getPrice(item.id, item.priceRub))}
                  </span>
                  <span className="font-mono text-[11px] line-through text-white/30 ml-2">
                    {formatPrice(getOldPrice(item.id, item.oldPriceRub))}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectProduct) onSelectProduct(item.id);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#E8583A] px-3.5 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-[#ff6545] cursor-pointer"
                >
                  <span>{isEn ? 'BUY' : 'КУПИТЬ'}</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Нижняя цветная полоска при hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: item.badgeBg }}
              ></div>
            </div>
          ))}
        </div>

        {/* Нижний призыв к полному каталогу */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/[0.1] bg-gradient-to-r from-[#181615] via-[#141211] to-[#181615] p-6 lg:p-8">
          <div>
            <h3 className="font-sans text-xl font-black uppercase text-[#F3F1EC]">
              {isEn ? 'NEED A SPECIFIC RANK, GAME OR INVENTORY?' : 'НУЖЕН ДРУГОЙ РАНГ, ИГРА ИЛИ БЮДЖЕТ?'}
            </h3>
            <p className="mt-1 font-sans text-xs text-white/60">
              {isEn
                ? 'Over 1,057 verified items available with 30-day warranty and instant 3-second delivery.'
                : 'В нашем каталоге доступно 1 057 проверенных позиций с гарантией и моментальной автовыдачей.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="mt-4 sm:mt-0 flex items-center justify-center gap-2 rounded-xl bg-[#E8583A] px-6 py-3.5 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(232,88,58,0.4)] transition-all hover:bg-[#ff6545] cursor-pointer shrink-0"
          >
            <span>{isEn ? 'BROWSE FULL CATALOG' : 'ОТКРЫТЬ ВЕСЬ КАТАЛОГ (1 057)'}</span>
            <span>&rarr;</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default MainShowcase;
