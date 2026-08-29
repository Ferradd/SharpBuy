/**
 * SharpBuy — Collect full game libraries for all accounts in steam.txt
 * Output: C:\Users\iliyk\Desktop\steam_libraries.txt (+ JSON backup)
 */

import fs from 'fs';
import SteamUser from 'steam-user';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';

const STEAM_TXT = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const OUTPUT_TXT = 'C:\\Users\\iliyk\\Desktop\\steam_libraries.txt';
const OUTPUT_JSON = 'C:\\Users\\iliyk\\Desktop\\steam_libraries.json';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function logonAndGetGames(refreshToken, steamid, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const client = new SteamUser({
      promptSteamGuardCode: false,
      autoRelogin: false,
      singleSentryfile: true,
      dataDirectory: null,
      protocol: SteamUser.EConnectionProtocol.WebSocket
    });

    let finished = false;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try {
        client.logOff();
      } catch {
        /* ignore */
      }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ ok: false, reason: 'Timeout' });
    }, timeoutMs);

    try {
      client.logOn({ refreshToken });

      client.on('loggedOn', async () => {
        try {
          const owned = await client.getUserOwnedApps(client.steamID, {
            includePlayedFreeGames: true,
            includeAppInfo: true,
            includeFreeSub: true
          });

          const games = (owned.apps || [])
            .map((g) => ({
              appid: String(g.appid),
              name: g.name || `App ${g.appid}`,
              hours: Number(((g.playtime_forever || 0) / 60).toFixed(1))
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'en'));

          finish({
            ok: true,
            method: 'steam_cm',
            gameCount: owned.app_count ?? games.length,
            games
          });
        } catch (err) {
          finish({ ok: false, reason: err.message });
        }
      });

      client.on('error', (err) => {
        finish({
          ok: false,
          reason: err.message,
          eresult: err.eresult,
          dead: err.eresult === 15 || err.message === 'AccessDenied'
        });
      });
    } catch (err) {
      finish({ ok: false, reason: err.message });
    }
  });
}

async function collectViaPublicProfile(steamid) {
  const data = await GamesInventoryCollector.collectGamesLibrary(steamid);
  return {
    ok: data.allGames.length > 0 || data.totalGamesCount > 0,
    method: 'public_profile',
    gameCount: data.totalGamesCount || data.allGames.length,
    games: data.allGames
      .map((g) => ({
        appid: String(g.appid),
        name: g.name,
        hours: g.hours || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
    note: 'Только публичные данные (неполный список)'
  };
}

async function collectAccountLibrary(tokenLine, index, total) {
  const parsed = SteamSessionEngine.parseToken(tokenLine);
  if (!parsed) {
    return {
      index,
      steamid: 'UNKNOWN',
      nickname: null,
      status: 'error',
      error: 'Invalid token format',
      gameCount: 0,
      games: []
    };
  }

  const { steamid, jwt: refreshToken, tokenMeta } = parsed;
  console.log(`[${index}/${total}] ${steamid} ...`);

  const profile = await SteamSessionEngine.fetchLiveProfile(steamid);
  const nickname = profile.nickname !== 'Unknown' ? profile.nickname : null;

  const cmResult = await logonAndGetGames(refreshToken, steamid);

  if (cmResult.ok) {
    return {
      index,
      steamid,
      nickname,
      profileUrl: `https://steamcommunity.com/profiles/${steamid}/`,
      tokenValid: true,
      tokenExpiresAt: tokenMeta?.expiresAt || null,
      tokenDaysRemaining: tokenMeta?.daysRemaining,
      profilePublic: profile.isPublic,
      status: 'ok',
      method: cmResult.method,
      gameCount: cmResult.gameCount,
      games: cmResult.games
    };
  }

  const publicResult = await collectViaPublicProfile(steamid);

  if (publicResult.ok) {
    return {
      index,
      steamid,
      nickname,
      profileUrl: `https://steamcommunity.com/profiles/${steamid}/`,
      tokenValid: !cmResult.dead,
      tokenExpiresAt: tokenMeta?.expiresAt || null,
      tokenDaysRemaining: tokenMeta?.daysRemaining,
      profilePublic: profile.isPublic,
      status: 'partial',
      method: publicResult.method,
      gameCount: publicResult.games.length,
      profileGamesCount: publicResult.gameCount,
      games: publicResult.games,
      warning: cmResult.dead
        ? `Токен мёртв (${cmResult.reason}). Показаны только публичные данные — список неполный.`
        : `CM-логин не удался (${cmResult.reason}). Показаны только публичные данные — список неполный.`
    };
  }

  return {
    index,
    steamid,
    nickname,
    profileUrl: `https://steamcommunity.com/profiles/${steamid}/`,
    tokenValid: false,
    tokenExpiresAt: tokenMeta?.expiresAt || null,
    tokenDaysRemaining: tokenMeta?.daysRemaining,
    profilePublic: profile.isPublic,
    status: 'error',
    error: cmResult.dead
      ? `Токен мёртв: ${cmResult.reason}`
      : cmResult.reason,
    gameCount: 0,
    games: []
  };
}

function formatTxtReport(accounts, generatedAt) {
  const lines = [];
  lines.push('='.repeat(80));
  lines.push('  SHARPBUY — STEAM GAME LIBRARIES (БИБЛИОТЕКА ИГР ПО АККАУНТАМ)');
  lines.push(`  Источник: ${STEAM_TXT}`);
  lines.push(`  Дата сбора: ${generatedAt}`);
  lines.push(`  Всего аккаунтов: ${accounts.length}`);
  lines.push('='.repeat(80));
  lines.push('');

  let totalGames = 0;
  let okCount = 0;

  for (const acc of accounts) {
    lines.push('-'.repeat(80));
    lines.push(`АККАУНТ #${acc.index} | SteamID: ${acc.steamid}`);
    if (acc.nickname) lines.push(`Ник: ${acc.nickname}`);
    lines.push(`Профиль: ${acc.profileUrl}`);
    if (acc.tokenExpiresAt) {
      lines.push(`Токен до: ${acc.tokenExpiresAt} (${acc.tokenDaysRemaining ?? '?'} дн.)`);
    }

    if (acc.status === 'ok') {
      okCount++;
      totalGames += acc.gameCount;
      lines.push(`Статус: OK — полная библиотека (${acc.method})`);
      lines.push(`ИГР НА АККАУНТЕ: ${acc.gameCount}`);
      lines.push('');
      lines.push('Список игр:');
      acc.games.forEach((g, i) => {
        const hours = g.hours > 0 ? ` — ${g.hours} ч.` : '';
        lines.push(`  ${String(i + 1).padStart(3, ' ')}. ${g.name} [${g.appid}]${hours}`);
      });
    } else if (acc.status === 'partial') {
      totalGames += acc.gameCount;
      lines.push(`Статус: ЧАСТИЧНО — ${acc.warning}`);
      const profileHint = acc.profileGamesCount ? ` (на профиле указано ~${acc.profileGamesCount})` : '';
      lines.push(`ИГР (видно публично): ${acc.gameCount}${profileHint}`);
      lines.push('');
      lines.push('Список игр (неполный):');
      acc.games.forEach((g, i) => {
        const hours = g.hours > 0 ? ` — ${g.hours} ч.` : '';
        lines.push(`  ${String(i + 1).padStart(3, ' ')}. ${g.name} [${g.appid}]${hours}`);
      });
    } else {
      lines.push(`Статус: ОШИБКА — ${acc.error}`);
      lines.push('ИГР НА АККАУНТЕ: 0 (не удалось получить)');
    }
    lines.push('');
  }

  lines.push('='.repeat(80));
  lines.push('  ИТОГО');
  lines.push(`  Полная библиотека: ${okCount}/${accounts.length} аккаунтов`);
  lines.push(`  Суммарно игр (без дедупликации): ${totalGames}`);
  lines.push('='.repeat(80));

  return lines.join('\n');
}

async function main() {
  const steamTxt = fs.readFileSync(STEAM_TXT, 'utf8');
  const tokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

  if (tokens.length === 0) {
    console.error('No tokens found in steam.txt');
    process.exit(1);
  }

  console.log(`Found ${tokens.length} accounts in steam.txt\n`);

  const accounts = [];
  for (let i = 0; i < tokens.length; i++) {
    const result = await collectAccountLibrary(tokens[i], i + 1, tokens.length);
    accounts.push(result);
    const label =
      result.status === 'ok'
        ? `${result.gameCount} games (full)`
        : result.status === 'partial'
          ? `${result.gameCount} games (partial)`
          : `ERROR: ${result.error}`;
    console.log(`  -> ${label}`);
    await sleep(1200);
  }

  const generatedAt = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Kyiv' });
  const report = {
    generatedAt,
    sourceFile: STEAM_TXT,
    totalAccounts: accounts.length,
    accounts
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(OUTPUT_TXT, formatTxtReport(accounts, generatedAt), 'utf8');

  console.log('\nDone!');
  console.log(`TXT:  ${OUTPUT_TXT}`);
  console.log(`JSON: ${OUTPUT_JSON}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
