import React, { useState } from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

export const Header = ({ currentRoute, onNavigate, onOpenAuth, onOpenCabinet, onOpenWarranty }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const { user } = useAuth();
  const isEn = lang === 'en';

  const mainNav = [
    { route: 'home', label: t('nav_home') },
    { route: 'catalog', label: t('nav_catalog') },
    { route: 'nfa-warranty', label: isEn ? 'Auto-Replacement' : 'Авто-замена' },
    { route: 'reviews', label: t('nav_reviews') },
  ];

  const infoSubItems = [
    { route: 'instructions', label: isEn ? 'NFA Instructions' : 'Инструкция NFA', desc: isEn ? 'Launcher setup & token login guide' : 'Как входить через лаунчер' },
    { route: 'guarantees', label: isEn ? 'Warranty Terms' : 'Условия гарантии', desc: isEn ? 'Categories & 3-hour coverage' : 'Сроки и условия гарантии' },
    { route: 'rules', label: isEn ? 'Store Rules' : 'Правила магазина', desc: isEn ? 'Terms of service & guidelines' : 'Регламент и правила покупки' },
    { route: 'help', label: isEn ? 'Help & Support' : 'Поддержка & FAQ', desc: isEn ? 'Frequent questions & support desk' : 'Частые вопросы и связь с саппортом' },
    { route: 'privacy', label: isEn ? 'Privacy Policy' : 'Конфиденциальность', desc: isEn ? 'Data protection & security' : 'Защита данных пользователей' },
  ];

  const isInfoActive = ['help', 'rules', 'instructions', 'guarantees', 'privacy'].includes(currentRoute);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[#0A0A09]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Логотип SHARPBUY */}
        <Logo
          size="md"
          onClick={() => onNavigate('home')}
          className="hover:opacity-95"
        />

        {/* Навигация */}
        <nav className="hidden items-center gap-7 md:flex">
          {mainNav.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`relative py-1 font-sans text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#F3F1EC]'
                    : 'text-white/50 hover:text-white/90'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#E8583A]"></span>
                )}
              </button>
            );
          })}

          {/* Дропдаун «Информация» */}
          <div
            className="relative"
            onMouseEnter={() => setIsInfoOpen(true)}
            onMouseLeave={() => setIsInfoOpen(false)}
          >
            <button
              className={`flex items-center gap-1.5 py-1 font-sans text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                isInfoActive
                  ? 'text-[#F3F1EC]'
                  : 'text-white/50 hover:text-white/90'
              }`}
            >
              <span>{t('nav_info')}</span>
              <span className="font-mono text-xs opacity-60">▾</span>
              {isInfoActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#E8583A]"></span>
              )}
            </button>

            {/* Выпадающее меню */}
            {isInfoOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 z-50">
                <div className="rounded-lg border border-white/[0.1] bg-[#121110] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                  {infoSubItems.map((sub) => (
                    <button
                      key={sub.route}
                      onClick={() => {
                        onNavigate(sub.route);
                        setIsInfoOpen(false);
                      }}
                      className={`flex w-full flex-col text-left rounded p-2.5 transition-colors cursor-pointer ${
                        currentRoute === sub.route
                          ? 'bg-[#E8583A]/15 text-white'
                          : 'hover:bg-white/[0.04] text-white/70 hover:text-white'
                      }`}
                    >
                      <span className="font-sans text-xs font-bold">{sub.label}</span>
                      <span className="font-mono text-[10px] text-white/40">{sub.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Правый блок: Язык / Валюта / Личный кабинет */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 🌐 ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА (RU / EN) */}
          <div className="flex items-center rounded-lg border border-white/[0.1] bg-white/[0.03] p-0.5">
            <button
              onClick={() => setLang('ru')}
              className={`px-2 py-1 text-xs font-bold font-mono rounded transition-all cursor-pointer ${
                lang === 'ru'
                  ? 'bg-[#E8583A] text-white shadow-[0_0_10px_rgba(232,88,58,0.5)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs font-bold font-mono rounded transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#E8583A] text-white shadow-[0_0_10px_rgba(232,88,58,0.5)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* 💰 ПЕРЕКЛЮЧАТЕЛЬ ВАЛЮТЫ (RUB, USD, EUR, GBP, USDT) */}
          <div
            className="relative"
            onMouseEnter={() => setIsCurrencyOpen(true)}
            onMouseLeave={() => setIsCurrencyOpen(false)}
          >
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold text-white hover:border-white/20 transition-all cursor-pointer"
            >
              <span className="text-[#E8583A]">{currencies.find(c => c.code === currency)?.symbol || '₽'}</span>
              <span>{currency}</span>
              <span className="text-white/40 text-[10px]">▾</span>
            </button>

            {isCurrencyOpen && (
              <div className="absolute top-full right-0 w-32 pt-2 z-50">
                <div className="rounded-xl border border-white/[0.12] bg-[#121110] p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setIsCurrencyOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                        currency === curr.code
                          ? 'bg-[#E8583A] text-white'
                          : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span>{curr.code}</span>
                      <span className="opacity-70">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 👤 ЛИЧНЫЙ КАБИНЕТ / ВХОД */}
          {user ? (
            <button
              onClick={onOpenCabinet}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 px-2.5 sm:px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#E8583A]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(232,88,58,0.2)]"
            >
              <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse"></div>
              <span className="truncate max-w-[80px] sm:max-w-[100px] hidden md:inline">{user.email.split('@')[0]}</span>
              <span className="text-[#34D399] font-bold">({user.balanceSol || 0} SOL)</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 font-mono text-xs font-bold text-white hover:border-[#E8583A] hover:bg-[#E8583A]/15 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#E8583A]">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{isEn ? 'LOG IN' : 'ВХОД'}</span>
            </button>
          )}

          {/* Статус автовыдачи */}
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-1.5 font-mono text-xs text-white/70 xl:flex">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#E8583A]">
              <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
            </svg>
            <span>{t('nav_auto_delivery')}</span>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
