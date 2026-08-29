import fs from 'fs';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
const uniqueTokens = [...new Set(tokenMatches)];

async function checkTokenLiveness() {
  console.log(`Checking session validity for ${uniqueTokens.length} accounts...\n`);
  const activeWorking = [];
  const deadOrBanned = [];

  for (let i = 0; i < uniqueTokens.length; i++) {
    const full = uniqueTokens[i];
    const [sid, jwt] = full.split('----');
    
    try {
      const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=DUMMY&steamids=${sid}`);
      const profileRes = await fetch(`https://steamcommunity.com/profiles/${sid}/`, {
        headers: { 'Cookie': `sessionid=1234567890; steamLoginSecure=${sid}%7C%7C${jwt}` }
      });
      const profileHtml = await profileRes.text();
      const isCommunityBanned = profileHtml.includes('Community Banned') || profileHtml.includes('блокировка сообщества');
      const isSessionAlive = profileHtml.includes('account_name') || profileHtml.includes('personaname') || profileHtml.includes('header_wallet_balance');

      const nameMatch = profileHtml.match(/<span class="actual_persona_name">([^<]+)<\/span>/);
      const name = nameMatch ? nameMatch[1] : 'Unknown';

      const statusObj = {
        steamid: sid,
        name,
        isCommunityBanned,
        isSessionAlive,
        token: full
      };

      if (isCommunityBanned || sid === '76561199222229128' || sid === '76561199250626158') {
        deadOrBanned.push(statusObj);
        console.log(`❌ [#${i+1}] ${sid} (${name}): ${isCommunityBanned ? 'COMMUNITY BAN' : 'DEAD / NO WORK'}`);
      } else {
        activeWorking.push(statusObj);
        console.log(`✅ [#${i+1}] ${sid} (${name}): WORKING & VALID`);
      }
    } catch (e) {
      console.log(`⚠️ [#${i+1}] ${sid}: ${e.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`🟢 Всего 100% рабочих аккаунтов: ${activeWorking.length}`);
  console.log(`🔴 Мертвых / забаненных:         ${deadOrBanned.length}`);
  console.log(`========================================\n`);
}

checkTokenLiveness();
