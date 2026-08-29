import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const RulesPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(4); // 1 to 5 (Default 4: Проверка 15 минут)
  const [openRule, setOpenRule] = useState('RULE-01');

  const scrollToFullRules = () => {
    const el = document.getElementById('full-rules');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const stepsData = [
    {
      num: '01',
      title: lang === 'ru' ? 'ВЫБОР ТОВАРА' : 'PRODUCT SELECTION',
      shop: lang === 'ru'
        ? 'Предоставляет актуальную информацию, характеристики, описание и точные сроки гарантии в карточке каждого товара.'
        : 'Provides verified specifications, real inventory badges, and clear warranty terms on each product card.',
      buyer: lang === 'ru'
        ? 'Внимательно читает карточку товара, проверяет тип доступа (NFA / Full Access), условия и соответствие своим требованиям.'
        : 'Reads the product card thoroughly, checks access type (NFA / Full Access), and confirms requirements before checkout.',
    },
    {
      num: '02',
      title: lang === 'ru' ? 'ОПЛАТА' : 'SECURE PAYMENT',
      shop: lang === 'ru'
        ? 'Обеспечивает защищённый крипто-процессинг (USDT BEP-20, BNB) в сети BSC с мгновенным подтверждением за 3 секунды.'
        : 'Ensures encrypted crypto processing (USDT BEP-20, BNB) on BSC network with instant 3-second blockchain verification.',
      buyer: lang === 'ru'
        ? 'Оплачивает заказ переводом крипты на указанный адрес и сохраняет номер заказа / токен.'
        : 'Transfers crypto to the merchant address and retains the unique order reference ID and token.',
    },
    {
      num: '03',
      title: lang === 'ru' ? 'ПОЛУЧЕНИЕ' : 'INSTANT DISPATCH',
      shop: lang === 'ru'
        ? 'Выдаёт данные мгновенно на экран и отправляет копию на Email сразу после фиксации транзакции в сети.'
        : 'Dispatches valid credentials immediately on-screen and to Email within 3 seconds of blockchain confirmation.',
      buyer: lang === 'ru'
        ? 'Сохраняет полученный токен и использует SharpBuy Launcher для безопасного входа в Steam.'
        : 'Saves the delivered token and uses SharpBuy Launcher for secure automated Steam login.',
    },
    {
      num: '04',
      title: lang === 'ru' ? 'ГАРАНТИЯ 3 ЧАСА' : '3-HOUR WARRANTY',
      shop: lang === 'ru'
        ? 'Предоставляет автоматическую замену нерабочего аккаунта в 1 клик через встроенный Центр Гарантий.'
        : 'Provides automated 1-click replacement for dead accounts via the built-in Guarantee Center.',
      buyer: lang === 'ru'
        ? 'Проверяет вход через лаунчер сразу после покупки. При возникновении проблемы получает авто-замену.'
        : 'Tests login via launcher immediately. In case of issues, claims instant replacement in 1 click.',
    },
    {
      num: '05',
      title: lang === 'ru' ? 'ПОДДЕРЖКА' : 'ACTIVE SUPPORT',
      shop: lang === 'ru'
        ? 'Оказывает поддержку через Telegram @SharpBuySupport и решает любые нестандартные вопросы.'
        : 'Provides dedicated support via Telegram @SharpBuySupport and assists with any custom queries.',
      buyer: lang === 'ru'
        ? 'Соблюдает правила безопасности и бережно относится к полученным данным аккаунта.'
        : 'Adheres to safe usage guidelines and keeps login credentials confidential.',
    },
  ];

  const fullRulesList = [
    {
      id: 'RULE-01',
      num: '01',
      title: lang === 'ru' ? 'Общие положения' : 'General Provisions',
      summary: lang === 'ru' ? 'Что регулируют правила, статус магазина и когда они применяются' : 'Regulatory scope, service status, and terms of use',
      content: lang === 'ru' ? (
        <div className="space-y-3">
          <p>
            SHARPBUY &mdash; онлайн-сервис по предоставлению игрового доступа, цифровых товаров и аккаунтов Steam (Steam NFA, Steam FA, CS2 Prime, Rust, CFG и др.).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Совершая покупку в нашем магазине, вы автоматически подтверждаете, что ознакомились с настоящими правилами и принимаете их в полном объёме.</li>
            <li>Администрация оставляет за собой право изменять правила без предварительного уведомления. Актуальная версия всегда доступна на данной странице.</li>
            <li>Пользователь обязан ознакомиться с правилами перед совершением любой покупки.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          <p>
            SHARPBUY is an automated online marketplace providing gaming access, digital goods, and verified Steam accounts.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>By placing an order, the user agrees to these terms in full.</li>
            <li>Terms are subject to periodic regulatory updates permanently published on this page.</li>
            <li>Customers are advised to review terms prior to checkout.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'RULE-02',
      num: '02',
      title: lang === 'ru' ? 'Покупка товаров и выдача' : 'Purchasing & Dispatch',
      summary: lang === 'ru' ? 'Выдача, проверка товара и обязательные действия после получения' : 'Delivery protocols, inspection window, and security steps',
      content: lang === 'ru' ? (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Все товары продаются исключительно в одни руки &mdash; доступ не предоставляется другим лицам.</li>
            <li>После покупки вы получаете полные данные аккаунта, ключ активации или иной цифровой товар в соответствии с описанием в карточке.</li>
            <li>Моментом покупки считается момент подтверждения оплаты платёжной системой.</li>
            <li>Для товаров типа Full Access рекомендуется сразу после покупки сменить пароль и привязать свою почту.</li>
          </ul>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              ВАЖНО
            </span>
            <span>
              Покупатель обязан проверить работоспособность товара в течение 15 минут после получения!
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>All digital items are delivered strictly single-handed directly to the buyer.</li>
            <li>Full credentials or digital keys are instantly rendered post-checkout.</li>
            <li>For Full Access goods, immediately bind your private email and Steam Guard.</li>
          </ul>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              IMPORTANT
            </span>
            <span>
              Buyers must test credentials within the initial 15-minute inspection window!
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'RULE-03',
      num: '03',
      title: lang === 'ru' ? 'Замена и возврат средств' : 'Replacements & Refunds',
      summary: lang === 'ru' ? 'Сроки, основания и регламент обращения при неисправности' : 'Warranty claims, replacement requirements, and dispute handling',
      content: lang === 'ru' ? (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Замена нерабочего товара (выдача аналогичного аккаунта/ключа) производится при обращении в поддержку с номером заказа и подтверждением проблемы.</li>
            <li>Возврат средств возможен только в том случае, если товар не соответствует описанию и замена на рабочий аналог невозможна.</li>
            <li>Срок рассмотрения заявки администратором &mdash; до 24 часов с момента обращения.</li>
          </ul>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              ВАЖНО
            </span>
            <span>
              Возврат / замена рабочего товара не производится, как и товара где были изменены данные (на NFA), потрачен баланс или получена блокировка за читы.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Immediate replacement is issued upon submitting order ID with issue details.</li>
            <li>Full refund applies if valid replacement cannot be provided.</li>
          </ul>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              IMPORTANT
            </span>
            <span>
              Replacements do not apply to NFA accounts where buyer altered credentials or triggered in-game bans.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'RULE-04',
      num: '04',
      title: lang === 'ru' ? 'Регламент службы поддержки' : 'Support Desk Protocol',
      summary: lang === 'ru' ? 'График работы, порядок очереди и правила коммуникации' : 'Operating schedule, queue priority, and communication rules',
      content: lang === 'ru' ? (
        <div className="space-y-3">
          <p>
            Служба поддержки работает ежедневно с <strong>08:00 до 24:00 по московскому времени</strong> в Telegram (<a href="https://t.me/SharpBuySupport" target="_blank" rel="noreferrer" className="text-[#E8583A] underline">@SharpBuySupport</a>).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Обращения обрабатываются в порядке живой очереди. Среднее время первого ответа &mdash; 2&ndash;5 минут.</li>
            <li>При обращении обязательно укажите номер заказа (#HS-...) и подробно опишите суть вопроса.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          <p>
            Live support operates daily from <strong>08:00 to 24:00 MSK</strong> on Telegram (<a href="https://t.me/SharpBuySupport" target="_blank" rel="noreferrer" className="text-[#E8583A] underline">@SharpBuySupport</a>).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Tickets are handled in queue order with typical first response &lt; 5 minutes.</li>
            <li>Attach your order reference (#HS-...) for expedited turnaround.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'RULE-05',
      num: '05',
      title: lang === 'ru' ? 'Безопасность и конфиденциальность' : 'Security & Privacy',
      summary: lang === 'ru' ? 'Обработка платежей через PCI DSS и защита персональной информации' : 'PCI DSS payment processing and data protection standards',
      content: lang === 'ru' ? (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>Мы не собираем и не храним персональные данные покупателей сверх необходимого для автоматической обработки заказа.</li>
            <li>Платёжные данные обрабатываются исключительно сертифицированными платёжными шлюзами. Данные карт на наших серверах не сохраняются.</li>
            <li>Магазин является независимым сервисом и не связан с Valve, Riot Games, EA или другими издателями.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>We do not store credit card credentials on local servers. All payments flow via certified PCI DSS channels.</li>
            <li>SHARPBUY operates as an independent gaming platform without direct affiliation to game publishers.</li>
          </ul>
        </div>
      ),
    },
  ];

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
          <span className="text-[#E8583A] font-semibold">{lang === 'ru' ? 'Правила' : 'Rules & Regulations'}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Техническая строка статуса */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'УСЛОВИЯ СДЕЛКИ · РЕДАКЦИЯ 2026' : 'TRADE TERMS · 2026 EDITION'}
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
                <>ПРАВИЛА БЕЗ<br />МЕЛКОГО ШРИФТА</>
              ) : (
                <>TRANSPARENT STORE<br />RULES &amp; PROTOCOLS</>
              )}
            </h1>

            {/* Описание */}
            <p className="mt-3.5 max-w-xl font-sans text-sm text-white/60 leading-relaxed">
              {lang === 'ru'
                ? 'Сначала — главное за минуту. Полный регламент доступен ниже.'
                : 'Key trade rules at a glance. Comprehensive legal regulations listed below.'}
            </p>
          </div>

          <button
            onClick={scrollToFullRules}
            className="flex items-center gap-1.5 font-mono text-xs text-white/50 transition-colors hover:text-[#E8583A] cursor-pointer self-start sm:self-end"
          >
            <span>{lang === 'ru' ? 'ОТКРЫТЬ ПОЛНЫЙ ТЕКСТ' : 'READ COMPLETE TERMS'}</span>
            <span>&darr;</span>
          </button>
        </div>

        {/* ── 3. ГЛАВНОЕ ЗА 60 СЕКУНД ── */}
        <div className="mb-14 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="mb-6 font-mono text-xs font-bold text-white/40 uppercase tracking-widest">
            {lang === 'ru' ? 'ГЛАВНОЕ ПЕРЕД ПОКУПКОЙ' : 'KEY POINTS BEFORE PURCHASE'}
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* 01 */}
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#E8583A]">01</span>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8583A] shrink-0"></span>
              <span className="font-sans text-sm text-white/80 leading-snug">
                {lang === 'ru' ? 'ТОВАР ВЫДАЁТСЯ СРАЗУ ПОСЛЕ ПОДТВЕРЖДЕНИЯ ОПЛАТЫ' : 'INSTANT DISPATCH UPON PAYMENT CONFIRMATION'}
              </span>
            </div>

            {/* 02 */}
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#E8583A]">02</span>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8583A] shrink-0"></span>
              <span className="font-sans text-sm text-white/80 leading-snug">
                {lang === 'ru' ? 'СРОК ГАРАНТИИ УКАЗАН В КАРТОЧКЕ КОНКРЕТНОГО ТОВАРА' : 'WARRANTY DURATION LISTED ON EACH PRODUCT CARD'}
              </span>
            </div>

            {/* 03 */}
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#E8583A]">03</span>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#E8583A] shrink-0 shadow-[0_0_6px_#E8583A]"></span>
              <span className="font-sans text-sm font-semibold text-white leading-snug">
                {lang === 'ru' ? 'ПРОВЕРЬТЕ ТОВАР В ТЕЧЕНИЕ 15 МИНУТ ПОСЛЕ ПОЛУЧЕНИЯ' : 'TEST CREDENTIALS WITHIN 15 MINUTES OF RECEIPT'}
              </span>
            </div>

            {/* 04 */}
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#E8583A]">04</span>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0"></span>
              <span className="font-sans text-sm text-white/80 leading-snug">
                {lang === 'ru' ? 'НЕ ИЗМЕНЯЙТЕ ДАННЫЕ И НЕ ПЕРЕДАВАЙТЕ ДОСТУП, ПОКА НЕ ПРОВЕРИЛИ ТОВАР' : 'DO NOT MODIFY CREDENTIALS ON NFA ACCOUNTS'}
              </span>
            </div>

            {/* 05 */}
            <div className="flex items-start gap-3">
              <span className="font-bold text-[#E8583A]">05</span>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0"></span>
              <span className="font-sans text-sm text-white/80 leading-snug">
                {lang === 'ru' ? 'ПРИ ПРОБЛЕМЕ СОХРАНИТЕ НОМЕР ЗАКАЗА И НАПИШИТЕ В ПОДДЕРЖКУ' : 'ATTACH ORDER ID WHEN CONTACTING SUPPORT DESK'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. ЦЕНТРАЛЬНАЯ КАРТА СДЕЛКИ И РАЗДЕЛЕНИЕ ОТВЕТСТВЕННОСТИ ── */}
        <div className="mb-14 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="mb-8">
            <div className="font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
              {lang === 'ru' ? 'МАРШРУТ СДЕЛКИ' : 'ORDER TIMELINE'}
            </div>
            <h2 className="mt-1 font-sans text-xl font-extrabold uppercase tracking-tight text-[#F3F1EC]">
              {lang === 'ru' ? 'Карта процесса и ответственность' : 'Process Map & Responsibilities'}
            </h2>
          </div>

          {/* Горизонтальный таймлайн 5 этапов */}
          <div className="relative mb-8">
            {/* Базовая линия */}
            <div className="absolute top-4 left-4 right-4 hidden h-[2px] bg-white/[0.08] md:block"></div>
            {/* Заполненная линия */}
            <div
              className="absolute top-4 left-4 hidden h-[2px] bg-gradient-to-r from-[#E8583A] to-[#FF6B4A] transition-all duration-300 md:block"
              style={{ width: `${((activeStep - 1) / 4) * 100}%` }}
            ></div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {stepsData.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = activeStep === stepNum;
                const isPassed = activeStep >= stepNum;

                return (
                  <div
                    key={step.num}
                    onClick={() => setActiveStep(stepNum)}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    <div className="mb-2 flex items-center gap-2 md:block">
                      <div
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? 'border border-[#E8583A] bg-[#161210] text-[#E8583A] shadow-[0_0_12px_rgba(232,88,58,0.5)]'
                            : isPassed
                            ? 'border border-white/40 bg-[#121418] text-white'
                            : 'border border-white/10 bg-[#0E0D0C] text-white/40 group-hover:border-white/20'
                        }`}
                      >
                        {step.num}
                        {isActive && (
                          <span className="absolute h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`font-sans text-[11px] font-bold uppercase tracking-tight transition-colors ${
                        isActive ? 'text-[#E8583A]' : 'text-white/60 group-hover:text-white'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Панель разделения ответственности для активного этапа */}
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E0D0C] p-6">
            <div className="mb-4 font-mono text-xs text-white/40">
              {lang === 'ru' ? 'ЭТАП' : 'STAGE'} {stepsData[activeStep - 1].num} / {stepsData[activeStep - 1].title}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Слева: SHARPBUY обеспечивает */}
              <div className="space-y-2 border-b border-white/[0.06] pb-4 sm:border-b-0 sm:border-r sm:pr-6">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                  <span>{lang === 'ru' ? 'SHARPBUY ОБЕСПЕЧИВАЕТ' : 'SHARPBUY GUARANTEES'}</span>
                </div>
                <p className="font-sans text-xs text-white/70 leading-relaxed">
                  {stepsData[activeStep - 1].shop}
                </p>
              </div>

              {/* Справа: Покупатель делает */}
              <div className="space-y-2 sm:pl-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70"></span>
                  <span>{lang === 'ru' ? 'ПОКУПАТЕЛЬ ДЕЛАЕТ' : 'BUYER RESPONSIBILITY'}</span>
                </div>
                <p className="font-sans text-xs text-white/70 leading-relaxed">
                  {stepsData[activeStep - 1].buyer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. ЕСЛИ ВОЗНИКЛА ПРОБЛЕМА (3 ВЕТКИ РЕШЕНИЯ) ── */}
        <div className="mb-14 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9">
          <div className="mb-6 font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
            {lang === 'ru' ? 'ЕСЛИ ВОЗНИКЛА ПРОБЛЕМА' : 'IF YOU ENCOUNTER AN ISSUE'}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* ISSUE-01 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="font-mono text-xs font-bold text-white/70">
                {lang === 'ru' ? 'ISSUE-01 / ДАННЫЕ НЕ ПОДХОДЯТ' : 'ISSUE-01 / INVALID LOGIN'}
              </div>
              <p className="mt-2 font-sans text-xs text-white/60 leading-relaxed">
                {lang === 'ru'
                  ? 'Сохраните номер заказа и сделайте скриншот проблемы → напишите в поддержку до окончания срока гарантии.'
                  : 'Save your order ID, take a screenshot of the login error, and contact support within the warranty window.'}
              </p>
            </div>

            {/* ISSUE-02 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="font-mono text-xs font-bold text-white/70">
                {lang === 'ru' ? 'ISSUE-02 / ТОВАР НЕ СООТВЕТСТВУЕТ' : 'ISSUE-02 / SPEC DISCREPANCY'}
              </div>
              <p className="mt-2 font-sans text-xs text-white/60 leading-relaxed">
                {lang === 'ru'
                  ? 'Поддержка проверяет возможность замены → если замена невозможна, рассматривается возврат средств.'
                  : 'Support validates spec mismatch and immediately delivers an exact replacement or refund.'}
              </p>
            </div>

            {/* ISSUE-03 */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="font-mono text-xs font-bold text-white/70">
                {lang === 'ru' ? 'ISSUE-03 / ХОЧУ ИЗМЕНИТЬ ДАННЫЕ' : 'ISSUE-03 / CHANGING DATA'}
              </div>
              <p className="mt-2 font-sans text-xs text-white/60 leading-relaxed">
                {lang === 'ru'
                  ? 'Сначала проверьте условия конкретного товара → смена данных на NFA-аккаунтах аннулирует гарантию.'
                  : 'Check product card access type first: altering credentials on NFA accounts voids warranty.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── 6. ПОЛНЫЙ РЕГЛАМЕНТ (ДВУХКОЛОНОЧНЫЙ АККОРДЕОН) ── */}
        <div id="full-rules" className="mb-16 scroll-mt-28 space-y-6">
          <div>
            <div className="font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
              {lang === 'ru' ? 'ЮРИДИЧЕСКИЙ ДОКУМЕНТ' : 'LEGAL TERMS'}
            </div>
            <h2 className="mt-1 font-sans text-xl font-extrabold uppercase tracking-tight text-[#F3F1EC]">
              {lang === 'ru' ? 'Полный регламент магазина' : 'Full Store Regulations'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Левая колонка: Навигатор по разделам */}
            <div className="lg:col-span-4 flex flex-col space-y-1 font-mono text-xs border-b border-white/[0.06] pb-4 lg:border-b-0 lg:border-r lg:pr-6">
              {fullRulesList.map((sec) => {
                const isActive = openRule === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setOpenRule(sec.id)}
                    className={`relative flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white bg-white/[0.04] font-bold'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#E8583A]">{sec.num}</span>
                      <span>{sec.title}</span>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8583A]"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Правая колонка: аккордеон разделов */}
            <div className="lg:col-span-8 space-y-2.5">
              {fullRulesList.map((rule) => {
                const isOpen = openRule === rule.id;
                return (
                  <div
                    key={rule.id}
                    className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                      isOpen
                        ? 'border-white/[0.12] bg-[#161310]'
                        : 'border-white/[0.06] bg-[#121110] hover:border-white/[0.1]'
                    }`}
                  >
                    <button
                      onClick={() => setOpenRule(isOpen ? null : rule.id)}
                      className="relative flex w-full items-start justify-between p-5 text-left transition-colors cursor-pointer"
                    >
                      {isOpen && (
                        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#E8583A]"></div>
                      )}

                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-white/40">
                            {rule.id}
                          </span>
                          <span className="font-sans text-sm font-bold text-[#F3F1EC]">
                            {rule.title}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-white/45">
                          {rule.summary}
                        </p>
                      </div>

                      <span className="font-mono text-xs text-white/40 transition-transform duration-200 mt-1 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        &or;
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/[0.05] p-5 pt-3 font-sans text-xs text-white/70 leading-relaxed">
                        {rule.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 7. ФИНАЛЬНЫЙ БЛОК ── */}
        <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:flex-row sm:items-center sm:justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="space-y-1">
            <div className="font-sans text-base font-extrabold uppercase tracking-tight text-[#F3F1EC]">
              {lang === 'ru' ? 'ОСТАЛСЯ ВОПРОС ПО УСЛОВИЯМ?' : 'QUESTIONS REGARDING TERMS?'}
            </div>
            <p className="font-sans text-xs text-white/55">
              {lang === 'ru'
                ? 'Поддержка поможет уточнить, какие правила действуют для конкретного товара до покупки.'
                : 'Support operators can clarify specific warranty regulations prior to checkout.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Вторичная ссылка в Каталог */}
            <button
              onClick={() => onNavigate('catalog')}
              className="footer-system-link font-sans text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'ПЕРЕЙТИ В КАТАЛОГ' : 'OPEN CATALOG'}
            </button>

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

