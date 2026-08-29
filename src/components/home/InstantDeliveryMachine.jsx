import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const InstantDeliveryMachine = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const [showDemoPayload, setShowDemoPayload] = useState(false);

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#070605] py-20 text-[#F3F1EC] border-t border-b border-white/[0.08]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* Заголовок */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="mb-2 flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.25em] text-[#E8583A] uppercase">
              <span className="h-1.5 w-6 bg-[#E8583A]"></span>
              <span>{lang === 'ru' ? 'МЕХАНИКА ВЫДАЧИ · 3 СЕКУНДЫ' : 'DISPATCH PROTOCOL · 3 SECONDS'}</span>
            </div>
            <h2
              className="font-black uppercase tracking-tight text-[#F3F1EC]"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 0.95 }}
            >
              {lang === 'ru' ? 'КАК ВЫ ПОЛУЧАЕТЕ ДАННЫЕ' : 'HOW YOU RECEIVE YOUR ACCOUNT'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('instructions')}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs font-bold text-white/80 transition-all hover:border-[#E8583A] hover:text-white cursor-pointer"
          >
            <span>{lang === 'ru' ? 'ПОДРОБНАЯ ИНСТРУКЦИЯ ПО ВХОДУ' : 'FULL LOGIN GUIDE'}</span>
            <span className="text-[#E8583A]">&rarr;</span>
          </button>
        </div>

        {/* ── ТЕРМИНАЛ АВТОВЫДАЧИ: 4 ШАГА В 1 ИНТЕЛЛЕКТУАЛЬНОМ БЛОКЕ ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ЛЕВАЯ КОЛОНКА (7/12): 4 ШАГА СВЕРХБЫСТРОЙ ВЫДАЧИ */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#121110] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="space-y-6">
              
              {/* Шаг 1 */}
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8583A]/20 border border-[#E8583A]/40 font-mono text-sm font-black text-[#E8583A]">
                  01
                </span>
                <div>
                  <h4 className="font-sans text-base font-black uppercase text-white">
                    {lang === 'ru' ? 'МГНОВЕННАЯ ОПЛАТА БЕЗ КОМИССИИ' : 'INSTANT ZERO-FEE CHECKOUT'}
                  </h4>
                  <p className="mt-1 font-sans text-xs text-white/60 leading-relaxed">
                    {lang === 'ru'
                      ? 'Оплата в 1 клик через СБП, банковские карты или криптовалюту (USDT/TON). Шлюз подтверждает платеж за 1.5 секунды.'
                      : '1-click checkout via Cards, Fast Payments or Crypto (USDT/TON). Instant gateway confirmation within 1.5 seconds.'}
                  </p>
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 font-mono text-sm font-black text-emerald-400">
                  02
                </span>
                <div>
                  <h4 className="font-sans text-base font-black uppercase text-white">
                    {lang === 'ru' ? 'АВТОМАТИЧЕСКИЙ ПАРСЕР И ПРОВЕРКА 0 VAC' : 'AUTOMATED STEAM API & VAC AUDIT'}
                  </h4>
                  <p className="mt-1 font-sans text-xs text-white/60 leading-relaxed">
                    {lang === 'ru'
                      ? 'Перед отправкой бот делает контрольный запрос к серверам Steam, проверяя логин, отсутствие банов и валидность пароля.'
                      : 'Before dispatch, our bot conducts a live Steam API audit, verifying password validity and zero VAC bans.'}
                  </p>
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 font-mono text-sm font-black text-[#3B82F6]">
                  03
                </span>
                <div>
                  <h4 className="font-sans text-base font-black uppercase text-white">
                    {lang === 'ru' ? 'ВЫДАЧА НА ЭКРАН И В TELEGRAM-БОТ' : 'INSTANT CREDENTIALS DISPATCH'}
                  </h4>
                  <p className="mt-1 font-sans text-xs text-white/60 leading-relaxed">
                    {lang === 'ru'
                      ? 'Данные отображаются прямо на странице в защищенном окне и дублируются в Telegram вместе с MaFile и первой почтой.'
                      : 'Credentials appear instantly on your screen and are backed up to your Telegram with Steam Guard MaFile codes.'}
                  </p>
                </div>
              </div>

              {/* Шаг 4 */}
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#A855F7]/20 border border-[#A855F7]/40 font-mono text-sm font-black text-[#A855F7]">
                  04
                </span>
                <div>
                  <h4 className="font-sans text-base font-black uppercase text-white">
                    {lang === 'ru' ? 'АКТИВАЦИЯ 30-ДНЕВНОГО ЩИТА' : '30-DAY WARRANTY SHIELD ACTIVATED'}
                  </h4>
                  <p className="mt-1 font-sans text-xs text-white/60 leading-relaxed">
                    {lang === 'ru'
                      ? 'Ваш заказ попадает под круглосуточный мониторинг. При любой непредвиденной ситуации поддержка на связи 24/7.'
                      : 'Your purchase is protected by 24/7 automated monitoring. Instant support replacement or full moneyback.'}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-8 border-t border-white/[0.08] pt-4 flex items-center justify-between font-mono text-xs text-white/40">
              <span>● {lang === 'ru' ? 'Среднее время получения:' : 'Average delivery time:'} <strong className="text-emerald-400">2.8 сек</strong></span>
              <span className="text-emerald-400">100% AUTOMATED</span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (5/12): ИНТЕРАКТИВНЫЙ ОБРАЗЕЦ ПОЛУЧАЕМЫХ ДАННЫХ */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/[0.12] bg-[#0A0908] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {lang === 'ru' ? 'ОБРАЗЕЦ ВЫДАЧИ' : 'DISPATCH PAYLOAD PREVIEW'}
                  </span>
                </div>
                <button
                  onClick={() => setShowDemoPayload(!showDemoPayload)}
                  className="font-mono text-[11px] text-[#E8583A] hover:underline cursor-pointer"
                >
                  {showDemoPayload ? (lang === 'ru' ? 'Скрыть данные' : 'Hide Data') : (lang === 'ru' ? 'Показать данные' : 'Reveal Data')}
                </button>
              </div>

              {/* Кодовый блок терминала */}
              <div className="rounded-xl border border-white/[0.08] bg-[#121110] p-4 font-mono text-xs space-y-2.5">
                <div>
                  <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? 'ЛОГИН STEAM:' : 'STEAM LOGIN:'}</span>
                  <span className="text-emerald-400 font-bold">sharp_warrior_cs2</span>
                </div>

                <div>
                  <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? 'ПАРОЛЬ STEAM:' : 'STEAM PASSWORD:'}</span>
                  <span className="text-white font-bold">{showDemoPayload ? 'K9#xL92!mP88q' : '••••••••••••••••'}</span>
                </div>

                <div>
                  <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? 'РОДНАЯ ПОЧТА (FIRST EMAIL):' : 'NATIVE EMAIL ACCESS:'}</span>
                  <span className="text-white font-bold">{showDemoPayload ? 'sharp_owner99@rambler.ru : Pass123!' : '••••••••••••••••••••••••'}</span>
                </div>

                <div>
                  <span className="text-white/40 uppercase block text-[10px]">{lang === 'ru' ? 'STEAM GUARD (MAFILE / 2FA):' : 'STEAM GUARD (MAFILE):'}</span>
                  <span className="text-[#E8583A] font-bold">R48291 (Active)</span>
                </div>
              </div>

              <p className="mt-4 font-sans text-xs text-white/55 leading-relaxed">
                {lang === 'ru'
                  ? 'Вместе с данными вы получаете прямую ссылку на вход и автоматический перевод почты на ваш личный адрес.'
                  : 'Along with credentials, you receive an instant login guide and 1-click email rebind instructions.'}
              </p>
            </div>

            <div className="mt-6 border-t border-white/[0.08] pt-4">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E8583A] py-3 font-sans text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(232,88,58,0.4)] transition-all hover:bg-[#ff6545] cursor-pointer"
              >
                <span>{lang === 'ru' ? 'ВЫБРАТЬ АККАУНТ И ПОЛУЧИТЬ' : 'CHOOSE ACCOUNT & RECEIVE'}</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
