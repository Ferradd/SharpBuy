import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const mnemonic = process.env.MERCHANT_MNEMONIC;
if (!mnemonic) {
  console.error('Set MERCHANT_MNEMONIC in environment');
  process.exit(1);
}

async function check() {
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
  const txCount = await provider.getTransactionCount(wallet.address);
  console.log("Merchant wallet nonce (tx count):", txCount);
}

check();
