import fs from 'fs';
import path from 'path';

// ============================================================================
// SHARPBUY ORDERS & CUSTOMER DATABASE ENGINE
// ============================================================================

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'orders_database.json');
const DB_FALLBACK = path.join(process.cwd(), 'api', 'orders_database.json');
const DESKTOP_ORDERS_LOG = path.join(process.cwd(), 'data', 'sharpbuy_orders_log.json');

/**
 * Reads all stored orders from database
 */
export function getAllOrders() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
    if (fs.existsSync(DB_FALLBACK)) {
      return JSON.parse(fs.readFileSync(DB_FALLBACK, 'utf-8'));
    }
    if (fs.existsSync(DESKTOP_ORDERS_LOG)) {
      return JSON.parse(fs.readFileSync(DESKTOP_ORDERS_LOG, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading orders database:', e);
  }
  return [];
}

/**
 * Saves a new order into the database with full audit trail
 */
function resolveOrderStatus(tokens, explicitStatus) {
  if (explicitStatus) return explicitStatus;
  const first = Array.isArray(tokens) ? tokens[0] : tokens;
  if (first === 'PROCURING') return 'PROCURING';
  if (typeof first === 'string' && first.startsWith('ERR_')) return 'FAILED';
  return 'PAID_DELIVERED';
}

export function getOrderById(orderId) {
  return getAllOrders().find(o => o.orderId === orderId) || null;
}

/** Orders waiting on supplier — need background fulfillment if client tab closed */
export function getProcuringOrders() {
  return getAllOrders().filter((o) => {
    const token = o.tokens?.[0];
    return token === 'PROCURING' && o.supplierOrderId;
  });
}

export function getOrderDeliveryFromDb(orderId) {
  const order = getOrderById(orderId);
  if (!order) return null;
  return {
    orderId: order.orderId,
    email: order.email,
    tokens: order.tokens,
    deliveryToken: order.tokens?.[0],
    status: order.status,
    supplierOrderId: order.supplierOrderId || null,
    productName: order.productName,
    amountRub: order.amountRub
  };
}

export function saveOrderToDb(orderData) {
  try {
    const orders = getAllOrders();
    
    // Check if order already recorded
    const existingIndex = orders.findIndex(o => o.orderId === orderData.orderId);
    
    const now = new Date();
    const warrantyHours = orderData.warrantyHours || 3;

    // ✅ FIX: Preserve original warranty start time on subsequent saves.
    // If the order already exists, keep its original warrantyExpiresAt and firstActivatedAt.
    // NEVER recompute from current time — that would reset the 3-hour timer on every login.
    const existingRecord = existingIndex >= 0 ? orders[existingIndex] : null;
    const warrantyExpiresAt = existingRecord?.warrantyExpiresAt
      || new Date(now.getTime() + warrantyHours * 60 * 60 * 1000).toISOString();
    const firstActivatedAt = existingRecord?.firstActivatedAt || now.toISOString();
    const tokens = Array.isArray(orderData.tokens)
      ? orderData.tokens
      : [orderData.tokenData || orderData.deliveryToken].filter(Boolean);

    const record = {
      orderId: orderData.orderId,
      email: orderData.email || orderData.buyerEmail,
      productId: orderData.productId || 'nfa_prime',
      productName: orderData.productName,
      quantity: orderData.quantity || 1,
      amountRub: orderData.amountRub || orderData.priceRub,
      cryptoAmount: orderData.cryptoAmount,
      currency: orderData.currency || orderData.currencyName,
      txHash: orderData.txHash || '0xBLOCKCHAIN_TX',
      tokens,
      supplierOrderId: orderData.supplierOrderId || existingRecord?.supplierOrderId || null,
      createdAt: orderData.createdAt || existingRecord?.createdAt || now.toISOString(),
      paidAt: existingRecord?.paidAt || now.toISOString(),
      firstActivatedAt: firstActivatedAt,
      warrantyExpiresAt: warrantyExpiresAt,
      warrantyHours: warrantyHours,
      status: resolveOrderStatus(tokens, orderData.status),
      emailSentAt: existingRecord?.emailSentAt || orderData.emailSentAt || null,
      customerIp: orderData.customerIp || '127.0.0.1',
      notes: orderData.notes || 'Automated Instant Delivery'
    };

    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...record };
    } else {
      orders.unshift(record); // newest first
    }

    // Save to project files
    try {
      const dir1 = path.dirname(DB_FILE);
      if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {}

    try {
      const dir2 = path.dirname(DB_FALLBACK);
      if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
      fs.writeFileSync(DB_FALLBACK, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {}

    // Also mirror directly onto the user's Desktop for 1-click local access
    try {
      fs.writeFileSync(DESKTOP_ORDERS_LOG, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (e) {}

    return record;
  } catch (err) {
    console.error('Error saving order to db:', err);
    return null;
  }
}

export function markOrderEmailSent(orderId) {
  try {
    const orders = getAllOrders();
    const existingIndex = orders.findIndex(o => o.orderId === orderId);
    if (existingIndex < 0) return;
    orders[existingIndex].emailSentAt = new Date().toISOString();
    const serialized = JSON.stringify(orders, null, 2);
    try { fs.writeFileSync(DB_FILE, serialized, 'utf-8'); } catch (e) {}
    try { fs.writeFileSync(DB_FALLBACK, serialized, 'utf-8'); } catch (e) {}
    try { fs.writeFileSync(DESKTOP_ORDERS_LOG, serialized, 'utf-8'); } catch (e) {}
  } catch (err) {
    console.error('Error marking email sent:', err);
  }
}

export function updateOrderDeliveryInDb(orderId, token) {
  try {
    const orders = getAllOrders();
    const existingIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (existingIndex >= 0) {
      orders[existingIndex].tokens = [token];
      orders[existingIndex].status = 'PAID_DELIVERED';
      
      // Save to project files
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf-8');
      } catch (e) {}

      try {
        fs.writeFileSync(DB_FALLBACK, JSON.stringify(orders, null, 2), 'utf-8');
      } catch (e) {}

      try {
        fs.writeFileSync(DESKTOP_ORDERS_LOG, JSON.stringify(orders, null, 2), 'utf-8');
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error updating order delivery in db:', err);
  }
}
