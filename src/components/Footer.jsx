import React from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  const catalogCommands = [
    { label: '/prime-nfa', route: 'category', catId: 'cs2nfa' },
    { label: '/full-access', route: 'category', catId: 'cs2full' },
    { label: '/cfg', route: 'category', catId: 'cs2cfg' },
    { label: '/rust', route: 'category', catId: 'rust' },
    { label: '/steam', route: 'category', catId: 'steam' },
  ];

  const systemLinks = [
    { label: t('nav_guarantees'), route: 'guarantees' },
    { label: t('nav_reviews'), route: 'reviews' },
    { label: t('nav_help'), route: 'help' },
    { label: t('nav_rules'), route: 'rules' },
    { label: t('nav_instructions'), route: 'instructions' },
    { label: t('nav_nfa_warranty'), route: 'nfa-warranty' },
    { label: t('nav_privacy'), route: 'privacy' },
  ];

  const paymentMethods = ['SBP', 'MIR', 'VISA', 'MASTERCARD', 'CRYPTO', 'PAYPAL'];

  return (
    <footer className="relative border-t border-white/[0.08] bg-[#080808] pt-14 pb-8 text-[#F3F1EC]">
      {/* Двойная техническая линия шва */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.08]"></div>
      <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-[#E8583A]/20"></div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* ── ОСНОВНАЯ СЕТКА ИЗ 4 ЗОН ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 pb-12">

          {/* ═══ ЗОНА 1: БРЕНД И СИСТЕМА ═══ */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <Logo
                size="lg"
                onClick={() => onNavigate('home')}
                className="hover:opacity-95"
              />
            </div>

            {/* Статус выдачи */}
            <div className="flex items-center gap-2 pt-2 font-mono text-xs text-white/50">
              <span className="tracking-wider uppercase">
                {lang === 'ru' ? 'АВТОВЫДАЧА ТОВАРОВ 24/7' : '24/7 INSTANT DELIVERY'}
              </span>
            </div>
          </div>

          {/* ═══ ЗОНА 2: КАТАЛОГ КАК КОМАНДЫ ═══ */}
          <div>
            <div className="mb-4 font-mono text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
              {lang === 'ru' ? 'КАТАЛОГ ТОВАРОВ' : 'CATALOG'}
            </div>
            <div className="flex flex-col space-y-2.5">
              {catalogCommands.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => {
                    if (cmd.catId) {
                      window.location.hash = `category/${cmd.catId}`;
                    } else {
                      onNavigate(cmd.route);
                    }
                  }}
                  className="group flex items-center font-mono text-[13px] text-white/60 transition-all duration-200 hover:text-white cursor-pointer select-none text-left"
                >
                  <span className="w-0 text-[#E8583A] opacity-0 transition-all duration-200 group-hover:w-3.5 group-hover:opacity-100">
                    &rsaquo;
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    {cmd.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ ЗОНА 3: СЛУЖЕБНАЯ СИСТЕМА ═══ */}
          <div>
            <div className="mb-4 font-mono text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
              {lang === 'ru' ? 'ИНФОРМАЦИЯ' : 'INFORMATION'}
            </div>
            <div className="flex flex-col space-y-2.5">
              {systemLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.route)}
                  className="footer-system-link text-left font-sans text-xs text-white/60 transition-colors duration-200 hover:text-white cursor-pointer w-fit"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ ЗОНА 4: СВЯЗЬ И ПЛАТЕЖИ ═══ */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="mb-4 font-mono text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
                {lang === 'ru' ? 'КАНАЛЫ СВЯЗИ' : 'CHANNELS'}
              </div>
              <div className="flex flex-col space-y-2.5">
                <a
                  href="https://t.me/sharpbuy"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 font-sans text-xs text-white/60 transition-colors hover:text-white"
                >
                  <svg className="h-4 w-4 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                  </svg>
                  <span>Telegram @sharpbuy</span>
                </a>

                <a
                  href="https://t.me/SharpBuySupport"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 font-sans text-xs text-white/60 transition-colors hover:text-white"
                >
                  <svg className="h-4 w-4 text-[#E8583A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{lang === 'ru' ? 'Поддержка' : 'Support'} @SharpBuySupport</span>
                </a>
              </div>

              {/* Статус поддержки */}
              <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-white/50">
                <span>{lang === 'ru' ? 'ДЕЖУРНЫЙ ОПЕРАТОР:' : 'SUPPORT DESK:'}</span>
                <span className="font-bold text-white">24/7 ONLINE</span>
              </div>
            </div>

            {/* Моно-строка платежей */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] tracking-wider text-white/40">
                {paymentMethods.map((pm, idx) => (
                  <React.Fragment key={pm}>
                    <span className="transition-colors duration-200 hover:text-white cursor-default">
                      {pm}
                    </span>
                    {idx < paymentMethods.length - 1 && <span>&middot;</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── САМАЯ НИЖНЯЯ СТРОКА ── */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 font-mono text-[11px] text-white/35 sm:flex-row">
          <div>
            &copy; 2026 SHARPBUY. {lang === 'ru' ? 'ВСЕ ПРАВА ЗАЩИЩЕНЫ.' : 'ALL RIGHTS RESERVED.'}
          </div>
          <div className="text-center">
            {lang === 'ru' ? 'НЕ СВЯЗАНЫ С VALVE CORPORATION И ДРУГИМИ ИЗДАТЕЛЯМИ.' : 'NOT AFFILIATED WITH VALVE CORPORATION.'}
          </div>
        </div>
      </div>
    </footer>
  );
};
