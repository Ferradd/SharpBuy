import { ensureOrderEmailSent } from './_utils/email-sender.js';
import { getOrderById } from './_utils/orders-db.js';

/**
 * Resend order email if delivery happened but email failed.
 * POST { orderId, email? }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { orderId, email } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId required' });
  }

  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (email && order.email.toLowerCase() !== String(email).trim().toLowerCase()) {
    return res.status(403).json({ success: false, error: 'Email does not match order' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ success: false, error: 'RESEND_API_KEY not configured on server' });
  }

  const result = await ensureOrderEmailSent(orderId, email ? { email } : {});

  if (result.success && !result.skipped) {
    return res.status(200).json({ success: true, message: 'Email sent', id: result.id });
  }
  if (result.skipped) {
    return res.status(200).json({ success: true, message: 'Email was already sent', skipped: true });
  }

  return res.status(500).json({ success: false, error: result.error || 'send_failed' });
}
