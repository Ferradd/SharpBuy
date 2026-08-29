import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const WarrantyModal = ({ isOpen, onClose, initialToken = '' }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [inputToken, setInputToken] = useState(initialToken);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [parsedSteamId, setParsedSteamId] = useState('');

  useEffect(() => {
    if (initialToken) {
      setInputToken(initialToken);
      handleCheck(initialToken);
    }
  }, [initialToken, isOpen]);

  useEffect(() => {
    if (inputToken.includes('----')) {
      setParsedSteamId(inputToken.split('----')[0]);
    } else {
      setParsedSteamId('');
    }
  }, [inputToken]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputToken(text.trim());
        handleCheck(text.trim());
      }
    } catch (err) {}
  };

  const handleCheck = async (tokenToCheck) => {
    const val = (tokenToCheck || inputToken || '').trim();
    if (!val) return;

    setIsChecking(true);
    setCheckResult(null);
    setClaimResult(null);

    try {
      const res = await fetch('/api/warranty-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: val, checkOnly: true })
      });
      const data = await res.json();
      setCheckResult(data);
    } catch (err) {
      setCheckResult({ success: false, message: isEn ? 'Connection error to warranty server' : 'Ошибка соединения с сервером гарантии' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaimReplacement = async () => {
    const val = inputToken.trim();
    if (!val) return;

    setIsClaiming(true);
    setClaimResult(null);

    try {
      const res = await fetch('/api/warranty-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: val, checkOnly: false })
      });
      const data = await res.json();
      setClaimResult(data);

      if (data.success && data.newToken) {
        try {
          const userOrders = JSON.parse(localStorage.getItem('sharpbuy_user_orders') || '[]');
          const targetIdx = userOrders.findIndex(o => o.tokens && o.tokens.some(t => t.includes(val) || val.includes(t.split('----')[0])));
          if (targetIdx >= 0) {
            userOrders[targetIdx].tokens = [data.newToken];
            userOrders[targetIdx].replacedAt = new Date().toISOString();
            localStorage.setItem('sharpbuy_user_orders', JSON.stringify(userOrders));
          }
        } catch (e) {}
      }
    } catch (err) {
      setClaimResult({ success: false, message: isEn ? 'Server communication error during replacement claim' : 'Ошибка запроса замены у поставщика' });
    } finally {
      setIsClaiming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Main Glassmorphic Modal Window */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0D0F14]/95 p-6 sm:p-7 text-white shadow-[0_0_60px_rgba(232,88,58,0.2)] backdrop-blur-xl transition-all animate-scale-up font-sans">
        {/* Glow Accent */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#E8583A]/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#34D399]/15 blur-3xl"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8583A]/15 border border-[#E8583A]/30 px-3 py-1 font-mono text-[11px] font-bold text-[#E8583A] uppercase tracking-wider mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A] animate-pulse"></span>
            {isEn ? 'SHARPBUY CARE · WARRANTY CENTER' : 'SHARPBUY CARE · ЦЕНТР ГАРАНТИИ И ЗАМЕН'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-sans">
            {isEn ? 'AUTOMATED REPLACEMENT' : 'АВТОМАТИЧЕСКАЯ ЗАМЕНА'}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {isEn
              ? 'Instant verification & 1-click replacement within your 3-hour warranty.'
              : 'Мгновенная проверка и авто-выдача нового аккаунта по 3-часовой гарантии.'}
          </p>
        </div>

        {/* Input & Check Section */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/70">
              {isEn ? 'ACCOUNT TOKEN OR ORDER ID:' : 'ТОКЕН ИЛИ НОМЕР ЗАКАЗА:'}
            </label>
            <button
              onClick={pasteFromClipboard}
              type="button"
              className="text-[10px] font-mono text-[#E8583A] hover:text-[#FF6B4A] underline cursor-pointer"
            >
              📋 {isEn ? 'Paste from Clipboard' : 'Вставить из буфера'}
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="76561199001354473----eyAidHlwI... или SHARP-MT7..."
              className="w-full rounded-xl border border-white/15 bg-black/70 px-3.5 py-3 font-mono text-xs text-white placeholder-white/25 focus:border-[#E8583A] focus:outline-none focus:ring-1 focus:ring-[#E8583A] transition-all resize-none"
            />
            {inputToken && (
              <button
                onClick={() => setInputToken('')}
                className="absolute right-3 top-3 text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {parsedSteamId && (
            <div className="text-[10px] font-mono text-white/50">
              SteamID: <span className="text-[#34D399] font-bold">{parsedSteamId}</span>
            </div>
          )}

          <button
            onClick={() => handleCheck()}
            disabled={isChecking || !inputToken.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 py-3 font-mono text-xs font-bold uppercase text-white transition-all disabled:opacity-40 cursor-pointer"
          >
            {isChecking ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                {isEn ? 'VERIFYING IN DATABASE...' : 'ПРОВЕРКА В БАЗЕ ДАННЫХ...'}
              </span>
            ) : (
              <span>🔍 {isEn ? 'CHECK WARRANTY STATUS' : 'ПРОВЕРИТЬ СТАТУС ГАРАНТИИ'}</span>
            )}
          </button>
        </div>

        {/* Check Status Report Box */}
        {checkResult && (
          <div className={`mt-4 rounded-xl border p-4 font-mono text-xs space-y-2 animate-fade-in ${
            checkResult.eligible 
              ? 'border-[#34D399]/40 bg-[#34D399]/10 text-white' 
              : 'border-[#E8583A]/40 bg-[#E8583A]/10 text-white'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${checkResult.eligible ? 'bg-[#34D399] shadow-[0_0_8px_#34D399]' : 'bg-[#E8583A]'}`}></span>
                {checkResult.eligible ? (isEn ? 'WARRANTY ACTIVE ✓' : 'ГАРАНТИЯ АКТИВНА ✓') : (isEn ? 'WARRANTY EXPIRED / INELIGIBLE' : 'ГАРАНТИЯ ИСТЕКЛА / НЕДОСТУПНА')}
              </span>
              {checkResult.remainingClientMinutes > 0 && (
                <span className="text-[#34D399] font-bold">
                  ⏳ {Math.floor(checkResult.remainingClientMinutes / 60)}h {checkResult.remainingClientMinutes % 60}m
                </span>
              )}
            </div>
            <p className="text-white/80 text-[11px] leading-relaxed">
              {checkResult.message}
            </p>

            {checkResult.eligible && !claimResult?.success && (
              <div className="pt-1.5">
                <button
                  onClick={handleClaimReplacement}
                  disabled={isClaiming}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8583A] hover:bg-[#FF6B4A] py-2.5 font-mono text-xs font-black text-white shadow-[0_0_20px_rgba(232,88,58,0.4)] transition-all cursor-pointer"
                >
                  {isClaiming ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      {isEn ? 'VALIDATING ACCESS & GENERATING...' : 'ПРОВЕРКА И ВЫДАЧА ЗАМЕНЫ...'}
                    </span>
                  ) : (
                    <span>🛡️ {isEn ? 'REQUEST INSTANT REPLACEMENT' : 'ПОЛУЧИТЬ АВТО-ЗАМЕНУ В 1 КЛИК'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Claim Result Box */}
        {claimResult && (
          <div className="mt-4 space-y-2.5 animate-fade-in">
            {claimResult.success && claimResult.newToken ? (
              <div className="rounded-xl border border-[#34D399]/50 bg-[#34D399]/15 p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono text-[#34D399] font-bold">
                  <span>🎉 {isEn ? 'NEW ACCOUNT DELIVERED!' : 'НОВЫЙ АККАУНТ ВЫДАН!'}</span>
                  <span>SteamID: {claimResult.newSteamId}</span>
                </div>

                <div className="rounded-lg bg-black/90 p-2.5 border border-white/10 overflow-hidden">
                  <div className="text-[11px] font-mono font-bold text-white select-all break-all leading-relaxed">
                    {claimResult.newToken}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => copyToClipboard(claimResult.newToken)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#34D399] py-2 font-bold text-black hover:bg-[#4ADE80] transition-colors cursor-pointer"
                  >
                    <span>{copiedToken ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : (isEn ? '📋 COPY TOKEN' : '📋 СКОПИРОВАТЬ')}</span>
                  </button>

                  <a
                    href="/SharpBuy_Launcher.exe"
                    download="SharpBuy_Launcher.exe"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 py-2 font-bold text-white transition-colors"
                  >
                    <span>⬇️ {isEn ? 'LAUNCHER' : 'ЛАУНЧЕР'}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E8583A]/40 bg-[#E8583A]/10 p-3.5 font-mono text-xs text-white space-y-1">
                <div className="font-bold text-[#E8583A] flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{isEn ? 'RESULT:' : 'РЕЗУЛЬТАТ ПРОВЕРКИ:'}</span>
                </div>
                <div className="text-white/80 text-[11px]">
                  {claimResult.message || claimResult.error}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>{isEn ? '3-Hour Guarantee' : 'Гарантия 3 часа'}</span>
          <span>SharpBuy Care v2.0</span>
        </div>
      </div>
    </div>
  );
};
