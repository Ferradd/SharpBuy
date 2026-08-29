import { redeemShefuKey } from '../api/_utils/shefu-dropship.js';

async function redeemLastKey() {
  console.log('Waiting 65s for rate limit to clear...');
  await new Promise(r => setTimeout(r, 65000));
  
  const keys = ['PRIMEY3VB2O48S69H8MMOUYJTL', 'PRIMEY3VB2O48S69H8MM0UYJTL', 'PRIMEY3VB2O48S69H8MMOUYJTL'.replace('O', '0')];
  for (const k of keys) {
    try {
      console.log(`Trying ${k}...`);
      const res = await redeemShefuKey(k);
      console.log('Result:', res);
      if (res && res.account) {
        console.log('✅ LAST TOKEN OBTAINED:', res.account);
        break;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

redeemLastKey();
