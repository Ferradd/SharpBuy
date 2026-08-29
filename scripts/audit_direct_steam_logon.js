import SteamUser from 'steam-user';
import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');
const allTokens = [...new Set(steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [])];

console.log(`========================================================================`);
console.log(`  🚀 ПРЯМОЙ ВХОД В СЕТЬ STEAM VALVE ДЛЯ ВСЕХ ${allTokens.length} АККАУНТОВ`);
console.log(`========================================================================\n`);

async function testLogon(tokenStr, i) {
  const [steamid, refreshToken] = tokenStr.split('----');
  
  return new Promise((resolve) => {
    const client = new SteamUser();
    let isHandled = false;

    const timer = setTimeout(() => {
      if (isHandled) return;
      isHandled = true;
      try { client.logOff(); } catch (e) {}
      console.log(`⏱️ [#${i+1}/${allTokens.length}] ${steamid}: ТАЙМАУТ СЕТИ`);
      resolve({ steamid, status: 'TIMEOUT' });
    }, 6000);

    client.logOn({ refreshToken });

    client.on('loggedOn', (details) => {
      if (isHandled) return;
      isHandled = true;
      clearTimeout(timer);
      console.log(`✅ [#${i+1}/${allTokens.length}] ${steamid}: 🟢 ВХОД В STEAM УСПЕШЕН (ПРЯМОЙ LOGON В СЕТЬ VALVE)!`);
      try { client.logOff(); } catch (e) {}
      resolve({ steamid, success: true, status: 'LOGON_SUCCESS', details });
    });

    client.on('error', (err) => {
      if (isHandled) return;
      isHandled = true;
      clearTimeout(timer);
      const isDenied = err.eresult === 15 || err.message.includes('AccessDenied');
      const isPass = err.eresult === 5 || err.message.includes('InvalidPassword');
      const isExpired = err.eresult === 85 || err.message.includes('Expired');

      let reason = err.message;
      if (isDenied) reason = 'AccessDenied (Требуется Desktop Launcher / привязан к лаунчеру)';
      else if (isPass) reason = 'InvalidPassword / Сброшен владельцем';
      else if (isExpired) reason = 'Token Expired';

      console.log(`⚠️ [#${i+1}/${allTokens.length}] ${steamid}: ${reason} (EResult: ${err.eresult})`);
      resolve({ steamid, success: false, status: err.message, eresult: err.eresult, reason });
    });
  });
}

async function runCompleteLogonAudit() {
  const results = [];
  for (let i = 0; i < allTokens.length; i++) {
    const res = await testLogon(allTokens[i], i);
    results.push(res);
    await new Promise(r => setTimeout(r, 400));
  }

  const directSuccess = results.filter(r => r.success);
  const launcherRequired = results.filter(r => r.eresult === 15);
  const deadAccounts = results.filter(r => r.eresult !== 15 && !r.success);

  console.log(`\n========================================================================`);
  console.log(`📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ПРЯМОГО ВХОДА В СЕТЬ STEAM (VALVE CM):`);
  console.log(`========================================================================`);
  console.log(`🟢 ПРЯМОЙ ВХОД БЕЗ ОГРАНИЧЕНИЙ (Успешно подключились): ${directSuccess.length} шт.`);
  console.log(`🟡 ВХОД ЧЕРЕЗ ЛАУНЧЕР (AccessDenied по API, вход через Launcher): ${launcherRequired.length} шт.`);
  console.log(`🔴 МЕРТВЫЕ / СБРОШЕННЫЕ СЕССИИ:                         ${deadAccounts.length} шт.`);
  console.log(`========================================================================\n`);
}

runCompleteLogonAudit();
