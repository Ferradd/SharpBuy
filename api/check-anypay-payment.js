import { getOrderDeliveryFromDb } from './orders-db.js';

export const fulfilledOrdersCache = new Map();
export const sentEmailOrders = new Set();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { orderId } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' });
  }

  try {
    // 1. Check in-memory webhook cache
    if (fulfilledOrdersCache.has(orderId)) {
      const delivery = fulfilledOrdersCache.get(orderId);
      return res.status(200).json({
        paid: true,
        status: delivery.status || 'DELIVERED',
        delivery,
        orderId
      });
    }

    // 2. Check local database
    const dbDelivery = getOrderDeliveryFromDb(orderId);
    if (dbDelivery && dbDelivery.status && dbDelivery.status.includes('DELIVERED')) {
      return res.status(200).json({
        paid: true,
        status: 'DELIVERED',
        delivery: {
          quantity: dbDelivery.tokens ? dbDelivery.tokens.length : 1,
          tokens: dbDelivery.tokens,
          tokenData: dbDelivery.tokens ? dbDelivery.tokens[0] : dbDelivery.deliveryToken,
          status: 'DELIVERED',
          launcherUrl: '/SharpBuy_Launcher.exe',
          launcherName: 'SharpBuy_Launcher.exe',
          instructions: '1. Скачайте лаунчер SharpBuy_Launcher.exe\n2. Запустите лаунчер и вставьте ваш токен аккаунта\n3. Нажмите Вход — Steam откроется с активным Prime!'
        },
        orderId
      });
    }

    return res.status(200).json({
      paid: false,
      status: 'PENDING',
      orderId
    });
  } catch (err) {
    console.error('[AnyPay] Poll error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
