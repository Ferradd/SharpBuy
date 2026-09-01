import { ethers } from 'ethers';

async function checkRecentTransactions() {
  const BSC_RPC = 'https://bsc-dataseed1.binance.org';
  const MERCHANT_ADDR = '0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1';
  const provider = new ethers.JsonRpcProvider(BSC_RPC);

  const bnbBal = await provider.getBalance(MERCHANT_ADDR);
  console.log('BNB Balance:', ethers.formatEther(bnbBal));

  const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
  const usdtAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, usdtAbi, provider);
  const usdtBal = await usdtContract.balanceOf(MERCHANT_ADDR);
  console.log('USDT Balance:', ethers.formatUnits(usdtBal, 18));
}

checkRecentTransactions();
