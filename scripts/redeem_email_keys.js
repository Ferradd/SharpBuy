import { redeemShefuKey } from '../api/_utils/shefu-dropship.js';

const keys = [
  { key: 'KNIFEGLOVEZ9SHG6QI4FLDV8ST4NNL', type: 'Knife / Glove Account (SHF-DF8AE966)', time: '19:44' },
  { key: 'SKINSNEPOYLXQS298A2XCX2CA', type: 'Skins $50-$350 Inventory (SHF-68034297)', time: '15:24' },
  { key: 'PRIMEYQ9Z6PGJ9ALJ2FFVMG0V', type: 'CS2 Prime (SHF-B7CBAB9D)', time: '04:50' },
  { key: 'PRIME3V82048S69H8MMOUYJTL', type: 'CS2 Prime (SHF-911BB54A)', time: '02:34' },
  { key: 'PRIMEQYZTBMWS1KN5VPO3C510', type: 'CS2 Prime (SHF-B6711B8E)', time: '02:31' },
  { key: 'PRIMEZUJSHZLNLUJ2ZY6MV1SE', type: 'CS2 Prime (SHF-8CFC400F)', time: '02:23' },
  { key: 'PRIMEHVNLDKTQX3YQ6OTIW4RV', type: 'CS2 Prime (SHF-0D68B564)', time: '02:09' },
  { key: 'PRIME09D06WY9B2NGP4EZ5VW', type: 'CS2 Prime (SHF-4FC4E403)', time: '01:48' },
];

async function main() {
  console.log('--- Redeeming Email Keys from Shefu ---');
  const results = [];

  for (const item of keys) {
    console.log(`\nRedeeming ${item.key} [${item.type}]...`);
    try {
      const res = await redeemShefuKey(item.key);
      console.log('Result:', res);
      results.push({
        ...item,
        result: res
      });
    } catch (e) {
      console.error('Error redeeming:', e.message);
      results.push({
        ...item,
        error: e.message
      });
    }
  }

  console.log('\n================ ALL REDEEMED TOKENS ================');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
