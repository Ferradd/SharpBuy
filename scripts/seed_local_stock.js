import fs from 'fs';
import path from 'path';

// 1. Load the 21 audited accounts with accurate prices & tokens
const steamTxt = fs.readFileSync('C:/Users/iliyk/Desktop/steam.txt', 'utf8');
const tokenLines = steamTxt.match(/\d+----ey[a-zA-Z0-9_\-\.]+/g) || [];
const tokensMap = new Map();
for (const t of tokenLines) {
  const sid = t.split('----')[0];
  tokensMap.set(sid, t);
}

const auditData = JSON.parse(fs.readFileSync('scripts/accurate_full_audit.json', 'utf8'));

const stockList = [];

for (const a of auditData) {
  const sid = a.steamId;
  const token = tokensMap.get(sid);
  if (!token) continue;

  let category = 'premier';
  if (sid === '76561199222229128' || sid === '76561199250626158') {
    category = 'knife';
  } else if (sid === '76561198308872864') {
    category = 'medals';
  } else if (a.totalUSD >= 10) {
    category = 'skins';
  } else if (sid === '76561198001838422' || sid === '76561199216635588') {
    category = 'prime';
  }

  stockList.push({
    id: `stock_${sid}`,
    steamId: sid,
    category,
    totalValuationUSD: a.totalUSD,
    itemCount: a.totalCount,
    topItems: a.topItems.slice(0, 3).map(i => `${i.name} ($${i.price})`).join(', '),
    tokenData: token,
    isSold: false,
    soldToOrderId: null,
    soldToEmail: null,
    soldAt: null,
    addedAt: new Date().toISOString()
  });
}

// Write to src/data/stock_database.json and api/stock_database.json
const fileSrc = path.join(process.cwd(), 'src', 'data', 'stock_database.json');
const fileApi = path.join(process.cwd(), 'api', 'stock_database.json');

fs.writeFileSync(fileSrc, JSON.stringify(stockList, null, 2), 'utf8');
fs.writeFileSync(fileApi, JSON.stringify(stockList, null, 2), 'utf8');

console.log(`Successfully seeded ${stockList.length} accounts into stock_database.json!`);
console.log('Categories breakdown:');
const counts = {};
stockList.forEach(s => counts[s.category] = (counts[s.category] || 0) + 1);
console.log(counts);
