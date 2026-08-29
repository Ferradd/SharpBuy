import fs from 'fs';
import path from 'path';
import { verifySteamLogon } from '../api/steam-verify.js';

const STOCK_SRC = 'c:/Users/iliyk/Desktop/SharpBuy/src/data/stock_database.json';
const STOCK_API = 'c:/Users/iliyk/Desktop/SharpBuy/api/stock_database.json';
const STOCK_NFA = 'c:/Users/iliyk/Desktop/SharpBuy/src/data/stock_nfa_prime.json';

async function auditAndCleanStock() {
  console.log(`===========================================================`);
  console.log(`🚀 SHARPBUY STORE DATABASE DEEP AUDIT & AUTO-PURGE`);
  console.log(`===========================================================\n`);

  if (!fs.existsSync(STOCK_SRC)) {
    console.log(`Error: ${STOCK_SRC} not found!`);
    return;
  }

  const stock = JSON.parse(fs.readFileSync(STOCK_SRC, 'utf8'));
  console.log(`Loaded ${stock.length} accounts from store database...\n`);

  const cleanStock = [];
  const purgedAccounts = [];

  for (let i = 0; i < stock.length; i++) {
    const item = stock[i];
    const tokenStr = item.tokenData || '';
    const [steamid, refreshToken] = tokenStr.split('----');

    console.log(`[#${i + 1}/${stock.length}] Checking SteamID: ${item.steamId}...`);
    
    if (!refreshToken) {
      console.log(`   ❌ No refresh token! Purging...\n`);
      purgedAccounts.push(item);
      continue;
    }

    const res = await verifySteamLogon(refreshToken, steamid);
    if (res.isAlive) {
      console.log(`   🟢 100% LIVE: ${res.reason}\n`);
      cleanStock.push(item);
    } else {
      console.log(`   🔴 DEAD / REVOKED: ${res.reason} -> PURGING FROM STORE DB!\n`);
      purgedAccounts.push(item);
    }
  }

  console.log(`===========================================================`);
  console.log(`📊 AUDIT COMPLETE:`);
  console.log(`===========================================================`);
  console.log(`🟢 Live Verified Accounts Remaining: ${cleanStock.length}`);
  console.log(`🔴 Dead Accounts Purged:            ${purgedAccounts.length}\n`);

  // Write clean stock back
  fs.writeFileSync(STOCK_SRC, JSON.stringify(cleanStock, null, 2), 'utf8');
  if (fs.existsSync(STOCK_API)) {
    fs.writeFileSync(STOCK_API, JSON.stringify(cleanStock, null, 2), 'utf8');
  }
  if (fs.existsSync(STOCK_NFA)) {
    fs.writeFileSync(STOCK_NFA, JSON.stringify(cleanStock, null, 2), 'utf8');
  }

  console.log(`✅ Store stock database updated successfully! Only live accounts remain.`);
}

auditAndCleanStock();
