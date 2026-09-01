import { initiateDropshipPurchase, checkAndFulfillSupplierOrder, redeemShefuKey } from './_utils/shefu-dropship.js';
import { saveOrderToDb, getAllOrders } from './_utils/orders-db.js';
import { claimLocalStockToken } from './_utils/local-stock-manager.js';
import { sendOrderEmail } from './_utils/email-sender.js';

const CRYSTALPAY_AUTH_LOGIN = process.env.CRYSTALPAY_LOGIN || 'sharpbuyes';
const CRYSTALPAY_AUTH_SECRET = process.env.CRYSTALPAY_SECRET || '9bf4b72260455580d400372934858fa84c9b0387';

// Cache fulfilled orders to prevent double delivery on repeated poll requests
const fulfilledOrdersCache = new Map();
const sentEmailOrders = new Set();

function mapToSupplierSlug(productId = '', productName = '') {
  const p = (productId + ' ' + productName).toLowerCase();
  if (productId === '1776000000006' || p.includes('15000') || p.includes('15k')) return 'rating15k';
  if (productId === '1776000000007' || p.includes('20000') || p.includes('20k')) return 'rating20k';
  if (productId === '1776000000005' || p.includes('8medal') || p.includes('8+')) return 'medals8';
  if (productId === '1776000000003' || p.includes('5+')) return 'medals';
  if (productId === '1776000000004' || p.includes('elevated')) return 'rating';
  if (productId === '1776000000008' || p.includes('нож') || p.includes('knife')) return 'knives';
  if (productId === '1776000000009' || p.includes('скин') || p.includes('skin')) return 'skins';
  if (productId === '1776000000010' || p.includes('rust') || p.includes('раст')) return 'rust';
  if (productId === '1776000000001' || p.includes('prime')) return 'prime';
  return 'premier';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { invoiceId, orderId } = req.body || {};

    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'invoiceId is required' });
    }

    // Check if order was already fulfilled in memory
    if (orderId && fulfilledOrdersCache.has(orderId)) {
      return res.status(200).json({
        success: true,
        paid: true,
        fulfilled: true,
        delivery: fulfilledOrdersCache.get(orderId)
      });
    }

    // Call CrystalPay API to verify invoice status
    const cpRes = await fetch('https://api.crystalpay.io/v2/invoice/info/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_login: CRYSTALPAY_AUTH_LOGIN,
        auth_secret: CRYSTALPAY_AUTH_SECRET,
        id: invoiceId
      })
    });

    const cpData = await cpRes.json();

    if (cpData.error) {
      return res.status(400).json({ success: false, error: cpData.errors ? cpData.errors.join(', ') : 'Invoice query error' });
    }

    const state = (cpData.state || '').toLowerCase();

    if (state !== 'payed') {
      return res.status(200).json({
        success: true,
        paid: false,
        state: cpData.state || 'notpayed',
        message: 'Payment not yet received or still processing'
      });
    }

    // Payment is verified! Parse extra metadata
    let extra = {};
    try {
      extra = typeof cpData.extra === 'string' ? JSON.parse(cpData.extra) : (cpData.extra || {});
    } catch (e) {}

    const resolvedOrderId = orderId || extra.orderId || ('SHARP-CP-' + invoiceId);
    const productId = extra.productId || 'custom';
    const productName = extra.productName || 'Steam NFA Account';
    const buyerEmail = (extra.email || '').trim();
    const supplierSlug = mapToSupplierSlug(productId, productName);

    // Fulfill: 1. Try local stock first
    let token = '';
    let accountName = '';
    let steamId = '';
    let expSeconds = 0;
    let localItem = claimLocalStockToken(supplierSlug);

    if (localItem && localItem.token) {
      token = localItem.token;
      accountName = localItem.accountName || '';
      steamId = localItem.steamId || '';
      expSeconds = localItem.expSeconds || 0;
    } else {
      // 2. Dropship purchase if no local stock
      try {
        const dropshipRes = await initiateDropshipPurchase(supplierSlug, buyerEmail || 'crystalpay@sharpbuy.org');
        if (dropshipRes && dropshipRes.token) {
          token = dropshipRes.token;
          accountName = dropshipRes.accountName || '';
          steamId = dropshipRes.steamId || '';
        }
      } catch (dsErr) {
        console.error('[CrystalPay] Dropship error:', dsErr);
      }
    }

    const delivery = {
      orderId: resolvedOrderId,
      productName,
      token: token || 'PENDING_DISPATCH',
      accountName: accountName || 'Steam Account',
      steamId: steamId || '',
      expSeconds: expSeconds || 2592000,
      paidAmountRub: cpData.amount,
      paymentMethod: 'SBP / Bank Card (CrystalPay)',
      paidAt: new Date().toISOString()
    };

    fulfilledOrdersCache.set(resolvedOrderId, delivery);

    // Save to orders database
    try {
      saveOrderToDb({
        orderId: resolvedOrderId,
        orderIndex: Date.now(),
        productId,
        productName,
        priceUsd: Math.round((cpData.amount / 95) * 100) / 100,
        paidAmount: cpData.amount + ' RUB',
        currency: 'RUB',
        paymentMethod: 'SBP / Bank Card',
        paymentAddress: 'CrystalPay #' + invoiceId,
        buyerEmail,
        buyerTelegram: extra.buyerTelegram || '',
        txHash: 'CP_' + invoiceId,
        deliveryToken: token,
        accountName,
        steamId,
        status: 'PAID',
        createdAt: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error('[CrystalPay] Orders DB save error:', dbErr);
    }

    // Send email receipt
    if (buyerEmail && !sentEmailOrders.has(resolvedOrderId)) {
      sentEmailOrders.add(resolvedOrderId);
      try {
        await sendOrderEmail(buyerEmail, {
          orderId: resolvedOrderId,
          productName,
          token,
          accountName,
          steamId,
          paidAmount: cpData.amount + ' RUB'
        });
      } catch (emErr) {
        console.error('[CrystalPay] Email dispatch error:', emErr);
      }
    }

    return res.status(200).json({
      success: true,
      paid: true,
      fulfilled: true,
      delivery
    });

  } catch (err) {
    console.error('[CrystalPay] Check handler exception:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
