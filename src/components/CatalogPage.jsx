import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const CatalogPage = ({ onNavigate, onSelectCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { lang, t } = useLanguage();

  const filterTabs = [
    { id: 'ALL', label: t('filter_all').toUpperCase() },
    { id: 'CS2', label: 'CS2' },
    { id: 'PRIME', label: 'PRIME' },
    { id: 'FULL ACCESS', label: 'FULL ACCESS' },
    { id: 'CFG', label: 'CFG' },
    { id: 'RUST', label: 'RUST' },
    { id: 'STEAM', label: 'STEAM' },
  ];

  const categories = useMemo(() => [
    {
      id: 'cs2noprime',
      tag: 'CS2',
      title: lang === 'ru' ? 'CS2 БЕЗ ПРАЙМА' : 'CS2 NO-PRIME',
      subtitle: lang === 'ru' ? 'Аккаунты для игры и калибровки' : 'Ranked & placement ready accounts',
      count: 310,
      priceFrom: lang === 'ru' ? '190 ₽' : '$2.10',
      image: '/cat-unprime.jpg',
      accentColor: '#E2E8F0',
      badgeType: 'unprime',
    },
    {
      id: 'cs2nfa',
      tag: 'PRIME',
      title: lang === 'ru' ? 'CS2 PRIME NFA' : 'CS2 PRIME NFA',
      subtitle: lang === 'ru' ? 'Прайм-аккаунты с отлегой и инвентарём' : 'Prime accounts with inactivity & skins',
      count: 247,
      priceFrom: lang === 'ru' ? '890 ₽' : '$9.80',
      image: '/cat-prime.jpg',
      accentColor: '#E8583A',
      badgeType: 'prime',
    },
    {
      id: 'cs2full',
      tag: 'FULL ACCESS',
      title: lang === 'ru' ? 'CS2 PRIME FULL ACCESS' : 'CS2 PRIME FULL ACCESS',
      subtitle: lang === 'ru' ? 'Полный доступ и перепривязка на вашу почту' : 'Full access & rebind to your native email',
      count: 89,
      priceFrom: lang === 'ru' ? '1 690 ₽' : '$18.50',
      image: '/cat-fullaccess.jpg',
      accentColor: '#60A5FA',
      badgeType: 'fullaccess',
    },
    {
      id: 'cs2cfg',
      tag: 'CFG',
      title: lang === 'ru' ? 'CS2 CFG И НАСТРОЙКИ' : 'CS2 CFG & PRESETS',
      subtitle: lang === 'ru' ? 'Пресеты для игры и готовые конфигурации' : 'Pro match presets & optimized configs',
      count: 142,
      priceFrom: lang === 'ru' ? '290 ₽' : '$3.20',
      image: '/cat-cfg.jpg',
      accentColor: '#34D399',
      badgeType: 'cfg',
    },
    {
      id: 'rust',
      tag: 'RUST',
      title: lang === 'ru' ? 'RUST АККАУНТЫ' : 'RUST ACCOUNTS',
      subtitle: lang === 'ru' ? 'Часы, предметы и готовый прогресс' : 'Play hours, items, and inventory progress',
      count: 74,
      priceFrom: lang === 'ru' ? '990 ₽' : '$10.90',
      image: '/cat-rust.jpg',
      accentColor: '#EA580C',
      badgeType: 'rust',
    },
    {
      id: 'steam',
      tag: 'STEAM',
      title: lang === 'ru' ? 'STEAM ТОВАРЫ' : 'STEAM ITEMS & BALANCE',
      subtitle: lang === 'ru' ? 'Подарки, игры, баланс и награды' : 'Gifts, games, wallet balance & points',
      count: 185,
      priceFrom: lang === 'ru' ? '450 ₽' : '$4.95',
      image: '/cat-steam.jpg',
      accentColor: '#818CF8',
      badgeType: 'steam',
    },
  ], [lang]);

  // Фильтрация и поиск
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      // Таб-фильтр
      if (activeFilter !== 'ALL') {
        if (activeFilter === 'CS2' && !item.title.includes('CS2')) return false;
        if (activeFilter === 'PRIME' && !item.title.includes('PRIME')) return false;
        if (activeFilter === 'FULL ACCESS' && item.id !== 'cs2full') return false;
        if (activeFilter === 'CFG' && item.id !== 'cs2cfg') return false;
        if (activeFilter === 'RUST' && item.id !== 'rust') return false;
        if (activeFilter === 'STEAM' && item.id !== 'steam') return false;
      }

      // Текстовый поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [categories, activeFilter, searchQuery]);

  // Сортировка
  const sortedCategories = useMemo(() => {
    const list = [...filteredCategories];
    if (sortBy === 'cheap') {
      list.sort((a, b) => parseFloat(a.priceFrom.replace(/[^0-9.]/g, '')) - parseFloat(b.priceFrom.replace(/[^0-9.]/g, '')));
    } else if (sortBy === 'count') {
      list.sort((a, b) => b.count - a.count);
    }
    return list;
  }, [filteredCategories, sortBy]);

  // Кастомные геометрические SVG значки
  const renderBadgeIcon = (type) => {
    switch (type) {
      case 'unprime':
        return (
          <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
            <circle cx="18" cy="18" r="16" fill="#14161B" stroke="#94A3B8" strokeWidth="1.5" />
            <polygon points="18,7 21,14 29,15 23,20 25,28 18,24 11,28 13,20 7,15 15,14" fill="#64748B" stroke="#E2E8F0" strokeWidth="1" />
          </svg>
        );
      case 'prime':
        return (
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
              <path d="m11 25 14-14a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L7 21" fill="none" stroke="#E8583A" strokeWidth="2" strokeLinecap="round" />
              <path d="m7 21 8 8" stroke="#E8583A" strokeWidth="2" strokeLinecap="round" />
              <circle cx="28" cy="8" r="3" fill="#E8583A" />
            </svg>
          </div>
        );
      case 'fullaccess':
        return (
          <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
            <path d="M18 4 L31 9 L31 20 C31 27 24 32 18 34 C12 32 5 27 5 20 L5 9 Z" fill="#111827" stroke="#60A5FA" strokeWidth="1.8" />
            <circle cx="18" cy="15" r="3.5" fill="none" stroke="#60A5FA" strokeWidth="1.5" />
            <path d="M18 18.5 L18 25 M15 22 L18 22" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'cfg':
        return (
          <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
            <rect x="7" y="7" width="22" height="22" rx="3" fill="#0E1A16" stroke="#34D399" strokeWidth="1.6" />
            <circle cx="18" cy="18" r="5" fill="none" stroke="#34D399" strokeWidth="1.4" />
            <line x1="18" y1="10" x2="18" y2="13" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="23" x2="18" y2="26" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="18" x2="13" y2="18" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="23" y1="18" x2="26" y2="18" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'rust':
        return (
          <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
            <circle cx="18" cy="18" r="6" fill="#1A120D" stroke="#EA580C" strokeWidth="2" />
            <path d="M18 4v4 M18 28v4 M4 18h4 M28 18h4 M8 8l3 3 M25 25l3 3 M8 28l3-3 M25 11l3-3" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'steam':
        return (
          <svg viewBox="0 0 36 36" className="h-8 w-8 drop-shadow-md">
            <rect x="6" y="12" width="24" height="18" rx="2" fill="#151324" stroke="#818CF8" strokeWidth="1.8" />
            <line x1="6" y1="18" x2="30" y2="18" stroke="#818CF8" strokeWidth="1.5" />
            <line x1="18" y1="12" x2="18" y2="30" stroke="#818CF8" strokeWidth="1.5" />
            <path d="M12 12 C12 7, 18 7, 18 12 C18 7, 24 7, 24 12" fill="none" stroke="#818CF8" strokeWidth="1.6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A09] pt-24 pb-28 text-[#F3F1EC] selection:bg-[#E8583A]/30">
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.04]"></div>

      <div className="pointer-events-none absolute top-32 left-8 hidden h-96 w-px bg-white/[0.04] lg:block"></div>
      <div className="pointer-events-none absolute top-32 right-8 hidden h-96 w-px bg-white/[0.04] lg:block"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        {/* ── 1. ХЛЕБНЫЕ КРОШКИ ── */}
        <nav className="mb-8 flex items-center gap-2 font-mono text-xs text-white/40">
          <button
            onClick={() => onNavigate('home')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            {t('nav_home')}
          </button>
          <span>/</span>
          <span className="text-[#E8583A] font-semibold">{t('nav_catalog')}</span>
        </nav>

        {/* ── 2. ВЕРХ КАТАЛОГА ── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'ПРЕМИАЛЬНЫЙ МАРКЕТПЛЕЙС · КАТАЛОГ' : 'PREMIUM MARKETPLACE · CATALOG'}
              </span>
            </div>

            <h1
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(40px, 4.5vw, 56px)',
                lineHeight: 0.95,
              }}
            >
              {lang === 'ru' ? <>НАЙДИТЕ СВОЙ<br />ИГРОВОЙ ДОСТУП</> : <>EXPLORE ALL<br />GAMING ASSETS</>}
            </h1>

            <p className="mt-3.5 max-w-2xl font-sans text-sm text-white/60 leading-relaxed">
              {lang === 'ru'
                ? 'Выберите, что вам нужно: аккаунт для игры, Prime, полный доступ, конфигурация, Rust или Steam-товары.'
                : 'Choose your desired setup: competitive CS2 accounts, Prime status, full access with email rebind, Rust accounts or Steam balance.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 font-mono text-xs shadow-sm self-start lg:self-end">
            <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
            <span className="font-bold text-[#F3F1EC]">1 057</span>
            <span className="text-white/50 uppercase tracking-wider">{lang === 'ru' ? 'ПОЗИЦИЙ В НАЛИЧИИ' : 'ITEMS IN STOCK'}</span>
          </div>
        </div>

        {/* ── 3. ПОИСК И БЫСТРЫЙ ВЫБОР ── */}
        <div className="mb-10 space-y-4">
          <div className="relative flex h-[52px] w-full items-center rounded-xl border border-white/[0.08] bg-[#121110] px-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 focus-within:border-[#E8583A]/50 focus-within:bg-[#161412]">
            <svg
              className="h-4 w-4 text-white/40 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('catalog_search_placeholder')}
              className="ml-3 h-full w-full bg-transparent font-sans text-sm text-[#F3F1EC] placeholder:text-white/35 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="font-mono text-xs text-white/40 hover:text-white cursor-pointer px-2"
              >
                &times; {lang === 'ru' ? 'Очистить' : 'Clear'}
              </button>
            )}
          </div>

          {/* Строка быстрых таб-фильтров и сортировка */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-3 pt-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`relative px-3 py-1.5 font-mono text-[12px] font-semibold tracking-wider transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'text-white bg-[#E8583A]/10 rounded-t'
                        : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8583A]"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Сортировка */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 font-mono text-[12px] text-white/50 transition-colors hover:text-white cursor-pointer select-none"
              >
                <span>{lang === 'ru' ? 'СОРТИРОВКА:' : 'SORT BY:'}</span>
                <span className="font-bold text-[#F3F1EC] uppercase">
                  {sortBy === 'popular'
                    ? (lang === 'ru' ? 'ПОПУЛЯРНЫЕ' : 'POPULAR')
                    : sortBy === 'cheap'
                    ? (lang === 'ru' ? 'СНАЧАЛА ДЕШЕВЛЕ' : 'PRICE: LOW TO HIGH')
                    : (lang === 'ru' ? 'ПО КОЛИЧЕСТВУ' : 'STOCK QUANTITY')}
                </span>
                <span className="text-[#E8583A]">&darr;</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-8 z-30 w-52 rounded-md border border-white/[0.1] bg-[#12141A] py-1.5 shadow-2xl backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setSortBy('popular');
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-mono text-xs transition-colors cursor-pointer ${
                      sortBy === 'popular' ? 'text-[#E8583A] bg-white/[0.04]' : 'text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {lang === 'ru' ? 'Популярные' : 'Most Popular'}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('cheap');
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-mono text-xs transition-colors cursor-pointer ${
                      sortBy === 'cheap' ? 'text-[#E8583A] bg-white/[0.04]' : 'text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {lang === 'ru' ? 'Сначала дешевле' : 'Price: Low to High'}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('count');
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-mono text-xs transition-colors cursor-pointer ${
                      sortBy === 'count' ? 'text-[#E8583A] bg-white/[0.04]' : 'text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {lang === 'ru' ? 'По количеству в наличии' : 'In-Stock Quantity'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. СЕТКА КАТЕГОРИЙ ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((cat) => {
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121110] transition-all duration-300 hover:border-white/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.85)] cursor-pointer"
                style={{
                  height: '255px',
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  style={{
                    backgroundImage: `url('${cat.image}')`,
                  }}
                ></div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A09] via-[#0A0A09]/80 to-[#0A0A09]/30 transition-opacity duration-300 group-hover:from-[#0A0A09]/95 group-hover:via-[#0A0A09]/65"></div>

                <div className="relative z-10 flex items-start justify-end p-5">
                  <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                    {renderBadgeIcon(cat.badgeType)}
                  </div>
                </div>

                <div className="relative z-10 p-5 pt-0">
                  <h3 className="font-sans text-[19px] font-extrabold uppercase tracking-tight text-[#F3F1EC] transition-colors group-hover:text-white">
                    {cat.title}
                  </h3>

                  <p className="mt-1 font-sans text-[13px] text-white/60 leading-snug">
                    {cat.subtitle}
                  </p>

                  <div className="my-3 h-[1px] w-full bg-white/[0.08]"></div>

                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-white/55">
                      <span className="font-bold text-[#F3F1EC]" style={{ color: cat.id === 'cs2nfa' ? '#E8583A' : '#F3F1EC' }}>
                        {cat.count} {lang === 'ru' ? 'ПОЗИЦИЙ' : 'ITEMS'}
                      </span>
                      <span>&middot;</span>
                      <span>{lang === 'ru' ? 'ОТ' : 'FROM'} {cat.priceFrom}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-[#F3F1EC] transition-colors group-hover:text-[#E8583A]">
                      <span className="hidden sm:inline opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-[11px]">
                        {lang === 'ru' ? 'ОТКРЫТЬ КАТЕГОРИЮ' : 'OPEN CATEGORY'}
                      </span>
                      <span className="sm:hidden text-[11px]">{lang === 'ru' ? 'ОТКРЫТЬ' : 'OPEN'}</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: cat.accentColor }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Если поиск ничего не нашел */}
        {sortedCategories.length === 0 && (
          <div className="mt-12 rounded-lg border border-white/[0.08] bg-white/[0.02] p-12 text-center">
            <p className="font-mono text-sm text-white/50">
              {lang === 'ru' ? `По запросу «${searchQuery}» ничего не найдено.` : `No items found for "${searchQuery}".`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
              className="mt-4 font-mono text-xs text-[#E8583A] underline cursor-pointer"
            >
              {lang === 'ru' ? 'Сбросить фильтры поиска' : 'Reset search filters'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
