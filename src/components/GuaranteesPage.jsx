import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const GuaranteesPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(3); // 1, 2, or 3
  const [openReg, setOpenReg] = useState('REG-01');

  // Анимация плавного досчёта цифр при загрузке
  const [yearsCount, setYearsCount] = useState(0);
  const [dealsCount, setDealsCount] = useState(0);
  const [rateCount, setRateCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setYearsCount(Math.floor(ease * 5));
      setDealsCount(Math.floor(ease * 48392));
      setRateCount(parseFloat((ease * 99.4).toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Точный регламент сервиса SHARPBUY
  const regulations = [
    {
      id: 'REG-01',
      title: lang === 'ru' ? 'Получение товара' : 'Order Fulfillment & Delivery',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'Вы гарантированно получите оплаченный товар. Если по какой-либо причине выдача не произошла — обратитесь в поддержку и сообщите информацию о заказе.'
              : 'You are guaranteed to receive your purchased item. If dispatch does not complete automatically, contact support with your order ID.'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>
              <strong className="text-white">{lang === 'ru' ? 'Автоматическая выдача' : 'Instant Automated Dispatch'}</strong> &mdash; {lang === 'ru' ? 'товар приходит мгновенно после подтверждения оплаты шлюзом.' : 'item credentials sent in 3 seconds after payment confirmation.'}
            </li>
            <li>
              <strong className="text-white">{lang === 'ru' ? 'Ручная выдача' : 'Assisted Dispatch'}</strong> &mdash; {lang === 'ru' ? 'товар выдается саппортом. Оператор отвечает на все вопросы и помогает с настройкой.' : 'delivered via support operator who assists with setup and configuration.'}
            </li>
          </ul>
          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              {lang === 'ru' ? 'ВАЖНО' : 'IMPORTANT'}
            </span>
            <span>
              {lang === 'ru'
                ? 'Выдача товара, в котором не указано что он выдается автовыдачей, осуществляется в порядке очереди и может занимать доп. время. Пользователь соглашается с этим при покупке.'
                : 'Items that require manual delivery are processed in queue order. By completing purchase, the user accepts standard queue handling times.'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'REG-02',
      title: lang === 'ru' ? 'Правила гарантии на аккаунты' : 'Account Warranty Terms',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'На все товары действует гарантия, указанная в описании конкретного товара. Гарантийный срок может быть увеличен по решению администратора.'
              : 'All products carry the warranty period specified in the item specs. The warranty window can be extended at admin discretion.'}
          </p>
          <p className="text-white/70">
            {lang === 'ru'
              ? 'Покупатель должен озаботиться о безопасности купленного им аккаунта после того, как данные от него были получены, при условии что покупатель получил аккаунт с верными данными (логин/пароль и т.д.).'
              : 'The buyer is responsible for securing the account once valid credentials (login/pass, token) have been delivered.'}
          </p>
          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              {lang === 'ru' ? 'ВАЖНО' : 'IMPORTANT'}
            </span>
            <span>
              {lang === 'ru'
                ? 'Возврат / замена рабочего товара невозможен, как и товара где были изменены данные, выдана почта или мафайл (maFile), потрачен баланс/очки аккаунта или получена КТ, не связанная с исходным состоянием аккаунта.'
                : 'Replacement or refund is void if account credentials were changed, MaFile claimed, points spent, or Community Ban received due to in-game reports.'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'REG-03',
      title: lang === 'ru' ? 'Безопасность данных и платежей' : 'Data & Payment Security',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'Ваши персональные и платёжные данные надёжно защищены. Мы не храним данные банковских карт и используем защищённые платёжные шлюзы.'
              : 'Your payment credentials are encrypted using bank-grade security protocols. We do not store card details.'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>{lang === 'ru' ? 'Шифрование данных при передаче по протоколу SSL / TLS.' : 'End-to-end SSL / TLS encryption on all transactions.'}</li>
            <li>{lang === 'ru' ? 'Платежи обрабатываются через сертифицированные шлюзы по стандарту PCI DSS.' : 'PCI DSS certified payment processing gateways.'}</li>
            <li>{lang === 'ru' ? 'Никакие данные банковских карт не сохраняются на наших серверах.' : 'Zero credit card storage on internal servers.'}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'REG-04',
      title: lang === 'ru' ? 'Проверка качества' : 'Quality Assurance Audit',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'Мы проверяем каждый товар перед продажей (валидность доступа, отсутствие скрытых блокировок).'
              : 'Every single asset is automatically verified prior to listing (validity, zero VAC bans, clean matchmaking).'}
          </p>
          <div className="flex items-start gap-2.5 rounded-xl border border-[#E8583A]/30 bg-[#E8583A]/10 p-3 font-mono text-[11px] text-white/85">
            <span className="shrink-0 rounded bg-[#E8583A] px-1.5 py-0.5 font-bold text-black uppercase">
              {lang === 'ru' ? 'ВАЖНО' : 'IMPORTANT'}
            </span>
            <span>
              {lang === 'ru'
                ? 'Если у вас возникла проблема с товаром при первом заходе — незамедлительно обратитесь в поддержку с видеозаписью или скриншотом заказа!'
                : 'If an anomaly is detected upon initial login, contact support immediately with a recording or screenshot!'}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'REG-05',
      title: lang === 'ru' ? 'Регламент технической поддержки' : 'Support SLA & Availability',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'Наша команда поддержки доступна ежедневно и готова помочь с любым вопросом. Работаем ежедневно с 08:00 до 24:00 МСК в официальном Telegram @SharpBuySupport.'
              : 'Our support team is online daily 08:00 to 24:00 MSK via official Telegram @SharpBuySupport.'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/70">
            <li>{lang === 'ru' ? 'Сообщение в поддержку должно быть оформлено ясно и с номером заказа.' : 'Include your Order ID and clear description of the query.'}</li>
            <li>{lang === 'ru' ? 'Обработка заявок происходит в порядке очереди.' : 'Tickets are answered sequentially in queue order.'}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'REG-06',
      title: lang === 'ru' ? 'Возврат средств' : 'Money-Back Guarantee',
      content: (
        <div className="space-y-3">
          <p className="text-white/80">
            {lang === 'ru'
              ? 'Если купленный товар не соответствует описанию в карточке и замена на рабочий аналог невозможна — вы гарантированно получаете возврат средств в полном объёме.'
              : 'If an item deviates from its verified specifications and replacement is impossible, you receive a full 100% refund.'}
          </p>
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
          <span className="text-[#E8583A] font-semibold">{t('nav_guarantees')}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Техническая маркировка */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'КОНТРОЛЬ КАЧЕСТВА / ГАРАНТИИ' : 'QUALITY CONTROL / GUARANTEES'}
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
                <>НАШИ ГАРАНТИИ,<br />КОТОРЫМ МОЖНО ВЕРИТЬ</>
              ) : (
                <>OUR GUARANTEES<br />YOU CAN TRUST</>
              )}
            </h1>

            {/* Описание */}
            <p className="mt-3.5 max-w-xl font-sans text-sm text-white/60 leading-relaxed">
              {lang === 'ru'
                ? 'Мы дорожим каждым клиентом и гарантируем честную сделку, качественный товар и оперативную поддержку на всех этапах покупки.'
                : 'Every single transaction is safeguarded by strict escrow standards, automated audit checks, and responsive support.'}
            </p>
          </div>

          {/* Статус системы выдачи */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 font-mono text-xs shadow-sm self-start sm:self-end">
            <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
            <span className="text-white/50">{lang === 'ru' ? 'СИСТЕМА ВЫДАЧИ:' : 'DELIVERY SYSTEM:'}</span>
            <span className="font-bold text-white uppercase tracking-wider">{lang === 'ru' ? 'АКТИВНА 24/7' : 'ONLINE 24/7'}</span>
          </div>
        </div>

        {/* ── 3. КОНСОЛЬ ПОКАЗАТЕЛЕЙ (Единая панель) ── */}
        <div className="mb-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121110] shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* 1. 5+ Лет */}
            <div className="flex flex-col justify-between p-7">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40"></span>
                <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">HISTORICAL</span>
              </div>
              <div className="my-3 font-mono text-4xl font-black text-[#F3F1EC] sm:text-5xl">
                {yearsCount}+
              </div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-white/50 uppercase">
                {lang === 'ru' ? 'БОЛЕЕ 5 ЛЕТ ДОВЕРИЯ' : '5+ YEARS MARKET TRUST'}
              </div>
            </div>

            {/* 2. 48 392 Успешных выдач */}
            <div className="flex flex-col justify-between p-7">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">VERIFIED</span>
              </div>
              <div className="my-3 font-mono text-4xl font-black text-[#F3F1EC] sm:text-5xl">
                {dealsCount.toLocaleString('ru-RU')}
              </div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-white/50 uppercase">
                {lang === 'ru' ? 'УСПЕШНЫХ ВЫДАЧ' : 'SUCCESSFUL DELIVERIES'}
              </div>
            </div>

            {/* 3. 99.4% Положительных оценок */}
            <div className="flex flex-col justify-between p-7">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40"></span>
                <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">CSAT METRIC</span>
              </div>
              <div className="my-3 font-mono text-4xl font-black text-[#F3F1EC] sm:text-5xl">
                {rateCount}%
              </div>
              <div className="font-mono text-[11px] font-bold tracking-widest text-white/50 uppercase">
                {lang === 'ru' ? 'ПОЛОЖИТЕЛЬНЫХ ОЦЕНОК' : 'POSITIVE REVIEWS'}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. КАК МЫ ОБЕСПЕЧИВАЕМ ГАРАНТИИ (Путь сделки 01-02-03) ── */}
        <div className="mb-14 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          {/* Верхняя строка статуса */}
          <div className="mb-8 flex flex-col gap-2 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/40">{lang === 'ru' ? 'ОПЕРАЦИЯ #HS-ORDER-48291 / СТАТУС:' : 'OPERATION #HS-ORDER-48291 / STATUS:'}</span>
              <span className="font-bold text-[#E8583A]">{lang === 'ru' ? 'ВЫДАНО' : 'DELIVERED'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
              <span className="font-semibold text-white uppercase tracking-wider">{lang === 'ru' ? 'ЗАВЕРШЕНО' : 'COMPLETED'}</span>
            </div>
          </div>

          {/* Линия маршрута с 3 узлами */}
          <div className="relative mb-8">
            <div className="absolute top-4 left-4 right-4 hidden h-[2px] bg-white/[0.08] sm:block"></div>
            <div className="absolute top-4 left-4 right-4 hidden h-[2px] bg-gradient-to-r from-[#E8583A] via-[#E8583A] to-[#E8583A]/60 sm:block"></div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Узел 01 */}
              <div
                onClick={() => setActiveStep(1)}
                className={`relative flex flex-col cursor-pointer transition-all duration-200 ${
                  activeStep === 1 ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="mb-4 flex items-center gap-3 sm:block">
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8583A] bg-[#141210] font-mono text-xs font-bold text-[#E8583A] shadow-[0_0_12px_rgba(232,88,58,0.4)]">
                    01
                  </div>
                  <div className="sm:mt-3 font-sans text-sm font-extrabold uppercase tracking-tight text-[#F3F1EC]">
                    {lang === 'ru' ? 'ОПЛАТА ЗАКАЗА' : 'PAYMENT'}
                  </div>
                </div>
                <p className="font-sans text-xs text-white/55 leading-relaxed">
                  {lang === 'ru'
                    ? 'Вы выбираете товар и оплачиваете его удобным способом через защищённый платёжный шлюз.'
                    : 'Choose your product and checkout via secure encrypted payment gateway.'}
                </p>
              </div>

              {/* Узел 02 */}
              <div
                onClick={() => setActiveStep(2)}
                className={`relative flex flex-col cursor-pointer transition-all duration-200 ${
                  activeStep === 2 ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="mb-4 flex items-center gap-3 sm:block">
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8583A] bg-[#141210] font-mono text-xs font-bold text-[#E8583A] shadow-[0_0_12px_rgba(232,88,58,0.4)]">
                    02
                  </div>
                  <div className="sm:mt-3 font-sans text-sm font-extrabold uppercase tracking-tight text-[#F3F1EC]">
                    {lang === 'ru' ? 'ПРОВЕРКА И ВЫДАЧА' : 'VERIFICATION & DISPATCH'}
                  </div>
                </div>
                <p className="font-sans text-xs text-white/55 leading-relaxed">
                  {lang === 'ru'
                    ? 'Товар проходит финальную проверку и выдаётся автоматически за 3 секунды.'
                    : 'Automated audit executes and credentials are dispatched in 3 seconds.'}
                </p>
              </div>

              {/* Узел 03 */}
              <div
                onClick={() => setActiveStep(3)}
                className={`relative flex flex-col cursor-pointer transition-all duration-200 ${
                  activeStep === 3 ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="mb-4 flex items-center gap-3 sm:block">
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8583A] bg-[#141210] font-mono text-xs font-bold text-[#E8583A] shadow-[0_0_12px_rgba(232,88,58,0.4)]">
                    03
                  </div>
                  <div className="sm:mt-3 font-sans text-sm font-extrabold uppercase tracking-tight text-[#F3F1EC]">
                    {lang === 'ru' ? 'ПОДДЕРЖКА ПОСЛЕ ПОКУПКИ' : 'AFTER-SALE SUPPORT'}
                  </div>
                </div>
                <p className="font-sans text-xs text-white/55 leading-relaxed">
                  {lang === 'ru'
                    ? 'Если возникнут вопросы — наша поддержка поможет с заменой, настройкой или возвратом средств.'
                    : 'Our team is ready to assist with software setup, guidance, or replacement.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. РЕГЛАМЕНТ ГАРАНТИИ (REG-01 - REG-06) ── */}
        <div className="mb-14 space-y-4">
          <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-[#F3F1EC]">
            {lang === 'ru' ? 'ПОДРОБНЫЙ РЕГЛАМЕНТ ГАРАНТИЙ И ОБСЛУЖИВАНИЯ' : 'DETAILED WARRANTY & SERVICE TERMS'}
          </h2>

          <div className="space-y-2">
            {regulations.map((reg) => {
              const isOpen = openReg === reg.id;
              return (
                <div
                  key={reg.id}
                  className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-white/[0.12] bg-[#161310]'
                      : 'border-white/[0.06] bg-[#121110] hover:border-white/[0.1]'
                  }`}
                >
                  <button
                    onClick={() => setOpenReg(isOpen ? null : reg.id)}
                    className="relative flex w-full items-center justify-between p-5 text-left transition-colors cursor-pointer"
                  >
                    {isOpen && (
                      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#E8583A]"></div>
                    )}

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-white/40">
                        {reg.id}
                      </span>
                      <span className="font-sans text-sm font-semibold text-[#F3F1EC]">
                        {reg.title}
                      </span>
                    </div>

                    <span className="font-mono text-xs text-white/40 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                      &or;
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/[0.05] p-5 pt-3 font-sans text-xs text-white/70 leading-relaxed">
                      {reg.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. НИЖНЯЯ ПАНЕЛЬ ПОДДЕРЖКИ И СВЯЗИ ── */}
        <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-sans text-lg font-extrabold uppercase tracking-tight text-[#F3F1EC]">
                {lang === 'ru' ? 'НУЖНА ПОМОЩЬ ПО ЗАКАЗУ?' : 'NEED HELP WITH AN ORDER?'}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
                <span>{lang === 'ru' ? 'В СЕТИ 24/7' : 'ONLINE 24/7'}</span>
              </div>
            </div>
            <p className="font-sans text-xs text-white/55">
              {lang === 'ru'
                ? 'Операторы дежурят ежедневно с 08:00 до 24:00 МСК в официальном Telegram @SharpBuySupport.'
                : 'Live operators are on duty daily 08:00 to 24:00 MSK via Telegram @SharpBuySupport.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate('rules')}
              className="footer-system-link font-sans text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              {lang === 'ru' ? 'ПРАВИЛА МАГАЗИНА' : 'STORE RULES'}
            </button>

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
