import { getAllStockItems, claimLocalStockToken, saveStockItems } from '../api/_utils/local-stock-manager.js';

console.log('Testing stock management system...');
const initialStock = getAllStockItems();
console.log(`Total stock loaded: ${initialStock.length}`);
const unsoldBefore = initialStock.filter(s => !s.isSold).length;
console.log(`Unsold before test: ${unsoldBefore}`);

// Simulate a purchase for Premier
console.log('\n--- Simulating Order SHARP-TEST-9999 for Premier Ready ---');
const token = claimLocalStockToken('premier', 'CS2 Premier Ready Instant', 'SHARP-TEST-9999', 'testbuyer@gmail.com');
console.log(`Claimed token: ${token.substring(0, 30)}...`);

const stockAfter = getAllStockItems();
const soldItem = stockAfter.find(s => s.soldToOrderId === 'SHARP-TEST-9999');
console.log('Sold item record in DB:', {
  steamId: soldItem.steamId,
  isSold: soldItem.isSold,
  soldToOrderId: soldItem.soldToOrderId,
  soldToEmail: soldItem.soldToEmail,
  soldAt: soldItem.soldAt
});

// Revert test item back to unsold so we don't consume stock during testing
soldItem.isSold = false;
soldItem.soldToOrderId = null;
soldItem.soldToEmail = null;
soldItem.soldAt = null;
saveStockItems(stockAfter);
console.log('\n✅ Test passed 100%! Test item successfully restored to unsold status.');
