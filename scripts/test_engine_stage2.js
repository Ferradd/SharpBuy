import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Loaded ${tokenMatches.length} tokens from steam.txt.`);
console.log('Testing STAGE 2 (Wallet, Points, Security & Bans) on first 5 accounts...\n');

async function runStage2Test() {
  const accountsToTest = tokenMatches.slice(0, 5);

  for (let i = 0; i < accountsToTest.length; i++) {
    const raw = accountsToTest[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    const accountWithProfile = { ...parsed, profile };

    const stage2Result = await WalletSecurityCollector.auditStage2(accountWithProfile);

    console.log(`\n================ ACCOUNT #${i + 1} [SteamID: ${stage2Result.steamid}] ================`);
    console.log('👤 Profile:');
    console.log(`   • Nickname: "${stage2Result.profile.nickname}"`);
    console.log(`   • Country/Location: ${stage2Result.security.country}`);
    console.log(`   • Member Since: ${stage2Result.security.memberSince || 'N/A'}`);
    console.log(`   • Account Age: ${stage2Result.security.accountAgeYears} years old`);

    console.log('🛡️ Security & Bans:');
    console.log(`   • Safety Status: ${stage2Result.security.safetyStatus === 'CLEAN' ? '✅ CLEAN' : '⚠️ ' + stage2Result.security.safetyStatus}`);
    console.log(`   • VAC Banned: ${stage2Result.security.vacBanned ? '❌ BANNED' : '✅ NO'}`);
    console.log(`   • Trade Ban State: ${stage2Result.security.tradeBanState}`);
    console.log(`   • Limited Account ($5): ${stage2Result.security.isLimited ? '⚠️ LIMITED' : '✅ NO-LIMIT (Full)'}`);

    console.log('💰 Wallet & Points:');
    console.log(`   • Wallet Balance: ${stage2Result.wallet.formattedBalance}`);
    console.log(`   • Steam Points: ${stage2Result.wallet.points.toLocaleString()} pts`);
    console.log(`   • Estimated Points Worth: $${stage2Result.wallet.pointsWorthUsd} (~${stage2Result.wallet.pointsWorthRub} ₽)`);
  }

  console.log('\n Stage 2 WalletSecurityCollector successfully verified on all test accounts!');
}

runStage2Test();
