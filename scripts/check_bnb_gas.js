import { ethers } from 'ethers';

async function checkBalances() {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
  const addr = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';
  
  const bnbBalance = await provider.getBalance(addr);
  console.log('BNB Balance:', ethers.formatEther(bnbBalance));

  const usdtAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdtContract = new ethers.Contract('0x55d398326f99059fF775485246999027B3197955', usdtAbi, provider);
  const usdtBalance = await usdtContract.balanceOf(addr);
  console.log('USDT Balance:', ethers.formatUnits(usdtBalance, 18));
}

checkBalances();
