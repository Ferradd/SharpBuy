import { ethers } from 'ethers';

const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const mnemonic = 'load forum stomach worry abandon harsh error glory kiss kind trial relax';

async function check() {
  const provider = new ethers.JsonRpcProvider(BSC_RPC);
  const wallet = ethers.Wallet.fromPhrase(mnemonic, provider);
  const usdtContract = new ethers.Contract(USDT_BSC_CONTRACT, ERC20_ABI, provider);
  const bal = await usdtContract.balanceOf(wallet.address);
  const bnb = await provider.getBalance(wallet.address);
  console.log("Merchant wallet:", wallet.address);
  console.log("USDT Balance:", Number(bal) / 1e18);
  console.log("BNB Balance:", Number(bnb) / 1e18);
}

check();
