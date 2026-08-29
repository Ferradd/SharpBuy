import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const CommunityDropBanner = () => {
  const { lang } = useLanguage();
  const [tgInput, setTgInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (tgInput.trim()) {
      setIsJoined(true);
      setTimeout(() => {
        window.open('https://t.me/sharpbuy', '_blank');
      }, 700);
    }
  };

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#0A0A09] py-20 text-[#F3F1EC] border-t border-white/[0.08]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* ── КИНЕМАТОГРАФИЧНЫЙ БАННЕР РОЗЫГРЫША С AWP DRAGON ── */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.12] bg-[#121110] p-8 lg:p-12 shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
          
          {/* Фоновое фото AWP Dragon с затемнением */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-45 transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/cs2-dragon-awp.jpg')` }}
          ></div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0E0D0C] via-[#0E0D0C]/75 to-transparent"></div>

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            
            {/* Левая колонка: Описание розыгрыша */}
            <div className="lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-[#E8583A]/40 bg-[#E8583A]/10 px-3.5 py-1 font-mono text-xs font-bold text-[#E8583A] uppercase">
                <svg className="h-4 w-4 text-[#E8583A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{lang === 'ru' ? 'ЕЖЕНЕДЕЛЬНЫЙ РОЗЫГРЫШ SKINS' : 'WEEKLY CS2 SKINS GIVEAWAY'}</span>
              </div>

              <h3
                className="font-black uppercase tracking-tight text-[#F3F1EC]"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(32px, 3.5vw, 48px)', lineHeight: 1 }}
              >
                {lang === 'ru' ? 'ВЫИГРАЙ AWP DRAGON LORE ИЛИ BUTTERFLY FADE ($1,200)' : 'WIN AWP DRAGON LORE OR BUTTERFLY FADE ($1,200)'}
              </h3>

              <p className="mt-4 max-w-xl font-sans text-sm text-white/70 leading-relaxed">
                {lang === 'ru'
                  ? 'Каждое воскресенье в 20:00 наш Telegram-бот случайно выбирает 1 победителя среди активных подписчиков канала. Участие бесплатное!'
                  : 'Every Sunday at 20:00 UTC our automated bot randomly draws 1 winner among verified community members. Free participation!'}
              </p>

              {/* Форма участия */}
              <form onSubmit={handleJoin} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="text"
                  value={tgInput}
                  onChange={(e) => setTgInput(e.target.value)}
                  placeholder={lang === 'ru' ? 'Ваш @username в Telegram...' : 'Your Telegram @username...'}
                  required
                  className="h-12 flex-1 rounded-xl border border-white/20 bg-black/70 px-4 font-mono text-xs text-[#F3F1EC] placeholder:text-white/40 focus:border-[#E8583A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-[#E8583A] px-7 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(232,88,58,0.5)] transition-all hover:bg-[#ff6545] cursor-pointer shrink-0"
                >
                  {isJoined ? (lang === 'ru' ? '✓ ВЫ УЧАСТВУЕТЕ' : '✓ YOU ARE IN') : (lang === 'ru' ? 'УЧАСТВОВАТЬ' : 'JOIN GIVEAWAY')}
                </button>
              </form>
            </div>

            {/* Правая колонка: Карточка сообщества */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#0A0908]/90 p-6 backdrop-blur-xl">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3 font-mono text-xs text-white/50">
                  <span>TELEGRAM SYNDICATE</span>
                  <span className="text-white/80 font-bold">{lang === 'ru' ? '18,400+ УЧАСТНИКОВ' : '18,400+ MEMBERS'}</span>
                </div>

                <div className="space-y-3 font-mono text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span>{lang === 'ru' ? 'Свежие поставки:' : 'Fresh drops:'}</span>
                    <span className="font-bold text-white">{lang === 'ru' ? 'Каждые 4 часа' : 'Every 4 hours'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'ru' ? 'Промокоды на скидку:' : 'Discount promo codes:'}</span>
                    <span className="font-bold text-[#E8583A]">{lang === 'ru' ? 'до -25%' : 'up to -25%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{lang === 'ru' ? 'Прямой контакт поддержки:' : 'Direct support desk:'}</span>
                    <span className="font-bold text-white">@SharpBuySupport</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08]">
                <a
                  href="https://t.me/sharpbuy_shop"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/[0.04] py-3 font-mono text-xs font-bold text-white transition-all hover:border-[#E8583A] hover:bg-[#E8583A]/10"
                >
                  <svg className="h-4 w-4 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                  </svg>
                  <span>{lang === 'ru' ? 'ПЕРЕЙТИ В TELEGRAM КАНАЛ' : 'JOIN TELEGRAM CHANNEL'}</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
