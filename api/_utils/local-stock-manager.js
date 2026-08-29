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
 * DISABLED: Local stock claiming disabled by user request.
 * All orders on sharpbuy.org now go 100% DIRECTLY to the supplier API (dropshipping).
 */
export function claimLocalStockToken(productId = '', productName = '', orderId = '', customerEmail = '') {
  console.log(`[LOCAL STOCK] ℹ️ Local stock claiming is DISABLED. Order ${orderId} goes 100% directly to supplier dropship.`);
  return null;
}
