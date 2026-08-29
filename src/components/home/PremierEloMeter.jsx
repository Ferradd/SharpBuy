import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const PremierEloMeter = ({ onSelectProduct, onNavigate }) => {
  const { lang } = useLanguage();
  const [activeEloBracket, setActiveEloBracket] = useState('20k');

  const brackets = {
    '20k': {
      label: '20,000 – 25,000+ PTS',
      rankTitle: 'PREMIER GLOBAL ELITE TIER',
      badgeColor: '#EB001B',
      bgColor: 'from-red-950/40 via-red-900/10 to-transparent',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-500',
      winrate: '68.4% Winrate',
      hoursAvg: '2,800 hrs',
      accounts: [
        { id: 'item-101', name: 'CS2 PRIME · 21,450 PREMIER', price: lang === 'ru' ? '2 490 ₽' : '$27.50', coins: '10 Coins (10-Yr)', status: 'Verified Clean' },
        { id: 'item-105', name: 'CS2 PRIME · 23,800 PREMIER (TOP 1%)', price: lang === 'ru' ? '3 190 ₽' : '$35.00', coins: '8 Coins & Badges', status: 'First Letter' },
        { id: 'item-102', name: 'CS2 PRIME · 20,100 PREMIER + NOŽ', price: lang === 'ru' ? '2 890 ₽' : '$31.90', coins: '7 Coins', status: 'Green Trust' },
      ],
    },
    '15k': {
      label: '15,000 – 19,999 PTS',
      rankTitle: 'PREMIER MASTER PURPLE TIER',
      badgeColor: '#A855F7',
      bgColor: 'from-purple-950/40 via-purple-900/10 to-transparent',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      winrate: '62.1% Winrate',
      hoursAvg: '1,900 hrs',
      accounts: [
        { id: 'item-104', name: 'CS2 PRIME · 18,200 PREMIER', price: lang === 'ru' ? '1 890 ₽' : '$20.80', coins: '6 Coins', status: 'Clean MMR' },
        { id: 'item-103', name: 'CS2 PRIME · 16,500 PREMIER (FACEIT 9)', price: lang === 'ru' ? '1 990 ₽' : '$21.90', coins: '5 Coins', status: 'Full Access' },
        { id: 'item-106', name: 'CS2 PRIME · 15,400 PREMIER', price: lang === 'ru' ? '1 490 ₽' : '$16.40', coins: '4 Coins', status: '1+ Yr Inactive' },
      ],
    },
    '10k': {
      label: '10,000 – 14,999 PTS',
      rankTitle: 'PREMIER COMPETITIVE BLUE TIER',
      badgeColor: '#3B82F6',
      bgColor: 'from-blue-950/40 via-blue-900/10 to-transparent',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      winrate: '57.5% Winrate',
      hoursAvg: '1,200 hrs',
      accounts: [
        { id: 'item-109', name: 'CS2 PRIME · 12,800 PREMIER', price: lang === 'ru' ? '1 190 ₽' : '$13.10', coins: '3 Coins', status: 'Green Trust' },
        { id: 'item-113', name: 'CS2 PRIME · 14,100 PREMIER', price: lang === 'ru' ? '1 350 ₽' : '$14.80', coins: '4 Coins', status: 'Clean History' },
        { id: 'item-114', name: 'CS2 PRIME · 10,500 PREMIER', price: lang === 'ru' ? '990 ₽' : '$10.90', coins: '2 Coins', status: 'Fast Dispatch' },
      ],
    },
    'unranked': {
      label: 'PLACEMENT & UNRANKED',
      rankTitle: 'FRESH CALIBRATION TIER',
      badgeColor: '#94A3B8',
      bgColor: 'from-slate-900/40 via-slate-900/10 to-transparent',
      borderColor: 'border-slate-500/40',
      textColor: 'text-slate-300',
      winrate: 'Fresh Calibration',
      hoursAvg: '350 hrs',
      accounts: [
        { id: 'item-107', name: 'CS2 NO-PRIME · 10 WINS READY', price: lang === 'ru' ? '290 ₽' : '$3.20', coins: '0 Coins', status: '0 VAC / Clean' },
        { id: 'item-108', name: 'CS2 NO-PRIME · FRESH STARTER', price: lang === 'ru' ? '190 ₽' : '$2.10', coins: '0 Coins', status: 'Instant Start' },
        { id: 'item-115', name: 'CS2 PRIME · UNRANKED (5 WINS)', price: lang === 'ru' ? '890 ₽' : '$9.80', coins: '1 Coin', status: 'Prime Enabled' },
      ],
    },
  };

  const cur = brackets[activeEloBracket] || brackets['20k'];

  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#0A0A09] py-20 text-[#F3F1EC]">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-12">
        
        {/* Заголовок */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.3em] text-[#E8583A] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#E8583A]"></span>
            <span>{lang === 'ru' ? 'СОРЕВНОВАТЕЛЬНЫЙ CS2 PREMIER РЕЙТИНГ' : 'CS2 PREMIER ELO BRACKET SELECTOR'}</span>
          </div>

          <h2
            className="font-black uppercase tracking-tight text-[#F3F1EC]"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 0.95 }}
          >
            {lang === 'ru' ? 'ПОДБОР ПО РАНГУ И РЕЙТИНГУ' : 'SELECT BY DESIRED ELO'}
          </h2>

          <p className="mt-3 text-sm text-white/60 font-sans leading-relaxed">
            {lang === 'ru'
              ? 'Выберите желаемую планку соревновательного рейтинга — моментально покажем доступные аккаунты.'
              : 'Choose your desired Premier rank bracket — instantly view accounts ready for competitive matchmaking.'}
          </p>
        </div>

        {/* Шкала рангов в стиле турнирного CS2 HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { id: '20k', label: '20K – 25K+ ELO', sub: 'RED GLOBAL', color: '#EB001B' },
            { id: '15k', label: '15K – 19.9K ELO', sub: 'PURPLE MASTER', color: '#A855F7' },
            { id: '10k', label: '10K – 14.9K ELO', sub: 'BLUE ELITE', color: '#3B82F6' },
            { id: 'unranked', label: 'CALIBRATION', sub: 'FRESH / SMURF', color: '#94A3B8' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveEloBracket(b.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeEloBracket === b.id
                  ? 'bg-[#151413] shadow-2xl scale-[1.03]'
                  : 'bg-[#0E0D0C] border-white/[0.08] hover:border-white/20'
              }`}
              style={{
                borderColor: activeEloBracket === b.id ? b.color : undefined,
              }}
            >
              <span className="font-mono text-sm font-black text-white">{b.label}</span>
              <span className="font-mono text-[10px] font-bold mt-1 uppercase" style={{ color: b.color }}>
                {b.sub}
              </span>
              {activeEloBracket === b.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                  style={{ backgroundColor: b.color }}
                ></div>
              )}
            </button>
          ))}
        </div>

        {/* Сетка 3 аккаунтов под выбранный ранг */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cur.accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => {
                if (onSelectProduct) onSelectProduct({ id: acc.id });
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-[#121110] p-7 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-pointer ${cur.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-mono text-xs font-bold uppercase tracking-wider ${cur.textColor}`}>
                    {cur.rankTitle}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">● 3s OK</span>
                </div>

                <h3 className="font-sans text-lg font-black uppercase text-[#F3F1EC] group-hover:text-white transition-colors">
                  {acc.name}
                </h3>

                <div className="mt-4 space-y-2 font-mono text-xs text-white/60">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'ВИНРЕЙТ:' : 'WINRATE:'}</span>
                    <span className="font-bold text-[#F3F1EC]">{cur.winrate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'МЕДАЛИ:' : 'MEDALS:'}</span>
                    <span className="text-white/90">{acc.coins}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">{lang === 'ru' ? 'ПРОВЕРКА:' : 'STATUS:'}</span>
                    <span className="text-emerald-400 font-semibold">{acc.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5">
                <span className="font-mono text-2xl font-black text-[#F3F1EC]">{acc.price}</span>
                <button className="flex items-center gap-2 rounded-lg bg-[#E8583A] px-4 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-[#ff6545]">
                  <span>{lang === 'ru' ? 'КУПИТЬ' : 'BUY NOW'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ссылка на каталог */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'ru' ? 'Ищете другой ранг? Откройте полный каталог из 1 057 позиций' : 'Looking for another Elo? Explore full 1,057 catalog'}</span>
            <span className="text-[#E8583A]">&rarr;</span>
          </button>
        </div>

      </div>
    </section>
  );
};
