import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const HelpPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoute, setActiveRoute] = useState(1); // 1: Хочу купить, 2: Уже купил, 3: Есть проблема
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openFaqId, setOpenFaqId] = useState('PAY-01');

  const promptChips = lang === 'ru' ? [
    'Как купить',
    'Не пришёл товар',
    'Сменить пароль',
    'Возврат',
    'Гарантия',
  ] : [
    'How to buy',
    'Order not received',
    'Change password',
    'Refund policy',
    'Warranty terms',
  ];

  const categories = [
    { id: 'ALL', label: lang === 'ru' ? 'Все вопросы' : 'All Topics' },
    { id: 'BUY', label: lang === 'ru' ? 'Покупка' : 'Purchasing' },
    { id: 'PAY', label: lang === 'ru' ? 'Оплата' : 'Payment' },
    { id: 'DEL', label: lang === 'ru' ? 'Получение товара' : 'Delivery' },
    { id: 'SAFE', label: lang === 'ru' ? 'Безопасность' : 'Security' },
    { id: 'WAR', label: lang === 'ru' ? 'Гарантия' : 'Warranty' },
    { id: 'RET', label: lang === 'ru' ? 'Возврат' : 'Refunds' },
    { id: 'SUP', label: lang === 'ru' ? 'Поддержка' : 'Support Desk' },
  ];

  const allFaqs = useMemo(() => [
    {
      id: 'PAY-01',
      cat: 'PAY',
      q: lang === 'ru' ? 'Какие способы оплаты доступны?' : 'What payment methods are supported?',
      a: lang === 'ru'
        ? 'Мы принимаем СБП (Система быстрых платежей 0%), Банковские карты МИР / Visa / Mastercard, а также Криптовалюту (USDT, BTC, TON) и электронные кошельки.'
        : 'We accept SBP (Fast Payments System 0%), Debit/Credit Cards (MIR / Visa / Mastercard), and Cryptocurrencies (USDT, BTC, TON).',
    },
    {
      id: 'PAY-02',
      cat: 'PAY',
      q: lang === 'ru' ? 'Как быстро зачисляется платёж?' : 'How quickly are payments confirmed?',
      a: lang === 'ru'
        ? 'Оплата через СБП и банковские карты подтверждается шлюзом за 3–10 секунд. Криптовалютные транзакции обрабатываются после 1 подтверждения сети.'
        : 'SBP and card payments process within 3–10 seconds. Crypto transactions finalize after 1 network block confirmation.',
    },
    {
      id: 'DEL-01',
      cat: 'DEL',
      q: lang === 'ru' ? 'Как я получу купленный товар?' : 'How do I receive my purchased goods?',
      a: lang === 'ru'
        ? 'Если в карточке товара указана автовыдача, сразу после оплаты на экране отображаются данные от аккаунта (логин:пароль, код), а также дублируются на ваш email.'
        : 'For instant dispatch items, credentials (login:password:code) render on-screen immediately upon payment completion and are sent to your email.',
    },
    {
      id: 'DEL-02',
      cat: 'DEL',
      q: lang === 'ru' ? 'Что делать, если товар не пришёл автоматически?' : 'What if my order is not delivered automatically?',
      a: lang === 'ru'
        ? 'Проверьте папку «Спам» на почте. Если товар с ручной выдачей — саппорт свяжется с вами в порядке очереди. Также вы можете сразу написать в Telegram @SharpBuySupport с номером заказа.'
        : 'Check your Spam folder. For manual delivery items, our operator will dispatch goods promptly. You can also message @SharpBuySupport with your Order ID.',
    },
    {
      id: 'SAFE-01',
      cat: 'SAFE',
      q: lang === 'ru' ? 'Что делать сразу после покупки аккаунта?' : 'What should I do immediately after receiving an account?',
      a: lang === 'ru'
        ? 'Если для данного товара доступна смена данных (например, Full Access) — смените пароль и привяжите свою почту и Steam Guard в первые 15 минут. На NFA аккаунтах менять данные не следует, чтобы не нарушать условия гарантии.'
        : 'For Full Access accounts, change the password and bind your email and Steam Guard within 15 minutes. On NFA accounts, do not change credentials to maintain warranty.',
    },
    {
      id: 'SAFE-02',
      cat: 'SAFE',
      q: lang === 'ru' ? 'Можно ли менять почту и пароль на CS2 Prime NFA?' : 'Can I change email and password on CS2 Prime NFA?',
      a: lang === 'ru'
        ? 'На NFA (No Full Access) аккаунтах смена почты/пароля не предусмотрена. Смена данных аннулирует гарантию продавца согласно регламенту REG-02.'
        : 'On NFA (No Full Access) accounts, credential modifications are prohibited and void seller warranty per regulation REG-02.',
    },
    {
      id: 'WAR-01',
      cat: 'WAR',
      q: lang === 'ru' ? 'Как действует гарантия на аккаунты?' : 'How does the warranty policy work?',
      a: lang === 'ru'
        ? 'Гарантия действует на валидность аккаунта и соответствие описанию на момент покупки. Точный срок гарантии (до 30 дней) указан в карточке каждого конкретного товара.'
        : 'Warranty covers account validity and accurate spec match at checkout. The exact duration (up to 30 days) is displayed on each product card.',
    },
    {
      id: 'RET-01',
      cat: 'RET',
      q: lang === 'ru' ? 'В каких случаях возможен возврат средств?' : 'When are refunds issued?',
      a: lang === 'ru'
        ? 'Возврат средств осуществляется в полном объёме, если вы получили невалидный товар и оператор поддержки не может выдать аналогичную замену.'
        : 'Full refunds are issued if credentials are invalid upon delivery and our support team cannot provide an identical working replacement.',
    },
    {
      id: 'SUP-01',
      cat: 'SUP',
      q: lang === 'ru' ? 'Как связаться с живым оператором?' : 'How do I contact a live support operator?',
      a: lang === 'ru'
        ? 'Поддержка работает ежедневно с 08:00 до 24:00 МСК в официальном Telegram @SharpBuySupport. Среднее время первого ответа составляет менее 2 минут.'
        : 'Support operates daily from 08:00 to 24:00 MSK on Telegram @SharpBuySupport with average response time under 2 minutes.',
    },
  ], [lang]);

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((item) => {
      if (activeCategory !== 'ALL' && item.cat !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.q.toLowerCase().includes(q) ||
          item.a.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allFaqs, activeCategory, searchQuery]);

  const handleChipClick = (chip) => {
    setSearchQuery(chip);
    setActiveCategory('ALL');
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A09] pt-24 pb-28 text-[#F3F1EC] selection:bg-[#E8583A]/30">
      {/* Техническая фактура */}
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.035]"></div>

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
          <span className="text-[#E8583A] font-semibold">{lang === 'ru' ? 'Помощь' : 'Help Desk'}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Техническая строка статуса */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'ЦЕНТР ПОДДЕРЖКИ · 08:00–24:00 МСК' : 'HELP CENTER · 08:00–24:00 MSK'}
              </span>
            </div>

            {/* Заголовок */}
            <h1
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(38px, 4.2vw, 54px)',
                lineHeight: 0.95,
              }}
            >
              {lang === 'ru' ? (
                <>НА ЧТО НУЖЕН<br />ОТВЕТ?</>
              ) : (
                <>HOW CAN WE<br />HELP YOU?</>
              )}
            </h1>

            {/* Описание */}
            <p className="mt-3.5 max-w-xl font-sans text-sm text-white/60 leading-relaxed">
              {lang === 'ru'
                ? 'Выберите ситуацию, найдите инструкцию или напишите в поддержку.'
                : 'Browse FAQs, review guides, or connect with our support team.'}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-white/40 self-start sm:self-end">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
            <span>{lang === 'ru' ? 'ОТВЕТ < 2 МИНУТ' : 'RESPONSE < 2 MIN'}</span>
          </div>
        </div>

        {/* ── 3. ПОИСК И ПОДСКАЗКИ ── */}
        <div className="mb-12 space-y-3.5">
          {/* Поисковая строка 52px */}
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
              placeholder={lang === 'ru' ? 'Опишите вопрос: «как купить», «не пришёл товар», «сменить пароль»...' : 'Search query: "how to buy", "order not received", "password"...'}
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

          {/* Подсказки */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-white/50">
            <span className="text-white/30">{lang === 'ru' ? 'Подсказки:' : 'Quick tags:'}</span>
            {promptChips.map((chip, idx) => (
              <React.Fragment key={chip}>
                <button
                  onClick={() => handleChipClick(chip)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-white/60 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                >
                  {chip}
                </button>
                {idx < promptChips.length - 1 && <span className="text-white/20">&middot;</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── 4. ТРИ МАРШРУТА ПОЛЬЗОВАТЕЛЯ ── */}
        <div className="mb-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121110] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Маршрут 01: Хочу купить */}
            <div
              onClick={() => setActiveRoute(1)}
              className={`group relative flex flex-col justify-between p-7 transition-all duration-200 cursor-pointer ${
                activeRoute === 1 ? 'bg-[#151310]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E8583A]">
                    01 / {lang === 'ru' ? 'ХОЧУ КУПИТЬ' : 'NEW PURCHASE'}
                  </span>
                  <svg className="h-5 w-5 text-[#E8583A] transition-transform duration-200 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                </div>
                <p className="font-sans text-xs text-white/60 leading-relaxed">
                  {lang === 'ru'
                    ? 'Найти товар, выбрать удобную оплату и мгновенно получить данные.'
                    : 'Find items, choose convenient payment, and receive instant credentials.'}
                </p>
              </div>

              <div className="mt-6 font-mono text-[11px] font-semibold text-[#E8583A] transition-colors group-hover:text-[#FF6B4A]">
                {lang === 'ru' ? 'ОТКРЫТЬ ИНСТРУКЦИЮ →' : 'VIEW GUIDE →'}
              </div>

              {activeRoute === 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8583A]"></div>
              )}
            </div>

            {/* Маршрут 02: Уже купил */}
            <div
              onClick={() => setActiveRoute(2)}
              className={`group relative flex flex-col justify-between p-7 transition-all duration-200 cursor-pointer ${
                activeRoute === 2 ? 'bg-[#121418]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white/80">
                    02 / {lang === 'ru' ? 'УЖЕ КУПИЛ' : 'POST PURCHASE'}
                  </span>
                  <svg className="h-5 w-5 text-white/70 transition-transform duration-200 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="10" r="2" />
                    <path d="M12 12v3" />
                  </svg>
                </div>
                <p className="font-sans text-xs text-white/60 leading-relaxed">
                  {lang === 'ru'
                    ? 'Настроить аккаунт, активировать данные и сохранить надёжный доступ.'
                    : 'Configure launcher, activate credentials, and secure your session.'}
                </p>
              </div>

              <div className="mt-6 font-mono text-[11px] font-semibold text-white/70 transition-colors group-hover:text-white">
                {lang === 'ru' ? 'ОТКРЫТЬ ИНСТРУКЦИЮ →' : 'VIEW GUIDE →'}
              </div>

              {activeRoute === 2 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70"></div>
              )}
            </div>

            {/* Маршрут 03: Есть проблема */}
            <div
              onClick={() => setActiveRoute(3)}
              className={`group relative flex flex-col justify-between p-7 transition-all duration-200 cursor-pointer ${
                activeRoute === 3 ? 'bg-[#151212]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#E8583A]">
                    03 / {lang === 'ru' ? 'ЕСТЬ ПРОБЛЕМА' : 'ISSUE RESOLUTION'}
                  </span>
                  <svg className="h-5 w-5 text-[#E8583A] transition-transform duration-200 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                    <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
                  </svg>
                </div>
                <p className="font-sans text-xs text-white/60 leading-relaxed">
                  {lang === 'ru'
                    ? 'Подготовить номер заказа, скриншот и оперативно получить помощь.'
                    : 'Gather order ID and screenshots to receive immediate operator support.'}
                </p>
              </div>

              <div className="mt-6 font-mono text-[11px] font-semibold text-[#E8583A] transition-colors group-hover:text-[#FF6B4A]">
                {lang === 'ru' ? 'ОТКРЫТЬ ИНСТРУКЦИЮ →' : 'VIEW GUIDE →'}
              </div>

              {activeRoute === 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8583A]"></div>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. БЫСТРЫЕ ОТВЕТЫ (ДВУХКОЛОНОЧНАЯ БАЗА ЗНАНИЙ) ── */}
        <div className="mb-16 space-y-6">
          <div>
            <div className="font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
              {lang === 'ru' ? 'БАЗА ЗНАНИЙ' : 'KNOWLEDGE BASE'}
            </div>
            <h2 className="mt-1 font-sans text-xl font-extrabold uppercase tracking-tight text-[#F3F1EC]">
              {lang === 'ru' ? 'Быстрые ответы' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Левая колонка: категории */}
            <div className="lg:col-span-4 flex flex-col space-y-1 font-mono text-xs border-b border-white/[0.06] pb-4 lg:border-b-0 lg:border-r lg:pr-6">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white bg-white/[0.04] font-bold'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.01]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8583A]"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Правая колонка: вопросы */}
            <div className="lg:col-span-8 space-y-2">
              {filteredFaqs.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#121110] p-8 text-center">
                  <p className="font-mono text-sm text-white/50">
                    {lang === 'ru' ? `По запросу «${searchQuery}» ничего не найдено.` : `No matches found for "${searchQuery}".`}
                  </p>
                  <div className="mt-3">
                    <a
                      href="https://t.me/SharpBuySupport"
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-[#E8583A] underline"
                    >
                      {lang === 'ru' ? 'Не нашли ответ? Напишите оператору →' : 'Still need help? Contact support →'}
                    </a>
                  </div>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                        isOpen
                          ? 'border-white/[0.12] bg-[#161310]'
                          : 'border-white/[0.06] bg-[#121110] hover:border-white/[0.1]'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="relative flex w-full items-start justify-between p-4 text-left transition-colors cursor-pointer"
                      >
                        {isOpen && (
                          <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#E8583A]"></div>
                        )}
                        <div className="flex items-center gap-3 pr-4">
                          <span className="font-mono text-xs font-bold text-white/40">
                            {faq.id}
                          </span>
                          <span className="font-sans text-sm font-semibold text-[#F3F1EC]">
                            {faq.q}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-white/40 transition-transform duration-200 mt-1 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                          &or;
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/[0.05] p-4 pt-3 font-sans text-xs text-white/70 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── 7. БЛОК ОПЕРАТОРА НА СВЯЗИ ── */}
        <div className="flex flex-col gap-6 rounded-md border border-white/[0.08] bg-[#121110] p-7 sm:flex-row sm:items-center sm:justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="flex items-start gap-4">
            {/* Абстрактный геометрический знак канала поддержки */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#E8583A]/40 bg-[#141210] font-mono text-sm text-[#E8583A]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="#E8583A" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2.5" fill="#E8583A" />
              </svg>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#E8583A]"></span>
            </div>

            <div className="space-y-1">
              <div className="font-sans text-base font-extrabold uppercase tracking-tight text-[#F3F1EC]">
                {lang === 'ru' ? 'ОПЕРАТОР НА СВЯЗИ' : 'LIVE OPERATOR DESK'}
              </div>
              <div className="font-sans text-xs text-white/60">
                Telegram @SharpBuySupport
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/45">
                <span>{lang === 'ru' ? 'Среднее время ответа:' : 'Average response:'} <strong className="text-[#E8583A] font-semibold">&lt; 2 {lang === 'ru' ? 'минут' : 'min'}</strong></span>
                <span>&middot;</span>
                <span>{lang === 'ru' ? 'Работаем ежедневно:' : 'Operating hours:'} <strong className="text-white/80">08:00–24:00 MSK</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Главная кнопка Telegram */}
            <a
              href="https://t.me/SharpBuySupport"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[#E8583A]/50 bg-[#12100E] px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#F3F1EC] transition-all duration-300 hover:border-[#E8583A] hover:bg-[#1E1713]"
            >
              <div className="scanner-beam-line absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF6B4A] to-transparent opacity-70 transition-opacity group-hover:opacity-100"></div>
              <span>TELEGRAM @SharpBuySupport</span>
              <span className="font-mono text-[#E8583A] transition-transform duration-200 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
