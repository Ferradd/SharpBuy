import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ru: {
    // Header
    nav_home: 'Главная',
    nav_catalog: 'Каталог',
    nav_guarantees: 'Гарантии',
    nav_reviews: 'Отзывы',
    nav_info: 'Информация',
    nav_help: 'Помощь',
    nav_help_desc: 'FAQ и решение проблем',
    nav_rules: 'Правила',
    nav_rules_desc: 'Условия работы магазина',
    nav_instructions: 'Инструкции',
    nav_instructions_desc: 'Руководства для NFA аккаунтов',
    nav_nfa_warranty: 'Гарантия NFA',
    nav_nfa_warranty_desc: 'Регламент и шаблоны замены',
    nav_privacy: 'Конфиденциальность',
    nav_privacy_desc: 'Политика обработки данных',
    nav_support: 'Поддержка',
    nav_auto_delivery: 'Автовыдача 3 сек',

    // Hero
    hero_badge: 'КИБЕРСПОРТИВНЫЙ МАРКЕТПЛЕЙС 2026',
    hero_title_1: 'АККАУНТЫ & СКИНЫ',
    hero_title_2: 'С ГАРАНТИЕЙ',
    hero_subtitle: 'Мгновенная выдача за 3 секунды. Без банов, с полным доступом и чистой историей матчей.',
    hero_btn_catalog: 'ОТКРЫТЬ КАТАЛОГ',
    hero_btn_reviews: 'ЧИТАТЬ ОТЗЫВЫ',
    hero_stat_sales: 'Успешных сделок',
    hero_stat_time: 'Средняя выдача',
    hero_stat_rating: 'Рейтинг сервиса',
    hero_stat_warranty: 'Гарантия замены',

    // Live Feed
    live_title: 'ПРЯМОЙ ЭФИР ПОКУПОК',
    live_status: 'ОНЛАЙН',
    live_just_bought: 'только что купил',

    // Top Showcase / Categories
    showcase_badge: 'ТОП ВЫБОР',
    showcase_title: 'ПОПУЛЯРНЫЕ КАТЕГОРИИ',
    showcase_subtitle: 'Самые востребованные позиции с моментальной автовыдачей',
    btn_buy_now: 'Купить сейчас',
    btn_view_category: 'Смотреть все',
    in_stock: 'в наличии',
    from_price: 'от',

    // Catalog Page
    catalog_title: 'КАТАЛОГ ТОВАРОВ',
    catalog_subtitle: 'Выберите категорию или воспользуйтесь поиском по аккаунтам',
    catalog_search_placeholder: 'Поиск по названию (CS2, Prime, Rust, CFG)...',
    filter_all: 'Все категории',
    filter_cs2: 'CS2 Prime',
    filter_full_access: 'Full Access',
    filter_cfg: 'Конфиги',
    filter_rust: 'Rust',
    filter_steam: 'Steam Balance',

    // Guarantees Page
    guar_badge: '100% БЕЗОПАСНОСТЬ',
    guar_title: 'НАШИ ГАРАНТИИ',
    guar_subtitle: 'Мы гарантируем безопасность каждой покупки и прозрачные условия',
    guar_card1_title: 'Мгновенная автовыдача',
    guar_card1_desc: 'Данные от аккаунта и чеки отправляются в Telegram и на почту ровно через 3 секунды после оплаты.',
    guar_card2_title: '100% Валидность',
    guar_card2_desc: 'Каждый аккаунт проверяется внутренним парсером перед отправкой клиенту.',
    guar_card3_title: 'Защита и замена',
    guar_card3_desc: 'В случае любых проблем с доступом в гарантийный период — моментальная замена или возврат средств.',
    guar_card4_title: 'Поддержка 24/7',
    guar_card4_desc: 'Операторы на связи круглосуточно, среднее время ответа в чате — 2 минуты.',

    // Reviews Page
    reviews_badge: 'ПРОВЕРЕННЫЕ ОТЗЫВЫ',
    reviews_title: 'ОТЗЫВЫ ПОКУПАТЕЛЕЙ',
    reviews_subtitle: 'Реальный опыт более 14 000 геймеров со всего мира',
    reviews_verified: 'Проверенная покупка',
    reviews_all: 'Все оценки',

    // Help / FAQ Page
    help_badge: 'БАЗА ЗНАНИЙ',
    help_title: 'ЦЕНТР ПОДДЕРЖКИ',
    help_subtitle: 'Ответы на частые вопросы и инструкции по активации',
    help_search_placeholder: 'Поиск по базе знаний...',

    // Footer
    footer_desc: 'Премиальный киберспортивный маркетплейс аккаунтов, скинов и игровых ассетов.',
    footer_quick_links: 'Навигация',
    footer_legal: 'Юридическая информация',
    footer_terms: 'Условия обслуживания',
    footer_privacy: 'Политика конфиденциальности',
    footer_rules: 'Правила магазина',
    footer_copyright: '© 2026 SHARPBUY Inc. Все права защищены.',
    footer_disclaimer: 'Не аффилировано с Valve Corporation или Steam. Все торговые марки принадлежат их законным владельцам.',

    // Product Modal
    modal_buy_title: 'ОФОРМЛЕНИЕ ЗАКАЗА',
    modal_choose_payment: 'Способ оплаты',
    modal_promo_label: 'Промокод (если есть)',
    modal_promo_btn: 'Применить',
    modal_email_label: 'Ваш Telegram или Email',
    modal_pay_btn: 'ОПЛАТИТЬ ЗАКАЗ',
    modal_secure_badge: 'Защищенное SSL соединение',
  },
  en: {
    // Header
    nav_home: 'Home',
    nav_catalog: 'Catalog',
    nav_guarantees: 'Guarantees',
    nav_reviews: 'Reviews',
    nav_info: 'Information',
    nav_help: 'Help Center',
    nav_help_desc: 'FAQ & problem solving',
    nav_rules: 'Rules',
    nav_rules_desc: 'Store terms and conditions',
    nav_instructions: 'Instructions',
    nav_instructions_desc: 'Guides for NFA accounts',
    nav_nfa_warranty: 'NFA Warranty',
    nav_nfa_warranty_desc: 'Replacement terms & policy',
    nav_privacy: 'Privacy',
    nav_privacy_desc: 'Data processing policy',
    nav_support: 'Support',
    nav_auto_delivery: 'Instant Delivery 3s',

    // Hero
    hero_badge: 'ESPORTS GAMING MARKETPLACE 2026',
    hero_title_1: 'ACCOUNTS & SKINS',
    hero_title_2: 'WITH WARRANTY',
    hero_subtitle: 'Instant delivery in 3 seconds. Zero bans, full access, and clean match history guaranteed.',
    hero_btn_catalog: 'EXPLORE CATALOG',
    hero_btn_reviews: 'READ REVIEWS',
    hero_stat_sales: 'Successful Orders',
    hero_stat_time: 'Average Delivery',
    hero_stat_rating: 'Store Rating',
    hero_stat_warranty: 'Replacement Warranty',

    // Live Feed
    live_title: 'LIVE RECENT PURCHASES',
    live_status: 'LIVE',
    live_just_bought: 'just purchased',

    // Top Showcase / Categories
    showcase_badge: 'TOP SELECTION',
    showcase_title: 'POPULAR CATEGORIES',
    showcase_subtitle: 'Most demanded gaming items with instant automated delivery',
    btn_buy_now: 'Buy Now',
    btn_view_category: 'View All',
    in_stock: 'in stock',
    from_price: 'from',

    // Catalog Page
    catalog_title: 'PRODUCT CATALOG',
    catalog_subtitle: 'Choose a category or search for specific accounts',
    catalog_search_placeholder: 'Search by title (CS2, Prime, Rust, CFG)...',
    filter_all: 'All Categories',
    filter_cs2: 'CS2 Prime',
    filter_full_access: 'Full Access',
    filter_cfg: 'Configs',
    filter_rust: 'Rust',
    filter_steam: 'Steam Balance',

    // Guarantees Page
    guar_badge: '100% SECURE TRANSACTIONS',
    guar_title: 'OUR GUARANTEES',
    guar_subtitle: 'We guarantee the safety of every transaction and 100% transparent terms',
    guar_card1_title: 'Instant Automated Delivery',
    guar_card1_desc: 'Credentials and receipts are dispatched to your Telegram or Email within 3 seconds of payment.',
    guar_card2_title: '100% Valid Credentials',
    guar_card2_desc: 'Every account is verified by our automated parser before dispatch to ensure zero issues.',
    guar_card3_title: 'Protection & Replacement',
    guar_card3_desc: 'In case of any access issues during warranty period — instant replacement or full refund.',
    guar_card4_title: '24/7 Dedicated Support',
    guar_card4_desc: 'Support agents are online round the clock, average response time is under 2 minutes.',

    // Reviews Page
    reviews_badge: 'VERIFIED REVIEWS',
    reviews_title: 'CUSTOMER FEEDBACK',
    reviews_subtitle: 'Real gaming experience from over 14,000 players worldwide',
    reviews_verified: 'Verified Purchase',
    reviews_all: 'All Ratings',

    // Help / FAQ Page
    help_badge: 'KNOWLEDGE BASE',
    help_title: 'HELP & SUPPORT',
    help_subtitle: 'Frequently asked questions and step-by-step activation guides',
    help_search_placeholder: 'Search knowledge base...',

    // Footer
    footer_desc: 'Premium esports marketplace for gaming accounts, skins, and digital assets.',
    footer_quick_links: 'Navigation',
    footer_legal: 'Legal Info',
    footer_terms: 'Terms of Service',
    footer_privacy: 'Privacy Policy',
    footer_rules: 'Store Rules',
    footer_copyright: '© 2026 SHARPBUY Inc. All rights reserved.',
    footer_disclaimer: 'Not affiliated with Valve Corporation or Steam. All trademarks belong to their respective owners.',

    // Product Modal
    modal_buy_title: 'CHECKOUT ORDER',
    modal_choose_payment: 'Payment Method',
    modal_promo_label: 'Promo code (optional)',
    modal_promo_btn: 'Apply',
    modal_email_label: 'Your Telegram or Email',
    modal_pay_btn: 'PAY ORDER NOW',
    modal_secure_badge: 'Secure SSL Encrypted',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('sharpbuy_lang') || 'ru';
    } catch {
      return 'ru';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('sharpbuy_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['ru']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
