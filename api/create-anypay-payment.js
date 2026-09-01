import crypto from 'crypto';

const ANYPAY_PROJECT_ID = process.env.ANYPAY_PROJECT_ID || '18241';
const ANYPAY_SECRET = process.env.ANYPAY_SECRET || 'S7A3yCFee529OXb9GlbyNR78mUHx4ZigAbzFeqc';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { 
      productId, 
      productName, 
      priceUsd, 
      priceRub, 
      quantity = 1, 
      email = '', 
      buyerTelegram = '',
      redirectUrl = 'https://sharpbuy.org'
    } = req.body || {};

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    
    let amountRub = 0;
    if (priceRub && Number(priceRub) > 0) {
      amountRub = Math.round(Number(priceRub) * qty);
    } else if (priceUsd && Number(priceUsd) > 0) {
      amountRub = Math.round(Number(priceUsd) * 95 * qty);
    } else {
      amountRub = Math.round(150 * qty);
    }

    const pay_id = 'SHARP-AP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const amount = amountRub.toFixed(2); // AnyPay expects formatted numeric string
    const currency = 'RUB';
    const desc = `SharpBuy: ${(productName || 'Steam Account').substring(0, 40)} x${qty}`;
    const success_url = 'https://sharpbuy.org/';
    const fail_url = 'https://sharpbuy.org/';

    const signString = [ANYPAY_PROJECT_ID, pay_id, amount, currency, desc, success_url, fail_url, ANYPAY_SECRET].join(':');
    const sign = crypto.createHash('sha256').update(signString).digest('hex');

    const params = new URLSearchParams({
      merchant_id: ANYPAY_PROJECT_ID,
      pay_id,
      amount,
      currency,
      desc,
      success_url,
      fail_url,
      sign,
      email: email.trim() // Pass email to prepopulate if possible
    });

    const url = 'https://anypay.io/merchant?' + params.toString();

    // Cache initial intent (to store buyerEmail, etc. before webhook arrives)
    // Here we could use a redis or simple memory store, but webhook will have pay_id.
    // For now, webhook will just fulfill with default values or we can save order intent to DB.

    return res.status(200).json({
      success: true,
      url,
      orderId: pay_id,
      amountRub
    });
  } catch (err) {
    console.error('[AnyPay] Create error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
