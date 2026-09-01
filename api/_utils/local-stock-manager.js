import fs from 'fs';
import path from 'path';

const STOCK_FILE_SRC = path.join(process.cwd(), 'src', 'data', 'stock_database.json');
const STOCK_FILE_API = path.join(process.cwd(), 'api', 'stock_database.json');

/**
 * Load all items from local stock database
 */
export function getAllStockItems() {
  try {
    if (fs.existsSync(STOCK_FILE_SRC)) {
      return JSON.parse(fs.readFileSync(STOCK_FILE_SRC, 'utf8'));
    }
    if (fs.existsSync(STOCK_FILE_API)) {
      return JSON.parse(fs.readFileSync(STOCK_FILE_API, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading stock database:', e);
  }
  return [];
}

/**
 * Save stock items to both api and src data paths
 */
export function saveStockItems(stockList) {
  try {
    const dir1 = path.dirname(STOCK_FILE_SRC);
    if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });
    fs.writeFileSync(STOCK_FILE_SRC, JSON.stringify(stockList, null, 2), 'utf8');
  } catch (e) {}

  try {
    const dir2 = path.dirname(STOCK_FILE_API);
    if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
    fs.writeFileSync(STOCK_FILE_API, JSON.stringify(stockList, null, 2), 'utf8');
  } catch (e) {}
}

/**
 * Claim an available token from the local stock database or provision an active node
 */
export function claimLocalStockToken(productId = '', productName = '', orderId = '', customerEmail = '') {
  try {
    const stockItems = getAllStockItems();
    if (stockItems && Array.isArray(stockItems) && stockItems.length > 0) {
      // Find item matching category or available item
      const p = (productId + ' ' + productName).toLowerCase();
      const isPrimeRequested = p.includes('prime') && !p.includes('premier') && !p.includes('15') && !p.includes('20');
      
      let idx = -1;
      if (isPrimeRequested) {
        idx = stockItems.findIndex(i => (!i.isSold && !i.claimed) && (i.category === 'prime') && (i.token || i.tokenData));
      }
      if (idx === -1) {
        idx = stockItems.findIndex(i => (!i.isSold && !i.claimed) && (i.token || i.tokenData));
      }

      if (idx !== -1) {
        const item = stockItems[idx];
        const tokenToDeliver = item.token || item.tokenData;
        item.isSold = true;
        item.claimed = true;
        item.claimedAt = new Date().toISOString();
        item.claimedByOrder = orderId;
        item.soldToOrderId = orderId;
        item.soldToEmail = customerEmail;
        item.customerEmail = customerEmail;
        saveStockItems(stockItems);
        console.log(`[LOCAL STOCK] ✅ Claimed warehouse token (${item.steamId || item.id}) for order ${orderId}`);
        return tokenToDeliver;
      }
    }
  } catch (e) {
    console.error('Error claiming local stock token:', e);
  }
  return null;
}
