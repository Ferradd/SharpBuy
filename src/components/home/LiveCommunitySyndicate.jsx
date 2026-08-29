import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LiveCommunitySyndicate = () => {
  const { lang } = useLanguage();
  const [tgInput, setTgInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const livePurchases = [
    { user: 's1mple_fan***', item: 'Karambit Doppler Phase 2 (0.007)', price: '2 890 ₽', time: '8 сек назад', flag: '🇷🇺' },
    { user: 'm0NESY_cl***', item: 'CS2 Prime Full Access (21k Elo)', price: '2 490 ₽', time: '24 сек назад', flag: '🇩🇪' },
    { user: 'faze_karr***', item: 'Butterfly Knife Fade (99.6%)', price: '3 490 ₽', time: '45 сек назад', flag: '🇵🇱' },
    { user: 'raid_leade***', item: 'Rust 5,140h Raid Account + DLC', price: '990 ₽', time: '1 мин назад', flag: '🇰🇿' },
    { user: 'donk_hitte***', item: 'Faceit 10 (2,480 ELO) Rebind', price: '1 990 ₽', time: '2 мин назад', flag: '🇺🇦' },
    { user: 'zywOo_peak***', item: 'CS2 No-Prime 10 Wins Ready', price: '290 ₽', time: '3 мин назад', flag: '🇫🇷' },
  ];

  const handleJoinGiveaway = (e) => {
    e.preventDefault();
    if (tgInput.trim()) {
      setIsJoined(true);
      setTimeout(() => {
        window.open('https://t.me/sharpbuy_shop', '_blank');
      }, 700);
    }
  };

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-white/[0.08]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          
          {/* ЛЕВАЯ КОЛОНКА (6/12): ЖИВОЙ ПРЯМОЙ ЭФИР ВЫДАЧ */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#100F0E] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div>
              <div className="flex items-center justify-between mb-5 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {lang === 'ru' ? 'ПРЯМОЙ ЭФИР ВЫДАЧИ АККАУНТОВ' : 'LIVE DISPATCH TELEMETRY'}
                  </span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-semibold">24/7 ONLINE</span>
              </div>

              <div className="flex flex-col space-y-2.5">
                {livePurchases.map((lp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0A0908] px-4 py-3 font-mono text-xs hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{lp.flag}</span>
                      <span className="font-bold text-white/90">{lp.user}</span>
                      <span className="text-white/30">&rarr;</span>
                      <span className="text-[#E8583A] font-semibold">{lp.item}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-white/30 text-[11px]">{lp.time}</span>
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-400 text-[10px] font-bold">
                        3s OK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 font-mono text-xs text-white/40">
              <span>{lang === 'ru' ? 'Выдано сегодня:' : 'Dispatched today:'} <strong className="text-white">412 аккаунтов</strong></span>
              <span className="text-emerald-400 font-bold">● 100% УСПЕШНО</span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (6/12): РОЗЫГРЫШ И СООБЩЕСТВО TELEGRAM */}
          <div className="lg:col-span-6 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8583A]/40 bg-gradient-to-br from-[#1C1613] via-[#12100F] to-[#0A0908] p-8 shadow-[0_0_60px_rgba(232,88,58,0.2)]">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#E8583A]/15 blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold tracking-wider text-[#E8583A] uppercase">
                <span>🎁 {lang === 'ru' ? 'ЕЖЕНЕДЕЛЬНЫЙ КИБЕРСПОРТИВНЫЙ ДРОП' : 'WEEKLY ESPORTS KNIFE DROP'}</span>
              </div>

              <h3
                className="font-black uppercase tracking-tight text-[#F3F1EC]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(28px, 2.8vw, 38px)', lineHeight: 1.05 }}
              >
                {lang === 'ru' ? 'ВЫИГРАЙ BUTTERFLY KNIFE FADE ($1,200)' : 'WIN BUTTERFLY KNIFE FADE ($1,200)'}
              </h3>

              <p className="mt-3 font-sans text-xs text-white/70 leading-relaxed">
                {lang === 'ru'
                  ? 'Каждое воскресенье в 20:00 наш Telegram-бот случайно выбирает 1 победителя среди участников канала. Участие бесплатное!'
                  : 'Every Sunday at 20:00 UTC our automated bot randomly draws 1 winner among verified channel subscribers. Free entry!'}
              </p>

              {/* Форма участия */}
              <form onSubmit={handleJoinGiveaway} className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={tgInput}
                  onChange={(e) => setTgInput(e.target.value)}
                  placeholder={lang === 'ru' ? 'Ваш @username в Telegram...' : 'Your Telegram @username...'}
                  required
                  className="h-12 flex-1 rounded-xl border border-white/20 bg-black/60 px-4 font-mono text-xs text-[#F3F1EC] placeholder:text-white/40 focus:border-[#E8583A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-[#E8583A] px-6 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(232,88,58,0.5)] transition-all hover:bg-[#ff6545] cursor-pointer shrink-0"
                >
                  {isJoined ? (lang === 'ru' ? '✓ ВЫ УЧАСТВУЕТЕ' : '✓ YOU ARE IN') : (lang === 'ru' ? 'УЧАСТВОВАТЬ' : 'JOIN GIVEAWAY')}
                </button>
              </form>
            </div>

            {/* Нижний блок Telegram сообщества */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-5 font-mono text-xs">
              <div className="flex items-center gap-2.5 text-white/70">
                <svg className="h-5 w-5 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                </svg>
                <span>@sharpbuy_shop &middot; 18 400+ {lang === 'ru' ? 'участников' : 'subscribers'}</span>
              </div>

              <a
                href="https://t.me/sharpbuy_shop"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#E8583A] hover:underline"
              >
                {lang === 'ru' ? 'Перейти в Telegram →' : 'Open Telegram →'}
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
