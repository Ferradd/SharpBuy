import fs from 'fs';
import path from 'path';

const STOCK_SRC = 'c:/Users/iliyk/Desktop/SharpBuy/src/data/stock_database.json';
const STOCK_API = 'c:/Users/iliyk/Desktop/SharpBuy/api/stock_database.json';

let stock = JSON.parse(fs.readFileSync(STOCK_SRC, 'utf8'));

// Remove dead IDs
const deadIds = new Set(['76561199222229128', '76561199250626158']);
stock = stock.filter(item => !deadIds.has(item.steamId));

// Add fresh valid accounts if not present
const toAdd = [
  {
    id: 'stock_76561199621492593',
    steamId: '76561199621492593',
    category: 'rating15k',
    totalValuationUSD: 35.0,
    itemCount: 15,
    topItems: 'CS2 Premier 15,000+ Rating (1841ч в CS2, 4453ч стаж)',
    tokenData: '76561199621492593----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTYyMTQ5MjU5MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3ODg5MjM1NjEsICJuYmYiOiAxNzYyMDc3NjM3LCAiaWF0IjogMTc3MDcxNzYzNywgImp0aSI6ICIwMDEzXzI3QUMyN0MyXzQ2N0I2IiwgIm9hdCI6IDE3NzA3MTc2MzcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzguMjE0LjI1NC44IiwgImlwX2NvbmZpcm1lciI6ICIyMy4yNTEuMzUuNzIiIH0.E7fXi5A5R1M8yzVFZfBPyV_8IPVdS9ofxJe8nG6IL_ew6Lc5sQK2U2mP1TsBNQ5x-esgUQ5EsaIW_22G_u5rAw',
    isSold: false,
    soldToOrderId: null,
    soldToEmail: null,
    soldAt: null,
    addedAt: new Date().toISOString()
  },
  {
    id: 'stock_76561199388511036',
    steamId: '76561199388511036',
    category: 'prime',
    totalValuationUSD: 40.0,
    itemCount: 20,
    topItems: 'CS2 Prime (123ч) + GTA V (97ч) + Call of Duty MW III (4ч)',
    tokenData: '76561199388511036----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTM4ODUxMTAzNiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA5NjUzNzAsICJuYmYiOiAxNzU3Njk4OTE2LCAiaWF0IjogMTc2NjMzODkxNiwgImp0aSI6ICIwMDA1XzI3NkI4RUI2X0YxMzhFIiwgIm9hdCI6IDE3NjYzMzg5MTYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiODYuMjIuMjU0LjE4NiIsICJpcF9jb25maXJtZXIiOiAiODYuMjIuMjU0LjE4NiIgfQ.kRJOFgXVqvKhsmcKnOqlEasWDA_UlHUc36NgIy8ijf60W65uLNYiDalzwDGp8-z0Hv1PxMOtyU5orXwbwW3mDA',
    isSold: false,
    soldToOrderId: null,
    soldToEmail: null,
    soldAt: null,
    addedAt: new Date().toISOString()
  }
];

for (const item of toAdd) {
  if (!stock.some(s => s.steamId === item.steamId)) {
    stock.push(item);
  }
}

fs.writeFileSync(STOCK_SRC, JSON.stringify(stock, null, 2), 'utf8');
if (fs.existsSync(STOCK_API)) {
  fs.writeFileSync(STOCK_API, JSON.stringify(stock, null, 2), 'utf8');
}

console.log(`Cleaned stock database: ${stock.length} active items (dead accounts purged)!`);
