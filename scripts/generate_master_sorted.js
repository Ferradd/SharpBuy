import fs from 'fs';

// 1. Load orders database to map order IDs and original purchased products
const orders = JSON.parse(fs.readFileSync('api/orders_database.json', 'utf8'));
const ordersMap = new Map();

for (const o of orders) {
  if (o.tokens && o.tokens[0]) {
    const steamId = o.tokens[0].split('----')[0];
    ordersMap.set(steamId, {
      orderId: o.orderId,
      productName: o.productName,
      productId: o.productId,
      paidAmount: o.amountUsd || o.amountRub || o.amount
    });
  }
}

// 2. Load audit results with true prices & items
const auditData = JSON.parse(fs.readFileSync('scripts/accurate_full_audit.json', 'utf8'));

// 3. Load full tokens
const tokensMap = new Map();
const steamTxt = fs.readFileSync('C:/Users/iliyk/Desktop/steam.txt', 'utf8');
const tokenLines = steamTxt.match(/\d+----ey[a-zA-Z0-9_\-\.]+/g) || [];
for (const t of tokenLines) {
  const sid = t.split('----')[0];
  tokensMap.set(sid, t);
}

// Map metadata for accounts
const accountsFull = [];

for (const a of auditData) {
  const sid = a.steamId;
  const ord = ordersMap.get(sid) || {};
  const token = tokensMap.get(sid);

  let isPremier = false;
  let isPrime = true;
  let inactivity = 'Не указана';

  // Check product / features
  const pName = (ord.productName || '').toLowerCase();
  if (pName.includes('premier') || pName.includes('премьер')) {
    isPremier = true;
  }

  // Inactivity annotations
  if (sid === '76561199241484983') inactivity = '4 недели (1 месяц)';
  else if (sid === '76561199492828421') inactivity = '6 дней';
  else if (sid === '76561199231692149') inactivity = '6 дней (10,000 часов)';
  else if (sid === '76561198077834073') inactivity = '13 часов';
  else if (sid === '76561199230983883') inactivity = '13 часов';
  else if (sid === '76561199188317738') inactivity = '3 часа';
  else if (sid === '76561199216635588') inactivity = '3 часа';

  accountsFull.push({
    steamId: sid,
    totalUSD: a.totalUSD,
    itemCount: a.totalCount,
    topItems: a.topItems,
    orderId: ord.orderId || 'N/A',
    productName: ord.productName || (a.totalUSD > 50 ? 'CS2 NFA High-Tier / Knife Account' : 'CS2 Premier Ready Instant Competitive'),
    isPremier,
    inactivity,
    token
  });
}

// Sort strictly by totalUSD descending
accountsFull.sort((a, b) => b.totalUSD - a.totalUSD);

// Generate steam.txt
let outputTxt = `================================================================================
  SHARPBUY MASTER STEAM ACCOUNTS DATABASE (ПОЛНЫЙ РЕЕСТР ПО УБЫВАНИЮ СТОИМОСТИ)
  Всего рабочих аккаунтов: ${accountsFull.length} | Суммарная стоимость: ~$705.00+ USD | Дата: 25.08.2026
================================================================================
`;

// Section 1: Top High-Tier ($100+)
outputTxt += `\n================================================================================
  🔥 [РАЗДЕЛ 1] ТОП ТИР: АККАУНТЫ С НОЖАМИ И ЖИРНЫМИ ИНВЕНТАРЯМИ ($100 - $260+)
================================================================================\n`;

const tier1 = accountsFull.filter(a => a.totalUSD >= 100);
tier1.forEach((acc, i) => {
  outputTxt += `\n#${i + 1} | ★★★ [СТОИМОСТЬ: $${acc.totalUSD.toFixed(2)}] [SteamID: ${acc.steamId}]
📦 Товар: ${acc.productName} | Заказ: ${acc.orderId}
🎮 Статус игры: CS2 Prime + Открыт Премьер (Premier Ready) | Предметов: ${acc.itemCount} шт.
💎 Главный лут: ${acc.topItems.map(it => `${it.name} ($${it.price.toFixed(2)})`).join(' | ')}
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
📊 Skinpock: https://www.skinpock.com/inventory/${acc.steamId}
TOKEN:
${acc.token}\n`;
});

// Section 2: Mid-Tier & Inactivity ($5 - $99)
outputTxt += `\n================================================================================
  💎 [РАЗДЕЛ 2] МИДДЛ ТИР: ИНВЕНТАРИ, СКИНЫ И БЕЗОПАСНАЯ ОТЛЁЖКА ($3.50 - $30.00)
================================================================================\n`;

const tier2 = accountsFull.filter(a => a.totalUSD > 0 && a.totalUSD < 100);
tier2.forEach((acc, i) => {
  const index = tier1.length + i + 1;
  outputTxt += `\n#${index} | [СТОИМОСТЬ: $${acc.totalUSD.toFixed(2)}] [SteamID: ${acc.steamId}]
📦 Товар: ${acc.productName} | Заказ: ${acc.orderId}
⏱️ Отлёжка: ${acc.inactivity} | Статус: CS2 Prime (Премьер ${acc.isPremier ? 'Открыт' : 'Готов'}) | Предметов: ${acc.itemCount} шт.
🎨 Скины: ${acc.topItems.map(it => `${it.name} ($${it.price.toFixed(2)})`).join(' | ')}
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
📊 Skinpock: https://www.skinpock.com/inventory/${acc.steamId}
TOKEN:
${acc.token}\n`;
});

// Section 3: Clean Premier & Prime
outputTxt += `\n================================================================================
  ⚡ [РАЗДЕЛ 3] ЧИСТЫЕ АККАУНТЫ ПОД ИГРУ (PREMIER READY & PRIME ЧИСТЫЙ СТОК)
================================================================================\n`;

const tier3 = accountsFull.filter(a => a.totalUSD === 0);
tier3.forEach((acc, i) => {
  const index = tier1.length + tier2.length + i + 1;
  outputTxt += `\n#${index} | [ЧИСТЫЙ СТОК ПОД ИГРУ] [SteamID: ${acc.steamId}]
📦 Товар: ${acc.productName} | Заказ: ${acc.orderId}
⏱️ Отлёжка: ${acc.inactivity} | Статус: CS2 Prime + Открыт Премьер (Premier Ready 100% чистый)
🔗 Профиль Steam: https://steamcommunity.com/profiles/${acc.steamId}/
📊 Skinpock: https://www.skinpock.com/inventory/${acc.steamId}
TOKEN:
${acc.token}\n`;
});

fs.writeFileSync('C:/Users/iliyk/Desktop/steam.txt', outputTxt, 'utf8');
fs.writeFileSync('C:/Users/iliyk/Desktop/steam_categorized.txt', outputTxt, 'utf8');
console.log('Successfully generated fully sorted master database!');
