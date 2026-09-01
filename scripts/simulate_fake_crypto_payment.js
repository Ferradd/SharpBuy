/**
 * End-to-end simulation: fake crypto payment through check-payment.js
 * Uses WALLET_BALANCE (same path as owner wallet checkout on the site).
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import checkPaymentHandler from '../api/check-payment.js';
import { getOrderById } from '../api/_utils/orders-db.js';

function callCheckPayment(body) {
  return new Promise((resolve, reject) => {
    const req = { method: 'POST', body };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode, body: payload });
        return this;
      },
      end(msg) {
        resolve({ status: this.statusCode, body: msg });
        return this;
      }
    };
    checkPaymentHandler(req, res).catch(reject);
  });
}

const orderId = 'FAKE-PAY-' + Date.now().toString(36).toUpperCase();
const clientEmail = 'iliykuzin3@gmail.com';
const payload = {
  orderId,
  address: '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1',
  expectedAmount: '0.97',
  symbol: 'USDT',
  currency: 'WALLET_BALANCE',
  email: clientEmail,
  productId: '1776000000001',
  productName: 'CS2 Premier Ready (FAKE PAYMENT E2E TEST)',
  quantity: 1,
  priceRub: 89
};

console.log('=== SHARPBUY FAKE PAYMENT E2E ===');
console.log('Order:', orderId);
console.log('Client email:', clientEmail);
console.log('Step 1: POST /api/check-payment (WALLET_BALANCE)...\n');

const first = await callCheckPayment(payload);
console.log('Response 1:', JSON.stringify(first.body, null, 2));

let supplierOrderId = first.body?.supplierOrderId || null;
let final = first.body;

for (let i = 1; i <= 20; i++) {
  const token = final?.delivery?.tokens?.[0];
  if (token && token !== 'PROCURING' && !String(token).startsWith('ERR_')) {
    console.log(`\nDelivered on attempt ${i}`);
    break;
  }
  if (String(token).startsWith('ERR_')) {
    console.error('\nSupplier error:', token);
    process.exit(1);
  }

  console.log(`\nStep ${i + 1}: polling supplier (PROCURING)...`);
  await new Promise((r) => setTimeout(r, 4000));

  const poll = await callCheckPayment({ ...payload, supplierOrderId });
  final = poll.body;
  if (poll.body?.supplierOrderId) supplierOrderId = poll.body.supplierOrderId;
  console.log('Status:', poll.body?.status || poll.body?.delivery?.status, '| token:', poll.body?.delivery?.tokens?.[0]?.slice?.(0, 40) + '...');
}

const dbOrder = getOrderById(orderId);
console.log('\n=== DB RECORD ===');
console.log(JSON.stringify(dbOrder, null, 2));

console.log('\n=== FINAL RESULT ===');
const delivered = final?.delivery?.tokens?.[0];
if (delivered && delivered !== 'PROCURING') {
  console.log('SUCCESS: token delivered + email triggered via shefu-dropship');
  console.log('Token prefix:', delivered.slice(0, 60) + '...');
  process.exit(0);
}

console.log('TIMEOUT or still PROCURING — check supplier / logs');
process.exit(1);
