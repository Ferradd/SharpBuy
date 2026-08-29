import { getAllOrders } from './_utils/orders-db.js';
import { getAllServerUsers } from './auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const orders = getAllOrders();
    const { orderId, email, authToken } = req.query;

    // Security Gate: No anonymous bulk querying or dumping
    if (!orderId && !email) {
      return res.status(200).json({
        success: true,
        count: orders.length,
        message: 'Order tracking active'
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const users = getAllServerUsers();

    // 1. If querying by orderId (Single customer tracking)
    if (orderId) {
      const order = orders.find(o => o.orderId.toLowerCase() === orderId.toLowerCase());
      if (!order) {
        return res.status(404).json({ success: false, error: 'Заказ не найден' });
      }

      // Sanitize tokens unless requested with buyer's email
      const isOwnerReq = cleanEmail && order.email.toLowerCase() === cleanEmail;
      
      const sanitized = {
        orderId: order.orderId,
        productName: order.productName,
        status: order.status,
        createdAt: order.createdAt,
        amountRub: order.amountRub,
        // Only return tokens if buyer verified their email
        tokens: isOwnerReq ? order.tokens : ['[SECURE_DELIVERY_TOKEN]']
      };

      return res.status(200).json({ success: true, order: sanitized });
    }

    // 2. If querying user order history by email
    if (cleanEmail) {
      // Must be a registered user on server
      if (!users[cleanEmail]) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      const userOrders = orders.filter(o => o.email && o.email.toLowerCase() === cleanEmail);

      // Return user orders
      return res.status(200).json({ 
        success: true, 
        count: userOrders.length, 
        orders: userOrders 
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid request parameters' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
