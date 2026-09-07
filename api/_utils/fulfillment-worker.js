/**
 * Background fulfillment for PROCURING orders.
 * Runs when the client closes the tab before the supplier delivers the key.
 * NEVER delivers warehouse/fake stock for dropship SKUs.
 */
import { getProcuringOrders, getOrdersNeedingSupplierReplace, getOrdersMissingEmail } from './orders-db.js';
import { checkAndFulfillSupplierOrder, getSupplierOrderStatus } from './shefu-dropship.js';
import { sendOrderEmail } from './email-sender.js';

const STUCK_ALERT_MS = 8 * 60 * 1000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  console.warn('[FulfillmentWorker] ADMIN_EMAIL not set in environment - alerts will be disabled');
}
const alertedOrders = new Set();

let isRunning = false;

async function sendStuckOrderAlert(order, supplierStatus) {
  if (alertedOrders.has(order.orderId)) return;
  if (!ADMIN_EMAIL) {
    console.warn('[FulfillmentWorker] Cannot alert admin — ADMIN_EMAIL not configured');
    return;
  }
  alertedOrders.add(order.orderId);

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('[FulfillmentWorker] Cannot alert admin — RESEND_API_KEY missing');
    return;
  }

  const ageMin = Math.round((Date.now() - new Date(order.paidAt || order.createdAt).getTime()) / 60000);
  const body = `
    <h2>⚠️ SharpBuy — заказ завис у поставщика</h2>
    <p><b>Order:</b> ${order.orderId}</p>
    <p><b>Supplier ID:</b> ${order.supplierOrderId}</p>
    <p><b>Возраст:</b> ${ageMin} мин</p>
    <p><b>Shefu status:</b> ${supplierStatus.status}</p>
    <p><b>Message:</b> ${supplierStatus.message || '—'}</p>
    <p>Клиент оплатил, мы оплатили shefu — ключ ещё не пришёл. Проверь shefu223 / NOWPayments.</p>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SharpBuy Alerts <orders@sharpbuy.org>',
        to: [ADMIN_EMAIL],
        subject: `⚠️ STUCK ORDER ${order.orderId} (${ageMin}m) — shefu: ${supplierStatus.status}`,
        html: body
      })
    });
    console.log(`[FulfillmentWorker] Admin alert sent for ${order.orderId}`);
  } catch (e) {
    console.error('[FulfillmentWorker] Admin alert failed:', e.message);
  }
}

export async function runFulfillmentScan() {
  if (isRunning) {
    return { skipped: true };
  }

  isRunning = true;
  const results = { scanned: 0, delivered: 0, replaced: 0, errors: 0, orderIds: [], stuck: [], emailErrors: [] };

  try {
    const pending = getProcuringOrders();
    const replaceCandidates = getOrdersNeedingSupplierReplace();
    const missingEmail = getOrdersMissingEmail();
    const byId = new Map();
    for (const o of [...pending, ...replaceCandidates]) {
      if (o?.orderId) byId.set(o.orderId, o);
    }
    const queue = [...byId.values()];
    results.scanned = queue.length + missingEmail.length;

    if (queue.length === 0 && missingEmail.length === 0) {
      return results;
    }

    console.log(`[FulfillmentWorker] Scanning ${queue.length} supplier order(s) + ${missingEmail.length} missing-email...`);

    for (const order of queue) {
      try {
        const ageMs = Date.now() - new Date(order.paidAt || order.createdAt).getTime();

        if (!order.supplierOrderId) {
          results.stuck.push({
            orderId: order.orderId,
            ageMin: Math.round(ageMs / 60000),
            issue: 'missing_supplier_order_id'
          });
          continue;
        }

        const supplierStatus = await getSupplierOrderStatus(order.supplierOrderId);

        if (!supplierStatus.fulfilled && ageMs >= STUCK_ALERT_MS) {
          await sendStuckOrderAlert(order, supplierStatus);
          results.stuck.push({
            orderId: order.orderId,
            ageMin: Math.round(ageMs / 60000),
            supplierStatus: supplierStatus.status,
            message: supplierStatus.message
          });
        }

        if (!supplierStatus.fulfilled) {
          console.log(
            `[FulfillmentWorker] Waiting on supplier for ${order.orderId} (${supplierStatus.status}) — no stock fallback`
          );
          continue;
        }

        const wasAlreadyDelivered = order.tokens?.[0] && order.tokens[0] !== 'PROCURING' && !String(order.tokens[0]).startsWith('ERR_');

        const res = await checkAndFulfillSupplierOrder(
          order.supplierOrderId,
          order.orderId,
          order.email,
          order.amountRub,
          order.cryptoAmount,
          order.currency,
          order.productName,
          order.quantity || 1,
          { forceEmail: true }
        );

        if (res?.delivered) {
          results.delivered += 1;
          if (wasAlreadyDelivered) results.replaced += 1;
          results.orderIds.push(order.orderId);
          if (res.emailError) results.emailErrors.push({ orderId: order.orderId, error: res.emailError });
          console.log(`[FulfillmentWorker] REAL supplier delivered ${order.orderId}${wasAlreadyDelivered ? ' (replaced fake stock)' : ''}`);
        } else if (res?.error) {
          results.errors += 1;
        }
      } catch (err) {
        results.errors += 1;
        console.error(`[FulfillmentWorker] Error on ${order.orderId}:`, err.message);
      }
    }

    // Resend receipt emails for delivered orders that never got mail
    for (const order of missingEmail) {
      if (byId.has(order.orderId)) continue; // already handled above
      try {
        const emailResult = await sendOrderEmail(
          order.orderId,
          order.email,
          order.amountRub,
          order.cryptoAmount,
          order.currency,
          order.productName,
          order.quantity || 1,
          order.tokens,
          { force: true }
        );
        if (emailResult.success && !emailResult.skipped) {
          results.orderIds.push(order.orderId);
          console.log(`[FulfillmentWorker] Sent missing receipt for ${order.orderId}`);
        } else if (!emailResult.success) {
          results.emailErrors.push({ orderId: order.orderId, error: emailResult.error });
        }
      } catch (err) {
        results.emailErrors.push({ orderId: order.orderId, error: err.message });
      }
    }
  } finally {
    isRunning = false;
  }

  return results;
}

export function startFulfillmentCron(intervalMs = 15_000) {
  console.log(`[FulfillmentWorker] Cron started (every ${Math.round(intervalMs / 1000)}s)`);
  // Initial scan shortly after boot
  setTimeout(() => {
    runFulfillmentScan().catch((e) => console.error('[FulfillmentWorker] boot scan:', e.message));
  }, 5_000);
  setInterval(() => {
    runFulfillmentScan().catch((e) => console.error('[FulfillmentWorker] scan:', e.message));
  }, intervalMs);
}
