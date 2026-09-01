import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function transfer(address to, uint256 amount) returns (bool)'];
const provider = new ethers.JsonRpcProvider(BSC_RPC);

const fallbackMnemonic = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';
const merchantMnemonic = process.env.MERCHANT_MNEMONIC;
if (!merchantMnemonic) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}
const merchantWallet = ethers.Wallet.fromPhrase(merchantMnemonic, provider);

// Data from orders_database.json & MEXC
const targets = [
  { addr: '0x7309c574968a5F8c1108458880117f6Ff261E17e', timeStr: '2026-08-24T20:26:32.304Z' },
  { addr: '0x8bB1928425F483525155C9339D10A5E595039112', timeStr: '2026-08-24T20:06:00.467Z' },
  // For d2b9, we only have MEXC withdrawal time (21:38:00 local time = ~ 19:38:00 UTC or 18:38:00 UTC depending on timezone)
  // But wait, the others are 20:26 UTC when local is 22:26 (UTC+2).
  // 21:38 local -> ~19:38:00 UTC. Let's just search a wider window for d2b9.
  { addr: '0xd2b988Df18B3C2925dC6B88f798D7863F93B5A65', timeStr: '2026-08-24T19:35:00.000Z', searchWindow: 300000 } // +/- 5 minutes
];

async function recover() {
  for (const t of targets) {
    const timeMs = new Date(t.timeStr).getTime();
    const baseIndex = Math.floor(timeMs % 2147483647);
    const window = t.searchWindow || 2000;
    
    let foundWallet = null;
    console.log(`Searching for ${t.addr} around index ${baseIndex}...`);
    for (let i = baseIndex - window; i <= baseIndex + window; i++) {
      const childWallet = ethers.HDNodeWallet.fromPhrase(fallbackMnemonic, "", "m/44'/60'/0'/0/" + i);
      if (childWallet.address.toLowerCase() === t.addr.toLowerCase()) {
        foundWallet = childWallet;
        console.log(`FOUND! Index: ${i}`);
        break;
      }
    }

    if (foundWallet) {
       const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, foundWallet.connect(provider));
       const bal = await usdtContract.balanceOf(foundWallet.address);
       console.log(`Balance: ${Number(bal) / 1e18} USDT`);
       
       if (bal > 0n) {
          console.log('Sending gas...');
          const gasTx = await merchantWallet.sendTransaction({
            to: foundWallet.address,
            value: ethers.parseEther('0.0003')
          });
          await gasTx.wait();
          console.log('Gas sent! Sweeping USDT...');
          const sweepTx = await usdtContract.transfer(merchantWallet.address, bal);
          await sweepTx.wait();
          console.log(`Swept to ${merchantWallet.address}! Tx: ${sweepTx.hash}`);
       }
    } else {
       console.log(`Could not find ${t.addr}`);
    }
  }
}
recover();
