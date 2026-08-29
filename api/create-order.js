import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Master Merchant Wallets Configuration
const MERCHANT_EVM = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';

const CONFIG = {
  wallets: {
    USDT_BEP20: {
      address: MERCHANT_EVM,
      network: 'BSC (BEP-20)',
      symbol: 'USDT',
      name: 'USDT (BEP-20)',
      rateRub: 92.0,
      decimals: 4
    },
    BNB_BSC: {
      address: MERCHANT_EVM,
      network: 'BNB Smart Chain',
      symbol: 'BNB',
      name: 'BNB (BNB Chain)',
      rateUsd: 580.0,
      decimals: 5
    },
    USDT_POLYGON: {
      address: MERCHANT_EVM,
      network: 'Polygon Network',
      symbol: 'USDT',
      name: 'USDT (Polygon)',
      rateRub: 92.0,
      decimals: 4
    },
    USDT_ARBITRUM: {
      address: MERCHANT_EVM,
      network: 'Arbitrum One',
      symbol: 'USDT',
      name: 'USDT (Arbitrum)',
      rateRub: 92.0,
      decimals: 4
    },
    USDT_BASE: {
      address: MERCHANT_EVM,
      network: 'Base L2',
      symbol: 'USDT',
      name: 'USDT / USDC (Base)',
      rateRub: 92.0,
      decimals: 4
    },
    SOL: {
      address: '7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9SOL',
      network: 'Solana Mainnet',
      symbol: 'SOL',
      name: 'Solana (SOL)',
      rateUsd: 180.0,
      decimals: 4
    },
    TON: {
      address: 'EQDFX7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9TON',
      network: 'Telegram TON',
      symbol: 'TON',
      name: 'TON (The Open Network)',
      rateUsd: 5.2,
      decimals: 3
    },
    LTC: {
      address: 'LMzQj6sM4v1x7F3J5n8P0w2Y4z6T9r1E3s',
      network: 'Litecoin Mainnet',
      symbol: 'LTC',
      name: 'Litecoin (LTC)',
      rateUsd: 72.0,
      decimals: 6
    },
    BTC: {
      address: 'bc1qsharpbuy82k9m4v1x7f3j5n8p0w2y4z6t9r1e3s',
      network: 'Bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin (BTC)',
      rateUsd: 66000.0,
      decimals: 8
    }
  }
};

const BSC_RPCS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://1rpc.io/bnb'
];

async function fetchRpc(rpcs, method, params) {
  for (const rpc of rpcs) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
      });
      const json = await res.json();
      if (json && json.result !== undefined) return json.result;
    } catch (e) {}
  }
  return null;
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
    const { productId, productName, email, currency = 'USDT_BEP20', quantity = 1, unitPrice = 50 } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Укажите корректный Email для получения чека и аккаунта' });
    }

    const walletInfo = { ...(CONFIG.wallets[currency] || CONFIG.wallets.USDT_BEP20) };
    const priceRub = Number(unitPrice) * Number(quantity);
    const usdTotal = priceRub / 92.0;

    const microOffset = Math.floor(Math.random() * 90 + 10) / 10000;
    let cryptoAmount = 0;

    if (walletInfo.symbol === 'USDT') {
      cryptoAmount = Number((usdTotal + microOffset).toFixed(4));
    } else if (walletInfo.symbol === 'BNB') {
      cryptoAmount = Number(((usdTotal / walletInfo.rateUsd) + (microOffset / walletInfo.rateUsd)).toFixed(5));
    } else if (walletInfo.symbol === 'SOL') {
      cryptoAmount = Number(((usdTotal / walletInfo.rateUsd) + (microOffset / walletInfo.rateUsd)).toFixed(4));
    } else if (walletInfo.symbol === 'TON') {
      cryptoAmount = Number(((usdTotal / walletInfo.rateUsd) + (microOffset / walletInfo.rateUsd)).toFixed(3));
    } else if (walletInfo.symbol === 'LTC') {
      cryptoAmount = Number(((usdTotal / walletInfo.rateUsd) + (microOffset / 10)).toFixed(6));
    } else if (walletInfo.symbol === 'BTC') {
      cryptoAmount = Number(((usdTotal / walletInfo.rateUsd) + (microOffset / 100)).toFixed(8));
    }

    // Capture initial baseline balance for delta tracking
    let initialBalance = 0;
    try {
      if (currency === 'USDT_BEP20') {
        const bscData = '0x70a08231' + MERCHANT_EVM.replace('0x', '').padStart(64, '0');
        const hex = await fetchRpc(BSC_RPCS, 'eth_call', [{ to: '0x55d398326f99059fF775485246999027B3197955', data: bscData }, 'latest']);
        if (hex) initialBalance = Number(BigInt(hex)) / 1e18;
      } else if (currency === 'BNB_BSC') {
        const hex = await fetchRpc(BSC_RPCS, 'eth_getBalance', [MERCHANT_EVM, 'latest']);
        if (hex) initialBalance = Number(BigInt(hex)) / 1e18;
      }
    } catch (e) {
      initialBalance = 0;
    }

    const orderId = 'SHARP-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
    const createdAtTime = Math.floor(Date.now() / 1000);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Generate Payment URI
    let paymentUri = walletInfo.address;
    if (walletInfo.symbol === 'LTC') {
      paymentUri = `litecoin:${walletInfo.address}?amount=${cryptoAmount}`;
    } else if (walletInfo.symbol === 'BTC') {
      paymentUri = `bitcoin:${walletInfo.address}?amount=${cryptoAmount}`;
    } else if (walletInfo.symbol === 'SOL') {
      paymentUri = `solana:${walletInfo.address}?amount=${cryptoAmount}`;
    } else if (walletInfo.symbol === 'TON') {
      paymentUri = `ton://transfer/${walletInfo.address}?amount=${Math.round(cryptoAmount * 1e9)}`;
    }

    const qrDataUrl = await QRCode.toDataURL(paymentUri, { margin: 2, scale: 7 });

    const order = {
      orderId,
      productId: productId || '1776000000001',
      productName: productName || 'CS2 Premier Ready Instant Competitive',
      email,
      currency,
      currencyName: walletInfo.name,
      network: walletInfo.network,
      address: walletInfo.address,
      cryptoAmount,
      priceRub,
      symbol: walletInfo.symbol,
      qrDataUrl,
      paymentUri,
      initialBalance,
      createdAtTime,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt
    };

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: error.message });
  }
}
