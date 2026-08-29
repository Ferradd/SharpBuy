import SteamUser from 'steam-user';
import 'lzma';

const FREE_APPIDS = new Set([
  '480', '730', '570', '440', '760', '228980', '218', '593110', '322330',
  '578080', '1172470', '1599340', '236390', '444200', '386360',
  '252950', '238960', '304930', '359550', '346110', '1085660', '1203220',
  '1097150', '1817070', '1938090', '1284210', '1286830', '1422450',
  '2250040', '223750', '2073850', '2507950', '1201240',
  '1517290', '1962663', '2357570', '291550', '753160',
  '386180', '899770', '1116170', '1665460', '552500', '813780',
  '1449850'
]);

function iconUrls(appid, apiIcon) {
  const id = String(appid);
  const urls = [];
  if (apiIcon) {
    if (apiIcon.startsWith('http')) urls.push(apiIcon);
    else urls.push(`https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${id}/${apiIcon}.jpg`);
  }
  urls.push(
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/logo.png`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/logo.png`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${id}/logo.png`
  );
  return [...new Set(urls.filter(Boolean))];
}

function isFreeGame(appid, name) {
  const id = String(appid);
  if (FREE_APPIDS.has(id)) return true;
  const lower = (name || '').toLowerCase();
  if (/^spacewar$/i.test(name)) return true;
  if (/steam (screenshots|works|link|broadcasting)/i.test(name)) return true;
  if (/\bdemo\b/i.test(lower) && !/\bdemo squad\b/i.test(lower)) return true;
  if (/\bplaytest\b/i.test(lower)) return true;
  if (/\bfree$/i.test(lower.trim())) return true;
  if (/^counter-strike 2$/i.test(name)) return true;
  if (/^dota 2$/i.test(name)) return true;
  if (/^team fortress 2$/i.test(name)) return true;
  if (/^apex legends$/i.test(name)) return true;
  if (/^pubg:? battlegrounds$/i.test(name)) return true;
  if (/^warface$/i.test(name)) return true;
  if (/^deadlock$/i.test(name)) return true;
  if (/^crosshair v2$/i.test(name)) return true;
  return false;
}

function cs2Hours(allGames) {
  const cs2 = allGames.find(
    (g) => g.appid === '730' || /counter-strike 2/i.test(g.name || '')
  );
  return cs2 ? cs2.hours : 0;
}

function mapGame(g) {
  const appid = String(g.appid);
  const icons = iconUrls(appid, g.img_icon_url);
  return {
    appid,
    name: g.name || `App ${appid}`,
    hours: Number(((g.playtime_forever || 0) / 60).toFixed(1)),
    iconUrl: icons[0],
    iconFallbacks: icons.slice(1)
  };
}

function buildResponse(steamid, allRaw, method, extra = {}) {
  const allGames = allRaw.map(mapGame);
  const paidGames = allGames
    .filter((g) => !isFreeGame(g.appid, g.name))
    .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name, 'en'));

  return {
    success: true,
    method,
    steamid,
    gameCount: paidGames.length,
    totalGameCount: allGames.length,
    paidGameCount: paidGames.length,
    cs2Hours: cs2Hours(allGames),
    games: paidGames,
    ...extra
  };
}

async function fetchViaSteamUser(refreshToken, steamid) {
  return new Promise((resolve) => {
    const client = new SteamUser({
      promptSteamGuardCode: false,
      autoRelogin: false,
      singleSentryfile: true,
      dataDirectory: null,
      protocol: SteamUser.EConnectionProtocol.WebSocket
    });

    const timer = setTimeout(() => {
      try { client.logOff(); } catch {}
      resolve(null);
    }, 22000);

    client.logOn({ refreshToken });

    client.on('loggedOn', async () => {
      clearTimeout(timer);
      try {
        const owned = await client.getUserOwnedApps(client.steamID, {
          includePlayedFreeGames: true,
          includeAppInfo: true,
          includeFreeSub: false
        });
        client.logOff();
        resolve(buildResponse(steamid, owned.apps || [], 'steam_cm'));
      } catch {
        try { client.logOff(); } catch {}
        resolve(null);
      }
    });

    client.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

async function fetchViaPublicProfile(steamid) {
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    if (res.status !== 200) return null;

    const html = await res.text();
    const gamesMap = new Map();

    const blocks = html.split('<div class="recent_game">').slice(1);
    for (const block of blocks) {
      const nameMatch = block.match(/class="game_name">\s*<a[^>]*>([^<]+)<\/a>/i);
      const appidMatch =
        block.match(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/i) ||
        block.match(/app\/(\d+)/i);
      const hoursMatch = block.match(/([0-9.,]+)\s*hrs on record/i);

      if (nameMatch) {
        const name = nameMatch[1].trim();
        const appid = appidMatch ? appidMatch[1] : '0';
        const rawHours = hoursMatch ? parseFloat(hoursMatch[1].replace(/,/g, '')) : 0;
        const hours = isNaN(rawHours) ? 0 : rawHours;
        gamesMap.set(appid, {
          appid,
          name,
          playtime_forever: hours * 60,
          img_icon_url: null
        });
      }
    }

    const raw = [...gamesMap.values()];
    if (raw.length === 0) return null;

    return buildResponse(steamid, raw, 'public_profile', {
      partial: true,
      note: 'Показаны только публичные данные профиля (неполный список)'
    });
  } catch {
    return null;
  }
}

export async function fetchAccountLibrary(rawToken) {
  const cleanToken = (rawToken || '').trim();
  if (!cleanToken) {
    return { success: false, error: 'Token missing' };
  }

  const parts = cleanToken.split('----');
  const steamid = parts[0];
  const refreshToken = parts[1] || parts[0];

  const cmResult = await fetchViaSteamUser(refreshToken, steamid);
  if (cmResult) return cmResult;

  const publicResult = await fetchViaPublicProfile(steamid);
  if (publicResult) return publicResult;

  return {
    success: false,
    steamid,
    error: 'Не удалось получить библиотеку игр (токен недоступен или профиль закрыт)'
  };
}
