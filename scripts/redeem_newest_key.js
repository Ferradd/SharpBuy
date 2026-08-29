import fs from 'fs';

async function redeemNewestKey() {
  const key = 'PREMIERWV7ZKPG5YK7AN5VST1B4';
  console.log(`Redeeming latest key ${key}...`);

  const res = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license: key })
  });

  const data = await res.json();
  console.log('Result:', data);

  let token = data.account;
  if (!token && data.claim_id) {
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const sRes = await fetch('https://nfa.shefu223.shop/api/nfa-redeem-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_id: data.claim_id })
      });
      const sData = await sRes.json();
      if (sData.status === 'approved' && sData.account) {
        token = sData.account;
        break;
      }
    }
  }

  if (token) {
    console.log('Got live token:', token);
    const dbOrders = JSON.parse(fs.readFileSync('src/data/orders_database.json', 'utf-8') || '[]');
    const newOrder = {
      orderId: 'SHARP-MT7FUQE5-326',
      email: 'iliykuzin2@gmail.com',
      productId: 'premier',
      productName: 'CS2 Premier Ready (Открыт Премьер)',
      steamId: token.split('----')[0],
      quantity: 1,
      amountRub: 89,
      cryptoAmount: '0.9721',
      currency: 'USDT (BEP-20)',
      licenseKey: key,
      tokens: [token],
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      warrantyHours: 3,
      status: 'PAID_DELIVERED'
    };

    dbOrders.unshift(newOrder);
    fs.writeFileSync('src/data/orders_database.json', JSON.stringify(dbOrders, null, 2), 'utf-8');
    fs.writeFileSync('api/orders_database.json', JSON.stringify(dbOrders, null, 2), 'utf-8');

    // Update Desktop/steam.txt
    const rawTxt = fs.readFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', 'utf-8');
    const newTxt = rawTxt.replace(
      '================================================================================\n[1] CS2 PREMIER READY',
      `--- PREMIER ACCOUNT [SteamID: ${token.split('----')[0]}] ---\n${token}\n\n================================================================================\n[1] CS2 PREMIER READY`
    );
    fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', newTxt, 'utf-8');
    console.log('Added to database and steam.txt!');
  }
}

redeemNewestKey();
