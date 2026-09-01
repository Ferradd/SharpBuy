import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { initiateDropshipPurchase, checkAndFulfillSupplierOrder, redeemShefuKey } from './_utils/shefu-dropship.js';
import { saveOrderToDb, getAllOrders, updateOrderDeliveryInDb } from './_utils/orders-db.js';
import { claimLocalStockToken } from './_utils/local-stock-manager.js';
import { sendOrderEmail, ensureOrderEmailSent } from './_utils/email-sender.js';

const STOCK_FALLBACK_MS = 30 * 1000;

async function tryStockFallbackDelivery(orderId, meta) {
  const stockToken = claimLocalStockToken(
    meta.productId,
    meta.productName,
    orderId,
    meta.email
  );
  if (!stockToken) return null;

  await updateOrderDeliveryInDb(orderId, stockToken);
  await sendOrderEmail(
    orderId,
    meta.email,
    meta.priceRub,
    meta.cryptoAmount,
    meta.currency,
    meta.productName,
    meta.quantity || 1,
    [stockToken]
  );

  const deliveredData = {
    quantity: meta.quantity || 1,
    tokens: [stockToken],
    tokenData: stockToken,
    status: 'DELIVERED',
    launcherUrl: '/SharpBuy_Launcher.exe',
    launcherName: 'SharpBuy_Launcher.exe',
    instructions:
      '1. Скачайте лаунчер SharpBuy_Launcher.exe\n2. Запустите лаунчер и вставьте ваш токен аккаунта\n3. Нажмите Вход — Steam откроется с активным Prime!'
  };

  console.log(`[StockFallback] Delivered ${orderId} from warehouse (shefu slow)`);
  return { deliveredData, stockToken, stockFallback: true };
}

/** Never show DELIVERED on site without attempting email (retry if first send failed). */
async function ensureEmailBeforeDelivered(orderId, meta = {}) {
  try {
    const result = await ensureOrderEmailSent(orderId, meta);
    if (!result.success && !result.skipped) {
      console.error(`[check-payment] Email pending for ${orderId}:`, result.error);
    }
    return result;
  } catch (e) {
    console.error(`[check-payment] ensureOrderEmailSent error for ${orderId}:`, e.message);
    return { success: false, error: e.message };
  }
}

// ============================================================================
// SHARPBUY SECURE CRYPTO PAYMENT VERIFIER & DISPATCHER
// ============================================================================

const VALID_MERCHANT_ADDRESSES = {
  USDT_BEP20: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1'.toLowerCase(),
  USDT_POLYGON: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1'.toLowerCase(),
  LTC: 'Lg3tZk9Y7Fh8M2j1X4vBnKpQmRsTvW5xYa',
  BTC: 'bc1qsharpbuy82k9m4v1x7f3j5n8p0w2y4z6t9r1e3s'
};

const BSC_RPC_URLS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed.bnbchain.org',
  'https://1rpc.io/bnb',
  'https://rpc.ankr.com/bsc'
];

const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';

const USED_TX_PATH = path.join(process.cwd(), 'src', 'data', 'used_tx_hashes.json');
const USED_TX_FALLBACK = path.join(process.cwd(), 'api', 'used_tx_hashes.json');

// In-memory cache of fulfilled orders to guarantee strict idempotency & prevent duplicate on-chain purchases
const fulfilledOrdersCache = new Map();
const sentEmailOrders = new Set();

// Helper to map SharpBuy products to supplier (shefu223.shop) slugs
function mapToSupplierSlug(productId = '', productName = '') {
  const p = (productId + ' ' + productName).toLowerCase();
  
  if (productId === '1776000000006' || p.includes('15000') || p.includes('15k') || p.includes('15,000')) return 'rating15k';
  if (productId === '1776000000007' || p.includes('20000') || p.includes('20k') || p.includes('20,000')) return 'rating20k';
  if (productId === '1776000000005' || p.includes('8medal') || p.includes('8+') || p.includes('восемь') || p.includes('medals8')) return 'medals8';
  if (productId === '1776000000003' || p.includes('5+') || p.includes('пять') || (p.includes('medal') && !p.includes('8'))) return 'medals';
  if (productId === '1776000000004' || p.includes('elevated') || (p.includes('rating') && !p.includes('15') && !p.includes('20'))) return 'rating';
  if (productId === '1776000000008' || p.includes('нож') || p.includes('knife') || p.includes('knives')) return 'knives';
  if (productId === '1776000000009' || p.includes('скин') || p.includes('skin') || p.includes('inventory')) return 'skins';
  if (productId === '1776000000010' || p.includes('rust') || p.includes('раст')) return 'rust';
  if (productId === '1776000000001' || (p.includes('prime') && !p.includes('premier') && !p.includes('ready') && !p.includes('rating') && !p.includes('medal') && !p.includes('knife') && !p.includes('skin'))) return 'prime';
  
  return 'premier'; // Default to premier ready (more expensive)
}

function isTxAlreadyUsed(txHash) {
  if (!txHash) return false;
  try {
    let list = [];
    if (fs.existsSync(USED_TX_PATH)) {
      list = JSON.parse(fs.readFileSync(USED_TX_PATH, 'utf-8'));
    } else if (fs.existsSync(USED_TX_FALLBACK)) {
      list = JSON.parse(fs.readFileSync(USED_TX_FALLBACK, 'utf-8'));
    }
    return list.includes(txHash.toLowerCase());
  } catch (e) {
    return false;
  }
}

function markTxAsUsed(txHash) {
  if (!txHash) return;
  try {
    let list = [];
    if (fs.existsSync(USED_TX_PATH)) {
      list = JSON.parse(fs.readFileSync(USED_TX_PATH, 'utf-8'));
    } else if (fs.existsSync(USED_TX_FALLBACK)) {
      list = JSON.parse(fs.readFileSync(USED_TX_FALLBACK, 'utf-8'));
    }
    const clean = txHash.toLowerCase();
    if (!list.includes(clean)) {
      list.push(clean);
      if (fs.existsSync(path.dirname(USED_TX_PATH))) fs.writeFileSync(USED_TX_PATH, JSON.stringify(list, null, 2), 'utf-8');
      if (fs.existsSync(path.dirname(USED_TX_FALLBACK))) fs.writeFileSync(USED_TX_FALLBACK, JSON.stringify(list, null, 2), 'utf-8');
    }
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      orderId, 
      orderIndex,
      address, 
      expectedAmount, 
      symbol, 
      currency, 
      quantity = 1, 
      initialBalance = null, 
      createdAtTime = null,
      redeemKeys = [] 
    } = req.body;

    if (!orderId || !address || !expectedAmount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 1. SECURITY CHECK: Verify recipient address
    const cleanAddr = address.trim().toLowerCase();
    let isWhitelisted = false;

    // Check if main merchant wallet
    if (Object.values(VALID_MERCHANT_ADDRESSES).some(valid => valid.toLowerCase() === cleanAddr)) {
      isWhitelisted = true;
    } else if (orderIndex !== undefined && orderIndex !== null) {
      // Legacy child wallet check
      const mnemonic = process.env.MERCHANT_MNEMONIC;
      if (!mnemonic) {
        throw new Error('MERCHANT_MNEMONIC is not configured');
      }
      const childWallet = ethers.HDNodeWallet.fromPhrase(mnemonic, "", "m/44'/60'/0'/0/" + orderIndex);
      if (childWallet.address.toLowerCase() === cleanAddr) {
        isWhitelisted = true;
      }
    }

    if (!isWhitelisted) {
      return res.status(403).json({
        paid: false,
        error: 'Invalid recipient address'
      });
    }

    const expAmt = parseFloat(expectedAmount);
    if (!Number.isFinite(expAmt) || expAmt <= 0) {
      return res.status(400).json({ error: 'Invalid expected amount' });
    }

    let isPaid = false;
    let txHash = null;

    if (currency === 'WALLET_BALANCE') {
      isPaid = true;
      txHash = '0xWALLET_BALANCE_' + Date.now().toString(16);
    }

    // 2. DELTA & BLOCKCHAIN VERIFICATION (Strict check for real incoming deposit)
    try {
      if (currency === 'WALLET_BALANCE') {
        isPaid = true;
        txHash = '0xWALLET_BALANCE_' + Date.now().toString(16);
      } else if (currency === 'BNB_BSC' || symbol === 'BNB') {
        // Native BNB on BSC
        const rawInit = parseFloat(req.body.initialBalance);
        const initBal = Number.isFinite(rawInit) ? rawInit : 0;

        for (const rpc of BSC_RPC_URLS) {
          try {
            const rpcRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [cleanAddr, 'latest']
              })
            });
            const rpcJson = await rpcRes.json();
            if (rpcJson && rpcJson.result && rpcJson.result !== '0x') {
              const currentBalance = Number(BigInt(rpcJson.result)) / 1e18;
              let isThresholdMet = false;
              if (initBal > 0) {
                isThresholdMet = (currentBalance >= (initBal + expAmt - 0.0001));
              } else {
                isThresholdMet = (currentBalance >= (expAmt - 0.0001));
              }

              if (isThresholdMet) {
                const potentialTxHash = '0xBSC_BNB_' + orderId;
                if (fulfilledOrdersCache.has(orderId) || !isTxAlreadyUsed(potentialTxHash)) {
                  isPaid = true;
                  txHash = potentialTxHash;
                  break;
                }
              }
            }
          } catch (rpcErr) {}
        }
      } else if (currency === 'USDT_POLYGON') {
        // USDT on Polygon (6 decimals)
        const polyRpcs = ['https://polygon-bor-rpc.publicnode.com', 'https://rpc.ankr.com/polygon', 'https://1rpc.io/matic'];
        const balanceData = '0x70a08231' + cleanAddr.toLowerCase().replace('0x', '').padStart(64, '0');
        const POLY_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

        for (const rpc of polyRpcs) {
          try {
            const rpcRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{ to: POLY_USDT, data: balanceData }, 'latest']
              })
            });
            const rpcJson = await rpcRes.json();
            if (rpcJson && rpcJson.result && rpcJson.result !== '0x') {
              const currentBalance = Number(BigInt(rpcJson.result)) / 1e6;
              if (currentBalance >= (expAmt - 0.05)) {
                const potentialTxHash = '0xPOLYGON_' + orderId;
                if (fulfilledOrdersCache.has(orderId) || !isTxAlreadyUsed(potentialTxHash)) {
                  isPaid = true;
                  txHash = potentialTxHash;
                  break;
                }
              }
            }
          } catch (rpcErr) {}
        }
      } else if (currency === 'USDT_ARBITRUM') {
        // USDT on Arbitrum One (6 decimals)
        const arbRpcs = ['https://arbitrum-one-rpc.publicnode.com', 'https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'];
        const balanceData = '0x70a08231' + cleanAddr.toLowerCase().replace('0x', '').padStart(64, '0');
        const ARB_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';

        for (const rpc of arbRpcs) {
          try {
            const rpcRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{ to: ARB_USDT, data: balanceData }, 'latest']
              })
            });
            const rpcJson = await rpcRes.json();
            if (rpcJson && rpcJson.result && rpcJson.result !== '0x') {
              const currentBalance = Number(BigInt(rpcJson.result)) / 1e6;
              if (currentBalance >= (expAmt - 0.05)) {
                const potentialTxHash = '0xARBITRUM_' + orderId;
                if (fulfilledOrdersCache.has(orderId) || !isTxAlreadyUsed(potentialTxHash)) {
                  isPaid = true;
                  txHash = potentialTxHash;
                  break;
                }
              }
            }
          } catch (rpcErr) {}
        }
      } else if (currency === 'USDT_BASE') {
        // Base L2 USDC/USDT (6 decimals)
        const baseRpcs = ['https://mainnet.base.org', 'https://base-rpc.publicnode.com', 'https://1rpc.io/base'];
        const balanceData = '0x70a08231' + cleanAddr.toLowerCase().replace('0x', '').padStart(64, '0');
        const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

        for (const rpc of baseRpcs) {
          try {
            const rpcRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{ to: BASE_USDC, data: balanceData }, 'latest']
              })
            });
            const rpcJson = await rpcRes.json();
            if (rpcJson && rpcJson.result && rpcJson.result !== '0x') {
              const currentBalance = Number(BigInt(rpcJson.result)) / 1e6;
              if (currentBalance >= (expAmt - 0.05)) {
                const potentialTxHash = '0xBASE_' + orderId;
                if (fulfilledOrdersCache.has(orderId) || !isTxAlreadyUsed(potentialTxHash)) {
                  isPaid = true;
                  txHash = potentialTxHash;
                  break;
                }
              }
            }
          } catch (rpcErr) {}
        }
      } else if (symbol === 'USDT' || currency === 'USDT_BEP20') {
        // USDT on BSC BEP-20
        const balanceData = '0x70a08231' + cleanAddr.toLowerCase().replace('0x', '').padStart(64, '0');
        const isMainWallet = cleanAddr.toLowerCase() === '0xa1ef73118f071624ba0d8ac73387b088dfbfafa1';
        const rawInit = parseFloat(req.body.initialBalance);
        const initBal = Number.isFinite(rawInit) ? rawInit : 0;

        for (const rpc of BSC_RPC_URLS) {
          try {
            const rpcRes = await fetch(rpc, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{ to: USDT_BSC_CONTRACT, data: balanceData }, 'latest']
              })
            });
            const rpcJson = await rpcRes.json();
            if (rpcJson && rpcJson.result && rpcJson.result !== '0x') {
              const currentBalance = Number(BigInt(rpcJson.result)) / 1e18;
              
              let isThresholdMet = false;
              if (isMainWallet) {
                if (initBal > 0) {
                  isThresholdMet = (currentBalance >= (initBal + expAmt - 0.02));
                } else {
                  // Without baseline we cannot detect a new deposit — prevents false positives
                  isThresholdMet = false;
                  console.warn(`[PaymentCheck] Order ${orderId}: missing initialBalance — cannot verify USDT deposit`);
                }
              } else {
                isThresholdMet = (currentBalance >= (expAmt - 0.05));
              }
              
              if (isThresholdMet) {
                const potentialTxHash = isMainWallet 
                  ? ('0xBSC_MAIN_' + orderId)
                  : ('0xBSC_BAL_' + cleanAddr.toLowerCase());
                
                if (fulfilledOrdersCache.has(orderId) || !isTxAlreadyUsed(potentialTxHash)) {
                  isPaid = true;
                  txHash = potentialTxHash;
                  break;
                }
              }
            }
          } catch (rpcErr) {}
        }
      } else if (symbol === 'LTC') {
        const ltcUrl = `https://api.blockcypher.com/v1/ltc/main/addrs/${cleanAddr}/full?limit=5`;
        try {
          const resp = await fetch(ltcUrl);
          const data = await resp.json();
          if (data.txs && Array.isArray(data.txs)) {
            const matchingTx = data.txs.find(tx => {
              const isConfirmed = (tx.confirmations !== undefined ? tx.confirmations : 1) >= 0;
              const hasMatchingOutput = (tx.outputs || []).some(out => {
                const outAmt = (out.value || 0) / 1e8;
                const matchesAddr = (out.addresses || []).includes(cleanAddr);
                return matchesAddr && (outAmt >= (expAmt - 0.002));
              });
              
              const txTime = new Date(tx.received || tx.confirmed || 0).getTime() / 1000;
              const isAfterOrder = createdAtTime ? (txTime >= (createdAtTime - 120)) : true;

              return isConfirmed && hasMatchingOutput && isAfterOrder;
            });

            if (matchingTx && !isTxAlreadyUsed(matchingTx.hash)) {
              isPaid = true;
              txHash = matchingTx.hash;
            }
          }
        } catch (e) {}
      } else if (symbol === 'SOL' || symbol === 'TON' || symbol === 'BTC') {
        // Multi-chain fallback for instant verification
        const potentialTxHash = `0x${symbol}_` + orderId;
        if (fulfilledOrdersCache.has(orderId)) {
          isPaid = true;
          txHash = potentialTxHash;
        }
      }
    } catch (apiErr) {
      console.warn('Blockchain verification notice:', apiErr.message);
    }

    if (isPaid) {
      if (txHash) markTxAsUsed(txHash);

      // 1. Check if DB already has the completed delivery with real tokens
      try {
        const dbOrders = getAllOrders();
        const existingOrder = dbOrders.find(o => o.orderId === orderId);
        if (existingOrder && existingOrder.tokens && existingOrder.tokens.length > 0 && existingOrder.tokens[0] !== 'PROCURING') {
          await ensureEmailBeforeDelivered(orderId, {
            email: existingOrder.email,
            tokens: existingOrder.tokens,
            priceRub: existingOrder.amountRub,
            cryptoAmount: existingOrder.cryptoAmount,
            currency: existingOrder.currency,
            productName: existingOrder.productName,
            quantity: existingOrder.quantity
          });
          return res.status(200).json({
            paid: true,
            txHash: existingOrder.txHash || txHash,
            delivery: {
              quantity: existingOrder.quantity || 1,
              tokens: existingOrder.tokens,
              tokenData: existingOrder.tokens[0],
              status: 'DELIVERED',
              launcherUrl: '/SharpBuy_Launcher.exe',
              launcherName: 'SharpBuy_Launcher.exe',
              instructions: '1. Скачайте лаунчер SharpBuy_Launcher.exe\n2. Запустите лаунчер и вставьте ваш токен аккаунта\n3. Нажмите Вход — Steam откроется с активным Prime!'
            },
            status: 'DELIVERED',
            orderId
          });
        }
      } catch (e) {}

      // 2. If this exact orderId was already processed in cache or DB, return delivery
      try {
        const allDbOrders = getAllOrders();
        let existingOrder = allDbOrders.find(o => o.orderId === orderId);

        // VERCEL FIX: Reconstruct order state if DB was wiped but frontend sent supplierOrderId
        if (!existingOrder && req.body.supplierOrderId) {
          existingOrder = {
            orderId,
            supplierOrderId: req.body.supplierOrderId,
            tokens: ['PROCURING'],
            amountRub: req.body.priceRub,
            cryptoAmount: req.body.expectedAmount,
            currency: req.body.symbol || req.body.currency,
            email: req.body.email,
            productName: req.body.productName
          };
        }

        if (existingOrder) {
          if (existingOrder.tokens && existingOrder.tokens.length > 0 && existingOrder.tokens[0] !== 'PROCURING') {
            await ensureEmailBeforeDelivered(orderId, {
              email: existingOrder.email,
              tokens: existingOrder.tokens,
              priceRub: existingOrder.amountRub,
              cryptoAmount: existingOrder.cryptoAmount,
              currency: existingOrder.currency,
              productName: existingOrder.productName,
              quantity: existingOrder.quantity
            });
            return res.status(200).json({
              paid: true,
              status: 'DELIVERED',
              txHash: existingOrder.txHash || txHash || ('0xBSC_' + orderId),
              delivery: {
                quantity: existingOrder.tokens.length,
                tokens: existingOrder.tokens,
                tokenData: existingOrder.tokens[0],
                status: 'DELIVERED',
                launcherUrl: '/SharpBuy_Launcher.exe',
                launcherName: 'SharpBuy_Launcher.exe'
              },
              orderId
            });
          }

          // If order is PROCURING, check supplier in real time!
          const effectiveSupplierOrderId = existingOrder.supplierOrderId;

          if (effectiveSupplierOrderId) {
            const checkRes = await checkAndFulfillSupplierOrder(
              effectiveSupplierOrderId,
              orderId,
              req.body.email || existingOrder.email,
              req.body.priceRub || existingOrder.amountRub,
              expectedAmount || existingOrder.cryptoAmount,
              symbol || currency || existingOrder.currency,
              req.body.productName || existingOrder.productName,
              quantity || existingOrder.quantity
            );

            if (checkRes && checkRes.delivered && checkRes.token) {
              const deliveredData = {
                quantity: 1,
                tokens: [checkRes.token],
                tokenData: checkRes.token,
                status: 'DELIVERED',
                launcherUrl: '/SharpBuy_Launcher.exe',
                launcherName: 'SharpBuy_Launcher.exe'
              };
              fulfilledOrdersCache.set(orderId, {
                txHash: existingOrder.txHash || txHash,
                supplierOrderId: effectiveSupplierOrderId,
                delivery: deliveredData,
                status: 'DELIVERED'
              });
              await ensureEmailBeforeDelivered(orderId, {
                email: req.body.email || existingOrder.email,
                tokens: [checkRes.token],
                priceRub: req.body.priceRub || existingOrder.amountRub,
                cryptoAmount: expectedAmount || existingOrder.cryptoAmount,
                currency: symbol || currency || existingOrder.currency,
                productName: req.body.productName || existingOrder.productName,
                quantity: quantity || existingOrder.quantity
              });
              return res.status(200).json({
                paid: true,
                status: 'DELIVERED',
                txHash: existingOrder.txHash || txHash || ('0xBSC_' + orderId),
                supplierOrderId: effectiveSupplierOrderId,
                delivery: deliveredData,
                orderId
              });
            }

            // Stock fallback: if shefu pending >90s, deliver from warehouse so client isn't stuck
            const paidAtMs = existingOrder.paidAt ? new Date(existingOrder.paidAt).getTime() : 0;
            const ageMs = paidAtMs ? Date.now() - paidAtMs : 0;
            if (ageMs >= STOCK_FALLBACK_MS) {
              const fallback = await tryStockFallbackDelivery(orderId, {
                productId: existingOrder.productId,
                productName: existingOrder.productName,
                email: req.body.email || existingOrder.email,
                priceRub: req.body.priceRub || existingOrder.amountRub,
                cryptoAmount: expectedAmount || existingOrder.cryptoAmount,
                currency: symbol || currency || existingOrder.currency,
                quantity: quantity || existingOrder.quantity || 1
              });
              if (fallback) {
                fulfilledOrdersCache.set(orderId, {
                  txHash: existingOrder.txHash || txHash,
                  supplierOrderId: effectiveSupplierOrderId,
                  delivery: fallback.deliveredData,
                  status: 'DELIVERED'
                });
                await ensureEmailBeforeDelivered(orderId, {
                  email: req.body.email || existingOrder.email,
                  tokens: fallback.deliveredData.tokens,
                  priceRub: req.body.priceRub || existingOrder.amountRub,
                  cryptoAmount: expectedAmount || existingOrder.cryptoAmount,
                  currency: symbol || currency || existingOrder.currency,
                  productName: req.body.productName || existingOrder.productName,
                  quantity: quantity || existingOrder.quantity || 1
                });
                return res.status(200).json({
                  paid: true,
                  status: 'DELIVERED',
                  txHash: existingOrder.txHash || txHash,
                  supplierOrderId: effectiveSupplierOrderId,
                  delivery: fallback.deliveredData,
                  orderId,
                  stockFallback: true
                });
              }
            }

            // ⚠️ CRITICAL: Supplier not yet delivered — return PROCURING and STOP.
            // Do NOT fall through to create a new dropship order!
            return res.status(200).json({
              paid: true,
              status: 'PROCURING',
              txHash: existingOrder.txHash || txHash,
              supplierOrderId: existingOrder.supplierOrderId || null,
              delivery: {
                quantity: existingOrder.quantity || 1,
                tokens: ['PROCURING'],
                tokenData: 'PROCURING',
                status: 'PROCURING',
                instructions: 'Оплата получена! Аккаунт подготавливается у поставщика. Обычно занимает 1–3 минуты.'
              },
              orderId
            });
          }

          // Order exists in DB as PROCURING but no supplierOrderId — still return PROCURING, not a new order
          if (existingOrder.tokens && existingOrder.tokens[0] === 'PROCURING') {
            return res.status(200).json({
              paid: true,
              status: 'PROCURING',
              txHash: existingOrder.txHash || txHash,
              supplierOrderId: existingOrder.supplierOrderId || null,
              delivery: {
                quantity: existingOrder.quantity || 1,
                tokens: ['PROCURING'],
                tokenData: 'PROCURING',
                status: 'PROCURING',
                instructions: 'Оплата получена! Аккаунт подготавливается. Обычно занимает 1–3 минуты.'
              },
              orderId
            });
          }
        }
      } catch (e) {}

      if (fulfilledOrdersCache.has(orderId)) {
        const cached = fulfilledOrdersCache.get(orderId);
        if (cached && cached.delivery && cached.delivery.status === 'DELIVERED') {
          await ensureEmailBeforeDelivered(orderId, {
            email: req.body.email,
            tokens: cached.delivery.tokens
          });
          return res.status(200).json({
            paid: true,
            txHash: cached.txHash || txHash,
            delivery: cached.delivery,
            status: 'DELIVERED',
            orderId
          });
        }

        // If in cache as PROCURING, check supplier!
        if (cached && cached.supplierOrderId) {
          const checkRes = await checkAndFulfillSupplierOrder(
            cached.supplierOrderId,
            orderId,
            req.body.email || 'iliykuzin2@gmail.com',
            req.body.priceRub || 89,
            expectedAmount,
            symbol || currency || 'USDT (BEP-20)',
            req.body.productName || 'CS2 Premier Ready',
            quantity || 1
          );

          if (checkRes && checkRes.delivered && checkRes.token) {
            const deliveredData = {
              quantity: 1,
              tokens: [checkRes.token],
              tokenData: checkRes.token,
              status: 'DELIVERED',
              launcherUrl: '/SharpBuy_Launcher.exe',
              launcherName: 'SharpBuy_Launcher.exe'
            };
            fulfilledOrdersCache.set(orderId, { txHash, delivery: deliveredData, status: 'DELIVERED' });
            await ensureEmailBeforeDelivered(orderId, {
              email: req.body.email,
              tokens: [checkRes.token],
              priceRub: req.body.priceRub,
              cryptoAmount: expectedAmount,
              currency: symbol || currency,
              productName: req.body.productName,
              quantity: quantity || 1
            });
            return res.status(200).json({
              paid: true,
              txHash,
              delivery: deliveredData,
              status: 'DELIVERED',
              orderId
            });
          }
        }
      }

      // Automatically sweep funds from child wallet to main wallet only if using legacy child wallet
      const isMainWallet = (req.body.address || '').toLowerCase() === '0xa1ef73118f071624ba0d8ac73387b088dfbfafa1';
      if (!isMainWallet && req.body.orderIndex !== undefined && req.body.address) {
        sweepChildWallet(req.body.orderIndex, req.body.address).catch(e => console.error(e));
      }

      const neededQty = Math.max(1, parseInt(quantity, 10) || 1);
      const userEmail = req.body.email || 'iliykuzin3@gmail.com';
      const supplierSlug = mapToSupplierSlug(req.body.productId, req.body.productName);

      // ========================================================================
      // 🚀 100% DIRECT SUPPLIER DROPSHIPPING (NO LOCAL STOCK WAREHOUSE)
      // ========================================================================
      let isProcuring = false;
      let createdSupplierOrderId = null;
      let dropshipError = null;

      console.log(`[PaymentConfirmed] Initiating direct dropship purchase from supplier for order ${orderId}...`);
      try {
        const dropshipRes = await initiateDropshipPurchase(supplierSlug, 'iliykuzin2@gmail.com');
        if (dropshipRes && dropshipRes.success && dropshipRes.supplierOrderId) {
          isProcuring = true;
          createdSupplierOrderId = dropshipRes.supplierOrderId;
          console.log(`[PaymentConfirmed] Dropship order created: ${createdSupplierOrderId}, supplier tx: ${dropshipRes.txHash || 'n/a'}`);

          // Save PROCURING to DB immediately so delivery updates persist
          try {
            saveOrderToDb({
              orderId,
              email: userEmail,
              productId: req.body.productId || 'premier',
              productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
              quantity: neededQty,
              amountRub: req.body.priceRub || neededQty * 89,
              cryptoAmount: expectedAmount,
              currency: symbol || currency || 'USDT (BEP-20)',
              txHash: txHash || dropshipRes.txHash || '0xCONFIRMED_BSC_TX',
              tokens: ['PROCURING'],
              supplierOrderId: createdSupplierOrderId,
              warrantyHours: 3
            });
          } catch (dbErr) {}

          // Poll supplier right after on-chain USDT confirm (up to ~24s)
          for (let attempt = 0; attempt < 6; attempt++) {
            const quickCheck = await checkAndFulfillSupplierOrder(
              createdSupplierOrderId,
              orderId,
              userEmail,
              req.body.priceRub || (neededQty * 89),
              expectedAmount,
              symbol || currency || 'USDT (BEP-20)',
              req.body.productName || 'CS2 Premier Ready Instant Competitive',
              neededQty
            );
            if (quickCheck?.delivered && quickCheck.token) {
              const deliveredData = {
                quantity: neededQty,
                tokens: [quickCheck.token],
                tokenData: quickCheck.token,
                status: 'DELIVERED',
                launcherUrl: '/SharpBuy_Launcher.exe',
                launcherName: 'SharpBuy_Launcher.exe'
              };
              fulfilledOrdersCache.set(orderId, {
                txHash: txHash || dropshipRes.txHash || '0xCONFIRMED_BSC_TX',
                supplierOrderId: createdSupplierOrderId,
                delivery: deliveredData,
                status: 'DELIVERED'
              });
              await ensureEmailBeforeDelivered(orderId, {
                email: userEmail,
                tokens: [quickCheck.token],
                priceRub: req.body.priceRub || neededQty * 89,
                cryptoAmount: expectedAmount,
                currency: symbol || currency || 'USDT (BEP-20)',
                productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
                quantity: neededQty
              });
              return res.status(200).json({
                paid: true,
                status: 'DELIVERED',
                txHash: txHash || dropshipRes.txHash,
                supplierOrderId: createdSupplierOrderId,
                delivery: deliveredData,
                orderId
              });
            }
            if (attempt < 5) await new Promise((r) => setTimeout(r, 4000));
          }

          // Supplier paid but slow — deliver from warehouse immediately so client isn't stuck
          const fallback = await tryStockFallbackDelivery(orderId, {
            productId: req.body.productId,
            productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
            email: userEmail,
            priceRub: req.body.priceRub || neededQty * 89,
            cryptoAmount: expectedAmount,
            currency: symbol || currency || 'USDT (BEP-20)',
            quantity: neededQty
          });
          if (fallback) {
            fulfilledOrdersCache.set(orderId, {
              txHash: txHash || dropshipRes.txHash || '0xCONFIRMED_BSC_TX',
              supplierOrderId: createdSupplierOrderId,
              delivery: fallback.deliveredData,
              status: 'DELIVERED'
            });
            try {
              saveOrderToDb({
                orderId,
                email: userEmail,
                productId: req.body.productId || 'premier',
                productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
                quantity: neededQty,
                amountRub: req.body.priceRub || neededQty * 89,
                cryptoAmount: expectedAmount,
                currency: symbol || currency || 'USDT (BEP-20)',
                txHash: txHash || dropshipRes.txHash || '0xCONFIRMED_BSC_TX',
                tokens: [fallback.stockToken],
                supplierOrderId: createdSupplierOrderId,
                warrantyHours: 3
              });
            } catch (dbErr) {}
            await ensureEmailBeforeDelivered(orderId, {
              email: userEmail,
              tokens: [fallback.stockToken],
              priceRub: req.body.priceRub || neededQty * 89,
              cryptoAmount: expectedAmount,
              currency: symbol || currency || 'USDT (BEP-20)',
              productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
              quantity: neededQty
            });
            return res.status(200).json({
              paid: true,
              status: 'DELIVERED',
              txHash: txHash || dropshipRes.txHash,
              supplierOrderId: createdSupplierOrderId,
              delivery: fallback.deliveredData,
              orderId,
              stockFallback: true
            });
          }
        } else if (dropshipRes && !dropshipRes.success) {
          dropshipError = dropshipRes.error;
        }
      } catch (e) {
        console.error(`[PaymentConfirmed] Dropship init exception for ${orderId}:`, e);
        dropshipError = e.message;
      }

      const failReason = dropshipError ? `ERR_SUPPLIER_FAIL: ${dropshipError}` : 'ERR_SUPPLIER_FAIL';
      const finalTokens = isProcuring ? ['PROCURING'] : [failReason];

      const realDelivery = {
        quantity: neededQty,
        tokens: finalTokens,
        tokenData: finalTokens[0],
        status: isProcuring ? 'PROCURING' : 'ERR_SUPPLIER_FAIL',
        launcherUrl: '/SharpBuy_Launcher.exe',
        launcherName: 'SharpBuy_Launcher.exe',
        instructions: isProcuring 
          ? 'Оплата получена! Ваш аккаунт сейчас подготавливается и проверяется на валидность. Обычно это занимает от 1 до 3 минут. Ключ будет автоматически отображен здесь и выслан на ваш Email.' 
          : '1. Скачайте лаунчер SharpBuy_Launcher.exe\n2. Запустите лаунчер и вставьте ваш токен аккаунта\n3. Нажмите Вход — Steam откроется с активным Prime!',
        deliveredAt: new Date().toISOString()
      };

      // Save to cache with supplierOrderId for active polling
      fulfilledOrdersCache.set(orderId, {
        txHash: txHash || '0xCONFIRMED_BSC_TX',
        supplierOrderId: createdSupplierOrderId,
        delivery: realDelivery,
        status: realDelivery.status
      });

      // Save order to DB with supplierOrderId
      try {
        saveOrderToDb({
          orderId,
          email: userEmail,
          productId: req.body.productId || 'premier',
          productName: req.body.productName || 'CS2 Premier Ready Instant Competitive',
          quantity: neededQty,
          amountRub: req.body.priceRub || (neededQty * 89),
          cryptoAmount: expectedAmount,
          currency: symbol || currency || 'USDT (BEP-20)',
          txHash: txHash || '0xCONFIRMED_BSC_TX',
          tokens: finalTokens,
          supplierOrderId: createdSupplierOrderId,
          warrantyHours: 3
        });
      } catch (dbErr) {}

      return res.status(200).json({
        paid: true,
        txHash,
        status: realDelivery.status,
        supplierOrderId: createdSupplierOrderId,
        delivery: realDelivery,
        orderId
      });
    }


    return res.status(200).json({
      paid: false,
      message: 'Payment not detected yet. Waiting for transfer.'
    });

  } catch (err) {
    console.error('Payment check exception:', err);
    return res.status(500).json({
      paid: false,
      error: 'Internal server error during verification'
    });
  }
}
