import fs from 'fs';
import { checkShefuWarrantyEligibility } from './shefu-replacement.js';

async function test() {
  console.log('=== TESTING SHEFU WARRANTY ELIGIBILITY (PHASE 1) ===\n');
  const orders = JSON.parse(fs.readFileSync('C:/Users/iliyk/Desktop/SharpBuy/src/data/orders_database.json', 'utf8'));
  
  // Find an order with a token
  const validOrder = orders.find(o => o.tokens && o.tokens[0] && o.tokens[0].includes('----ey'));
  if (!validOrder) {
    console.log('No valid orders found in DB.');
    return;
  }

  const token = validOrder.tokens[0];
  console.log('Testing with Token from Order:', validOrder.orderId);
  console.log('SteamID:', token.split('----')[0]);
  console.log('Token snippet:', token.slice(0, 30) + '...');

  const result = await checkShefuWarrantyEligibility(token);
  console.log('\nResult from Shefu API:');
  console.log(result);
}

test();
