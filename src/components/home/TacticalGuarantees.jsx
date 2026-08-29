import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const TacticalGuarantees = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('dossier');
  const [dossierType, setDossierType] = useState('full'); // 'full' or 'nfa'
  const [revealedDossier, setRevealedDossier] = useState(false);

  const checklistItems = [
    {
      title: lang === 'ru' ? 'РОДНАЯ ПЕРВАЯ ПОЧТА' : 'NATIVE FIRST EMAIL',
      desc: lang === 'ru' ? 'Оригинальный почтовый ящик, на который был создан аккаунт + доступ к нему' : 'Original registration email with full customer credentials',
      icon: (
        <svg className="h-5 w-5 text-[#E8583A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      title: lang === 'ru' ? 'ПЕРВОЕ ПИСЬМО STEAM' : 'WELCOME STEAM LETTER',
      desc: lang === 'ru' ? 'Первое регистрационное письмо от Valve, исключающее возврат поддержкой' : 'First registration confirmation letter from Valve blocking any recovery attempts',
      icon: (
        <svg className="h-5 w-5 text-[#60A5FA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: lang === 'ru' ? 'ЧЕКИ ПЕРВЫХ ПОКУПОК' : 'FIRST PURCHASE RECEIPTS',
      desc: lang === 'ru' ? 'Квитанции первых транзакций и пополнений баланса для подтверждения владения' : 'First transaction receipts to prove authentic ownership to Steam Support',
      icon: (
        <svg className="h-5 w-5 text-[#F59E0B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      title: lang === 'ru' ? '0 СТОРОННЕГО СОФТА' : 'ZERO THIRD-PARTY TOOLS',
      desc: lang === 'ru' ? 'История матчей проверена ботом: никаких инжекторов, читов или репортов' : 'Match history audited: zero injectors, zero cheats, zero suspicious reports',
      icon: (
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.9 4.9 14.2 14.2" />
        </svg>
      ),
    },
    {
      title: lang === 'ru' ? '100% ЗЕЛЕНЫЙ TRUST' : '100% GREEN TRUST FACTOR',
      desc: lang === 'ru' ? 'Максимальный фактор доверия Valve без скрытых очередей и ограничений' : 'Highest Valve trust rating with clean matchmaking pools and zero hidden limits',
      icon: (
        <svg className="h-5 w-5 text-[#E8583A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: lang === 'ru' ? '30 ДНЕЙ ГАРАНТИИ' : '30-DAY ESCROW SHIELD',
      desc: lang === 'ru' ? 'Автоматическая замена в 1 клик или 100% возврат средств при любой проблеме' : '1-click automated replacement or full money-back guarantee on any anomaly',
      icon: (
        <svg className="h-5 w-5 text-[#A855F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 15 2 2 4-4" />
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-b border-white/[0.08]">
      
      {/* Фоновый атмосферный свет и текстура */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-full max-w-[1400px] rounded-full bg-[#E8583A]/10 blur-[160px]"></div>
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.04]"></div>

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* ── 1. ВЕРХНЯЯ ПАНЕЛЬ С ГОЛОГРАФИЧЕСКОЙ ПЕЧАТЬЮ ── */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/[0.08] pb-8">
          <div>
            <div className="mb-3 flex items-center gap-3 font-mono text-xs font-bold tracking-wider text-[#E8583A] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
              <span>{lang === 'ru' ? 'ГАРАНТИЯ БЕЗОПАСНОСТИ СДЕЛОК' : 'ESCROW TRADE SECURITY'}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/80 font-bold">{lang === 'ru' ? '100% ЗАЩИТА' : '100% PROTECTED'}</span>
            </div>

            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4.2vw, 56px)', lineHeight: 0.95 }}
            >
              {lang === 'ru' ? 'СТАНДАРТ БЕЗОПАСНОСТИ SHARPBUY' : 'THE SHARPBUY SECURITY STANDARD'}
            </h2>
          </div>

          {/* Интерактивные вкладки переключения режима */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.1] bg-[#121110] p-1.5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                activeTab === 'dossier'
                  ? 'bg-[#E8583A] text-white shadow-[0_0_20px_rgba(232,88,58,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
              <span>{lang === 'ru' ? 'ДОСЬЕ ВЫДАЧИ' : 'DISPATCH DOSSIER'}</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold transition-all cursor-pointer select-none ${
                activeTab === 'compare'
                  ? 'bg-[#E8583A] text-white shadow-[0_0_20px_rgba(232,88,58,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{lang === 'ru' ? 'СРАВНЕНИЕ С ОБЫЧНЫМИ БИРЖАМИ' : 'SHARPBUY VS SCAM MARKETS'}</span>
            </button>
          </div>
        </div>

        {/* ── 2. ОСНОВНОЙ ИНТЕРАКТИВНЫЙ БЛОК ── */}
        {activeTab === 'dossier' ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
            
            {/* ЛЕВАЯ ЧАСТЬ (7/12): 6-ТОЧЕЧНЫЙ ЧЕК-ЛИСТ VALVE */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#121110] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              <div>
                <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
                    <span>{lang === 'ru' ? '6 СТЕПЕНЕЙ ВАЛИДАЦИИ КАЖДОГО АККАУНТА' : '6-POINT AUTOMATED VALVE AUDIT'}</span>
                  </div>
                  <span className="font-mono text-xs text-white font-bold">100% CLEAN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {checklistItems.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.06] bg-[#0A0908] p-4 flex flex-col justify-between hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
                          {it.icon}
                        </div>
                        <span className="font-sans text-xs font-black uppercase text-[#F3F1EC]">{it.title}</span>
                      </div>
                      <p className="font-sans text-[11px] text-white/50 leading-relaxed">
                        {it.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-white/50">
                <span>{lang === 'ru' ? 'Показатель успешных сделок:' : 'Verified success rate:'} <strong className="text-white font-bold">99.82%</strong></span>
                <span>{lang === 'ru' ? 'Дежурная поддержка:' : 'Live support desk:'} <strong className="text-white">&lt; 90 сек ответ</strong></span>
              </div>
            </div>

            {/* ПРАВАЯ ЧАСТЬ (5/12): ИНТЕРАКТИВНОЕ ВОЕННОЕ ДОСЬЕ С ВЫБОРОМ FULL ACCESS VS NFA ТОКЕН */}
            <div className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8583A]/30 bg-gradient-to-br from-[#161311] via-[#100E0D] to-[#0A0908] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#E8583A]/10 blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {lang === 'ru' ? 'ОБРАЗЕЦ ВЫДАЧИ ДАННЫХ' : 'DISPATCH PAYLOAD'}
                    </span>
                  </div>
                  <button
                    onClick={() => setRevealedDossier(!revealedDossier)}
                    className="font-mono text-xs text-[#E8583A] hover:underline cursor-pointer"
                  >
                    {revealedDossier ? (lang === 'ru' ? 'Скрыть данные' : 'Mask Payload') : (lang === 'ru' ? 'Показать образец' : 'Reveal Sample')}
                  </button>
                </div>

                {/* Переключатель формата: Full Access (Пакет почты) vs NFA (Токен/Сессия) */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setDossierType('full')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      dossierType === 'full'
                        ? 'bg-[#E8583A]/20 border border-[#E8583A] text-white'
                        : 'bg-black/40 border border-white/[0.08] text-white/50 hover:text-white'
                    }`}
                  >
                    <span>🛡️ FULL ACCESS</span>
                  </button>

                  <button
                    onClick={() => setDossierType('nfa')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      dossierType === 'nfa'
                        ? 'bg-[#60A5FA]/20 border border-[#60A5FA] text-white'
                        : 'bg-black/40 border border-white/[0.08] text-white/50 hover:text-white'
                    }`}
                  >
                    <span>⚡ NFA (ТОКЕН / СЕССИЯ)</span>
                  </button>
                </div>

                {/* Кодовый блок терминала: Full Access vs NFA Token */}
                {dossierType === 'full' ? (
                  <div className="rounded-xl border border-white/[0.08] bg-black/60 p-5 font-mono text-xs space-y-3 backdrop-blur-md">
                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '01. ЛОГИН STEAM' : '01. STEAM LOGIN'}</span>
                      <span className="text-white font-bold">sharp_warrior_cs2</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '02. ПАРОЛЬ STEAM' : '02. STEAM PASSWORD'}</span>
                      <span className="text-white font-bold">{revealedDossier ? 'K9#xL92!mP88q' : '••••••••••••••••'}</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '03. РОДНАЯ ПОЧТА + ПАРОЛЬ' : '03. NATIVE EMAIL + PASSWORD'}</span>
                      <span className="text-white font-bold">{revealedDossier ? 'owner99@rambler.ru : P@ssw0rd' : '••••••••••••••••••••••••'}</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '04. STEAM GUARD MAFILE' : '04. STEAM GUARD 2FA'}</span>
                      <span className="text-[#E8583A] font-bold">R48291 (Auto-Authenticator)</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '05. ПЕРВОЕ ПИСЬМО И ЧЕКИ' : '05. FIRST LETTER & RECEIPTS'}</span>
                      <span className="text-white/80 font-bold">PDF Archive & Screenshots (Attached)</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.08] bg-black/60 p-5 font-mono text-xs space-y-3 backdrop-blur-md">
                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '01. ЛОГИН:ПАРОЛЬ NFA' : '01. NFA LOGIN:PASS'}</span>
                      <span className="text-white font-bold">{revealedDossier ? 'prime_nfa_user : SecretPass99!' : 'prime_nfa_user : ••••••••••••'}</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '02. СЕССИОННЫЙ ТОКЕН (TOKEN / COOKIES)' : '02. SESSION TOKEN (JWT / COOKIES)'}</span>
                      <span className="text-[#60A5FA] font-mono break-all text-[11px] block">
                        {revealedDossier ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-7eZDF0... [384 chars]' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9•••••••••••••••••••••••••••••••'}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '03. MAFILE / 2FA GUARD' : '03. MAFILE / 2FA GUARD'}</span>
                      <span className="text-[#E8583A] font-bold">Ready for 1-Click Steam Import</span>
                    </div>

                    <div>
                      <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? '04. ИНСТРУКЦИЯ ПО ВХОДУ' : '04. INJECTION GUIDE'}</span>
                      <span className="text-white/80 font-bold">{lang === 'ru' ? 'Вставка токена в 1 клик без сброса сессии' : '1-click token insert without session invalidation'}</span>
                    </div>
                  </div>
                )}

                <p className="mt-4 font-sans text-xs text-white/55 leading-relaxed">
                  {dossierType === 'full'
                    ? (lang === 'ru'
                      ? 'В комплекте родная почта и чеки. Полная перепривязка на ваши данные за 3 секунды.'
                      : 'Complete native email and receipts bundle. 100% rebind to your personal details in 3 seconds.')
                    : (lang === 'ru'
                      ? 'NFA аккаунт выдается в виде логина и готового токена для быстрой вставки в лаунчер/браузер.'
                      : 'NFA account is delivered as login + session token for instant 1-click launcher integration.')}
                </p>
              </div>

              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => onNavigate('guarantees')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E8583A] py-3.5 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(232,88,58,0.4)] transition-all hover:bg-[#ff6545] cursor-pointer"
                >
                  <span>{lang === 'ru' ? 'ЧИТАТЬ ПОЛНЫЙ РЕГЛАМЕНТ ГАРАНТИИ' : 'READ COMPLETE WARRANTY REGULATIONS'}</span>
                  <span>&rarr;</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* ── РЕЖИМ 2: СРАВНИТЕЛЬНЫЙ РЕНТГЕН (SHARPBUY VS СКАМ-БИРЖИ) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Обычные биржи / Скам */}
            <div className="rounded-2xl border border-red-500/20 bg-[#120D0D] p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-red-500/10 pb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-sm">
                  <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <h3 className="font-sans text-lg font-black uppercase text-red-400">
                  {lang === 'ru' ? 'ОБЫЧНЫЕ БИРЖИ И СКАМ-САЙТЫ' : 'TYPICAL UNVERIFIED MARKETPLACES'}
                </h3>
              </div>

              <div className="space-y-4 font-sans text-xs text-white/70">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <p><strong className="text-white">{lang === 'ru' ? 'Откат через 3-7 дней:' : 'Recovered after 3-7 days:'}</strong> {lang === 'ru' ? 'Продавец восстанавливает аккаунт через первую почту или чеки.' : 'Seller easily recovers the account using original registration mail.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <p><strong className="text-white">{lang === 'ru' ? 'Красный Trust Factor / Скрытый софт:' : 'Red Trust Factor / Hidden Injections:'}</strong> {lang === 'ru' ? 'На аккаунте играли с софтом, и через неделю прилетает VAC-бан.' : 'Account was previously injected, triggering delayed VAC bans.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <p><strong className="text-white">{lang === 'ru' ? 'Поддержка молчит:' : 'Non-responsive support:'}</strong> {lang === 'ru' ? 'При блокировке вас отправляют в игнор без манибека и замены.' : 'Ticket ignored with zero replacement or money-back options.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <p><strong className="text-white">{lang === 'ru' ? 'Долгая ручная выдача:' : 'Slow manual dispatch:'}</strong> {lang === 'ru' ? 'Ожидание продавца часами в Telegram без гарантий.' : 'Waiting hours for an unverified seller to reply.'}</p>
                </div>
              </div>
            </div>

            {/* Стандарт SHARPBUY */}
            <div className="rounded-2xl border border-[#E8583A]/30 bg-[#161210] p-8 shadow-[0_0_50px_rgba(232,88,58,0.1)]">
              <div className="flex items-center gap-3 mb-6 border-b border-[#E8583A]/20 pb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8583A]/20 text-[#E8583A] font-bold text-sm">
                  <svg className="h-4 w-4 text-[#E8583A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <h3 className="font-sans text-lg font-black uppercase text-[#E8583A]">
                  {lang === 'ru' ? 'СТАНДАРТ БЕЗОПАСНОСТИ SHARPBUY' : 'THE SHARPBUY SECURITY PROTOCOL'}
                </h3>
              </div>

              <div className="space-y-4 font-sans text-xs text-white/80">
                <div className="flex items-start gap-3">
                  <span className="text-[#E8583A] font-bold mt-0.5">✓</span>
                  <p><strong className="text-white">{lang === 'ru' ? 'Родная почта + First Letter:' : 'Native email + First Letter:'}</strong> {lang === 'ru' ? 'Вы получаете оригинальный ящик и чеки — восстановить аккаунт технически невозможно.' : 'You receive the master registration inbox and receipts — impossible to rollback.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#E8583A] font-bold mt-0.5">✓</span>
                  <p><strong className="text-white">{lang === 'ru' ? '0 VAC и чистый Trust Factor:' : '0 VAC & 100% Green Trust:'}</strong> {lang === 'ru' ? 'Автоматический аудит матчей серверами Valve перед выдачей в руки.' : 'Automated match history scan via Valve API prior to credential dispatch.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#E8583A] font-bold mt-0.5">✓</span>
                  <p><strong className="text-white">{lang === 'ru' ? '30-Дневный Щит и Манибек:' : '30-Day Shield & Instant Replacement:'}</strong> {lang === 'ru' ? 'Мгновенная замена или 100% возврат средств дежурным оператором за 90 секунд.' : 'Instant 1-click replacement or 100% money-back by live desk under 90 sec.'}</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#E8583A] font-bold mt-0.5">✓</span>
                  <p><strong className="text-white">{lang === 'ru' ? '3-Секундная Автовыдача:' : '3-Second Instant Dispatch:'}</strong> {lang === 'ru' ? 'Автоматический бот выдает пароли и MaFile сразу после клика оплаты.' : 'Bot dispenses login, password and Steam Guard MaFile in 3 seconds flat.'}</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
