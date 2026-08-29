import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';
import { ValuationEngine } from '../src/tools/steamAuditor/ValuationEngine.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Auditing ${tokenMatches.length} accounts through full backend pipeline...`);

async function fullAuditBackend() {
  for (let i = 0; i < Math.min(5, tokenMatches.length); i++) {
    const raw = tokenMatches[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    let acc = { ...parsed, profile };

    acc = await WalletSecurityCollector.auditStage2(acc);
    acc = await CS2FaceitCollector.auditStage3(acc);
    acc = await GamesInventoryCollector.auditStage4(acc);
    acc = ValuationEngine.evaluateAccount(acc);

    console.log(`\n[Account #${i+1}] SteamID: ${acc.steamid} | Nick: "${acc.profile.nickname}" | Avatar: ${acc.profile.avatar ? 'YES' : 'NO'}`);
    console.log(`   VAC: ${acc.security.vacBanned ? 'BANNED' : 'CLEAN'} | Limited: ${acc.security.isLimited ? 'YES' : 'NO'}`);
    console.log(`   CS2 Items: ${acc.cs2.totalItems} | Inv: $${acc.cs2.inventoryWorthUsd} | Medals: ${acc.cs2.medalsCount}`);
    console.log(`   Games: ${acc.games.totalGamesCount} | Hours CS2: ${acc.games.hoursByGame.cs2}h`);
    console.log(`   Worth: $${acc.valuation.estimatedWorthUsd} | Price: ${acc.valuation.suggestedSalePriceRub} ₽`);
  }
}

fullAuditBackend();
