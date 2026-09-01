/**
 * Recover all PROCURING orders — redeem key + email client.
 * Usage: node scripts/recover_stuck_orders.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runFulfillmentScan } from '../api/_utils/fulfillment-worker.js';

const result = await runFulfillmentScan();
console.log(JSON.stringify(result, null, 2));
