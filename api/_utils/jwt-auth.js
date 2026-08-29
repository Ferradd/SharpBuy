import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'sharpbuy_secure_auth_secret_jwt_key_2026_x89a';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'iliykuzin2@gmail.com').trim().toLowerCase();

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64').toString('utf8');
}

export function signJwt(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  }));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expected = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAdminPayload(payload) {
  if (!payload?.email) return false;
  const email = String(payload.email).trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return false;
  return payload.role === 'OWNER' || payload.isOwner === true;
}

export function getAdminEmail() {
  return ADMIN_EMAIL;
}

export function extractBearerToken(req) {
  const auth = req.headers?.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return '';
}

export function requireAdmin(req, res) {
  const token = extractBearerToken(req);
  const payload = verifyJwt(token);
  if (!payload || !isAdminPayload(payload)) {
    res.status(403).json({ success: false, error: 'Доступ запрещён. Только владелец магазина.' });
    return null;
  }
  return payload;
}
