import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'sharpbuy_auth_v3_session';
const USERS_STORAGE_KEY = 'sharpbuy_registered_v3_accounts';

// Cryptographic password hashing with salt
async function hashPassword(password) {
  try {
    const enc = new TextEncoder();
    const data = enc.encode('sharpbuy_security_salt_2026_' + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'fallback_hash_' + password;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Wipe any legacy auth sessions from client localStorage
      localStorage.removeItem('sharpbuy_auth_session');
      localStorage.removeItem('sharpbuy_auth_v2_session');
      
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionUser = parsed?.user || (parsed?.email ? parsed : null);
        const sessionToken = parsed?.token || null;

        if (sessionUser?.email && sessionUser.email.includes('@') && sessionToken) {
          setUser(sessionUser);
          setToken(sessionToken);
        } else {
          // Старая сессия без JWT — сбрасываем, нужен повторный вход
          setUser(null);
          setToken(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const saveUserSession = (userData, authToken) => {
    setUser(userData);
    setToken(authToken || null);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: userData,
        token: authToken || null,
        email: userData?.email || '',
      }));
    } catch (e) {}
  };

  const register = async (email, password) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();

      const res = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Ошибка при регистрации на сервере.' 
        };
      }

      saveUserSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: err.message || 'Ошибка соединения с сервером.' };
    }
  };

  const login = async (email, password) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();

      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Неверный логин или пароль.'
        };
      }

      saveUserSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: err.message || 'Ошибка соединения с сервером.' };
    }
  };

  const verifyEmail = (verifyToken) => {
    if (!user) return false;
    const updated = { ...user, isVerified: true };
    saveUserSession(updated, token);
    return true;
  };

  const topUpBalance = (rubAmount) => {
    if (!user) return;
    const updated = {
      ...user,
      balanceRub: Number(((user.balanceRub || 0) + Number(rubAmount)).toFixed(0)),
    };
    saveUserSession(updated, token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        register,
        login,
        logout,
        verifyEmail,
        topUpBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
