import { redeemShefuKey } from '../api/_utils/shefu-dropship.js';

const variations = [
  'SKINSNEPOYLXQS398AZXCX2CA',
  'SKINSNEPOYLXQS398A2XCX2CA',
  'SKINSNEPOYLXQS398A2XCXZCA',
  'SKINSNEPOYLXQS39BA2XCX2CA',
  'PRIMEYQ9Z6PGJ9AIJ2FFVMGOV',
  'PRIMEYQ9Z6PGJ9AIJ2FFVMG0V',
  'PRIMEYQ9Z6PGJ9AIJZFFVMGOV',
  'PRIMEY3VB2O48S69H8MMOUYJTL',
  'PRIMEY3VB2O48S69H8MM0UYJTL'
];

async function testVariations() {
  for (const v of variations) {
    try {
      const res = await redeemShefuKey(v);
      if (res && res.account) {
        console.log(`✅ MATCH FOUND for ${v}:`, res.account);
      }
    } catch (e) {}
  }
}

testVariations();
