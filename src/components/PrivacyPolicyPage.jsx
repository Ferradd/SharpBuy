import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicyPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  const sections = [
    {
      num: '1',
      title: lang === 'ru' ? 'Общие положения' : 'General Provisions',
      items: lang === 'ru' ? [
        '1.1. Настоящая Политика конфиденциальности (далее — «Политика») регулирует порядок обработки и защиты информации, которую Пользователь передаёт при использовании сайта SHARPBUY (далее — «Сервис»).',
        '1.2. Используя Сервис, Пользователь подтверждает своё согласие с условиями Политики. Если Пользователь не согласен с условиями — он обязан прекратить использование Сервиса.',
      ] : [
        '1.1. This Privacy Policy governs the processing and protection of information provided by users when accessing the SHARPBUY platform.',
        '1.2. By accessing the Service, the User confirms full acceptance of this Policy. If the User disagrees with any terms, they must cease using the Service immediately.',
      ],
    },
    {
      num: '2',
      title: lang === 'ru' ? 'Сбор информации' : 'Information Collection',
      items: lang === 'ru' ? [
        '2.1. Сервис может собирать следующие типы данных: идентификаторы заказа (ID транзакции, email); техническую информацию (IP-адрес, тип браузера, операционная система); историю оформленных заказов.',
        '2.2. Сервис не требует от Пользователя предоставления паспортных данных, документов или конфиденциальной личной информации.',
      ] : [
        '2.1. The Service may collect order identifiers (Transaction ID, email); technical session telemetry (IP address, browser type, OS); and order history.',
        '2.2. The Service does not request sensitive identity documents or personal passports.',
      ],
    },
    {
      num: '3',
      title: lang === 'ru' ? 'Использование информации' : 'Usage of Information',
      items: lang === 'ru' ? [
        '3.1. Сервис использует информацию исключительно для: автоматической доставки цифровых товаров; технической поддержки клиентов; мониторинга стабильности и предотвращения мошенничества.',
      ] : [
        '3.1. Information is used strictly to fulfill automated dispatch of digital orders, provide customer support, and safeguard against unauthorized access or fraud.',
      ],
    },
    {
      num: '4',
      title: lang === 'ru' ? 'Передача данных третьим лицам' : 'Third-Party Disclosure',
      items: lang === 'ru' ? [
        '4.1. Администрация не передаёт данные третьим лицам, за исключением случаев обработки платежей через сертифицированные платёжные шлюзы (PCI DSS) или по законному требованию уполномоченных органов.',
      ] : [
        '4.1. We do not sell or disclose customer data to third parties, except as required to process payments via certified payment gateways (PCI DSS) or under legal obligations.',
      ],
    },
    {
      num: '5',
      title: lang === 'ru' ? 'Хранение и защита данных' : 'Storage & Security Standards',
      items: lang === 'ru' ? [
        '5.1. Все соединения защищены сквозным SSL/TLS шифрованием.',
        '5.2. Платежи осуществляются напрямую через децентрализованный блокчейн BSC (USDT BEP-20, BNB), что гарантирует полную анонимность и исключает хранение каких-либо конфиденциальных банковских реквизитов.',
      ] : [
        '5.1. All client interactions are protected by end-to-end SSL/TLS encryption.',
        '5.2. Transactions are executed directly on the BSC blockchain (USDT BEP-20, BNB), ensuring total financial privacy with zero banking credentials stored on our infrastructure.',
      ],
    },
    {
      num: '6',
      title: lang === 'ru' ? 'Изменения в Политике' : 'Policy Amendments',
      items: lang === 'ru' ? [
        '6.1. Администрация оставляет за собой право обновлять настоящую Политику в соответствии с развитием сервиса и законодательства.',
        '6.2. Актуальная редакция всегда доступна по данному адресу.',
      ] : [
        '6.1. The administration reserves the right to update this Policy to reflect operational or regulatory improvements.',
        '6.2. The latest verified revision is permanently accessible on this page.',
      ],
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
          <span className="text-white/40">{lang === 'ru' ? 'Информация' : 'Information'}</span>
          <span>/</span>
          <span className="text-[#E8583A] font-semibold">{lang === 'ru' ? 'Конфиденциальность' : 'Privacy Policy'}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-12 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'ПРАВОВОЙ РЕГЛАМЕНТ' : 'LEGAL REGULATION'}
              </span>
            </div>

            <h1
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(36px, 4vw, 52px)',
                lineHeight: 0.95,
              }}
            >
              {lang === 'ru' ? 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ' : 'PRIVACY & DATA POLICY'}
            </h1>

            <p className="mt-3 max-w-xl font-sans text-sm text-white/60">
              {lang === 'ru'
                ? 'Порядок сбора, хранения, использования и защиты пользовательской информации.'
                : 'Standards for collection, processing, and protection of user information.'}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-white/60">
            {lang === 'ru' ? 'Редакция:' : 'Revision:'} <strong className="text-[#F3F1EC]">2026.08</strong>
          </div>
        </div>

        {/* ── 3. СПИСОК РАЗДЕЛОВ ПОЛИТИКИ ── */}
        <div className="space-y-4">
          {sections.map((sec) => (
            <div
              key={sec.num}
              className="rounded-2xl border border-white/[0.08] bg-[#121110] p-7 transition-colors hover:border-white/15"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#E8583A]">
                  0{sec.num}
                </span>
                <h2 className="font-sans text-lg font-bold text-[#F3F1EC]">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-3 font-sans text-xs text-white/70 leading-relaxed">
                {sec.items.map((item, idx) => (
                  <p key={idx}>{item}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
