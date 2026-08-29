import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ReviewsPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  const sampleReviews = [
    {
      id: 'rev-01',
      author: lang === 'ru' ? 'Александр (Faceit 10 lvl)' : 'Alexander (Faceit 10 lvl)',
      item: lang === 'ru' ? 'ПРАЙМ АКК CS2 NFA (Нож + Перчатки)' : 'PRIME CS2 NFA (Knife + Gloves)',
      date: lang === 'ru' ? 'Сегодня, 18:42' : 'Today, 18:42',
      rating: 5,
      text: lang === 'ru'
        ? 'Выдали за 3 секунды, сразу залетел на ДМ и в Премьер. Бабочка на месте, отлега чистая. Саппорт в ТГ моментально ответил по вопросу софта.'
        : 'Instant 3-second delivery, jumped straight into Premier MM. Butterfly knife verified, clean inactivity. Telegram support answered under a minute.',
    },
    {
      id: 'rev-02',
      author: 'v1rus_cs',
      item: 'MIDNIGHT CS2 CFG',
      date: lang === 'ru' ? 'Сегодня, 16:15' : 'Today, 16:15',
      rating: 5,
      text: lang === 'ru'
        ? 'Конфиг пушка, легит настроен идеально, пули летят точно в шею. Лучший шоп по кс2!'
        : 'Config is absolute fire, legit aim settings are smooth and undetected. Best CS2 store by far!',
    },
    {
      id: 'rev-03',
      author: lang === 'ru' ? 'Дмитрий К.' : 'Dmitry K.',
      item: lang === 'ru' ? 'ПРАЙМ АКК CS2 NFA (Большая отлега + ПРЕМЬЕР)' : 'PRIME CS2 NFA (Long Inactive + PREMIER)',
      date: lang === 'ru' ? 'Вчера, 22:10' : 'Yesterday, 22:10',
      rating: 5,
      text: lang === 'ru'
        ? 'Беру уже 4-й акк за месяц. Всегда всё валид, инструкция понятная, за 40 рублей премьер с отлегой это подарок.'
        : 'Purchasing my 4th account this month. Always valid credentials, clean launcher instructions, unbeatable price.',
    },
    {
      id: 'rev-04',
      author: 'ShadowNinja',
      item: lang === 'ru' ? 'АККАУНТ RUST (Полный доступ)' : 'RUST ACCOUNT (Full Access)',
      date: lang === 'ru' ? 'Вчера, 14:05' : 'Yesterday, 14:05',
      rating: 5,
      text: lang === 'ru'
        ? 'Почту перевязал на себя, steam guard подключил. Никаких проблем, респект магазину.'
        : 'Rebound native email to my own, attached Steam Guard. Zero issues, huge respect to the store.',
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
          <span className="text-[#E8583A] font-semibold">{t('nav_reviews')}</span>
        </nav>

        {/* ── 2. ВЕРХ СТРАНИЦЫ ── */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.08] pb-8">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-[2px] w-6 bg-white/40"></span>
              <span className="h-[5px] w-[5px] rounded-full bg-[#E8583A] shadow-[0_0_8px_#E8583A]"></span>
              <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase">
                {lang === 'ru' ? 'РЕПУТАЦИЯ И ДОВЕРИЕ' : 'REPUTATION & TRUST'}
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
              {lang === 'ru' ? 'ОТЗЫВЫ ПОКУПАТЕЛЕЙ' : 'VERIFIED CUSTOMER REVIEWS'}
            </h1>

            <p className="mt-3 max-w-xl font-sans text-sm text-white/60">
              {lang === 'ru'
                ? 'Честные отзывы реальных покупателей. Вся история и чеки доступны в официальном Telegram сообществе.'
                : 'Genuine feedback from verified buyers. Full order history and proof available in our official Telegram.'}
            </p>
          </div>

          {/* Рейтинг */}
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-[#121110] p-4 self-start sm:self-end">
            <div className="font-mono text-3xl font-black text-[#E8583A]">4.96</div>
            <div className="text-xs space-y-0.5">
              <div className="text-[#FFE072] font-mono">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="font-sans text-white/50">
                {lang === 'ru' ? '2 410+ подтверждённых отзывов' : '2,410+ verified reviews'}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. БЛОК ССЫЛКИ НА TELEGRAM ОТЗЫВЫ ── */}
        <div className="mb-12 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#121110] p-7 sm:flex-row sm:items-center sm:justify-between shadow-lg">
          <div>
            <div className="font-sans text-base font-extrabold uppercase text-[#F3F1EC]">
              {lang === 'ru' ? 'БОЛЕЕ 2 400+ ОТЗЫВОВ В TELEGRAM' : 'OVER 2,400+ REVIEWS IN TELEGRAM'}
            </div>
            <p className="mt-1 font-sans text-xs text-white/55">
              {lang === 'ru'
                ? 'Вы можете проверить каждого автора, скриншоты выдачи и чеки в нашем официальном канале.'
                : 'You can inspect verified buyers, instant delivery screenshots, and receipt proofs in our channel.'}
            </p>
          </div>

          <a
            href="https://t.me/sharpbuy"
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#E8583A] hover:bg-[#E8583A]/20"
          >
            <span>{lang === 'ru' ? 'ЧИТАТЬ ВСЕ ОТЗЫВЫ В TELEGRAM' : 'VIEW ALL REVIEWS IN TELEGRAM'}</span>
            <span className="font-mono transition-transform group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>

        {/* ── 4. КАРТОЧКИ ПОСЛЕДНИХ ОТЗЫВОВ ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sampleReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/[0.08] bg-[#121110] p-6 space-y-3 transition-colors hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-sans text-sm font-bold text-white">{rev.author}</div>
                  <div className="font-mono text-[11px] text-[#E8583A]">{rev.item}</div>
                </div>
                <div className="font-mono text-[11px] text-white/40">{rev.date}</div>
              </div>

              <div className="text-[#FFE072] text-xs">&#9733;&#9733;&#9733;&#9733;&#9733;</div>

              <p className="font-sans text-xs text-white/70 leading-relaxed">
                &laquo;{rev.text}&raquo;
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
