const accounts = require('./accounts');

const API_BASE = 'https://sharpbuy.org/api';
const DEFAULT_AVATAR =
  'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';

async function httpPostJson(url, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSteamProfile(steamId) {
  if (!steamId || steamId.length < 10) {
    return { persona: steamId, avatar: DEFAULT_AVATAR, vac: '0' };
  }

  const url = `https://steamcommunity.com/profiles/${steamId}?xml=1`;
  try {
    const res = await fetch(url);
    const xml = await res.text();

    const nameMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
    const avatarMatch = xml.match(/<avatarMedium><!\[CDATA\[(.*?)\]\]><\/avatarMedium>/);
    const vacMatch = xml.match(/<vacBanned>(\d+)<\/vacBanned>/);

    return {
      persona: nameMatch ? nameMatch[1] : steamId,
      avatar: avatarMatch ? avatarMatch[1] : DEFAULT_AVATAR,
      vac: vacMatch ? vacMatch[1] : '0',
    };
  } catch (_) {
    return { persona: steamId, avatar: DEFAULT_AVATAR, vac: '0' };
  }
}

async function saveAccountFromToken(steamId, accountName, tokenInput, parsed) {
  const fullToken = tokenInput.includes('----') ? tokenInput : `${parsed.steamId}----${tokenInput}`;
  const profile = await fetchSteamProfile(steamId);
  const now = Math.floor(Date.now() / 1000);

  accounts.upsertAccount(
    accounts.makeAccount({
      steamId,
      accountName: accountName || parsed.accountName,
      personaName: profile.persona,
      avatarUrl: profile.avatar,
      token: fullToken,
      addedAt: now,
      expSeconds: parsed.secondsRemaining,
      vacBanned: profile.vac,
    })
  );
}

async function checkAccountLive(rawToken, steamId) {
  try {
    return await httpPostJson(`${API_BASE}/steam-verify`, { token: rawToken, steamId });
  } catch (e) {
    return JSON.stringify({ isAlive: false, reason: e.message || String(e) });
  }
}

async function getAccountLibrary(rawToken) {
  try {
    return await httpPostJson(`${API_BASE}/account-library`, { token: rawToken });
  } catch (e) {
    return JSON.stringify({ error: e.message || String(e), games: [] });
  }
}

async function refreshAllWarranties() {
  const list = accounts.loadAccounts();
  let changed = false;

  for (const acc of list) {
    try {
      const res = await httpPostJson(`${API_BASE}/warranty-check`, { token: acc.Token });
      const v = JSON.parse(res);
      if (v.expiresAtUnix != null) {
        acc.WarrantyExpiresAt = v.expiresAtUnix;
        changed = true;
      }
    } catch (_) {}
  }

  if (changed) accounts.saveAccounts(list);
  return changed;
}

async function refreshAllProfiles() {
  const list = accounts.loadAccounts();
  let changed = false;

  for (const acc of list) {
    const p = await fetchSteamProfile(acc.SteamId);
    if (p.persona !== acc.PersonaName || p.avatar !== acc.AvatarUrl) {
      acc.PersonaName = p.persona;
      acc.AvatarUrl = p.avatar;
      acc.VacBanned = p.vac;
      changed = true;
    }
  }

  if (changed) accounts.saveAccounts(list);
  return changed;
}

module.exports = {
  fetchSteamProfile,
  saveAccountFromToken,
  checkAccountLive,
  getAccountLibrary,
  refreshAllWarranties,
  refreshAllProfiles,
};
