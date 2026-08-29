import { executeAutoDropshipPurchase } from '../api/shefu-dropship.js';

(async () => {
  console.log("Testing dropship...");
  try {
    const res = await executeAutoDropshipPurchase('premier', 'iliykuzin2@gmail.com');
    console.log("Result:", res);
  } catch(e) {
    console.error("Test error:", e);
  }
})();
