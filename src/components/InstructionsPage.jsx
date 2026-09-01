import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const InstructionsPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

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
          <span className="text-[#E8583A] font-semibold">{lang === 'ru' ? 'Инструкции NFA' : 'NFA Instructions'}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-10">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="h-[2px] w-6 bg-white/40"></span>
            <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
            <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
              {lang === 'ru' ? 'РУКОВОДСТВА ДЛЯ ПОКУПАТЕЛЕЙ' : 'BUYER SETUP GUIDELINES'}
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
            {lang === 'ru' ? (
              <>ИНСТРУКЦИЯ ПО ПОЛЬЗОВАНИЮ<br />NFA АККАУНТАМИ</>
            ) : (
              <>USER MANUAL &amp; LAUNCH GUIDE<br />FOR NFA ACCOUNTS</>
            )}
          </h1>

          <p className="mt-3.5 max-w-2xl font-sans text-sm text-white/60 leading-relaxed">
            {lang === 'ru'
              ? 'Пожалуйста, прочитайте руководство до конца перед запуском Steam и авторизацией.'
              : 'Please read the complete instructions before starting Steam client or authenticating.'}
          </p>
        </div>

        {/* ── 3. ВАЖНЫЕ ПРЕДУПРЕЖДЕНИЯ ── */}
        <div className="mb-10 space-y-4">
          {/* Предупреждение NFA */}
          <div className="rounded-2xl border border-[#E8583A]/40 bg-[#161210] p-6 shadow-[0_10px_30px_rgba(232,88,58,0.15)]">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
              <span>&#9888;</span>
              <span>{lang === 'ru' ? 'ВНИМАНИЕ! АККАУНТЫ NFA (NOT FULL ACCESS)' : 'WARNING: NFA (NO FULL ACCESS) ACCOUNTS'}</span>
            </div>
            <p className="mt-2 font-sans text-xs text-white/80 leading-relaxed">
              {lang === 'ru'
                ? 'На аккаунте можете находиться не только вы. Если при входе вы видите, что на аккаунте уже идёт игра — подождите, пока сессия завершится, и только затем начинайте играть сами.'
                : 'Multiple authorized sessions may exist. If you notice an active match in progress upon login, wait until the current session concludes before starting your game.'}
            </p>
          </div>

          {/* Сохранение доступа */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#121110] p-6">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
              <span>{lang === 'ru' ? 'КАК НЕ ПОТЕРЯТЬ ДОСТУП РАНЬШЕ ВРЕМЕНИ' : 'HOW TO PREVENT PREMATURE LOGOUT'}</span>
            </div>
            <p className="mt-2 font-sans text-xs text-white/65 leading-relaxed">
              {lang === 'ru'
                ? 'Не выходите из аккаунта полностью (кнопкой «Выйти»). Если нужно переключиться на свой личный профиль, используйте функцию «Войти в другой аккаунт» в клиенте Steam.'
                : 'Do not click full "Log Out". If you need to switch back to your main profile, use "Change Account" inside the Steam client interface.'}
            </p>
          </div>
        </div>

        {/* ── 4. ПОШАГОВЫЙ ВХОД В АККАУНТ ── */}
        <div className="mb-12 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9">
          <h2 className="mb-6 font-sans text-xl font-extrabold uppercase tracking-tight text-[#F3F1EC]">
            {lang === 'ru' ? 'Порядок входа через программу' : 'Step-by-Step Launcher Login'}
          </h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Левая колонка: шаги */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 font-mono text-xs font-bold text-[#E8583A]">
                  01
                </span>
                <div>
                  <div className="font-sans text-sm font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? 'Скачайте и установите программу' : 'Download and run the launcher'}
                  </div>
                  <p className="mt-1 font-sans text-xs text-white/55">
                    {lang === 'ru'
                      ? 'Используйте официальные проверенные ссылки из блока справа.'
                      : 'Use verified official links provided in the download box on the right.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 font-mono text-xs font-bold text-[#E8583A]">
                  02
                </span>
                <div>
                  <div className="font-sans text-sm font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? 'Завершите процесс Steam и запустите .EXE' : 'Close Steam completely and start .EXE'}
                  </div>
                  <p className="mt-1 font-sans text-xs text-white/55">
                    {lang === 'ru'
                      ? 'Полностью закройте Steam (проверьте в Диспетчере задач, чтобы процесс steam.exe не оставался активным) и запустите программу.'
                      : 'Ensure Steam is fully closed (verify in Task Manager that steam.exe is terminated) before launching.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 font-mono text-xs font-bold text-[#E8583A]">
                  03
                </span>
                <div>
                  <div className="font-sans text-sm font-bold text-[#F3F1EC]">
                    {lang === 'ru' ? 'Введите полученные данные (Логин---ключ)' : 'Enter purchased credentials (Login---key)'}
                  </div>
                  <p className="mt-1 font-sans text-xs text-white/55">
                    {lang === 'ru'
                      ? 'После ввода откроется окно Steam, где необходимо выбрать самый левый профиль (новый).'
                      : 'Upon entry Steam opens automatically; select the leftmost (new) authorized profile.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Правая колонка: официальные ссылки на загрузку */}
            <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0E0D0C] p-6 space-y-4">
              <div className="font-mono text-xs font-bold text-white/40 uppercase tracking-wider flex items-center justify-between">
                <span>{lang === 'ru' ? 'ОФИЦИАЛЬНЫЙ СОФТ' : 'OFFICIAL SOFTWARE'}</span>
                <span className="text-[#E8583A]">v4.4 STABLE</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Главная большая кнопка скачивания */}
                <a
                  href="/SharpBuy_Launcher.exe" download="SharpBuy_Launcher.exe"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-[#E8583A]/50 bg-[#E8583A]/15 p-4 text-white transition-all hover:bg-[#E8583A]/25 hover:border-[#E8583A] shadow-[0_0_20px_rgba(232,88,58,0.2)] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8583A] text-white shadow-md group-hover:scale-105 transition-transform">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-sans font-black text-sm uppercase text-white group-hover:text-[#E8583A] transition-colors">
                        {lang === 'ru' ? 'СКАЧАТЬ ЛАУНЧЕР' : 'DOWNLOAD LAUNCHER'}
                      </div>
                      <div className="font-mono text-[11px] text-white/50">
                        {lang === 'ru' ? 'Прямое скачивание с сайта' : 'Direct download from website'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#E8583A] group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </a>

                <a
                  href="/SharpBuy_Launcher.dmg" download="SharpBuy_Launcher.dmg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white transition-all hover:bg-white/[0.06] hover:border-white/20 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white group-hover:scale-105 transition-transform">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-sans font-black text-sm uppercase text-white">
                        {lang === 'ru' ? 'СКАЧАТЬ ДЛЯ MAC' : 'DOWNLOAD FOR MAC'}
                      </div>
                      <div className="font-mono text-[11px] text-white/50">
                        {lang === 'ru' ? 'DMG · Apple Silicon · ~5 MB' : 'DMG · Apple Silicon · ~5 MB'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-white/60 group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. РЕКОМЕНДАЦИИ ПО СОХРАНЕНИЮ АККАУНТА ── */}
        <div className="mb-12 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:p-9">
          <div className="mb-6 font-mono text-xs font-bold text-[#E8583A] uppercase tracking-wider">
            {lang === 'ru' ? 'ПРАВИЛА ДОЛГОЙ ЖИЗНИ АККАУНТА' : 'LIFETIME PRESERVATION RULES'}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 font-mono text-xs">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="font-bold text-white mb-1">{lang === 'ru' ? 'РЕЖИМ НЕВИДИМКИ' : 'INVISIBLE STATUS'}</div>
              <p className="font-sans text-xs text-white/55">{lang === 'ru' ? 'Выйдите из сети или поставьте статус «Невидимка» в чате Steam.' : 'Set your Steam profile chat status to Invisible/Offline.'}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="font-bold text-white mb-1">{lang === 'ru' ? 'ОТКЛЮЧИТЕ REMOTE PLAY' : 'DISABLE REMOTE PLAY'}</div>
              <p className="font-sans text-xs text-white/55">{lang === 'ru' ? 'Отключите Steam Remote Play в настройках клиента.' : 'Turn off Steam Remote Play in client settings.'}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="font-bold text-white mb-1">{lang === 'ru' ? 'НЕ МЕНЯЙТЕ НИКНЕЙМ' : 'PRESERVE NICKNAME'}</div>
              <p className="font-sans text-xs text-white/55">{lang === 'ru' ? 'Не удаляйте друзей и не меняйте имя профиля без необходимости.' : 'Avoid removing friends or changing profile aliases.'}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="font-bold text-white mb-1">{lang === 'ru' ? 'ОТЛЕГА И БЕЗОПАСНОСТЬ' : 'SECURITY & AGE'}</div>
              <p className="font-sans text-xs text-white/55">{lang === 'ru' ? 'Соблюдение этих правил увеличивает время жизни NFA доступа в разы.' : 'Adhering to these rules extends NFA session persistence significantly.'}</p>
            </div>
          </div>
        </div>

        {/* ── 6. ПОДДЕРЖКА ── */}
        <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="font-sans text-base font-extrabold uppercase tracking-tight text-[#F3F1EC]">
              {lang === 'ru' ? 'ОСТАЛИСЬ ВОПРОСЫ ПО ВХОДУ?' : 'QUESTIONS ABOUT LAUNCHER SETUP?'}
            </div>
            <p className="font-sans text-xs text-white/55">
              {lang === 'ru'
                ? 'Поддержка поможет с настройкой софта и ответит на любые технические вопросы.'
                : 'Support operators are available to assist with software setup and questions.'}
            </p>
          </div>

          <a
            href="https://t.me/SharpBuySupport"
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[#E8583A]/50 bg-[#12100E] px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#F3F1EC] transition-all duration-300 hover:border-[#E8583A] hover:bg-[#1E1713]"
          >
            <div className="scanner-beam-line absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF6B4A] to-transparent opacity-70"></div>
            <span>TELEGRAM @SharpBuySupport</span>
            <span className="font-mono text-[#E8583A] transition-transform group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>

      </div>
    </div>
  );
};
