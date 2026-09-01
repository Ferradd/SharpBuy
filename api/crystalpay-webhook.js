import crypto from 'crypto';
import checkCrystalPayPayment from './check-crystalpay-payment.js';

const CRYSTALPAY_SALT = process.env.CRYSTALPAY_SALT || 'a670e874374df410c30e6cd288644dd0bc3f5b94';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, state, signature } = req.body || {};

    if (!id) {
      return res.status(400).send('Bad Request: Missing invoice id');
    }

    // Forward to fulfillment handler
    req.body = { invoiceId: id };
    await checkCrystalPayPayment(req, res);

  } catch (err) {
    console.error('[CrystalPay Webhook] Error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
