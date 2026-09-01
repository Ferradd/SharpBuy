import { ethers } from 'ethers';

const m1 = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';
const m2 = process.env.MERCHANT_MNEMONIC;
if (!m2) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}

for (let i = 0; i < 100; i++) {
  const w1 = ethers.HDNodeWallet.fromPhrase(m1, "", "m/44'/60'/0'/0/" + i);
  if (w1.address.toLowerCase() === '0xd2b988df18b3c2925dc6b88f798d7863f93b5a65'.toLowerCase()) console.log('Matches m1, index', i);
  
  const w2 = ethers.HDNodeWallet.fromPhrase(m2, "", "m/44'/60'/0'/0/" + i);
  if (w2.address.toLowerCase() === '0xd2b988df18b3c2925dc6b88f798d7863f93b5a65'.toLowerCase()) console.log('Matches m2, index', i);
}
console.log('done');
