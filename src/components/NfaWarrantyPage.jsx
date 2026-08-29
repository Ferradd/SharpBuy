import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const NfaWarrantyPage = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const isEn = lang === 'en';

  // Input & Verification State
  const [tokenInput, setTokenInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  
  // UI Interactive States
  const [copiedToken, setCopiedToken] = useState(false);
  const [showFullNewToken, setShowFullNewToken] = useState(false);
  const [parsedSteamId, setParsedSteamId] = useState('');
  const [assetType, setAssetType] = useState('PRIME NFA');
  
  // Real-time live countdown timer (seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Parse URL on load
  useEffect(() => {
    try {
      const fullHash = window.location.hash.replace('#', '');
      const [_, queryPart] = fullHash.split('?');
      const hashParams = new URLSearchParams(queryPart || '');
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = hashParams.get('token') || hashParams.get('warranty') || searchParams.get('token') || searchParams.get('warranty');
      if (queryToken) {
        setTokenInput(queryToken);
        triggerCheck(queryToken);
      }
    } catch (e) {}
  }, []);

  // Parse token string
  useEffect(() => {
    if (tokenInput.includes('----')) {
      const sid = tokenInput.split('----')[0];
      setParsedSteamId(sid.length > 10 ? `${sid.slice(0, 7)}••••••${sid.slice(-3)}` : sid);
      setAssetType('PRIME NFA');
    } else if (tokenInput.toUpperCase().startsWith('SHARP-')) {
      setParsedSteamId(tokenInput.toUpperCase());
      setAssetType('ORDER REF');
    } else {
      setParsedSteamId('');
    }
  }, [tokenInput]);

  // Live timer tick
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTokenInput(text.trim());
        triggerCheck(text.trim());
      }
    } catch (err) {}
  };

  const triggerCheck = async (tokenVal) => {
    const clean = (tokenVal || tokenInput || '').trim();
    if (!clean) return;

    setIsChecking(true);
    setCheckResult(null);
    setClaimResult(null);

    try {
      const res = await fetch('/api/warranty-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: clean, checkOnly: true })
      });
      const data = await res.json();
      setCheckResult(data);

      if (data.eligible) {
        if (data.secondsRemaining) {
          setSecondsRemaining(data.secondsRemaining);
        } else if (data.remainingClientMinutes) {
          setSecondsRemaining(data.remainingClientMinutes * 60);
        }
      }
    } catch (e) {
      setCheckResult({ success: false, message: isEn ? 'Connection error to warranty server' : 'Ошибка соединения с сервером гарантии' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaimReplacement = async () => {
    const clean = tokenInput.trim();
    if (!clean) return;

    setIsClaiming(true);
    setClaimResult(null);

    try {
      const res = await fetch('/api/warranty-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: clean, checkOnly: false })
      });
      const data = await res.json();
      setClaimResult(data);

      if (data.success && data.newToken) {
        try {
          const userOrders = JSON.parse(localStorage.getItem('sharpbuy_user_orders') || '[]');
          const targetIdx = userOrders.findIndex(o => o.tokens && o.tokens.some(tok => tok.includes(clean) || clean.includes(tok.split('----')[0])));
          if (targetIdx >= 0) {
            userOrders[targetIdx].tokens = [data.newToken];
            userOrders[targetIdx].replacedAt = new Date().toISOString();
            localStorage.setItem('sharpbuy_user_orders', JSON.stringify(userOrders));
          }
        } catch (e) {}
      }
    } catch (e) {
      setClaimResult({ success: false, message: isEn ? 'Failed to claim replacement' : 'Ошибка отправки запроса на замену' });
    } finally {
      setIsClaiming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Progress percentage (3 hours = 10800s max)
  const timerPercent = Math.min(100, Math.max(0, (secondsRemaining / 10800) * 100));

  return (
    <div className="relative min-h-screen bg-[#0A0A08] pt-24 pb-28 text-[#F3F1EC] selection:bg-[#E8583A]/30">
      {/* Subtle Pegboard grid texture */}
      <div className="pointer-events-none absolute inset-0 pegboard-texture opacity-[0.03]"></div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        
        {/* ── 1. EYEBROW & HEADER AREA ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#E8583A] mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
              <span className="text-white/40">SHARPBUY /</span>
              <span className="text-white/70">{isEn ? 'GUARANTEE CENTER' : 'ЦЕНТР ГАРАНТИИ'}</span>
            </div>

            <h1
              className="font-black uppercase tracking-tight text-white"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(34px, 3.8vw, 48px)',
                lineHeight: 1.0,
              }}
            >
              {isEn ? (
                <>WARRANTY CENTER<br />AND AUTO-REPLACEMENT</>
              ) : (
                <>ЦЕНТР ГАРАНТИИ<br />И АВТО-ЗАМЕН</>
              )}
            </h1>

            <p className="mt-2.5 font-sans text-xs sm:text-sm text-white/50 max-w-lg leading-relaxed">
              {isEn
                ? 'Check your warranty period, order status, or get an automatic replacement.'
                : 'Проверьте срок гарантии, статус заказа или получите автоматическую замену в 1 клик.'}
            </p>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#12161B]/80 px-4 py-2.5 font-mono text-xs shadow-sm self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]"></span>
            <div className="flex flex-col text-left">
              <span className="font-bold text-white tracking-wider text-[10px]">
                {isEn ? 'ONLINE WARRANTY ROBOT' : 'РОБОТ ГАРАНТИИ ОНЛАЙН'}
              </span>
              <span className="text-white/40 text-[9px] uppercase">
                {isEn ? 'AUTOMATIC CHECK' : 'АВТОМАТИЧЕСКАЯ ПРОВЕРКА'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. MAIN 2-COLUMN MODULE SPECIFICATION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* ======================================================== */}
          {/* LEFT PANEL: ACCESS CHECK (ПРОВЕРКА ДОСТУПА)            */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-white/[0.1] bg-[#12161B] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Header with Title & Metadata Rail */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 mb-5">
                <div>
                  <div className="font-sans font-black text-sm uppercase tracking-wider text-white">
                    {isEn ? 'ACCESS CHECK' : 'ПРОВЕРКА ДОСТУПА'}
                  </div>
                  <div className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
                    {isEn ? 'TOKEN OR ORDER NUMBER' : 'ТОКЕН ИЛИ НОМЕР ЗАКАЗА'}
                  </div>
                </div>

                {parsedSteamId ? (
                  <div className="text-right font-mono text-[9px] text-white/50 space-y-0.5">
                    <div>STEAMID: <span className="text-[#34D399] font-bold">{parsedSteamId}</span></div>
                    <div>TYPE: <span className="text-white/80">{assetType}</span></div>
                    <div>ISSUANCE: <span className="text-white/80">{isEn ? 'AUTOMATIC' : 'АВТОМАТИЧЕСКАЯ'}</span></div>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-white/30 uppercase">
                    MODULE / GUARANTEE-01
                  </div>
                )}
              </div>

              {/* Input Box with Clipboard Helper */}
              <div className="space-y-3 mb-5">
                <div className="relative">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder={isEn ? "7656119-----ey-- or SHARP-000000" : "7656119-----ey-- или SHARP-000000"}
                    className="w-full h-14 rounded-xl border border-white/15 bg-[#090C10] px-4 font-mono text-xs text-white placeholder-white/25 focus:border-[#E8583A] focus:outline-none focus:ring-1 focus:ring-[#E8583A] transition-all"
                  />
                  {tokenInput && (
                    <button
                      onClick={() => setTokenInput('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={pasteFromClipboard}
                    type="button"
                    className="text-[11px] font-mono uppercase tracking-wider text-white/60 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#E8583A]">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{isEn ? 'INSERT FROM BUFFER' : 'ВСТАВИТЬ ИЗ БУФЕРА'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-white/30">NFA Steam Format</span>
                </div>
              </div>

              {/* Check Action Button */}
              <button
                onClick={() => triggerCheck()}
                disabled={isChecking || !tokenInput.trim()}
                className="w-full h-13 rounded-xl border border-[#E8583A]/60 bg-[#E8583A]/15 hover:bg-[#E8583A]/25 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 mb-6"
              >
                {isChecking ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>{isEn ? 'CHECKING ACCESS...' : 'ПРОВЕРЯЕМ ДОСТУП...'}</span>
                  </span>
                ) : (
                  <span>{isEn ? 'CHECK WARRANTY STATUS →' : 'ПРОВЕРИТЬ СТАТУС ГАРАНТИИ →'}</span>
                )}
              </button>
            </div>

            {/* Status Result Area (State B: Active Warranty) */}
            {checkResult && (
              <div className={`rounded-xl border p-5 font-mono text-xs space-y-4 animate-fade-in ${
                checkResult.eligible 
                  ? 'border-[#34D399]/30 bg-[#090C10]' 
                  : 'border-[#E8583A]/30 bg-[#090C10]'
              }`}>
                {/* Status Bar */}
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold text-xs ${
                    checkResult.eligible ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[#E8583A]/20 text-[#E8583A]'
                  }`}>
                    <span>{checkResult.eligible ? '●' : '✕'}</span>
                    <span>{checkResult.eligible ? (isEn ? 'WARRANTY ACTIVE ✓' : 'ГАРАНТИЯ АКТИВНА ✓') : (isEn ? 'WARRANTY EXPIRED' : 'ГАРАНТИЯ ИСТЕКЛА')}</span>
                  </div>

                  <span className="text-[10px] text-white/40 uppercase">
                    {checkResult.eligible ? 'STATUS / PROTECTED' : 'STATUS / INELIGIBLE'}
                  </span>
                </div>

                {checkResult.eligible ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                    {/* Left: Timer & Timeline */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                        {isEn ? 'UNTIL WARRANTY EXPIRES' : 'ДО ОКОНЧАНИЯ ГАРАНТИИ'}
                      </div>
                      <div className="text-3xl font-bold font-mono tracking-tight text-white">
                        {formatTime(secondsRemaining)}
                      </div>
                      {/* Timeline Bar */}
                      <div className="mt-3">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#34D399] to-[#E8583A] transition-all duration-1000"
                            style={{ width: `${timerPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-white/30 font-mono mt-1">
                          <span>{isEn ? 'START' : 'НАЧАЛО'}</span>
                          <span>{isEn ? 'END' : 'КОНЕЦ'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Account Status & Replacement CTA */}
                    <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4 space-y-2">
                      <div className="text-[10px] text-white/40 uppercase">
                        {isEn ? 'ACCOUNT STATUS' : 'СТАТУС АККАУНТА'}
                      </div>
                      <div className="font-bold text-xs text-white">
                        {isEn ? 'READY FOR REPLACEMENT' : 'ГОТОВ К ЗАМЕНЕ'}
                      </div>
                      <p className="text-[10px] text-white/50 leading-tight">
                        {isEn 
                          ? 'The old session will be replaced with new access.' 
                          : 'Предыдущий доступ будет заменен на новый токен.'}
                      </p>
                      
                      {!claimResult?.success && (
                        <button
                          onClick={handleClaimReplacement}
                          disabled={isClaiming}
                          className="w-full rounded-lg bg-[#E8583A] hover:bg-[#FF6B4A] py-2.5 font-mono text-[11px] font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isClaiming ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
                              <span>{isEn ? 'PROCURING...' : 'ВЫДАЕМ...'}</span>
                            </span>
                          ) : (
                            <span>{isEn ? 'GET AUTO-REPLACEMENT →' : 'ПОЛУЧИТЬ АВТО-ЗАМЕНУ →'}</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-white/70 text-xs leading-relaxed">
                    {checkResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: VERIFICATION & DIGITAL ACT (АКТ ЗАМЕНЫ)   */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-white/[0.1] bg-[#12161B] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
                <div className="font-sans font-black text-sm uppercase tracking-wider text-white">
                  {isEn ? 'VERIFICATION' : 'ВЕРИФИКАЦИЯ'}
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase">
                  {claimResult?.success ? 'STATE / DELIVERED' : 'PROCESS FLOW'}
                </div>
              </div>

              {/* State A / B: Process Steps */}
              {!claimResult?.success && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-[11px] font-bold text-white">
                      01
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {isEn ? 'CONFIRM YOUR ORDER' : 'ПОДТВЕРДИМ ЗАКАЗ'}
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {isEn ? 'Verify token or order number with the blockchain registry.' : 'Сверим токен или номер заказа с базой данных магазина.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-[11px] font-bold text-white">
                      02
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {isEn ? 'CHECK YOUR WARRANTY PERIOD' : 'ПРОВЕРИМ СРОК ГАРАНТИИ'}
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {isEn ? 'Calculate live countdown timer and category terms.' : 'Покажем точный остаток времени и условия товара.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-[11px] font-bold text-white">
                      03
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {isEn ? 'DETERMINE REPLACEMENT AVAILABILITY' : 'ОПРЕДЕЛИМ РЕШЕНИЕ'}
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        {isEn ? 'Query robot validator and issue brand new Steam credentials.' : 'Сообщим, доступна ли авто-замена и выдадим новый токен.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* State C: Digital Act of Replacement (Цифровой акт замены) */}
              {claimResult && (
                <div className="space-y-4 animate-fade-in">
                  {claimResult.success && claimResult.newToken ? (
                    <div className="space-y-4">
                      {/* Success Banner */}
                      <div className="flex items-center justify-between rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 px-4 py-2.5">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#34D399]">
                          <span>●</span>
                          <span>{isEn ? 'REPLACEMENT ISSUED ✓' : 'ЗАМЕНА ВЫДАНА ✓'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#34D399]/70">
                          SteamID: {claimResult.newSteamId}
                        </span>
                      </div>

                      {/* Token comparison & Delivery box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase">
                          <span>{isEn ? 'NEW NFA TOKEN' : 'НОВЫЙ NFA-ТОКЕН'}</span>
                          <button 
                            onClick={() => setShowFullNewToken(!showFullNewToken)}
                            className="text-[#E8583A] hover:underline cursor-pointer"
                          >
                            {showFullNewToken ? (isEn ? 'Hide' : 'Скрыть') : (isEn ? 'Show full' : 'Показать')}
                          </button>
                        </div>

                        <div className="rounded-xl border border-white/15 bg-[#080A0D] p-3.5 font-mono text-xs text-[#34D399] break-all leading-relaxed select-all">
                          {showFullNewToken 
                            ? claimResult.newToken 
                            : `${claimResult.newToken.slice(0, 32)}••••••••••••••••••••`}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={() => copyToClipboard(claimResult.newToken)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 py-2.5 font-mono text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#34D399]">
                            {copiedToken ? (
                              <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                              <>
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </>
                            )}
                          </svg>
                          <span>{copiedToken ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : (isEn ? 'COPY NEW TOKEN' : 'СКОПИРОВАТЬ ТОКЕН')}</span>
                        </button>

                        <a
                          href="/SharpBuy_Launcher.exe"
                          download="SharpBuy_Launcher.exe"
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#E8583A] hover:bg-[#FF6B4A] py-2.5 font-mono text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-white">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          <span>{isEn ? 'DOWNLOAD LAUNCHER' : 'СКАЧАТЬ ЛАУНЧЕР'}</span>
                        </a>
                      </div>

                      <div className="text-center font-mono text-[10px] text-white/40 pt-1">
                        {isEn ? 'SAVE THE NEW TOKEN UNTIL YOUR FIRST LOGIN.' : 'СОХРАНИТЕ НОВЫЙ ТОКЕН ДО ПЕРВОГО ВХОДА.'}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 p-4 font-mono text-xs text-white space-y-1">
                      <div className="font-bold text-[#E8583A] flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#E8583A]">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>{isEn ? 'VERIFICATION REPORT:' : 'ОТЧЕТ ВЕРИФИКАЦИИ:'}</span>
                      </div>
                      <div className="text-white/80 text-[11px]">
                        {claimResult.message || claimResult.error}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="border-t border-white/[0.08] pt-3 mt-5 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>{isEn ? 'Safe Protocol v2.4' : 'Безопасный протокол v2.4'}</span>
              <span>SharpBuy Care Engine</span>
            </div>
          </div>

        </div>

        {/* ── 3. TERMS & COVERAGE SPECIFICATION TABLE ── */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#12161B]/60 p-6 sm:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div className="font-mono text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
            {isEn ? 'TERMS & WARRANTY RULES' : 'СРОКИ И УСЛОВИЯ ГАРАНТИИ'}
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {/* Prime / Premier / Medals */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white font-medium">PRIME / PREMIER / MEDALS</span>
              <span className="text-[#34D399] font-bold flex items-center gap-1.5">
                <span>3 HOURS</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></span>
              </span>
            </div>

            {/* Knives / Skins */}
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-white/60">
              <span>KNIVES / SKINS / INVENTORY</span>
              <span className="text-[#E8583A] font-bold">{isEn ? 'NO WARRANTY (AS-IS)' : 'БЕЗ ГАРАНТИИ (AS-IS)'}</span>
            </div>

            {/* NFA */}
            <div className="flex items-center justify-between py-2 text-white/60">
              <span>NFA ACCOUNTS (GENERAL)</span>
              <span className="text-white/40">{isEn ? 'FIRST ENTRY GUARANTEE' : 'ГАРАНТИЯ НА ПЕРВЫЙ ВХОД'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
