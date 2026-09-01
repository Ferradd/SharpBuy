/**
 * Background fulfillment for PROCURING orders.
 * Runs when the client closes the tab before the supplier delivers the key.
 */
import { getProcuringOrders, updateOrderDeliveryInDb } from './orders-db.js';
import { checkAndFulfillSupplierOrder, getSupplierOrderStatus } from './shefu-dropship.js';
import { claimLocalStockToken } from './local-stock-manager.js';
import { sendOrderEmail } from './email-sender.js';

const STUCK_ALERT_MS = 8 * 60 * 1000;
const STOCK_FALLBACK_MS = 30 * 1000; // 30s — deliver from warehouse if shefu still pending
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iliykuzin2@gmail.com';
const alertedOrders = new Set();

let isRunning = false;

async function sendStuckOrderAlert(order, supplierStatus) {
  if (alertedOrders.has(order.orderId)) return;
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
  const results = { scanned: 0, delivered: 0, errors: 0, orderIds: [], stuck: [] };

  try {
    const pending = getProcuringOrders();
    results.scanned = pending.length;

    if (pending.length === 0) {
      return results;
    }

    console.log(`[FulfillmentWorker] Scanning ${pending.length} PROCURING order(s)...`);

    for (const order of pending) {
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

        if (!supplierStatus.fulfilled && ageMs >= STOCK_FALLBACK_MS) {
          const stockToken = claimLocalStockToken(
            order.productId,
            order.productName,
            order.orderId,
            order.email
          );
          if (stockToken) {
            await updateOrderDeliveryInDb(order.orderId, stockToken);
            const emailResult = await sendOrderEmail(
              order.orderId,
              order.email,
              order.amountRub,
              order.cryptoAmount,
              order.currency,
              order.productName,
              order.quantity || 1,
              [stockToken]
            );
            if (emailResult.success) {
              results.delivered += 1;
              results.orderIds.push(order.orderId);
              console.log(`[FulfillmentWorker] STOCK FALLBACK delivered ${order.orderId} (shefu still: ${supplierStatus.status})`);
              continue;
            }
          }
        }

        if (!supplierStatus.fulfilled && ageMs >= STUCK_ALERT_MS) {
          await sendStuckOrderAlert(order, supplierStatus);
          results.stuck.push({
            orderId: order.orderId,
            ageMin: Math.round(ageMs / 60000),
            supplierStatus: supplierStatus.status,
            message: supplierStatus.message
          });
        }

        const res = await checkAndFulfillSupplierOrder(
          order.supplierOrderId,
          order.orderId,
          order.email,
          order.amountRub,
          order.cryptoAmount,
          order.currency,
          order.productName,
          order.quantity || 1
        );

        if (res?.delivered) {
          results.delivered += 1;
          results.orderIds.push(order.orderId);
          alertedOrders.delete(order.orderId);
          console.log(`[FulfillmentWorker] Delivered ${order.orderId}`);
        }
      } catch (err) {
        results.errors += 1;
        console.error(`[FulfillmentWorker] Error on ${order.orderId}:`, err.message);
      }
    }
  } finally {
    isRunning = false;
  }

  return results;
}

export function startFulfillmentCron(intervalMs = 15_000) {
  const tick = () => {
    runFulfillmentScan().catch((err) => {
      console.error('[FulfillmentWorker] Cron error:', err.message);
    });
  };

  tick();
  const timer = setInterval(tick, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  console.log(`[FulfillmentWorker] Background scan every ${intervalMs / 1000}s`);
  return timer;
}
