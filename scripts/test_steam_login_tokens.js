import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log(`========================================================================`);
console.log(`  🔑 ПРОВЕРКА ВАЛИДНОСТИ STEAM REFRESH TOKENS ЧЕРЕЗ API STEAM LOGIN (${allTokens.length} шт.)`);
console.log(`========================================================================\n`);

async function testSteamRefreshToken(tokenStr, i) {
  const [steamid, refreshToken] = tokenStr.split('----');

  const parts = refreshToken.split('.');
  let payload = {};
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (e) {}

  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = payload.exp || 0;
  const isJwtExpired = expSec < nowSec;
  const daysLeft = Math.round((expSec - nowSec) / 86400);

  // 1. Test Refresh Token with Steam Login API
  let isSteamSessionValid = false;
  let errorMsg = '';

  try {
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);

    const res = await fetch('https://login.steampowered.com/jwt/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Origin': 'https://steamcommunity.com',
        'Referer': 'https://steamcommunity.com/'
      },
      body: params.toString()
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.access_token || data.response?.access_token)) {
      isSteamSessionValid = true;
    } else if (data && data.error) {
      errorMsg = data.error;
    } else {
      errorMsg = `HTTP ${res.status}`;
    }
  } catch (err) {
    errorMsg = err.message;
  }

  // 2. Fetch live profile
  let nickname = 'Unknown';
  let isCommunityBanned = false;
  try {
    const profRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/`);
    const html = await profRes.text();
    const nameMatch = html.match(/<span class="actual_persona_name">([^<]+)<\/span>/);
    if (nameMatch) nickname = nameMatch[1];
    if (html.includes('Community Banned') || html.includes('блокировка сообщества')) {
      isCommunityBanned = true;
    }
  } catch (e) {}

  let status = '🟢 100% ВАЛИДЕН (ВХОД РАБОТАЕТ)';
  if (isCommunityBanned) status = '🔴 БАН СООБЩЕСТВА';
  else if (isJwtExpired) status = '❌ ИСТЕК СРОК JWT';
  else if (!isSteamSessionValid && errorMsg) status = `❌ НЕВАЛИДЕН (${errorMsg})`;

  return {
    index: i + 1,
    steamid,
    nickname,
    daysLeft,
    isSteamSessionValid,
    isCommunityBanned,
    status
  };
}

async function runTest() {
  const results = [];

  for (let i = 0; i < allTokens.length; i++) {
    const r = await testSteamRefreshToken(allTokens[i], i);
    results.push(r);
    console.log(`[#${r.index}/${allTokens.length}] SteamID: ${r.steamid} | "${r.nickname}"`);
    console.log(`    • Срок JWT: ${r.daysLeft} дней осталось`);
    console.log(`    • Steam Login API: ${r.isSteamSessionValid ? '✅ Сессия успешно получена' : '❌ Ошибка'}`);
    console.log(`    • Бан сообщества: ${r.isCommunityBanned ? '⛔ ДА' : '✅ НЕТ'}`);
    console.log(`    • СТАТУС: ${r.status}\n`);

    await new Promise(r => setTimeout(r, 400));
  }

  const valid = results.filter(r => r.isSteamSessionValid && !r.isCommunityBanned);
  const invalid = results.filter(r => !r.isSteamSessionValid || r.isCommunityBanned);

  console.log(`========================================================================`);
  console.log(`📊 ИТОГИ ПРОВЕРКИ ВСЕХ ТОКЕНОВ В БАЗЕ:`);
  console.log(`========================================================================`);
  console.log(`🟢 ПОЛНОСТЬЮ РАБОЧИЕ И ВАЛИДНЫЕ: ${valid.length} шт.`);
  console.log(`🔴 МЕРТВЫЕ / СБРОШЕННЫЕ / БАН:    ${invalid.length} шт.`);
  console.log(`========================================================================\n`);

  if (invalid.length > 0) {
    console.log(`❌ Невалидные аккаунты:`);
    for (const inv of invalid) {
      console.log(`   • ${inv.steamid} (${inv.nickname}): ${inv.status}`);
    }
  }
}

runTest();
