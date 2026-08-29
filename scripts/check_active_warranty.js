import fs from 'fs';
import path from 'path';

const orders = JSON.parse(fs.readFileSync('api/orders_database.json', 'utf8'));
const now = Date.now();

console.log('=== Checking Active Warranty Orders ===');

for (const o of orders) {
  const p = (o.productName || o.productId || '').toLowerCase();
  const isNoWarranty = p.includes('knife') || p.includes('skin') || p.includes('rust');
  const orderTime = new Date(o.paidAt || o.createdAt || now).getTime();
  const ageHours = (now - orderTime) / 3600000;
  const shefuHoursLeft = Math.max(0, 6 - ageHours);

  console.log(`Order: ${o.orderId} | Product: ${o.productName}`);
  console.log(`  Age: ${ageHours.toFixed(2)}h ago | Shefu 6h Warranty Left: ${shefuHoursLeft.toFixed(2)}h`);
  console.log(`  Eligible for Replacement? ${!isNoWarranty && shefuHoursLeft > 0 ? 'YES' : 'NO (' + (isNoWarranty ? 'No warranty item' : 'Expired') + ')'}`);
}
