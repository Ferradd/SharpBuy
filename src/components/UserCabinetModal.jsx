import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

export const UserCabinetModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'balance'
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');

  // Top up balance state
  const [selectedSolPreset, setSelectedSolPreset] = useState(5);
  const [topUpQr, setTopUpQr] = useState('');
  const [userWalletData, setUserWalletData] = useState(null);
  const [isSyncingWallet, setIsSyncingWallet] = useState(false);

  const MERCHANT_ADDR = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';

  useEffect(() => {
    if (isOpen && user) {
      fetchUserOrders();
      fetchUserWallet();
    }
  }, [isOpen, user]);

  const fetchUserWallet = async () => {
    if (!user?.email) return;
    setIsSyncingWallet(true);
    try {
      const res = await fetch(`/api/get-user-wallet?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.success) {
        setUserWalletData(data);
        const qr = await QRCode.toDataURL(data.address, { margin: 2, scale: 5 });
        setTopUpQr(qr);
      }
    } catch (e) {}
    setIsSyncingWallet(false);
  };

  const fetchUserOrders = async () => {
    if (!user?.email) return;
    setIsLoadingOrders(true);
    let localOrders = [];
    try {
      const raw = localStorage.getItem('sharpbuy_user_orders');
      if (raw) localOrders = JSON.parse(raw);
    } catch (e) {}

    try {
      const res = await fetch(`/api/get-orders?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data && data.orders && data.orders.length > 0) {
        const orderMap = new Map();
        [...localOrders, ...data.orders].forEach(o => {
          if (o && o.orderId) orderMap.set(o.orderId, o);
        });
        setUserOrders(Array.from(orderMap.values()));
      } else {
        setUserOrders(localOrders);
      }
    } catch (e) {
      setUserOrders(localOrders);
    }
    setIsLoadingOrders(false);
  };

  if (!isOpen || !user) return null;

  const copyText = (txt, id) => {
    navigator.clipboard.writeText(txt);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(''), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#101216] p-6 sm:p-8 text-[#F3F1EC] shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 font-mono text-2xl text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          &times;
        </button>

        {/* User Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8583A] text-white font-black text-lg shadow-[0_0_20px_rgba(232,88,58,0.4)]">
              {(user.email || 'SB').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                <span>{user.email}</span>
                <span className="rounded-full bg-[#34D399]/20 border border-[#34D399]/40 px-2 py-0.5 font-mono text-[9px] text-[#34D399] font-bold">
                  ✓ VERIFIED
                </span>
              </div>
              <div className="font-mono text-xs text-white/50 mt-0.5">
                {isEn ? 'Personal Cabinet · SharpBuy Customer' : 'Личный кабинет покупателя SharpBuy'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { logout(); onClose(); }}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-xs text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              {isEn ? 'Sign Out' : 'Выйти'}
            </button>
          </div>
        </div>

        {/* Regular Client Balance Card */}
        <div className="mt-6 rounded-2xl border border-white/[0.1] bg-gradient-to-r from-black/80 via-[#14161F] to-black/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{isEn ? 'STORE BALANCE:' : 'БАЛАНС САЙТА:'}</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-[#34D399]">
                {user.balanceUsdt || 0} USDT
              </span>
              <span className="font-mono text-sm text-white/50">
                ({(user.balanceRub || 0).toLocaleString('ru-RU')} ₽)
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('balance')}
            className="w-full sm:w-auto rounded-xl bg-[#E8583A] px-5 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#FF6B4A] hover:shadow-[0_0_20px_rgba(232,88,58,0.4)] transition-all cursor-pointer"
          >
            {isEn ? '+ TOP UP BALANCE' : '+ ПОПОЛНИТЬ БАЛАНС'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-white/[0.08] font-mono text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#E8583A] text-white'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {isEn ? '📦 MY PURCHASES' : '📦 МОИ ПОКУПКИ'} ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`pb-3 px-4 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'balance'
                ? 'border-[#E8583A] text-white'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {isEn ? '💳 DEPOSIT FUNDS' : '💳 ПОПОЛНЕНИЕ'}
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-3.5">
            {isLoadingOrders ? (
              <div className="py-12 text-center font-mono text-xs text-white/40 animate-pulse">
                {isEn ? 'Loading your order history...' : 'Загрузка истории покупок...'}
              </div>
            ) : userOrders.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-8 text-center">
                <div className="text-3xl mb-2">🛒</div>
                <div className="font-mono text-sm font-bold text-white mb-1">
                  {isEn ? 'No purchases yet' : 'У вас пока нет покупок'}
                </div>
                <div className="font-mono text-xs text-white/40 max-w-sm mx-auto mb-4">
                  {isEn
                    ? 'All accounts and items purchased with this email will automatically appear here.'
                    : 'Все приобретенные аккаунты и токены будут автоматически сохраняться в этом разделе.'}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-white/[0.08] px-4 py-2 font-mono text-xs font-bold text-white hover:bg-white/[0.15] transition-colors cursor-pointer"
                >
                  {isEn ? 'Go to Catalog →' : 'Перейти в каталог →'}
                </button>
              </div>
            ) : (
              userOrders.map((ord) => {
                const tokenString = Array.isArray(ord.tokens) && ord.tokens[0] ? ord.tokens[0] : (ord.tokenData || '');
                return (
                  <div
                    key={ord.orderId}
                    className="rounded-xl border border-white/[0.08] bg-black/40 p-4 transition-all hover:border-white/[0.15]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5 mb-3">
                      <div>
                        <div className="font-sans text-sm font-bold text-white">
                          {ord.productName || 'CS2 Account'}
                        </div>
                        <div className="font-mono text-[10px] text-white/40 mt-0.5">
                          ID: <span className="text-white/70">{ord.orderId}</span> · {new Date(ord.createdAt || ord.paidAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#34D399]/15 border border-[#34D399]/30 px-2 py-0.5 font-mono text-[10px] text-[#34D399] font-bold">
                          ✓ ВЫДАН
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {ord.amountRub || ord.priceRub || 0} ₽
                        </span>
                      </div>
                    </div>

                    {/* Token & Actions */}
                    {tokenString && tokenString !== 'PROCURING' && tokenString !== '[SECURE_DELIVERY_TOKEN]' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-black/70 border border-white/[0.06] p-2.5 font-mono text-xs">
                          <span className="truncate text-white/80 select-all mr-2">
                            {tokenString}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(tokenString, ord.orderId)}
                            className="shrink-0 rounded bg-[#E8583A]/20 px-2.5 py-1 text-[11px] font-bold text-[#E8583A] hover:bg-[#E8583A]/30 transition-colors cursor-pointer"
                          >
                            {copiedToken === ord.orderId ? '✓ СКОПИРОВАНО' : 'КОПИРОВАТЬ'}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1">
                          <span>🛡️ Гарантия активна ({ord.warrantyHours || 3}ч)</span>
                          <a
                            href="/SharpBuy_Launcher.exe"
                            download
                            className="text-[#E8583A] hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>📥 СКАЧАТЬ ЛАУНЧЕР</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 font-mono text-xs text-amber-300">
                        ⏳ Заказ обрабатывается. Токен будет доставлен на ваш Email.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Balance Top-Up */}
        {activeTab === 'balance' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 text-center">
              <div className="font-mono text-xs text-white/50 mb-1">
                {isEn ? 'Direct Deposit Address (USDT BEP-20 / BSC)' : 'Прямой адрес для пополнения (USDT BEP-20 / BSC)'}
              </div>
              <div className="font-mono text-xs font-bold text-white bg-black/80 p-3 rounded-lg border border-white/[0.06] select-all break-all my-3">
                {userWalletData?.address || MERCHANT_ADDR}
              </div>

              {topUpQr && (
                <div className="flex justify-center my-4">
                  <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
                    <img src={topUpQr} alt="QR" className="w-36 h-36" />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => copyText(userWalletData?.address || MERCHANT_ADDR, 'deposit_addr')}
                className="w-full sm:w-auto rounded-xl bg-[#E8583A] px-6 py-2 font-mono text-xs font-bold text-white hover:bg-[#FF6B4A] transition-all cursor-pointer"
              >
                {copiedToken === 'deposit_addr' ? '✓ АДРЕС СКОПИРОВАН' : 'СКОПИРОВАТЬ АДРЕС'}
              </button>

              <div className="font-mono text-[11px] text-white/40 mt-4 leading-relaxed">
                💡 {isEn
                  ? 'Send any amount of USDT (BEP-20 / BNB Chain). Balance will automatically update after 1 blockchain confirmation.'
                  : 'Отправьте любую сумму USDT (сеть BEP-20 / BNB Chain). Баланс обновится автоматически после 1 подтверждения в сети.'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserCabinetModal;
