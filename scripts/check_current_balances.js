import { ethers } from 'ethers';

async function checkWalletState() {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
  const addr = '0x7d46F8e21780Db5eA129d9Fc9cF73D56Ae1172c9';
  const usdtContract = new ethers.Contract('0x55d398326f99059fF775485246999027B3197955', ['function balanceOf(address) view returns (uint256)'], provider);

  const bnb = await provider.getBalance(addr);
  const usdt = await usdtContract.balanceOf(addr);

  console.log('Merchant Wallet Status:');
  console.log('Address:', addr);
  console.log('BNB:', ethers.formatEther(bnb));
  console.log('USDT:', ethers.formatUnits(usdt, 18));
}

checkWalletState();
