import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { signJwt, requireAdmin } from './_utils/jwt-auth.js';
import {
  getAllIngestedTokens,
  getIngestEvents,
  deleteIngestedToken,
  clearAllIngestedTokens,
  clearIngestEvents,
} from './_utils/ingested-tokens-db.js';

const USERS_DB_FILE = path.join(process.cwd(), 'api', 'users_database.json');
const USERS_DB_SRC = path.join(process.cwd(), 'src', 'data', 'users_database.json');
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'iliykuzin2@gmail.com').trim().toLowerCase();

function hashPassword(password, salt = 'sharpbuy_salt_2026_') {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function buildUserSession(existing) {
  const isOwner = Boolean(
    existing.isOwner
    || existing.role === 'OWNER'
    || String(existing.email || '').trim().toLowerCase() === ADMIN_EMAIL
  );

  return {
    id: existing.id,
    email: existing.email,
    displayName: existing.displayName || '',
    role: isOwner ? 'OWNER' : (existing.role || 'USER'),
    isOwner,
    isVerified: existing.isVerified,
    balanceRub: existing.balanceRub || 0,
    registeredAt: existing.registeredAt,
  };
}

function issueAuthResponse(existing) {
  const userSession = buildUserSession(existing);
  const token = signJwt({
    sub: userSession.id,
    email: userSession.email,
    role: userSession.role,
    isOwner: userSession.isOwner,
  });

  return {
    success: true,
    user: userSession,
    token,
  };
}

// Read all users from server DB
export function getAllServerUsers() {
  try {
    if (fs.existsSync(USERS_DB_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_DB_FILE, 'utf8'));
    }
    if (fs.existsSync(USERS_DB_SRC)) {
      return JSON.parse(fs.readFileSync(USERS_DB_SRC, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading users DB:', e);
  }
  return {};
}

// Save all users to server DB
export function saveServerUsers(usersMap) {
  try {
    const dir1 = path.dirname(USERS_DB_FILE);
    if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify(usersMap, null, 2), 'utf8');
  } catch (e) {}

  try {
    const dir2 = path.dirname(USERS_DB_SRC);
    if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
    fs.writeFileSync(USERS_DB_SRC, JSON.stringify(usersMap, null, 2), 'utf8');
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || (req.body && req.body.action) || 'me';

  try {
    const users = getAllServerUsers();

    // 1. REGISTER
    if (action === 'register') {
      const { email, password } = req.body || {};
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ success: false, error: 'Укажите корректный Email адрес' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, error: 'Пароль должен быть не менее 6 символов' });
      }

      // Check if email already registered globally on server
      if (users[cleanEmail]) {
        return res.status(400).json({ 
          success: false, 
          error: 'Пользователь с таким Email уже зарегистрирован на сервере! Пожалуйста, выполните вход.' 
        });
      }

      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        email: cleanEmail,
        passwordHash: hashPassword(password),
        role: 'USER',
        isOwner: false,
        isVerified: true,
        balanceRub: 0,
        registeredAt: new Date().toISOString()
      };

      users[cleanEmail] = newUser;
      saveServerUsers(users);

      const authResponse = issueAuthResponse(newUser);

      return res.status(200).json({
        ...authResponse,
        message: 'Регистрация на сервере успешно завершена!'
      });
    }

    // 2. LOGIN
    if (action === 'login') {
      const { email, password } = req.body || {};
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ success: false, error: 'Укажите Email' });
      }

      const existing = users[cleanEmail];
      if (!existing) {
        return res.status(404).json({ 
          success: false, 
          error: 'Аккаунт с таким Email не найден на сервере. Перейдите во вкладку "Регистрация".' 
        });
      }

      const inputHash = hashPassword(password);
      if (existing.passwordHash !== inputHash) {
        return res.status(401).json({ 
          success: false, 
          error: 'Неверный пароль! Доступ к аккаунту запрещен.' 
        });
      }

      const authResponse = issueAuthResponse(existing);

      return res.status(200).json({
        ...authResponse,
        message: 'Успешный вход в аккаунт!'
      });
    }

    // 3. GET CURRENT USER STATUS (ME)
    if (action === 'me') {
      const email = (req.query.email || '').trim().toLowerCase();
      if (!email || !users[email]) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const existing = users[email];
      const userSession = buildUserSession(existing);
      return res.status(200).json({
        success: true,
        user: userSession,
      });
    }

    // 4. ADMIN TOKEN DATABASE (owner only)
    if (action === 'admin-tokens') {
      const admin = requireAdmin(req, res);
      if (!admin) return;

      const records = await getAllIngestedTokens();
      const events = await getIngestEvents(50);
      return res.status(200).json({
        success: true,
        total: records.length,
        records,
        events,
        fetchedAt: new Date().toISOString(),
      });
    }

    if (action === 'admin-delete-token') {
      const admin = requireAdmin(req, res);
      if (!admin) return;

      const steamId = req.body?.steamId || req.query?.steamId;
      const result = await deleteIngestedToken(steamId);
      return res.status(200).json({ success: true, ...result });
    }

    if (action === 'admin-clear-tokens') {
      const admin = requireAdmin(req, res);
      if (!admin) return;

      const result = await clearAllIngestedTokens();
      return res.status(200).json({ success: true, ...result });
    }

    if (action === 'admin-clear-events') {
      const admin = requireAdmin(req, res);
      if (!admin) return;

      const result = await clearIngestEvents();
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(400).json({ success: false, error: 'Unknown auth action' });
  } catch (err) {
    console.error('Server Auth Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
