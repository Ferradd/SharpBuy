import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function transfer(address to, uint256 amount) returns (bool)'];
const provider = new ethers.JsonRpcProvider(BSC_RPC);

const fallbackMnemonic = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';
const merchantMnemonic = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';
const merchantWallet = ethers.Wallet.fromPhrase(merchantMnemonic, provider);

const targets = [
  { addr: '0x7309c574968a5F8c1108458880117f6Ff261E17e', timeMs: 1787602773787 }, // MT7OJBX7
  { addr: '0x8bB1928425F483525155C9339D10A5E595039112', timeMs: 1787601640020 }, // MT7NV13O
  { addr: '0xd2b988Df18B3C2925dC6B88f798D7863F93B5A65', timeMs: 1787600093602 }, // MT7MXVVM
];

async function recover() {
  for (const t of targets) {
    const baseIndex = Math.floor(t.timeMs % 2147483647);
    const window = 500;
    
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
