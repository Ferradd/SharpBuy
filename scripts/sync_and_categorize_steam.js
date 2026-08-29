import fs from 'fs';
import path from 'path';

async function redeemAndCategorizeAll() {
  const newKeys = [
    'PREMIERDB6VDF5MIBOW1P8OROC8',
    'PREMIER4L8A8REBPEN67PPPZA23',
    'PREMIERCIAPMNS47V1IAD7HWBDD',
    'PREMIER41FKSGH6ELOO7S5IQMJP',
    'PREMIERIN5PVVYY2B2MLP1MAYHI',
    'PREMIERRDOSPIISX51760HH5RTC',
    'PREMIERPE9HXUSIGAB7Q45MNOB9'
  ];

  const redeemedFromKeys = [];

  for (let k of newKeys) {
    console.log(`Redeeming ${k}...`);
    try {
      const res = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license: k })
      });
      const data = await res.json();
      console.log(`Result for ${k}:`, data);

      if (data.success && data.account) {
        redeemedFromKeys.push({ key: k, token: data.account });
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
            redeemedFromKeys.push({ key: k, token: sData.account });
            console.log(`Claim approved for ${k}:`, sData.account);
            break;
          }
        }
      } else if (data.alreadyDelivered && data.account) {
        redeemedFromKeys.push({ key: k, token: data.account });
      }
    } catch (e) {
      console.error(`Error for ${k}:`, e.message);
    }
  }

  // Tokens from Desktop/steam.txt
  const rawSteamTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf-8');
  const txtTokens = rawSteamTxt.split('\n')
    .map(line => line.trim())
    .filter(line => line.includes('----eyAidHlwIjog'));

  console.log(`Found ${txtTokens.length} tokens in steam.txt`);
  console.log(`Found ${redeemedFromKeys.length} tokens redeemed from Gmail keys`);

  // Combine unique tokens
  const allTokensSet = new Map();

  // Add existing orders
  const existingOrders = JSON.parse(fs.readFileSync('src/data/orders_database.json', 'utf-8') || '[]');
  existingOrders.forEach(o => {
    (o.tokens || []).forEach(t => allTokensSet.set(t, {
      productName: o.productName,
      amountRub: o.amountRub,
      cryptoAmount: o.cryptoAmount,
      licenseKey: o.licenseKey || 'N/A'
    }));
  });

  // Add steam.txt tokens
  txtTokens.forEach(t => {
    if (!allTokensSet.has(t)) {
      allTokensSet.set(t, {
        productName: 'CS2 Premier Ready Instant Competitive',
        amountRub: 89,
        cryptoAmount: '0.97',
        licenseKey: 'DESKTOP_SAVED'
      });
    }
  });

  // Add newly redeemed Gmail tokens
  redeemedFromKeys.forEach(r => {
    allTokensSet.set(r.token, {
      productName: 'CS2 Premier Ready Instant Competitive',
      amountRub: 89,
      cryptoAmount: '0.97',
      licenseKey: r.key
    });
  });

  console.log(`Total unique accounts in master library: ${allTokensSet.size}`);

  // Build clean orders array
  const fullOrderList = [];
  let idx = 1;
  for (let [token, meta] of allTokensSet.entries()) {
    const steamId = token.split('----')[0];
    fullOrderList.push({
      orderId: `SHARP-ACC-${9860 + idx}`,
      email: 'iliykuzin2@gmail.com',
      productId: 'premier',
      productName: meta.productName || 'CS2 Premier Ready Instant Competitive',
      steamId,
      quantity: 1,
      amountRub: meta.amountRub || 89,
      cryptoAmount: meta.cryptoAmount || '0.97',
      currency: 'USDT (BEP-20)',
      licenseKey: meta.licenseKey,
      tokens: [token],
      createdAt: new Date(Date.now() - (allTokensSet.size - idx) * 300000).toISOString(),
      paidAt: new Date(Date.now() - (allTokensSet.size - idx) * 300000 + 5000).toISOString(),
      warrantyHours: 3,
      status: 'PAID_DELIVERED'
    });
    idx++;
  }

  // Save to src/data and api/
  fs.writeFileSync('src/data/orders_database.json', JSON.stringify(fullOrderList, null, 2), 'utf-8');
  fs.writeFileSync('api/orders_database.json', JSON.stringify(fullOrderList, null, 2), 'utf-8');

  // Also write formatted categorization text file to Desktop/steam_categorized.txt
  const categorizedText = `================================================================================
           SHARPBUY MASTER STEAM ACCOUNTS REPOSITORY
================================================================================
Total Accounts: ${fullOrderList.length}
Owner Email: iliykuzin2@gmail.com
Timestamp: ${new Date().toLocaleString('ru-RU')}

--------------------------------------------------------------------------------
[1] CS2 PREMIER READY • INSTANT COMPETITIVE (Supplier: ~€0.49 / £0.57)
--------------------------------------------------------------------------------
${fullOrderList.map((o, i) => `
#${i + 1} | Order: ${o.orderId} | SteamID: ${o.steamId} | Key: ${o.licenseKey || 'DIRECT'}
TOKEN:
${o.tokens[0]}
`).join('\n')}

================================================================================
`;

  fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam_categorized.txt', categorizedText, 'utf-8');
  console.log('Successfully saved to Desktop/steam_categorized.txt and Database!');
}

redeemAndCategorizeAll();
