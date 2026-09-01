import crypto from 'crypto';

const ANYPAY_PROJECT_ID = process.env.ANYPAY_PROJECT_ID || '18241';
const ANYPAY_SECRET = process.env.ANYPAY_SECRET || '6Q9Pw4m6QPPhDlYWmSaq2ZoD8RzQczsQdWD1Ydi';

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

    // Pay ID must be pure numeric for AnyPay (digits 0-9)
    const pay_id = Date.now().toString().substring(0, 14);
    const amount = amountRub.toFixed(2);
    const currency = 'RUB';
    const desc = `SharpBuy: ${(productName || 'Steam Account').substring(0, 30)}`;
    const success_url = 'https://sharpbuy.org/success';
    const fail_url = 'https://sharpbuy.org/fail';

    // SHA256: merchant_id:pay_id:amount:currency:desc:success_url:fail_url:secret_key
    const arr_sign = [ANYPAY_PROJECT_ID, pay_id, amount, currency, desc, success_url, fail_url, ANYPAY_SECRET];
    const sign = crypto.createHash('sha256').update(arr_sign.join(':')).digest('hex');

    const params = new URLSearchParams({
      merchant_id: ANYPAY_PROJECT_ID,
      pay_id,
      amount,
      currency,
      desc,
      success_url,
      fail_url,
      sign,
      email: email.trim()
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
