import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];

async function check() {
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, provider);
  const bal = await usdtContract.balanceOf('0xd2b988Df18B3C2925dC6B88f798D7863F93B5A65');
  console.log("Balance on BSC:", Number(bal) / 1e18, "USDT");
}

check();
