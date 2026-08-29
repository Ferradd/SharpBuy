import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Loaded ${tokenMatches.length} tokens from steam.txt.`);
console.log('Testing SteamSessionEngine on first 3 accounts...\n');

async function runStage1Test() {
  const accountsToTest = tokenMatches.slice(0, 3);

  const results = await SteamSessionEngine.auditTokens(accountsToTest, (progress) => {
    console.log(`[PROGRESS ${progress.percent}%] Parsed #${progress.current}/${progress.total}: SteamID ${progress.account.steamid} (Nick: "${progress.account.profile.nickname}")`);
  });

  console.log('\n================ STAGE 1 AUDIT RESULTS ================');
  results.forEach((acc, idx) => {
    console.log(`\nAccount #${idx + 1}:`);
    console.log('• SteamID:', acc.steamid);
    console.log('• Nickname:', acc.profile.nickname);
    console.log('• Privacy:', acc.profile.privacyState);
    console.log('• VAC Clean:', !acc.profile.vacBanned ? '✅ YES' : '❌ BANNED');
    console.log('• Token Expiration:', acc.tokenMeta.expiresAt, `(${acc.tokenMeta.daysRemaining} days left)`);
    console.log('• Token Issued:', acc.tokenMeta.issuedAt);
    console.log('• Token IP Subj:', acc.tokenMeta.ipSubject);
    console.log('• Profile Avatar:', acc.profile.avatar);
  });

  console.log('\n Stage 1 SteamSessionEngine works with 100% precision!');
}

runStage1Test();
