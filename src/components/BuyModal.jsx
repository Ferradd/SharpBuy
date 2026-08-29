import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CryptoPayModal } from './CryptoPayModal';

export const BuyModal = ({ product, isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const isEn = lang === 'en';
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const [paymentMethod, setPaymentMethod] = useState(product?.selectedPayment || 'crypto');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.quantity) setQuantity(product.quantity);
      if (product.selectedPayment) setPaymentMethod(product.selectedPayment);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const totalSum = (product.price * quantity).toLocaleString('ru-RU');

  const handlePay = (e) => {
    e.preventDefault();
    if (!email) return;

    if (paymentMethod === 'crypto') {
      setIsCryptoModalOpen(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  const paymentOptions = [
    { id: 'crypto', label: isEn ? '₿ Crypto (USDT, LTC, BTC, TON) 0%' : '₿ Криптовалюта (USDT, LTC, BTC, TON) 0%', badge: isEn ? 'INSTANT' : 'МГНОВЕННО' },
    { id: 'wallet', label: isEn ? '👛 Account Balance / Wallet' : '👛 Баланс аккаунта / Кошелек', badge: isEn ? 'ZERO FEES' : 'БЕЗ КОМИССИИ' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121418] p-7 text-[#F3F1EC] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 font-mono text-xl text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            &times;
          </button>

          {!isSuccess ? (
            <div>
              <div className="mb-2 font-mono text-[11px] font-semibold text-[#E8583A] uppercase tracking-widest">
                {isEn ? 'CHECKOUT ORDER · INSTANT DELIVERY' : 'ОФОРМЛЕНИЕ ЗАКАЗА · АВТОВЫДАЧА'}
              </div>
              <h2 className="mb-4 font-sans text-xl font-bold leading-snug text-[#F3F1EC]">
                {isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
              </h2>

              {/* Карточка суммы и количества */}
              <div className="mb-6 flex items-center justify-between rounded-xl bg-black/50 p-4 border border-white/[0.08]">
                <div>
                  <span className="font-mono text-[10px] text-white/40 uppercase block">{isEn ? 'TOTAL TO PAY:' : 'ИТОГО К ОПЛАТЕ:'}</span>
                  <span className="font-mono text-2xl font-black text-[#E8583A]">
                    {totalSum} &#8381;
                  </span>
                </div>

                {/* Счетчик количества */}
                <div className="flex items-center rounded-lg border border-white/[0.1] bg-black/40 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-white/60 hover:text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1.5 font-bold text-white min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => { const maxS = product.stockCount !== undefined ? product.stockCount : (product.inStockCount || 4); setQuantity((q) => Math.min(maxS, q + 1)); }}
                    className="px-3 py-1.5 text-white/60 hover:text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                {/* Поле Email */}
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-white/60">
                    {isEn ? 'Email for credentials & receipt:' : 'Email для получения данных и чека:'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-2.5 font-sans text-xs text-[#F3F1EC] placeholder-white/25 focus:border-[#E8583A] focus:outline-none"
                  />
                </div>

                {/* Способы оплаты */}
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-white/60">
                    {isEn ? 'Payment Method:' : 'Способ оплаты:'}
                  </label>
                  <div className="grid grid-cols-1 gap-2 font-sans text-xs sm:grid-cols-2">
                    {paymentOptions.map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'border-[#E8583A] bg-[#E8583A]/15 font-bold text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                            : 'border-white/[0.08] bg-black/30 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                              paymentMethod === pm.id ? 'border-[#E8583A]' : 'border-white/30'
                            }`}
                          >
                            {paymentMethod === pm.id && (
                              <div className="h-1.5 w-1.5 rounded-full bg-[#E8583A]"></div>
                            )}
                          </div>
                          <span className="truncate">{pm.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка подтверждения */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8583A] bg-[#E8583A] py-3.5 font-sans text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-[#FF6B4A] hover:shadow-[0_0_20px_rgba(232,88,58,0.45)] cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>{isEn ? 'Connecting payment gateway...' : 'Подключение шлюза...'}</span>
                  ) : (
                    <>
                      <span>{isEn ? 'PROCEED TO PAYMENT' : 'Перейти к оплате'} {totalSum} &#8381;</span>
                      <span className="font-mono">&rarr;</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Экран успешного перехода */
            <div className="py-4 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-2xl font-bold">
                &#10004;
              </div>
              <h3 className="font-sans text-xl font-bold text-white">
                {isEn ? 'Gateway Ready for Payment' : 'Шлюз готов к приёму оплаты'}
              </h3>
              <p className="font-sans text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                {isEn
                  ? <>Upon payment verification, account credentials will be instantly rendered on-screen and emailed to <strong>{email}</strong>.</>
                  : <>После подтверждения платежа данные аккаунта будут моментально отображены на экране и продублированы на <strong>{email}</strong>.</>}
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="mt-2 rounded-xl border border-white/20 bg-white/[0.05] px-6 py-2 font-mono text-xs text-white transition-colors hover:bg-white/10 cursor-pointer"
              >
                {isEn ? 'Close' : 'Закрыть'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Интегрированная крипто-модалка */}
      <CryptoPayModal
        product={{ ...product, quantity }}
        isOpen={isCryptoModalOpen}
        onClose={() => {
          setIsCryptoModalOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default BuyModal;
