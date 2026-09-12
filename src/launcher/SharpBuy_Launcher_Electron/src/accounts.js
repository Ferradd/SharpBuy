const fs = require('fs');
const path = require('path');
const os = require('os');

const MAX_ACCOUNTS = 500;

function appDir() {
  return path.join(os.homedir(), 'Library/Application Support/SharpBuy_Launcher');
}

function accountsPath() {
  return path.join(appDir(), 'accounts.json');
}

function gamesCachePath() {
  return path.join(appDir(), 'games_cache.json');
}

function ensureDir() {
  fs.mkdirSync(appDir(), { recursive: true });
}

function loadAccounts() {
  ensureDir();
  const file = accountsPath();
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function saveAccounts(accounts) {
  ensureDir();
  fs.writeFileSync(accountsPath(), JSON.stringify(accounts, null, 2), 'utf8');
}

function getSavedAccountsJson() {
  return JSON.stringify(loadAccounts());
}

function upsertAccount(entry) {
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.SteamId === entry.SteamId);
  if (idx !== -1) {
    accounts[idx] = entry;
  } else {
    if (accounts.length >= MAX_ACCOUNTS) {
      accounts.shift();
    }
    accounts.push(entry);
  }
  saveAccounts(accounts);
}

function deleteAccount(steamId) {
  const accounts = loadAccounts().filter((a) => a.SteamId !== steamId);
  saveAccounts(accounts);
}

function clearAll() {
  saveAccounts([]);
}

function getCachedGamesJson() {
  ensureDir();
  const file = gamesCachePath();
  if (!fs.existsSync(file)) return '{}';
  try {
    const raw = fs.readFileSync(file, 'utf8');
    JSON.parse(raw);
    return raw;
  } catch (_) {
    return '{}';
  }
}

function saveCachedGames(json) {
  ensureDir();
  try {
    JSON.parse(json || '{}');
  } catch (_) {
    return;
  }
  fs.writeFileSync(gamesCachePath(), json, 'utf8');
}

function makeAccount({
  steamId,
  accountName,
  personaName,
  avatarUrl,
  token,
  addedAt,
  warrantyExpiresAt = 0,
  expSeconds,
  lastCheckedAt = 0,
  isAlive = true,
  statusMessage = '',
  vacBanned = '0',
}) {
  return {
    SteamId: steamId,
    AccountName: accountName,
    PersonaName: personaName,
    AvatarUrl: avatarUrl,
    Token: token,
    AddedAt: addedAt,
    WarrantyExpiresAt: warrantyExpiresAt,
    ExpSeconds: expSeconds,
    LastCheckedAt: lastCheckedAt,
    IsAlive: isAlive,
    StatusMessage: statusMessage,
    VacBanned: vacBanned,
  };
}

module.exports = {
  MAX_ACCOUNTS,
  loadAccounts,
  saveAccounts,
  getSavedAccountsJson,
  upsertAccount,
  deleteAccount,
  clearAll,
  getCachedGamesJson,
  saveCachedGames,
  makeAccount,
};
