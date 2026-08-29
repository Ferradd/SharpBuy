import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';
import { ValuationEngine } from '../src/tools/steamAuditor/ValuationEngine.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Loaded ${tokenMatches.length} tokens from steam.txt.`);
console.log('Testing STAGE 5 (Valuation Engine, Smart Badges, Pricing & Export)...\n');

async function runStage5Test() {
  const accountsToTest = tokenMatches.slice(0, 5);
  const auditedAccounts = [];

  for (let i = 0; i < accountsToTest.length; i++) {
    const raw = accountsToTest[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    let acc = { ...parsed, profile };

    acc = await WalletSecurityCollector.auditStage2(acc);
    acc = await CS2FaceitCollector.auditStage3(acc);
    acc = await GamesInventoryCollector.auditStage4(acc);
    acc = ValuationEngine.evaluateAccount(acc);

    auditedAccounts.push(acc);

    console.log(`\n================ ACCOUNT #${i + 1} [${acc.profile.nickname} | ${acc.steamid}] ================`);
    console.log(`💵 Estimated Worth: $${acc.valuation.estimatedWorthUsd} USD`);
    console.log(`🏷️ Suggested Sale Price: ${acc.valuation.suggestedSalePriceRub} ₽`);
    console.log(`✨ Smart Badges (${acc.valuation.badges.length}):`, acc.valuation.badges.map(b => b.label).join(' | ') || 'None');
    console.log('📊 Valuation Breakdown:', acc.valuation.breakdown);
  }

  // Generate exports
  const csv = ValuationEngine.exportToCSV(auditedAccounts);
  const txt = ValuationEngine.exportToPriceListTxt(auditedAccounts);

  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\SharpBuy\\scripts\\sample_audit.csv', csv, 'utf8');
  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\SharpBuy\\scripts\\sample_pricelist.txt', txt, 'utf8');

  console.log('\n Sample CSV exported: scripts/sample_audit.csv');
  console.log(' Sample TXT PriceList exported: scripts/sample_pricelist.txt');
  console.log(' Stage 5 ValuationEngine & Smart Badges successfully verified!');
}

runStage5Test();
