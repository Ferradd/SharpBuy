import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { syncLiveStockFromSupplier } from '../utils/stockSync';

const getSortOptions = (lang) => [
  { value: 'match', label: lang === 'en' ? 'Best Match' : 'Лучшее совпадение' },
  { value: 'cheap', label: lang === 'en' ? 'Price: Low to High' : 'Сначала дешевле' },
  { value: 'expensive', label: lang === 'en' ? 'Price: High to Low' : 'Сначала дороже' },
  { value: 'hours', label: lang === 'en' ? 'Most Hours' : 'Больше часов' },
  { value: 'medals', label: lang === 'en' ? 'Most Medals' : 'Больше медалей' },
];

const ALL_CATEGORY_TAB = {
  id: 'all',
  title_ru: 'ВСЕ ТОВАРЫ',
  title_en: 'ALL ITEMS',
  shortCategory: 'ALL',
  count: PRODUCTS.length,
};

const NAV_CATEGORIES = [ALL_CATEGORY_TAB, ...CATEGORIES];

const checkPresetMatch = (p, pr) => {
  if (pr === 'knife') return p.hasKnife || (p.cleanTitle || '').toLowerCase().includes('нож') || (p.cleanTitle || '').toLowerCase().includes('перчат');
  if (pr === 'inactive') return (p.specs?.inactivity || '').toLowerCase().includes('отлег') || (p.cleanTitle || '').toLowerCase().includes('отлег') || (p.inactivityDays && p.inactivityDays >= 30);
  if (pr === 'premier') return (p.cleanTitle || '').toLowerCase().includes('рейтинг') || (p.cleanTitle || '').toLowerCase().includes('премьер') || (p.specs?.rank || '').toLowerCase().includes('premier');
  if (pr === 'medals') return (p.medalsVal && p.medalsVal >= 4) || (p.cleanTitle || '').toLowerCase().includes('медал');
  if (pr === 'budget') return p.price <= 100;
  if (pr === 'fullaccess') return p.specs?.emailChange === 'Да' || (p.specs?.access || '').toLowerCase().includes('полный') || (p.cleanTitle || '').toLowerCase().includes('полный');
  return true;
};

const getProductCardSpecs = (product, lang = 'ru') => {
  const isEn = lang === 'en';
  const itemType = product.itemType;
  const categoryId = product.categoryId;

  // 1. CFG (Конфиги)
  if (itemType === 'cfg' || categoryId === 'cs2cfg') {
    return {
      topTag: 'UNDETECTED',
      badgeClass: 'text-[#E8583A] bg-[#E8583A]/10 border-[#E8583A]/30',
      accessBadge: 'CFG PRESET',
      blocks: [
        { label: isEn ? 'Mode' : 'Режим', val: product.specs?.rank || 'Legit / Rage', highlight: false },
        { label: isEn ? 'Status' : 'Статус', val: 'Undetected', highlight: false },
        { label: isEn ? 'Access' : 'Доступ', val: isEn ? 'Lifetime' : 'Пожизненно', highlight: true },
      ],
      listSpecs: isEn ? `${product.specs?.rank || 'Legit'} · Undetected · Lifetime Updates` : `${product.specs?.rank || 'Legit'} · Undetected · Пожизненные обновления`,
    };
  }

  // 2. Steam Награды
  if (itemType === 'awards') {
    return {
      topTag: product.specs?.rank || (isEn ? 'STEAM POINTS' : 'STEAM ОЧКИ'),
      badgeClass: 'text-white/80 bg-white/[0.05] border-white/[0.1]',
      accessBadge: 'STEAM AWARDS',
      blocks: [
        { label: isEn ? 'Awards' : 'Награды', val: isEn ? (product.specs?.medals?.replace('шт', 'pcs') || '12 pcs') : (product.specs?.medals || '12 шт'), highlight: false },
        { label: isEn ? 'Points' : 'Очки Steam', val: product.specs?.rank || '+4,800', highlight: false },
        { label: isEn ? 'Delivery' : 'Выдача', val: isEn ? 'Auto 24/7' : 'Авто 24/7', highlight: true },
      ],
      listSpecs: isEn ? `${product.specs?.medals?.replace('шт', 'awards') || '12 awards'} · ${product.specs?.rank || '+4,800 points'} · Instant` : `${product.specs?.medals || '12 наград'} · ${product.specs?.rank || '+4,800 очков'} · Моментально`,
    };
  }

  // 3. VDS Серверы
  if (itemType === 'vds') {
    return {
      topTag: 'NVMe 1Gbps',
      badgeClass: 'text-white/80 bg-white/[0.05] border-white/[0.1]',
      accessBadge: 'VDS HOST',
      blocks: [
        { label: isEn ? 'Port' : 'Порт', val: '1 Gbps', highlight: false },
        { label: isEn ? 'Disk' : 'Диск', val: 'NVMe SSD', highlight: false },
        { label: isEn ? 'Uptime' : 'Аптайм', val: '24/7 Online', highlight: true },
      ],
      listSpecs: isEn ? '1 Gbps Port · NVMe SSD · 24/7 Server' : '1 Gbps Port · NVMe SSD · 24/7 Сервер',
    };
  }

  // 4. Steam Гифты и Услуги
  if (itemType === 'gift' || itemType === 'service') {
    return {
      topTag: itemType === 'gift' ? (isEn ? '70% OFF' : 'СКИДКА 70%') : (isEn ? 'CUSTOM' : 'ПОДБОР'),
      badgeClass: 'text-[#E8583A] bg-[#E8583A]/10 border-[#E8583A]/30',
      accessBadge: itemType === 'gift' ? 'STEAM GIFT' : 'SERVICE',
      blocks: [
        { label: isEn ? 'Service' : 'Услуга', val: itemType === 'gift' ? 'Steam Gift' : (isEn ? 'Matching' : 'Подбор'), highlight: false },
        { label: isEn ? 'Savings' : 'Экономия', val: itemType === 'gift' ? (isEn ? '30% price' : '30% цены') : (isEn ? 'Custom' : 'По запросу'), highlight: false },
        { label: isEn ? 'Guarantee' : 'Гарантия', val: isEn ? '100% Delivery' : '100% Выдача', highlight: true },
      ],
      listSpecs: itemType === 'gift' ? (isEn ? 'Licensed Gift · 30% Price · Fast Delivery' : 'Лицензионный гифт · 30% стоимости · Быстрая доставка') : (isEn ? 'Custom Game Selection · Any Titles & Medals' : 'Индивидуальный подбор · Любые игры и медали'),
    };
  }

  // 5. Rust
  if (categoryId === 'rust' || itemType === 'game') {
    const inactiveStr = product.specs?.inactivity && product.specs.inactivity !== '0 дн.' && product.specs.inactivity !== '0 дней'
      ? (isEn ? product.specs.inactivity.replace('дн.', 'days').replace('дней', 'days') : product.specs.inactivity)
      : (isEn ? 'RUST LICENSE' : 'RUST ЛИЦЕНЗИЯ');
    const hoursStr = product.specs?.hours ? (isEn ? product.specs.hours.replace('ч.', 'hrs').replace('ч', 'hrs') : product.specs.hours) : (isEn ? '450 hrs' : '450 ч');
    const warrantyStr = product.specs?.warranty ? (isEn ? product.specs.warranty.replace('3 часа', '3h').replace('3ч', '3h') : product.specs.warranty) : (isEn ? '3h' : '3ч');

    return {
      topTag: inactiveStr,
      badgeClass: 'text-white/70 bg-white/[0.05] border-white/[0.08]',
      accessBadge: product.specs?.access || 'RUST',
      blocks: [
        { label: isEn ? 'Rust Hours' : 'Часы Rust', val: hoursStr, highlight: false },
        { label: isEn ? 'Access' : 'Доступ', val: isEn ? 'License' : 'Лицензия', highlight: false },
        { label: isEn ? 'Warranty' : 'Гарантия', val: warrantyStr, highlight: true },
      ],
      listSpecs: isEn ? `${hoursStr} · Full License · 0 VAC / Bans` : `${hoursStr} · Лицензия · Без блокировок`,
    };
  }

  // 6. Аккаунты CS2 (Default)
  const inactiveStr = product.specs?.inactivity && product.specs.inactivity !== '0 дн.' && product.specs.inactivity !== '0 дней'
    ? (isEn ? product.specs.inactivity.replace('дн.', 'days').replace('дней', 'days') : product.specs.inactivity)
    : (isEn ? '18+ DAYS' : '18+ дн.');
  const hoursStr = product.specs?.hours ? (isEn ? product.specs.hours.replace('ч.', 'hrs').replace('ч', 'hrs') : product.specs.hours) : (isEn ? '24 hrs' : '24 ч.');
  const medalsStr = product.specs?.medals ? (isEn ? product.specs.medals.replace('медалей', 'medals').replace('Медалей', 'Medals') : product.specs.medals) : (isEn ? 'Prime' : 'Prime');
  const warrantyStr = product.specs?.warranty ? (isEn ? product.specs.warranty.replace('3 часа', '3h').replace('3ч', '3h') : product.specs.warranty) : (isEn ? '3h' : '3ч');

  return {
    topTag: inactiveStr,
    badgeClass: 'text-white/70 bg-white/[0.05] border-white/[0.08]',
    accessBadge: product.specs?.access || 'CS2',
    blocks: [
      { label: isEn ? 'Hours' : 'Часы', val: hoursStr, highlight: false },
      { label: isEn ? 'Medals' : 'Медали', val: medalsStr, highlight: false },
      { label: isEn ? 'Warranty' : 'Гарантия', val: warrantyStr, highlight: true },
    ],
    listSpecs: isEn ? `${hoursStr} · ${medalsStr} · CS2 Prime` : `${hoursStr} · ${medalsStr} · CS2`,
  };
};

export const CategoryPage = ({ categoryId = 'all', onNavigate, onSelectProduct, onBuy }) => {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const isEn = lang === 'en';
  const SORT_OPTIONS = getSortOptions(lang);
  const rawCategory = categoryId === 'all' ? ALL_CATEGORY_TAB : (CATEGORIES.find((c) => c.id === categoryId) || ALL_CATEGORY_TAB);
  const activeCategory = {
    ...rawCategory,
    title: rawCategory.id === 'all'
      ? (isEn ? rawCategory.title_en : rawCategory.title_ru)
      : (isEn ? (rawCategory.englishTitle || rawCategory.title) : rawCategory.title),
  };

  // Режим отображения: 'grid' (сетка 3-4 колонки) или 'list' (компактная таблица)
  const [viewMode, setViewMode] = useState('grid');

  // Быстрые смарт-пресеты (Quick Preset Chips)
  const [preset, setPreset] = useState('all');

  // Живой поиск
  const [searchQuery, setSearchQuery] = useState('');

  // Расширенные фильтры
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [budget, setBudget] = useState('all');
  const [inventory, setInventory] = useState('all');
  const [hours, setHours] = useState('all');
  const [medals, setMedals] = useState('all');
  const [warranty, setWarranty] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Быстрый осмотр в выдвижной шторке (Slide-in Drawer)
  const [drawerProduct, setDrawerProduct] = useState(null);
  const [selectedDrawerPayment, setSelectedDrawerPayment] = useState('crypto');
  const [stockSyncTick, setStockSyncTick] = useState(0);

  useEffect(() => {
    syncLiveStockFromSupplier().then(() => {
      setStockSyncTick((t) => t + 1);
    });

    const handleSync = () => setStockSyncTick((t) => t + 1);
    window.addEventListener('sharpbuy-stock-synced', handleSync);
    return () => window.removeEventListener('sharpbuy-stock-synced', handleSync);
  }, []);

  // Сброс всех фильтров
  const handleReset = () => {
    setPreset('all');
    setSearchQuery('');
    setBudget('all');
    setInventory('all');
    setHours('all');
    setMedals('all');
    setWarranty('all');
    setSortBy('match');
  };

  const hasActiveFilters = preset !== 'all' || searchQuery !== '' || budget !== 'all' || inventory !== 'all' || hours !== 'all' || medals !== 'all' || warranty !== 'all';

  // Фильтрация и сортировка
  const filteredProducts = useMemo(() => {
    let list = categoryId === 'all' ? [...PRODUCTS] : PRODUCTS.filter((p) => p.categoryId === categoryId);

    // Смарт-пресеты: если в выбранной категории нет таких товаров, умный поиск ищет по всему каталогу
    if (preset !== 'all') {
      const matchInCat = list.some((p) => checkPresetMatch(p, preset));
      if (!matchInCat) {
        list = [...PRODUCTS];
      }
      list = list.filter((p) => checkPresetMatch(p, preset));
    }

    // 1. Поиск
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        (p.cleanTitle || p.title || '').toLowerCase().includes(q) ||
        (p.englishTitle || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.specs?.inactivity || '').toLowerCase().includes(q) ||
        (p.specs?.access || '').toLowerCase().includes(q)
      );
    }

    // 3. Бюджет
    if (budget === '100') list = list.filter((p) => p.price <= 100);
    else if (budget === '500') list = list.filter((p) => p.price <= 500);
    else if (budget === '1000') list = list.filter((p) => p.price <= 1000);
    else if (budget === '2000') list = list.filter((p) => p.price >= 2000);

    // 4. Инвентарь
    if (inventory === 'none') list = list.filter((p) => !p.hasKnife && !p.hasGloves);
    else if (inventory === 'knife') list = list.filter((p) => p.hasKnife);
    else if (inventory === 'gloves') list = list.filter((p) => p.hasGloves);

    // 5. Часы
    if (hours === '100') list = list.filter((p) => (p.hoursVal || 0) >= 100);
    else if (hours === '300') list = list.filter((p) => (p.hoursVal || 0) >= 300);
    else if (hours === '1000') list = list.filter((p) => (p.hoursVal || 0) >= 1000);
    else if (hours === '2500') list = list.filter((p) => (p.hoursVal || 0) >= 2500);

    // 6. Медали
    if (medals === '1') list = list.filter((p) => (p.medalsVal || 0) >= 1);
    else if (medals === '4') list = list.filter((p) => (p.medalsVal || 0) >= 4);
    else if (medals === '10') list = list.filter((p) => (p.medalsVal || 0) >= 8);

    // 7. Гарантия
    if (warranty === 'first_login') list = list.filter((p) => p.specs?.warranty?.includes('Первый') || p.specs?.warranty?.includes('покупки') || p.specs?.warranty?.includes('First'));
    else if (warranty === '3h') list = list.filter((p) => p.specs?.warranty?.includes('3'));
    else if (warranty === 'lifetime') list = list.filter((p) => p.specs?.warranty?.includes('Бессрочно') || p.specs?.warranty?.includes('Lifetime'));

    // 8. Сортировка
    if (sortBy === 'cheap') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'expensive') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'hours') list.sort((a, b) => (b.hoursVal || 0) - (a.hoursVal || 0));
    else if (sortBy === 'medals') list.sort((a, b) => (b.medalsVal || 0) - (a.medalsVal || 0));

    return list;
  }, [categoryId, searchQuery, preset, budget, inventory, hours, medals, warranty, sortBy, stockSyncTick]);

  return (
    <div className="relative min-h-screen bg-[#0A0A09] pt-20 pb-28 text-[#F3F1EC] selection:bg-[#E8583A]/30">
      {/* Фоновая перфорация */}
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.035]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">

        {/* ── 1. ХЛЕБНЫЕ КРОШКИ И СТАТУС В ОДИН СТИЛЬНЫЙ РЯД ── */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-white/40 border-b border-white/[0.06] pb-3.5">
          <nav className="flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="transition-colors hover:text-white cursor-pointer">
              {t('nav_home')}
            </button>
            <span>/</span>
            <button
              onClick={() => {
                window.location.hash = 'category/all';
              }}
              className="transition-colors hover:text-white cursor-pointer"
            >
              {t('nav_catalog')}
            </button>
            <span>/</span>
            <span className="text-[#E8583A] font-semibold tracking-wide uppercase">{activeCategory.title}</span>
          </nav>

          <div className="flex items-center gap-3 text-[11px] text-white/40 font-mono">
            <span>{filteredProducts.length} {isEn ? 'OF' : 'ИЗ'} {PRODUCTS.length} {isEn ? 'ITEMS' : 'ПОЗИЦИЙ'}</span>
            <span>&middot;</span>
            <span className="text-white/60">{isEn ? '24/7 AUTO DELIVERY' : 'АВТОВЫДАЧА 24/7'}</span>
          </div>
        </div>

        {/* ── 2. МОНОЛИТНЫЙ SEGMENTED CONTROL КАТЕГОРИЙ (ВКЛЮЧАЯ ВСЕ ТОВАРЫ) ── */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#111215] p-1.5 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1">
            {NAV_CATEGORIES.map((cat) => {
              const isActive = (cat.id === 'all' && categoryId === 'all') || cat.id === categoryId;
              const title = cat.id === 'all'
                ? (isEn ? cat.title_en : cat.title_ru)
                : (isEn ? (cat.englishTitle || cat.title) : cat.title);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setPreset('all');
                    window.location.hash = `category/${cat.id}`;
                  }}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 font-mono text-xs transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#E8583A] text-white font-black shadow-[0_4px_20px_rgba(232,88,58,0.4)]'
                      : 'text-white/65 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="truncate font-sans font-bold tracking-tight text-[11px] uppercase">
                    {title}
                  </span>

                  <span
                    className={`ml-1.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono ${
                      isActive ? 'bg-black/30 text-white' : 'bg-black/40 text-white/40 group-hover:text-white'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. ЕДИНЫЙ КОМАНДНЫЙ HUD-БАР (ПОИСК, СМАРТ-ЧИПЫ, СОРТИРОВКА, ВИД) ── */}
        <div className="sticky top-16 z-30 mb-6 rounded-2xl border border-white/[0.09] bg-[#0E1013]/95 p-3.5 backdrop-blur-md shadow-2xl space-y-3">
          
          {/* Верхняя строка HUD: Поиск, Сортировка, Фильтры, Вид */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Поле живого поиска */}
            <div className="relative flex-1 max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/40">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search catalog (knife, 50+ lvl, 20k rating, ID)...' : 'Поиск в каталоге (нож, 50+ lvl, 20k rating, ID)...'}
                className="w-full rounded-xl border border-white/[0.08] bg-black/60 py-2.5 pr-8 pl-9 font-sans text-xs text-white placeholder-white/35 focus:border-[#E8583A] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-2.5 flex items-center text-white/40 hover:text-white cursor-pointer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L10 8.94l3.72-3.72a.75.75 0 10-1.06 1.06L10 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Правые контролы */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Кастомный выпадающий список сортировки */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs transition-all cursor-pointer ${
                    isSortOpen
                      ? 'border-[#E8583A] bg-[#14161A] text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                      : 'border-white/[0.08] bg-black/40 text-white/80 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-white/40 text-[11px] hidden sm:inline">{isEn ? 'Sort:' : 'Сорт:'}</span>
                  <span className="font-semibold text-white">
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || (isEn ? 'Sort by' : 'Сортировка')}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${
                      isSortOpen ? 'rotate-180 text-[#E8583A]' : ''
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[210px] rounded-xl border border-white/[0.12] bg-[#14161A]/95 p-1.5 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] font-mono text-xs">
                      <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-white/40 border-b border-white/[0.06] mb-1">
                        {isEn ? 'Sort order:' : 'Порядок сортировки:'}
                      </div>
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                            sortBy === opt.value
                              ? 'bg-[#E8583A] font-bold text-white shadow-sm'
                              : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <span className="text-white font-black text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Кнопка фильтров */}
              <button
                type="button"
                onClick={() => setShowFiltersModal(!showFiltersModal)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs transition-all cursor-pointer ${
                  showFiltersModal || hasActiveFilters
                    ? 'border-[#E8583A] bg-[#E8583A]/20 text-[#E8583A] font-bold shadow-[0_0_15px_rgba(232,88,58,0.25)]'
                    : 'border-white/[0.08] bg-black/40 text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>{isEn ? 'FILTERS' : 'ФИЛЬТРЫ'}</span>
                {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>}
              </button>

              {/* Переключатель сетки Grid/List */}
              <div className="flex items-center rounded-xl border border-white/[0.08] bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title={isEn ? 'Grid view' : 'Сетка карточек'}
                  className={`rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title={isEn ? 'List view' : 'Табличный список'}
                  className={`rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  {isEn ? 'RESET' : 'СБРОС'}
                </button>
              )}
            </div>
          </div>

          {/* Нижняя строка HUD: Смарт-чипы */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs scrollbar-none pt-1 border-t border-white/[0.05]">
            <span className="text-white/40 text-[10px] shrink-0 mr-1 uppercase tracking-wider">{isEn ? 'Presets:' : 'Пресеты:'}</span>
            {[
              { id: 'all', label: isEn ? 'All Items' : 'Все позиции' },
              { id: 'knife', label: isEn ? 'Knives & Gloves' : 'Ножи и перчатки' },
              { id: 'inactive', label: isEn ? 'Inactivity' : 'С отлёжкой' },
              { id: 'premier', label: 'Premier Rating' },
              { id: 'medals', label: isEn ? '4+ Medals' : 'Медали 4+' },
              { id: 'budget', label: isEn ? 'Under 100 ₽' : 'До 100 ₽' },
              { id: 'fullaccess', label: 'Full Access' },
            ].map((ch) => {
              const isSelected = preset === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setPreset(ch.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border border-[#E8583A] bg-[#E8583A]/20 font-bold text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                      : 'border border-white/[0.06] bg-black/40 text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* Выпадающая панель точных фильтров */}
          {showFiltersModal && (
            <div className="border-t border-white/[0.08] pt-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
                <div className="flex items-center gap-2 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#E8583A] fill-none stroke-currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span className="font-bold tracking-wide uppercase text-[11px]">{isEn ? 'ADVANCED FILTERS' : 'ТОЧНЫЙ ПОДБОР ПО ПАРАМЕТРАМ'}</span>
                  {hasActiveFilters && (
                    <span className="rounded bg-[#E8583A]/20 border border-[#E8583A]/40 px-2 py-0.5 text-[9px] font-bold text-[#E8583A]">
                      {isEn ? 'FILTERS ACTIVE' : 'ФИЛЬТРЫ АКТИВНЫ'}
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer text-[10px]"
                  >
                    <span>{isEn ? 'Reset filters' : 'Сбросить параметры'}</span>
                    <span>&times;</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-[10px] text-white/40 uppercase tracking-wider">{isEn ? 'Budget:' : 'Бюджет:'}</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: isEn ? 'Any' : 'Любой' },
                      { id: '100', label: isEn ? 'Under 100 ₽' : 'До 100 ₽' },
                      { id: '500', label: isEn ? 'Up to 500 ₽' : 'До 500 ₽' },
                      { id: '1000', label: isEn ? 'Up to 1,000 ₽' : 'До 1 000 ₽' },
                      { id: '2000', label: isEn ? 'From 2,000 ₽' : 'От 2 000 ₽' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBudget(item.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] transition-all cursor-pointer ${
                          budget === item.id
                            ? 'bg-[#E8583A] font-bold text-white shadow-[0_0_10px_rgba(232,88,58,0.3)]'
                            : 'bg-black/50 text-white/60 border border-white/[0.06] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] text-white/40 uppercase tracking-wider">{isEn ? 'Inventory:' : 'Инвентарь:'}</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: isEn ? 'Any' : 'Любой' },
                      { id: 'knife', label: isEn ? 'With Knife' : 'С ножом' },
                      { id: 'gloves', label: isEn ? 'With Gloves' : 'С перчатками' },
                      { id: 'none', label: isEn ? 'No Skins' : 'Без скинов' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setInventory(item.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] transition-all cursor-pointer ${
                          inventory === item.id
                            ? 'bg-[#E8583A] font-bold text-white shadow-[0_0_10px_rgba(232,88,58,0.3)]'
                            : 'bg-black/50 text-white/60 border border-white/[0.06] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] text-white/40 uppercase tracking-wider">{isEn ? 'Hours CS2:' : 'Часы CS2:'}</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: isEn ? 'Any' : 'Любые' },
                      { id: '100', label: isEn ? '100+ hrs' : '100+ ч' },
                      { id: '300', label: isEn ? '300+ hrs' : '300+ ч' },
                      { id: '1000', label: isEn ? '1,000+ hrs' : '1 000+ ч' },
                      { id: '2500', label: isEn ? '2,500+ hrs' : '2 500+ ч' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHours(item.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] transition-all cursor-pointer ${
                          hours === item.id
                            ? 'bg-[#E8583A] font-bold text-white shadow-[0_0_10px_rgba(232,88,58,0.3)]'
                            : 'bg-black/50 text-white/60 border border-white/[0.06] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] text-white/40 uppercase tracking-wider">{isEn ? 'Warranty:' : 'Гарантия:'}</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: isEn ? 'Any' : 'Любая' },
                      { id: '3h', label: isEn ? '3 Hours' : '3 часа' },
                      { id: 'first_login', label: isEn ? 'First Login' : 'Первый вход' },
                      { id: 'lifetime', label: isEn ? 'Lifetime' : 'Бессрочно' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWarranty(item.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] transition-all cursor-pointer ${
                          warranty === item.id
                            ? 'bg-[#E8583A] font-bold text-white shadow-[0_0_10px_rgba(232,88,58,0.3)]'
                            : 'bg-black/50 text-white/60 border border-white/[0.06] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. СТРОКА СТАТИСТИКИ ВЫДАЧИ ── */}
        <div className="mb-5 flex items-center justify-between font-mono text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span>{isEn ? 'FOUND ITEMS /' : 'НАЙДЕНО ПОЗИЦИЙ /'}</span>
            <strong className="text-white font-bold text-sm">{filteredProducts.length}</strong>
            <span>{isEn ? 'in category «' : 'в категории «'}{activeCategory.title}»</span>
          </div>

          <div className="hidden sm:block text-[11px] text-white/40">
            {isEn ? 'Click card for quick inspection' : 'Кликните по карточке для быстрого инспекта'}
          </div>
        </div>

        {/* ── 5. ВИД: СЕТКА 3-4 КОЛОНКИ (GRID MODE) ── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const shortId = product.id.slice(-6);
              const imageSrc = product.image || `/products/${product.id}.jpeg`;
              const cardSpecs = getProductCardSpecs(product, lang);

              return (
                <div
                  key={product.id}
                  onClick={() => setDrawerProduct(product)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121316] p-4 transition-all duration-300 hover:border-[#E8583A]/60 hover:bg-[#15161A] hover:shadow-[0_12px_40px_rgba(0,0,0,0.85)] cursor-pointer"
                >
                  <div>
                    {/* Верхняя строка карточки: ID и статус */}
                    <div className="mb-3 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-white/35 font-semibold tracking-wider uppercase">
                        #{shortId}
                      </span>
                      {product.inStock !== false ? (
                        <span className="rounded px-2 py-0.5 border font-bold tracking-wide text-[#34D399] bg-[#34D399]/15 border-[#34D399]/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                          {isEn ? 'IN STOCK:' : 'В НАЛИЧИИ:'} {product.stockCount || 4}{isEn ? ' PCS' : ' ШТ'}
                        </span>
                      ) : (
                        <span className="rounded px-2 py-0.5 border font-medium tracking-wide text-white/40 bg-white/[0.04] border-white/10">
                          {isEn ? 'OUT OF STOCK' : 'НЕТ В НАЛИЧИИ'}
                        </span>
                      )}
                    </div>

                    {/* 4:3 Фото товаров */}
                    <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/[0.07]">
                      {/* Бейдж типа доступа */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="rounded-md bg-black/80 backdrop-blur-md px-2.5 py-1 font-mono text-[9px] font-black text-white border border-white/15 tracking-wider uppercase shadow-lg">
                          {cardSpecs.accessBadge}
                        </span>
                      </div>

                      <img
                        src={imageSrc}
                        alt={isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Заголовок товара */}
                    <h3 className="font-sans text-[14px] font-black uppercase tracking-tight text-[#F3F1EC] group-hover:text-[#E8583A] transition-colors line-clamp-2 leading-snug min-h-[38px]">
                      {isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                    </h3>
                    {product.englishTitle && !isEn && (
                      <div className="mt-1 font-mono text-[10px] text-white/40 uppercase tracking-wider truncate">
                        {product.englishTitle}
                      </div>
                    )}

                    {/* 3 аккуратных динамических блока параметров */}
                    <div className="my-3 grid grid-cols-3 gap-1.5 font-mono text-center">
                      {cardSpecs.blocks.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className={`rounded-lg p-1.5 border ${
                            b.highlight
                              ? 'bg-[#E8583A]/10 border-[#E8583A]/20 text-[#E8583A]'
                              : 'bg-black/40 border-white/[0.05] text-white'
                          }`}
                        >
                          <div className={`text-[9px] uppercase ${b.highlight ? 'text-[#E8583A]/70' : 'text-white/40'}`}>
                            {b.label}
                          </div>
                          <div className="font-bold text-[11px] mt-0.5 truncate">
                            {b.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Нижняя плашка: Крупная яркая цена + Кнопка Купить */}
                  <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl font-black text-white tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="font-mono text-xs text-white/30 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.inStock !== false ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerProduct(product);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#E8583A] px-4 py-2 font-mono text-xs font-black text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_16px_rgba(232,88,58,0.5)] transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'BUY' : 'КУПИТЬ'}</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      <span className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 font-mono text-[11px] font-bold text-white/35">
                        {isEn ? 'OUT OF STOCK' : 'НЕТ В НАЛИЧИИ'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 6. ВИД: КОМПАКТНЫЙ ТАБЛИЧНЫЙ СПИСОК (LIST MODE) ── */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredProducts.map((product) => {
              const shortId = product.id.slice(-6);
              const imageSrc = product.image || `/products/${product.id}.jpeg`;
              const cardSpecs = getProductCardSpecs(product, lang);

              return (
                <div
                  key={product.id}
                  onClick={() => setDrawerProduct(product)}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#121316] p-4 transition-all hover:border-[#E8583A]/60 hover:bg-[#15161A] cursor-pointer ${
                    product.inStock === false ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-black/60 border border-white/[0.08]">
                      <img
                        src={imageSrc}
                        alt={isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-white/40">ID #{shortId}</span>
                        <span>&middot;</span>
                        {product.inStock !== false ? (
                          <span className="text-[#34D399] font-bold">{isEn ? 'IN STOCK' : 'В НАЛИЧИИ'} ({product.stockCount || 4}{isEn ? ' PCS' : ' ШТ'})</span>
                        ) : (
                          <span className="text-white/40">{isEn ? 'OUT OF STOCK' : 'НЕТ В НАЛИЧИИ'}</span>
                        )}
                        <span>&middot;</span>
                        <span className="text-[#E8583A] font-medium">{product.specs?.warranty ? (isEn ? product.specs.warranty.replace('3 часа', '3h warranty').replace('3ч', '3h warranty') : product.specs.warranty) : (isEn ? '3h warranty' : '3ч гарантия')}</span>
                      </div>
                      <h4 className="font-sans text-[15px] font-black uppercase text-white group-hover:text-[#E8583A] transition-colors mt-0.5">
                        {isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                      </h4>
                      <div className="font-mono text-[11px] text-white/50 mt-0.5">
                        {cardSpecs.listSpecs}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-white/[0.04] pt-2 sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <div className="font-mono text-2xl font-black text-white tracking-tight">
                        {formatPrice(product.price)}
                      </div>
                      {product.oldPrice && (
                        <div className="font-mono text-xs text-white/30 line-through">
                          {formatPrice(product.oldPrice)}
                        </div>
                      )}
                    </div>

                    {product.inStock !== false ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerProduct(product);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#E8583A] px-4 py-2 font-mono text-xs font-black text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_16px_rgba(232,88,58,0.5)] transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'BUY' : 'КУПИТЬ'}</span>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      <span className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 font-mono text-[11px] font-bold text-white/35">
                        {isEn ? 'OUT OF STOCK' : 'НЕТ В НАЛИЧИИ'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111215] p-12 text-center">
            <div className="font-mono text-sm text-white/60">
              {isEn ? 'No items found matching selected filters.' : 'По выбранным фильтрам позиции не найдены.'}
            </div>
            <button
              onClick={handleReset}
              className="mt-3 font-mono text-xs font-bold text-[#E8583A] underline hover:text-[#FF6B4A] cursor-pointer"
            >
              {isEn ? 'Reset all filters' : 'Сбросить все параметры фильтрации'}
            </button>
          </div>
        )}
      </div>

      {/* ── 7. ВЫДВИЖНОЙ СЛАЙД-ИНСПЕКТОР (QUICK INSPECT DRAWER) ── */}
      {drawerProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setDrawerProduct(null)}
          ></div>

          <div className="relative z-10 flex h-full w-full max-w-lg flex-col justify-between overflow-y-auto bg-[#0E1013] p-6 shadow-2xl border-l border-white/[0.1] text-[#F3F1EC]">
            <div>
              {/* Шапка шторки */}
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="font-mono text-[11px] text-white/40 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
                  <span>{isEn ? 'ITEM INFO' : 'О ТОВАРЕ'} #{drawerProduct.id.slice(-6)}</span>
                </div>
                <button
                  onClick={() => setDrawerProduct(null)}
                  className="rounded-full bg-white/[0.05] p-1.5 text-white/60 hover:bg-white/[0.1] hover:text-white cursor-pointer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>

              {/* 4:3 Превью обложки */}
              <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/[0.08]">
                <img
                  src={drawerProduct.image || `/products/${drawerProduct.id}.jpeg`}
                  alt={isEn ? (drawerProduct.englishTitle || drawerProduct.cleanTitle || drawerProduct.title) : (drawerProduct.cleanTitle || drawerProduct.title)}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Название и статус */}
              <h2 className="font-sans text-xl font-black uppercase text-[#F3F1EC]">
                {isEn ? (drawerProduct.englishTitle || drawerProduct.cleanTitle || drawerProduct.title) : (drawerProduct.cleanTitle || drawerProduct.title)}
              </h2>
              {drawerProduct.englishTitle && !isEn && (
                <div className="font-mono text-xs text-white/40 uppercase tracking-wider mt-0.5">
                  {drawerProduct.englishTitle}
                </div>
              )}

              {/* Динамические спецификации */}
              {(() => {
                const drawerSpecs = getProductCardSpecs(drawerProduct, lang);
                return (
                  <div className="my-4 grid grid-cols-2 gap-2 font-mono text-xs">
                    {drawerSpecs.blocks.map((b, bIdx) => (
                      <div key={bIdx} className="rounded-xl border border-white/[0.06] bg-black/40 p-2.5">
                        <div className="text-[10px] text-white/40 uppercase">{b.label}:</div>
                        <div className={`font-bold ${b.highlight ? 'text-[#E8583A]' : 'text-white'}`}>{b.val}</div>
                      </div>
                    ))}
                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-2.5">
                      <div className="text-[10px] text-white/40 uppercase">{isEn ? 'TYPE:' : 'ТИП:'}</div>
                      <div className="font-bold text-white">{drawerSpecs.accessBadge}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Описание */}
              <p className="font-sans text-xs text-white/60 leading-relaxed">
                {isEn ? (drawerProduct.englishSummary || drawerProduct.englishTitle || 'Prime enabled. Zero bans, full access, and clean match history.') : (drawerProduct.summaryPurpose || drawerProduct.description)}
              </p>

              {/* Способы оплаты */}
              <div className="mt-4 space-y-1.5 font-mono text-xs">
                <div className="text-[10px] text-white/40 uppercase">{isEn ? 'Payment method:' : 'Способ оплаты:'}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'crypto', label: 'Crypto 0%' },
                    { id: 'wallet', label: isEn ? 'Wallet 0%' : 'Кошелек 0%' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedDrawerPayment(m.id)}
                      className={`rounded p-2 text-center transition-all cursor-pointer ${
                        selectedDrawerPayment === m.id
                          ? 'border border-[#E8583A] bg-[#E8583A]/20 font-bold text-white'
                          : 'border border-white/[0.06] bg-black/40 text-white/60'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Нижняя плашка чекаута */}
            <div className="mt-6 border-t border-white/[0.08] pt-4 space-y-3">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-white/50">{isEn ? 'TOTAL TO PAY:' : 'ИТОГО К ОПЛАТЕ:'}</span>
                <span className="text-2xl font-black text-[#F3F1EC]">{formatPrice(drawerProduct.price)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const prod = drawerProduct;
                    setDrawerProduct(null);
                    if (onSelectProduct) onSelectProduct(prod);
                  }}
                  className="flex-1 rounded-xl border border-white/[0.1] bg-black/40 py-3 font-mono text-xs font-semibold text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  {isEn ? 'VIEW DETAILS' : 'ПОДРОБНЕЕ О ТОВАРЕ'}
                </button>

                {drawerProduct.inStock !== false ? (
                  <button
                    onClick={() => {
                      const prod = drawerProduct;
                      setDrawerProduct(null);
                      if (onBuy) onBuy(prod);
                      else if (onSelectProduct) onSelectProduct(prod);
                    }}
                    className="flex-[2] rounded-xl bg-[#E8583A] py-3 font-mono text-xs font-black text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_20px_rgba(232,88,58,0.5)] transition-all cursor-pointer"
                  >
                    {isEn ? 'BUY NOW' : 'КУПИТЬ СЕЙЧАС'} &rarr;
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-[2] rounded-xl bg-white/[0.06] border border-white/10 py-3 font-mono text-xs font-bold text-white/35 cursor-not-allowed"
                  >
                    {isEn ? 'OUT OF STOCK' : 'ТОВАР ЗАКОНЧИЛСЯ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
