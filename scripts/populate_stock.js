import fs from 'fs';

async function populateStock() {
  const dbOrders = JSON.parse(fs.readFileSync('src/data/orders_database.json', 'utf-8') || '[]');
  
  const stockList = [];
  let idx = 1;
  for (let o of dbOrders) {
    if (o.tokens && o.tokens.length > 0) {
      for (let t of o.tokens) {
        stockList.push({
          id: `item_cs2_${idx}`,
          productId: o.productId || 'premier',
          productName: o.productName,
          tokenData: t,
          isSold: false,
          soldTo: null,
          soldAt: null,
          status: 'verified_active_prime'
        });
        idx++;
      }
    }
  }

  fs.writeFileSync('src/data/stock_nfa_prime.json', JSON.stringify(stockList, null, 2), 'utf-8');
  fs.writeFileSync('api/stock_nfa_prime.json', JSON.stringify(stockList, null, 2), 'utf-8');
  console.log(`Populated stock_nfa_prime.json with ${stockList.length} ready-to-deliver tokens!`);
}

populateStock();
