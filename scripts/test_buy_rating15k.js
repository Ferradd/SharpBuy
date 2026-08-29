import { initiateDropshipPurchase, checkAndFulfillSupplierOrder } from '../api/_utils/shefu-dropship.js';
import { sendOrderEmail } from '../api/_utils/email-sender.js';

async function buyAndDeliver15k() {
  console.log('Initiating dropship purchase of rating15k from shefu223.shop...');
  const res = await initiateDropshipPurchase('rating15k', 'iliykuzin2@gmail.com');
  console.log('Dropship purchase result:', res);

  if (res && res.supplierOrderId) {
    console.log('Waiting for supplier order fulfillment...');
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000));
      const fulfillRes = await checkAndFulfillSupplierOrder(
        res.supplierOrderId,
        'ORD-MANUAL-' + Date.now(),
        'iliykuzin2@gmail.com',
        179,
        '1.98',
        'USDT (BEP-20)',
        'CS2 PREMIER 15,000+ RATING (HVH / HIGH RANK)',
        1
      );
      console.log(`Poll #${i+1}:`, fulfillRes);
      if (fulfillRes && fulfillRes.delivered) {
        console.log('SUCCESS! Delivered token:', fulfillRes.token);
        break;
      }
    }
  }
}

buyAndDeliver15k();
