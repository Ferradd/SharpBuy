import fs from 'fs';
import path from 'path';

const ordersFile = path.join(process.cwd(), 'api', 'orders_database.json');
const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));

console.log(`Total orders in DB: ${orders.length}`);

for (const o of orders) {
  console.log(`\nOrder ID: ${o.orderId}`);
  console.log(`  Product: ${o.productName} (${o.productId})`);
  console.log(`  Created: ${o.createdAt}`);
  console.log(`  Status: ${o.status}`);
  console.log(`  Tokens count: ${o.tokens?.length || 0}`);
  if (o.tokens && o.tokens.length > 0) {
    for (const t of o.tokens) {
      const parts = t.split('----');
      const steamId = parts[0];
      console.log(`    Token SteamID: ${steamId} (Length: ${t.length})`);
    }
  }
}
