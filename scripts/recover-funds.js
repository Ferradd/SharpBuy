import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function transfer(address to, uint256 amount) returns (bool)'];

const provider = new ethers.JsonRpcProvider(BSC_RPC);

// The fallback mnemonic where the money went
const fallbackMnemonic = 'example fun hollow ceiling alter recipe plate decide expire hood own chimney';

// The main merchant wallet (which has BNB for gas)
const merchantMnemonic = process.env.MERCHANT_MNEMONIC;
if (!merchantMnemonic) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}
const merchantWallet = ethers.Wallet.fromPhrase(merchantMnemonic, provider);

async function recover() {
  console.log('--- RECOVERING FUNDS ---');
  console.log('Merchant Wallet:', merchantWallet.address);
  console.log('Sending recovered funds to Merchant Wallet...');

  let totalRecovered = 0;

  // Scan first 100 child wallets
  for (let i = 0; i < 100; i++) {
    const childWallet = ethers.HDNodeWallet.fromPhrase(fallbackMnemonic, "", "m/44'/60'/0'/0/" + i);
    const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, childWallet.connect(provider));
    
    try {
      const bal = await usdtContract.balanceOf(childWallet.address);
      if (bal > 0n) {
        console.log(`\nFound ${Number(bal) / 1e18} USDT in child wallet ${i} (${childWallet.address})`);
        
        // 1. Send gas (0.0003 BNB) from merchant wallet to child wallet
        console.log('Sending gas...');
        const gasTx = await merchantWallet.sendTransaction({
          to: childWallet.address,
          value: ethers.parseEther('0.0003')
        });
        await gasTx.wait();
        console.log('Gas sent!');

        // 2. Transfer USDT from child wallet to merchant wallet
        console.log('Sweeping USDT...');
        const sweepTx = await usdtContract.transfer(merchantWallet.address, bal);
        await sweepTx.wait();
        console.log('USDT swept! TxHash:', sweepTx.hash);
        
        totalRecovered += (Number(bal) / 1e18);
      }
    } catch (e) {
      console.error(`Error on wallet ${i}:`, e.message);
    }
  }

  console.log(`\n--- RECOVERY COMPLETE ---`);
  console.log(`Total recovered: ${totalRecovered} USDT`);
}

recover();
