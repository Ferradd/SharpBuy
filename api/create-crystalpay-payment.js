const CRYSTALPAY_AUTH_LOGIN = process.env.CRYSTALPAY_LOGIN || 'sharpbuyes';
const CRYSTALPAY_AUTH_SECRET = process.env.CRYSTALPAY_SECRET || '9bf4b72260455580d400372934858fa84c9b0387';
const CRYSTALPAY_SALT = process.env.CRYSTALPAY_SALT || 'a670e874374df410c30e6cd288644dd0bc3f5b94';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
    
    // Calculate final RUB amount (if priceRub not supplied, convert priceUsd with rate ~95)
    let amountRub = 0;
    if (priceRub && Number(priceRub) > 0) {
      amountRub = Math.round(Number(priceRub) * qty);
    } else if (priceUsd && Number(priceUsd) > 0) {
      amountRub = Math.round(Number(priceUsd) * 95 * qty);
    } else {
      amountRub = Math.round(150 * qty); // fallback
    }

    const orderId = 'SHARP-CP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const extraData = JSON.stringify({
      orderId,
      productId: productId || 'custom',
      productName: productName || 'Steam NFA Account',
      quantity: qty,
      email: email.trim(),
      buyerTelegram: buyerTelegram.trim(),
      amountRub
    });

    const payload = {
      auth_login: CRYSTALPAY_AUTH_LOGIN,
      auth_secret: CRYSTALPAY_AUTH_SECRET,
      amount: amountRub,
      type: 'purchase',
      description: `SharpBuy: ${productName || 'Steam Account'} (x${qty}) - Заказ #${orderId}`,
      redirect_url: redirectUrl,
      callback_url: 'https://sharpbuy.org/api/crystalpay-webhook',
      lifetime: 60,
      extra: extraData
    };

    const cpRes = await fetch('https://api.crystalpay.io/v2/invoice/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const cpData = await cpRes.json();

    if (cpData.error) {
      console.error('[CrystalPay] Create invoice error:', cpData.errors);
      return res.status(400).json({ 
        success: false, 
        error: cpData.errors ? cpData.errors.join(', ') : 'Failed to create payment invoice' 
      });
    }

    return res.status(200).json({
      success: true,
      orderId,
      invoiceId: cpData.id,
      paymentUrl: cpData.url,
      amount: amountRub,
      currency: 'RUB',
      lifetime: 60
    });

  } catch (err) {
    console.error('[CrystalPay] Handler exception:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
