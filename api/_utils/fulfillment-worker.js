/**
 * Background fulfillment for PROCURING orders.
 * Runs when the client closes the tab before the supplier delivers the key.
 */
import { getProcuringOrders } from './orders-db.js';
import { checkAndFulfillSupplierOrder } from './shefu-dropship.js';

let isRunning = false;

export async function runFulfillmentScan() {
  if (isRunning) {
    console.log('[FulfillmentWorker] Skip — previous scan still running');
    return { skipped: true };
  }

  isRunning = true;
  const results = { scanned: 0, delivered: 0, errors: 0, orderIds: [] };

  try {
    const pending = getProcuringOrders();
    results.scanned = pending.length;

    if (pending.length === 0) {
      return results;
    }

    console.log(`[FulfillmentWorker] Scanning ${pending.length} PROCURING order(s)...`);

    for (const order of pending) {
      try {
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
          console.log(`[FulfillmentWorker] Delivered ${order.orderId} → ${order.email}`);
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

export function startFulfillmentCron(intervalMs = 45_000) {
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
