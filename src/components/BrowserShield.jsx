import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { solvePoWChallenge, runDeepBotDetection } from '../utils/altchaEngine';

export const BrowserShield = ({ onVerified }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [progress, setProgress] = useState(0);
  const [hashRate, setHashRate] = useState('0 H/s');
  const [currentHash, setCurrentHash] = useState('Initializing WebCrypto...');
  const [stageText, setStageText] = useState(
    isEn ? 'Running Deep Anti-Bot & Proof-of-Work verification...' : 'Запуск Deep Anti-Bot и Proof-of-Work верификации...'
  );
  const [isPassed, setIsPassed] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [botCheckStats, setBotCheckStats] = useState(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Check if session already verified
    try {
      if (sessionStorage.getItem('sb_shield_verified') === 'true') {
        if (onVerified) onVerified();
        return;
      }
    } catch (e) {}

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function executeRealChallenge() {
      // 1. Deep Bot Heuristics Check
      const botChecks = runDeepBotDetection();
      setBotCheckStats(botChecks);

      if (botChecks.isWebdriver || botChecks.score < 40) {
        setIsBlocked(true);
        setStageText(isEn ? 'Access denied: Automated headless environment detected.' : 'Доступ заблокирован: обнаружен автоматизированный бот-драйвер.');
        return;
      }

      setStageText(isEn ? 'Computing SHA-256 Proof-of-Work cryptographic challenge...' : 'Вычисление криптографического Proof-of-Work (SHA-256)...');

      // 2. Real Cryptographic PoW Calculation
      const challengeSalt = 'sb_altcha_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      
      const powResult = await solvePoWChallenge(challengeSalt, 1500, (metrics) => {
        setProgress(metrics.percent);
        setHashRate(metrics.hashRate);
        setCurrentHash(metrics.currentHash);
      });

      if (powResult && powResult.success) {
        setIsPassed(true);
        setProgress(100);
        setStageText(
          isEn
            ? `Verified in ${powResult.timeMs}ms · PoW Challenge Passed ✓`
            : `Верифицировано за ${powResult.timeMs}мс · PoW проверка успешно пройдена ✓`
        );

        try {
          sessionStorage.setItem('sb_shield_verified', 'true');
        } catch (e) {}

        setTimeout(() => {
          if (onVerified) onVerified();
        }, 400);
      }
    }

    executeRealChallenge();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07080A] p-6 text-center text-[#F3F1EC] select-none">
      {/* Background ambient glow */}
      <div className="absolute h-96 w-96 rounded-full bg-[#E8583A]/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0E1015]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        
        {/* Shield Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8583A]/15 border border-[#E8583A]/35 shadow-[0_0_30px_rgba(232,88,58,0.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E8583A" strokeWidth="2.2" className={`h-8 w-8 ${isPassed ? '' : 'animate-pulse'}`}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Brand Header */}
        <h1 className="font-sans text-xl font-black tracking-wider uppercase text-white">
          SHARP<span className="text-[#E8583A]">BUY</span> SHIELD
        </h1>

        <p className="mt-1 font-mono text-[11px] text-[#34D399] uppercase tracking-widest font-bold">
          {isEn ? 'REAL-TIME PROOF-OF-WORK & ANTI-DDOS' : 'РЕАЛЬНЫЙ PROOF-OF-WORK & ANTI-DDOS'}
        </p>

        {/* Real Cryptographic Hashing Live Terminal */}
        <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/70 p-3.5 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px] text-white/40 border-b border-white/[0.06] pb-1.5 uppercase">
            <span>ALGORITHM: SHA-256 (WebCrypto PoW)</span>
            <span className="text-[#E8583A] font-bold">{hashRate}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/60">{isEn ? 'Hardware Cores:' : 'Ядра процессора:'}</span>
            <span className="font-bold text-white">{navigator.hardwareConcurrency || 4} Cores</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/60">{isEn ? 'Anti-Bot Integrity:' : 'Целостность среды:'}</span>
            <span className="font-bold text-[#34D399]">{isBlocked ? 'FLAGGED ✗' : 'GENUINE BROWSER ✓'}</span>
          </div>

          <div className="truncate text-[10px] text-white/40 pt-1 border-t border-white/[0.06]">
            HASH: <span className="text-[#E8583A] select-all">{currentHash}</span>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className="mt-5 w-full rounded-full bg-black/60 p-1 border border-white/[0.08] overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-[#E8583A] via-[#FF7A59] to-[#34D399] transition-all duration-150 shadow-[0_0_15px_rgba(232,88,58,0.8)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Status text */}
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-white/70">
          <span className={`h-2 w-2 rounded-full ${isBlocked ? 'bg-red-500' : isPassed ? 'bg-[#34D399]' : 'bg-[#E8583A] animate-ping'}`}></span>
          <span className={isBlocked ? 'text-red-400 font-bold' : ''}>{stageText}</span>
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-3 font-mono text-[10px] text-white/30 flex justify-between items-center">
          <span>ALTCHA Specification v1.2</span>
          <span>Open-Source Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default BrowserShield;
