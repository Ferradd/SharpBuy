// ============================================================================
// MANUAL EMAIL SENDER FOR TESTING
// ============================================================================

import { sendOrderEmail } from './_utils/email-sender.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      email, 
      token, 
      orderId = 'MANUAL-' + Date.now(),
      productName = 'CS2 Premier Ready Instant Competitive',
      priceRub = 50,
      cryptoAmount = 0.54,
      currency = 'USDT (BEP-20)',
      quantity = 1
    } = req.body;

    if (!email || !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and token are required' 
      });
    }

    console.log(`[ManualEmail] Sending email to ${email} with token ${token}`);

    const emailResult = await sendOrderEmail(
      orderId,
      email,
      priceRub,
      cryptoAmount,
      currency,
      productName,
      quantity,
      [token],
      { force: true }
    );

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        email,
        orderId,
        resendId: emailResult.id
      });
    } else {
      return res.status(500).json({
        success: false,
        error: emailResult.error,
        details: emailResult
      });
    }

  } catch (error) {
    console.error('[ManualEmail] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}