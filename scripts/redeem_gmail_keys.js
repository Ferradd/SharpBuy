import { redeemShefuKey } from '../api/_utils/shefu-dropship.js';

const keysToRedeem = [
  { name: 'Knife/Glove Account', key: 'KNIFEGLOVEZ95HG6QI4FLDV8ST4NNL' },
  { name: '$50-$350 Inventory Account', key: 'SKINSNEPOYLXQS398A2XCX2CA' },
  { name: 'CS2 Prime Account 1', key: 'PRIMEYQ9Z6PGJ9AIJ2FFVMGOV' },
  { name: 'CS2 Prime Account 2', key: 'PRIMEY3VB2O48S69H8MMOUYJTL' }
];

async function redeemAll() {
  console.log('Redeeming fresh keys from Gmail screenshot...\n');
  const results = [];

  for (const item of keysToRedeem) {
    console.log(`--- Redeeming ${item.name} (${item.key}) ---`);
    try {
      const res = await redeemShefuKey(item.key);
      console.log('Result:', res);
      if (res && res.account) {
        results.push({ ...item, token: res.account });
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }

  console.log('\n=== ALL REDEEMED TOKENS ===');
  console.log(JSON.stringify(results, null, 2));
}

redeemAll();
