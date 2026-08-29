import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, onOpenCabinet }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg(isEn ? 'Please enter a valid email address.' : 'Пожалуйста, введите корректный адрес электронной почты.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg(isEn ? 'Password must be at least 6 characters long.' : 'Пароль должен содержать не менее 6 символов.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg(isEn ? 'Passwords do not match.' : 'Введенные пароли не совпадают.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await register(email, password);
        if (res.success) {
          setSuccessMsg(
            isEn
              ? 'Registration complete! A verification link has been sent to your email.'
              : 'Регистрация успешна! Ссылка для подтверждения отправлена на вашу почту.'
          );
          setTimeout(() => {
            onClose();
            if (onOpenCabinet) onOpenCabinet();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Failed to register');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          onClose();
          if (onOpenCabinet) onOpenCabinet();
        } else {
          setErrorMsg(res.error || 'Failed to sign in');
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#101216] p-7 text-[#F3F1EC] shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 font-mono text-2xl text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8583A]/15 border border-[#E8583A]/30 text-[#E8583A]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="font-sans text-xl font-black uppercase text-white tracking-wider">
            {mode === 'login' ? (isEn ? 'SIGN IN' : 'ВХОД В АККАУНТ') : (isEn ? 'CREATE ACCOUNT' : 'РЕГИСТРАЦИЯ')}
          </h2>
          <p className="font-mono text-xs text-white/50 mt-1">
            {mode === 'login'
              ? (isEn ? 'Access your orders, balance & warranties' : 'Доступ к истории заказов, балансу и гарантиям')
              : (isEn ? 'Instant registration · Email confirmation' : 'Быстрая регистрация · Подтверждение по почте')}
          </p>
        </div>

        {/* Tab switch */}
        <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-black/40 p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 rounded-lg py-2 font-bold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[#E8583A] text-white shadow-[0_0_15px_rgba(232,88,58,0.35)]' : 'text-white/50 hover:text-white'
            }`}
          >
            {isEn ? 'LOG IN' : 'ВХОД'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 rounded-lg py-2 font-bold transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[#E8583A] text-white shadow-[0_0_15px_rgba(232,88,58,0.35)]' : 'text-white/50 hover:text-white'
            }`}
          >
            {isEn ? 'REGISTER' : 'РЕГИСТРАЦИЯ'}
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-[#34D399]/30 bg-[#34D399]/10 p-3 font-mono text-xs text-[#34D399]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/70">
              Email:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-white/[0.12] bg-black/60 px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 focus:border-[#E8583A] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/70">
              {isEn ? 'Password:' : 'Пароль:'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/[0.12] bg-black/60 px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 focus:border-[#E8583A] focus:outline-none transition-colors"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1.5 block font-mono text-xs text-white/70">
                {isEn ? 'Repeat Password:' : 'Повторите пароль:'}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.12] bg-black/60 px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 focus:border-[#E8583A] focus:outline-none transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8583A] py-3.5 font-mono text-sm font-black uppercase text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_20px_rgba(232,88,58,0.45)] transition-all cursor-pointer"
          >
            {isSubmitting
              ? (isEn ? 'PROCESSING...' : 'ОБРАБОТКА...')
              : (mode === 'login' ? (isEn ? 'ENTER DASHBOARD &rarr;' : 'ВОЙТИ В КАБИНЕТ &rarr;') : (isEn ? 'CREATE ACCOUNT &rarr;' : 'СОЗДАТЬ АККАУНТ &rarr;'))}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;
