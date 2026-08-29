// ============================================================================
// SHARPBUY WARRANTY ARBITRAGE WORKER (SNIPING FREE REPLACEMENTS AT 5H 55M)
// ============================================================================

import fs from 'fs';
import path from 'path';
import { checkShefuWarrantyEligibility, requestShefuReplacement } from './shefu-replacement.js';
import { getAllOrders } from './orders-db.js';

const ORDERS_DB_PATH = path.join(process.cwd(), 'src', 'data', 'orders_database.json');
const STOCK_PATH_SRC = path.join(process.cwd(), 'src', 'data', 'stock_nfa_prime.json');
const STOCK_PATH_API = path.join(process.cwd(), 'api', 'stock_nfa_prime.json');
const STEAM_TXT_PATH = 'C:/Users/iliyk/Desktop/steam.txt';
const STATS_PATH = path.join(process.cwd(), 'src', 'data', 'warranty_stats.json');

// Window for harvesting: between 5h 50m (21,000s) and 5h 59m (21,540s)
const MIN_HARVEST_AGE_MS = (5 * 60 + 50) * 60 * 1000; // 5h 50m
const MAX_HARVEST_AGE_MS = (5 * 60 + 59) * 60 * 1000; // 5h 59m

/**
 * Runs a single scan cycle over orders database to identify accounts approaching 6h expiry
 */
export async function runArbitrageScan() {
  console.log(`[ArbitrageWorker] Starting warranty scan at ${new Date().toISOString()}...`);

  let orders = [];
  try {
    if (fs.existsSync(ORDERS_DB_PATH)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_DB_PATH, 'utf8'));
    }
  } catch (e) {
    return;
  }

  const now = Date.now();
  let harvestedCount = 0;

  for (let order of orders) {
    if (order.arbitrageChecked) continue;

    // Check category eligibility
    const prod = (order.productName || order.productId || '').toLowerCase();
    const isNoWarranty = prod.includes('knife') || prod.includes('skin') || prod.includes('rust');
    if (isNoWarranty) continue;

    const orderTime = new Date(order.paidAt || order.createdAt || order.deliveredAt || now).getTime();
    const ageMs = now - orderTime;

    // Check if within 5h 50m - 5h 59m window
    if (ageMs >= MIN_HARVEST_AGE_MS && ageMs <= MAX_HARVEST_AGE_MS) {
      const token = order.tokens && order.tokens[0];
      if (!token || !token.includes('----ey')) continue;

      console.log(`[ArbitrageWorker] Found candidate token approaching 6h: Order ${order.orderId} (Age: ${(ageMs / 3600000).toFixed(2)}h)`);

      // 1. Check supplier eligibility first
      const elig = await checkShefuWarrantyEligibility(token);
      if (!elig.eligible) {
        order.arbitrageChecked = true;
        order.arbitrageCheckedAt = new Date().toISOString();
        continue;
      }

      // 2. Attempt to claim replacement from supplier (if account was recovered by owner)
      console.log(`[ArbitrageWorker] Probing replacement claim on supplier for: ${token.split('----')[0]}...`);
      const claim = await requestShefuReplacement(token);

      order.arbitrageChecked = true;
      order.arbitrageCheckedAt = new Date().toISOString();

      if (claim && claim.success && claim.newToken) {
        harvestedCount++;
        const newToken = claim.newToken;
        const newSteamId = newToken.split('----')[0];
        console.log(`[ArbitrageWorker] 🎯 SUCCESS! Free replacement harvested! New SteamID: ${newSteamId}`);

        order.arbitrageHarvested = true;
        order.arbitrageHarvestedToken = newToken;

        // Add to local stock for instant fulfillment
        addTokenToLocalStock(newToken, order.orderId);

        // Append to desktop steam.txt
        appendTokenToSteamTxt(newToken, newSteamId, order.orderId);

        // Update statistics
        recordArbitrageStats(order.orderId, newSteamId, prod);
      } else {
        console.log(`[ArbitrageWorker] Account still active / not replaceable: ${claim?.error || 'Active'}`);
      }

      // Delay between queries
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Save updated orders DB with checked flags
  try {
    fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {}

  console.log(`[ArbitrageWorker] Scan completed. Free accounts harvested this cycle: ${harvestedCount}`);
}

function addTokenToLocalStock(token, sourceOrderId) {
  for (let p of [STOCK_PATH_SRC, STOCK_PATH_API]) {
    try {
      let stock = [];
      if (fs.existsSync(p)) {
        stock = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
      stock.unshift({
        id: 'arbitrage_' + Date.now().toString(36),
        tokenData: token,
        isSold: false,
        source: 'ARBITRAGE_6H_HARVEST',
        originalOrderId: sourceOrderId,
        addedAt: new Date().toISOString()
      });
      fs.writeFileSync(p, JSON.stringify(stock, null, 2), 'utf8');
    } catch (e) {}
  }
}

function appendTokenToSteamTxt(token, steamId, sourceOrderId) {
  try {
    if (fs.existsSync(STEAM_TXT_PATH)) {
      const block = `\n--- [FREE ARBITRAGE REPLACEMENT] [SteamID: ${steamId}] (Harvested at 5h55m from Order: ${sourceOrderId} at ${new Date().toISOString()}) ---\n${token}\n`;
      fs.appendFileSync(STEAM_TXT_PATH, block, 'utf8');
    }
  } catch (e) {}
}

function recordArbitrageStats(orderId, newSteamId, productName) {
  try {
    let stats = {
      totalClientReplacements: 0,
      totalArbitrageHarvested: 0,
      estimatedProfitSavedUsd: 0,
      replacementsLog: []
    };

    if (fs.existsSync(STATS_PATH)) {
      stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
    }

    stats.totalArbitrageHarvested = (stats.totalArbitrageHarvested || 0) + 1;
    stats.estimatedProfitSavedUsd = Number(((stats.estimatedProfitSavedUsd || 0) + 0.2727).toFixed(4));
    stats.replacementsLog = stats.replacementsLog || [];
    stats.replacementsLog.push({
      type: 'ARBITRAGE_5H55M_HARVEST',
      orderId,
      newSteamId,
      productName,
      profitSavedUsd: 0.2727,
      harvestedAt: new Date().toISOString()
    });

    fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2), 'utf8');
  } catch (e) {}
}

/**
 * Initializes background interval scanner (every 5 minutes)
 */
export function startArbitrageCron() {
  console.log(`[ArbitrageWorker] 🚀 Background Cron Daemon started (Interval: 5 minutes)`);
  // Run first scan immediately
  runArbitrageScan().catch(e => console.error('[ArbitrageWorker] Initial scan error:', e));

  // Recurring 5-minute interval
  setInterval(() => {
    runArbitrageScan().catch(e => console.error('[ArbitrageWorker] Interval scan error:', e));
  }, 5 * 60 * 1000);
}
