import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const mnemonic = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';

async function check() {
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
  const txCount = await provider.getTransactionCount(wallet.address);
  console.log("Merchant wallet nonce (tx count):", txCount);
}

check();
