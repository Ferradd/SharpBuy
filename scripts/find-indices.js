import { ethers } from 'ethers';

const fallbackMnemonic = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';
const targetAddresses = [
  '0xd2b988Df18B3C2925dC6B88f798D7863F93B5A65'.toLowerCase(),
  '0x8bB1928425F483525155C9339D10A5E595039112'.toLowerCase(),
  '0x7309c574968a5F8c1108458880117f6Ff261E17e'.toLowerCase()
];

// Times from MEXC
const times = [
  new Date('2026-08-24T22:21:00+02:00').getTime(),
  new Date('2026-08-24T22:04:00+02:00').getTime(),
  new Date('2026-08-24T21:39:00+02:00').getTime(),
  // Also try UTC times just in case MEXC shows UTC!
  new Date('2026-08-24T22:21:00Z').getTime(),
  new Date('2026-08-24T22:04:00Z').getTime(),
  new Date('2026-08-24T21:39:00Z').getTime(),
];

async function run() {
  console.log("Searching...");
  for (const t of times) {
    const base = Math.floor(t % 2147483647);
    for (let i = base - 3000000; i < base + 3000000; i++) {
      const w = ethers.HDNodeWallet.fromPhrase(fallbackMnemonic, "", "m/44'/60'/0'/0/" + i);
      if (targetAddresses.includes(w.address.toLowerCase())) {
        console.log(`FOUND! Address ${w.address} has index ${i}`);
      }
    }
  }
  console.log("Done");
}
run();
