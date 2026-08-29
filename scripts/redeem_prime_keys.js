import fs from 'fs';

async function redeemPrimeKeys() {
  const primeKeys = [
    'PRIME1XML2MIURG8UZA8MEMIZ',
    'PRIMEY3C2GNTK7GQJWMV1OZEF',
    'PRIMEG32PL002ZHF6HREVKZ6O'
  ];

  const redeemedPrime = [];

  for (let k of primeKeys) {
    console.log(`Redeeming Prime Key ${k}...`);
    try {
      const res = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license: k })
      });
      const data = await res.json();
      console.log(`Result for ${k}:`, data);

      if (data.success && data.account) {
        redeemedPrime.push({ key: k, token: data.account });
      } else if (data.success && data.claim_id) {
        const claimId = data.claim_id;
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const sRes = await fetch('https://nfa.shefu223.shop/api/nfa-redeem-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claim_id: claimId })
          });
          const sData = await sRes.json();
          if (sData.status === 'approved' && sData.account) {
            redeemedPrime.push({ key: k, token: sData.account });
            console.log(`Claim approved for Prime ${k}:`, sData.account);
            break;
          }
        }
      } else if (data.alreadyDelivered && data.account) {
        redeemedPrime.push({ key: k, token: data.account });
      }
    } catch (e) {
      console.error(`Error for ${k}:`, e.message);
    }
  }

  console.log(`Successfully redeemed ${redeemedPrime.length} CS2 Prime accounts!`);

  // Read current steam.txt tokens
  const rawDb = JSON.parse(fs.readFileSync('src/data/orders_database.json', 'utf-8') || '[]');
  
  // Separate Premier and Prime
  const premierOrders = rawDb.filter(o => o.productId !== 'prime');
  
  // Add prime orders
  const primeOrders = redeemedPrime.map((p, i) => ({
    orderId: `SHARP-PRIME-${8700 + i}`,
    email: 'iliykuzin2@gmail.com',
    productId: 'prime',
    productName: 'CS2 Prime Account • Clean Level 0',
    steamId: p.token.split('----')[0],
    quantity: 1,
    amountRub: 50,
    cryptoAmount: '0.45',
    currency: 'USDT (BEP-20)',
    licenseKey: p.key,
    tokens: [p.token],
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    warrantyHours: 3,
    status: 'PAID_DELIVERED'
  }));

  const allOrders = [...premierOrders, ...primeOrders];
  fs.writeFileSync('src/data/orders_database.json', JSON.stringify(allOrders, null, 2), 'utf-8');
  fs.writeFileSync('api/orders_database.json', JSON.stringify(allOrders, null, 2), 'utf-8');

  // Format master steam.txt with all categories
  const formattedText = `================================================================================
                    SHARPBUY MASTER STEAM TOKENS DATABASE
================================================================================
Total Verified Accounts: ${allOrders.length}
Owner Email: iliykuzin2@gmail.com
Last Synced: ${new Date().toLocaleString('ru-RU')}
================================================================================


================================================================================
[1] CS2 PREMIER READY • INSTANT COMPETITIVE (Количество: ${premierOrders.length})
Supplier Price: €0.49 / £0.57 (~49-55 ₽)
================================================================================

${premierOrders.map((o, idx) => `--- PREMIER ACCOUNT #${idx + 1} [SteamID: ${o.steamId || o.tokens[0].split('----')[0]}] ---
${o.tokens[0]}
`).join('\n')}


================================================================================
[2] CS2 PRIME ACCOUNT • CLEAN (Количество: ${primeOrders.length})
Supplier Price: €0.23 / £0.20 (~23 ₽)
================================================================================

${primeOrders.map((o, idx) => `--- PRIME ACCOUNT #${idx + 1} [SteamID: ${o.steamId}] ---
${o.tokens[0]}
`).join('\n')}


================================================================================
[3] CS2 5+ MEDALS • PREMIER UNLOCKED
Supplier Price: €0.58 / £0.50 (~58 ₽)
Status: Dynamic Auto-Redeem via SharpBuy Cloud
================================================================================


================================================================================
[4] CS2 8+ MEDALS • PREMIER UNLOCKED
Supplier Price: €0.76 / £0.65 (~76 ₽)
Status: Dynamic Auto-Redeem via SharpBuy Cloud
================================================================================
`;

  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', formattedText, 'utf-8');
  console.log('Successfully updated C:\\Users\\iliyk\\Desktop\\steam.txt with total', allOrders.length, 'accounts!');
}

redeemPrimeKeys();
