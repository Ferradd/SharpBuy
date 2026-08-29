import { getUserDepositWallet } from '../api/get-user-wallet.js';

async function testDerivations() {
  const users = [
    'iliykuzin2@gmail.com',
    'customer_alex@gmail.com',
    'gamer2026@mail.ru',
    'dimon_cs2@yandex.ru'
  ];

  console.log('--- TESTING MULTI-USER HD WALLET DERIVATIONS ---');
  for (let u of users) {
    const w = getUserDepositWallet(u);
    console.log(`User: ${u.padEnd(25)} -> Deposit Address: ${w.address} (Index: ${w.index}, isOwner: ${w.isOwner})`);
  }
}

testDerivations();
