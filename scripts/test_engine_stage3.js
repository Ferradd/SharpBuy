import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Loaded ${tokenMatches.length} tokens from steam.txt.`);
console.log('Testing STAGE 3 (CS2 Inventory, Medals, Knives, Cases & Faceit) on top 5 accounts...\n');

async function runStage3Test() {
  const accountsToTest = tokenMatches.slice(0, 5);

  for (let i = 0; i < accountsToTest.length; i++) {
    const raw = accountsToTest[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    let acc = { ...parsed, profile };

    acc = await WalletSecurityCollector.auditStage2(acc);
    acc = await CS2FaceitCollector.auditStage3(acc);

    console.log(`\n================ ACCOUNT #${i + 1} [${acc.profile.nickname} | ${acc.steamid}] ================`);
    console.log('🎖️ CS2 Inventory & Medals:');
    console.log(`   • Public Inventory: ${acc.cs2.isInventoryPublic ? '✅ YES' : '🔒 PRIVATE / EMPTY'}`);
    console.log(`   • Total Items: ${acc.cs2.totalItems}`);
    console.log(`   • Total Inventory Worth: $${acc.cs2.inventoryWorthUsd} (~${acc.cs2.inventoryWorthRub} ₽)`);
    console.log(`   • Medals Count: ${acc.cs2.medalsCount} ${acc.cs2.hasRareOldMedals ? '🔥 (RARE MEDALS DETECTED)' : ''}`);
    if (acc.cs2.medalsCount > 0) {
      console.log('     Medals:', acc.cs2.medals.map(m => m.name).join(', '));
    }
    console.log(`   • Knives Count: ${acc.cs2.knivesCount}`);
    console.log(`   • Cases Count: ${acc.cs2.casesCount} ${acc.cs2.hasExpensiveCases ? '💰 (EXPENSIVE CASES FOUND)' : ''}`);
    if (acc.cs2.topValuableItems.length > 0) {
      console.log('   • Top Valuable Items:');
      acc.cs2.topValuableItems.slice(0, 3).forEach(item => {
        console.log(`      - ${item.name} ($${item.priceUsd})`);
      });
    }

    console.log('⚡ Faceit Integration:');
    console.log(`   • Registered on Faceit: ${acc.faceit.registered ? '✅ YES' : '❌ NO'}`);
    if (acc.faceit.registered) {
      console.log(`   • Level: ${acc.faceit.level} / 10 | ELO: ${acc.faceit.elo}`);
      console.log(`   • Nickname: ${acc.faceit.nickname}`);
    }
  }

  console.log('\n Stage 3 CS2 & Faceit Engine successfully verified on live accounts!');
}

runStage3Test();
