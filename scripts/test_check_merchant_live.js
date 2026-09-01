import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const MERCHANT = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';

async function checkMerchantTxs() {
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const erc20 = new ethers.Contract(USDT_BSC_CONTRACT, [
    'function balanceOf(address) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ], provider);

  const bal = await erc20.balanceOf(MERCHANT);
  console.log('Merchant USDT Balance:', ethers.formatUnits(bal, 18), 'USDT');
  const bnbBal = await provider.getBalance(MERCHANT);
  console.log('Merchant BNB Balance:', ethers.formatUnits(bnbBal, 18), 'BNB');

  // Query recent Transfer events to merchant
  const currentBlock = await provider.getBlockNumber();
  console.log('Current BSC block:', currentBlock);
  const filter = erc20.filters.Transfer(null, MERCHANT);
  const events = await erc20.queryFilter(filter, currentBlock - 3000, currentBlock);
  console.log(`Found ${events.length} incoming USDT transfers in last 3000 blocks:`);
  for (const ev of events) {
    console.log(`- From: ${ev.args[0]} | Amount: ${ethers.formatUnits(ev.args[2], 18)} USDT | Tx: ${ev.transactionHash}`);
  }
}

checkMerchantTxs();
