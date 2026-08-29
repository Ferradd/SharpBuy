import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { PRODUCTS } from '../data/mockData';
import { syncLiveStockFromSupplier } from '../utils/stockSync';

const getProductDetailSpecs = (product, lang = 'ru') => {
  const isEn = lang === 'en';
  const itemType = product.itemType;
  const categoryId = product.categoryId;

  // 1. CFG (Конфиги для читов)
  if (itemType === 'cfg' || categoryId === 'cs2cfg') {
    return {
      topCategoryName: isEn ? 'CS2 CONFIGS' : 'КОНФИГИ CS2',
      badgeAccess: 'CFG PRESET',
      inspectPills: [
        { label: isEn ? 'Mode' : 'Режим', val: product.specs?.rank || 'Legit / Rage', highlight: false },
        { label: isEn ? 'Status' : 'Статус', val: 'UNDETECTED', highlight: false },
        { label: isEn ? 'Updates' : 'Обновления', val: 'LIFETIME', highlight: true },
      ],
      cards: [
        { title: isEn ? 'GAME MODE / TARGET:' : 'Режим игры / Назначение:', val: product.specs?.rank || 'Legit / Semi-Rage', desc: isEn ? 'Fine-tuned visuals, aimbot and triggerbot' : 'Настроенные визуалы, аимбот и триггер' },
        { title: isEn ? 'SUPPORTED SOFTWARE:' : 'Поддерживаемый софт:', val: product.cleanTitle?.replace(' CS2 CFG', '') || 'CS2 Cheat', desc: isEn ? 'Optimized for current game build' : 'Оптимизирован под последнюю версию игры' },
        { title: isEn ? 'DETECTION STATUS:' : 'Статус детекта:', val: isEn ? 'UNDETECTED (0 BANS)' : 'UNDETECTED (0 БАНОВ)', desc: isEn ? 'Safe preset for Matchmaking & Premier' : 'Безопасные настройки для матчмейкинга и Премьер' },
        { title: isEn ? 'UPDATE SUPPORT:' : 'Срок обновлений:', val: isEn ? 'LIFETIME ACCESS' : 'ПОЖИЗНЕННО (LIFETIME)', desc: isEn ? 'Free config updates upon CS2 game patches' : 'Бесплатные обновления конфига при апдейтах CS2' },
        { title: isEn ? 'INTEGRITY GUARANTEE:' : 'Гарантия работоспособности:', val: isEn ? '100% VALID' : '100% ВАЛИД', desc: isEn ? 'Verified by developers before listing' : 'Проверен разработчиками перед загрузкой' },
        { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: isEn ? 'CFG FILE + LINK' : 'CFG ФАЙЛ + ССЫЛКА', desc: isEn ? 'Instant download link & setup manual' : 'Моментальная выдача ссылки и инструкции по установке' },
      ],
    };
  }

  // 2. Steam Awards / Очки
  if (itemType === 'awards') {
    return {
      topCategoryName: isEn ? 'STEAM SERVICES' : 'STEAM УСЛУГИ',
      badgeAccess: 'STEAM AWARDS',
      inspectPills: [
        { label: isEn ? 'Steam Points' : 'Очки Steam', val: product.specs?.rank || '+9,600', highlight: false },
        { label: isEn ? 'Quantity' : 'Количество', val: isEn ? (product.specs?.medals?.replace('шт', 'pcs') || '24 pcs') : (product.specs?.medals || '24 шт'), highlight: false },
        { label: isEn ? 'Guarantee' : 'Гарантия', val: isEn ? '100% DISPATCH' : '100% ВЫДАЧА', highlight: true },
      ],
      cards: [
        { title: isEn ? 'STEAM PROFILE POINTS:' : 'Очки профиля Steam:', val: product.specs?.rank ? `${product.specs.rank} ${isEn ? 'POINTS' : 'ОЧКОВ'}` : (isEn ? '+9,600 POINTS' : '+9,600 ОЧКОВ'), desc: isEn ? 'For buying avatars, backgrounds and leveling profile' : 'Для покупок аватаров, фонов и прокачки уровня Steam' },
        { title: isEn ? 'NUMBER OF AWARDS:' : 'Количество наград:', val: isEn ? '24 AWARDS' : '24 НАГРАДЫ', desc: isEn ? 'Sent to your artworks, reviews or screenshots' : 'Награды выдаются на иллюстрации, обзоры или скриншоты' },
        { title: isEn ? 'CREDITING WINDOW:' : 'Срок начисления:', val: isEn ? '14 DAYS (STEAM RULES)' : '14 ДНЕЙ (ПРАВИЛА STEAM)', desc: isEn ? 'Standard Valve points security hold' : 'Стандартный холд начисления очков от Valve' },
        { title: isEn ? 'PROFILE SAFETY:' : 'Безопасность профиля:', val: isEn ? '100% RISK-FREE' : '100% БЕЗ РИСКА', desc: isEn ? 'Delivered legitimately through Steam Community' : 'Награды начисляются легально через сообщество Steam' },
        { title: isEn ? 'GUARANTEE:' : 'Гарантия:', val: isEn ? 'PERMANENT' : 'БЕССРОЧНО', desc: isEn ? 'Guaranteed delivery of full points amount' : 'Гарантированное поступление всех очков на баланс' },
        { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: isEn ? 'DISPATCH TO PROFILE URL' : 'ОТПРАВКА НА ССЫЛКУ ПРОФИЛЯ', desc: isEn ? 'Provide your public Steam profile link at checkout' : 'Укажите ссылку на ваш Steam профиль при заказе' },
      ],
    };
  }

  // 3. VDS Серверы
  if (itemType === 'vds') {
    return {
      topCategoryName: isEn ? 'DEDICATED SERVERS' : 'ВЫДЕЛЕННЫЕ СЕРВЕРЫ',
      badgeAccess: 'VDS HOST',
      inspectPills: [
        { label: isEn ? 'Bandwidth' : 'Канал', val: '1 Gbps', highlight: false },
        { label: isEn ? 'Storage' : 'Диск', val: 'NVMe SSD', highlight: false },
        { label: isEn ? 'Uptime' : 'Аптайм', val: '24/7 ONLINE', highlight: true },
      ],
      cards: [
        { title: isEn ? 'PORT SPEED:' : 'Скорость порта:', val: '1 GBPS PORT', desc: isEn ? 'Unlimited high-speed data transfer pipeline' : 'Безлимитный скоростной канал передачи данных' },
        { title: isEn ? 'STORAGE SUBSYSTEM:' : 'Дисковая подсистема:', val: 'NVME SSD HIGH-SPEED', desc: isEn ? 'Ultra-fast read/write IOPS for intensive tasks' : 'Сверхбыстрая скорость чтения/записи для любых задач' },
        { title: isEn ? 'DATA CENTER LOCATION:' : 'Локация ЦОД:', val: isEn ? 'FINLAND / GERMANY' : 'ФИНЛЯНДИЯ / ГЕРМАНИЯ', desc: isEn ? 'Low ping to EU and CIS routing' : 'Минимальный пинг до РФ и европейских серверов' },
        { title: isEn ? 'DDOS PROTECTION:' : 'DDoS защита:', val: 'ANTI-DDOS PRO 24/7', desc: isEn ? 'Upstream scrubbing against volumetric floods' : 'Фильтрация паразитного трафика на уровне магистрали' },
        { title: isEn ? 'INFRASTRUCTURE UPTIME:' : 'Аптайм инфраструктуры:', val: isEn ? '99.9% GUARANTEE' : '99.9% ГАРАНТИЯ', desc: isEn ? 'Redundant power arrays and continuous telemetry' : 'Резервированное питание и постоянный мониторинг' },
        { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: 'IP : ROOT : PASSWORD', desc: isEn ? 'Automated dispatch of SSH root credentials' : 'Автоматическая выдача реквизитов доступа к SSH' },
      ],
    };
  }

  // 4. Steam Гифты и Услуги
  if (itemType === 'gift' || itemType === 'service') {
    return {
      topCategoryName: isEn ? 'STEAM SERVICES' : 'STEAM УСЛУГИ',
      badgeAccess: itemType === 'gift' ? 'STEAM GIFT' : 'SERVICE',
      inspectPills: [
        { label: isEn ? 'Service' : 'Услуга', val: itemType === 'gift' ? 'Steam Gift' : (isEn ? 'Custom Matching' : 'Подбор'), highlight: false },
        { label: isEn ? 'Savings' : 'Экономия', val: itemType === 'gift' ? (isEn ? '30% of price' : '30% цены') : (isEn ? 'By budget' : 'По бюджету'), highlight: false },
        { label: isEn ? 'Guarantee' : 'Гарантия', val: isEn ? '100% DISPATCH' : '100% ВЫДАЧА', highlight: true },
      ],
      cards: [
        { title: isEn ? 'SERVICE TYPE:' : 'Тип услуги:', val: itemType === 'gift' ? (isEn ? 'LICENSED STEAM GIFT' : 'ЛИЦЕНЗИОННЫЙ STEAM GIFT') : (isEn ? 'INDIVIDUAL MATCHING' : 'ИНДИВИДУАЛЬНЫЙ ПОДБОР'), desc: isEn ? 'Direct transfer to your primary Steam account' : 'Прямая отправка на ваш основной аккаунт' },
        { title: isEn ? 'ACTIVATION REGION:' : 'Регион активации:', val: 'GLOBAL / REGION FREE', desc: isEn ? 'Works worldwide without VPN limits' : 'Работает без ограничений и VPN в любом регионе' },
        { title: isEn ? 'SAVINGS:' : 'Экономия:', val: itemType === 'gift' ? (isEn ? 'UP TO 70% OFF STEAM STORE' : 'ДО 70% ОТ ЦЕНЫ STEAM') : (isEn ? 'ON DEMAND' : 'ПО ДОГОВОРЁННОСТИ'), desc: isEn ? 'Genuine savings compared to Steam Store' : 'Честная выгода по сравнению с магазином Steam' },
        { title: isEn ? 'LICENSE:' : 'Лицензия:', val: isEn ? 'PERMANENT (FOREVER)' : 'НАВСЕГДА (FOREVER)', desc: isEn ? 'Game stays permanently in your library' : 'Игра навсегда остаётся в вашей личной библиотеке' },
        { title: isEn ? 'GUARANTEE:' : 'Гарантия:', val: isEn ? '100% DELIVERY' : '100% ДОСТАВКА', desc: isEn ? 'Operator assistance until claim is confirmed' : 'Полная поддержка оператора до подтверждения получения' },
        { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: isEn ? 'STEAM CLIENT GIFT' : 'ПОДАРОК В STEAM КЛИЕНТЕ', desc: isEn ? 'Bot/Operator adds as friend and dispatches gift' : 'Бот или оператор добавляет вас в друзья и отправляет гифт' },
      ],
    };
  }

  // 5. Rust
  if (categoryId === 'rust' || itemType === 'game') {
    const inactiveStr = product.specs?.inactivity && product.specs.inactivity !== '0 дн.'
      ? (isEn ? product.specs.inactivity.replace('дн.', 'days').replace('дней', 'days') : product.specs.inactivity)
      : (isEn ? 'VERIFIED' : 'ПРОВЕРЕН');
    const hoursStr = product.specs?.hours ? (isEn ? product.specs.hours.replace('ч.', 'hrs').replace('ч', 'hrs') : product.specs.hours) : (isEn ? '450 hrs' : '450 ч.');
    const warrantyStr = product.specs?.warranty ? (isEn ? product.specs.warranty.replace('3 часа', '3 HOURS').replace('3ч', '3h') : product.specs.warranty) : (isEn ? '3 HOURS' : '3 ЧАСА');

    return {
      topCategoryName: isEn ? 'RUST LICENSE' : 'RUST ЛИЦЕНЗИЯ',
      badgeAccess: product.specs?.access || 'RUST',
      inspectPills: [
        { label: isEn ? 'Inactivity' : 'Отлёжка', val: inactiveStr, highlight: false },
        { label: isEn ? 'Rust Hours' : 'Часы Rust', val: hoursStr, highlight: false },
        { label: isEn ? 'Warranty' : 'Гарантия', val: warrantyStr, highlight: true },
      ],
      cards: [
        { title: isEn ? 'GAME LICENSE:' : 'Лицензия игры:', val: 'RUST FULL ACCESS', desc: isEn ? 'Official Rust license on Steam platform' : 'Официальная лицензия Rust на платформе Steam' },
        { title: isEn ? 'PLAYTIME HOURS:' : 'Сыграно времени:', val: hoursStr, desc: isEn ? 'Playtime counter verified via public Steam profile' : 'Счётчик часов проверен через открытый профиль' },
        { title: isEn ? 'VAC & BANS:' : 'VAC & Блокировки:', val: isEn ? 'CLEAN (0 BANS)' : 'ЧИСТО (0 БАНОВ)', desc: isEn ? 'Clean account with zero EAC / VAC penalties' : 'Чистый аккаунт без блокировок EAC / VAC' },
        { title: isEn ? 'INACTIVITY:' : 'Отлёжка:', val: inactiveStr, desc: isEn ? 'Extended inactivity dormant period' : 'Длительный период неактивности владельца' },
        { title: isEn ? 'WARRANTY PERIOD:' : 'Срок гарантии:', val: warrantyStr, desc: isEn ? 'Full validation and replacement escrow' : 'Сопровождение и проверка работоспособности' },
        { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: isEn ? 'LOGIN : PASSWORD (+ EMAIL)' : 'LOGIN : PASSWORD (+ ПОЧТА)', desc: isEn ? 'Instant automated delivery in browser' : 'Моментальная автовыдача данных в браузере' },
      ],
    };
  }

  // 6. CS2 Default
  const inactiveStr = product.specs?.inactivity && product.specs.inactivity !== '0 дн.' && product.specs.inactivity !== '0 дней'
    ? (isEn ? product.specs.inactivity.replace('дн.', 'days').replace('дней', 'days') : product.specs.inactivity)
    : (isEn ? '18+ DAYS' : '18+ дн.');
  const hoursStr = product.specs?.hours ? (isEn ? product.specs.hours.replace('ч.', 'hrs').replace('ч', 'hrs') : product.specs.hours) : (isEn ? '24 hrs' : '24 ч.');
  const warrantyStr = product.specs?.warranty ? (isEn ? product.specs.warranty.replace('3 часа', '3 HOURS').replace('3ч', '3h') : product.specs.warranty) : (isEn ? '3 HOURS' : '3 ЧАСА');
  const rankStr = product.specs?.rank ? (isEn ? product.specs.rank.replace('Калибровка', 'Unranked / Calibration').replace('Чистый', 'Clean') : product.specs.rank) : (isEn ? 'UNRANKED / CALIBRATION' : 'Калибровка');
  const medalsStr = product.specs?.medals ? (isEn ? product.specs.medals.replace('медалей', 'medals').replace('Медалей', 'Medals') : product.specs.medals) : (isEn ? 'Prime' : 'Prime');
  const deliveryStr = product.specs?.emailChange === 'Да' ? (isEn ? 'LOGIN : PASSWORD + EMAIL' : 'LOGIN : PASSWORD + ПОЧТА') : 'LOGIN : PASSWORD';

  return {
    topCategoryName: isEn ? 'CS2 PRIME ACCOUNTS' : (product.categoryName || 'CS2 PRIME АККАУНТЫ'),
    badgeAccess: product.specs?.access || 'CS2 PRIME',
    inspectPills: [
      { label: isEn ? 'Inactivity' : 'Отлёжка', val: inactiveStr, highlight: false },
      { label: isEn ? 'CS2 Hours' : 'Часы CS2', val: hoursStr, highlight: false },
      { label: isEn ? 'Warranty' : 'Гарантия', val: warrantyStr, highlight: true },
    ],
    cards: [
      { title: isEn ? 'RANK / PREMIER:' : 'Ранг / Премьер:', val: rankStr, desc: isEn ? 'Clean match history (0 bans)' : 'Чисто (0 банов)' },
      { title: isEn ? 'MEDALS & TENURE:' : 'Медали и выслуга:', val: medalsStr, desc: isEn ? 'Clean match history (0 bans)' : 'Чисто (0 банов)' },
      { title: isEn ? 'PLAYTIME HOURS:' : 'Сыграно времени:', val: hoursStr, desc: isEn ? 'Clean match history (0 bans)' : 'Чисто (0 банов)' },
      { title: isEn ? 'VAC & BANS:' : 'VAC & Блокировки:', val: isEn ? 'CLEAN (0 BANS)' : 'Чисто (0 банов)', desc: isEn ? 'Clean match history (0 bans)' : 'Чисто (0 банов)' },
      { title: isEn ? 'WARRANTY PERIOD:' : 'Срок гарантии:', val: warrantyStr, desc: isEn ? 'Clean match history (0 bans)' : 'Чисто (0 банов)' },
      { title: isEn ? 'DELIVERY FORMAT:' : 'Формат выдачи:', val: deliveryStr, desc: isEn ? 'Automated' : (product.specs?.delivery || 'Автоматическая') },
    ],
  };
};

export const ProductPage = ({ product: initialProduct, onNavigate, onSelectProduct, onBuy }) => {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const isEn = lang === 'en';
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('crypto');
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'warranty' | 'support'
  const [copiedId, setCopiedId] = useState(false);
  const [stockTick, setStockTick] = useState(0);

  useEffect(() => {
    syncLiveStockFromSupplier().then(() => {
      setStockTick((t) => t + 1);
    });

    const handleSync = () => setStockTick((t) => t + 1);
    window.addEventListener('sharpbuy-stock-synced', handleSync);
    return () => window.removeEventListener('sharpbuy-stock-synced', handleSync);
  }, []);

  // Всегда находим полный объект товара по ID из базы данных
  const product = (initialProduct && initialProduct.id ? PRODUCTS.find((p) => p.id === initialProduct.id) : null) || initialProduct || PRODUCTS[0];

  // Похожие товары в той же категории
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS
      .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.category === product.category))
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0E0D0C] pt-32 text-center text-[#F3F1EC]">
        <p className="font-mono text-sm text-white/60">{isEn ? 'Item not selected' : 'Товар не выбран'}</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-4 font-mono text-xs text-[#E8583A] underline cursor-pointer"
        >
          {isEn ? 'Return to catalog' : 'Вернуться в каталог'}
        </button>
      </div>
    );
  }

  const imageSrc = product.image || `/products/${product.id}.jpeg`;
  const shortId = product.id.slice(-6);
  const totalSum = (product.price * quantity).toLocaleString('ru-RU');
  const detailSpecs = getProductDetailSpecs(product, lang);

  const handleCopyId = () => {
    navigator.clipboard.writeText(`ID-${product.id}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const paymentMethods = [
    { id: 'crypto', label: 'Crypto (USDT / TON / BTC / LTC)', fee: '0%' },
    { id: 'wallet', label: isEn ? 'Account Balance / Wallet' : 'Баланс аккаунта / Кошелек', fee: '0%' },
  ];

  // Имитация отзывов для премиального отображения
  const sampleReviews = isEn ? [
    {
      author: 'Alexander K.',
      date: 'Today, 18:42',
      stars: 5,
      tag: 'CS2 PRIME NFA',
      text: 'Instant login through the launcher. Inactivity matches the description 100%, even more medals than expected. Highly recommend!',
    },
    {
      author: 'dmitry_cs',
      date: 'Yesterday, 22:15',
      stars: 5,
      tag: 'VERIFIED BUYER',
      text: 'Purchasing my 3rd account in this store. Instant dispatch worked in 2 seconds, Premier rating 16.2k, prime clean.',
    },
    {
      author: 'Vortex_Prime',
      date: '2 days ago',
      stars: 5,
      tag: 'ZERO BANS',
      text: 'Great price for this level of inactivity. Support answered launcher questions under a minute.',
    },
  ] : [
    {
      author: 'Александр К.',
      date: 'Сегодня, 18:42',
      stars: 5,
      tag: 'CS2 PRIME NFA',
      text: 'Вход прошел мгновенно через лаунчер. Отлёжка совпадает с описанием на 100%, медалей даже больше чем думал. Рекомендую!',
    },
    {
      author: 'dmitry_cs',
      date: 'Вчера, 22:15',
      stars: 5,
      tag: 'ПРОВЕРЕННЫЙ ПОКУПАТЕЛЬ',
      text: 'Беру уже третий аккаунт в шопе. Автовыдача сработала за 2 секунды, рейтинг Премьер 16.2k, прайм чистый.',
    },
    {
      author: 'Vortex_Prime',
      date: '2 дня назад',
      stars: 5,
      tag: 'БЕЗ БЛОКИРОВОК',
      text: 'Отличная цена за такую отлёжку. Поддержка ответила на вопрос по лаунчеру буквально за минуту.',
    },
  ];

  const currentReviews = product.reviews && product.reviews.length > 0 ? product.reviews : sampleReviews;

  const categoryDisplayTitle = isEn
    ? (product.categoryId === 'cs2nfa' ? 'CS2 PRIME NFA ACCOUNTS' : product.categoryId === 'cs2full' ? 'CS2 FULL ACCESS ACCOUNTS' : product.categoryId === 'rust' ? 'RUST ACCOUNTS' : product.categoryId === 'cs2cfg' ? 'CS2 CONFIGS' : product.categoryId === 'steam' ? 'STEAM SERVICES' : 'CS2 PRIME CATEGORY')
    : (product.categoryName || 'CS2 PRIME КАТЕГОРИЯ');

  return (
    <div className="relative min-h-screen bg-[#0A0A09] pt-24 pb-28 text-[#F3F1EC] selection:bg-[#E8583A]/30">
      {/* Фоновая текстура */}
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.035]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">

        {/* ── 1. ХЛЕБНЫЕ КРОШКИ И ТЕЛЕМЕТРИЧЕСКИЙ БЕЙДЖ ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-white/40 border-b border-white/[0.06] pb-3.5">
          <nav className="flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="transition-colors hover:text-white cursor-pointer">
              {t('nav_home')}
            </button>
            <span>/</span>
            <button onClick={() => onNavigate('catalog')} className="transition-colors hover:text-white cursor-pointer">
              {t('nav_catalog')}
            </button>
            <span>/</span>
            {product.categoryId && (
              <>
                <button
                  onClick={() => {
                    window.location.hash = `category/${product.categoryId}`;
                  }}
                  className="transition-colors hover:text-white cursor-pointer uppercase"
                >
                  {categoryDisplayTitle}
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-[#E8583A] font-semibold tracking-wide uppercase truncate max-w-xs sm:max-w-md">
              #{shortId}
            </span>
          </nav>

          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 font-bold text-white/80">
              ID #{shortId}
            </span>
            <span>&middot;</span>
            <span className="text-white/60">{isEn ? 'INSTANT DELIVERY ~3S' : 'АВТОВЫДАЧА ~3 СЕК'}</span>
            <span>&middot;</span>
            <span className="text-white/40">{isEn ? '100% IN STOCK' : '100% В НАЛИЧИИ'}</span>
          </div>
        </div>

        {/* ── 2. ВЕРХНИЙ ГЛАВНЫЙ ЭКРАН: ИНСПЕКТОР (СЛЕВА) + СТАНЦИЯ ПОКУПКИ (СПРАВА) ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 mb-12">

          {/* ═══ ЛЕВАЯ ЧАСТЬ: ARMORY INSPECT VIEWPORT (7 КОЛОНОК) ═══ */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111215] p-5 sm:p-6 shadow-2xl">
              
              {/* Верхняя статусная строка инспектора */}
              <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-white/40 border-b border-white/[0.06] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#E8583A]/15 border border-[#E8583A]/30 px-2 py-0.5 font-bold text-[#E8583A] uppercase tracking-wider">
                    {product.specs?.access || 'CS2 ASSET'}
                  </span>
                  <span className="text-white/60 uppercase">
                    {product.specs?.emailChange === 'Да'
                      ? (isEn ? 'FULL ACCESS' : 'ПОЛНЫЙ ДОСТУП')
                      : (isEn ? 'NFA INACTIVE' : 'NFA С ОТЛЁЖКОЙ')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : `${isEn ? 'SKU' : 'АРТИКУЛ'} #${shortId}`}
                </button>
              </div>

              {/* Главный 4:3 экран товара */}
              <div className="relative z-10 my-1 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/[0.08] shadow-inner">
                {/* Бейдж типа доступа на фото */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="rounded-lg bg-black/80 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-black text-white border border-white/15 tracking-wider uppercase shadow-xl">
                    {product.specs?.access || 'CS2 PRIME'}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-20">
                  <span className="rounded-lg bg-black/80 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-bold text-white/80 border border-white/15 uppercase tracking-wider">
                    REGION FREE
                  </span>
                </div>

                <img
                  src={imageSrc}
                  alt={isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Нижняя телеметрия инспектора */}
              <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 font-mono text-center text-xs border-t border-white/[0.06] pt-3.5">
                {detailSpecs.inspectPills.map((pill, pIdx) => (
                  <div
                    key={pIdx}
                    className={`rounded-xl p-2 border ${
                      pill.highlight
                        ? 'bg-[#E8583A]/10 border-[#E8583A]/20 text-[#E8583A]'
                        : 'bg-black/40 border-white/[0.05] text-white'
                    }`}
                  >
                    <div className={`text-[10px] uppercase tracking-wider ${pill.highlight ? 'text-[#E8583A]/80' : 'text-white/40'}`}>
                      {pill.label}
                    </div>
                    <div className="font-bold text-[12px] mt-0.5 truncate">
                      {pill.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ ПРАВАЯ ЧАСТЬ: ПАНЕЛЬ ЗАКАЗА (5 КОЛОНОК) ═══ */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.09] bg-[#111215] p-6 sm:p-7 shadow-2xl space-y-6">
              
              {/* Заголовок и описание */}
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-wider mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                  <span>{categoryDisplayTitle}</span>
                </div>
                <h1 className="font-sans text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F3F1EC] leading-tight">
                  {isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
                </h1>
                {product.englishTitle && !isEn && (
                  <div className="mt-1 font-mono text-xs text-white/40 uppercase tracking-wider">
                    {product.englishTitle}
                  </div>
                )}
                <p className="mt-3 font-sans text-xs text-white/70 leading-relaxed">
                  {isEn ? (product.englishSummary || product.englishTitle || 'Prime enabled. Zero bans, full access, and clean match history guaranteed.') : (product.summaryPurpose || product.description)}
                </p>
              </div>

              {/* Стоимость и Количество */}
              <div className="rounded-xl border border-white/[0.07] bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                      {isEn ? 'Price per item:' : 'Цена за позицию:'}
                    </div>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="font-mono text-3xl font-black text-[#F3F1EC] tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="font-mono text-sm text-white/35 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Контрол количества */}
                  <div className="flex items-center rounded-xl border border-white/[0.1] bg-[#15161A] font-mono text-xs p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-white/60 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.06]"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 font-bold text-white min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => { const maxS = product.stockCount !== undefined ? product.stockCount : (product.inStockCount || 4); setQuantity((q) => Math.min(maxS, q + 1)); }}
                      className="px-2.5 py-1 text-white/60 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.06]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Способы оплаты (Быстрый выбор) */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider">
                  <span>{isEn ? 'Payment method:' : 'Способ оплаты:'}</span>
                  <span className="text-white/60">{isEn ? 'No hidden fees' : 'Без скрытых комиссий'}</span>
                </div>
                <div className="space-y-1.5">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs transition-all cursor-pointer ${
                        selectedPayment === pm.id
                          ? 'border border-[#E8583A] bg-[#E8583A]/15 text-white font-bold shadow-[0_0_12px_rgba(232,88,58,0.2)]'
                          : 'border border-white/[0.06] bg-black/40 text-white/70 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                            selectedPayment === pm.id ? 'border-[#E8583A]' : 'border-white/30'
                          }`}
                        >
                          {selectedPayment === pm.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></div>
                          )}
                        </div>
                        <span>{pm.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-white/40">{pm.fee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Главная кнопка моментальной оплаты */}
              {product.inStock !== false ? (
                <button
                  type="button"
                  onClick={() => onBuy && onBuy({ ...product, quantity, selectedPayment })}
                  className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#E8583A] font-sans text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-[#FF6B4A] hover:shadow-[0_0_25px_rgba(232,88,58,0.45)] cursor-pointer"
                >
                  <span>{isEn ? 'BUY FOR' : 'КУПИТЬ ЗА'} {formatPrice((product.price || 50) * quantity)}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 font-sans text-sm font-bold uppercase tracking-wider text-white/35 cursor-not-allowed"
                >
                  {isEn ? 'TEMPORARILY OUT OF STOCK' : 'ТОВАР ВРЕМЕННО ЗАКОНЧИЛСЯ'}
                </button>
              )}

              {/* Гарантийные буллеты */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-white/50 border-t border-white/[0.06] pt-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8583A]">✓</span>
                  <span>{isEn ? 'INSTANT DELIVERY ~3S' : 'АВТОВЫДАЧА ~3 СЕК'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8583A]">✓</span>
                  <span>{isEn ? 'LOGIN GUARANTEE' : 'ГАРАНТИЯ НА ВХОД'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8583A]">✓</span>
                  <span>{isEn ? 'TELEGRAM RECEIPT' : 'ЧЕК В TELEGRAM'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8583A]">✓</span>
                  <span>{isEn ? '24/7 SUPPORT' : 'ПОДДЕРЖКА 24/7'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 3. СРЕДНИЙ ЭКРАН: ХАРАКТЕРИСТИКИ И СПЕЦИФИКАЦИЯ (6 КАРТОЧЕК) ── */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 font-mono text-sm font-black uppercase text-white tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
              <span>{isEn ? 'SPECIFICATIONS & DETAILS' : 'ХАРАКТЕРИСТИКИ И СПЕЦИФИКАЦИЯ'} #{shortId}</span>
            </div>
            <div className="font-mono text-xs text-white/40">{isEn ? '100% VALIDATED BEFORE DISPATCH' : '100% ВАЛИДАЦИЯ ПЕРЕД ВЫДАЧЕЙ'}</div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {detailSpecs.cards.map((card, cIdx) => (
              <div
                key={cIdx}
                className={`rounded-2xl border p-4 space-y-1.5 ${
                  cIdx === 4
                    ? 'border-[#E8583A]/30 bg-[#E8583A]/5'
                    : 'border-white/[0.08] bg-[#121316]'
                }`}
              >
                <div className={`font-mono text-[10px] uppercase tracking-wider ${cIdx === 4 ? 'text-[#E8583A]/80' : 'text-white/40'}`}>
                  {card.title}
                </div>
                <div className={`font-sans text-lg font-black uppercase ${cIdx === 4 ? 'text-[#E8583A]' : 'text-white'}`}>
                  {card.val}
                </div>
                <div className="font-mono text-[11px] text-white/50">
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. ПОСЛЕ ПОЛУЧЕНИЯ ТОВАРА (3 ШАГА РЕГЛАМЕНТА) ── */}
        <div className="mb-12 rounded-2xl border border-white/[0.09] bg-[#111215] p-6 sm:p-7 shadow-xl">
          <div className="mb-5 font-mono text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/[0.08] pb-3">
            {isEn ? 'POST-PURCHASE STEP-BY-STEP GUIDELINES' : 'ПОРЯДОК ДЕЙСТВИЙ ПОСЛЕ ПОЛУЧЕНИЯ'}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Шаг 1 */}
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.08] font-mono text-xs font-black text-white">
                  01
                </span>
                <span className="font-sans text-sm font-bold text-white">
                  {isEn ? 'Receive Credentials' : 'Получите реквизиты'}
                </span>
              </div>
              <p className="font-sans text-xs text-white/60 leading-relaxed">
                {isEn
                  ? 'Account login credentials and token appear on-screen immediately after payment confirmation and are sent to your email.'
                  : 'Данные аккаунта появятся на экране и сохранятся в истории ваших заказов сразу после подтверждения транзакции.'}
              </p>
            </div>

            {/* Шаг 2 */}
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.08] font-mono text-xs font-black text-white">
                  02
                </span>
                <span className="font-sans text-sm font-bold text-white">
                  {isEn ? 'Authenticate in Client' : 'Авторизуйтесь в клиенте'}
                </span>
              </div>
              <p className="font-sans text-xs text-white/60 leading-relaxed">
                {isEn
                  ? 'For NFA accounts, launch SHARPBUY Launcher without changing email/password. For Full Access, bind your own email.'
                  : 'Для NFA аккаунтов используйте SHARPBUY Launcher без смены почты и пароля. Для Full Access — привяжите свою почту.'}
              </p>
            </div>

            {/* Шаг 3 */}
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E8583A]/20 font-mono text-xs font-black text-[#E8583A]">
                  03
                </span>
                <span className="font-sans text-sm font-bold text-white">
                  {isEn ? 'Warranty Support' : 'Гарантийный саппорт'}
                </span>
              </div>
              <p className="font-sans text-xs text-white/60 leading-relaxed">
                {isEn
                  ? 'In case of any issues, message our operator at @SharpBuySupport attaching your Order ID #' + shortId + '.'
                  : `В случае любых вопросов напишите оператору в @SharpBuySupport, прикрепив номер заказа #${shortId}.`}
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. ИНТЕРАКТИВНЫЕ ВКЛАДКИ РЕГЛАМЕНТА ── */}
        <div className="mb-12 rounded-2xl border border-white/[0.09] bg-[#111215] p-6 sm:p-7 shadow-xl">
          {/* Меню табов */}
          <div className="flex flex-wrap items-center gap-6 border-b border-white/[0.08] pb-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`pb-2 transition-all cursor-pointer ${
                activeTab === 'instructions'
                  ? 'border-b-2 border-[#E8583A] font-bold text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {isEn ? 'LOGIN INSTRUCTIONS' : 'ИНСТРУКЦИЯ ДЛЯ ВХОДА'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('warranty')}
              className={`pb-2 transition-all cursor-pointer ${
                activeTab === 'warranty'
                  ? 'border-b-2 border-[#E8583A] font-bold text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {isEn ? 'WARRANTY TERMS' : 'УСЛОВИЯ ГАРАНТИИ'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`pb-2 transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'border-b-2 border-[#E8583A] font-bold text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {isEn ? 'SUPPORT DESK' : 'СЛУЖБА ПОДДЕРЖКИ'}
            </button>
          </div>

          {/* Контент табов */}
          <div className="pt-5 font-sans text-xs text-white/75 leading-relaxed">
            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <p>
                  {isEn
                    ? 'To authenticate on NFA accounts, use the official SHARPBUY Launcher client. Full step-by-step guidance is available in the instructions section.'
                    : 'Для авторизации в NFA аккаунтах используется официальный клиент SHARPBUY Launcher. Полное пошаговое руководство с видео-примерами доступно в разделе инструкций.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="/SharpBuy_Launcher.exe" download="SharpBuy_Launcher.exe"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E8583A] px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-[#FF6B4A] transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{isEn ? 'DOWNLOAD SHARPBUY LAUNCHER' : 'СКАЧАТЬ SHARPBUY LAUNCHER'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onNavigate('instructions')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/40 px-4 py-2.5 font-mono text-xs font-bold text-white/80 hover:border-white/30 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{isEn ? 'FULL INSTRUCTIONS' : 'ПОЛНАЯ ИНСТРУКЦИЯ'}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="space-y-4">
                <p>
                  {isEn
                    ? 'The warranty covers credential validity upon initial login or within 3 hours (for tariffs with 3h warranty). Changing email or password on NFA accounts is prohibited.'
                    : 'Гарантия покрывает невалидность данных на момент первого входа либо в течение 3 часов (для тарифов с 3ч гарантией). Запрещается смена почты или пароля на NFA аккаунтах.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('nfa-warranty')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E8583A] px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-[#FF6B4A] transition-colors cursor-pointer"
                  >
                    <span>{isEn ? 'VIEW WARRANTY POLICY' : 'ОТКРЫТЬ ПРАВИЛА ГАРАНТИИ'}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-4">
                <p>
                  {isEn
                    ? 'Support operators are available daily from 08:00 to 24:00 MSK via official Telegram. Average response time is under 2 minutes.'
                    : 'Операторы службы поддержки отвечают ежедневно с 08:00 до 24:00 МСК в официальном Telegram. Среднее время первого ответа составляет менее 2 минут.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://t.me/SharpBuySupport"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E8583A] px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-[#FF6B4A] transition-colors"
                  >
                    <span>{isEn ? 'MESSAGE @SharpBuySupport' : 'НАПИСАТЬ В @SharpBuySupport'}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 6. ОТЗЫВЫ ПОКУПАТЕЛЕЙ (VERIFIED BUYERS) ── */}
        <div className="mb-12 rounded-2xl border border-white/[0.09] bg-[#111215] p-6 sm:p-7 shadow-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div>
              <div className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                {isEn ? `CUSTOMER REVIEWS / ${currentReviews.length}` : `ОТЗЫВЫ ПОКУПАТЕЛЕЙ / ${currentReviews.length}`}
              </div>
              <div className="font-sans text-sm font-bold text-white mt-0.5">
                {isEn ? '100% positive customer ratings' : '100% положительных оценок клиентов'}
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#FFE072] bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.06]">
              <span>★ 5.0</span>
              <span className="text-white/40">{isEn ? '/ 5.0 RATING' : '/ 5.0 РЕЙТИНГ'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {currentReviews.map((rev, idx) => (
              <div key={idx} className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs font-bold text-white">{rev.author}</span>
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.2 font-mono text-[9px] text-[#E8583A]">
                      {rev.tag}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">{rev.date}</span>
                </div>
                <div className="text-xs text-[#FFE072]">★★★★★</div>
                <p className="font-sans text-xs text-white/70 leading-relaxed">&laquo;{rev.text}&raquo;</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. ПОХОЖИЕ ПОЗИЦИИ В ЭТОЙ КАТЕГОРИИ ── */}
        {similarProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="font-mono text-xs font-bold text-white/50 uppercase tracking-wider">
                {isEn ? 'SIMILAR ITEMS IN CATEGORY' : 'ПОХОЖИЕ ПОЗИЦИИ В КАТЕГОРИИ'}
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = `category/${product.categoryId || 'cs2nfa'}`;
                }}
                className="font-mono text-xs text-[#E8583A] hover:underline cursor-pointer"
              >
                {isEn ? 'View all →' : 'Смотреть все →'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((p) => {
                const sId = p.id.slice(-6);
                const pImg = p.image || `/products/${p.id}.jpeg`;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121316] p-4 transition-all duration-300 hover:border-[#E8583A]/60 hover:bg-[#15161A] cursor-pointer"
                  >
                    <div>
                      <div className="mb-2.5 flex items-center justify-between font-mono text-[10px]">
                        <span className="text-white/35 font-semibold">#{sId}</span>
                        {p.specs?.inactivity && (
                          <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-white/70 border border-white/[0.08]">
                            {isEn ? p.specs.inactivity.replace('дн.', 'days').replace('дней', 'days') : p.specs.inactivity}
                          </span>
                        )}
                      </div>

                      <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/[0.07]">
                        <img
                          src={pImg}
                          alt={isEn ? (p.englishTitle || p.cleanTitle || p.title) : (p.cleanTitle || p.title)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <h4 className="font-sans text-xs font-black uppercase text-white group-hover:text-[#E8583A] transition-colors line-clamp-2 min-h-[32px]">
                        {isEn ? (p.englishTitle || p.cleanTitle || p.title) : (p.cleanTitle || p.title)}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <span className="font-mono text-lg font-black text-white">
                        {formatPrice(p.price)}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#E8583A] group-hover:underline">
                        {isEn ? 'INSPECT →' : 'ОСМОТР →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductPage;
