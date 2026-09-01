import crypto from 'crypto';
import { claimLocalStockToken } from './_utils/local-stock-manager.js';
import { sendOrderEmail } from './_utils/email-sender.js';
import { saveOrderToDb } from './orders-db.js';
import { fulfilledOrdersCache, sentEmailOrders } from './check-anypay-payment.js'; // We will create this

const ANYPAY_PROJECT_ID = process.env.ANYPAY_PROJECT_ID || '18241';
const ANYPAY_SECRET = process.env.ANYPAY_SECRET || 'S7A3yCFee529OXb9GlbyNR78mUHx4ZigAbzFeqc';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const data = req.body;
    console.log('[AnyPay Webhook] Received payload:', data);

    const { transaction_id, pay_id, status, amount, currency, profit, sign, email } = data;

    if (status !== 'paid') {
      return res.status(200).send('OK');
    }

    // Verify signature (AnyPay webhook signature format)
    // hash(currency + ':' + amount + ':' + pay_id + ':' + merchant_id + ':' + status + ':' + secret_key)
    const signString = [currency, amount, pay_id, ANYPAY_PROJECT_ID, status, ANYPAY_SECRET].join(':');
    const expectedSign = crypto.createHash('sha256').update(signString).digest('hex');

    if (sign !== expectedSign) {
      console.warn(`[AnyPay] Invalid signature! Expected: ${expectedSign}, Got: ${sign}`);
      // In production, we might reject, but for resilience let's log and proceed if we really want to, 
      // but rejecting is safer to prevent fake webhooks.
      return res.status(400).send('Invalid signature');
    }

    const orderId = pay_id;
    const buyerEmail = email || 'customer@sharpbuy.org';
    const productName = 'Steam NFA Account'; 
    const productId = 'premier';

    console.log(`[AnyPay] Payment confirmed for order ${orderId} (Amt: ${amount} ${currency})`);

    // 1. Claim from local stock
    const token = claimLocalStockToken(productId, productName, orderId, buyerEmail);
    const steamId = token.split('----')[0] || '';
    const accountName = productName;
    const expSeconds = 2592000;

    const delivery = {
      orderId,
      productName,
      token,
      tokens: [token],
      tokenData: token,
      accountName,
      steamId,
      expSeconds,
      status: 'DELIVERED',
      launcherUrl: '/SharpBuy_Launcher.exe',
      launcherName: 'SharpBuy_Launcher.exe',
      instructions: '1. Скачайте лаунчер SharpBuy_Launcher.exe\n2. Запустите лаунчер и вставьте ваш токен аккаунта\n3. Нажмите Вход — Steam откроется с активным Prime!',
      paidAmountRub: amount,
      paymentMethod: 'SBP / Bank Card (AnyPay)',
      paidAt: new Date().toISOString()
    };

    // Store in memory cache for polling
    if (fulfilledOrdersCache) {
      fulfilledOrdersCache.set(orderId, delivery);
    }

    // 2. Save to DB
    try {
      saveOrderToDb({
        orderId,
        orderIndex: Date.now(),
        productId,
        productName,
        priceUsd: Math.round((Number(amount) / 95) * 100) / 100,
        amountRub: Number(amount),
        paidAmount: amount + ' RUB',
        currency: 'RUB',
        paymentMethod: 'SBP / Bank Card (AnyPay)',
        paymentAddress: 'AnyPay Tx: ' + transaction_id,
        buyerEmail,
        txHash: 'AP_' + transaction_id,
        tokens: [token],
        deliveryToken: token,
        accountName,
        steamId,
        status: 'PAID_DELIVERED',
        createdAt: new Date().toISOString()
      });
    } catch (dbErr) {}

    // 3. Send email receipt
    if (buyerEmail && sentEmailOrders && !sentEmailOrders.has(orderId)) {
      sentEmailOrders.add(orderId);
      try {
        await sendOrderEmail(
          orderId,
          buyerEmail,
          amount,
          (Number(amount) / 95).toFixed(2),
          'RUB',
          productName,
          1,
          [token]
        );
      } catch (emErr) {
        console.error('[AnyPay] Email dispatch error:', emErr);
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[AnyPay Webhook] Error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
