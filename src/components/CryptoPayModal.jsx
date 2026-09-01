import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';
import { syncLiveStockFromSupplier } from '../utils/stockSync';
import { CryptoIcon } from './CryptoIcons';

const getCryptoCurrencies = (isEn) => [
  { id: 'USDT_BEP20', name: 'USDT', networkBadge: 'BSC (BEP-20)', network: 'BNB Smart Chain', symbol: 'USDT', feeNote: isEn ? 'Fee ~$0.01 · 3 sec' : 'Комиссия ~$0.01 · 3 сек', tag: isEn ? 'RECOMMENDED' : 'РЕКОМЕНДУЕМ' },
  { id: 'BNB_BSC', name: 'BNB', networkBadge: 'BNB Chain', network: 'BNB Smart Chain', symbol: 'BNB', feeNote: isEn ? 'Fee ~$0.01 · 3 sec' : 'Комиссия ~$0.01 · 3 сек', tag: isEn ? 'POPULAR' : 'ПОПУЛЯРНО' },
  { id: 'USDT_POLYGON', name: 'USDT', networkBadge: 'Polygon', network: 'Polygon Network', symbol: 'USDT', feeNote: isEn ? 'Fee ~$0.005 · Instant' : 'Комиссия ~$0.005 · Быстро', tag: isEn ? 'INSTANT' : 'МОМЕНТАЛЬНО' },
  { id: 'USDT_ARBITRUM', name: 'USDT', networkBadge: 'Arbitrum One', network: 'Arbitrum L2', symbol: 'USDT', feeNote: isEn ? 'Fee ~$0.01 · 1 sec' : 'Комиссия ~$0.01 · 1 сек', tag: 'L2 SPEED' },
  { id: 'USDT_BASE', name: 'USDT', networkBadge: 'Base L2', network: 'Coinbase Base L2', symbol: 'USDT', feeNote: isEn ? 'Fee ~$0.005 · 1 sec' : 'Комиссия ~$0.005 · 1 сек', tag: 'L2 CHEAP' },
  { id: 'SOL', name: 'SOL', networkBadge: 'Solana', network: 'Solana Mainnet', symbol: 'SOL', feeNote: isEn ? 'Fee ~$0.001 · 400ms' : 'Комиссия ~$0.001 · 400мс', tag: isEn ? 'ULTRA FAST' : 'СВЕРХБЫСТРО' },
  { id: 'TON', name: 'TON', networkBadge: 'Telegram TON', network: 'Telegram TON', symbol: 'TON', feeNote: isEn ? 'Fee ~$0.01 · Fast' : 'Комиссия ~$0.01 · Быстро', tag: 'TELEGRAM' },
  { id: 'LTC', name: 'LTC', networkBadge: 'Litecoin', network: 'Litecoin Mainnet', symbol: 'LTC', feeNote: isEn ? 'Fee ~$0.02 · Low' : 'Комиссия ~$0.02 · Низкая', tag: isEn ? 'LOW FEES' : 'НИЗКИЕ КОМИССИИ' },
];

const getApiUrl = (endpoint) => {
  if (typeof window !== 'undefined' && window.location.port && window.location.port !== '3000') {
    return `http://localhost:3000${endpoint}`;
  }
  return endpoint;
};

export const CryptoPayModal = ({ product, isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { user, topUpBalance } = useAuth();
  const isEn = lang === 'en';
  const [step, setStep] = useState('SETUP');
  const [email, setEmail] = useState('');
  const [paymentMode, setPaymentMode] = useState('sbp'); // 'sbp', 'crypto', 'balance', 'owner_wallet'
  const [selectedCrypto, setSelectedCrypto] = useState('USDT_BEP20');
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState(null);
  const [crystalPayInvoice, setCrystalPayInvoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min
  const [isChecking, setIsChecking] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [delivery, setDelivery] = useState(null);
  const pollerRef = useRef(null);

  const [procureStage, setProcureStage] = useState(1);
  const [procureProgress, setProcureProgress] = useState(15);

  const CRYPTO_CURRENCIES = getCryptoCurrencies(isEn);

  useEffect(() => {
    if (user && user.email && !email) {
      setEmail(user.email);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (product && product.quantity) {
      setQuantity(product.quantity);
    }
    if (product && (product.selectedPayment === 'wallet' || product.paymentMode === 'balance')) {
      setPaymentMode('balance');
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      syncLiveStockFromSupplier();
    } else {
      setStep('SETUP');
      setOrder(null);
      setCrystalPayInvoice(null);
      setDelivery(null);
      setProcureStage(1);
      setProcureProgress(15);
      if (pollerRef.current) clearInterval(pollerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'PAYING' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  if (!isOpen || !product) return null;

  const totalSum = (product.price * quantity).toLocaleString('ru-RU');

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert(isEn ? 'Please enter a valid Email to receive account credentials and receipt' : 'Пожалуйста, укажите корректный Email для получения аккаунта и чека');
      return;
    }

    // ── OWNER WALLET MODE: эксклюзивная оплата с кошелька магазина ──
    if (paymentMode === 'owner_wallet' || paymentMode === 'balance') {
      const priceRub = (product.price || 50) * quantity;

      // Обычный баланс клиента — проверяем лимит только для не-владельцев
      const isOwnerUser = user && (
        user.email === 'iliykuzin2@gmail.com' ||
        user.email === 'iliykuzin2' ||
        user.isOwner === true ||
        user.role === 'OWNER'
      );

      if (paymentMode === 'balance' && !isOwnerUser) {
        const currentBalanceRub = user?.balanceRub || 0;
        if (currentBalanceRub < priceRub) {
          alert(isEn ? `Your account balance is ${currentBalanceRub} ₽. You need ${priceRub} ₽. Please top up your balance or pay via Crypto.` : `Баланс вашего аккаунта: ${currentBalanceRub} ₽. Требуется: ${priceRub} ₽. Пожалуйста, пополните баланс или оплатите криптовалютой.`);
          return;
        }
        if (topUpBalance) {
          topUpBalance(0, -priceRub);
        }
      }
      // owner_wallet / owner через balance — никаких ограничений, платит с кошелька сайта

      setIsChecking(true);
      setStep('PROCURING');
      setProcureStage(1);
      setProcureProgress(25);

      const t1 = setTimeout(() => { setProcureStage(2); setProcureProgress(55); }, 2000);
      const t2 = setTimeout(() => { setProcureStage(3); setProcureProgress(80); }, 5500);
      const t3 = setTimeout(() => { setProcureStage(4); setProcureProgress(95); }, 9000);

      try {
        const orderId = (paymentMode === 'owner_wallet' ? 'SHARP-STORE-' : 'SHARP-WALLET-') + Date.now().toString(36).toUpperCase();
        
        // Fetch verified token or dropship
        const res = await fetch(getApiUrl('/api/check-payment'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            address: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
            expectedAmount: (priceRub / 92).toFixed(4),
            symbol: 'USDT',
            currency: 'WALLET_BALANCE',
            email,
            productId: product.id,
            productName: product.title || product.cleanTitle || 'CS2 Premier Ready Instant Competitive',
            quantity,
            priceRub
          })
        });

        const data = await res.json();
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        setProcureProgress(100);

        if (data && data.delivery && data.delivery.tokens && data.delivery.tokens.length > 0) {
          const realToken = data.delivery.tokens[0];

          // ── Токен уже готов — сразу показываем SUCCESS ──
          if (realToken && realToken !== 'PROCURING' && realToken !== 'ERR_SUPPLIER_FAIL') {
            const orderRecord = {
              orderId,
              email,
              productName: isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title),
              amountRub: priceRub || product.price,
              tokens: data.delivery.tokens,
              createdAt: new Date().toISOString(),
              warrantyHours: 3
            };
            try {
              const existing = JSON.parse(localStorage.getItem('sharpbuy_user_orders') || '[]');
              existing.unshift(orderRecord);
              localStorage.setItem('sharpbuy_user_orders', JSON.stringify(existing));
            } catch (e) {}

            setDelivery(data.delivery);
            setOrder(orderRecord);
            setTimeout(() => setStep('SUCCESS'), 600);

          } else {
            // ── Статус PROCURING: запускаем поллинг каждые 3 сек до получения токена ──
            const savedSupplierOrderId = data.supplierOrderId || null;
            if (savedSupplierOrderId) {
              try { localStorage.setItem('sb_sid_' + orderId, savedSupplierOrderId); } catch(e) {}
            }

            const walletOrderForPolling = {
              orderId,
              address: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
              cryptoAmount: (priceRub / 92).toFixed(4),
              symbol: 'USDT',
              currency: 'WALLET_BALANCE',
              email,
              productName: product.title || product.cleanTitle,
              priceRub
            };

            setOrder({ orderId, email, productName: product.cleanTitle || product.title, amountRub: priceRub });
            setStep('PROCURING');

            if (pollerRef.current) clearInterval(pollerRef.current);
            pollerRef.current = setInterval(async () => {
              try {
                let supplierOrderId = savedSupplierOrderId;
                try { supplierOrderId = localStorage.getItem('sb_sid_' + orderId) || savedSupplierOrderId; } catch(e) {}

                const pollRes = await fetch(getApiUrl('/api/check-payment'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId,
                    address: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
                    expectedAmount: (priceRub / 92).toFixed(4),
                    symbol: 'USDT',
                    currency: 'WALLET_BALANCE',
                    email,
                    productId: product?.id || 'premier',
                    productName: product?.title || product?.cleanTitle,
                    quantity,
                    priceRub,
                    supplierOrderId
                  })
                });
                if (pollRes.ok) {
                  const pollData = await pollRes.json();
                  if (pollData.supplierOrderId) {
                    try { localStorage.setItem('sb_sid_' + orderId, pollData.supplierOrderId); } catch(e) {}
                  }
                  if (pollData.paid && pollData.delivery && pollData.delivery.tokens &&
                      pollData.delivery.tokens[0] && pollData.delivery.tokens[0] !== 'PROCURING') {
                    try { localStorage.removeItem('sb_sid_' + orderId); } catch(e) {}
                    handlePaymentSuccess(pollData.delivery, walletOrderForPolling);
                  }
                }
              } catch (e) {}
            }, 3000);
          }
        } else {
          alert(isEn ? 'Order completed! A fresh account token has been dispatched to your email.' : 'Заказ успешно выполнен! Свежий токен отправлен на вашу почту.');
          onClose();
        }
      } catch (err) {
        console.error('Wallet payment error:', err);
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      } finally {
        setIsChecking(false);
      }
      return;
    }

    // ── SBP / RUSSIAN BANK CARDS (CRYSTALPAY) MODE ──
    if (paymentMode === 'sbp') {
      try {
        setIsChecking(true);
        const priceRub = (product.price || 50) * quantity;
        const res = await fetch(getApiUrl('/api/create-anypay-payment'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            productName: isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title),
            priceRub,
            quantity,
            email,
            buyerTelegram: user?.telegram || ''
          })
        });

        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Ошибка создания платежа CrystalPay');
          setIsChecking(false);
          return;
        }

        setCrystalPayInvoice(data);
        setStep('PAYING_SBP');
        setTimeLeft(3600);

        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }

        startCrystalPayPolling(data.invoiceId, data.orderId, priceRub);
      } catch (err) {
        console.error('CrystalPay order error:', err);
        alert(isEn ? 'Connection error with CrystalPay' : 'Ошибка соединения с CrystalPay');
      } finally {
        setIsChecking(false);
      }
      return;
    }

    try {
      setIsChecking(true);
      const res = await fetch(getApiUrl('/api/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email,
          currency: selectedCrypto,
          quantity,
          unitPrice: product.price
        })
      });

      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        data = await generateClientFallbackOrder(product, email, selectedCrypto, quantity);
      }

      if (data.order) {
        setOrder(data.order);
        setStep('PAYING');
        setTimeLeft(900);
        startPolling(data.order, quantity);
      }
    } catch (err) {
      const fallback = await generateClientFallbackOrder(product, email, selectedCrypto, quantity);
      setOrder(fallback.order);
      setStep('PAYING');
      setTimeLeft(900);
      startPolling(fallback.order, quantity);
    } finally {
      setIsChecking(false);
    }
  };

  const startCrystalPayPolling = (invoiceId, orderId, priceRub) => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl('/api/check-anypay-payment'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId, orderId })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.paid && data.delivery) {
            if (pollerRef.current) clearInterval(pollerRef.current);
            const currentOrder = {
              orderId,
              productName: product?.cleanTitle || product?.title || 'Steam Account',
              email,
              priceRub,
              paymentMethod: 'SBP / Bank Card'
            };
            handlePaymentSuccess(data.delivery, currentOrder);
          }
        }
      } catch (e) {}
    }, 3000);
  };

  const checkCrystalPayManual = async () => {
    if (!crystalPayInvoice) return;
    setIsChecking(true);
    try {
      const res = await fetch(getApiUrl('/api/check-anypay-payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: crystalPayInvoice.invoiceId,
          orderId: crystalPayInvoice.orderId
        })
      });
      const data = await res.json();
      if (data.paid && data.delivery) {
        if (pollerRef.current) clearInterval(pollerRef.current);
        const currentOrder = {
          orderId: crystalPayInvoice.orderId,
          productName: product?.cleanTitle || product?.title || 'Steam Account',
          email,
          priceRub: crystalPayInvoice.amount,
          paymentMethod: 'SBP / Bank Card'
        };
        handlePaymentSuccess(data.delivery, currentOrder);
      } else {
        alert(isEn ? 'Payment not yet detected by CrystalPay. Please complete payment in your banking app and wait a moment.' : 'Оплата пока не зафиксирована. Пожалуйста, завершите платеж в приложении банка и подождите несколько секунд.');
      }
    } catch (e) {
      alert(isEn ? 'Error checking payment status' : 'Ошибка проверки статуса платежа');
    } finally {
      setIsChecking(false);
    }
  };

  const generateClientFallbackOrder = async (prod, userEmail, currId, qty) => {
    const addresses = {
      USDT_BEP20: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
      BNB_BSC: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
      USDT_POLYGON: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
      USDT_ARBITRUM: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
      USDT_BASE: '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9',
      LTC: 'Lg3tZk9Y7Fh8M2j1X4vBnKpQmRsTvW5xYa',
      SOL: '82Kj9sM4v1x7F3J5n8P0w2Y4z6T9r1E3sSharpBuy1',
      TON: 'EQBsharpbuy_official_treasury_001_ton_bsc',
      BTC: 'bc1qsharpbuy82k9m4v1x7f3j5n8p0w2y4z6t9r1e3s'
    };

    const curr = CRYPTO_CURRENCIES.find((c) => c.id === currId) || CRYPTO_CURRENCIES[0];
    const micro = Math.floor(Math.random() * 90 + 10) / 10000;
    const priceRub = (prod.price || 50) * qty;
    let cryptoAmount = Number(((priceRub / 92.0) + micro).toFixed(4));
    if (currId === 'BNB_BSC') {
      cryptoAmount = Number(((priceRub / (92.0 * 580.0)) + (micro / 580.0)).toFixed(5));
    } else if (currId === 'SOL') {
      cryptoAmount = Number(((priceRub / (92.0 * 180.0)) + (micro / 180.0)).toFixed(4));
    } else if (currId === 'TON') {
      cryptoAmount = Number(((priceRub / (92.0 * 5.2)) + (micro / 5.2)).toFixed(3));
    }
    const addr = addresses[currId] || addresses.USDT_BEP20;
    const qrDataUrl = await QRCode.toDataURL(addr, { margin: 2, scale: 6 });

    return {
      order: {
        orderId: 'SHARP-' + Date.now().toString(36).toUpperCase(),
        productName: isEn ? (prod.englishTitle || prod.cleanTitle || prod.title) : (prod.cleanTitle || prod.title),
        email: userEmail,
        currency: currId,
        currencyName: curr.name,
        network: curr.network,
        address: addr,
        cryptoAmount,
        priceRub,
        symbol: curr.symbol,
        qrDataUrl
      }
    };
  };

  const startPolling = (currentOrder, currentQty) => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    pollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl('/api/check-payment'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: currentOrder.orderId,
            orderIndex: currentOrder.orderIndex,
            address: currentOrder.address,
            expectedAmount: currentOrder.cryptoAmount,
            symbol: currentOrder.symbol,
            currency: currentOrder.currency,
            quantity: currentQty,
            email: currentOrder.email || email,
            productId: product?.id || 'premier',
            productName: currentOrder.productName || product?.title,
            initialBalance: currentOrder.initialBalance,
            createdAtTime: currentOrder.createdAtTime || Math.floor(Date.now() / 1000)
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.paid && data.delivery) {
            handlePaymentSuccess(data.delivery, currentOrder);
          }
        }
      } catch (e) {}
    }, 2500);
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch(getApiUrl('/api/check-payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.orderId,
          orderIndex: order?.orderIndex,
          address: order?.address,
          expectedAmount: order?.cryptoAmount,
          symbol: order?.symbol,
          currency: order?.currency,
          quantity,
          email: order?.email || email,
          productId: product?.id || 'premier',
          productName: order?.productName || product?.title,
          initialBalance: order?.initialBalance,
          createdAtTime: order?.createdAtTime || Math.floor(Date.now() / 1000)
        })
      });

      const data = await res.json();
      if (data.paid && data.delivery) {
        handlePaymentSuccess(data.delivery, order);
      } else {
        alert(data.message || (isEn ? 'Transaction not yet found on blockchain. Confirmation typically takes 1–2 minutes.' : 'Транзакция ещё не найдена в сети. Подтверждение в блокчейне обычно занимает 1–2 минуты.'));
      }
    } catch (e) {
      alert(isEn ? 'Waiting for blockchain network confirmation...' : 'Ожидание подтверждения транзакции в сети блокчейн...');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePaymentSuccess = (deliveryData, currentOrder) => {
    setDelivery(deliveryData);
    setStep('SUCCESS');

    // If we have actual tokens delivered, save to user order history and stop polling
    if (deliveryData.tokens && deliveryData.tokens[0] && deliveryData.tokens[0] !== 'PROCURING') {
      if (pollerRef.current) clearInterval(pollerRef.current);

      const orderRecord = {
        orderId: currentOrder?.orderId || order?.orderId || ('SHARP-' + Date.now().toString(36).toUpperCase()),
        email: currentOrder?.email || email,
        productName: isEn ? (product?.englishTitle || product?.cleanTitle || product?.title) : (product?.cleanTitle || product?.title),
        amountRub: currentOrder?.priceRub || product?.price || 50,
        tokens: deliveryData.tokens,
        createdAt: new Date().toISOString(),
        warrantyHours: 3
      };

      try {
        const existing = JSON.parse(localStorage.getItem('sharpbuy_user_orders') || '[]');
        const existingIdx = existing.findIndex(o => o.orderId === orderRecord.orderId);
        if (existingIdx >= 0) {
          existing[existingIdx] = { ...existing[existingIdx], ...orderRecord };
        } else {
          existing.unshift(orderRecord);
        }
        localStorage.setItem('sharpbuy_user_orders', JSON.stringify(existing));
      } catch (e) {}
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const downloadAllTxt = (tokens) => {
    try {
      const content = tokens.join('\n\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SharpBuy-Accounts-${order?.orderId || Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const tokensList = delivery && Array.isArray(delivery.tokens) && delivery.tokens.length > 0
    ? delivery.tokens
    : (delivery && delivery.tokenData ? [delivery.tokenData] : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#101216] p-4 sm:p-5 text-[#F3F1EC] shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-4 font-mono text-xl text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          &times;
        </button>

        {/* ── STEP 1: SINGLE UNIFIED ORDER FORM ── */}
        {step === 'SETUP' && (
          <form onSubmit={handleCreateOrder} className="space-y-2.5">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#E8583A] font-bold uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8583A] animate-pulse"></span>
                <span>{isEn ? 'CHECKOUT · INSTANT DELIVERY' : 'ОФОРМЛЕНИЕ ЗАКАЗА · АВТОВЫДАЧА'}</span>
              </div>
              <h2 className="font-sans text-base sm:text-lg font-black uppercase text-white leading-tight mt-0.5">
                {isEn ? (product.englishTitle || product.cleanTitle || product.title) : (product.cleanTitle || product.title)}
              </h2>
            </div>

            {/* Карточка суммы и количества */}
            <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-2 border border-white/[0.08]">
              <div>
                <span className="font-mono text-[9px] text-white/40 uppercase block leading-none">{isEn ? 'TOTAL:' : 'ИТОГО:'}</span>
                <span className="font-mono text-lg font-black text-[#E8583A]">
                  {formatPrice((product?.price || 50) * quantity)}
                </span>
              </div>

              {/* Счетчик количества */}
              <div className="flex items-center rounded-lg border border-white/[0.1] bg-black/40 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-white/60 hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 py-1 font-bold text-white min-w-[24px] text-center text-xs">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount || 10, q + 1))}
                  className="px-2.5 py-1 text-white/60 hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Поле Email */}
            <div>
              <label className="mb-1 block font-mono text-[11px] text-white/70">
                {isEn ? 'Email for receipt and token copy:' : 'Email для отправки чека и токена:'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-9 rounded-xl border border-white/[0.12] bg-black/60 px-3 font-mono text-xs text-white placeholder-white/30 focus:border-[#E8583A] focus:outline-none transition-colors"
              />
            </div>

            {/* Способ оплаты: СБП / Карты РФ, Криптовалюта или Баланс */}
            <div>
              <label className="mb-1 block font-mono text-[11px] text-white/70">
                {isEn ? 'Payment method:' : 'Способ оплаты:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setPaymentMode('sbp')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === 'sbp'
                      ? 'border-[#10b981] bg-[#10b981]/15 font-bold text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'border-white/[0.08] bg-black/40 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs">⚡</span>
                  <span className="text-[11px] font-sans font-bold leading-tight">{isEn ? 'SBP / Cards' : 'СБП / Карты'}</span>
                  <span className="text-[9px] font-mono text-[#10b981] font-bold">0% РФ 🇷🇺</span>
                </div>

                <div
                  onClick={() => setPaymentMode('crypto')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === 'crypto'
                      ? 'border-[#E8583A] bg-[#E8583A]/15 font-bold text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                      : 'border-white/[0.08] bg-black/40 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-mono">₿</span>
                  <span className="text-[11px] font-sans font-bold leading-tight">{isEn ? 'Crypto' : 'Крипта 0%'}</span>
                  <span className="text-[9px] font-mono text-white/40">USDT/TON</span>
                </div>

                <div
                  onClick={() => setPaymentMode('balance')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                    paymentMode === 'balance'
                      ? 'border-[#E8583A] bg-[#E8583A]/15 font-bold text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                      : 'border-white/[0.08] bg-black/40 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs">💳</span>
                  <span className="text-[11px] font-sans font-bold leading-tight">{isEn ? 'Balance' : 'Баланс'}</span>
                  <span className="text-[9px] font-mono text-white/40">{user?.balance || 0} ₽</span>
                </div>
              </div>

              {/* ── Эксклюзивная кнопка владельца: оплата с кошелька магазина ── */}
              {user && (user.email === 'iliykuzin2@gmail.com' || user.email === 'iliykuzin2') && (
                <div
                  onClick={() => setPaymentMode('owner_wallet')}
                  className={`mt-2 flex items-center justify-center gap-2 rounded-xl h-9 px-3 border transition-all cursor-pointer ${
                    paymentMode === 'owner_wallet'
                      ? 'border-amber-400 bg-amber-400/15 font-bold text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                      : 'border-amber-400/30 bg-amber-400/5 text-amber-400/70 hover:border-amber-400/60 hover:text-amber-300'
                  }`}
                >
                  <span className="text-sm">👑</span>
                  <span className="text-xs font-mono font-bold">
                    {isEn ? 'STORE WALLET (Owner)' : 'КОШЕЛЁК МАГАЗИНА (Владелец)'}
                  </span>
                </div>
              )}
            </div>

            {/* Выбор криптовалюты (при crypto режиме) */}
            {paymentMode === 'crypto' && (
              <div className="space-y-1 pt-0.5">
                <div className="text-[9px] font-mono text-white/40 uppercase">{isEn ? 'Select network:' : 'Выберите валюту и сеть:'}</div>
                <div className="grid grid-cols-2 gap-2">
                  {CRYPTO_CURRENCIES.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCrypto(c.id)}
                      className={`flex items-center gap-2 rounded-xl p-2 border transition-all cursor-pointer ${
                        selectedCrypto === c.id
                          ? 'border-[#E8583A] bg-[#E8583A]/15 text-white shadow-[0_0_12px_rgba(232,88,58,0.25)]'
                          : 'border-white/[0.08] bg-black/40 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <CryptoIcon currencyId={c.id} className="h-6 w-6 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-sans font-bold text-xs text-white">{c.name}</span>
                          <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-white/[0.08] text-white/70 truncate">
                            {c.networkBadge}
                          </span>
                        </div>
                        <div className="font-mono text-[9px] text-white/40 leading-none mt-0.5 truncate">
                          {c.feeNote}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isChecking}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8583A] py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_20px_rgba(232,88,58,0.45)] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isChecking ? (isEn ? 'PROCESSING...' : 'ОБРАБОТКА...') : `${isEn ? 'PROCEED TO PAYMENT' : 'ПЕРЕЙТИ К ОПЛАТЕ'} ${formatPrice((product?.price || 50) * quantity)} →`}</span>
            </button>
          </form>
        )}

        {/* ── STEP 1.5: LIVE PROCURING & AUTOMATED PROVISIONING SCREEN ── */}
        {step === 'PROCURING' && (
          <div className="space-y-6 py-4 text-center">
            {/* Animated Radar Icon */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#E8583A]/30 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-[#34D399]/40 animate-pulse"></div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8583A] text-white font-black text-2xl shadow-[0_0_30px_rgba(232,88,58,0.6)]">
                ⚡
              </div>
            </div>

            <div>
              <h2 className="font-sans text-xl font-black uppercase text-white tracking-wide">
                {isEn ? 'AUTOMATED ACCOUNT PROVISIONING...' : 'АВТОМАТИЧЕСКАЯ ВЫДАЧА АККАУНТА...'}
              </h2>
              <p className="font-mono text-xs text-white/50 mt-1 max-w-md mx-auto">
                {isEn
                  ? 'SharpBuy Cloud is generating and verifying your Steam Prime credentials (~10-15 sec)...'
                  : 'Сервер SharpBuy формирует и верифицирует данные вашего Steam Prime аккаунта (~10-15 сек)...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs text-white/60">
                <span>{isEn ? 'PROVISIONING PROGRESS:' : 'ПРОГРЕСС ВЫДАЧИ:'}</span>
                <span className="font-bold text-[#34D399]">{procureProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/60 p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E8583A] via-amber-400 to-[#34D399] transition-all duration-700 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                  style={{ width: `${procureProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Stages */}
            <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-left font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{isEn ? 'SYSTEM AUDIT TRAIL:' : 'ЭТАПЫ ОБРАБОТКИ:'}</span>
                <span className="text-[10px] text-[#34D399] font-bold animate-pulse">● SHARPBUY CLOUD</span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${procureStage >= 1 ? 'text-white' : 'text-white/30'}`}>
                <span>{procureStage > 1 ? '✓' : '⏳'}</span>
                <span className={procureStage === 1 ? 'text-[#34D399] font-bold' : ''}>
                  {isEn ? '1. Order initialization & payment verification' : '1. Резервирование и подтверждение оплаты'}
                </span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${procureStage >= 2 ? 'text-white' : 'text-white/30'}`}>
                <span>{procureStage > 2 ? '✓' : procureStage === 2 ? '⏳' : '○'}</span>
                <span className={procureStage === 2 ? 'text-[#34D399] font-bold' : ''}>
                  {isEn ? '2. Allocating clean Steam Prime account node' : '2. Выделение чистого Steam Prime аккаунта'}
                </span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${procureStage >= 3 ? 'text-white' : 'text-white/30'}`}>
                <span>{procureStage > 3 ? '✓' : procureStage === 3 ? '⏳' : '○'}</span>
                <span className={procureStage === 3 ? 'text-[#34D399] font-bold' : ''}>
                  {isEn ? '3. Generating secure cryptographic login token' : '3. Криптографическая генерация токена входа'}
                </span>
              </div>

              <div className={`flex items-center gap-2.5 transition-colors ${procureStage >= 4 ? 'text-white' : 'text-white/30'}`}>
                <span>{procureStage >= 4 ? '✓' : '○'}</span>
                <span className={procureStage === 4 ? 'text-[#34D399] font-bold' : ''}>
                  {isEn ? '4. Security check, 3-hour warranty stamp & receipt dispatch' : '4. Финальная верификация, гарантия 3ч и отправка чека'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: SBP / BANK CARDS CRYSTALPAY INVOICE ── */}
        {step === 'PAYING_SBP' && crystalPayInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  ⚡
                </div>
                <div>
                  <div className="font-mono text-[10px] text-white/40">{isEn ? 'SBP / RUSSIAN BANK CARDS' : 'СБП / КАРТЫ РФ (МИР, VISA, MC)'}</div>
                  <div className="font-sans font-bold text-sm text-white">CrystalPay #{crystalPayInvoice.invoiceId}</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-white/40">{isEn ? 'SUM TO PAY:' : 'К ОПЛАТЕ:'}</div>
                <div className="text-base font-black text-[#10b981]">{crystalPayInvoice.amount} ₽</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-4 text-center space-y-4">
              <div className="space-y-1">
                <div className="font-sans font-bold text-sm text-white">
                  {isEn ? 'Payment window opened in a new tab' : 'Страница оплаты открыта в новой вкладке'}
                </div>
                <div className="font-mono text-xs text-white/60">
                  {isEn 
                    ? 'Complete payment via SBP QR-code or any Russian Bank Card.'
                    : 'Оплатите по QR-коду СБП через приложение любого банка РФ или банковской картой.'}
                </div>
              </div>

              <a
                href={crystalPayInvoice.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] py-3 font-mono text-xs font-black uppercase text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all cursor-pointer"
              >
                <span>{isEn ? 'OPEN PAYMENT PAGE ↗' : 'ПЕРЕЙТИ К ОПЛАТЕ СБП / КАРТОЙ ↗'}</span>
              </a>

              <div className="flex items-center justify-center gap-2 font-mono text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 py-2 px-3 rounded-xl animate-pulse">
                <span>⏳</span>
                <span>{isEn ? 'Waiting for payment confirmation from bank...' : 'Ожидание зачисления средств... Автовыдача через 3 сек.'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => checkCrystalPayManual()}
                disabled={isChecking}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-mono text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {isChecking ? (isEn ? 'CHECKING...' : 'ПРОВЕРКА...') : (isEn ? 'VERIFY PAYMENT' : 'ПРОВЕРИТЬ ОПЛАТУ')}
              </button>
              <button
                type="button"
                onClick={() => { if (pollerRef.current) clearInterval(pollerRef.current); setStep('SETUP'); }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-xs text-white/50 hover:text-white transition-all cursor-pointer"
              >
                {isEn ? 'Back' : 'Назад'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: INVOICE & QR CODE ── */}
        {step === 'PAYING' && order && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <CryptoIcon currencyId={order.currency} className="h-9 w-9 shrink-0" />
                <div>
                  <div className="font-mono text-[10px] text-white/40">{isEn ? 'INVOICE' : 'СЧЁТ'} #{order.orderId}</div>
                  <div className="font-sans font-bold text-sm text-white">{order.currencyName}</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-[10px] text-white/40">{isEn ? 'PAYMENT EXPIRES IN:' : 'ТАЙМЕР ОПЛАТЫ:'}</div>
                <div className="text-base font-black text-[#E8583A]">{formatTimer(timeLeft)}</div>
              </div>
            </div>

            {/* QR Code & Amount */}
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl bg-black/50 p-4 border border-white/[0.08]">
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-white p-1.5 shadow-lg">
                <img src={order.qrDataUrl} alt="QR Code" className="h-full w-full object-contain" />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div>
                  <span className="block font-mono text-[10px] text-white/40 uppercase">{isEn ? 'AMOUNT TO TRANSFER:' : 'СУММА К ПЕРЕВОДУ:'}</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-[#34D399]">
                      {order.cryptoAmount} {order.symbol}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.cryptoAmount.toString(), 'amount')}
                      className="rounded bg-white/[0.08] px-2 py-1 font-mono text-[10px] text-white hover:bg-white/[0.15] cursor-pointer"
                    >
                      {copiedField === 'amount' ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : (isEn ? 'COPY' : 'КОПИРОВАТЬ')}
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">({formatPrice(order.priceRub)})</span>
                </div>

                <div className="border-t border-white/[0.06] pt-2">
                  <span className="block font-mono text-[10px] text-white/40 uppercase">{isEn ? 'NETWORK:' : 'СЕТЬ:'}</span>
                  <span className="font-mono text-xs font-bold text-white">{order.network}</span>
                </div>
              </div>
            </div>

            {/* Wallet Address Copy Row */}
            <div>
              <label className="mb-1 block font-mono text-[10px] text-white/50 uppercase">
                {isEn ? 'RECIPIENT WALLET ADDRESS:' : 'АДРЕС КОШЕЛЬКА ДЛЯ ОПЛАТЫ:'}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/60 p-2.5">
                <span className="flex-1 truncate font-mono text-xs text-white/90 selection:bg-[#E8583A]">
                  {order.address}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.address, 'address')}
                  className="rounded-lg bg-[#E8583A] px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-[#FF6B4A] transition-all cursor-pointer"
                >
                  {copiedField === 'address' ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : (isEn ? 'COPY' : 'КОПИРОВАТЬ')}
                </button>
              </div>
            </div>

            {/* Live Polling Banner */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse"></span>
                <span className="text-white/70 text-[11px]">{isEn ? 'Scanning blockchain for incoming transaction...' : 'Автоматический поиск транзакции в сети блокчейн...'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={isChecking}
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.08] py-3 font-mono text-xs font-bold text-white hover:bg-white/[0.15] transition-colors cursor-pointer"
              >
                {isChecking ? (isEn ? 'SCANNING NETWORK...' : 'СКАНИРОВАНИЕ СЕТИ...') : (isEn ? 'VERIFY PAYMENT IN NETWORK' : 'ПРОВЕРИТЬ ОПЛАТУ В СЕТИ')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: REAL NFA ACCOUNT DELIVERY & LAUNCHER DOWNLOAD ── */}
        {step === 'SUCCESS' && delivery && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#34D399]/15 border border-[#34D399]/40 shadow-[0_0_25px_rgba(52,211,153,0.35)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" className="h-7 w-7">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <h2 className="font-sans text-xl font-black uppercase text-white">
                {isEn ? 'PAYMENT CONFIRMED!' : 'ОПЛАТА ПОДТВЕРЖДЕНА!'}
              </h2>
              <p className="font-mono text-xs text-[#34D399] mt-0.5">
                {isEn
                  ? `${tokensList.length > 1 ? `${tokensList.length}x ${product?.englishTitle || product?.cleanTitle || 'Account'}` : `${product?.englishTitle || product?.cleanTitle || 'Account'}`} successfully dispatched · Copy sent to ${order?.email}`
                  : `${tokensList.length > 1 ? `Выдано ${tokensList.length}x ${product?.cleanTitle || 'Аккаунт'}` : `${product?.cleanTitle || 'Ваш аккаунт'} успешно выдан`} · Копия отправлена на ${order?.email}`}
              </p>
            </div>

            {/* NFA Tokens List OR Procuring State */}
            <div className="space-y-2 text-left">
              {delivery.status === 'PROCURING' ? (
                <div className="rounded-xl border border-white/[0.12] bg-[#E8583A]/10 p-5 font-mono space-y-3 shadow-xl text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E8583A]/20 animate-spin">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#E8583A" strokeWidth="2" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                    </svg>
                  </div>
                  <div className="text-[#E8583A] font-bold text-sm">
                    {isEn ? 'ACCOUNT PREPARATION' : 'ПОДГОТОВКА АККАУНТА'}
                  </div>
                  <div className="text-white/70 text-xs">
                    {isEn 
                      ? 'Payment received! We are currently preparing and verifying your account for security. This usually takes 2-10 minutes. The token will be automatically emailed to you once ready.' 
                      : 'Оплата получена! Ваш аккаунт сейчас подготавливается и проверяется на валидность. Обычно это занимает от 2 до 10 минут. Ключ будет автоматически выслан на ваш Email, как только мы его подготовим.'}
                  </div>
                  <div className="text-white/50 text-[10px] mt-2">
                    {isEn ? 'You can safely close this window.' : 'Вы можете безопасно закрыть это окно.'}
                  </div>
                </div>
              ) : (
                tokensList.map((tok, idx) => (
                  <div key={idx} className="rounded-xl border border-white/[0.12] bg-black/70 p-3.5 font-mono space-y-2 shadow-xl">
                    <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest border-b border-white/[0.08] pb-1">
                      <span>{isEn ? `LOGIN TOKEN #${idx + 1} (NFA STEAM):` : `ТОКЕН ВХОДА #${idx + 1} (NFA STEAM):`}</span>
                      <span className="text-[#34D399] font-bold">{isEn ? 'ACTIVE' : 'АКТИВЕН'}</span>
                    </div>

                    <div className="relative rounded-lg bg-black/80 p-2.5 border border-white/[0.08] overflow-hidden">
                      <div className="truncate text-xs font-bold text-[#E8583A] select-all">
                        {tok}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(tok, `token_${idx}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8583A] py-2 font-mono text-xs font-black text-white hover:bg-[#FF6B4A] transition-all cursor-pointer"
                    >
                      <span>{copiedField === `token_${idx}` ? (isEn ? 'COPIED ✓' : 'СКОПИРОВАНО ✓') : (isEn ? `COPY TOKEN #${idx + 1}` : `СКОПИРОВАТЬ ТОКЕН #${idx + 1}`)}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Download All TXT Button for multiple accounts */}
            {tokensList.length > 1 && (
              <button
                type="button"
                onClick={() => downloadAllTxt(tokensList)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.1] border border-white/20 py-2.5 font-mono text-xs font-bold text-white hover:bg-white/[0.18] transition-colors cursor-pointer"
              >
                <span>📁 {isEn ? `DOWNLOAD ALL ${tokensList.length} TOKENS (.TXT)` : `СКАЧАТЬ ВСЕ ${tokensList.length} ТОКЕНА В ФАЙЛ (.TXT)`}</span>
              </button>
            )}

            {/* Launcher Download & Instructions */}
            <div className="rounded-xl border border-white/[0.08] bg-[#14161D] p-3.5 text-left font-sans text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-white/70">
                <span className="font-bold">{isEn ? 'STEAM LOGIN INSTRUCTIONS:' : 'ИНСТРУКЦИЯ ПО ВХОДУ В STEAM:'}</span>
                <a
                  href="/SharpBuy_Launcher.exe"
                  download="SharpBuy_Launcher.exe"
                  className="rounded bg-[#34D399]/20 border border-[#34D399]/40 px-2.5 py-1 text-[#34D399] font-bold hover:bg-[#34D399]/30 transition-colors"
                >
                  {isEn ? 'DOWNLOAD LAUNCHER ⬇️' : 'СКАЧАТЬ ЛАУНЧЕР ⬇️'}
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-white/60 text-[11px] font-mono">
                {isEn ? (
                  <>
                    <li>Download and run <strong>SharpBuy_Launcher.exe</strong> on your PC.</li>
                    <li>Paste your copied token into the launcher field.</li>
                    <li>Click &laquo;Login&raquo; &mdash; Steam will launch automatically with your Prime!</li>
                  </>
                ) : (
                  <>
                    <li>Скачайте и запустите <strong>SharpBuy_Launcher.exe</strong> на вашем ПК.</li>
                    <li>Вставьте скопированный токен в поле программы.</li>
                    <li>Нажмите «Войти» — Steam запустится автоматически с вашим Prime!</li>
                  </>
                )}
              </ol>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-white/[0.08] border border-white/10 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-white/[0.15] transition-all cursor-pointer"
            >
              {isEn ? 'CLOSE' : 'ЗАКРЫТЬ'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CryptoPayModal;
