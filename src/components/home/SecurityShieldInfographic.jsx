import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SecurityShieldInfographic = ({ onNavigate }) => {
  const { lang } = useLanguage();

  const protocols = [
    {
      code: 'PROTOCOL 01',
      title: lang === 'ru' ? 'РОДНАЯ ПОЧТА & ПЕРВОЕ ПИСЬМО' : 'NATIVE EMAIL & FIRST WELCOME LETTER',
      desc: lang === 'ru'
        ? 'В категории Full Access передается оригинальная почта регистрации с приветственным письмом Steam. Никаких шансов на откат третьими лицами.'
        : 'Full Access accounts come with the original registration email and Steam welcome letter. Zero chance of third-party recovery.',
      badge: '100% BULLETPROOF',
      icon: '✉️',
    },
    {
      code: 'PROTOCOL 02',
      title: lang === 'ru' ? 'АВТОСКАНЕР 0 VAC & GREEN TRUST' : 'AUTOMATED 0 VAC & GREEN TRUST AUDIT',
      desc: lang === 'ru'
        ? 'Перед выдачей бот сканирует серверы Valve: 0 репортов, чистая история соревновательных матчей, отсутствие стороннего ПО и зеленый фактор доверия.'
        : 'Prior to dispatch, our bot scans Valve servers: zero reports, clean competitive match history, zero third-party tools and 100% green trust.',
      badge: '100% CLEAN',
      icon: '🛡️',
    },
    {
      code: 'PROTOCOL 03',
      title: lang === 'ru' ? 'АВТОВЫДАЧА ЗА 3 СЕКУНДЫ' : '3-SECOND INSTANT BOT DISPATCH',
      desc: lang === 'ru'
        ? 'Сразу после оплаты Telegram-бот и личный кабинет мгновенно выдают логин, пароль, MaFile (Steam Guard) и пошаговый гайд по безопасности.'
        : 'Immediately upon checkout, our bot dispenses login, password, MaFile (Steam Guard), and a security guide to your Telegram/screen in 3 seconds.',
      badge: '3-SEC TELEMETRY',
      icon: '⚡',
    },
    {
      code: 'PROTOCOL 04',
      title: lang === 'ru' ? '30-ДНЕВНЫЙ ГАРАНТИЙНЫЙ ЩИТ' : '30-DAY ZERO-RISK MONEYBACK SHIELD',
      desc: lang === 'ru'
        ? 'При возникновении любых вопросов с доступом операторы дежурной смены (ответ < 2 мин) мгновенно заменяют аккаунт или возвращают 100% средств.'
        : 'In the rare event of access questions, our 24/7 support staff (< 2 min response) provides instant replacement or 100% refund.',
      badge: 'MONEYBACK BACKED',
      icon: '💎',
    },
  ];

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#0A0A09] py-20 text-[#F3F1EC]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* Заголовок */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="mb-2 flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.25em] text-[#E8583A] uppercase">
              <span className="h-1.5 w-6 bg-[#E8583A]"></span>
              <span>{lang === 'ru' ? 'СТАНДАРТ БЕЗОПАСНОСТИ' : 'SECURITY & TRUST PROTOCOL'}</span>
            </div>
            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 0.95 }}
            >
              {lang === 'ru' ? 'ПОЧЕМУ SHARPBUY ВЫБИРАЮТ 48 000+ ИГРОКОВ' : 'WHY 48,000+ GAMERS TRUST SHARPBUY'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('guarantees')}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-bold text-white/80 transition-all hover:border-[#E8583A] hover:text-white cursor-pointer"
          >
            <span>{lang === 'ru' ? 'РЕГЛАМЕНТ ГАРАНТИИ И ЗАМЕНЫ' : 'READ WARRANTY TERMS'}</span>
            <span className="text-[#E8583A]">&rarr;</span>
          </button>
        </div>

        {/* Сетка 4 протоколов */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {protocols.map((p, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#121110] p-7 transition-all duration-300 hover:border-[#E8583A]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-black text-[#E8583A] tracking-wider uppercase">
                    {p.code}
                  </span>
                  <span className="rounded bg-black/60 border border-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-white/70">
                    {p.badge}
                  </span>
                </div>

                <div className="text-2xl mb-3">{p.icon}</div>

                <h3 className="font-sans text-base font-black uppercase text-[#F3F1EC] mb-2 leading-snug">
                  {p.title}
                </h3>

                <p className="font-sans text-xs text-white/60 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-white/[0.06] pt-4 font-mono text-[11px] text-white/50">
                <span>{lang === 'ru' ? '100% АВТОМАТИЗИРОВАНО' : '100% AUTOMATED'}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
