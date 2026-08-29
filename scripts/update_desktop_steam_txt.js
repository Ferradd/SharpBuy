import fs from 'fs';

async function updateSteamTxt() {
  const dbOrders = JSON.parse(fs.readFileSync('src/data/orders_database.json', 'utf-8') || '[]');
  
  // Extract all tokens with metadata
  const tokensList = [];
  const seenTokens = new Set();

  for (let o of dbOrders) {
    if (o.tokens && o.tokens.length > 0) {
      for (let t of o.tokens) {
        if (!seenTokens.has(t)) {
          seenTokens.add(t);
          tokensList.push({
            steamId: o.steamId || t.split('----')[0],
            token: t,
            key: o.licenseKey || 'DIRECT'
          });
        }
      }
    }
  }

  const content = `================================================================================
                    SHARPBUY MASTER STEAM TOKENS DATABASE
================================================================================
Total Active Accounts: ${tokensList.length}
Owner Email: iliykuzin2@gmail.com
Last Synced: ${new Date().toLocaleString('ru-RU')}
================================================================================


================================================================================
[1] CS2 PREMIER READY • INSTANT COMPETITIVE
Supplier Price: €0.49 / £0.57 (~49-55 ₽)
Total In Stock: ${tokensList.length} accounts
================================================================================

${tokensList.map((item, idx) => `--- ACCOUNT #${idx + 1} [SteamID: ${item.steamId}] ---
${item.token}
`).join('\n')}

================================================================================
[2] CS2 5+ MEDALS • PREMIER UNLOCKED
Supplier Price: €0.58 / £0.50 (~58 ₽)
Status: Dynamic Auto-Redeem via SharpBuy Cloud
================================================================================

================================================================================
[3] CS2 8+ MEDALS • PREMIER UNLOCKED
Supplier Price: €0.76 / £0.65 (~76 ₽)
Status: Dynamic Auto-Redeem via SharpBuy Cloud
================================================================================

================================================================================
[4] CS2 PRIME ACCOUNT • CLEAN
Supplier Price: €0.23 / £0.20 (~23 ₽)
Status: Dynamic Auto-Redeem via SharpBuy Cloud
================================================================================
`;

  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', content, 'utf-8');
  console.log('Successfully updated C:\\Users\\iliyk\\Desktop\\steam.txt with all', tokensList.length, 'tokens!');
}

updateSteamTxt();
